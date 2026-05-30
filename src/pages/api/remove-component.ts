import type { APIRoute } from 'astro'
import type { ComponentMeta } from '../../types'
import { existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { toBase64 } from '../../lib/utils'

const ROOT       = resolve(process.cwd())
const REGISTRY   = join(ROOT, 'minha-lib-astro', 'registry.json')
const LIB_COMPS  = join(ROOT, 'minha-lib-astro', 'src', 'components')
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

    // 1. Arquivo .astro
    if (componentFile) {
      const compFile = join(LIB_COMPS, componentFile)
      if (existsSync(compFile)) { rmSync(compFile); removed.push(componentFile) }

      // 2. .preview.astro
      const previewSrc = join(LIB_COMPS, componentFile.replace('.astro', '.preview.astro'))
      if (existsSync(previewSrc)) { rmSync(previewSrc); removed.push(previewSrc.replace(ROOT + '\\', '').replace(ROOT + '/', '')) }
    }

    // 3. Preview page
    const previewPage = join(PREVIEW_DIR, `${component.id}.astro`)
    if (existsSync(previewPage)) { rmSync(previewPage); removed.push(`src/pages/preview/${component.id}.astro`) }

    // 4. Registry local
    const newRegistry = registry.filter(r => r.id !== id)
    writeFileSync(REGISTRY, JSON.stringify(newRegistry, null, 2) + '\n')

    // 5. GitHub API — remove do repo da lib
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
      }
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
