// src/lib/gemini.ts

import type { GeminiModel } from '../types'

export async function callGemini(opts: {
  apiKey: string
  model: GeminiModel
  systemPrompt: string
  userPrompt: string
  timeoutMs?: number
}): Promise<string> {
  const { apiKey, model, systemPrompt, userPrompt } = opts

  // No browser, usa o proxy server-side para evitar CORS e timeout curto
  if (typeof window !== 'undefined') {
    const res = await fetch('/api/gemini-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, model, systemPrompt, userPrompt }),
    })
    const data = await res.json() as { text?: string; error?: string }
    if (!res.ok) throw new Error(data.error || `Erro ${res.status} ao chamar Gemini`)
    return data.text ?? ''
  }

  // No servidor (SSR / scripts), chama direto com timeout generoso
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 90_000)

  let res: Response
  try {
    res = await fetch(
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
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Gemini demorou demais para responder (timeout de 90s). Tente novamente.')
    }
    throw err
  } finally {
    clearTimeout(timer)
  }

  if (!res.ok) {
    if (res.status === 401) throw new Error('Chave inválida — verifique a API key do Gemini')
    if (res.status === 404) throw new Error('Modelo indisponível — tente gemini-2.5-flash')
    const body = await res.json().catch(() => ({})) as { error?: { message?: string } }
    throw new Error(body?.error?.message || `Erro ${res.status} ao chamar Gemini`)
  }

  const data = await res.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}
