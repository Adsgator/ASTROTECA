// src/lib/palette-ai.ts

import type { GeminiModel } from '../types'
import { callGemini } from './gemini'
import { safeHex } from './color-utils'

export interface GeneratedPalette {
  colorPrimaryDark: string
  colorSecondary: string
  colorBackground: string
  colorSurface: string
  colorSurfaceAlt: string
  colorDark: string
  colorText: string
  colorTextSoft: string
  colorTextMuted: string
  colorBorder: string
}

const SYSTEM_PROMPT = `Você é um designer de sistemas de cores para landing pages profissionais.
Dado um par de cores (primária e secundária) e o contexto do negócio, gere uma paleta completa harmoniosa.

Regras obrigatórias:
- Todas as cores devem ser em hex (#RRGGBB)
- colorBackground e colorSurface devem ser cores claras (L > 90 em HSL) para o modo light
- colorDark deve ser escuro (L < 25) — usado no footer e seções de destaque
- colorText deve ter contraste WCAG AA mínimo contra colorBackground (razão ≥ 4.5:1)
- colorPrimaryDark deve ser a cor primária escurecida 15-20% para hover
- colorSecondary deve ser harmoniosa com a primária (análoga, complementar ou triádica)
- colorBorder deve ser sutil — tipicamente colorSurface escurecida 10-15%
- Adapte a personalidade visual ao segmento fornecido

Retorne APENAS um objeto JSON válido, sem markdown, sem texto extra:
{
  "colorPrimaryDark": "#hex",
  "colorSecondary": "#hex",
  "colorBackground": "#hex",
  "colorSurface": "#hex",
  "colorSurfaceAlt": "#hex",
  "colorDark": "#hex",
  "colorText": "#hex",
  "colorTextSoft": "#hex",
  "colorTextMuted": "#hex",
  "colorBorder": "#hex"
}`

export async function generateFullPalette(opts: {
  apiKey: string
  model: GeminiModel
  primary: string
  secondary: string
  niche: string
  mood: string
}): Promise<GeneratedPalette> {
  const { apiKey, model, primary, secondary, niche, mood } = opts

  const userPrompt = `Cor primária: ${primary}
Cor secundária: ${secondary}
Segmento/nicho: ${niche || 'negócio em geral'}
Mood desejado: ${mood || 'profissional e confiável'}

Gere a paleta completa para este projeto.`

  const raw = await callGemini({ apiKey, model, systemPrompt: SYSTEM_PROMPT, userPrompt, timeoutMs: 20_000 })

  // Extrai JSON mesmo se vier com texto ao redor
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Gemini não retornou JSON válido para a paleta')

  let parsed: Record<string, string>
  try {
    parsed = JSON.parse(jsonMatch[0])
  } catch {
    throw new Error('Erro ao fazer parse do JSON de paleta retornado pelo Gemini')
  }

  const fields: (keyof GeneratedPalette)[] = [
    'colorPrimaryDark', 'colorSecondary', 'colorBackground',
    'colorSurface', 'colorSurfaceAlt', 'colorDark',
    'colorText', 'colorTextSoft', 'colorTextMuted', 'colorBorder',
  ]

  const result = {} as GeneratedPalette
  for (const field of fields) {
    result[field] = safeHex(parsed[field] ?? '', '#888888')
  }

  return result
}
