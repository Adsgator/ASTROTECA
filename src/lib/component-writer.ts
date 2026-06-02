// src/lib/component-writer.ts
//
// Motor único de gravação e publicação de componentes na biblioteca.
// Usado por /api/publish-component (Adicionar) e /api/extract-component (Extrair).
// Garante que ambos os fluxos gravem no mesmo padrão: Categoria/Nome.astro

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { execSync } from 'node:child_process'
import type { ComponentMeta, ComponentCategory, PropDefinition } from '../types'
import { toBase64 } from './utils'

const ROOT = resolve(process.cwd())

// ─── Helpers de nome ─────────────────────────────────────────────────────────

export function toPascal(s: string): string {
  return s.replace(/(^\w|-\w|_\w)/g, m => m.replace(/[-_]/, '').toUpperCase())
}

export function toKebab(s: string): string {
  return s.replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
           .replace(/([a-z])([A-Z])/g, '$1-$2')
           .replace(/([a-zA-Z])(\d)/g, '$1-$2')
           .replace(/[\s_]+/g, '-')
           .toLowerCase()
}

/** ID determinístico baseado no nome — o mesmo componente extraído 2x gera o mesmo ID */
export function deterministicSuffix(name: string): string {
  return String((name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 9000) + 1000)
}

// ─── Categorias ───────────────────────────────────────────────────────────────

export const COMPONENT_CATEGORIES: ComponentCategory[] = [
  'Hero', 'Header', 'Navigation', 'Features', 'Services', 'Pricing',
  'Testimonials', 'Process', 'CTA', 'FAQ', 'Stats', 'Gallery',
  'Contact', 'Footer', 'About', 'Team', 'Trust', 'UI', 'Misc', 'Other',
]

export function inferCategory(name: string): ComponentCategory {
  const n = name.toLowerCase().replace(/\d+$/, '')
  if (/^(button|btn|icon|badge|tag|chip|card|modal|dialog|tooltip|popover|dropdown|input|textarea|select|checkbox|radio|toggle|switch|form|label|avatar|spinner|loader|alert|toast|banner|divider|separator|breadcrumb|pagination|tab|accordion|collapse|drawer|sidebar|nav|navbar|menu|link|image|img|picture|video|embed)s?(\d+)?$/.test(n)) return 'UI'
  if (/^hero/.test(n))              return 'Hero'
  if (/^(header|nav(bar)?)/.test(n)) return 'Header'
  if (/^feature/.test(n))           return 'Features'
  if (/^service/.test(n))           return 'Services'
  if (/^testimonial/.test(n))       return 'Testimonials'
  if (/^(process|step)/.test(n))    return 'Process'
  if (/^pric/.test(n))              return 'Pricing'
  if (/^faq/.test(n))               return 'FAQ'
  if (/^cta/.test(n))               return 'CTA'
  if (/^contact/.test(n))           return 'Contact'
  if (/^footer/.test(n))            return 'Footer'
  if (/^(trust|award)/.test(n))     return 'Trust'
  if (/^stat/.test(n))              return 'Stats'
  if (/^galler/.test(n))            return 'Gallery'
  if (/^about/.test(n))             return 'About'
  if (/^team/.test(n))              return 'Team'
  return 'Other'
}

// ─── Detecção de props ────────────────────────────────────────────────────────

export function detectProps(code: string): PropDefinition[] {
  const match = code.match(/interface\s+Props\s*\{([^}]+)\}/s)
  if (!match) return []
  const re = /(\w+)(\?)?:\s*(string|boolean|number|string\[\]|\w+(?:\[\])?|Record<[^>]+>)/g
  const props: PropDefinition[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(match[1])) !== null) {
    const rawType = m[3]
    const type = (rawType.includes('[]') ? 'array'
      : rawType.startsWith('Record') ? 'Record<string, string>'
      : rawType) as PropDefinition['type']
    // Tenta extrair default do frontmatter
    const frontmatterMatch = code.match(/^---\r?\n([\s\S]*?)\r?\n---/m)
    const scope = frontmatterMatch ? frontmatterMatch[1] : code
    const strDef = scope.match(new RegExp(`\\b${m[1]}\\s*=\\s*['"]([^'"]+)['"]`))
    const numDef = scope.match(new RegExp(`\\b${m[1]}\\s*=\\s*(\\d+(?:\\.\\d+)?)`))
    const boolDef = scope.match(new RegExp(`\\b${m[1]}\\s*=\\s*(true|false)`))
    const defVal = strDef?.[1] ?? numDef?.[1] ?? boolDef?.[1] ?? ''
    props.push({ name: m[1], type, required: !m[2], previewValue: defVal })
  }
  return props
}

// ─── Sanitização ──────────────────────────────────────────────────────────────

export function sanitizeCode(code: string): string {
  // Remove imports de assets locais
  const assetPatterns = [
    /^import\s+\{[^}]*\}\s+from\s+['"][^'"]*\/assets[^'"]*['"];?\s*$/gm,
    /^import\s+(\w+)\s+from\s+['"][^'"]*\/assets\/[^'"]*['"];?\s*$/gm,
    /^import\s+(\w+)\s+from\s+['"](?:\.{1,2}\/)*(?:@|~)?\/?\s*assets\/[^'"]*['"];?\s*$/gm,
  ]
  const removedVars: string[] = []
  for (const pattern of assetPatterns) {
    code = code.replace(pattern, (match) => {
      const named = match.match(/import\s+\{([^}]+)\}/)
      const def   = match.match(/import\s+(\w+)\s+from/)
      if (named?.[1]) named[1].split(',').map(s => s.trim().split(/\s+as\s+/).pop()).filter(Boolean).forEach(v => removedVars.push(v!))
      else if (def?.[1]) removedVars.push(def[1])
      return ''
    })
  }
  for (const v of removedVars) {
    const ev = v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    code = code.replace(new RegExp(String.raw`^\s*\w+:\s*` + ev + String.raw`\s*,?\s*$`, 'gm'), '')
    code = code.replace(new RegExp(String.raw`(\{|,)\s*\w+:\s*` + ev + String.raw`\s*(?=,|\}|\n)`, 'g'), '$1')
    code = code.replace(new RegExp(String.raw`\{` + ev + String.raw`\}`, 'g'), '{null}')
  }
  // Substitui Image/Picture com assets locais por placeholder
  code = code.replace(/<Image\s[^/]*src=\{[^}]+\}[^/]*\/>/gs, '<img src="/preview-assets/placeholder.svg" alt="imagem" />')
  code = code.replace(/<Picture\s[^/]*\/>/gs, '<img src="/preview-assets/placeholder.svg" alt="imagem" />')
  // Remove imports de astro:assets se não há mais uso
  if (!/<\s*Image[\s/>]/.test(code) && !/<\s*Picture[\s/>]/.test(code)) {
    code = code.replace(/^import\s+\{?\s*(?:Image|Picture|getImage)[^}]*\}\s+from\s+['"]astro\/assets['"];?\s*$/gm, '')
  }
  // Dados sensíveis
  code = code.replace(/https:\/\/wa\.me\/[^\s'"]+/g, 'https://wa.me/5500000000000')
  code = code.replace(/\(\d{2}\)\s?9?\d{4}[-\s]?\d{4}/g, '(00) 00000-0000')
  code = code.replace(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g, '00.000.000/0000-00')
  code = code.replace(/href="https:\/\/(www\.)?(instagram|tiktok|facebook|youtube|linkedin)\.com\/[^"]+"/g, 'href="#"')
  return code
}

// ─── Payload principal ────────────────────────────────────────────────────────

export interface WriteComponentPayload {
  /** Código .astro já sanitizado (ou que será sanitizado aqui) */
  astroCode: string
  /** Nome PascalCase sem sufixo */
  baseName: string
  category: ComponentCategory
  description: string
  tags: string[]
  bestFor: string[]
  /** Se true, aplica sanitizeCode antes de gravar */
  sanitize?: boolean
}

export interface WriteComponentResult {
  name: string
  id: string
  category: ComponentCategory
  componentFile: string
  previewPath: string
}

// ─── Gravação local ───────────────────────────────────────────────────────────

export function writeComponentLocal(payload: WriteComponentPayload): WriteComponentResult {
  const { baseName, category, description, tags, bestFor } = payload
  let code = payload.sanitize ? sanitizeCode(payload.astroCode) : payload.astroCode

  const suffix = deterministicSuffix(baseName)
  const name = `${baseName}${suffix}`
  const id = toKebab(name)

  const LIB_DIR    = join(ROOT, 'minha-lib-astro', 'src', 'components', category)
  const COMP_FILE  = join(LIB_DIR, `${name}.astro`)
  const PREV_FILE  = join(LIB_DIR, `${name}.preview.astro`)
  const INDEX_FILE = join(LIB_DIR, 'index.ts')
  const LIB_INDEX  = join(ROOT, 'minha-lib-astro', 'src', 'index.ts')
  const REGISTRY   = join(ROOT, 'minha-lib-astro', 'registry.json')
  const PREVIEW_DIR = join(ROOT, 'src', 'pages', 'preview')

  if (!existsSync(LIB_DIR))    mkdirSync(LIB_DIR, { recursive: true })
  if (!existsSync(PREVIEW_DIR)) mkdirSync(PREVIEW_DIR, { recursive: true })

  // 1. Componente
  writeFileSync(COMP_FILE, code)

  // 2. Preview .astro (para a biblioteca)
  const props = detectProps(code)
  const propsStr = props
    .map(p => {
      const val = p.previewValue || (p.type === 'boolean' ? 'true' : p.type === 'number' ? '0' : `Exemplo de ${p.name}`)
      if (p.type === 'boolean' || p.type === 'number') return `  ${p.name}={${val}}`
      if (p.type === 'array') return `  ${p.name}={[]}`
      return `  ${p.name}="${val}"`
    })
    .join('\n')
  const previewCode = `---\nimport ${name} from './${name}.astro'\n---\n\n<${name}\n${propsStr}\n/>`
  writeFileSync(PREV_FILE, previewCode)

  // 3. index.ts da categoria
  let idx = existsSync(INDEX_FILE) ? readFileSync(INDEX_FILE, 'utf8') : ''
  const exportLine = `export { default as ${name} } from './${name}.astro'`
  if (!idx.includes(exportLine)) {
    writeFileSync(INDEX_FILE, idx.trimEnd() + (idx ? '\n' : '') + exportLine + '\n')
  }

  // 4. src/index.ts principal da lib
  let libIdx = existsSync(LIB_INDEX) ? readFileSync(LIB_INDEX, 'utf8') : ''
  const libLine = `export * from './components/${category}/index'`
  if (!libIdx.includes(libLine)) {
    writeFileSync(LIB_INDEX, libIdx.trimEnd() + (libIdx ? '\n' : '') + libLine + '\n')
  }

  // 5. registry.json local
  let registry: ComponentMeta[] = []
  try { registry = JSON.parse(readFileSync(REGISTRY, 'utf8')) } catch {}
  registry = registry.filter(r => r.id !== id)
  const componentFile = `${category}/${name}.astro`
  const previewPath = `/preview/${id}`
  const entry: ComponentMeta = {
    id, name, category, description,
    previewPath,
    screenshotUrl: '',
    componentFile,
    tags, bestFor,
    props,
    order: registry.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  registry.push(entry)
  writeFileSync(REGISTRY, JSON.stringify(registry, null, 2) + '\n')

  // 6. Página de preview do Astroteca (espelha generate-previews.mjs)
  const previewPageContent = [
    '---',
    `import ${name} from '../../../minha-lib-astro/src/components/${category}/${name}.astro'`,
    `import PreviewLayout from '../../layouts/PreviewLayout.astro'`,
    '---',
    '',
    `<PreviewLayout title="${name} — Preview">`,
    `  <${name}`,
    propsStr,
    `  />`,
    `</PreviewLayout>`,
    '',
  ].join('\n')
  writeFileSync(join(PREVIEW_DIR, `${id}.astro`), previewPageContent)

  return { name, id, category, componentFile, previewPath }
}

// ─── Publicação no GitHub ─────────────────────────────────────────────────────

interface GhHeaders extends Record<string, string> {
  Authorization: string
  'Content-Type': string
  Accept: string
  'X-GitHub-Api-Version': string
}

async function ghUpsert(headers: GhHeaders, owner: string, repo: string, path: string, content: string, message: string): Promise<void> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
  let sha: string | undefined
  try {
    const existing = await fetch(url, { headers })
    if (existing.ok) sha = (await existing.json()).sha
  } catch {}
  const res = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ message, content: toBase64(content), ...(sha ? { sha } : {}) }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message || `Erro ao publicar ${path}`)
  }
}

export async function publishComponentToGitHub(
  token: string,
  owner: string,
  repo: string,
  result: WriteComponentResult,
  code: string,
  previewCode: string,
  indexCode: string,
  registryContent: string,
): Promise<void> {
  const headers: GhHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  await ghUpsert(headers, owner, repo, `src/components/${result.componentFile}`, code, `feat: add ${result.name}`)
  await ghUpsert(headers, owner, repo, `src/components/${result.category}/${result.name}.preview.astro`, previewCode, `feat: add ${result.name} preview`)
  await ghUpsert(headers, owner, repo, `src/components/${result.category}/index.ts`, indexCode, `chore: update ${result.category}/index.ts`)
  await ghUpsert(headers, owner, repo, 'registry.json', registryContent, `chore: registry — add ${result.name}`)
}

// ─── Sync git local da lib ────────────────────────────────────────────────────

export function syncLibGit(name: string): string[] {
  const warnings: string[] = []
  const LIB_ROOT = join(ROOT, 'minha-lib-astro')
  try {
    execSync('git pull --no-edit', { cwd: LIB_ROOT, stdio: 'pipe' })
  } catch (e) {
    warnings.push(`git pull lib falhou: ${e instanceof Error ? e.message.slice(0, 100) : String(e)}`)
  }
  try {
    execSync(`git add -A && git diff --cached --quiet || git commit -m "feat: add ${name}"`, {
      cwd: LIB_ROOT, stdio: 'pipe',
      shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/sh',
    })
    execSync('git push', { cwd: LIB_ROOT, stdio: 'pipe' })
  } catch (e) {
    warnings.push(`git commit/push lib falhou: ${e instanceof Error ? e.message.slice(0, 100) : String(e)}`)
  }
  return warnings
}
