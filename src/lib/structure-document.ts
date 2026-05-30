// src/lib/structure-document.ts
// Gera o documento .md para Claude Chat criar copy/estrutura
// e parseia o output de volta para preencher os campos.

import type { BuilderState, AppSettingsV2, PageSection } from '../types'
import { getDNAByType } from './dna'
import { SECTION_TEMPLATES } from './section-defaults'

// ─── Gerador do documento ────────────────────────────────────────────────────

export function generateStructureDocument(state: BuilderState, settings: AppSettingsV2): string {
  const { briefing, sections, art } = state
  const date = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const slug = slugifyName(briefing.nomeCliente || 'projeto')

  const enabledSections = sections.filter(s => s.enabled).sort((a, b) => a.position - b.position)
  const allSections = sections.slice().sort((a, b) => a.position - b.position)

  // Presença digital
  const gbStatus = briefing.googleNota
    ? `Sim | ${briefing.googleNota} estrelas (${briefing.googleQtd || '?'} avaliações)`
    : 'Não informado'
  const igStatus = briefing.instagram ? `Sim | @${briefing.instagram}` : 'Não informado'
  const depStatus = briefing.depoimento1Nome
    ? `Sim | ao menos ${[briefing.depoimento1Nome, briefing.depoimento2Nome, briefing.depoimento3Nome].filter(Boolean).length} depoimentos`
    : 'Não informado'

  return `---
projeto: ${briefing.nomeCliente || 'projeto'}
slug: ${slug}
data: ${date}
tipo: estrutura-copy-para-ia-externa
versao: 1.0
---

# ${briefing.nomeCliente || 'Projeto'} — Estrutura e Copy da Landing Page

Gerado pela **Astroteca** · ${settings.studioName || 'Studio'} · ${date}

---

## INSTRUÇÃO PARA A IA

Você é um Copywriter Sênior especializado em Landing Pages de Alta Conversão
para tráfego pago (Google Ads, Meta Ads), trabalhando para a agência Adsgator.

Leia o briefing abaixo na íntegra. Execute os três passos na ordem. Não pule etapas.

---

## DNA ADSGATOR — REGRAS INEGOCIÁVEIS

${getDNAByType(briefing.tipo)}

**Intenção de Busca em Primeiro Lugar**
O texto espelha a dor exata que levou o usuário a pesquisar. O título do Hero justifica o clique no anúncio nos primeiros 3 segundos. Venda o alívio da dor, não o nome técnico do serviço.

**Zero Institucional**
Proibido: "inovador", "excelência", "missão", "visão", "somos apaixonados por", "comprometidos com", "resultados extraordinários". Se parece site corporativo genérico, está errado.

**Comunicação Direta e Realista**
Sem promessas milagrosas. Sem adjetivar o óbvio. A copy entrega o que o serviço realmente faz.

**Tom Conversacional com Autoridade**
Especialista conversando olho no olho. Firmeza sem arrogância. Proximidade sem informalidade excessiva.

**Linguagem Natural**
Escreva de forma natural e conversacional. Use vírgulas, pontos e conectivos. Evite travessão (—) na copy.

---

## BRIEFING DO PROJETO

### Identidade

| Campo | Valor |
|-------|-------|
| **Cliente** | ${briefing.nomeCliente || '—'} |
| **Marca** | ${briefing.nomeMarca || briefing.nomeCliente || '—'} |
| **Segmento** | ${briefing.segmento || '—'} |
| **Tipo de negócio** | ${briefing.tipo || '—'} |
| **Serviço principal** | ${briefing.servicoPrincipal || '—'} |
| **Proposta de valor** | ${briefing.propostaValor || '—'} |
| **Público primário** | ${briefing.publicoPrimario || '—'} |
| **Dor do público** | ${briefing.publicoDor || '—'} |
| **Resultado esperado** | ${briefing.publicoResultado || '—'} |
| **Frase de impacto** | ${briefing.fraseImpacto || '—'} |
| **WhatsApp** | ${briefing.whatsapp || '—'} |
| **Mensagem WA** | ${briefing.whatsappMensagem || 'Olá! Vi o site e quero saber mais.'} |
| **Objetivo de conversão** | ${briefing.objetivoConversao || '—'} |
| **GTM ID** | ${briefing.gtmId || 'a confirmar'} |
${briefing.anosExperiencia ? `| **Anos de experiência** | ${briefing.anosExperiencia} |\n` : ''}\
${briefing.formacao ? `| **Formação** | ${briefing.formacao} |\n` : ''}\

### Tom de Voz

**Estilo desejado:** ${briefing.estiloDesejado || '—'}

**Sensação que o visitante deve ter:** ${briefing.sensacaoVisitante || '—'}

**Tom de comunicação:** ${briefing.tomComunicacao || '—'}

${briefing.restricoes ? `**Restrições / O que não fazer:**\n${briefing.restricoes}\n` : ''}

### Briefing Completo

${briefing.briefingBruto || '(não preenchido)'}

### Serviço e Contexto

${briefing.servicosDescricao ? `**Descrição dos serviços:**\n${briefing.servicosDescricao}\n\n` : ''}\
${briefing.comoFunciona ? `**Como funciona:**\n${briefing.comoFunciona}\n\n` : ''}\
${briefing.resultadoEsperado ? `**Resultado esperado:** ${briefing.resultadoEsperado}\n` : ''}\
${briefing.prazoResultado ? `**Prazo do resultado:** ${briefing.prazoResultado}\n` : ''}\

### Diferencial e Autoridade

${briefing.diferencial ? `**Diferenciais:**\n${briefing.diferencial}\n\n` : ''}\
${briefing.historia ? `**História / Sobre:**\n${briefing.historia}\n\n` : ''}\
${briefing.objecoes ? `**Objeções a quebrar:**\n${briefing.objecoes}\n\n` : ''}\

### Depoimentos${[briefing.depoimento1Nome, briefing.depoimento2Nome, briefing.depoimento3Nome].filter(Boolean).length === 0 ? '\n\n_(não preenchidos)_' : ''}

${briefing.depoimento1Nome ? `**${briefing.depoimento1Nome}:** "${briefing.depoimento1Texto}"${briefing.depoimento1Resultado ? ` → Resultado: ${briefing.depoimento1Resultado}` : ''}` : ''}
${briefing.depoimento2Nome ? `\n**${briefing.depoimento2Nome}:** "${briefing.depoimento2Texto}"${briefing.depoimento2Resultado ? ` → Resultado: ${briefing.depoimento2Resultado}` : ''}` : ''}
${briefing.depoimento3Nome ? `\n**${briefing.depoimento3Nome}:** "${briefing.depoimento3Texto}"${briefing.depoimento3Resultado ? ` → Resultado: ${briefing.depoimento3Resultado}` : ''}` : ''}

${briefing.faq ? `### FAQ\n\n${briefing.faq}\n` : ''}

${briefing.precoExibir ? `### Preços\n\n${briefing.precoPlano1Nome ? `**${briefing.precoPlano1Nome}:** ${briefing.precoPlano1Valor}\n${briefing.precoPlano1Descricao}\n\n` : ''}${briefing.precoPlano2Nome ? `**${briefing.precoPlano2Nome}:** ${briefing.precoPlano2Valor}\n${briefing.precoPlano2Descricao}\n` : ''}${briefing.formaPagamento ? `\n**Pagamento:** ${briefing.formaPagamento}` : ''}\n` : ''}

### Presença Digital

| Ativo Digital | Status |
|---------------|--------|
| **Google Business** | ${gbStatus} |
| **Instagram** | ${igStatus} |
| **Depoimentos** | ${depStatus} |

---

## SEÇÕES DA PÁGINA (estado atual)

As seções abaixo foram pré-configuradas. Você deve:
1. Confirmar se a seleção faz sentido para este projeto ou sugerir ajustes
2. Criar copy completa para cada seção habilitada
3. Você pode habilitar seções adicionais se o briefing justificar

| Seção | Status | Justificativa |
|-------|--------|---------------|
${allSections.map(s => `| ${s.label} | ${s.enabled ? '✅ Habilitada' : '⬜ Desabilitada'} | ${getSectionHint(s.type)} |`).join('\n')}

---

## SEÇÕES DISPONÍVEIS (referência completa)

| Seção | Quando usar |
|-------|-------------|
| Header | Sempre |
| Hero | Sempre. Título focado na dor #1 do público. |
| Sobre | Para profissionais autônomos, mentores, consultores com história relevante. |
| Serviços | Se há mais de um serviço ou o serviço precisa de descrição. |
| Como Funciona | Se o processo reduz objeção de "como é isso?". |
| Diferenciais | Sempre que houver diferencial real e concreto. |
| Depoimentos | Apenas se há depoimentos reais preenchidos. Nunca inventar. |
| Avaliações Google | Apenas se Google Business com avaliações está confirmado. |
| Preços | Apenas se valores foram fornecidos e autorizados. |
| FAQ | Apenas se há objeções ou perguntas reais no briefing. |
| Instagram Feed | Apenas se perfil ativo e relevante. |
| Localização | Apenas se atendimento presencial com endereço confirmado. |
| CTA Final | Sempre. |
| Footer | Sempre. |

---

## PASSOS DE EXECUÇÃO

### PASSO A — Análise de Intenção *(não aparece na página)*

Mapeie as 3 dores principais do usuário que pesquisa por este serviço.

Para cada dor, entregue:
- **Dor real:** o que ele sente / o problema concreto
- **Palavra de busca:** como digita no Google (não o termo técnico)
- **Resultado desejado:** o que imagina conquistar ao clicar

Antes de passar ao PASSO B, confirme: o título do Hero que você vai escrever espelha a Dor #1?

### PASSO B — Metadados de SEO *(vai no \`<head>\`)*

- \`<title>\`: máximo 60 caracteres. Palavra-chave principal + localidade se local.
- \`<meta description>\`: máximo 160 caracteres. Tom conversacional. Dor + benefício + CTA implícito.
- \`<meta keywords>\`: 5 a 8 termos de busca relevantes, separados por vírgula.

### PASSO C — Estrutura e Copy Completa

Monte a página como narrativa contínua. Cada seção conduz o usuário um passo adiante.

**Regras inegociáveis:**
- Nunca inventar depoimentos, avaliações ou notas do Google
- Nunca incluir seções de integração (Instagram, Maps, Google Reviews) sem confirmar que o ativo existe no briefing
- Nunca repetir a mesma dor em seções diferentes sem evolução narrativa
- CTAs: verbos de ação + o que acontece ao clicar — nunca "Saiba mais" ou "Clique aqui"

---

## FORMATO OBRIGATÓRIO DE ENTREGA

**IMPORTANTE:** O output será importado diretamente por um sistema.
Siga o formato abaixo com precisão. Qualquer desvio impede o parse automático.

Comece com \`===INICIO-OUTPUT===\` e termine com \`===FIM-OUTPUT===\`.
Tudo fora desses delimitadores é ignorado pelo sistema.

\`\`\`
===INICIO-OUTPUT===

## RESUMO

| Campo | Valor |
|-------|-------|
| **Objetivo da página** | [uma frase] |
| **Público-alvo principal** | [uma frase] |
| **Tom de voz** | [uma frase] |
| **Número WhatsApp** | [DDI+DDD+número, só dígitos, ex: 5511999999999] |
| **Mensagem WhatsApp** | [texto da mensagem] |

---

## 1. ANÁLISE DE INTENÇÃO

### Dor #1
- **Dor real:** [texto]
- **Palavra de busca:** [texto]
- **Resultado desejado:** [texto]
- **Confirmação título Hero:** Sim — "[trecho do título]"

### Dor #2
- **Dor real:** [texto]
- **Palavra de busca:** [texto]
- **Resultado desejado:** [texto]

### Dor #3
- **Dor real:** [texto]
- **Palavra de busca:** [texto]
- **Resultado desejado:** [texto]

---

## 2. SEO

- **title:** [máx 60 chars]
- **meta description:** [máx 160 chars]
- **meta keywords:** [5-8 termos separados por vírgula]

---

## 3. FLUXO SELECIONADO

1. [Nome da Seção] — [justificativa em 1 linha]
2. [Nome da Seção] — [justificativa em 1 linha]
...

---

## 4. COPY COMPLETA

### SEÇÃO: [nome exato, ex: Hero]

**Objetivo persuasivo:** [texto]

**Copy:**
- **TÍTULO:** "[texto]"
- **SUBTÍTULO:** "[texto]"
- **CTA PRINCIPAL:** "[texto do botão]"
- **CTA URL:** "[url ou #ancora]"
- **CTA SECUNDÁRIO:** "[texto opcional]"
- **ITEM 1:** "[texto]"
- **ITEM 2:** "[texto]"
- **ITEM 3:** "[texto]"

*(Inclua apenas os campos relevantes para esta seção)*

---

[Repetir ### SEÇÃO: para cada seção habilitada]

===FIM-OUTPUT===
\`\`\`

Não resuma a copy. Não invente dados. Não use placeholders como "[nome]" ou "[texto aqui]".
`
}

// ─── Parser do output da IA ───────────────────────────────────────────────────

export interface ParsedStructureOutput {
  resumo: {
    objetivoPagina?: string
    publicoAlvo?: string
    tomVoz?: string
    whatsapp?: string
    whatsappMensagem?: string
  }
  seo: {
    title?: string
    description?: string
    keywords?: string
  }
  intencao: Array<{
    dor: string
    palavraBusca: string
    resultadoDesejado: string
  }>
  fluxo: Array<{ nome: string; justificativa: string }>
  sections: Array<{
    type: string
    copy: Record<string, string>
  }>
}

export function parseStructureOutput(text: string): ParsedStructureOutput {
  const delimRegex = /===INICIO-OUTPUT===([\s\S]*?)===FIM-OUTPUT===/
  const match = delimRegex.exec(text)

  if (!match) {
    throw new Error(
      'Formato inválido: não encontrei ===INICIO-OUTPUT=== e ===FIM-OUTPUT===.\n' +
      'Certifique-se de colar o output completo da IA, incluindo os delimitadores.'
    )
  }

  const content = match[1].trim()

  const resumo = parseResumo(content)
  const seo = parseSEO(content)
  const intencao = parseIntencao(content)
  const fluxo = parseFluxo(content)
  const sections = parseSections(content)

  return { resumo, seo, intencao, fluxo, sections }
}

function extractSection(content: string, header: string, nextHeader?: string): string {
  const start = content.indexOf(`## ${header}`)
  if (start === -1) return ''
  const from = start + `## ${header}`.length
  const end = nextHeader ? content.indexOf(`## ${nextHeader}`, from) : content.length
  return content.slice(from, end === -1 ? content.length : end).trim()
}

function parseResumo(content: string): ParsedStructureOutput['resumo'] {
  const section = extractSection(content, 'RESUMO', '1. ANÁLISE')
  const result: ParsedStructureOutput['resumo'] = {}

  const rows = section.split('\n')
  for (const row of rows) {
    const m = /\|\s*\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|/.exec(row)
    if (!m) continue
    const key = m[1].trim().toLowerCase()
    const val = m[2].trim()
    if (!val || val.startsWith('[')) continue

    if (key.includes('objetivo')) result.objetivoPagina = val
    else if (key.includes('público') || key.includes('publico')) result.publicoAlvo = val
    else if (key.includes('tom')) result.tomVoz = val
    else if (key.includes('whatsapp') && !key.includes('mensagem')) result.whatsapp = val.replace(/\D/g, '')
    else if (key.includes('mensagem')) result.whatsappMensagem = val
  }

  return result
}

function parseSEO(content: string): ParsedStructureOutput['seo'] {
  const section = extractSection(content, '2. SEO', '3. FLUXO')
  const result: ParsedStructureOutput['seo'] = {}

  const titleM = /\*\*title:\*\*\s*(.+)/.exec(section)
  const descM = /\*\*meta description:\*\*\s*(.+)/.exec(section)
  const kwM = /\*\*meta keywords:\*\*\s*(.+)/.exec(section)

  if (titleM) result.title = titleM[1].trim()
  if (descM) result.description = descM[1].trim()
  if (kwM) result.keywords = kwM[1].trim()

  return result
}

function parseIntencao(content: string): ParsedStructureOutput['intencao'] {
  const section = extractSection(content, '1. ANÁLISE DE INTENÇÃO', '2. SEO')
  const items: ParsedStructureOutput['intencao'] = []

  const dorBlocks = section.split(/###\s+Dor #\d+/).slice(1)
  for (const block of dorBlocks) {
    const dorM = /\*\*Dor real:\*\*\s*(.+)/.exec(block)
    const buscaM = /\*\*Palavra de busca:\*\*\s*(.+)/.exec(block)
    const resultM = /\*\*Resultado desejado:\*\*\s*(.+)/.exec(block)
    if (dorM) {
      items.push({
        dor: dorM[1].trim(),
        palavraBusca: buscaM ? buscaM[1].trim() : '',
        resultadoDesejado: resultM ? resultM[1].trim() : '',
      })
    }
  }

  return items
}

function parseFluxo(content: string): ParsedStructureOutput['fluxo'] {
  const section = extractSection(content, '3. FLUXO SELECIONADO', '4. COPY')
  const items: ParsedStructureOutput['fluxo'] = []

  const lines = section.split('\n')
  for (const line of lines) {
    const m = /^\d+\.\s+(.+?)\s+—\s+(.+)$/.exec(line.trim())
    if (m) {
      items.push({ nome: m[1].trim(), justificativa: m[2].trim() })
    }
  }

  return items
}

function parseSections(content: string): ParsedStructureOutput['sections'] {
  const copyStart = content.indexOf('## 4. COPY COMPLETA')
  if (copyStart === -1) return []

  const copyContent = content.slice(copyStart)
  const sectionBlocks = copyContent.split(/###\s+SEÇÃO:\s*/i).slice(1)

  return sectionBlocks.map(block => {
    const nameEnd = block.indexOf('\n')
    const sectionName = block.slice(0, nameEnd).trim().replace(/['"]/g, '')
    const sectionType = matchSectionType(sectionName)

    const copy: Record<string, string> = {}

    // Parse bullet points: **CAMPO:** "valor"
    const bulletRegex = /- \*\*([^*]+):\*\*\s*"?([^"\n]+)"?/g
    let m: RegExpExecArray | null
    while ((m = bulletRegex.exec(block)) !== null) {
      const rawKey = m[1].trim().toLowerCase()
      const val = m[2].trim().replace(/^["']|["']$/g, '')
      if (!val || val.startsWith('[')) continue
      const key = normalizeFieldKey(rawKey)
      if (key) copy[key] = val
    }

    return { type: sectionType, copy }
  })
}

// ─── Aplicar output no estado ─────────────────────────────────────────────────

export function applyParsedStructure(
  currentSections: PageSection[],
  parsed: ParsedStructureOutput
): PageSection[] {
  // Determinar quais seções habilitar pelo fluxo
  const enabledTypes = new Set(parsed.fluxo.map(f => matchSectionType(f.nome)))

  // Para cada seção existente, aplicar copy e enable/disable
  const updated = currentSections.map(section => {
    const parsedSection = parsed.sections.find(s => s.type === section.type)
    const shouldEnable = enabledTypes.size > 0 ? enabledTypes.has(section.type) : section.enabled

    if (parsedSection && Object.keys(parsedSection.copy).length > 0) {
      return {
        ...section,
        enabled: shouldEnable,
        copy: { ...section.copy, ...parsedSection.copy },
      }
    }

    return { ...section, enabled: shouldEnable }
  })

  // Reordenar pelo fluxo se fornecido
  if (parsed.fluxo.length > 0) {
    const fluxoTypes = parsed.fluxo.map(f => matchSectionType(f.nome))
    return updated.sort((a, b) => {
      const ia = fluxoTypes.indexOf(a.type)
      const ib = fluxoTypes.indexOf(b.type)
      // Seções fora do fluxo vão para o final
      const posA = ia === -1 ? 999 : ia
      const posB = ib === -1 ? 999 : ib
      return posA - posB
    }).map((s, i) => ({ ...s, position: i }))
  }

  return updated
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getSectionHint(type: string): string {
  const tpl = SECTION_TEMPLATES.find(t => t.type === type)
  return tpl?.hint || (tpl?.required ? 'Obrigatório' : 'Opcional')
}

// Mapeia nome da seção (do output da IA) para o type interno
const SECTION_NAME_MAP: Record<string, string> = {
  'header': 'header',
  'cabeçalho': 'header',
  'cabecalho': 'header',
  'hero': 'hero',
  'sobre': 'sobre',
  'about': 'sobre',
  'serviços': 'servicos',
  'servicos': 'servicos',
  'services': 'servicos',
  'como funciona': 'como-funciona',
  'como-funciona': 'como-funciona',
  'diferenciais': 'diferenciais',
  'diferencial': 'diferenciais',
  'features': 'diferenciais',
  'depoimentos': 'depoimentos',
  'testimonials': 'depoimentos',
  'avaliações google': 'google-reviews',
  'avaliacoes google': 'google-reviews',
  'google reviews': 'google-reviews',
  'preços': 'precos',
  'precos': 'precos',
  'pricing': 'precos',
  'planos': 'precos',
  'faq': 'faq',
  'perguntas frequentes': 'faq',
  'instagram': 'instagram',
  'instagram feed': 'instagram',
  'localização': 'localizacao',
  'localizacao': 'localizacao',
  'localização e mapa': 'localizacao',
  'cta': 'cta',
  'cta final': 'cta',
  'footer': 'footer',
  'rodapé': 'footer',
  'rodape': 'footer',
}

function matchSectionType(name: string): string {
  const normalized = name.toLowerCase().trim()
  return SECTION_NAME_MAP[normalized] || normalized
}

// Mapeia campo do output da IA para chave interna do copy
const FIELD_KEY_MAP: Record<string, string> = {
  'título': 'titulo',
  'titulo': 'titulo',
  'title': 'titulo',
  'título principal': 'titulo',
  'subtítulo': 'subtitulo',
  'subtitulo': 'subtitulo',
  'subtitle': 'subtitulo',
  'subtítulo / texto de apoio': 'subtitulo',
  'texto de apoio': 'subtitulo',
  'texto': 'texto',
  'cta principal': 'ctaTexto',
  'cta': 'ctaTexto',
  'botão': 'ctaTexto',
  'botao': 'ctaTexto',
  'cta url': 'ctaUrl',
  'url': 'ctaUrl',
  'cta secundário': 'ctaSecundarioTexto',
  'cta secundario': 'ctaSecundarioTexto',
  'label': 'label',
  'item 1': 'servico1Titulo',
  'item 2': 'servico2Titulo',
  'item 3': 'servico3Titulo',
  'passo 1': 'passo1',
  'passo 2': 'passo2',
  'passo 3': 'passo3',
  'diferencial 1': 'diferencial1',
  'diferencial 2': 'diferencial2',
  'diferencial 3': 'diferencial3',
  'credenciais': 'credenciais',
  'copyright': 'copyright',
  'endereço': 'endereco',
  'endereco': 'endereco',
}

function normalizeFieldKey(raw: string): string {
  return FIELD_KEY_MAP[raw.toLowerCase()] || raw
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
}
