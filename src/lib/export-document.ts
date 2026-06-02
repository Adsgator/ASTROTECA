// src/lib/export-document.ts

import type { BuilderState, AppSettingsV2 } from '../types'
import { getDNAByType } from './dna'

export function generateDocument(state: BuilderState, settings: AppSettingsV2): string {
  const { briefing, sections, art, selected } = state
  const studioName = settings.studioName || 'Astroteca'
  const date = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  })

  const enabledSections = sections.filter(s => s.enabled).sort((a, b) => a.position - b.position)

  // ── 1. Header ──────────────────────────────────────────────────────────────
  const header = `> **Como usar:** Abra o Claude Code na raiz do projeto clonado e cole o prompt abaixo seguido do conteúdo deste arquivo.

**Prompt para o Claude Code:**
\`\`\`
Você está implementando o site do cliente ${briefing.nomeCliente} (segmento: ${briefing.segmento}).
Leia este documento do início ao fim antes de começar. Depois siga passo a passo:

1. Preencha \`src/styles/tokens.css\` com as cores da seção "Direção de Arte" (apenas os valores — os nomes são fixos)
2. Atualize o \`<link>\` de fonte serifada no \`BaseLayout.astro\` conforme a tipografia indicada
3. Preencha \`src/pages/index.astro\` com imports dos componentes e ordem das seções
4. Para cada seção, substitua os textos placeholder pela copy indicada neste documento
5. Preencha \`.env\` com WhatsApp, GTM e domínio — o template já lê essas variáveis
6. Preencha o \`defaultSchema\` no \`BaseLayout.astro\` com os dados do Schema.org
7. Preencha os TODOs em \`politica-de-privacidade.astro\` e \`termos-de-uso.astro\` com dados reais
8. Garanta: Hero com \`id="hero-section"\`, Footer com \`id="footer"\`, main com \`id="main-content"\`
9. Rode \`npm run build\` para validar — corrija qualquer erro antes de considerar pronto

Regras absolutas:
- NUNCA hardcode cor, fonte ou tamanho — sempre \`var(--t-*)\` ou classes utilitárias Tailwind
- \`<Image />\` do Astro, nunca \`<img>\` nativo
- Sem \`any\` no TypeScript, sem \`!important\` no CSS
- Tema padrão: ${art.defaultTheme === 'dark' ? 'escuro (classe "dark" no <html> via BaseLayout)' : 'claro (padrão)'}
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

  const historiaSection = briefing.historia
    ? `\n\n### História / Sobre\n\n${briefing.historia}`
    : ''

  const faqSection = briefing.faq
    ? `\n\n### FAQ\n\n${briefing.faq}`
    : ''

  const objecoesSection = briefing.objecoes
    ? `\n\n### Objeções a Quebrar\n\n${briefing.objecoes}`
    : ''

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
      const fromLib = section.fromLibrary && section.componentId
      estruturaSection += `### ${section.position + 1}. ${section.label}`
      if (fromLib) {
        estruturaSection += ` _(componente da biblioteca: \`${section.componentId}\`)_`
      }
      estruturaSection += '\n\n'
      const copyEntries = Object.entries(section.copy).filter(([, v]) => v && String(v).trim())
      if (copyEntries.length > 0) {
        estruturaSection += '| Campo | Texto |\n|-------|-------|\n'
        for (const [key, value] of copyEntries) {
          estruturaSection += `| ${key} | ${value} |\n`
        }
      } else {
        estruturaSection += '_Copy não preenchido — Claude Code deve criar com base no briefing._\n'
      }
      estruturaSection += '\n'
    }
  }

  // ── 4. Direção de Arte ────────────────────────────────────────────────────
  const artSection = `\n\n---\n\n## Direção de Arte

### Tema Padrão
**${art.defaultTheme === 'dark' ? 'Escuro' : 'Claro'}**

### Cores — \`src/styles/tokens.css\`

Preencha **apenas os valores** (os nomes são fixos entre projetos):

\`\`\`css
:root {
  --t-primary:      ${art.colorPrimary};
  --t-primary-dark: ${art.colorPrimaryDark};
  --t-secondary:    ${art.colorSecondary};
  --t-background:   ${art.colorBackground};
  --t-surface:      ${art.colorSurface};
  --t-surface-alt:  ${art.colorSurfaceAlt};
  --t-dark:         ${art.colorDark};
  --t-text-main:    ${art.colorText};
  --t-text-soft:    ${art.colorTextSoft};
  --t-text-muted:   ${art.colorTextMuted};
  --t-border:       ${art.colorBorder};
}

.dark {
  --t-background:  ${art.darkColorBackground || '/* derivar do --t-background */'};
  --t-surface:     ${art.darkColorSurface || '/* derivar do --t-surface */'};
  --t-surface-alt: ${art.darkColorSurfaceAlt || '/* derivar do --t-surface-alt */'};
  --t-text-main:   ${art.darkColorText || '/* derivar do --t-text-main */'};
  --t-text-soft:   ${art.darkColorTextSoft || '/* derivar do --t-text-soft */'};
  --t-text-muted:  ${art.darkColorTextMuted || '/* derivar do --t-text-muted */'};
  --t-border:      ${art.darkColorBorder || '/* derivar do --t-border */'};
}
\`\`\`

### Tipografia

| Papel | Fonte |
|-------|-------|
| Heading (\`font-serif\`) | ${art.fontHeading || '—'} |
| Body (\`font-sans\`) | ${art.fontBody || '—'} |

${art.mood ? `### Mood & Referências\n\n${art.mood}` : ''}
${art.references ? `\n**Referências visuais:** ${art.references}` : ''}
${art.notes ? `\n**Notas:** ${art.notes}` : ''}`

  // ── 5. Componentes da Biblioteca ──────────────────────────────────────────
  let componentsSection = ''
  if (selected.length > 0) {
    componentsSection = '\n\n---\n\n## Componentes da Biblioteca\n\n'
    componentsSection += 'Os arquivos abaixo já foram copiados para `src/components/sections/`. Não reinstale — edite diretamente.\n\n'
    componentsSection += '| # | ID | Nome | Categoria |\n|---|----|----|--------|\n'
    for (const s of selected) {
      componentsSection += `| ${s.position + 1} | \`${s.meta.id}\` | ${s.meta.name} | ${s.meta.category} |\n`
    }
  }

  // ── 6. DNA ────────────────────────────────────────────────────────────────
  const dnaSection = `\n\n---\n\n## Regras de Copy — DNA do Negócio\n\n${getDNAByType(briefing.tipo)}`

  // ── 7. Checklist ──────────────────────────────────────────────────────────
  const checklist = `\n\n---\n\n## Checklist Final

- [ ] \`npm run build\` sem erros de TypeScript/Astro
- [ ] \`src/styles/tokens.css\` preenchido com cores reais do cliente
- [ ] Fontes carregadas: \`<link>\` no \`BaseLayout.astro\` + import \`@fontsource\` no \`global.css\`
- [ ] \`.env\` preenchido: \`PUBLIC_WA_NUMBER\`, \`PUBLIC_WA_MESSAGE\`, \`PUBLIC_GTM_ID\`, \`PUBLIC_SITE_URL\`
- [ ] \`BaseLayout.astro\`: title, description, OG, canonical, Schema.org JSON-LD
- [ ] Hero com \`id="hero-section"\`; Footer com \`id="footer"\`; main com \`id="main-content"\`
- [ ] Header: esconde ao rolar para baixo; link ativo por IntersectionObserver
- [ ] WhatsApp flutuante: some quando Hero ou Footer estão visíveis; número real no \`.env\`
- [ ] Dark mode: toggle no Footer; persiste localStorage; sem flash na primeira carga
- [ ] Todas as seções com copy real (sem placeholder genérico)
- [ ] Responsivo em mobile (375px): texto ≥ 20px, botões ≥ 44px, padding lateral ≥ 20px
- [ ] \`politica-de-privacidade.astro\` e \`termos-de-uso.astro\`: TODOs preenchidos
- [ ] Schema tipo: \`${briefing.schemaTipo || 'LocalBusiness'}\`
- [ ] GTM configurado${briefing.gtmId ? ` (ID: ${briefing.gtmId})` : ' (sem GTM — preencher no .env)'}
- [ ] WhatsApp${briefing.whatsapp ? ` (número: ${briefing.whatsapp})` : ' (número não informado — preencher no .env)'}`

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
    checklist,
  ].join('')
}
