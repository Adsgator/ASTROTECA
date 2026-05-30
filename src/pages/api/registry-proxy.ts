import type { APIRoute } from 'astro'
import { fetchRegistry } from '../../lib/github'

const ALLOWED_HOSTS = ['raw.githubusercontent.com', 'api.github.com', 'github.com']

export const GET: APIRoute = async ({ url }) => {
  const registryUrl = url.searchParams.get('url')
  if (!registryUrl) {
    return new Response(JSON.stringify({ error: 'url obrigatória' }), { status: 400 })
  }

  try {
    const parsedUrl = new URL(registryUrl)
    if (!ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
      return new Response(JSON.stringify({ error: 'URL não permitida' }), { status: 403 })
    }
  } catch {
    return new Response(JSON.stringify({ error: 'URL inválida' }), { status: 400 })
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
