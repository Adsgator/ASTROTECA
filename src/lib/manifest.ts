// src/lib/manifest.ts

import type { ProjectConfig, ArtDirection, SelectedComponent, AppSettings } from '../types'

export const DEFAULT_TEMPLATE = `# Manifesto do Projeto — {{clientName}}
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

## 3. Cores — tailwind.config.js

Substitua **apenas os valores** mantendo os nomes dos tokens:

\`\`\`js
colors: {
  primary:        '{{colorPrimary}}',
  'primary-dark': '{{colorPrimaryDark}}',
  secondary:      '{{colorSecondary}}',
  complement:     '#f9f395',      // ajuste se necessário
  background:     '{{colorBackground}}',
  surface:        '{{colorSurface}}',
  'surface-alt':  '{{colorSurfaceAlt}}',
  dark:           '{{colorDark}}',
  'text-main':    '{{colorText}}',
  'text-soft':    '{{colorTextSoft}}',
  'text-muted':   '{{colorTextMuted}}',
  border:         '{{colorBorder}}',
  wa:             '#25D366',
},
\`\`\`

Atualize também as sombras coloridas para refletir a cor primária e secundária:
\`\`\`js
'primary-sm':   '0 4px 14px {{colorPrimary}}40',
'primary-md':   '0 8px 24px {{colorPrimary}}4d',
'secondary-sm': '0 4px 15px {{colorSecondary}}40',
'secondary-md': '0 8px 25px {{colorSecondary}}59',
\`\`\`

---

## 4. Tipografia — global.css

### Fonte serif (headings) — carregada via Google Fonts no Layout.astro

Fonte: **{{fontHeading}}**

No \`Layout.astro\`, substitua a URL do Google Fonts:
\`\`\`html
<link rel="preload"
  href="https://fonts.googleapis.com/css2?family={{fontHeadingEncoded}}&display=swap"
  as="style" onload="this.onload=null;this.rel='stylesheet'" />
\`\`\`

No \`tailwind.config.js\`:
\`\`\`js
fontFamily: {
  serif: ['"{{fontHeading}}"', 'Georgia', 'ui-serif', 'serif'],
  sans:  ['"{{fontBody}}"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
},
\`\`\`

### Fonte sans (corpo) — carregada via @fontsource no global.css

Fonte: **{{fontBody}}**

No \`global.css\`, substitua os imports @fontsource:
\`\`\`css
@import '@fontsource/{{fontBodySlug}}/300.css';
@import '@fontsource/{{fontBodySlug}}/400.css';
@import '@fontsource/{{fontBodySlug}}/500.css';
\`\`\`
(instale com: \`npm install @fontsource/{{fontBodySlug}}\`)

---

## 5. SEO — Layout.astro

Substitua os defaults no frontmatter do \`Layout.astro\`:

\`\`\`astro
title = '{{seoTitle}}'
description = '{{seoDescription}}'
keywords = '{{seoKeywords}}'
ogTitle = '{{seoTitle}}'
ogDescription = '{{seoDescription}}'
canonical = '{{siteUrl}}'
\`\`\`

---

## 6. GTM e WhatsApp — Layout.astro

No \`Layout.astro\`:
\`\`\`astro
const GTM_ID = '{{gtmId}}'
\`\`\`

No \`WhatsAppFloat.astro\` (ou equivalente), configure o número:
\`\`\`astro
const WA_NUMBER = '{{whatsapp}}'  // só números, com código do país
const WA_MESSAGE = encodeURIComponent('{{whatsappMessage}}')
\`\`\`

---

## 7. Schema.org — Layout.astro

Substitua o \`defaultSchema\` no \`Layout.astro\`:

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

## 8. Componentes — index.astro

Os componentes já foram copiados para \`src/components/\`. O \`src/pages/index.astro\` já foi gerado com os imports e a ordem correta.

Seções disponíveis (na ordem da página):

{{components}}

Para cada seção, substitua o copy placeholder pelos textos reais do cliente conforme indicado abaixo. Mantenha o estilo e tom adequado ao nicho ({{niche}}) e objetivo ({{pageGoal}}).

---

## 9. Imagens

Substitua as imagens placeholder em \`/public/\` pelos arquivos reais. Formatos recomendados:
- Hero: \`hero.webp\` (1920×1080 px)
- Sobre: \`sobre.webp\` (800×600 px)
- OG image: \`og-image.webp\` (1200×630 px)
- Favicon: \`favicon.svg\`

---

## 10. Checklist Final

Antes de entregar, valide:
- [ ] \`npm run dev\` sem erros no terminal
- [ ] \`npm run build\` sem erros de TypeScript/Astro
- [ ] Responsividade: mobile (375px), tablet (768px), desktop (1280px)
- [ ] Links de CTA funcionando (WhatsApp, formulário, etc.)
- [ ] Smooth scroll funcionando entre seções
- [ ] GTM disparando (verifique no GTM Preview Mode)
- [ ] Meta tags corretas no \`<head>\`
- [ ] Imagens otimizadas e sem 404
- [ ] Schema.org válido (teste em schema.org/validator)

---

*Gerado por {{studioName}} em {{date}}*
`

function renderTemplate(template: string, vars: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
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
  artDirection: ArtDirection,
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
    gtmId:             project.gtmId || 'GTM-XXXXXXX',
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
    // Componentes
    components:        buildComponentsSection(components),
    socialLinks:       buildSocialLinks(project),
    studioName:        studioName || 'Astroteca',
  }

  return renderTemplate(template, vars)
}
