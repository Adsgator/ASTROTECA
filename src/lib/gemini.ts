// src/lib/gemini.ts

import type { GeminiModel } from '../types'

export async function callGemini(opts: {
  apiKey: string
  model: GeminiModel
  systemPrompt: string
  userPrompt: string
}): Promise<string> {
  const { apiKey, model, systemPrompt, userPrompt } = opts

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }],
      }),
    }
  )

  if (!res.ok) {
    if (res.status === 401) throw new Error('Chave inválida — verifique a API key do Gemini')
    if (res.status === 404) throw new Error('Modelo indisponível — tente gemini-2.5-flash')
    const body = await res.json().catch(() => ({}))
    throw new Error((body as any)?.error?.message || `Erro ${res.status} ao chamar Gemini`)
  }

  const data = await res.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}
