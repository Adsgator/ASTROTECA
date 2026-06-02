import type { APIRoute } from 'astro'
import type { ComponentMeta } from '../../types'
import { existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { resolve, join, relative, dirname } from 'node:path'
import { toBase64 } from '../../lib/utils'

const ROOT        = resolve(process.cwd())
const REGISTRY    = join(ROOT, 'minha-lib-astro', 'registry.json')
const LIB_COMPS   = join(ROOT, 'minha-lib-astro', 'src', 'components')
const PREVIEW_DIR = join(ROOT, 'src', 'pages', 'preview')

export const GET: APIRoute = async () => {
  if (!existsSync(REGISTRY)) return json({ error: 'registry.json não encontrado' }, 404)
  try {
    const registry = JSON.parse(readFileSync(REGISTRY, 'utf8'))
    return json(registry)
  } catch {
    return json({ error: 'Erro ao ler registry.json' }, 500)
  }
}

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { id } = await request.json() as { id: string }
    if (!id) return json({ error: 'ID obrigatório' }, 400)

    const registry: ComponentMeta[] = JSON.parse(readFileSync(REGISTRY, 'utf8'))
    const component = registry.find(r => r.id === id)
    if (!component) return json({ error: `Componente "${id}" não encontrado` }, 404)

    const removed: string[] = []
    const componentFile = component.componentFile

    // Proteção contra path traversal
    if (componentFile && (componentFile.includes('..') || !componentFile.endsWith('.astro'))) {
      return json({ error: 'Caminho de componente inválido' }, 400)
    }

    // Detecta filhos usados pelo componente para limpar junto
    const childImportNames: string[] = []
    if (componentFile) {
      const compPath = join(LIB_COMPS, componentFile)
      if (existsSync(compPath)) {
        const code = readFileSync(compPath, 'utf8')
        const re = /^import\s+(\w+)\s+from\s+['"](\.{1,2}\/[^'"]+\.astro)['"]/gm
        let m: RegExpExecArray | null
        const compDir = dirname(compPath)
        while ((m = re.exec(code)) !== null) {
          const absChild = resolve(compDir, m[2])
          if (existsSync(absChild)) childImportNames.push(absChild)
        }
      }
    }

    // 1. Arquivo .astro principal + .preview.astro
    if (componentFile) {
      const compFile = join(LIB_COMPS, componentFile)
      if (existsSync(compFile)) { rmSync(compFile); removed.push(componentFile) }

      const previewSrc = join(LIB_COMPS, componentFile.replace('.astro', '.preview.astro'))
      if (existsSync(previewSrc)) { rmSync(previewSrc); removed.push(relative(ROOT, previewSrc).replace(/\\/g, '/')) }
    }

    // 2. Arquivos filhos detectados
    for (const childPath of childImportNames) {
      if (existsSync(childPath)) {
        rmSync(childPath)
        removed.push(relative(ROOT, childPath).replace(/\\/g, '/'))
      }
      const childPreview = childPath.replace('.astro', '.preview.astro')
      if (existsSync(childPreview)) {
        rmSync(childPreview)
        removed.push(relative(ROOT, childPreview).replace(/\\/g, '/'))
      }
    }

    // 3. Página de preview do Astroteca
    const previewPage = join(PREVIEW_DIR, `${component.id}.astro`)
    if (existsSync(previewPage)) { rmSync(previewPage); removed.push(`src/pages/preview/${component.id}.astro`) }

    // 4. Atualiza registry local
    const newRegistry = registry.filter(r => r.id !== id)
    writeFileSync(REGISTRY, JSON.stringify(newRegistry, null, 2) + '\n')

    // 5. Limpa export do index.ts da categoria
    if (componentFile) {
      const [category, fileName] = componentFile.split('/')
      const compName = fileName.replace('.astro', '')
      const indexFile = join(LIB_COMPS, category, 'index.ts')
      if (existsSync(indexFile)) {
        const idx = readFileSync(indexFile, 'utf8')
        const filtered = idx
          .split('\n')
          .filter(line => !line.includes(`'./${compName}.astro'`))
          .join('\n')
          .replace(/\n{3,}/g, '\n\n')
          .trimEnd() + '\n'
        writeFileSync(indexFile, filtered)
        removed.push(`minha-lib-astro/src/components/${category}/index.ts (export removido)`)
      }
    }

    // 6. GitHub API — remove do repo da lib
    const token = import.meta.env.GITHUB_TOKEN
    const owner = import.meta.env.GITHUB_OWNER
    const repo  = import.meta.env.COMPONENTS_REPO

    if (token && owner && repo) {
      const ghHeaders = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      }

      async function ghDelete(path: string) {
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
        const existing = await fetch(url, { headers: ghHeaders })
        if (!existing.ok) return
        const { sha } = await existing.json()
        await fetch(url, {
          method: 'DELETE',
          headers: ghHeaders,
          body: JSON.stringify({ message: `chore: remove ${id}`, sha }),
        })
      }

      async function ghUpsert(path: string, content: string, message: string) {
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
        let sha: string | undefined
        try {
          const existing = await fetch(url, { headers: ghHeaders })
          if (existing.ok) sha = (await existing.json()).sha
        } catch {}
        await fetch(url, {
          method: 'PUT',
          headers: ghHeaders,
          body: JSON.stringify({ message, content: toBase64(content), ...(sha ? { sha } : {}) }),
        })
      }

      if (componentFile) {
        await ghDelete(`src/components/${componentFile}`)
        await ghDelete(`src/components/${componentFile.replace('.astro', '.preview.astro')}`)

        // Atualiza index.ts da categoria no GitHub
        const [category] = componentFile.split('/')
        const indexFile = join(LIB_COMPS, category, 'index.ts')
        if (existsSync(indexFile)) {
          await ghUpsert(
            `src/components/${category}/index.ts`,
            readFileSync(indexFile, 'utf8'),
            `chore: remove ${id} from ${category}/index.ts`,
          )
        }
      }

      // Atualiza registry no GitHub
      await ghUpsert('registry.json', JSON.stringify(newRegistry, null, 2) + '\n', `chore: remove ${id} from registry`)
    }

    return json({ success: true, name: component.name, removed })
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
