// src/pages/api/gemini-proxy.ts
import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ request }) => {
  let body: { apiKey: string; model: string; systemPrompt: string; userPrompt: string }

  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Body inválido' }), { status: 400 })
  }

  const { apiKey, model, systemPrompt, userPrompt } = body

  if (!apiKey || !model || !systemPrompt || !userPrompt) {
    return new Response(JSON.stringify({ error: 'Parâmetros obrigatórios ausentes' }), { status: 400 })
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 90_000)

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }],
        }),
        signal: controller.signal,
      }
    )

    if (!res.ok) {
      if (res.status === 401) {
        return new Response(JSON.stringify({ error: 'Chave inválida — verifique a API key do Gemini' }), { status: 401 })
      }
      if (res.status === 404) {
        return new Response(JSON.stringify({ error: 'Modelo indisponível — tente gemini-2.5-flash' }), { status: 404 })
      }
      const errBody = await res.json().catch(() => ({})) as { error?: { message?: string } }
      return new Response(
        JSON.stringify({ error: errBody?.error?.message || `Erro ${res.status} ao chamar Gemini` }),
        { status: res.status }
      )
    }

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    return new Response(JSON.stringify({ text }), { status: 200 })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return new Response(
        JSON.stringify({ error: 'Gemini demorou demais para responder (timeout de 90s). Tente novamente.' }),
        { status: 504 }
      )
    }
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    return new Response(JSON.stringify({ error: msg }), { status: 500 })
  } finally {
    clearTimeout(timer)
  }
}
