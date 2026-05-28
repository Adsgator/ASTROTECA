#!/usr/bin/env node
// scripts/extract-component.mjs
// Extrai um componente Astro de um projeto existente e o registra na biblioteca
//
// Uso:
//   npm run extract
//   node scripts/extract-component.mjs caminho/para/Componente.astro

import { intro, outro, text, select, multiselect, isCancel, cancel, note, spinner } from '@clack/prompts'
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { resolve, join, basename, dirname, relative } from 'node:path'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { execSync } from 'node:child_process'

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

const CATEGORIES = ['Hero', 'Features', 'Services', 'Testimonials', 'Process', 'Pricing', 'FAQ', 'CTA', 'Contact', 'Footer', 'Trust', 'UI', 'Other']

// Componentes utilitários que sempre ganham a pasta UI (independente do contexto)
const UI_COMPONENTS = /^(button|btn|icon|badge|tag|chip|card|modal|dialog|tooltip|popover|dropdown|input|textarea|select|checkbox|radio|toggle|switch|form|label|avatar|spinner|loader|alert|toast|banner|divider|separator|breadcrumb|pagination|tab|accordion|collapse|drawer|sidebar|nav|navbar|menu|link|image|img|picture|video|embed)s?(\d+)?$/i

// Infere a categoria de um componente filho pelo nome
function inferCategory(name) {
  const n = name.toLowerCase().replace(/\d+$/, '')
  if (UI_COMPONENTS.test(n))        return 'UI'
  if (/^hero/.test(n))              return 'Hero'
  if (/^feature/.test(n))           return 'Features'
  if (/^service/.test(n))           return 'Services'
  if (/^testimonial/.test(n))       return 'Testimonials'
  if (/^process|^step/.test(n))     return 'Process'
  if (/^pric/.test(n))              return 'Pricing'
  if (/^faq/.test(n))               return 'FAQ'
  if (/^cta/.test(n))               return 'CTA'
  if (/^contact/.test(n))           return 'Contact'
  if (/^footer/.test(n))            return 'Footer'
  if (/^trust|^award/.test(n))      return 'Trust'
  return 'Other'
}

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

// Converte imports absolutos pra relativos (usado em ambos os fluxos)
function normalizeAbsoluteImports(code) {
  return code.replace(
    /^(import\s+(\{[^}]+\}|\w+)\s+from\s+['"])([^'"]*?)minha-lib-astro[/\\]src[/\\]components[/\\]([^'"]+)(['"])/gm,
    (match, prefix, imports, _, rest, suffix) => {
      const normalized = rest.replace(/\\/g, '/')
      const depth = (normalized.match(/\//g) || []).length
      const upDirs = '../'.repeat(depth)
      return `${prefix}${upDirs}${normalized}${suffix}`
    }
  )
}

// Converte aliases de imports (@/, ~/) pra caminhos relativos
function resolveImportAliases(code, sourceDir, projectRoot) {
  // @/ → relativo ao project root
  code = code.replace(
    /^(import\s+(\{[^}]+\}|\w+)\s+from\s+)['"]@\/([^'"]+)['"](\s*;?)$/gm,
    (match, prefix, imports, path, semi) => {
      const relativePath = relative(sourceDir, join(projectRoot, path)).replace(/\\/g, '/')
      return `${prefix}'${relativePath || '.'}/${relativePath ? '' : path}'${semi}`
    }
  )

  // ~/ → relativo ao project root (mesmo que @/)
  code = code.replace(
    /^(import\s+(\{[^}]+\}|\w+)\s+from\s+)['"]~\/([^'"]+)['"](\s*;?)$/gm,
    (match, prefix, imports, path, semi) => {
      const relativePath = relative(sourceDir, join(projectRoot, path)).replace(/\\/g, '/')
      return `${prefix}'${relativePath || '.'}/${relativePath ? '' : path}'${semi}`
    }
  )

  return code
}

// Sanitiza dados sensíveis e remove assets (PARA BIBLIOTECA)
function sanitizeForLibrary(code) {
  // Remove imports de assets (todos os padrões)
  const assetPatterns = [
    /^import\s+\{[^}]*\}\s+from\s+['"][^'"]*\/assets[^'"]*['"];?\s*$/gm,
    /^import\s+(\w+)\s+from\s+['"][^'"]*\/assets\/[^'"]*['"];?\s*$/gm,
    /^import\s+(\w+)\s+from\s+['"](?:\.{1,2}\/)*(?:@|~)?\/?\s*assets\/[^'"]*['"];?\s*$/gm,
  ]

  const removedAssetVars = []
  for (const pattern of assetPatterns) {
    code = code.replace(pattern, (match) => {
      const varMatch = match.match(/import\s+(?:\{[^}]*\}|(\w+))/)
      if (varMatch?.[1]) removedAssetVars.push(varMatch[1])
      return ''
    })
  }

  // Remove referências às variáveis de asset removidas
  for (const v of removedAssetVars) {
    code = code.replace(new RegExp(`(\\w+):\\s*${v}\\s*,`, 'g'), '')
    code = code.replace(new RegExp(`\\w+=\\{${v}\\}`, 'g'), '')
  }

  // Remove Image/Picture components que usavam assets locais
  code = code.replace(/<Image\s+[^/]*src=\{[^}]+\}[^/]*\/?>/gs, '<img src="/preview-assets/placeholder.svg" alt="imagem" />')
  code = code.replace(/<Picture\s+[^/]*\/>/gs, '<img src="/preview-assets/placeholder.svg" alt="imagem" />')

  // Remove imports do Astro Image se não houver mais referências
  if (!code.includes('Image') && !code.includes('Picture')) {
    code = code.replace(/^import\s+\{?\s*(?:Image|Picture|getImage)[^}]*\}\s+from\s+['"]astro\/assets['"];?\s*$/gm, '')
  }

  // Substitui dados sensíveis
  code = code.replace(/https:\/\/wa\.me\/[^\s'"]+/g, 'https://wa.me/5500000000000')
  code = code.replace(/\(\d{2}\)\s?9?\d{4}[-\s]?\d{4}/g, '(00) 00000-0000')
  code = code.replace(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g, '00.000.000/0000-00')
  code = code.replace(/href="https:\/\/(www\.)?(instagram|tiktok|facebook|youtube|linkedin)\.com\/[^"]+"/g, 'href="#"')

  // Remove dados hardcoded que parecem IDs/URLs específicas
  code = code.replace(/data-project-id=["'][^"']+["']/g, 'data-project-id="project-id"')
  code = code.replace(/data-account-id=["'][^"']+["']/g, 'data-account-id="account-id"')

  // Avisa sobre cores hardcoded
  const hasTailwindColors = /\b(bg|text|border)-(red|blue|green|purple|indigo|violet|pink|orange|yellow|gray|slate|zinc|neutral|stone|amber|lime|emerald|teal|cyan|sky|fuchsia|rose)-\d+/g.test(code)
  if (hasTailwindColors) {
    code = code.replace('---', `---
// ⚠️  ATENÇÃO: Este componente foi extraído de outro projeto.
// Substitua as classes Tailwind de cor hardcoded (ex: bg-violet-600)
// por classes que usam CSS variables (ex: bg-[var(--color-primary)])
`)
  }

  // Avisa sobre variáveis de ambiente
  if (/import\.meta\.env\.|process\.env\.|Astro\.locals\./.test(code)) {
    code = code.replace('---', `---
// ⚠️  ATENÇÃO: Este componente usa variáveis de ambiente.
// Configure as seguintes env vars no seu projeto antes de usar este componente.
`)
  }

  return code
}

// Mantém código intacto mas fixa imports (PARA PREVIEW)
function sanitizeForPreview(code) {
  // Só fixa os imports absolutos, mantém tudo mais igual ao original
  return normalizeAbsoluteImports(code)
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

// Copia componentes filhos para a lib, cada um na sua própria pasta de categoria
function copyChildComponents(children, ROOT, sourceDir) {
  const rewrites = []
  for (const child of children) {
    const childBaseName = toPascal(basename(child.absolutePath, '.astro'))
    const childUid = randomId()
    const childName = `${childBaseName}${childUid}`
    const childCategory = child.category
    const childDir = join(ROOT, 'minha-lib-astro', 'src', 'components', childCategory)
    if (!existsSync(childDir)) mkdirSync(childDir, { recursive: true })
    const destPath = join(childDir, `${childName}.astro`)

    let childCode = readFileSync(child.absolutePath, 'utf8')
    // Aplica mesmas transformações que o componente pai
    childCode = normalizeAbsoluteImports(childCode)
    childCode = resolveImportAliases(childCode, dirname(child.absolutePath), ROOT)
    childCode = sanitizeForLibrary(childCode)
    writeFileSync(destPath, childCode)

    // Caminho relativo do componente pai até o filho (pode estar em pasta diferente)
    rewrites.push({
      original: child.relativePath,
      // import relativo será calculado na hora da reescrita
      childName,
      childCategory,
      childDir,
      destPath,
      importName: child.importName,
    })
  }
  return rewrites
}

// ── Detecção de tokens extras ─────────────────────────────────────────────────

// Mapeia cada seção de token para os prefixos de classe Tailwind que a usam
const TOKEN_CLASS_PATTERNS = {
  colors:       key => [`text-${key}`, `bg-${key}`, `border-${key}`, `ring-${key}`,
                         `from-${key}`, `to-${key}`, `via-${key}`, `fill-${key}`,
                         `stroke-${key}`, `decoration-${key}`, `placeholder-${key}`,
                         `caret-${key}`, `outline-${key}`, `shadow-${key}`],
  fontFamily:   key => [`font-${key}`],
  fontSize:     key => [`text-${key}`],
  spacing:      key => [`p-${key}`, `py-${key}`, `px-${key}`, `pt-${key}`, `pb-${key}`,
                         `pl-${key}`, `pr-${key}`, `m-${key}`, `my-${key}`, `mx-${key}`,
                         `mt-${key}`, `mb-${key}`, `ml-${key}`, `mr-${key}`,
                         `gap-${key}`, `w-${key}`, `h-${key}`, `inset-${key}`],
  maxWidth:     key => [`max-w-${key}`],
  borderRadius: key => [`rounded-${key}`],
  boxShadow:    key => [`shadow-${key}`],
}

// Gera todos os nomes de classe candidatos para um token (inclui sub-chaves de objetos nested)
function tokenCandidateClasses(section, key, value) {
  const patterns = TOKEN_CLASS_PATTERNS[section]
  if (!patterns) return []
  const candidates = []
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    // Objeto nested: gera para DEFAULT e para cada sub-chave
    if ('DEFAULT' in value) candidates.push(...patterns(key))
    for (const subKey of Object.keys(value)) {
      if (subKey !== 'DEFAULT') candidates.push(...patterns(`${key}-${subKey}`))
    }
  } else {
    candidates.push(...patterns(key))
  }
  return candidates
}

// Sobe a árvore de diretórios procurando tailwind.config.js do projeto de origem
function findProjectTailwindConfig(startDir) {
  let dir = startDir
  for (let i = 0; i < 8; i++) {
    const candidate = join(dir, 'tailwind.config.js')
    if (existsSync(candidate)) return candidate
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

// Detecta tokens usados no componente que não existem na base Astroteca
async function detectExtraTokens(code, sourceDir, ROOT) {
  const projectConfigPath = findProjectTailwindConfig(sourceDir)
  if (!projectConfigPath) return {}

  let projectConfig, baseModule
  try {
    const req = createRequire(import.meta.url)
    projectConfig = req(projectConfigPath)
  } catch { return {} }

  try {
    baseModule = await import(pathToFileURL(join(ROOT, 'tailwind-tokens.js')).href)
  } catch { return {} }

  const projectExtend = projectConfig?.theme?.extend ?? {}
  const baseTokens    = baseModule.tokens ?? {}
  const SECTIONS      = ['colors', 'fontFamily', 'fontSize', 'spacing', 'maxWidth', 'borderRadius', 'boxShadow']
  const extra         = {}

  for (const section of SECTIONS) {
    const projectSection = projectExtend[section]
    if (!projectSection) continue
    const baseSection = baseTokens[section] ?? {}

    for (const [key, value] of Object.entries(projectSection)) {
      // Já existe na base → não precisa carregar
      if (key in baseSection) continue

      // Verifica se alguma classe candidata é usada no código do componente
      const candidates = tokenCandidateClasses(section, key, value)
      const isUsed = candidates.some(cls =>
        new RegExp(`(?:^|[\\s"'\\[{])${cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:[\\s"'\\]:/}]|$)`).test(code)
      )

      if (isUsed) {
        if (!extra[section]) extra[section] = {}
        extra[section][key] = value
      }
    }
  }

  return extra
}

function generatePreviewCode(name, _category, props, fullCode) {
  // Se passou código completo do componente, usa ele direto (visual igual ao original)
  if (fullCode) {
    return fullCode
  }

  // Fallback: gera preview simples com props de exemplo
  const propsStr = props
    .filter(p => p.type === 'string')
    .map(p => `  ${p.name}="${EXAMPLES[p.name] || `Exemplo de ${p.name}`}"`)
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

  // ── Filhos: detecta, pergunta quais importar, define categorias ──────────
  const sourceDir = dirname(resolvedPath)
  const allChildImports = detectLocalComponentImports(rawCode, sourceDir)

  let chosenChildren = []
  if (allChildImports.length > 0) {
    note(
      allChildImports.map(c => `• ${c.importName}  →  ${basename(c.absolutePath)}`).join('\n'),
      `${allChildImports.length} componente(s) filho(s) detectado(s)`
    )

    const chosen = await multiselect({
      message: 'Quais filhos deseja importar para a biblioteca?',
      options: allChildImports.map(c => ({
        value: c.importName,
        label: `${c.importName}`,
        hint: `${basename(c.absolutePath)} → pasta: ${inferCategory(c.importName)}`,
      })),
      initialValues: allChildImports.map(c => c.importName),
    })
    if (isCancel(chosen)) { cancel('Cancelado.'); process.exit(0) }

    chosenChildren = allChildImports
      .filter(c => chosen.includes(c.importName))
      .map(c => ({ ...c, category: inferCategory(c.importName) }))
  }

  // ── Detecta tokens extras do projeto de origem ────────────────────────────
  const extraTokens = await detectExtraTokens(rawCode, sourceDir, ROOT)
  if (Object.keys(extraTokens).length > 0) {
    const tokenSummary = Object.entries(extraTokens)
      .map(([section, keys]) => `• ${section}: ${Object.keys(keys).join(', ')}`)
      .join('\n')
    note(tokenSummary, 'Tokens extras detectados (serão salvos no registry)')
  }

  // ── Cria os arquivos ───────────────────────────────────────────────────────
  const s = spinner()
  s.start('Extraindo componente...')

  // 1. Copia filhos escolhidos, cada um na sua pasta de categoria
  const childRewrites = chosenChildren.length > 0
    ? copyChildComponents(chosenChildren, ROOT, sourceDir)
    : []

  // 2a. Prepara código base (fixa imports absolutos)
  let baseCode = normalizeAbsoluteImports(rawCode)
  baseCode = resolveImportAliases(baseCode, sourceDir, ROOT)

  // 2b. Gera versão PARA BIBLIOTECA (limpa)
  let libraryCode = sanitizeForLibrary(baseCode)

  // 2c. Gera versão PARA PREVIEW (mantém dados originais)
  let previewCode = sanitizeForPreview(baseCode)

  // Reescreve imports dos filhos escolhidos em AMBAS as versões
  for (const rw of childRewrites) {
    const relToParent = join(rw.childDir, `${rw.childName}.astro`)
      .replace(LIB_DIR, '.')
      .replace(/\\/g, '/')

    const importRegex = new RegExp(`import\\s+${rw.importName}\\s+from\\s+['"]${rw.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`)
    libraryCode = libraryCode.replace(importRegex, `import ${rw.importName} from '${relToParent}'`)
    previewCode = previewCode.replace(importRegex, `import ${rw.importName} from '${relToParent}'`)
  }

  // Remove (comenta) imports dos filhos NÃO escolhidos em AMBAS as versões
  const rejectedChildren = allChildImports.filter(
    c => !chosenChildren.find(ch => ch.importName === c.importName)
  )
  for (const rj of rejectedChildren) {
    const commentRegex = new RegExp(`^import\\s+${rj.importName}\\s+from\\s+['"][^'"]+['"];?\\s*$`, 'gm')
    libraryCode = libraryCode.replace(commentRegex, `// import ${rj.importName} removido`)
    previewCode = previewCode.replace(commentRegex, `// import ${rj.importName} removido`)
  }

  // Salva componente limpo para a biblioteca
  writeFileSync(COMP_FILE, libraryCode)

  // Salva componente completo para o preview
  writeFileSync(PREV_FILE, generatePreviewCode(name, category, detectedProps, previewCode))

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
    ...(Object.keys(extraTokens).length > 0 ? { tokens: extraTokens } : {}),
  })
  writeFileSync(REGISTRY, JSON.stringify(registry, null, 2) + '\n')

  s.stop('Arquivos criados!')

  const childLines = childRewrites.map(rw => `minha-lib-astro/src/components/${rw.childCategory}/${rw.childName}.astro  (filho)`).join('\n')
  note(
    `minha-lib-astro/src/components/${category}/${name}.astro\n` +
    (childLines ? childLines + '\n' : '') +
    `minha-lib-astro/src/components/${category}/${name}.preview.astro\n` +
    `minha-lib-astro/registry.json`,
    'Arquivos gerados'
  )

  // ── Gera páginas de preview e commita o ASTROTECA ────────────────────────
  const s2 = spinner()
  s2.start('Gerando previews e publicando...')
  try {
    execSync('node scripts/generate-previews.mjs', { cwd: ROOT, stdio: 'pipe' })
    execSync(`git add src/pages/preview/ && git commit -m "feat: preview ${id}" && git push`, {
      cwd: ROOT,
      stdio: 'pipe',
      shell: true,
    })
    s2.stop('Preview publicado!')
  } catch (e) {
    s2.stop(c.yellow('⚠ Não foi possível publicar o preview automaticamente.'))
    note(e.message?.slice(0, 200) ?? '', 'Erro')
  }

  outro(c.bold(c.green(`✅ "${name}" extraído e publicado!`)))
}

main().catch(e => { console.error('  Erro:', e.message); process.exit(1) })
