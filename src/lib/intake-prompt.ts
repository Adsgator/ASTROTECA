// src/lib/intake-prompt.ts

import type { Briefing, ArtDirectionV2, PageSection } from '../types'
import { SECTION_TEMPLATES, createSectionFromTemplate, prefillCopyFromBriefing } from './section-defaults'

// ─── Tipos de retorno expandido ───────────────────────────────────────────────

export interface IntakeResult {
  briefing: Briefing
  art: Partial<ArtDirectionV2>
  suggestedSectionTypes: string[]
  filledFields: string[]
}

// ─── Gerador de prompt ────────────────────────────────────────────────────────

export function buildIntakePrompt(briefingBruto: string): { system: string; user: string } {
  const system = `Você é um estrategista de marketing digital especializado em landing pages para profissionais liberais e pequenas empresas no Brasil.

Sua tarefa é extrair informações estruturadas de um briefing bruto fornecido pelo usuário e também sugerir direção de arte e seções da página.

REGRAS OBRIGATÓRIAS:
- Retorne APENAS JSON puro, sem markdown, sem code blocks, sem texto adicional
- NUNCA invente informações que não estão no texto — se não está no briefing, deixe string vazia "" ou false
- Para o campo "tipo", escolha entre: servico, mentoria, consultoria, produto, saas, curso
- Para o campo "schemaTipo", escolha entre: LocalBusiness, MedicalBusiness, LegalService, HealthAndBeautyBusiness, FoodEstablishment, ProfessionalService
- Extraia números de telefone no formato: 5511999999999 (sem formatação)
- Preserve nomes próprios com acentuação correta
- Para art.colorPrimary e demais cores: sugira paleta coerente com o segmento e tom de comunicação
- Para suggestedSectionTypes: inclua apenas seções justificadas pelo briefing
- Se um campo não tem informação no briefing, deixe como string vazia "" — NUNCA invente dados, nomes ou valores
- Para servico1/2/3Titulo: preencha apenas se o briefing listar serviços concretos com nome próprio
- Para passo1/2/3Titulo: preencha apenas se o briefing descrever etapas de processo concretas
- Para diferencial1/2/3Titulo: preencha apenas se o briefing mencionar diferenciais específicos`

  const user = `Analise o briefing abaixo e retorne o JSON com TODOS os campos listados.

BRIEFING:
${briefingBruto}

ESTRUTURA DO JSON (retorne exatamente estes campos):
{
  "briefing": {
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
    "servico1Titulo": "",
    "servico1Descricao": "",
    "servico2Titulo": "",
    "servico2Descricao": "",
    "servico3Titulo": "",
    "servico3Descricao": "",
    "comoFunciona": "",
    "passo1Titulo": "",
    "passo1Descricao": "",
    "passo2Titulo": "",
    "passo2Descricao": "",
    "passo3Titulo": "",
    "passo3Descricao": "",
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
    "diferencial1Titulo": "",
    "diferencial1Descricao": "",
    "diferencial2Titulo": "",
    "diferencial2Descricao": "",
    "diferencial3Titulo": "",
    "diferencial3Descricao": "",
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
  },
  "art": {
    "colorPrimary": "#hex",
    "colorPrimaryDark": "#hex",
    "colorSecondary": "#hex",
    "colorBackground": "#hex",
    "colorSurface": "#hex",
    "colorSurfaceAlt": "#hex",
    "colorDark": "#hex",
    "colorText": "#hex",
    "colorTextSoft": "#hex",
    "colorTextMuted": "#hex",
    "colorBorder": "#hex",
    "fontHeading": "Nome da Fonte",
    "fontBody": "Nome da Fonte",
    "mood": "descrição do mood visual em 1-2 frases",
    "defaultTheme": "light",
    "darkColorBackground": "#hex",
    "darkColorSurface": "#hex",
    "darkColorSurfaceAlt": "#hex",
    "darkColorText": "#hex",
    "darkColorTextSoft": "#hex",
    "darkColorTextMuted": "#hex",
    "darkColorBorder": "#hex",
    "palettePreset": ""
  },
  "suggestedSectionTypes": ["header", "hero", "sobre", "servicos", "cta", "footer"]
}

GUIA PARA ART — paletas por segmento:
- Saúde/Médico: azuis ou verdes calmos, serifa elegante no heading (ex: Cormorant Garamond, Playfair Display)
- Advocacia/Jurídico: azul escuro/dourado, serifa clássica (ex: Libre Baskerville, Merriweather)
- Estética/Beleza: rosa, bege, dourado, serifa refinada (ex: Cormorant Garamond, DM Serif Display)
- Tech/SaaS: azul elétrico ou roxo, sans-serif moderna (ex: Inter, Plus Jakarta Sans)
- Alimentação: laranja/vermelho quente, sans arredondada (ex: Nunito, Poppins)
- Fitness/Coach: laranja energético ou verde vibrante, sans bold (ex: Montserrat, Oswald)
- Consultoria/Negócios: azul escuro ou cinza grafite, sans profissional (ex: Inter, DM Sans)
- Padrão genérico: azul #2563eb, fonte Inter

GUIA PARA suggestedSectionTypes — inclua sempre header, hero, cta, footer.
Adicione: sobre (se há história/autoridade), servicos (se há mais de um serviço),
como-funciona (se há processo descrito), diferenciais (se há diferencial concreto),
depoimentos (se há ao menos 2 depoimentos), precos (se precoExibir=true),
faq (se há FAQ/objeções), google-reviews (se há nota Google), instagram (se há @).`

  return { system, user }
}

// ─── Aplicar resultado expandido ──────────────────────────────────────────────

export function applyIntakeResult(
  current: Briefing,
  json: string,
  currentArt?: Partial<ArtDirectionV2>
): IntakeResult {
  // Tenta extrair JSON de possíveis code blocks
  let clean = json.trim()
  const codeBlockMatch = clean.match(/```(?:json)?\s*([\s\S]+?)```/)
  if (codeBlockMatch) clean = codeBlockMatch[1].trim()
  const jsonMatch = clean.match(/\{[\s\S]+\}/)
  if (jsonMatch) clean = jsonMatch[0]

  let parsed: { briefing?: Partial<Briefing>; art?: Partial<ArtDirectionV2>; suggestedSectionTypes?: string[] }
  try {
    parsed = JSON.parse(clean)
  } catch {
    throw new Error('Gemini retornou resposta inválida — tente novamente')
  }

  // Suporte ao formato antigo (só briefing no root)
  if (!parsed.briefing && !parsed.art) {
    parsed = { briefing: parsed as Partial<Briefing> }
  }

  const filledFields: string[] = []
  const updatedBriefing = { ...current }

  const parsedBriefing = parsed.briefing || {}
  for (const key of Object.keys(parsedBriefing) as (keyof Briefing)[]) {
    const val = parsedBriefing[key]
    if (val === undefined || val === null) continue
    if (typeof val === 'string' && val.trim() === '') continue
    if (typeof val === 'boolean' && val === false && key === 'precoExibir') continue
    // Só sobrescreve se o campo atual está vazio
    const currentVal = current[key]
    if (typeof currentVal === 'string' && currentVal.trim() !== '') continue
    ;(updatedBriefing as any)[key] = val
    filledFields.push(key)
  }

  return {
    briefing: updatedBriefing,
    art: parsed.art || {},
    suggestedSectionTypes: parsed.suggestedSectionTypes || [],
    filledFields,
  }
}

// ─── Construir seções a partir das sugestões da IA ────────────────────────────

export function buildSectionsFromSuggestions(
  suggestedTypes: string[],
  briefing: Briefing
): PageSection[] {
  // Mapeia types sugeridos para templates
  const orderedTypes = suggestedTypes.length > 0
    ? suggestedTypes
    : SECTION_TEMPLATES.filter(t => t.required).map(t => t.type)

  // Inclui sempre os required que não estejam na lista
  const requiredTypes = SECTION_TEMPLATES.filter(t => t.required).map(t => t.type)
  const allTypes = [
    ...orderedTypes,
    ...requiredTypes.filter(t => !orderedTypes.includes(t)),
  ]

  // Deduplicar preservando ordem
  const seen = new Set<string>()
  const uniqueTypes = allTypes.filter(t => {
    if (seen.has(t)) return false
    seen.add(t)
    return true
  })

  return uniqueTypes.map((type, i) => {
    const template = SECTION_TEMPLATES.find(t => t.type === type)
    if (!template) {
      // Seção desconhecida — criar genérica
      return {
        id: `${type}-${i}`,
        type,
        label: type,
        enabled: false,
        position: i,
        copy: {},
        fromLibrary: false,
      }
    }
    const section = createSectionFromTemplate(template, i)
    return prefillCopyFromBriefing(section, briefing)
  })
}
