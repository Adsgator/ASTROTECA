import type { APIRoute } from 'astro'
import type { ComponentMeta, PropDefinition } from '../../types'
import {
  existsSync, readFileSync, writeFileSync, mkdirSync,
} from 'node:fs'
import { resolve, join, basename, dirname } from 'node:path'
import { execSync } from 'node:child_process'
import { toBase64 } from '../../lib/utils'

const ROOT = resolve(process.cwd())

// ── helpers (espelho do script CLI) ──────────────────────────────────────────

const toPascal = (s: string) =>
  s.replace(/(^\w|-\w|_\w)/g, m => m.replace(/[-_]/, '').toUpperCase())

const toKebab = (s: string) =>
  s.replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
   .replace(/([a-z])([A-Z])/g, '$1-$2')
   .replace(/([a-zA-Z])(\d)/g, '$1-$2')
   .replace(/[\s_]+/g, '-')
   .toLowerCase()

const randomId = () => String(Math.floor(1000 + Math.random() * 9000))

const UI_COMPONENTS = /^(button|btn|icon|badge|tag|chip|card|modal|dialog|tooltip|popover|dropdown|input|textarea|select|checkbox|radio|toggle|switch|form|label|avatar|spinner|loader|alert|toast|banner|divider|separator|breadcrumb|pagination|tab|accordion|collapse|drawer|sidebar|nav|navbar|menu|link|image|img|picture|video|embed)s?(\d+)?$/i

function inferCategory(name: string): string {
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

function sanitize(code: string): string {
  // 1. Remove imports de assets — detecta quais variáveis foram removidas
  const assetImportPatterns = [
    /^import\s+\{[^}]*\}\s+from\s+['"][^'"]*\/assets[^'"]*['"];?\s*$/gm,
    /^import\s+(\w+)\s+from\s+['"][^'"]*\/assets\/[^'"]*['"];?\s*$/gm,
    /^import\s+(\w+)\s+from\s+['"](?:\.{1,2}\/)*(?:@|~)?\/?\s*assets\/[^'"]*['"];?\s*$/gm,
  ]

  const removedAssetVars: string[] = []
  for (const pattern of assetImportPatterns) {
    code = code.replace(pattern, (match) => {
      const namedMatch = match.match(/import\s+\{([^}]+)\}/)
      const defaultMatch = match.match(/import\s+(\w+)\s+from/)
      if (namedMatch?.[1]) {
        namedMatch[1].split(',')
          .map(s => s.trim().split(/\s+as\s+/).pop())
          .filter((v): v is string => Boolean(v))
          .forEach(v => removedAssetVars.push(v))
      } else if (defaultMatch?.[1]) {
        removedAssetVars.push(defaultMatch[1])
      }
      return ''
    })
  }

  // 2. Remove referências às variáveis de asset removidas em estruturas de dados
  for (const v of removedAssetVars) {
    const escapedV = v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // Caso 1: Propriedade em sua própria linha (com ou sem vírgula)
    // Match: "    image: leticiaImg," ou "    image: leticiaImg"
    const linePattern = new RegExp(String.raw`^\s*\w+:\s*` + escapedV + String.raw`\s*,?\s*$`, 'gm')
    code = code.replace(linePattern, '')

    // Caso 2: Propriedade inline em objeto (dentro de uma linha)
    // Match: "{ image: leticiaImg }" ou "{ image: leticiaImg, }" ou ", image: leticiaImg }"
    const inlinePattern = new RegExp(String.raw`(\{|,)\s*\w+:\s*` + escapedV + String.raw`\s*(?=,|\}|\n)`, 'g')
    code = code.replace(inlinePattern, '$1')
  }

  // 3. Remove referências restantes em expressões (JSX/template)
  for (const v of removedAssetVars) {
    const escapedV = v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // Em JSX/template: {leticiaImg} → {null}
    const exprPattern = new RegExp(String.raw`\{` + escapedV + String.raw`\}`, 'g')
    code = code.replace(exprPattern, '{null}')
  }

  // 4. Replace Image components
  code = code.replace(/<Image\s[^/]*src=\{[^}]+\}[^/]*\/>/gs, '<img src="/preview-assets/placeholder-hero.svg" alt="imagem" />')

  // 5. Sanitize sensitive data
  code = code.replace(/https:\/\/wa\.me\/[^\s'"]+/g, 'https://wa.me/5500000000000')
  code = code.replace(/\(\d{2}\)\s?9?\d{4}[-\s]?\d{4}/g, '(00) 00000-0000')
  code = code.replace(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g, '00.000.000/0000-00')
  code = code.replace(/href="https:\/\/(www\.)?(instagram|tiktok|facebook|youtube|linkedin)\.com\/[^"]+"/g, 'href="#"')

  return code
}

function detectChildren(code: string, sourceDir: string) {
  const re = /^import\s+(\w+)\s+from\s+['"](\.{1,2}\/[^'"]+\.astro)['"]/gm
  const found: { importName: string; relativePath: string; absolutePath: string }[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(code)) !== null) {
    const abs = resolve(sourceDir, m[2])
    if (existsSync(abs)) found.push({ importName: m[1], relativePath: m[2], absolutePath: abs })
  }
  return found
}

function findTailwindConfig(startDir: string): string | null {
  let dir = startDir
  for (let i = 0; i < 6; i++) {
    for (const name of ['tailwind.config.js', 'tailwind.config.ts', 'tailwind.config.mjs']) {
      const p = join(dir, name)
      if (existsSync(p)) return p
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

function extractTailwindTokens(configPath: string): string {
  try {
    const raw = readFileSync(configPath, 'utf8')
    const colorsMatch = raw.match(/colors\s*:\s*\{([^}]+)\}/s)
    const fontFamilyMatch = raw.match(/fontFamily\s*:\s*\{([^}]+)\}/s)

    const rootLines: string[] = []
    const utilityLines: string[] = []

    if (colorsMatch) {
      const re = /['"]?([\w-]+)['"]?\s*:\s*['"]([^'"]+)['"]/g
      let m: RegExpExecArray | null
      while ((m = re.exec(colorsMatch[1])) !== null) {
        const key = m[1]
        const val = m[2]
        rootLines.push(`  --color-${key}: ${val};`)
        // Gera classes Tailwind reais para o preview
        utilityLines.push(`.bg-${key} { background-color: ${val} !important; }`)
        utilityLines.push(`.bg-${key}\\/10 { background-color: ${val}1a !important; }`)
        utilityLines.push(`.bg-${key}\\/20 { background-color: ${val}33 !important; }`)
        utilityLines.push(`.bg-${key}\\/90 { background-color: ${val}e6 !important; }`)
        utilityLines.push(`.text-${key} { color: ${val} !important; }`)
        utilityLines.push(`.border-${key} { border-color: ${val} !important; }`)
        utilityLines.push(`.hover\\:bg-${key}:hover { background-color: ${val} !important; }`)
        utilityLines.push(`.hover\\:bg-${key}\\/90:hover { background-color: ${val}e6 !important; }`)
        utilityLines.push(`.outline-${key} { outline-color: ${val} !important; }`)
      }
    }

    if (fontFamilyMatch) {
      const re = /['"]?(\w+)['"]?\s*:\s*\[([^\]]+)\]/g
      let m: RegExpExecArray | null
      while ((m = re.exec(fontFamilyMatch[1])) !== null) {
        const firstFont = m[2].match(/['"]([^'"]+)['"]/) ?.[1] ?? ''
        if (firstFont) {
          rootLines.push(`  --font-${m[1]}: '${firstFont}', sans-serif;`)
          utilityLines.push(`.font-${m[1]} { font-family: '${firstFont}', sans-serif !important; }`)
        }
      }
    }

    if (rootLines.length === 0) return ''
    return `:root {\n${rootLines.join('\n')}\n}\n${utilityLines.join('\n')}`
  } catch {
    return ''
  }
}

function detectGoogleFonts(configPath: string): string[] {
  try {
    const raw = readFileSync(configPath, 'utf8')
    const fonts: string[] = []
    const re = /['"]([A-Z][a-zA-Z\s]+)['"]\s*,/g
    let m: RegExpExecArray | null
    while ((m = re.exec(raw)) !== null) {
      const name = m[1].trim()
      if (name.includes(' ') || name.match(/^[A-Z]/)) fonts.push(name)
    }
    return [...new Set(fonts)].slice(0, 4)
  } catch {
    return []
  }
}

function detectProps(code: string) {
  const match = code.match(/interface\s+Props\s*\{([^}]+)\}/s)
  if (!match) return []
  const re = /(\w+)(\?)?:\s*(string|boolean|number|string\[\]|\w+)/g
  const props: { name: string; type: string; required: boolean }[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(match[1])) !== null) {
    const type = m[3].includes('[]') ? 'array' : m[3]
    props.push({ name: m[1], type, required: !m[2] })
  }
  return props
}

// ── endpoint ─────────────────────────────────────────────────────────────────

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json() as {
      filePath: string
      category: string
      description: string
      tags: string[]
      bestFor: string[]
      chosenChildren: string[]   // importNames escolhidos
      phase: 'analyze' | 'extract'
    }

    const { filePath, phase } = body
    // "Copiar como caminho" no Windows adiciona aspas — remove
    const cleanPath = filePath.trim().replace(/^["']|["']$/g, '')
    const resolvedPath = resolve(cleanPath)

    if (!existsSync(resolvedPath)) {
      return json({ error: `Arquivo não encontrado: ${resolvedPath}` }, 400)
    }

    const rawCode = readFileSync(resolvedPath, 'utf8')
    const sourceDir = dirname(resolvedPath)
    const children = detectChildren(rawCode, sourceDir)
    const props = detectProps(rawCode)

    // Fase 1: só analisar — retorna props e filhos detectados sem gravar nada
    if (phase === 'analyze') {
      return json({
        fileName: basename(resolvedPath),
        props,
        children: children.map(c => ({
          importName: c.importName,
          fileName: basename(c.absolutePath),
          suggestedCategory: inferCategory(c.importName),
        })),
      })
    }

    // Fase 2: extrair de verdade
    const { category, description, tags, bestFor, chosenChildren } = body
    const baseName = toPascal(basename(resolvedPath, '.astro'))
    const uid = randomId()
    const name = `${baseName}${uid}`
    const id = toKebab(name)

    const LIB_DIR   = join(ROOT, 'minha-lib-astro', 'src', 'components', category)
    const COMP_FILE = join(LIB_DIR, `${name}.astro`)
    const PREV_FILE = join(LIB_DIR, `${name}.preview.astro`)
    const INDEX_FILE = join(LIB_DIR, 'index.ts')
    const LIB_INDEX = join(ROOT, 'minha-lib-astro', 'src', 'index.ts')
    const REGISTRY  = join(ROOT, 'minha-lib-astro', 'registry.json')

    if (!existsSync(LIB_DIR)) mkdirSync(LIB_DIR, { recursive: true })

    // Copia filhos escolhidos
    const chosen = children.filter(c => chosenChildren.includes(c.importName))
    const rewrites: { importName: string; original: string; newPath: string; childName: string; childCategory: string }[] = []

    for (const child of chosen) {
      const childBase = toPascal(basename(child.absolutePath, '.astro'))
      const childName = `${childBase}${randomId()}`
      const childCat  = inferCategory(child.importName)
      const childDir  = join(ROOT, 'minha-lib-astro', 'src', 'components', childCat)
      if (!existsSync(childDir)) mkdirSync(childDir, { recursive: true })
      const destPath = join(childDir, `${childName}.astro`)
      writeFileSync(destPath, sanitize(readFileSync(child.absolutePath, 'utf8')))
      const relToParent = join(childDir, `${childName}.astro`)
        .replace(LIB_DIR, '.')
        .replace(/\\/g, '/')
      rewrites.push({
        importName: child.importName,
        original: child.relativePath,
        newPath: relToParent,
        childName,
        childCategory: childCat,
      })
    }

    // Sanitiza e reescreve imports
    let code = sanitize(rawCode)
    for (const rw of rewrites) {
      code = code.replace(
        new RegExp(`import\\s+${rw.importName}\\s+from\\s+['"]${rw.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`),
        `import ${rw.importName} from '${rw.newPath}'`
      )
    }
    const rejected = children.filter(c => !chosenChildren.includes(c.importName))
    for (const rj of rejected) {
      code = code.replace(
        new RegExp(`^import\\s+${rj.importName}\\s+from\\s+['"][^'"]+['"];?\\s*$`, 'gm'),
        `// import ${rj.importName} removido`
      )
    }

    writeFileSync(COMP_FILE, code)

    // Preview
    const propsStr = props
      .filter(p => p.type === 'string')
      .map(p => `  ${p.name}="Exemplo de ${p.name}"`)
      .join('\n')
    const previewCode = `---\nimport ${name} from './${name}.astro'\n---\n\n<${name}\n${propsStr}\n/>`
    writeFileSync(PREV_FILE, previewCode)

    // index.ts da categoria
    let idx = existsSync(INDEX_FILE) ? readFileSync(INDEX_FILE, 'utf8') : ''
    const exportLine = `export { default as ${name} } from './${name}.astro'`
    if (!idx.includes(exportLine)) writeFileSync(INDEX_FILE, idx.trimEnd() + (idx ? '\n' : '') + exportLine + '\n')

    // src/index.ts principal
    let libIdx = existsSync(LIB_INDEX) ? readFileSync(LIB_INDEX, 'utf8') : ''
    const libLine = `export * from './components/${category}/index'`
    if (!libIdx.includes(libLine)) writeFileSync(LIB_INDEX, libIdx.trimEnd() + (libIdx ? '\n' : '') + libLine + '\n')

    // registry.json local
    let registry: ComponentMeta[] = []
    try { registry = JSON.parse(readFileSync(REGISTRY, 'utf8')) } catch {}
    registry = registry.filter(r => r.id !== id)
    const newEntry = {
      id, name, category: category as ComponentMeta['category'], description,
      previewPath: `/preview/${id}`,
      screenshot: '',
      componentFile: `${category}/${name}.astro`,
      tags, bestFor,
      props: props.map(p => ({ name: p.name, type: p.type as PropDefinition['type'], required: p.required, previewValue: '' })),
      order: registry.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    registry.push(newEntry)
    writeFileSync(REGISTRY, JSON.stringify(registry, null, 2) + '\n')

    // Lê tokens do tailwind.config do projeto de origem
    const twConfigPath = findTailwindConfig(sourceDir)
    const cssTokens = twConfigPath ? extractTailwindTokens(twConfigPath) : ''
    const googleFonts = twConfigPath ? detectGoogleFonts(twConfigPath) : []
    const fontsUrl = googleFonts.length > 0
      ? `https://fonts.googleapis.com/css2?${googleFonts.map(f => `family=${f.replace(/ /g, '+')}:wght@300;400;500;600;700`).join('&')}&display=swap`
      : ''

    // Gera preview page no Astroteca
    const PREVIEW_DIR = join(ROOT, 'src', 'pages', 'preview')
    if (!existsSync(PREVIEW_DIR)) mkdirSync(PREVIEW_DIR, { recursive: true })
    const previewPageContent = [
      '---',
      `import ${name} from '../../../minha-lib-astro/src/components/${category}/${name}.astro'`,
      `import PreviewLayout from '../../layouts/PreviewLayout.astro'`,
      '---',
      '',
      `<PreviewLayout fontsUrl="${fontsUrl}" cssTokens={\`${cssTokens}\`}>`,
      `  <${name}`,
      propsStr,
      `  />`,
      `</PreviewLayout>`,
      '',
    ].join('\n')
    writeFileSync(join(PREVIEW_DIR, `${id}.astro`), previewPageContent)

    // ── Publica no repo da lib via GitHub API ────────────────────────────────
    const token  = import.meta.env.GITHUB_TOKEN
    const owner  = import.meta.env.GITHUB_OWNER
    const repo   = import.meta.env.COMPONENTS_REPO

    if (!token || !owner || !repo) {
      return json({ error: 'GitHub não configurado (.env: GITHUB_TOKEN, GITHUB_OWNER, COMPONENTS_REPO)' }, 500)
    }

    const ghHeaders = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    }

    async function ghUpsert(path: string, content: string, message: string) {
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
      let sha: string | undefined
      try {
        const existing = await fetch(url, { headers: ghHeaders })
        if (existing.ok) sha = (await existing.json()).sha
      } catch {}
      const res = await fetch(url, {
        method: 'PUT',
        headers: ghHeaders,
        body: JSON.stringify({ message, content: toBase64(content), ...(sha ? { sha } : {}) }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || `Erro ao publicar ${path}`)
      }
    }

    // Componente principal
    await ghUpsert(`src/components/${category}/${name}.astro`, code, `feat: extract ${name}`)
    await ghUpsert(`src/components/${category}/${name}.preview.astro`, previewCode, `feat: extract ${name} preview`)

    // Index da categoria
    await ghUpsert(`src/components/${category}/index.ts`, readFileSync(INDEX_FILE, 'utf8'), `chore: update ${category}/index.ts`)

    // Filhos
    for (const rw of rewrites) {
      const childFile = join(ROOT, 'minha-lib-astro', 'src', 'components', rw.childCategory, `${rw.childName}.astro`)
      await ghUpsert(`src/components/${rw.childCategory}/${rw.childName}.astro`, readFileSync(childFile, 'utf8'), `feat: extract child ${rw.childName}`)
    }

    // src/index.ts principal da lib
    await ghUpsert('src/index.ts', readFileSync(LIB_INDEX, 'utf8'), `chore: update src/index.ts`)

    // Registry
    await ghUpsert('registry.json', JSON.stringify(registry, null, 2) + '\n', `chore: registry — add ${name}`)

    // ── Sincroniza git local ──────────────────────────────────────────────────
    const LIB_ROOT = join(ROOT, 'minha-lib-astro')
    try {
      // Traz os commits criados pela API para o local
      execSync('git pull --no-edit', { cwd: LIB_ROOT, stdio: 'pipe' })
    } catch { /* ignora se não houver nada para puxar */ }
    try {
      // Commita preview page + referência do submodule no Astroteca
      execSync(
        `git add minha-lib-astro src/pages/preview/ && git diff --cached --quiet || git commit -m "feat: extract ${id} + update submodule ref" && git push`,
        { cwd: ROOT, stdio: 'pipe', shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/sh' }
      )
    } catch { /* log silencioso — não impede retorno de sucesso */ }

    return json({
      success: true,
      name, id, category,
      children: rewrites.map(r => ({ childName: r.childName, childCategory: r.childCategory })),
    })

  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro desconhecido'
    return json({ error: msg }, 500)
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
