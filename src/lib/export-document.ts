// src/lib/export-document.ts

import type { BuilderState, AppSettingsV2 } from '../types'
import { getDNAByType } from './dna'

export function generateDocument(state: BuilderState, settings: AppSettingsV2): string {
  const { briefing, sections, art, selected } = state
  const studioName = settings.studioName || 'Astroteca'
  const date = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const enabledSections = sections.filter(s => s.enabled).sort((a, b) => a.position - b.position)

  // ── 1. Header ──────────────────────────────────────────────────────────────
  const header = `> **Como usar:** Cole este arquivo em uma nova conversa com o Claude junto com o prompt abaixo.

**Prompt sugerido:**
\`\`\`
Você está adaptando um projeto Astro para o cliente ${briefing.nomeCliente} (segmento: ${briefing.segmento}).
Siga este documento passo a passo:
1. Atualize tailwind.config.js com as cores da seção "Direção de Arte"
2. Atualize global.css com as fontes indicadas
3. Atualize Layout.astro com SEO, GTM e Schema.org desta documentação
4. Para cada seção habilitada, substitua os textos placeholder pelos valores de copy
5. Não altere estrutura HTML, classes Tailwind, ou lógica JavaScript — apenas dados do cliente
6. Configure o tema padrão: ${art.defaultTheme === 'dark' ? 'escuro (adicionar classe "dark" no <html>)' : 'claro (padrão)'}
\`\`\`

---

# Documento do Projeto — ${briefing.nomeCliente || '(sem nome)'}
**Studio:** ${studioName}
**Gerado em:** ${date}
**Segmento:** ${briefing.segmento || '—'}
**Tipo:** ${briefing.tipo || '—'}`

  // ── 2. Briefing ────────────────────────────────────────────────────────────
  const briefingRows: string[] = []
  const briefingMap: [string, string][] = [
    ['Nome do cliente', briefing.nomeCliente],
    ['Nome da marca', briefing.nomeMarca],
    ['Segmento', briefing.segmento],
    ['Tipo de negócio', briefing.tipo],
    ['Proposta de valor', briefing.propostaValor],
    ['Domínio', briefing.dominio],
    ['WhatsApp', briefing.whatsapp],
    ['Email', briefing.email],
    ['Horários', briefing.horarios],
    ['Instagram', briefing.instagram],
    ['Objetivo de conversão', briefing.objetivoConversao],
    ['Mensagem WhatsApp', briefing.whatsappMensagem],
    ['GTM ID', briefing.gtmId],
    ['Schema tipo', briefing.schemaTipo],
    ['Serviço principal', briefing.servicoPrincipal],
    ['Público primário', briefing.publicoPrimario],
    ['Dor do público', briefing.publicoDor],
    ['Resultado esperado', briefing.publicoResultado],
    ['Frase de impacto', briefing.fraseImpacto],
    ['Diferencial', briefing.diferencial],
    ['SEO título', briefing.seoTitulo],
    ['SEO descrição', briefing.seoDescricao],
    ['SEO keywords', briefing.seoKeywords],
    ['Google nota', briefing.googleNota],
    ['Google avaliações', briefing.googleQtd],
    ['Forma de pagamento', briefing.formaPagamento],
    ['Anos de experiência', briefing.anosExperiencia],
    ['Formação', briefing.formacao],
  ]

  for (const [label, value] of briefingMap) {
    if (value && String(value).trim()) {
      briefingRows.push(`| ${label} | ${value} |`)
    }
  }

  const briefingSection = briefingRows.length > 0
    ? `\n\n---\n\n## Briefing do Cliente\n\n| Campo | Valor |\n|-------|-------|\n${briefingRows.join('\n')}`
    : ''

  // Depoimentos
  const depoimentos: string[] = []
  if (briefing.depoimento1Nome) {
    depoimentos.push(`**${briefing.depoimento1Nome}:** "${briefing.depoimento1Texto}"${briefing.depoimento1Resultado ? ` → Resultado: ${briefing.depoimento1Resultado}` : ''}`)
  }
  if (briefing.depoimento2Nome) {
    depoimentos.push(`**${briefing.depoimento2Nome}:** "${briefing.depoimento2Texto}"${briefing.depoimento2Resultado ? ` → Resultado: ${briefing.depoimento2Resultado}` : ''}`)
  }
  if (briefing.depoimento3Nome) {
    depoimentos.push(`**${briefing.depoimento3Nome}:** "${briefing.depoimento3Texto}"${briefing.depoimento3Resultado ? ` → Resultado: ${briefing.depoimento3Resultado}` : ''}`)
  }
  const depoimentosSection = depoimentos.length > 0
    ? `\n\n### Depoimentos\n\n${depoimentos.join('\n\n')}`
    : ''

  // História
  const historiaSection = briefing.historia
    ? `\n\n### História / Sobre\n\n${briefing.historia}`
    : ''

  // FAQ
  const faqSection = briefing.faq
    ? `\n\n### FAQ\n\n${briefing.faq}`
    : ''

  // Objeções
  const objecoesSection = briefing.objecoes
    ? `\n\n### Objeções a Quebrar\n\n${briefing.objecoes}`
    : ''

  // Preços
  let precosSection = ''
  if (briefing.precoExibir) {
    precosSection = '\n\n### Planos e Preços\n\n'
    if (briefing.precoPlano1Nome) {
      precosSection += `**${briefing.precoPlano1Nome}:** ${briefing.precoPlano1Valor}\n${briefing.precoPlano1Descricao}\n\n`
    }
    if (briefing.precoPlano2Nome) {
      precosSection += `**${briefing.precoPlano2Nome}:** ${briefing.precoPlano2Valor}\n${briefing.precoPlano2Descricao}\n`
    }
    if (briefing.formaPagamento) {
      precosSection += `\n**Formas de pagamento:** ${briefing.formaPagamento}`
    }
  }

  // ── 3. Estrutura & Copy ────────────────────────────────────────────────────
  let estruturaSection = '\n\n---\n\n## Estrutura da Página\n\n'
  if (enabledSections.length === 0) {
    estruturaSection += '_Nenhuma seção habilitada._'
  } else {
    for (const section of enabledSections) {
      estruturaSection += `### ${section.position + 1}. ${section.label}${section.fromLibrary && section.componentId ? ` _(Componente: ${section.componentId})_` : ''}\n\n`
      const copyEntries = Object.entries(section.copy).filter(([, v]) => v && String(v).trim())
      if (copyEntries.length > 0) {
        estruturaSection += '| Campo | Texto |\n|-------|-------|\n'
        for (const [key, value] of copyEntries) {
          estruturaSection += `| ${key} | ${value} |\n`
        }
      } else {
        estruturaSection += '_Copy não preenchido — Claude deve criar com base no briefing._\n'
      }
      estruturaSection += '\n'
    }
  }

  // ── 4. Direção de Arte ────────────────────────────────────────────────────
  const artSection = `\n\n---\n\n## Direção de Arte

### Tema Padrão
**${art.defaultTheme === 'dark' ? '🌙 Escuro' : '☀️ Claro'}**${art.defaultTheme === 'dark' ? '\n\nAdicionar \`class="dark"\` no `<html>` do Layout.astro.' : ''}

### Cores Light (tailwind.config.js)

| Token | Hex | Uso |
|-------|-----|-----|
| primary | \`${art.colorPrimary}\` | Cor principal da marca |
| primary-dark | \`${art.colorPrimaryDark}\` | Hover/variante escura do primary |
| secondary | \`${art.colorSecondary}\` | Cor de destaque secundária |
| background | \`${art.colorBackground}\` | Fundo da página |
| surface | \`${art.colorSurface}\` | Cards e superfícies |
| surface-alt | \`${art.colorSurfaceAlt}\` | Superfícies alternativas |
| dark | \`${art.colorDark}\` | Seções escuras |
| text-main | \`${art.colorText}\` | Texto principal |
| text-soft | \`${art.colorTextSoft}\` | Texto secundário |
| text-muted | \`${art.colorTextMuted}\` | Texto terciário/placeholder |
| border | \`${art.colorBorder}\` | Bordas e divisores |

### Cores Dark (quando dark mode ativo)

| Token | Hex |
|-------|-----|
| dark-bg | \`${art.darkColorBackground}\` |
| dark-surface | \`${art.darkColorSurface}\` |
| dark-surface-alt | \`${art.darkColorSurfaceAlt}\` |
| dark-text-main | \`${art.darkColorText}\` |
| dark-text-soft | \`${art.darkColorTextSoft}\` |
| dark-text-muted | \`${art.darkColorTextMuted}\` |
| dark-border | \`${art.darkColorBorder}\` |

### Tipografia

| Papel | Fonte |
|-------|-------|
| Heading (font-serif) | ${art.fontHeading} |
| Body (font-sans) | ${art.fontBody} |

${art.mood ? `### Mood & Referências\n\n${art.mood}` : ''}
${art.references ? `\n**Referências visuais:** ${art.references}` : ''}
${art.notes ? `\n**Notas:** ${art.notes}` : ''}`

  // ── 5. Componentes da Biblioteca ──────────────────────────────────────────
  let componentsSection = ''
  if (selected.length > 0) {
    componentsSection = '\n\n---\n\n## Componentes da Biblioteca\n\n'
    componentsSection += '| # | ID | Nome | Categoria |\n|---|----|----|--------|\n'
    for (const s of selected) {
      componentsSection += `| ${s.position + 1} | \`${s.meta.id}\` | ${s.meta.name} | ${s.meta.category} |\n`
    }
    componentsSection += '\n_Copiar os arquivos da biblioteca para `src/components/` do projeto gerado._'
  }

  // ── 6. DNA ────────────────────────────────────────────────────────────────
  const dnaSection = `\n\n---\n\n## Regras de Copy — DNA do Negócio\n\n${getDNAByType(briefing.tipo)}`

  // ── 7. Instruções de Implementação ────────────────────────────────────────
  const instrucoes = `\n\n---\n\n## Instruções de Implementação

### Tokens obrigatórios (não substituir por valores literais)
- Cores: \`bg-primary\`, \`text-text-main\`, \`bg-surface\`, \`border-border\`, etc.
- Fontes: \`font-serif\` (heading), \`font-sans\` (corpo)
- Espaçamento: \`py-section\`, \`w-[90%] max-w-wide mx-auto\`
- Sombras: \`shadow-card\`, \`shadow-float\`

### Dark mode
- Configurar \`darkMode: 'class'\` no tailwind.config.js
- ThemeToggle já incluso no _base-project — verificar se está importado no Layout.astro
- Tema padrão: \`data-default-theme="${art.defaultTheme}"\` no \`<html>\`

### Estrutura do projeto (_base-project)
1. Clonar o repositório base
2. Atualizar \`tailwind.config.js\` com as cores desta documentação
3. Atualizar \`src/styles/global.css\` com as fontes
4. Atualizar \`src/layouts/Layout.astro\` com SEO, GTM, Schema.org
5. Criar/adaptar componentes em \`src/components/\`
6. Testar dark mode e responsividade`

  // ── 8. Checklist ──────────────────────────────────────────────────────────
  const checklist = `\n\n---\n\n## Checklist de Qualidade

- [ ] Cores aplicadas corretamente no tailwind.config.js
- [ ] Fontes carregadas via Google Fonts no Layout.astro
- [ ] SEO: título, descrição e keywords preenchidos
- [ ] Schema.org configurado com tipo \`${briefing.schemaTipo || 'LocalBusiness'}\`
- [ ] GTM instalado${briefing.gtmId ? ` (ID: ${briefing.gtmId})` : ' (sem GTM configurado)'}
- [ ] WhatsApp float configurado${briefing.whatsapp ? ` (número: ${briefing.whatsapp})` : ''}
- [ ] Dark mode funcional (ThemeToggle + localStorage)
- [ ] Responsivo em mobile (375px) e tablet (768px)
- [ ] Todas as seções com copy real (sem placeholder genérico)
- [ ] Build sem erros (\`npm run build\`)`

  return [
    header,
    briefingSection,
    depoimentosSection,
    historiaSection,
    faqSection,
    objecoesSection,
    precosSection,
    estruturaSection,
    artSection,
    componentsSection,
    dnaSection,
    instrucoes,
    checklist,
  ].join('')
}
