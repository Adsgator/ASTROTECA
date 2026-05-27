#!/usr/bin/env node
// scripts/extract-component.mjs
// Extrai um componente Astro de um projeto existente e o registra na biblioteca
//
// Uso:
//   node scripts/extract-component.mjs caminho/para/Componente.astro
//   node scripts/extract-component.mjs ../meu-projeto/src/components/Hero.astro

import { createInterface } from 'node:readline'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, join, basename } from 'node:path'

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
const randomId = () => String(Math.floor(1000 + Math.random() * 9000))
const toKebab  = s => s
  .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
  .replace(/([a-z])([A-Z])/g, '$1-$2')
  .replace(/([a-zA-Z])(\d)/g, '$1-$2')
  .replace(/[\s_]+/g, '-')
  .toLowerCase()

const CATEGORIES = ['Hero', 'Features', 'Services', 'Testimonials', 'Process', 'Pricing', 'FAQ', 'CTA', 'Contact', 'Footer', 'Trust', 'Other']

const EXAMPLES = {
  headline:     'Transforme sua presença digital',
  title:        'Título de Exemplo',
  sectionTitle: 'Por que nos escolher',
  subheadline:  'Resultados reais para negócios que querem crescer.',
  ctaLabel:     'Saiba mais',
  ctaHref:      '#',
  imageSrc:     '/preview-assets/placeholder-hero.svg',
  imageAlt:     'Imagem de exemplo',
  badge:        '⭐ Mais de 200 projetos entregues',
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

// Sanitiza dados sensíveis do cliente extraídos junto com o componente
function sanitizeCode(code) {
  // Remove imports de assets locais (@/assets, ../assets, ./assets, ../../assets etc)
  code = code.replace(/^import\s+\w+\s+from\s+['"](?:\.{1,2}\/)*(?:@\/)?assets\/[^'"]+['"];?\s*$/gm, '')

  // Remove uso do componente <Image> que dependia de assets locais (src={variavel})
  // substitui por um img placeholder
  code = code.replace(/<Image\s[^/]*src=\{[^}]+\}[^/]*\/>/gs, '<img src="/preview-assets/placeholder-hero.svg" alt="imagem" />')

  // Substitui URLs de WhatsApp por placeholder
  code = code.replace(/https:\/\/wa\.me\/[^\s'"]+/g, 'https://wa.me/5500000000000')

  // Substitui números de telefone (formatos BR: (xx) x...)
  code = code.replace(/\(\d{2}\)\s?9?\d{4}[-\s]?\d{4}/g, '(00) 00000-0000')

  // Substitui CNPJ
  code = code.replace(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g, '00.000.000/0000-00')

  // Substitui URLs absolutas de redes sociais por # (instagram, tiktok, facebook, youtube, linkedin)
  code = code.replace(/href="https:\/\/(www\.)?(instagram|tiktok|facebook|youtube|linkedin)\.com\/[^"]+"/g, 'href="#"')

  // Avisa sobre cores hardcoded
  const hasTailwindColors = /\b(bg|text|border)-(red|blue|green|purple|indigo|violet|pink|orange|yellow|gray|slate|zinc|neutral|stone|amber|lime|emerald|teal|cyan|sky|fuchsia|rose)-\d+/g.test(code)
  if (hasTailwindColors) {
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
  const baseName = toPascal(fileName)
  const uid = randomId()
  const name = `${baseName}${uid}`
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

  // 1. Componente adaptado e sanitizado
  const adaptedCode = sanitizeCode(rawCode)
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
