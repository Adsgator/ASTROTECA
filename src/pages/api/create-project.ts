import type { APIRoute } from 'astro'
import type { AppSettings, ComponentMeta } from '../../types'
import { createProjectFromTemplate } from '../../lib/github'

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

  return new Response(JSON.stringify(result), { status: 200 })
}
