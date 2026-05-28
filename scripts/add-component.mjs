#!/usr/bin/env node
// scripts/add-component.mjs
// Uso: node scripts/add-component.mjs
// Automatiza a criação de um componente novo na biblioteca

import { createInterface } from 'node:readline'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { execSync } from 'node:child_process'
import { toPascal, toKebab, CATEGORIES, EXAMPLES } from './utils.mjs'

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


function getExample(propName) {
  return EXAMPLES[propName] || `Exemplo de ${propName}`
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

// Gera o arquivo .preview.astro no formato compatível com generate-previews.mjs
function generatePreviewCode(name, category, props) {
  const propsStr = props
    .filter(p => p.type === 'string')
    .map(p => `  ${p.name}="${getExample(p.name)}"`)
    .join('\n')

  return `---
import ${name} from './${name}.astro'
---

<${name}
${propsStr}
/>
`
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
  const REGISTRY     = join(ROOT, 'minha-lib-astro', 'registry.json')

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

  // 6. Gera páginas de preview via generate-previews.mjs
  try {
    execSync('node scripts/generate-previews.mjs', { cwd: ROOT, stdio: 'pipe' })
    console.log(c.green('  ✓') + ' src/pages/preview gerado')
  } catch {
    console.log(c.yellow('  ⚠ Preview não gerado automaticamente — rode: node scripts/generate-previews.mjs'))
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
