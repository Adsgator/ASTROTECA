// src/lib/manifest.ts

import type { ProjectConfig, ArtDirectionV2, SelectedComponent, AppSettings, PageSection } from '../types'

export const DEFAULT_TEMPLATE = `> **Como usar:** Abra o Claude Code na raiz do projeto clonado e cole o prompt abaixo seguido do conteúdo deste arquivo.

**Prompt para o Claude Code:**
\`\`\`
Você está implementando o site do cliente {{clientName}} (nicho: {{niche}}).
Leia este manifesto do início ao fim antes de começar. Depois siga passo a passo:

1. Preencha \`src/styles/tokens.css\` com as cores e fontes da seção 3 (apenas os valores — os nomes são fixos)
2. Atualize o \`<link>\` de fonte serifada no \`BaseLayout.astro\` conforme seção 4
3. Preencha \`src/pages/index.astro\` com os imports dos componentes e a ordem das seções (seção 8)
4. Para cada componente da seção 8, substitua os textos placeholder pela copy indicada
5. Preencha \`.env\` com WhatsApp, GTM e domínio (seção 6) — o template já lê essas vars
6. Preencha o \`defaultSchema\` no \`BaseLayout.astro\` com os dados do Schema.org (seção 7)
7. Preencha os ~30 TODOs em \`politica-de-privacidade.astro\` e \`termos-de-uso.astro\` com dados reais do cliente
8. Garanta que Hero tem \`id="hero-section"\`, Footer tem \`id="footer"\`, main tem \`id="main-content"\`
9. Rode \`npm run build\` para validar — corrija qualquer erro antes de considerar pronto

Regras:
- NUNCA hardcode cor, fonte ou tamanho — sempre \`var(--t-*)\` ou classes utilitárias Tailwind
- Dark mode: classe \`.dark\` no \`<html>\` — tokens redefinidos em \`.dark { ... }\` no tokens.css
- \`<Image />\` do Astro, nunca \`<img>\` nativo
- Sem \`any\` no TypeScript
\`\`\`

---

# Manifesto do Projeto — {{clientName}}
**Gerado em:** {{date}}
**Tipo:** {{projectType}}
**Nicho:** {{niche}}
**Objetivo:** {{pageGoal}}

---

## 1. Identidade

| Campo | Valor |
|-------|-------|
| Nome do cliente | {{clientName}} |
| Domínio | {{siteUrl}} |
| Email | {{email}} |
| WhatsApp | {{whatsapp}} |
| Mensagem padrão WA | {{whatsappMessage}} |
| Endereço | {{address}} |
| Horários | {{hours}} |
| Instagram | {{instagram}} |
| Facebook | {{facebook}} |

---

## 2. Configuração Técnica

| Campo | Valor |
|-------|-------|
| GTM ID | {{gtmId}} |
| Schema @type | {{schemaType}} |

---

## 3. Cores — \`src/styles/tokens.css\`

Preencha os **valores** (apenas os valores — os nomes são fixos e não mudam entre projetos):

\`\`\`css
:root {
  --t-primary:      {{colorPrimary}};    /* botões principais, links, destaques */
  --t-primary-dark: {{colorPrimaryDark}};/* hover de botões, variantes escuras */
  --t-secondary:    {{colorSecondary}};  /* acentos, badges, CTA dourado */
  --t-background:   {{colorBackground}};
  --t-surface:      {{colorSurface}};    /* seções alternadas, cards */
  --t-surface-alt:  {{colorSurfaceAlt}};
  --t-dark:         {{colorDark}};       /* footer, blocos escuros */
  --t-text-main:    {{colorText}};       /* texto corrido do corpo */
  --t-text-soft:    {{colorTextSoft}};   /* subtítulos, labels */
  --t-text-muted:   {{colorTextMuted}}; /* metadados, timestamps, placeholders */
  --t-border:       {{colorBorder}};
  --t-font-serif:   "{{fontHeading}}", Georgia, ui-serif, serif;
  --t-font-sans:    "{{fontBody}}", ui-sans-serif, system-ui, sans-serif;
}

/* Paleta dark — Claude preenche com variantes escuras das mesmas cores */
.dark {
  --t-background:   /* bg escuro derivado de {{colorBackground}} */;
  --t-surface:      /* surface escuro */;
  --t-surface-alt:  /* surface-alt escuro */;
  --t-dark:         /* versão mais escura ainda */;
  --t-border:       /* borda sutil no escuro */;
  --t-text-main:    /* texto claro no escuro */;
  --t-text-soft:    /* texto suave no escuro */;
  --t-text-muted:   /* texto muted no escuro */;
}
\`\`\`

## 3.1 Direção Artística

| Campo | Valor |
|-------|-------|
| Tom / Mood | {{mood}} |
| Tema padrão | {{defaultTheme}} |
| Referências visuais | {{references}} |
| Notas adicionais | {{notes}} |

---

## 4. Tipografia — \`BaseLayout.astro\`

### Fonte serifada (títulos): **{{fontHeading}}**

No \`BaseLayout.astro\`, substitua o \`<link rel="preload">\` de fonte:
\`\`\`html
<link rel="preload"
  href="https://fonts.googleapis.com/css2?family={{fontHeadingEncoded}}&display=swap"
  as="style" onload="this.onload=null;this.rel='stylesheet'" />
\`\`\`

### Fonte sans (corpo): **{{fontBody}}**

No \`global.css\`, substitua os imports:
\`\`\`css
@import '@fontsource/{{fontBodySlug}}/300.css';
@import '@fontsource/{{fontBodySlug}}/400.css';
@import '@fontsource/{{fontBodySlug}}/500.css';
\`\`\`
(instale: \`npm install @fontsource/{{fontBodySlug}}\`)

---

## 5. SEO — \`BaseLayout.astro\`

Substitua os defaults no frontmatter:

\`\`\`astro
title = '{{seoTitle}}'
description = '{{seoDescription}}'
keywords = '{{seoKeywords}}'
canonical = '{{siteUrl}}'
\`\`\`

---

## 6. GTM e WhatsApp — \`.env\`

Preencha o arquivo \`.env\` na raiz do projeto:
\`\`\`env
PUBLIC_SITE_URL={{siteUrl}}
PUBLIC_GTM_ID={{gtmId}}
PUBLIC_WA_NUMBER={{whatsapp}}
PUBLIC_WA_MESSAGE={{whatsappMessage}}
\`\`\`

O \`BaseLayout.astro\` e o \`WhatsAppFloat.astro\` já leem essas variáveis automaticamente. Não hardcode no código.

---

## 7. Schema.org — \`BaseLayout.astro\`

Substitua o \`defaultSchema\`:

\`\`\`js
const defaultSchema = {
  "@context": "https://schema.org",
  "@type": "{{schemaType}}",
  "name": "{{clientName}}",
  "description": "{{seoDescription}}",
  "url": "{{siteUrl}}",
  "telephone": "{{whatsapp}}",
  "email": "{{email}}",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{{address}}"
  },
  "openingHours": ["{{hours}}"],
  "sameAs": [
    {{socialLinks}}
  ]
}
\`\`\`

---

## 8. Componentes — \`src/pages/index.astro\`

Os componentes já foram copiados para \`src/components/sections/\`. O \`index.astro\` já tem os imports e a ordem.

### Estrutura padrão de componente Adsgator

\`\`\`astro
---
interface Props { title: string; description: string }
const { title, description } = Astro.props
---
<section id="nome-secao" class="section-py">
  <div class="container-wide">
    <h2 class="font-serif text-display-md text-text-main">{title}</h2>
    <p class="text-body-lg text-text-soft">{description}</p>
  </div>
</section>
\`\`\`

Tokens de layout: \`section-py\`, \`container-wide\`, \`container-content\`, \`font-serif\`,
\`text-display-xl/lg/md/sm\`, \`text-body-lg/md/sm\`, \`text-text-main/soft/muted\`,
\`bg-primary\`, \`bg-surface\`, \`bg-dark\`, \`shadow-card\`, \`shadow-float\`.

### IDs obrigatórios

- Hero deve ter \`id="hero-section"\` (WhatsAppFloat depende disso)
- Footer deve ter \`id="footer"\`
- Cada seção com \`id\` igual ao item de menu correspondente

### Seções disponíveis (na ordem da página):

{{components}}

Para cada seção, substitua o copy placeholder pelos textos reais. Mantenha o tom adequado ao nicho ({{niche}}) e objetivo ({{pageGoal}}).

---

## 9. Imagens

Substitua as imagens placeholder em \`/public/\` pelos arquivos reais:
- Hero: \`hero.webp\` (1920×1080 px)
- Sobre: \`sobre.webp\` (800×600 px)
- OG image: \`og-image.webp\` (1200×630 px)
- Favicon: \`favicon.svg\`

---

## 10. Checklist Final

Marque cada item conforme implementar:

- [ ] \`npm run build\` sem erros de TypeScript/Astro
- [ ] Responsividade mobile (375px): texto hero ≥ 20px, botões ≥ 44px altura, padding lateral ≥ 20px
- [ ] Hero com \`id="hero-section"\`; Footer com \`id="footer"\`; main com \`id="main-content"\`
- [ ] Header: esconde ao rolar para baixo; link ativo por IntersectionObserver
- [ ] WhatsApp flutuante: some quando Hero ou Footer estão visíveis; número real no \`.env\`
- [ ] Dark mode: toggle no Footer; persiste localStorage; sem flash na primeira carga
- [ ] Dark mode: todos os backgrounds e textos mudam ao ativar o toggle
- [ ] \`politica-de-privacidade.astro\` e \`termos-de-uso.astro\`: TODOs preenchidos com dados reais
- [ ] SEO: title, description, OG, canonical, Schema.org JSON-LD
- [ ] Sitemap gerado (\`/sitemap-index.xml\` acessível)
- [ ] Links de CTA funcionando (WhatsApp, formulário, âncoras)
- [ ] Smooth scroll funcionando entre seções
- [ ] GTM disparando (verifique no GTM Preview Mode)
- [ ] Imagens sem 404; \`alt\` em todas as \`<Image />\`

---

*Gerado por {{studioName}} em {{date}}*
`

function renderTemplate(template: string, vars: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(vars)) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    result = result.replace(new RegExp(`\\{\\{${escapedKey}\\}\\}`, 'g'), value)
  }
  // Remove blocos condicionais vazios: {{#key}}...{{/key}}
  result = result.replace(/\{\{#\w+\}\}[\s\S]*?\{\{\/\w+\}\}/g, match => {
    const keyMatch = match.match(/\{\{#(\w+)\}\}/)
    if (!keyMatch) return ''
    const key = keyMatch[1]
    const value = vars[key]
    if (!value || value.trim() === '') return ''
    return match.replace(/\{\{#\w+\}\}/, '').replace(/\{\{\/\w+\}\}/, '')
  })
  return result
}

function buildComponentsSection(components: SelectedComponent[]): string {
  if (components.length === 0) return '_Nenhum componente selecionado_'

  return components
    .map((comp, i) => {
      const copy = comp.copy || {}
      const copyLines = Object.entries(copy)
        .filter(([, v]) => v.trim() !== '')
        .map(([k, v]) => `  - **${k}:** ${v}`)
        .join('\n')

      return `### Seção ${i + 1} — \`${comp.meta.id}\`
**Componente:** ${comp.meta.name}
**Descrição:** ${comp.meta.description}
${copyLines ? `\n**Copy / Textos:**\n${copyLines}` : '\n_Preencha os textos desta seção conforme o cliente._'}`
    })
    .join('\n\n')
}

function buildSocialLinks(project: ProjectConfig): string {
  const links: string[] = []
  if (project.instagram) links.push(`"${project.instagram}"`)
  if (project.facebook) links.push(`"${project.facebook}"`)
  return links.join(',\n    ')
}

/** Converte nome de fonte para slug @fontsource (ex: "DM Sans" → "dm-sans") */
function fontToSlug(font: string): string {
  return font
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

/** Converte nome de fonte para URL do Google Fonts (ex: "Cormorant Garamond" → "Cormorant+Garamond") */
function fontToGoogleEncoded(font: string): string {
  return font.replace(/\s+/g, '+')
}

export function generateManifest(
  project: ProjectConfig,
  artDirection: ArtDirectionV2,
  components: SelectedComponent[],
  settings: AppSettings
): string {
  const { manifestTemplate, studioName } = settings

  const template = manifestTemplate?.trim() ? manifestTemplate : DEFAULT_TEMPLATE

  const vars: Record<string, string> = {
    // Projeto
    clientName:        project.clientName,
    date:              new Intl.DateTimeFormat('pt-BR').format(new Date()),
    projectType:       project.projectType,
    niche:             project.niche,
    pageGoal:          project.pageGoal,
    siteUrl:           project.siteUrl || '—',
    email:             project.email || '—',
    whatsapp:          project.whatsapp || '—',
    whatsappMessage:   project.whatsappMessage || 'Olá! Vim pelo site e gostaria de mais informações.',
    address:           project.address || '—',
    hours:             project.hours || 'Mo-Fr 09:00-18:00',
    instagram:         project.instagram || '',
    facebook:          project.facebook || '',
    gtmId:             project.gtmId || '',
    schemaType:        project.schemaType || 'LocalBusiness',
    // SEO
    seoTitle:          project.seoTitle || project.clientName,
    seoDescription:    project.seoDescription || '—',
    seoKeywords:       project.seoKeywords || '—',
    // Cores
    colorPrimary:      artDirection.colorPrimary,
    colorPrimaryDark:  artDirection.colorPrimaryDark,
    colorSecondary:    artDirection.colorSecondary,
    colorBackground:   artDirection.colorBackground,
    colorSurface:      artDirection.colorSurface,
    colorSurfaceAlt:   artDirection.colorSurfaceAlt,
    colorDark:         artDirection.colorDark,
    colorText:         artDirection.colorText,
    colorTextSoft:     artDirection.colorTextSoft,
    colorTextMuted:    artDirection.colorTextMuted,
    colorBorder:       artDirection.colorBorder,
    // Tipografia
    fontHeading:          artDirection.fontHeading,
    fontHeadingEncoded:   `family=${fontToGoogleEncoded(artDirection.fontHeading)}:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500`,
    fontBody:             artDirection.fontBody,
    fontBodySlug:         fontToSlug(artDirection.fontBody),
    // Direção artística
    mood:                 artDirection.mood || '—',
    defaultTheme:         artDirection.defaultTheme || 'light',
    references:           artDirection.references || '—',
    notes:                artDirection.notes || '—',
    // Componentes
    components:        buildComponentsSection(components),
    socialLinks:       buildSocialLinks(project),
    studioName:        studioName || 'Astroteca',
  }

  return renderTemplate(template, vars)
}

// ─── Manifesto do Path C (biblioteca + criar componentes) ─────────────────────

/**
 * Gera o MANIFESTO.md para o Path C:
 * - Seções fromLibrary → componentes já copiados, só adaptar copy
 * - Seções sem componente → Claude Code cria do zero seguindo COMPONENT-BLUEPRINT.md
 */
export function generateCreateManifest(opts: {
  project: ProjectConfig
  artDirection: ArtDirectionV2
  sections: PageSection[]
  libraryComponents: SelectedComponent[]
  settings: AppSettings
}): string {
  const { project, artDirection, sections, libraryComponents, settings } = opts
  const studioName = settings.studioName || 'Astroteca'
  const date = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(new Date())

  const enabled = sections.filter(s => s.enabled).sort((a, b) => a.position - b.position)
  const libSections = enabled.filter(s => s.fromLibrary && s.componentId)
  const createSections = enabled.filter(s => !(s.fromLibrary && s.componentId))

  // ── Seção de componentes da biblioteca ──────────────────────────────────────
  let libBlock = ''
  if (libSections.length > 0) {
    libBlock = '\n\n---\n\n## Componentes da Biblioteca (já copiados)\n\n'
    libBlock += 'Estes componentes foram copiados para `src/components/sections/`. **Não reescreva** — apenas adapte a copy indicada abaixo.\n\n'
    for (const s of libSections) {
      const meta = libraryComponents.find(c => c.meta.id === s.componentId)
      libBlock += `### ${s.label} (\`${s.componentId}\`)\n\n`
      if (meta) libBlock += `**Arquivo:** \`src/components/sections/${meta.meta.componentFile || `${meta.meta.category}/${meta.meta.name}.astro`}\`\n\n`
      const copyEntries = Object.entries(s.copy).filter(([, v]) => v?.trim())
      if (copyEntries.length > 0) {
        libBlock += '| Campo | Texto |\n|-------|-------|\n'
        for (const [k, v] of copyEntries) libBlock += `| ${k} | ${v} |\n`
      } else {
        libBlock += '_Nenhuma copy pré-definida — adapte pelo briefing do cliente._\n'
      }
      libBlock += '\n'
    }
  }

  // ── Seção de componentes a criar ─────────────────────────────────────────
  let createBlock = ''
  if (createSections.length > 0) {
    createBlock = '\n\n---\n\n## Componentes a Criar\n\n'
    createBlock += `Estas seções **não** têm componente na biblioteca e devem ser criadas do zero.\n`
    createBlock += `Siga o \`COMPONENT-BLUEPRINT.md\` (incluído neste repositório) para estrutura, tokens e padrões.\n\n`
    for (const s of createSections) {
      createBlock += `### ${s.label}\n\n`
      createBlock += `**ID da seção:** \`${s.id}\`\n`
      createBlock += `**Arquivo a criar:** \`src/components/sections/${s.type}/${s.label.replace(/\s+/g, '')}.astro\`\n\n`
      const copyEntries = Object.entries(s.copy).filter(([, v]) => v?.trim())
      if (copyEntries.length > 0) {
        createBlock += '**Copy / Textos:**\n\n'
        createBlock += '| Campo | Texto |\n|-------|-------|\n'
        for (const [k, v] of copyEntries) createBlock += `| ${k} | ${v} |\n`
      } else {
        createBlock += '_Copy não preenchida — crie baseado no briefing do cliente._\n'
      }
      createBlock += '\n'
    }
  }

  // ── Ordem final da página ────────────────────────────────────────────────
  const orderLines = enabled.map((s, i) => {
    const fromLib = s.fromLibrary && s.componentId
    return `${i + 1}. **${s.label}**${fromLib ? ` — biblioteca (\`${s.componentId}\`)` : ' — criar'}`
  }).join('\n')

  const orderBlock = `\n\n---\n\n## Ordem das Seções na Página\n\n${orderLines}`

  // ── Cores ────────────────────────────────────────────────────────────────
  const colorsBlock = `\n\n---\n\n## Tokens de Cor — \`src/styles/tokens.css\`

Preencha **apenas os valores** (nomes são fixos):

\`\`\`css
:root {
  --t-primary:      ${artDirection.colorPrimary};
  --t-primary-dark: ${artDirection.colorPrimaryDark};
  --t-secondary:    ${artDirection.colorSecondary};
  --t-background:   ${artDirection.colorBackground};
  --t-surface:      ${artDirection.colorSurface};
  --t-surface-alt:  ${artDirection.colorSurfaceAlt};
  --t-dark:         ${artDirection.colorDark};
  --t-text-main:    ${artDirection.colorText};
  --t-text-soft:    ${artDirection.colorTextSoft};
  --t-text-muted:   ${artDirection.colorTextMuted};
  --t-border:       ${artDirection.colorBorder};
  --t-font-serif:   "${artDirection.fontHeading}", Georgia, ui-serif, serif;
  --t-font-sans:    "${artDirection.fontBody}", ui-sans-serif, system-ui, sans-serif;
}

.dark {
  --t-background:  ${artDirection.darkColorBackground || '/* derivar */'};
  --t-surface:     ${artDirection.darkColorSurface || '/* derivar */'};
  --t-surface-alt: ${artDirection.darkColorSurfaceAlt || '/* derivar */'};
  --t-text-main:   ${artDirection.darkColorText || '/* derivar */'};
  --t-text-soft:   ${artDirection.darkColorTextSoft || '/* derivar */'};
  --t-text-muted:  ${artDirection.darkColorTextMuted || '/* derivar */'};
  --t-border:      ${artDirection.darkColorBorder || '/* derivar */'};
}
\`\`\``

  // ── Dados do cliente ─────────────────────────────────────────────────────
  const clientBlock = `\n\n---\n\n## Identidade do Cliente

| Campo | Valor |
|-------|-------|
| Nome | ${project.clientName} |
| Domínio | ${project.siteUrl || '—'} |
| WhatsApp | ${project.whatsapp || '—'} |
| Mensagem WA | ${project.whatsappMessage || '—'} |
| Email | ${project.email || '—'} |
| GTM ID | ${project.gtmId || '—'} |
| Schema | ${project.schemaType || 'LocalBusiness'} |`

  // ── Prompt de instrução ──────────────────────────────────────────────────
  const promptBlock = `> **Como usar:** Abra o Claude Code na raiz do projeto clonado e cole o prompt abaixo.

**Prompt para o Claude Code:**
\`\`\`
Você está implementando o site do cliente ${project.clientName}.
Leia este manifesto e o COMPONENT-BLUEPRINT.md antes de qualquer edição. Depois:

1. Preencha \`src/styles/tokens.css\` com as cores da seção "Tokens de Cor"
2. Atualize o \`<link>\` de fonte serifada no \`BaseLayout.astro\`: fonte heading = ${artDirection.fontHeading}
3. Para fontes sans, instale e importe @fontsource/${fontToSlug(artDirection.fontBody)} no global.css
4. Para os componentes da biblioteca (seção "Componentes da Biblioteca"): adapte apenas a copy
5. Para os componentes a criar (seção "Componentes a Criar"): crie cada um seguindo o COMPONENT-BLUEPRINT.md
6. Monte \`src/pages/index.astro\` com a ordem definida em "Ordem das Seções"
7. Preencha \`.env\`: PUBLIC_WA_NUMBER, PUBLIC_WA_MESSAGE, PUBLIC_GTM_ID, PUBLIC_SITE_URL
8. Preencha o Schema.org no \`BaseLayout.astro\` com os dados de "Identidade do Cliente"
9. Preencha os TODOs em politica-de-privacidade.astro e termos-de-uso.astro
10. Rode \`npm run build\` — corrija qualquer erro antes de considerar pronto

Regras: NUNCA hardcode cor/fonte/tamanho. Sempre var(--t-*) ou classes Tailwind.
IDs obrigatórios: Hero → id="hero-section", Footer → id="footer", main → id="main-content"
\`\`\`

---

# Manifesto do Projeto — ${project.clientName}
**Gerado em:** ${date} por ${studioName}
**Nicho:** ${project.niche || '—'}
**Objetivo:** ${project.pageGoal || '—'}`

  return [
    promptBlock,
    clientBlock,
    colorsBlock,
    orderBlock,
    libBlock,
    createBlock,
  ].join('')
}
