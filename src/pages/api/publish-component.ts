import type { APIRoute } from 'astro'
import type { AppSettings, ComponentMeta } from '../../types'
import { publishComponent, fetchRegistry } from '../../lib/github'

export const POST: APIRoute = async ({ request }) => {
  const { settings, meta, astroCode, previewCode, indexCode } = await request.json() as {
    settings: AppSettings
    meta: ComponentMeta
    astroCode: string
    previewCode: string
    indexCode: string
  }

  try {
    const currentRegistry = await fetchRegistry(settings.registryUrl)
    await publishComponent(settings, { meta, astroCode, previewCode, indexCode, currentRegistry })
    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return new Response(JSON.stringify({ error: message }), { status: 500 })
  }
}
