// src/lib/intake-prompt.ts

import type { Briefing } from '../types'

export function buildIntakePrompt(briefingBruto: string): { system: string; user: string } {
  const system = `Você é um estrategista de marketing digital especializado em landing pages para profissionais liberais e pequenas empresas no Brasil.

Sua tarefa é extrair informações estruturadas de um briefing bruto fornecido pelo usuário.

REGRAS OBRIGATÓRIAS:
- Retorne APENAS JSON puro, sem markdown, sem code blocks, sem texto adicional
- NUNCA invente informações — se um campo não está no texto, deixe como string vazia "" ou false para booleanos
- Para o campo "tipo", escolha entre: servico, mentoria, consultoria, produto, saas, curso
- Para o campo "schemaTipo", escolha entre: LocalBusiness, MedicalBusiness, LegalService, HealthAndBeautyBusiness, FoodEstablishment, ProfessionalService
- Extraia números de telefone no formato: 5511999999999 (sem formatação)
- Preserve nomes próprios com acentuação correta`

  const user = `Extraia as informações do briefing abaixo e retorne o JSON com TODOS os campos listados:

BRIEFING:
${briefingBruto}

CAMPOS DO JSON (retorne exatamente estes campos, sem adicionar outros):
{
  "nomeCliente": "",
  "nomeMarca": "",
  "segmento": "",
  "tipo": "",
  "propostaValor": "",
  "dominio": "",
  "anosExperiencia": "",
  "formacao": "",
  "certificacoes": "",
  "whatsapp": "",
  "email": "",
  "horarios": "",
  "gtmId": "",
  "objetivoConversao": "",
  "whatsappMensagem": "",
  "instagram": "",
  "tiktok": "",
  "youtube": "",
  "facebook": "",
  "googleBusiness": "",
  "googleNota": "",
  "googleQtd": "",
  "servicoPrincipal": "",
  "servicosDescricao": "",
  "comoFunciona": "",
  "resultadoEsperado": "",
  "prazoResultado": "",
  "precoExibir": false,
  "precoPlano1Nome": "",
  "precoPlano1Valor": "",
  "precoPlano1Descricao": "",
  "precoPlano2Nome": "",
  "precoPlano2Valor": "",
  "precoPlano2Descricao": "",
  "formaPagamento": "",
  "publicoPrimario": "",
  "publicoDor": "",
  "publicoResultado": "",
  "avatarNome": "",
  "avatarIdade": "",
  "avatarProfissao": "",
  "objecoes": "",
  "diferencial": "",
  "fraseImpacto": "",
  "historia": "",
  "depoimento1Nome": "",
  "depoimento1Texto": "",
  "depoimento1Resultado": "",
  "depoimento2Nome": "",
  "depoimento2Texto": "",
  "depoimento2Resultado": "",
  "depoimento3Nome": "",
  "depoimento3Texto": "",
  "depoimento3Resultado": "",
  "faq": "",
  "estiloDesejado": "",
  "sensacaoVisitante": "",
  "tomComunicacao": "",
  "restricoes": "",
  "seoTitulo": "",
  "seoDescricao": "",
  "seoKeywords": "",
  "schemaTipo": ""
}`

  return { system, user }
}

export function applyIntakeResult(
  current: Briefing,
  json: string
): { briefing: Briefing; filledFields: string[] } {
  // Tenta extrair JSON de possíveis code blocks
  let clean = json.trim()
  const codeBlockMatch = clean.match(/```(?:json)?\s*([\s\S]+?)```/)
  if (codeBlockMatch) clean = codeBlockMatch[1].trim()
  const jsonMatch = clean.match(/\{[\s\S]+\}/)
  if (jsonMatch) clean = jsonMatch[0]

  let parsed: Partial<Briefing>
  try {
    parsed = JSON.parse(clean)
  } catch {
    throw new Error('Gemini retornou resposta inválida — tente novamente')
  }

  const filledFields: string[] = []
  const updated = { ...current }

  for (const key of Object.keys(parsed) as (keyof Briefing)[]) {
    const val = parsed[key]
    if (val === undefined || val === null) continue
    if (typeof val === 'string' && val.trim() === '') continue
    if (typeof val === 'boolean' && val === false && key === 'precoExibir') continue
    // Só sobrescreve se o campo atual está vazio
    const currentVal = current[key]
    if (typeof currentVal === 'string' && currentVal.trim() !== '') continue
    ;(updated as any)[key] = val
    filledFields.push(key)
  }

  return { briefing: updated, filledFields }
}
