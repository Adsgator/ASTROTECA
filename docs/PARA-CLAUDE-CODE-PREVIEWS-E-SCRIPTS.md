# Instruções para o Claude Code — Previews e Scripts de Automação

## Contexto do projeto

Este é o projeto **Astroteca** — uma biblioteca visual de componentes Astro para landing pages.

A estrutura atual de pastas é esta (tudo dentro do mesmo projeto):

```
astroteca/                          ← raiz do projeto
├── src/
│   ├── components/                 ← componentes React (islands)
│   │   ├── AdminForm.tsx
│   │   ├── Builder.tsx
│   │   ├── ComponentBrowser.tsx
│   │   └── ConfigPanel.tsx
│   ├── layouts/
│   │   └── AppLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── builder.astro
│   │   ├── admin.astro
│   │   ├── config.astro
│   │   ├── api/
│   │   │   ├── publish-component.ts
│   │   │   └── create-project.ts
│   │   └── preview/
│   │       └── [...slug].astro     ← existe mas não funciona
│   ├── lib/
│   │   ├── github.ts
│   │   ├── manifest.ts
│   │   └── utils.ts
│   ├── styles/
│   │   └── app.css
│   └── types/
│       └── index.ts
│
├── minha-lib-astro/                ← componentes Astro reais (pasta local)
│   ├── src/
│   │   └── components/             ← pode estar vazia ou com alguns componentes
│   └── registry.json               ← catálogo dos componentes
│
├── _base-project/                  ← template para projetos de clientes
│   └── (estrutura base Astro)
│
├── public/
│   └── (assets públicos)
│
├── package.json
├── astro.config.mjs
└── tailwind.config.mjs
```

---

## O problema atual

O Astroteca está funcionando e mostrando os componentes do `registry.json`, mas **os previews não aparecem** porque:

1. A rota `src/pages/preview/[...slug].astro` não está implementada corretamente
2. Não existem páginas de preview individuais para cada componente
3. Não existe a pasta `public/preview-assets/` com imagens placeholder
4. Não existem scripts de automação para adicionar e extrair componentes

---

## O que precisa ser feito (em ordem)

### TAREFA 1 — Criar a pasta de assets de preview

Crie a pasta `public/preview-assets/` e dentro dela crie um arquivo SVG placeholder que será usado como imagem genérica nos previews.

Crie o arquivo `public/preview-assets/placeholder.svg`:

```svg
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#f3f4f6"/>
  <rect x="200" y="150" width="400" height="300" rx="12" fill="#e5e7eb"/>
  <rect x="300" y="220" width="200" height="16" rx="8" fill="#d1d5db"/>
  <rect x="250" y="252" width="300" height="12" rx="6" fill="#e5e7eb"/>
  <rect x="270" y="276" width="260" height="12" rx="6" fill="#e5e7eb"/>
  <rect x="320" y="316" width="160" height="40" rx="8" fill="#d1d5db"/>
</svg>
```

Crie também `public/preview-assets/placeholder-hero.svg` com conteúdo similar mas com proporção 4:5:

```svg
<svg width="600" height="750" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="750" fill="#f3f4f6"/>
  <rect x="50" y="100" width="500" height="550" rx="16" fill="#e5e7eb"/>
  <circle cx="300" cy="280" r="80" fill="#d1d5db"/>
  <rect x="150" y="400" width="300" height="16" rx="8" fill="#d1d5db"/>
  <rect x="180" y="432" width="240" height="12" rx="6" fill="#e5e7eb"/>
  <rect x="200" y="460" width="200" height="12" rx="6" fill="#e5e7eb"/>
</svg>
```

---

### TAREFA 2 — Implementar o sistema de preview

O sistema de preview funciona assim:
- Cada componente tem um ID no `registry.json` (ex: `hero-split`)
- Quando o usuário clica no componente na biblioteca, abre um iframe apontando para `/preview/hero-split`
- A rota `[...slug].astro` precisa renderizar o componente com props de exemplo

**Como Astro funciona:** não é possível importar componentes `.astro` dinamicamente em runtime. A solução é um **mapa estático** — todos os componentes são importados no topo do arquivo e mapeados por ID.

Crie/substitua o arquivo `src/pages/preview/[...slug].astro` com este conteúdo:

```astro
---
// src/pages/preview/[...slug].astro
// Sistema de preview de componentes da biblioteca
// Renderiza qualquer componente isolado com tema de exemplo

export const prerender = false

const { slug } = Astro.params
const componentId = Array.isArray(slug) ? slug[0] : slug

// ─────────────────────────────────────────────────────────────
// MAPA DE COMPONENTES
// Quando adicionar um componente novo, registre aqui.
// O script add-component.mjs faz isso automaticamente.
// ─────────────────────────────────────────────────────────────
// IMPORTS_START — não remova este comentário, o script usa ele
// IMPORTS_END — não remova este comentário, o script usa ele

// PREVIEW_MAP_START — não remova este comentário
const PREVIEW_MAP: Record<string, { html: string; title: string }> = {
  // Os previews ficam aqui. Formato:
  // 'component-id': { html: '<html completo>', title: 'Nome do Componente' }
}
// PREVIEW_MAP_END — não remova este comentário

// Se o componente não existe no mapa
if (!componentId || !PREVIEW_MAP[componentId]) {
  return new Response(`
    <!DOCTYPE html>
    <html>
    <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#0a0a0f;color:#555;">
      <div style="text-align:center">
        <p style="font-size:2rem;margin-bottom:0.5rem">🧩</p>
        <p>Preview não disponível</p>
        <p style="font-size:0.8rem;margin-top:0.5rem">Adicione o preview via script ou pelo /admin</p>
      </div>
    </body>
    </html>
  `, {
    status: 200,
    headers: { 'Content-Type': 'text/html' }
  })
}

const preview = PREVIEW_MAP[componentId]
---

<Fragment set:html={preview.html} />
```

---

### TAREFA 3 — Criar o script `add-component.mjs`

Este script é rodado no terminal dentro da pasta `astroteca/`. Ele automatiza a criação de um componente novo na biblioteca.

Crie o arquivo `scripts/add-component.mjs`:

```javascript
#!/usr/bin/env node
// scripts/add-component.mjs
// Uso: node scripts/add-component.mjs
// Automatiza a criação de um componente novo na biblioteca

import { createInterface } from 'node:readline'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { resolve, join } from 'node:path'

const rl = createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise(r => rl.question(q, r))

// Cores no terminal
const c = {
  cyan:   s => `\x1b[36m${s}\x1b[0m`,
  green:  s => `\x1b[32m${s}\x1b[0m`,
  yellow: s => `\x1b[33m${s}\x1b[0m`,
  gray:   s => `\x1b[90m${s}\x1b[0m`,
  bold:   s => `\x1b[1m${s}\x1b[0m`,
  dim:    s => `\x1b[2m${s}\x1b[0m`,
  reset:  s => `\x1b[0m${s}\x1b[0m`,
}

// Converte "heroSplit" ou "hero-split" para "HeroSplit"
const toPascal = s => s.replace(/(^\w|-\w|_\w)/g, m => m.replace(/[-_]/, '').toUpperCase())

// Converte "HeroSplit" para "hero-split"
const toKebab = s => s.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase()

const CATEGORIES = ['Hero', 'Features', 'Services', 'Testimonials', 'Process', 'Pricing', 'FAQ', 'CTA', 'Contact', 'Footer', 'Trust', 'Other']

// Valores de exemplo para props comuns
const EXAMPLES = {
  headline:          'Transforme sua presença digital',
  title:             'Título de Exemplo',
  sectionTitle:      'Por que nos escolher',
  sectionLabel:      'Nossos Diferenciais',
  subheadline:       'Resultados reais para negócios que querem crescer.',
  subtitle:          'Uma descrição clara e objetiva do conteúdo.',
  description:       'Descrição do serviço ou produto com foco no benefício.',
  ctaLabel:          'Saiba mais',
  ctaHref:           '#',
  ctaSecondaryLabel: 'Como funciona',
  ctaSecondaryHref:  '#',
  imageSrc:          '/preview-assets/placeholder-hero.svg',
  imageAlt:          'Imagem de exemplo',
  badge:             '⭐ Mais de 200 projetos entregues',
  name:              'João Silva',
  email:             'joao@exemplo.com',
}

function getExample(propName) {
  return EXAMPLES[propName] || `Exemplo de ${propName}`
}

// Gera o HTML completo de preview do componente
function generatePreviewHtml(name, category, props) {
  const propsStr = props
    .filter(p => p.type === 'string')
    .map(p => `  ${p.name}="${getExample(p.name)}"`)
    .join('\n')

  // Retorna o HTML que vai ser armazenado no PREVIEW_MAP
  // Usa um placeholder porque o HTML real precisa ser gerado pelo Astro
  return `<!-- Preview de ${name} — implemente após criar o componente -->`
}

// Gera o código do componente .astro com template inicial
function generateComponentCode(name, category, props) {
  const className = toKebab(name)

  const interfaceLines = props.map(p =>
    `  ${p.name}${p.required ? '' : '?'}: ${p.type}`
  ).join('\n')

  const destructureLines = props.map(p => {
    if (p.required) return `  ${p.name},`
    if (p.default)  return `  ${p.name} = '${p.default}',`
    return `  ${p.name},`
  }).join('\n')

  const firstStringProp = props.find(p => p.type === 'string')?.name || 'title'

  return `---
// minha-lib-astro/src/components/${category}/${name}.astro
// Gerado automaticamente pelo add-component.mjs
// Implemente o HTML e CSS abaixo

interface Props {
${interfaceLines}
}

const {
${destructureLines}
} = Astro.props
---

<section class="${className}">
  <div class="${className}__container">

    <h2 class="${className}__title">{${firstStringProp}}</h2>

    {/* Implemente o resto do componente aqui */}

  </div>
</section>

<style>
  /*
   * REGRA DE OURO: use sempre CSS variables para cores, fontes, tamanhos.
   * Nunca valores fixos como #333 ou font-family: Inter.
   * Isso garante que o componente herda o tema de cada cliente.
   *
   * Variáveis disponíveis:
   * --color-primary      → cor de destaque
   * --color-on-primary   → texto sobre a cor primary
   * --color-bg           → fundo da página
   * --color-heading      → cor dos títulos
   * --color-text         → cor do texto normal
   * --color-text-muted   → cor do texto secundário
   * --font-heading       → fonte dos títulos
   * --font-body          → fonte do corpo
   * --radius             → borda arredondada padrão
   * --radius-lg          → borda arredondada maior
   * --container-max      → largura máxima do container
   * --container-padding  → padding lateral do container
   */

  .${className} {
    padding: clamp(4rem, 8vw, 7rem) var(--container-padding, 1.5rem);
    background-color: var(--color-bg);
  }

  .${className}__container {
    max-width: var(--container-max, 1200px);
    margin: 0 auto;
  }

  .${className}__title {
    font-family: var(--font-heading);
    font-size: clamp(1.75rem, 3.5vw, 2.75rem);
    font-weight: 700;
    color: var(--color-heading);
    line-height: 1.2;
    letter-spacing: -0.02em;
    margin-bottom: 1rem;
  }

  /* Use <em> no título para destacar uma palavra em primary: "Meu <em>diferencial</em>" */
  .${className}__title em {
    font-style: normal;
    color: var(--color-primary);
  }

  @media (max-width: 768px) {
    /* Ajustes mobile aqui */
  }
</style>
`
}

// Gera o arquivo .preview.astro
function generatePreviewCode(name, category, props) {
  const propsStr = props
    .filter(p => p.type === 'string')
    .map(p => `    ${p.name}="${getExample(p.name)}"`)
    .join('\n')

  return `---
// minha-lib-astro/src/components/${category}/${name}.preview.astro
// Arquivo de preview para a biblioteca visual.
// Não vai para produção.
import ${name} from './${name}.astro'
---

<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link
    href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --color-primary:     #7c3aed;
      --color-on-primary:  #ffffff;
      --color-secondary:   #111827;
      --color-bg:          #ffffff;
      --color-heading:     #111827;
      --color-text:        #374151;
      --color-text-muted:  #6b7280;
      --font-heading:      'Playfair Display', serif;
      --font-body:         'Inter', sans-serif;
      --radius:            8px;
      --radius-lg:         16px;
      --container-max:     1200px;
      --container-padding: 1.5rem;
    }

    body {
      font-family: var(--font-body);
      background: var(--color-bg);
      color: var(--color-text);
    }
  </style>
</head>
<body>
  <${name}
${propsStr}
  />
</body>
</html>
`
}

// Gera o index.ts do componente
function generateIndexCode(name) {
  return `export { default as ${name} } from './${name}.astro'\n`
}

async function main() {
  console.log()
  console.log(c.bold(c.cyan('  ⚡ Astroteca — Novo Componente')))
  console.log(c.dim('  Responda as perguntas. Os arquivos serão criados automaticamente.\n'))

  // ── Nome ──────────────────────────────────────────────────────────────────
  const rawName = (await ask(c.cyan('  Nome ') + c.dim('(ex: HeroSplit, FeaturesGrid): '))).trim()
  if (!rawName) { console.log('  Nome obrigatório.'); rl.close(); return }

  const name = toPascal(rawName)
  const id   = toKebab(name)

  // ── Categoria ─────────────────────────────────────────────────────────────
  console.log()
  console.log(c.cyan('  Categoria:'))
  CATEGORIES.forEach((cat, i) => console.log(`    ${c.dim(String(i + 1) + '.')} ${cat}`))
  const catInput = (await ask(c.cyan('\n  Número ou nome: '))).trim()
  const catNum   = parseInt(catInput, 10)
  const category = !isNaN(catNum) && catNum >= 1 && catNum <= CATEGORIES.length
    ? CATEGORIES[catNum - 1]
    : CATEGORIES.find(c => c.toLowerCase() === catInput.toLowerCase()) || 'Other'

  // ── Descrição ─────────────────────────────────────────────────────────────
  console.log()
  const description = (await ask(c.cyan('  Descrição ') + c.dim('(ex: "Hero com imagem ao lado"): '))).trim()

  // ── Tags ──────────────────────────────────────────────────────────────────
  const tagsRaw = (await ask(c.cyan('  Tags ') + c.dim('(separadas por vírgula, ex: hero,imagem,split): '))).trim()
  const tags    = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : []

  // ── Best for ──────────────────────────────────────────────────────────────
  const bestForRaw = (await ask(c.cyan('  Ideal para ') + c.dim('(ex: fotógrafos,consultores): '))).trim()
  const bestFor    = bestForRaw ? bestForRaw.split(',').map(t => t.trim()).filter(Boolean) : []

  // ── Props ─────────────────────────────────────────────────────────────────
  console.log()
  console.log(c.cyan('  Props do componente:'))
  console.log(c.dim('  Enter em branco para terminar.\n'))

  const props = []
  while (true) {
    const propName = (await ask(c.dim(`  [${props.length + 1}] `) + c.cyan('Nome: '))).trim()
    if (!propName) break

    const typeRaw  = (await ask('       Tipo ' + c.dim('[string/boolean/number/array] (Enter=string): '))).trim()
    const type     = ['boolean', 'number', 'array'].includes(typeRaw) ? typeRaw : 'string'
    const reqRaw   = (await ask('       Obrigatória? ' + c.dim('[s/n] (Enter=n): '))).trim()
    const required = reqRaw.toLowerCase() === 's'

    let defaultVal = ''
    if (!required && type === 'string') {
      defaultVal = (await ask('       Valor padrão ' + c.dim('(Enter para deixar vazio): '))).trim()
    }

    props.push({ name: propName, type, required, default: defaultVal })
    console.log(c.green('  ✓ ' + propName + ' adicionada') + '\n')
  }

  if (props.length === 0) {
    props.push({ name: 'headline', type: 'string', required: true, default: '' })
    console.log(c.yellow('  Prop padrão "headline: string" adicionada.\n'))
  }

  rl.close()

  // ── Caminhos ──────────────────────────────────────────────────────────────
  const ROOT         = resolve(process.cwd())
  const LIB_DIR      = join(ROOT, 'minha-lib-astro', 'src', 'components', category)
  const COMP_FILE    = join(LIB_DIR, `${name}.astro`)
  const PREV_FILE    = join(LIB_DIR, `${name}.preview.astro`)
  const INDEX_FILE   = join(LIB_DIR, 'index.ts')
  const LIB_INDEX    = join(ROOT, 'minha-lib-astro', 'src', 'index.ts')
  const REGISTRY     = join(ROOT, 'minha-lib-astro', 'registry.json')
  const SLUG_FILE    = join(ROOT, 'src', 'pages', 'preview', '[...slug].astro')

  // ── Verifica se já existe ──────────────────────────────────────────────────
  if (existsSync(COMP_FILE)) {
    console.log(c.yellow(`\n  ⚠️  ${name}.astro já existe. Pulando criação do componente (preview e registry serão atualizados).`))
  }

  // ── Cria os arquivos ───────────────────────────────────────────────────────
  console.log()
  console.log(c.bold('  Criando arquivos...\n'))

  if (!existsSync(LIB_DIR)) {
    mkdirSync(LIB_DIR, { recursive: true })
  }

  // 1. Componente .astro
  if (!existsSync(COMP_FILE)) {
    writeFileSync(COMP_FILE, generateComponentCode(name, category, props))
    console.log(c.green('  ✓') + ` minha-lib-astro/src/components/${category}/${name}.astro`)
  }

  // 2. Preview .astro
  writeFileSync(PREV_FILE, generatePreviewCode(name, category, props))
  console.log(c.green('  ✓') + ` minha-lib-astro/src/components/${category}/${name}.preview.astro`)

  // 3. index.ts da categoria
  let indexContent = existsSync(INDEX_FILE) ? readFileSync(INDEX_FILE, 'utf8') : ''
  const exportLine = `export { default as ${name} } from './${name}.astro'`
  if (!indexContent.includes(exportLine)) {
    indexContent = indexContent.trimEnd() + (indexContent ? '\n' : '') + exportLine + '\n'
    writeFileSync(INDEX_FILE, indexContent)
  }
  console.log(c.green('  ✓') + ` minha-lib-astro/src/components/${category}/index.ts`)

  // 4. src/index.ts principal da lib
  const libIndexPath = join(ROOT, 'minha-lib-astro', 'src', 'index.ts')
  let libIndex = existsSync(libIndexPath) ? readFileSync(libIndexPath, 'utf8') : ''
  const libExportLine = `export * from './components/${category}/index'`
  if (!libIndex.includes(libExportLine)) {
    libIndex = libIndex.trimEnd() + (libIndex ? '\n' : '') + libExportLine + '\n'
    writeFileSync(libIndexPath, libIndex)
  }
  console.log(c.green('  ✓') + ` minha-lib-astro/src/index.ts`)

  // 5. registry.json
  let registry = []
  if (existsSync(REGISTRY)) {
    try { registry = JSON.parse(readFileSync(REGISTRY, 'utf8')) } catch {}
  }
  registry = registry.filter(c => c.id !== id)
  registry.push({
    id,
    name,
    category,
    description,
    previewPath: `/preview/${id}`,
    screenshot: '',
    componentFile: `${category}/${name}.astro`,
    tags,
    bestFor,
    props: props.map(p => ({
      name: p.name,
      type: p.type,
      required: p.required,
      ...(p.default ? { default: p.default } : {}),
    })),
    order: registry.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  writeFileSync(REGISTRY, JSON.stringify(registry, null, 2) + '\n')
  console.log(c.green('  ✓') + ` minha-lib-astro/registry.json`)

  // 6. Adiciona entrada no PREVIEW_MAP do [...slug].astro
  if (existsSync(SLUG_FILE)) {
    let slugContent = readFileSync(SLUG_FILE, 'utf8')

    // Adiciona no mapa se ainda não está
    const mapEntry = `  '${id}': { title: '${name}', html: '' }, // TODO: gerar preview HTML`
    if (!slugContent.includes(`'${id}':`)) {
      slugContent = slugContent.replace(
        '// PREVIEW_MAP_END',
        `${mapEntry}\n// PREVIEW_MAP_END`
      )
      writeFileSync(SLUG_FILE, slugContent)
      console.log(c.green('  ✓') + ` src/pages/preview/[...slug].astro (entrada adicionada)`)
    }
  }

  // ── Resultado ─────────────────────────────────────────────────────────────
  console.log()
  console.log(c.bold(c.green('  ✅ Componente criado!')))
  console.log()
  console.log(c.bold('  Próximos passos:\n'))
  console.log(c.yellow('  1.') + ` Implemente o HTML/CSS em:`)
  console.log(c.dim(`     minha-lib-astro/src/components/${category}/${name}.astro\n`))
  console.log(c.yellow('  2.') + ` Ajuste as props de exemplo em:`)
  console.log(c.dim(`     minha-lib-astro/src/components/${category}/${name}.preview.astro\n`))
  console.log(c.yellow('  3.') + ` Quando o componente estiver pronto, rode:`)
  console.log(c.dim(`     node scripts/generate-previews.mjs\n`))
  console.log(c.yellow('  4.') + ` Suba para o GitHub:`)
  console.log(c.dim(`     cd minha-lib-astro && git add . && git commit -m "feat: add ${name}" && git push\n`))
}

main().catch(e => { console.error(e.message); process.exit(1) })
```

---

### TAREFA 4 — Criar o script `extract-component.mjs`

Este é o script mais importante para o fluxo do usuário. Ele extrai um componente de qualquer projeto existente, detecta as props automaticamente e o registra na biblioteca.

Crie o arquivo `scripts/extract-component.mjs`:

```javascript
#!/usr/bin/env node
// scripts/extract-component.mjs
// Extrai um componente Astro de um projeto existente e o registra na biblioteca
//
// Uso:
//   node scripts/extract-component.mjs caminho/para/Componente.astro
//   node scripts/extract-component.mjs ../meu-projeto/src/components/Hero.astro

import { createInterface } from 'node:readline'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, join, basename, dirname } from 'node:path'

const rl = createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise(r => rl.question(q, r))

const c = {
  cyan:   s => `\x1b[36m${s}\x1b[0m`,
  green:  s => `\x1b[32m${s}\x1b[0m`,
  yellow: s => `\x1b[33m${s}\x1b[0m`,
  bold:   s => `\x1b[1m${s}\x1b[0m`,
  dim:    s => `\x1b[2m${s}\x1b[0m`,
}

const toPascal = s => s.replace(/(^\w|-\w|_\w)/g, m => m.replace(/[-_]/, '').toUpperCase())
const toKebab  = s => s.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase()

const CATEGORIES = ['Hero', 'Features', 'Services', 'Testimonials', 'Process', 'Pricing', 'FAQ', 'CTA', 'Contact', 'Footer', 'Trust', 'Other']

const EXAMPLES = {
  headline: 'Transforme sua presença digital',
  title: 'Título de Exemplo',
  sectionTitle: 'Por que nos escolher',
  subheadline: 'Resultados reais para negócios que querem crescer.',
  ctaLabel: 'Saiba mais',
  ctaHref: '#',
  imageSrc: '/preview-assets/placeholder-hero.svg',
  imageAlt: 'Imagem de exemplo',
  badge: '⭐ Mais de 200 projetos entregues',
}

// Detecta props automaticamente lendo a interface Props do .astro
function detectProps(code) {
  const interfaceMatch = code.match(/interface\s+Props\s*\{([^}]+)\}/s)
  if (!interfaceMatch) return []

  const interfaceBody = interfaceMatch[1]
  const propRegex = /(\w+)(\?)?:\s*(string|boolean|number|string\[\]|[A-Z]\w+\[\]|\w+)/g
  const props = []
  let match

  while ((match = propRegex.exec(interfaceBody)) !== null) {
    const [, name, optional, type] = match
    const normalizedType = type.includes('[]') ? 'array' : type

    // Pega o valor default se existir no destructure
    const defaultMatch = code.match(new RegExp(`${name}\\s*=\\s*['"]([^'"]+)['"]`))
    const defaultVal = defaultMatch ? defaultMatch[1] : ''

    props.push({
      name,
      type: normalizedType,
      required: !optional,
      default: defaultVal,
    })
  }

  return props
}

// Adapta o código do componente para usar CSS variables
// (substitui valores Tailwind hardcoded por classes que usam variáveis)
function adaptCode(code) {
  // Se o componente usa Tailwind com classes hardcoded de cor, adiciona um aviso
  const hasTailwindColors = /\b(bg|text|border)-(red|blue|green|purple|indigo|violet|pink|orange|yellow|gray|slate|zinc|neutral|stone|amber|lime|emerald|teal|cyan|sky|fuchsia|rose)-\d+/g.test(code)

  if (hasTailwindColors) {
    // Adiciona comentário de aviso no topo do frontmatter
    code = code.replace('---', `---
// ⚠️  ATENÇÃO: Este componente foi extraído de outro projeto.
// Substitua as classes Tailwind de cor hardcoded (ex: bg-violet-600)
// por classes que usam CSS variables (ex: bg-[var(--color-primary)])
// ou adicione ao tailwind.config: colors: { primary: 'var(--color-primary)' }
// e use: bg-primary, text-primary, border-primary`)
  }

  return code
}

function generatePreviewCode(name, category, props) {
  const propsStr = props
    .filter(p => p.type === 'string')
    .map(p => `    ${p.name}="${EXAMPLES[p.name] || `Exemplo de ${p.name}`}"`)
    .join('\n')

  return `---
// minha-lib-astro/src/components/${category}/${name}.preview.astro
import ${name} from './${name}.astro'
---

<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --color-primary: #7c3aed; --color-on-primary: #ffffff;
      --color-bg: #ffffff; --color-heading: #111827;
      --color-text: #374151; --color-text-muted: #6b7280;
      --font-heading: 'Playfair Display', serif; --font-body: 'Inter', sans-serif;
      --radius: 8px; --radius-lg: 16px;
      --container-max: 1200px; --container-padding: 1.5rem;
    }
    body { font-family: var(--font-body); background: var(--color-bg); }
  </style>
</head>
<body>
  <${name}
${propsStr}
  />
</body>
</html>
`
}

async function main() {
  const filePath = process.argv[2]

  console.log()
  console.log(c.bold(c.cyan('  ⚡ Astroteca — Extrair Componente')))
  console.log()

  // ── Pede o caminho se não foi passado como argumento ─────────────────────
  let resolvedPath = filePath ? resolve(filePath) : null

  if (!resolvedPath) {
    const pathInput = (await ask(c.cyan('  Caminho do arquivo .astro: '))).trim()
    resolvedPath = resolve(pathInput)
  }

  if (!existsSync(resolvedPath)) {
    console.log(c.yellow(`\n  Arquivo não encontrado: ${resolvedPath}`))
    rl.close()
    return
  }

  const rawCode = readFileSync(resolvedPath, 'utf8')
  const fileName = basename(resolvedPath, '.astro')
  const name = toPascal(fileName)
  const id = toKebab(name)

  console.log(c.green(`\n  ✓ Arquivo lido: ${basename(resolvedPath)}`))

  // ── Detecta props automaticamente ────────────────────────────────────────
  const detectedProps = detectProps(rawCode)
  if (detectedProps.length > 0) {
    console.log(c.green(`  ✓ Props detectadas: ${detectedProps.map(p => p.name).join(', ')}`))
  } else {
    console.log(c.yellow('  ⚠️  Nenhuma prop detectada automaticamente.'))
  }

  // ── Categoria ────────────────────────────────────────────────────────────
  console.log()
  console.log(c.cyan('  Categoria:'))
  CATEGORIES.forEach((cat, i) => console.log(`    ${c.dim(String(i + 1) + '.')} ${cat}`))
  const catInput = (await ask(c.cyan('\n  Número ou nome: '))).trim()
  const catNum   = parseInt(catInput, 10)
  const category = !isNaN(catNum) && catNum >= 1 && catNum <= CATEGORIES.length
    ? CATEGORIES[catNum - 1]
    : CATEGORIES.find(cat => cat.toLowerCase() === catInput.toLowerCase()) || 'Other'

  // ── Descrição ─────────────────────────────────────────────────────────────
  console.log()
  const description = (await ask(c.cyan('  Descrição: '))).trim() || `Componente ${name}`

  // ── Tags ──────────────────────────────────────────────────────────────────
  const tagsRaw = (await ask(c.cyan('  Tags ') + c.dim('(separadas por vírgula): '))).trim()
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : []

  // ── Best for ──────────────────────────────────────────────────────────────
  const bestForRaw = (await ask(c.cyan('  Ideal para ') + c.dim('(separado por vírgula): '))).trim()
  const bestFor = bestForRaw ? bestForRaw.split(',').map(t => t.trim()).filter(Boolean) : []

  rl.close()

  // ── Caminhos de destino ────────────────────────────────────────────────────
  const ROOT       = resolve(process.cwd())
  const LIB_DIR    = join(ROOT, 'minha-lib-astro', 'src', 'components', category)
  const COMP_FILE  = join(LIB_DIR, `${name}.astro`)
  const PREV_FILE  = join(LIB_DIR, `${name}.preview.astro`)
  const INDEX_FILE = join(LIB_DIR, 'index.ts')
  const LIB_INDEX  = join(ROOT, 'minha-lib-astro', 'src', 'index.ts')
  const REGISTRY   = join(ROOT, 'minha-lib-astro', 'registry.json')

  if (!existsSync(LIB_DIR)) {
    mkdirSync(LIB_DIR, { recursive: true })
  }

  // ── Cria os arquivos ───────────────────────────────────────────────────────
  console.log()
  console.log(c.bold('  Extraindo componente...\n'))

  // 1. Componente adaptado
  const adaptedCode = adaptCode(rawCode)
  writeFileSync(COMP_FILE, adaptedCode)
  console.log(c.green('  ✓') + ` minha-lib-astro/src/components/${category}/${name}.astro`)

  // 2. Preview
  writeFileSync(PREV_FILE, generatePreviewCode(name, category, detectedProps))
  console.log(c.green('  ✓') + ` minha-lib-astro/src/components/${category}/${name}.preview.astro`)

  // 3. index.ts da categoria
  let indexContent = existsSync(INDEX_FILE) ? readFileSync(INDEX_FILE, 'utf8') : ''
  const exportLine = `export { default as ${name} } from './${name}.astro'`
  if (!indexContent.includes(exportLine)) {
    indexContent = indexContent.trimEnd() + (indexContent ? '\n' : '') + exportLine + '\n'
    writeFileSync(INDEX_FILE, indexContent)
  }
  console.log(c.green('  ✓') + ` minha-lib-astro/src/components/${category}/index.ts`)

  // 4. src/index.ts principal
  let libIndex = existsSync(LIB_INDEX) ? readFileSync(LIB_INDEX, 'utf8') : ''
  const libLine = `export * from './components/${category}/index'`
  if (!libIndex.includes(libLine)) {
    libIndex = libIndex.trimEnd() + (libIndex ? '\n' : '') + libLine + '\n'
    writeFileSync(LIB_INDEX, libIndex)
  }
  console.log(c.green('  ✓') + ` minha-lib-astro/src/index.ts`)

  // 5. registry.json
  let registry = []
  if (existsSync(REGISTRY)) {
    try { registry = JSON.parse(readFileSync(REGISTRY, 'utf8')) } catch {}
  }
  registry = registry.filter(r => r.id !== id)
  registry.push({
    id, name, category, description,
    previewPath: `/preview/${id}`,
    screenshot: '',
    componentFile: `${category}/${name}.astro`,
    tags, bestFor,
    props: detectedProps.map(p => ({
      name: p.name, type: p.type, required: p.required,
      ...(p.default ? { default: p.default } : {}),
    })),
    order: registry.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  writeFileSync(REGISTRY, JSON.stringify(registry, null, 2) + '\n')
  console.log(c.green('  ✓') + ` minha-lib-astro/registry.json`)

  console.log()
  console.log(c.bold(c.green('  ✅ Componente extraído com sucesso!')))
  console.log()
  console.log(c.bold('  Próximos passos:\n'))
  console.log(c.yellow('  1.') + ` Revise o componente (especialmente se tinha cores hardcoded):`)
  console.log(c.dim(`     minha-lib-astro/src/components/${category}/${name}.astro\n`))
  console.log(c.yellow('  2.') + ` Ajuste as props de exemplo no preview:`)
  console.log(c.dim(`     minha-lib-astro/src/components/${category}/${name}.preview.astro\n`))
  console.log(c.yellow('  3.') + ` Gere os previews:`)
  console.log(c.dim(`     node scripts/generate-previews.mjs\n`))
  console.log(c.yellow('  4.') + ` Suba para o GitHub:`)
  console.log(c.dim(`     cd minha-lib-astro && git add . && git commit -m "feat: extract ${name}" && git push\n`))
}

main().catch(e => { console.error('  Erro:', e.message); process.exit(1) })
```

---

### TAREFA 5 — Criar o script `generate-previews.mjs`

Este script lê todos os arquivos `.preview.astro` da lib, gera o HTML de cada um usando o servidor Astro em modo de renderização, e atualiza o `[...slug].astro` com o conteúdo de cada preview.

**Importante:** como o Astro precisa estar rodando para gerar HTML, este script usa uma abordagem diferente — ele gera páginas estáticas individuais para cada componente em `/src/pages/preview/`, que o Astro renderiza normalmente.

Crie o arquivo `scripts/generate-previews.mjs`:

```javascript
#!/usr/bin/env node
// scripts/generate-previews.mjs
// Gera as páginas de preview para todos os componentes registrados
// Lê os .preview.astro de minha-lib-astro e cria páginas em src/pages/preview/

import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs'
import { resolve, join } from 'node:path'

const c = {
  cyan:  s => `\x1b[36m${s}\x1b[0m`,
  green: s => `\x1b[32m${s}\x1b[0m`,
  yellow:s => `\x1b[33m${s}\x1b[0m`,
  bold:  s => `\x1b[1m${s}\x1b[0m`,
  dim:   s => `\x1b[2m${s}\x1b[0m`,
}

const toKebab = s => s.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase()

const ROOT         = resolve(process.cwd())
const LIB_COMPS    = join(ROOT, 'minha-lib-astro', 'src', 'components')
const PREVIEW_DIR  = join(ROOT, 'src', 'pages', 'preview')

if (!existsSync(PREVIEW_DIR)) {
  mkdirSync(PREVIEW_DIR, { recursive: true })
}

console.log()
console.log(c.bold(c.cyan('  ⚡ Astroteca — Gerar Previews')))
console.log()

let generated = 0
let skipped = 0

// Lê todas as categorias
const categories = readdirSync(LIB_COMPS, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)

for (const category of categories) {
  const categoryDir = join(LIB_COMPS, category)
  const files = readdirSync(categoryDir)
  const previewFiles = files.filter(f => f.endsWith('.preview.astro'))

  for (const previewFile of previewFiles) {
    const componentName = previewFile.replace('.preview.astro', '')
    const id = toKebab(componentName)

    const sourcePath = join(categoryDir, previewFile)
    const destPath   = join(PREVIEW_DIR, `${id}.astro`)

    const sourceContent = readFileSync(sourcePath, 'utf8')

    // Ajusta o import para o caminho correto dentro do Astroteca
    const adjustedContent = sourceContent
      .replace(
        `import ${componentName} from './${componentName}.astro'`,
        `import ${componentName} from '../../../minha-lib-astro/src/components/${category}/${componentName}.astro'`
      )

    // Só reescreve se o conteúdo mudou (evita rebuilds desnecessários)
    const existingContent = existsSync(destPath) ? readFileSync(destPath, 'utf8') : ''
    if (existingContent === adjustedContent) {
      skipped++
      continue
    }

    writeFileSync(destPath, adjustedContent)
    console.log(c.green('  ✓') + ` src/pages/preview/${id}.astro`)
    generated++
  }
}

console.log()
if (generated === 0 && skipped === 0) {
  console.log(c.yellow('  Nenhum arquivo .preview.astro encontrado em minha-lib-astro/src/components/'))
  console.log(c.dim('  Adicione componentes com: node scripts/add-component.mjs\n'))
} else {
  console.log(c.bold(c.green(`  ✅ ${generated} preview(s) gerado(s). ${skipped} sem alteração.`)))
  console.log()
  console.log(c.dim('  Reinicie o servidor se estiver rodando:'))
  console.log(c.dim('  Ctrl+C → npm run dev\n'))
}
```

---

### TAREFA 6 — Atualizar o `package.json` com os novos scripts

Adicione as entradas de scripts no `package.json` da raiz do Astroteca:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "new": "node scripts/add-component.mjs",
    "extract": "node scripts/extract-component.mjs",
    "previews": "node scripts/generate-previews.mjs"
  }
}
```

---

### TAREFA 7 — Criar a pasta `scripts/` se não existir

Garanta que a pasta `scripts/` existe na raiz do Astroteca. Coloque um `README` lá para documentar:

```markdown
# Scripts de Automação

## `npm run new`
Cria um componente novo na biblioteca passo a passo.

## `npm run extract caminho/Componente.astro`
Extrai um componente de um projeto existente para a biblioteca.
Detecta as props automaticamente e registra no registry.json.

## `npm run previews`
Gera as páginas de preview para todos os componentes.
Rode isso após adicionar ou modificar componentes.

## Fluxo completo para adicionar um componente novo:
1. `npm run new` → responde as perguntas
2. Implementa o HTML/CSS no arquivo gerado
3. `npm run previews` → gera as páginas de preview
4. `cd minha-lib-astro && git push` → sobe para o GitHub

## Fluxo para extrair um componente de outro projeto:
1. `npm run extract ../outro-projeto/src/components/Hero.astro`
2. Revisa o arquivo (ajusta cores hardcoded para CSS variables)
3. `npm run previews`
4. `cd minha-lib-astro && git push`
```

---

### TAREFA 8 — Verificar e corrigir o `ComponentBrowser.tsx`

O `ComponentBrowser.tsx` precisa tratar o caso em que o preview não está disponível ainda (componente sem página de preview). Encontre onde o iframe é renderizado e adicione o tratamento de erro:

O iframe deve ter este formato:

```tsx
{/* Preview em iframe */}
<iframe
  src={activeComponent.previewPath}
  style={{
    width: '100%',
    height: '100%',
    border: 'none',
  }}
  title={`Preview: ${activeComponent.name}`}
  onError={() => {
    // Preview não disponível — tratar silenciosamente
    console.warn(`Preview não disponível para: ${activeComponent.id}`)
  }}
/>
```

E adicione um estado de fallback quando o preview não carrega:

```tsx
const [previewError, setPreviewError] = useState(false)

// Quando muda de componente, reseta o erro
useEffect(() => {
  setPreviewError(false)
}, [activeComponent?.id])

// No render:
{previewError ? (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#555',
    gap: '0.5rem',
  }}>
    <span style={{ fontSize: '2rem' }}>🧩</span>
    <p style={{ fontSize: '0.875rem' }}>Preview não disponível</p>
    <p style={{ fontSize: '0.75rem', color: '#444' }}>
      Rode <code>npm run previews</code> para gerar
    </p>
  </div>
) : (
  <iframe
    src={activeComponent.previewPath}
    style={{ width: '100%', height: '100%', border: 'none' }}
    title={`Preview: ${activeComponent.name}`}
    onError={() => setPreviewError(true)}
  />
)}
```

---

### TAREFA 9 — Verificar se o `[...slug].astro` tem a estrutura correta

Verifique se o arquivo `src/pages/preview/[...slug].astro` existe e tem o conteúdo descrito na Tarefa 2. Se já existe com outro conteúdo, substitua pelo conteúdo da Tarefa 2.

---

### TAREFA 10 — Criar um componente de exemplo completo

Para testar que tudo funciona, crie um componente de exemplo completo em:
`minha-lib-astro/src/components/Hero/HeroSimples.astro`

```astro
---
// minha-lib-astro/src/components/Hero/HeroSimples.astro
// Componente de exemplo para testar o sistema de preview

interface Props {
  headline: string
  subheadline?: string
  ctaLabel?: string
  ctaHref?: string
  badge?: string
}

const {
  headline,
  subheadline = '',
  ctaLabel = 'Saiba mais',
  ctaHref = '#contato',
  badge,
} = Astro.props
---

<section class="hero-simples">
  <div class="hero-simples__container">

    {badge && (
      <span class="hero-simples__badge">{badge}</span>
    )}

    <h1 class="hero-simples__headline" set:html={headline} />

    {subheadline && (
      <p class="hero-simples__sub">{subheadline}</p>
    )}

    <a href={ctaHref} class="hero-simples__cta">
      {ctaLabel}
    </a>

  </div>
</section>

<style>
  .hero-simples {
    padding: clamp(5rem, 12vw, 10rem) var(--container-padding, 1.5rem);
    background-color: var(--color-bg);
    text-align: center;
  }

  .hero-simples__container {
    max-width: 720px;
    margin: 0 auto;
  }

  .hero-simples__badge {
    display: inline-block;
    background: color-mix(in srgb, var(--color-primary) 12%, transparent);
    color: var(--color-primary);
    border: 1px solid color-mix(in srgb, var(--color-primary) 25%, transparent);
    padding: 0.375rem 0.875rem;
    border-radius: 100px;
    font-size: 0.8rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
  }

  .hero-simples__headline {
    font-family: var(--font-heading);
    font-size: clamp(2.25rem, 5vw, 4rem);
    font-weight: 700;
    color: var(--color-heading);
    line-height: 1.1;
    letter-spacing: -0.02em;
    margin-bottom: 1.25rem;
  }

  .hero-simples__headline em {
    font-style: normal;
    color: var(--color-primary);
  }

  .hero-simples__sub {
    font-family: var(--font-body);
    font-size: clamp(1rem, 1.5vw, 1.2rem);
    color: var(--color-text-muted);
    line-height: 1.65;
    margin-bottom: 2rem;
  }

  .hero-simples__cta {
    display: inline-flex;
    padding: 0.875rem 2rem;
    background: var(--color-primary);
    color: var(--color-on-primary);
    border-radius: var(--radius);
    font-weight: 600;
    font-size: 1rem;
    text-decoration: none;
    transition: opacity 0.2s, transform 0.2s;
    box-shadow: 0 4px 20px color-mix(in srgb, var(--color-primary) 35%, transparent);
  }

  .hero-simples__cta:hover {
    opacity: 0.88;
    transform: translateY(-2px);
  }
</style>
```

E o preview dele em `minha-lib-astro/src/components/Hero/HeroSimples.preview.astro`:

```astro
---
import HeroSimples from './HeroSimples.astro'
---

<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --color-primary: #7c3aed; --color-on-primary: #ffffff;
      --color-bg: #ffffff; --color-heading: #111827;
      --color-text: #374151; --color-text-muted: #6b7280;
      --font-heading: 'Playfair Display', serif; --font-body: 'Inter', sans-serif;
      --radius: 8px; --radius-lg: 16px;
      --container-max: 1200px; --container-padding: 1.5rem;
    }
    body { font-family: var(--font-body); background: var(--color-bg); }
  </style>
</head>
<body>
  <HeroSimples
    badge="⭐ Mais de 200 projetos entregues"
    headline="Transforme sua <em>presença digital</em>"
    subheadline="Landing pages que convertem de verdade. Do briefing ao ar em até 14 dias."
    ctaLabel="Ver portfólio"
    ctaHref="#"
  />
</body>
</html>
```

E adicione essa entrada no `registry.json` da `minha-lib-astro`:

```json
{
  "id": "hero-simples",
  "name": "Hero Simples",
  "category": "Hero",
  "description": "Hero centralizado, limpo e direto. Ideal para qualquer nicho.",
  "previewPath": "/preview/hero-simples",
  "screenshot": "",
  "componentFile": "Hero/HeroSimples.astro",
  "tags": ["hero", "centralizado", "simples"],
  "bestFor": ["qualquer nicho"],
  "props": [
    { "name": "headline", "type": "string", "required": true },
    { "name": "subheadline", "type": "string", "required": false },
    { "name": "ctaLabel", "type": "string", "required": false, "default": "Saiba mais" },
    { "name": "ctaHref", "type": "string", "required": false, "default": "#contato" },
    { "name": "badge", "type": "string", "required": false }
  ],
  "order": 1,
  "createdAt": "2026-05-26T00:00:00.000Z",
  "updatedAt": "2026-05-26T00:00:00.000Z"
}
```

E crie também o `minha-lib-astro/src/components/Hero/index.ts`:

```typescript
export { default as HeroSimples } from './HeroSimples.astro'
```

E o `minha-lib-astro/src/index.ts`:

```typescript
export * from './components/Hero/index'
```

---

### TAREFA 11 — Rodar o script de previews para gerar a primeira página

Após criar todos os arquivos acima, rode no terminal:

```bash
node scripts/generate-previews.mjs
```

Isso deve criar o arquivo `src/pages/preview/hero-simples.astro`.

Depois reinicie o servidor:

```bash
npm run dev
```

Acesse `http://localhost:4321` e clique no componente "Hero Simples" — o preview deve aparecer no iframe.

---

## Resumo do que foi feito

Após implementar tudo acima, o projeto terá:

| O que | Onde | Para que |
|---|---|---|
| `public/preview-assets/placeholder.svg` | raiz | imagem placeholder nos previews |
| `src/pages/preview/[...slug].astro` | Astroteca | rota de preview dinâmico (fallback) |
| `scripts/add-component.mjs` | raiz | criar componente novo guiado |
| `scripts/extract-component.mjs` | raiz | extrair componente de outro projeto |
| `scripts/generate-previews.mjs` | raiz | gerar páginas de preview automaticamente |
| `minha-lib-astro/src/components/Hero/HeroSimples.astro` | lib | componente de exemplo funcionando |
| `minha-lib-astro/src/components/Hero/HeroSimples.preview.astro` | lib | preview do exemplo |
| `minha-lib-astro/registry.json` | lib | catálogo atualizado |

---

## Fluxo de uso após implementação

**Para adicionar componente novo:**
```bash
npm run new
# responde as perguntas → arquivos criados
# implementa o HTML no .astro gerado
npm run previews
# preview aparece na biblioteca
```

**Para extrair componente de outro projeto:**
```bash
npm run extract ../outro-projeto/src/components/MeuHero.astro
# responde categoria e descrição → arquivos criados automaticamente
npm run previews
# preview aparece na biblioteca
```

**Para subir tudo para o GitHub:**
```bash
cd minha-lib-astro
git add .
git commit -m "feat: add HeroSimples"
git push
```
