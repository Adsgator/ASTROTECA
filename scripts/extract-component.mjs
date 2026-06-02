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
import { execSync } from 'node:child_process'
import { recordComponentExtraction } from './analytics.mjs'
import { EXAMPLES as _EXAMPLES } from './utils.mjs'
import {
  toPascal, toKebab, deterministicSuffix, COMPONENT_CATEGORIES as CATEGORIES,
  inferCategory, detectProps, detectSlots, extractCopyDefaults, sanitizeCode,
} from './component-core.mjs'

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

const EXAMPLES = _EXAMPLES

// Converte imports absolutos pra relativos (usado em ambos os fluxos)
function normalizeAbsoluteImports(code) {
  return code.replace(
    /^(import\s+(\{[^}]+\}|\w+)\s+from\s+['"])([^'"]*?)minha-lib-astro[/\\]src[/\\]components[/\\]([^'"]+)(['"])/gm,
    (match, prefix, imports, _, rest, suffix) => {
      const normalized = rest.replace(/\\/g, '/')
      return `${prefix}../${normalized}${suffix}`
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
      return `${prefix}'${relativePath || `./${path}`}'${semi}`
    }
  )

  // ~/ → relativo ao project root (mesmo que @/)
  code = code.replace(
    /^(import\s+(\{[^}]+\}|\w+)\s+from\s+)['"]~\/([^'"]+)['"](\s*;?)$/gm,
    (match, prefix, imports, path, semi) => {
      const relativePath = relative(sourceDir, join(projectRoot, path)).replace(/\\/g, '/')
      return `${prefix}'${relativePath || `./${path}`}'${semi}`
    }
  )

  return code
}

// Detecta CSS Modules
function detectCSSModules(code) {
  const cssModuleRegex = /^import\s+(\w+)\s+from\s+['"][^'"]*\.module\.css['"];?\s*$/gm
  const modules = []
  let match
  while ((match = cssModuleRegex.exec(code)) !== null) {
    modules.push(match[1])
  }
  return modules
}

// Detecta componentes React/Vue
function detectFrameworkComponents(code) {
  const reactVueRegex = /^import\s+\{?(\w+)\}?\s+from\s+['"]\.\/([^'"]*\.(jsx|tsx|vue))['"];?\s*$/gm
  const components = []
  let match
  while ((match = reactVueRegex.exec(code)) !== null) {
    const ext = match[3]
    components.push({ name: match[1], file: match[2], type: ext === 'vue' ? 'Vue' : 'React' })
  }
  return components
}

// detectSlots e extractCopyDefaults vêm de component-core.mjs (fonte única)

// Detecta imports dinâmicos
function detectDynamicImports(code) {
  const dynamicPatterns = [
    /import\s*\(\s*['"][^'"]+['"]\s*\)/g,
    /import\.meta\.glob\(/g,
  ]
  return dynamicPatterns.some(p => p.test(code))
}

// Sanitiza dados sensíveis e remove assets (PARA BIBLIOTECA)
function sanitizeForLibrary(code) {
  // Parte comum com as APIs (assets locais, Image/Picture, dados sensíveis,
  // preservando import type) vem do núcleo único — mesma regra dos endpoints /admin.
  code = sanitizeCode(code)

  // ── Extras exclusivos do CLI (não fazem parte do motor das APIs) ──

  // Detecta CSS Modules — remove imports e substitui usos
  const cssModules = detectCSSModules(code)
  for (const moduleName of cssModules) {
    code = code.replace(new RegExp(`^import\\s+${moduleName}\\s+from\\s+['"][^'"]*\\.module\\.css['"];?\\s*$`, 'gm'), '')
    // Substitui styles.className por string de classe (aviso comentado)
    code = code.replace(new RegExp(`\\$\\{${moduleName}\\.(\\w+)\\}`, 'g'), `/* Classe: \$1 */ \$1`)
    code = code.replace(new RegExp(`${moduleName}\\.(\\w+)`, 'g'), `\$1 /* do CSS Module */`)
  }

  // Detecta React/Vue components
  const frameworkComps = detectFrameworkComponents(code)

  // Substitui dados sensíveis
  code = code.replace(/https:\/\/wa\.me\/[^\s'"]+/g, 'https://wa.me/5500000000000')
  code = code.replace(/\(\d{2}\)\s?9?\d{4}[-\s]?\d{4}/g, '(00) 00000-0000')
  code = code.replace(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g, '00.000.000/0000-00')
  code = code.replace(/href="https:\/\/(www\.)?(instagram|tiktok|facebook|youtube|linkedin)\.com\/[^"]+"/g, 'href="#"')

  // Remove dados hardcoded que parecem IDs/URLs específicas
  code = code.replace(/data-project-id=["'][^"']+["']/g, 'data-project-id="project-id"')
  code = code.replace(/data-account-id=["'][^"']+["']/g, 'data-account-id="account-id"')

  // Acumula avisos e insere de uma vez no frontmatter (evita replace('---') encadeado que aninha avisos)
  const hasTailwindColors = /\b(bg|text|border)-(red|blue|green|purple|indigo|violet|pink|orange|yellow|gray|slate|zinc|neutral|stone|amber|lime|emerald|teal|cyan|sky|fuchsia|rose)-\d+/g.test(code)
  const warnings = []
  if (frameworkComps.length > 0) {
    const reactLine = frameworkComps.some(c => c.type === 'React') ? '//   npm install @astrojs/react react react-dom\n' : ''
    const vueLine = frameworkComps.some(c => c.type === 'Vue') ? '//   npm install @astrojs/vue vue\n' : ''
    warnings.push(`// ⚠️  ATENÇÃO: Este componente importa componentes React/Vue.\n// Instale as dependências necessárias:\n${reactLine}${vueLine}`)
  }
  if (detectDynamicImports(code)) {
    warnings.push('// ⚠️  ATENÇÃO: Este componente usa imports dinâmicos.\n// Valide que todas as dependências estão disponíveis em runtime.')
  }
  if (hasTailwindColors) {
    warnings.push('// ⚠️  ATENÇÃO: Este componente foi extraído de outro projeto.\n// Substitua as classes Tailwind de cor hardcoded (ex: bg-violet-600)\n// por classes que usam CSS variables (ex: bg-[var(--color-primary)])')
  }
  if (/import\.meta\.env\.|process\.env\.|Astro\.locals\./.test(code)) {
    warnings.push('// ⚠️  ATENÇÃO: Este componente usa variáveis de ambiente.\n// Configure as seguintes env vars no seu projeto antes de usar este componente.')
  }
  if (warnings.length > 0) {
    code = code.replace(/^---/m, `---\n${warnings.join('\n')}`)
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
  // Captura: import Name from '../../components/Child.astro' (qualquer nível de ..)
  const importRegex = /^import\s+(\w+)\s+from\s+['"]((?:\.{1,2}\/)+[^'"]+\.astro)['"]/gm
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
    const childName = `${childBaseName}${deterministicSuffix(childBaseName)}`
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

// ── Detecção de tokens extras (stack v4 — tokens.css com prefixo --t-) ─────────
//
// A biblioteca usa Tailwind v4 CSS-first: os tokens-base vivem em
// _base-project/src/styles/tokens.css como custom properties --t-*, mapeadas
// por @theme para utilitários (bg-primary, text-text-main, font-serif…).
// Aqui detectamos tokens que o componente extraído referencia mas que NÃO
// existem na base — para registrá-los e avisar que precisam ser criados.

// Lê o conjunto de nomes de token base (sem o prefixo --t-) do tokens.css.
function readBaseTokenNames(ROOT) {
  try {
    const css = readFileSync(join(ROOT, '_base-project', 'src', 'styles', 'tokens.css'), 'utf8')
    const names = new Set()
    for (const m of css.matchAll(/--t-([a-z0-9-]+)\s*:/gi)) names.add(m[1].toLowerCase())
    return names
  } catch {
    return null
  }
}

// Utilitários Tailwind de cor/tipografia que mapeiam para um token --t-<name>.
// Mantém só os prefixos realmente usados no design system (ver COMPONENT-BLUEPRINT.md).
const TOKEN_UTILITY_PREFIXES = ['bg', 'text', 'border', 'from', 'to', 'via', 'ring', 'fill', 'stroke', 'font']

// Detecta tokens usados no componente que não existem na base v4.
// Retorna { tokenName: "var" | "class" } — vazio se tudo já existe ou base ausente.
function detectExtraTokens(code, _sourceDir, ROOT) {
  const baseNames = readBaseTokenNames(ROOT)
  if (!baseNames) return {}

  const used = new Map() // nome do token → origem ("var" ou "class")

  // 1. Uso direto em CSS escopado: var(--t-XXX)
  for (const m of code.matchAll(/var\(\s*--t-([a-z0-9-]+)\s*[),]/gi)) {
    used.set(m[1].toLowerCase(), 'var')
  }

  // 2. Classes utilitárias de token: bg-primary, text-text-main, font-serif…
  //    Considera apenas classes cujo "nome" bate com um token --t- existente OU
  //    que claramente seguem o padrão do design system mas faltam na base.
  for (const prefix of TOKEN_UTILITY_PREFIXES) {
    const re = new RegExp(`\\b${prefix}-([a-z][a-z0-9-]*)\\b`, 'gi')
    for (const m of code.matchAll(re)) {
      const tokenName = m[1].toLowerCase()
      // ignora se já registrado como var
      if (!used.has(tokenName)) used.set(tokenName, 'class')
    }
  }

  const extra = {}
  for (const [name, origin] of used) {
    if (!baseNames.has(name)) extra[name] = origin
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
  const name = `${baseName}${deterministicSuffix(baseName)}`
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
  // Detecta filhos APÓS resolver aliases para capturar @/ e ~/ imports também
  const resolvedBaseCode = resolveImportAliases(normalizeAbsoluteImports(rawCode), sourceDir, resolve(process.cwd()))
  const allChildImports = detectLocalComponentImports(resolvedBaseCode, sourceDir)

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
  const extraTokens = detectExtraTokens(rawCode, sourceDir, ROOT)
  if (Object.keys(extraTokens).length > 0) {
    const tokenSummary = Object.entries(extraTokens)
      .map(([name, origin]) => `• --t-${name} (via ${origin === 'var' ? 'var()' : 'classe'})`)
      .join('\n')
    note(tokenSummary, 'Tokens fora da base detectados — crie-os em tokens.css')
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
    let relToParent = relative(LIB_DIR, join(rw.childDir, `${rw.childName}.astro`))
      .replace(/\\/g, '/')
    if (!relToParent.startsWith('.')) relToParent = './' + relToParent

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

  // Detecta slots (default + nomeados)
  const slots = detectSlots(previewCode)

  // Extrai textos padrão do template como defaults de copy
  const copyDefaults = extractCopyDefaults(previewCode)

  const registryEntry = {
    id, name, category, description,
    previewPath: `/preview/${id}`,
    screenshotUrl: '',
    componentFile: `${category}/${name}.astro`,
    tags, bestFor,
    props: detectedProps.map(p => ({
      name: p.name, type: p.type, required: p.required,
      ...(p.default ? { default: p.default } : {}),
    })),
    order: registry.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...(slots.length > 0 ? { slots } : {}),
    ...(copyDefaults ? { copy: copyDefaults } : {}),
    ...(Object.keys(extraTokens).length > 0 ? { tokens: extraTokens } : {}),
  }
  registry.push(registryEntry)
  writeFileSync(REGISTRY, JSON.stringify(registry, null, 2) + '\n')

  // Registra a extração no analytics
  try {
    recordComponentExtraction(id, name, category)
  } catch (e) {
    // Falha silenciosa — analytics não deve quebrar a extração
  }

  s.stop('Arquivos criados!')

  const childLines = childRewrites.map(rw => `minha-lib-astro/src/components/${rw.childCategory}/${rw.childName}.astro  (filho)`).join('\n')
  note(
    `minha-lib-astro/src/components/${category}/${name}.astro\n` +
    (childLines ? childLines + '\n' : '') +
    `minha-lib-astro/src/components/${category}/${name}.preview.astro\n` +
    `minha-lib-astro/registry.json`,
    'Arquivos gerados'
  )

  // ── Commita e publica o repo in-tree minha-lib-astro ─────────────────────
  const s2 = spinner()
  s2.start('Publicando componente na biblioteca...')
  const LIB_ROOT = join(ROOT, 'minha-lib-astro')
  try {
    execSync('git pull --no-edit', { cwd: LIB_ROOT, stdio: 'pipe' })
  } catch { /* se não tiver nada novo, ignora */ }
  try {
    execSync(`git add -A && git commit -m "feat: add ${name} component"`, {
      cwd: LIB_ROOT,
      stdio: 'pipe',
      shell: true,
    })
    execSync('git push', { cwd: LIB_ROOT, stdio: 'pipe' })
    s2.stop('Componente publicado na biblioteca!')
  } catch (e) {
    s2.stop(c.yellow('⚠ Não foi possível publicar o componente na biblioteca.'))
    note(e.message?.slice(0, 200) ?? '', 'Erro biblioteca')
  }

  // ── Gera páginas de preview e commita o ASTROTECA ────────────────────────
  const s3 = spinner()
  s3.start('Gerando previews e publicando Astroteca...')
  try {
    execSync('node scripts/generate-previews.mjs', { cwd: ROOT, stdio: 'pipe' })
    execSync(`git add minha-lib-astro src/pages/preview/ public/data/analytics.json && git commit -m "feat: extract ${id} + update lib ref" && git push`, {
      cwd: ROOT,
      stdio: 'pipe',
      shell: true,
    })
    s3.stop('Preview publicado!')
  } catch (e) {
    s3.stop(c.yellow('⚠ Não foi possível publicar o preview automaticamente.'))
    note(e.message?.slice(0, 200) ?? '', 'Erro')
  }

  outro(c.bold(c.green(`✅ "${name}" extraído e publicado!`)))
}

main().catch(e => { console.error('  Erro:', e.message); process.exit(1) })
