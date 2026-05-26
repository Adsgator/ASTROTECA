// src/lib/manifest.ts

import type { ProjectConfig, ArtDirection, SelectedComponent, AppSettings } from '../types'

export const DEFAULT_TEMPLATE = `# Projeto: {{clientName}}
**Gerado em:** {{date}}
**Tipo:** {{projectType}}
**Nicho:** {{niche}}
**Objetivo da pagina:** {{pageGoal}}
**URL do site:** {{siteUrl}}
**Google Analytics:** {{googleAnalyticsId}}
**Namespace npm:** {{npmNamespace}}

---

## Direcao de Arte

| Item | Valor |
|------|-------|
| Primary | {{colorPrimary}} |
| Secondary | {{colorSecondary}} |
| Background | {{colorBackground}} |
| Texto | {{colorText}} |
| Heading font | {{fontHeading}} |
| Body font | {{fontBody}} |
| Mood | {{mood}} |
| Referencias | {{references}} |

{{#notes}}
### Notas
{{notes}}
{{/notes}}

---

## Componentes Selecionados

{{components}}

---

## Instrucoes para o Claude Code

1. Duplicar a pasta base e renomear para \`{{repoName}}\`
2. Rodar \`npm install\`
3. Criar \`src/styles/theme.css\` com as variaveis CSS abaixo:
\`\`\`css
:root {
  --color-primary: {{colorPrimary}};
  --color-secondary: {{colorSecondary}};
  --color-bg: {{colorBackground}};
  --color-text: {{colorText}};
  --font-heading: '{{fontHeading}}', serif;
  --font-body: '{{fontBody}}', sans-serif;
}
\`\`\`
4. Implementar os componentes na ordem listada acima
5. Preencher cada componente com o copy correspondente
6. Colocar imagens na pasta \`/public/\` com os nomes referenciados
7. Rodar \`npm run dev\` e validar responsividade em mobile e desktop
8. Fazer build com \`npm run build\` e confirmar zero erros

---

**Gerado por:** {{studioName}}
`

function renderTemplate(template: string, vars: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
  }
  // Remove blocos condicionais vazios: {{#notes}}...{{/notes}}
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

      return `### Secao ${i + 1} — \`${comp.meta.id}\`
**Componente:** ${comp.meta.name}
${copyLines ? `\n**Copy / Props:**\n${copyLines}` : ''}`
    })
    .join('\n\n')
}

export function generateManifest(
  project: ProjectConfig,
  artDirection: ArtDirection,
  components: SelectedComponent[],
  settings: AppSettings
): string {
  const { manifestTemplate, studioName, npmNamespace } = settings

  const template = manifestTemplate?.trim() ? manifestTemplate : DEFAULT_TEMPLATE

  const repoName = project.clientName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const vars: Record<string, string> = {
    clientName:        project.clientName,
    date:              new Intl.DateTimeFormat('pt-BR').format(new Date()),
    projectType:       project.projectType,
    niche:             project.niche,
    pageGoal:          project.pageGoal,
    googleAnalyticsId: project.googleAnalyticsId || '—',
    siteUrl:           project.siteUrl || '—',
    npmNamespace:      npmNamespace || '—',
    repoName,
    colorPrimary:      artDirection.colorPrimary,
    colorSecondary:    artDirection.colorSecondary,
    colorBackground:   artDirection.colorBackground,
    colorText:         artDirection.colorText,
    fontHeading:       artDirection.fontHeading,
    fontBody:          artDirection.fontBody,
    mood:              artDirection.mood,
    references:        artDirection.references || '—',
    notes:             artDirection.notes || '',
    components:        buildComponentsSection(components),
    studioName:        studioName || 'Astro Component Studio',
  }

  return renderTemplate(template, vars)
}
