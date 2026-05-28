import type { APIRoute } from 'astro'
import { fetchRegistry } from '../../lib/github'

export const GET: APIRoute = async ({ url }) => {
  const registryUrl = url.searchParams.get('url')
  if (!registryUrl) {
    return new Response(JSON.stringify({ error: 'url obrigatória' }), { status: 400 })
  }

  try {
    const components = await fetchRegistry(registryUrl)
    return new Response(JSON.stringify(components), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao buscar registry'
    return new Response(JSON.stringify({ error: msg }), { status: 502 })
  }
}
