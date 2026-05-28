import type { APIRoute } from 'astro'
import type { AppSettings, ComponentMeta } from '../../types'
import { createProjectFromTemplate } from '../../lib/github'
import { recordComponentUsage } from '../../lib/analytics'

export const POST: APIRoute = async ({ request }) => {
  const { settings, clientName, manifest, components } = await request.json() as {
    settings: AppSettings
    clientName: string
    manifest: string
    components?: ComponentMeta[]
  }

  const result = await createProjectFromTemplate(settings, clientName, manifest, components)

  if (!result.success) {
    return new Response(JSON.stringify({ error: result.error }), { status: 400 })
  }

  // Registra uso dos componentes copiados. Best-effort: analytics não deve quebrar
  // a criação do projeto, e a persistência via fs só funciona em ambiente local.
  if (result.usedComponentIds?.length) {
    try {
      for (const id of result.usedComponentIds) {
        recordComponentUsage(id, result.repoUrl, clientName)
      }
    } catch (e) {
      console.error('Erro ao registrar uso de componentes:', e)
    }
  }

  return new Response(JSON.stringify(result), { status: 200 })
}
