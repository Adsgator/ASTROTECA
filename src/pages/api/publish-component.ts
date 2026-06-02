import type { APIRoute } from 'astro'
import type { ComponentCategory } from '../../types'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { resolve } from 'node:path'
import {
  detectProps, inferCategory, toPascal,
  writeComponentLocal, publishComponentToGitHub, syncLibGit,
} from '../../lib/component-writer'

const ROOT = resolve(process.cwd())

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json() as {
      phase: 'analyze' | 'publish'
      astroCode: string
      name?: string
      category?: string
      description?: string
      tags?: string[]
      bestFor?: string[]
    }

    const { phase, astroCode } = body
    if (!astroCode?.trim()) return json({ error: 'Código .astro é obrigatório' }, 400)

    // ── Fase 1: só analisar ───────────────────────────────────────────────────
    if (phase === 'analyze') {
      const props = detectProps(astroCode)
      // Tenta extrair nome do comentário de topo // Categoria/Nome.astro
      const nameMatch = astroCode.match(/\/\/\s*(?:\w+\/)?(\w+)\.astro/)
      const baseName = nameMatch ? nameMatch[1] : 'MeuComponente'
      return json({ name: baseName, props })
    }

    // ── Fase 2: publicar ─────────────────────────────────────────────────────
    const { name, category, description, tags = [], bestFor = [] } = body
    if (!description?.trim()) return json({ error: 'Descrição é obrigatória' }, 400)

    const baseName = toPascal((name || 'MeuComponente').replace(/\d{4}$/, ''))
    const resolvedCategory = (
      category && ['Hero','Header','Navigation','Features','Services','Pricing',
        'Testimonials','Process','CTA','FAQ','Stats','Gallery','Contact','Footer',
        'About','Team','Trust','UI','Misc','Other'].includes(category)
        ? category
        : inferCategory(baseName)
    ) as ComponentCategory

    // Grava local (sanitiza, cria arquivos, atualiza registry e preview page)
    const result = writeComponentLocal({
      astroCode,
      baseName,
      category: resolvedCategory,
      description,
      tags,
      bestFor,
      sanitize: true,
    })

    // Publica no GitHub
    const token = import.meta.env.GITHUB_TOKEN
    const owner = import.meta.env.GITHUB_OWNER
    const repo  = import.meta.env.COMPONENTS_REPO

    if (!token || !owner || !repo) {
      return json({ error: 'GitHub não configurado (.env: GITHUB_TOKEN, GITHUB_OWNER, COMPONENTS_REPO)' }, 500)
    }

    const REGISTRY = join(ROOT, 'minha-lib-astro', 'registry.json')
    const INDEX_FILE = join(ROOT, 'minha-lib-astro', 'src', 'components', resolvedCategory, 'index.ts')

    const registryContent = readFileSync(REGISTRY, 'utf8')
    const indexContent    = readFileSync(INDEX_FILE, 'utf8')
    const compFile        = join(ROOT, 'minha-lib-astro', 'src', 'components', result.componentFile)
    const prevFile        = join(ROOT, 'minha-lib-astro', 'src', 'components', resolvedCategory, `${result.name}.preview.astro`)

    await publishComponentToGitHub(
      token, owner, repo, result,
      readFileSync(compFile, 'utf8'),
      readFileSync(prevFile, 'utf8'),
      indexContent,
      registryContent,
    )

    const gitWarnings = syncLibGit(result.name)

    return json({
      success: true,
      name: result.name,
      id: result.id,
      category: result.category,
      previewPath: result.previewPath,
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
