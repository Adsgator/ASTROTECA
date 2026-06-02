import type { APIRoute } from 'astro'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { AppSettings, ComponentMeta } from '../../types'
import { createProjectFromTemplate } from '../../lib/github'
import { recordComponentUsage } from '../../lib/analytics'

export const POST: APIRoute = async ({ request }) => {
  const { settings, clientName, manifest, components, includeBlueprint } = await request.json() as {
    settings: AppSettings
    clientName: string
    manifest: string
    components?: ComponentMeta[]
    includeBlueprint?: boolean
  }

  let blueprintContent: string | undefined
  if (includeBlueprint) {
    try {
      const blueprintPath = resolve(process.cwd(), 'COMPONENT-BLUEPRINT.md')
      blueprintContent = await readFile(blueprintPath, 'utf-8')
    } catch {
      // blueprint não encontrado — continua sem ele
    }
  }

  const result = await createProjectFromTemplate(settings, clientName, manifest, components, blueprintContent)

  if (!result.success) {
    return new Response(JSON.stringify({ error: result.error }), { status: 400 })
  }

  // Registra uso dos componentes copiados. Best-effort: analytics não deve quebrar
  // a criação do projeto, e a persistência via fs só funciona em ambiente local.
  if (result.usedComponentIds?.length) {
    try {
      for (const id of result.usedComponentIds) {
        await recordComponentUsage(id, result.repoUrl, clientName)
      }
    } catch {
      // analytics best-effort: não deve quebrar criação do projeto
    }
  }

  return new Response(JSON.stringify(result), { status: 200 })
}
