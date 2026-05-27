#!/usr/bin/env node
// scripts/extract-component.mjs
// Extrai um componente Astro de um projeto existente e o registra na biblioteca
//
// Uso:
//   npm run extract
//   node scripts/extract-component.mjs caminho/para/Componente.astro

import { intro, outro, text, select, isCancel, cancel, note, spinner } from '@clack/prompts'
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { resolve, join, basename, dirname } from 'node:path'

const c = {
  cyan:   s => `\x1b[36m${s}\x1b[0m`,
  green:  s => `\x1b[32m${s}\x1b[0m`,
  yellow: s => `\x1b[33m${s}\x1b[0m`,
  bold:   s => `\x1b[1m${s}\x1b[0m`,
  dim:    s => `\x1b[2m${s}\x1b[0m`,
}

// Sugere arquivos .astro enquanto o usuário digita o caminho
function suggestAstroFiles(input) {
  if (!input) return []
  try {
    const normalized = input.replace(/\\/g, '/')
    const dir = normalized.endsWith('/') ? normalized : dirname(normalized)
    const prefix = normalized.endsWith('/') ? '' : basename(normalized)
    const resolvedDir = resolve(dir)
    if (!existsSync(resolvedDir)) return []
    return readdirSync(resolvedDir, { withFileTypes: true })
      .filter(e => e.name.toLowerCase().startsWith(prefix.toLowerCase()))
      .filter(e => e.isDirectory() || e.name.endsWith('.astro'))
      .slice(0, 8)
      .map(e => ({
        value: join(resolvedDir, e.name).replace(/\\/g, '/') + (e.isDirectory() ? '/' : ''),
        label: e.isDirectory() ? `📁 ${e.name}/` : `📄 ${e.name}`,
      }))
  } catch { return [] }
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

// Detecta imports locais de componentes .astro (exclui assets, pacotes npm e astro:*)
function detectLocalComponentImports(code, sourceDir) {
  const importRegex = /^import\s+(\w+)\s+from\s+['"](\.{1,2}\/[^'"]+\.astro)['"]/gm
  const found = []
  let match
  while ((match = importRegex.exec(code)) !== null) {
    const [fullMatch, importName, relativePath] = match
    const absolutePath = resolve(sourceDir, relativePath)
    if (existsSync(absolutePath)) {
      found.push({ importName, relativePath, absolutePath })
    }
  }
  return found
}

// Copia componentes filhos para a lib e retorna o mapa de reescrita de imports
function copyChildComponents(children, targetDir, category) {
  const rewrites = []
  for (const child of children) {
    const childBaseName = toPascal(basename(child.absolutePath, '.astro'))
    const childUid = randomId()
    const childName = `${childBaseName}${childUid}`
    const destPath = join(targetDir, `${childName}.astro`)
    let childCode = readFileSync(child.absolutePath, 'utf8')
    childCode = sanitizeCode(childCode)
    writeFileSync(destPath, childCode)
    rewrites.push({
      original: child.relativePath,
      newImport: `./${childName}.astro`,
      importName: child.importName,
      childName,
      destPath,
    })
  }
  return rewrites
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
  intro(c.bold(c.cyan('  ⚡ Astroteca — Extrair Componente')))

  // ── Pede o caminho se não foi passado como argumento ─────────────────────
  let resolvedPath = filePath ? resolve(filePath) : null

  if (!resolvedPath) {
    const pathInput = await text({
      message: 'Caminho do arquivo .astro:',
      placeholder: 'C:/PROJETOS/meu-projeto/src/components/Hero.astro',
      validate(v) {
        if (!v) return 'Informe o caminho do arquivo.'
        if (!v.trim().endsWith('.astro')) return 'O arquivo deve ter extensão .astro'
      },
    })
    if (isCancel(pathInput)) { cancel('Cancelado.'); process.exit(0) }
    resolvedPath = resolve(pathInput.trim())
  }

  if (!existsSync(resolvedPath)) {
    cancel(`Arquivo não encontrado: ${resolvedPath}`)
    process.exit(1)
  }

  const rawCode = readFileSync(resolvedPath, 'utf8')
  const fileName = basename(resolvedPath, '.astro')
  const baseName = toPascal(fileName)
  const uid = randomId()
  const name = `${baseName}${uid}`
  const id = toKebab(name)

  note(
    `Arquivo: ${basename(resolvedPath)}\nProps detectadas: ${detectProps(rawCode).map(p => p.name).join(', ') || 'nenhuma'}`,
    'Arquivo lido'
  )

  // ── Detecta props automaticamente ────────────────────────────────────────
  const detectedProps = detectProps(rawCode)

  // ── Categoria ────────────────────────────────────────────────────────────
  const catChoice = await select({
    message: 'Categoria:',
    options: CATEGORIES.map(cat => ({ value: cat, label: cat })),
  })
  if (isCancel(catChoice)) { cancel('Cancelado.'); process.exit(0) }
  const category = catChoice

  // ── Descrição ─────────────────────────────────────────────────────────────
  const descInput = await text({
    message: 'Descrição:',
    placeholder: `Componente ${name}`,
  })
  if (isCancel(descInput)) { cancel('Cancelado.'); process.exit(0) }
  const description = descInput.trim() || `Componente ${name}`

  // ── Tags ──────────────────────────────────────────────────────────────────
  const tagsInput = await text({
    message: 'Tags (separadas por vírgula):',
    placeholder: 'hero, cta, botao',
  })
  if (isCancel(tagsInput)) { cancel('Cancelado.'); process.exit(0) }
  const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : []

  // ── Best for ──────────────────────────────────────────────────────────────
  const bestForInput = await text({
    message: 'Ideal para (separado por vírgula):',
    placeholder: 'landing page, servicos',
  })
  if (isCancel(bestForInput)) { cancel('Cancelado.'); process.exit(0) }
  const bestFor = bestForInput ? bestForInput.split(',').map(t => t.trim()).filter(Boolean) : []

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
  const s = spinner()
  s.start('Extraindo componente...')

  // 1. Detecta e copia componentes filhos locais
  const sourceDir = dirname(resolvedPath)
  const childImports = detectLocalComponentImports(rawCode, sourceDir)
  const childRewrites = childImports.length > 0
    ? copyChildComponents(childImports, LIB_DIR, category)
    : []

  // 2. Componente adaptado e sanitizado, com imports reescritos
  let adaptedCode = sanitizeCode(rawCode)
  for (const rw of childRewrites) {
    adaptedCode = adaptedCode.replace(
      new RegExp(`from\\s+['"]${rw.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`),
      `from '${rw.newImport}'`
    )
  }
  writeFileSync(COMP_FILE, adaptedCode)

  // 2. Preview
  writeFileSync(PREV_FILE, generatePreviewCode(name, category, detectedProps))

  // 3. index.ts da categoria
  let indexContent = existsSync(INDEX_FILE) ? readFileSync(INDEX_FILE, 'utf8') : ''
  const exportLine = `export { default as ${name} } from './${name}.astro'`
  if (!indexContent.includes(exportLine)) {
    indexContent = indexContent.trimEnd() + (indexContent ? '\n' : '') + exportLine + '\n'
    writeFileSync(INDEX_FILE, indexContent)
  }

  // 4. src/index.ts principal
  let libIndex = existsSync(LIB_INDEX) ? readFileSync(LIB_INDEX, 'utf8') : ''
  const libLine = `export * from './components/${category}/index'`
  if (!libIndex.includes(libLine)) {
    libIndex = libIndex.trimEnd() + (libIndex ? '\n' : '') + libLine + '\n'
    writeFileSync(LIB_INDEX, libIndex)
  }

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

  s.stop('Arquivos criados!')

  const childLines = childRewrites.map(rw => `minha-lib-astro/src/components/${category}/${rw.childName}.astro (filho)`).join('\n')
  note(
    `minha-lib-astro/src/components/${category}/${name}.astro\n` +
    (childLines ? childLines + '\n' : '') +
    `minha-lib-astro/src/components/${category}/${name}.preview.astro\n` +
    `minha-lib-astro/registry.json`,
    'Arquivos gerados'
  )

  outro(c.bold(c.green(`✅ "${name}" extraído com sucesso!`)) + '\n\n' +
    `  Próximos passos:\n` +
    `  ${c.yellow('1.')} Revise e ajuste o preview em minha-lib-astro/src/components/${category}/${name}.preview.astro\n` +
    `  ${c.yellow('2.')} Gere os previews:  npm run previews\n` +
    `  ${c.yellow('3.')} Suba pro GitHub:   git add . && git commit -m "feat: ${name}" && git push`
  )
}

main().catch(e => { console.error('  Erro:', e.message); process.exit(1) })
