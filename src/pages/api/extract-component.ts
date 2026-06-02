import type { APIRoute } from 'astro'
import type { ComponentCategory } from '../../types'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, join, basename, dirname, sep } from 'node:path'
import {
  toPascal, inferCategory, detectProps,
  writeComponentLocal, publishComponentToGitHub, syncLibGit,
} from '../../lib/component-writer'

const ROOT = resolve(process.cwd())

function detectChildren(code: string, sourceDir: string) {
  const re = /^import\s+(\w+)\s+from\s+['"](\.{1,2}\/[^'"]+\.astro)['"]/gm
  const found: { importName: string; relativePath: string; absolutePath: string }[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(code)) !== null) {
    const abs = resolve(sourceDir, m[2])
    if (existsSync(abs)) found.push({ importName: m[1], relativePath: m[2], absolutePath: abs })
  }
  return found
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json() as {
      phase: 'analyze' | 'extract'
      /** Caminho absoluto do arquivo no disco (fluxo original) */
      filePath?: string
      /** Código .astro enviado diretamente (fluxo upload/colar) */
      astroCode?: string
      /** Nome do arquivo quando enviado via upload */
      fileName?: string
      category?: string
      description?: string
      tags?: string[]
      bestFor?: string[]
      chosenChildren?: string[]
    }

    const { phase } = body

    // ── Resolve o código fonte ───────────────────────────────────────────────
    let rawCode: string
    let sourceDir: string
    let fileBaseName: string

    if (body.astroCode) {
      // Código enviado diretamente (upload / drag & drop / colar)
      rawCode = body.astroCode
      sourceDir = ROOT
      fileBaseName = body.fileName
        ? basename(body.fileName, '.astro')
        : (() => {
            const m = rawCode.match(/\/\/\s*(?:\w+\/)?(\w+)\.astro/)
            return m ? m[1] : 'Componente'
          })()
    } else if (body.filePath) {
      // Caminho no disco (fluxo original)
      const cleanPath = body.filePath.trim().replace(/^["']|["']$/g, '')
      const resolvedPath = resolve(cleanPath)

      // Proteção contra path traversal
      if (!resolvedPath.startsWith(ROOT + sep) && resolvedPath !== ROOT) {
        return json({ error: 'Acesso negado: caminho fora do projeto' }, 403)
      }
      if (!existsSync(resolvedPath)) {
        return json({ error: `Arquivo não encontrado: ${resolvedPath}` }, 400)
      }

      rawCode = readFileSync(resolvedPath, 'utf8')
      sourceDir = dirname(resolvedPath)
      fileBaseName = basename(resolvedPath, '.astro')
    } else {
      return json({ error: 'Informe filePath ou astroCode' }, 400)
    }

    const children = sourceDir !== ROOT
      ? detectChildren(rawCode, sourceDir)
      : []
    const props = detectProps(rawCode)

    // ── Fase 1: analisar ─────────────────────────────────────────────────────
    if (phase === 'analyze') {
      return json({
        fileName: `${fileBaseName}.astro`,
        props,
        children: children.map(c => ({
          importName: c.importName,
          fileName: basename(c.absolutePath),
          suggestedCategory: inferCategory(c.importName),
        })),
      })
    }

    // ── Fase 2: extrair ──────────────────────────────────────────────────────
    const { category, description, tags = [], bestFor = [], chosenChildren = [] } = body
    if (!description?.trim()) return json({ error: 'Descrição é obrigatória' }, 400)

    const baseName = toPascal(fileBaseName)
    const resolvedCategory = (category ?? inferCategory(baseName)) as ComponentCategory

    // Grava componente principal via writer (sanitiza, cria arquivos, registry, preview)
    const result = writeComponentLocal({
      astroCode: rawCode,
      baseName,
      category: resolvedCategory,
      description,
      tags,
      bestFor,
      sanitize: true,
    })

    // Componentes filhos escolhidos — grava cada um na sua categoria
    const childResults: { childName: string; childCategory: string }[] = []
    for (const child of children.filter(c => chosenChildren.includes(c.importName))) {
      const childBase = toPascal(basename(child.absolutePath, '.astro'))
      const childCat = inferCategory(child.importName) as ComponentCategory
      const childResult = writeComponentLocal({
        astroCode: readFileSync(child.absolutePath, 'utf8'),
        baseName: childBase,
        category: childCat,
        description: `Componente filho de ${result.name}`,
        tags: [],
        bestFor: [],
        sanitize: true,
      })
      childResults.push({ childName: childResult.name, childCategory: childResult.category })
    }

    // Publica no GitHub
    const token = import.meta.env.GITHUB_TOKEN
    const owner = import.meta.env.GITHUB_OWNER
    const repo  = import.meta.env.COMPONENTS_REPO

    if (!token || !owner || !repo) {
      return json({ error: 'GitHub não configurado (.env: GITHUB_TOKEN, GITHUB_OWNER, COMPONENTS_REPO)' }, 500)
    }

    const REGISTRY    = join(ROOT, 'minha-lib-astro', 'registry.json')
    const INDEX_FILE  = join(ROOT, 'minha-lib-astro', 'src', 'components', resolvedCategory, 'index.ts')
    const compFile    = join(ROOT, 'minha-lib-astro', 'src', 'components', result.componentFile)
    const prevFile    = join(ROOT, 'minha-lib-astro', 'src', 'components', resolvedCategory, `${result.name}.preview.astro`)

    await publishComponentToGitHub(
      token, owner, repo, result,
      readFileSync(compFile, 'utf8'),
      readFileSync(prevFile, 'utf8'),
      readFileSync(INDEX_FILE, 'utf8'),
      readFileSync(REGISTRY, 'utf8'),
    )

    const gitWarnings = syncLibGit(result.name)

    return json({
      success: true,
      name: result.name,
      id: result.id,
      category: result.category,
      previewPath: result.previewPath,
      children: childResults,
      ...(gitWarnings.length > 0 && { gitWarnings }),
    })

  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Erro desconhecido' }, 500)
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
