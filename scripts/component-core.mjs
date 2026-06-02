// scripts/component-core.mjs
//
// Núcleo compartilhado pelos scripts CLI (extract-component, add-component).
// Espelha as funções puras de src/lib/component-writer.ts para o mundo Node/ESM.
//
// Por que duas cópias (esta + component-writer.ts)?
//   - component-writer.ts é TS, consumido pelo bundler do Astro (APIs /admin).
//   - este .mjs é Node puro, consumido pelos scripts CLI (npm run extract/new).
// Mantê-las em paridade é o objetivo: a lógica abaixo é a fonte de verdade do
// comportamento, e component-writer.ts deve seguir as mesmas regras.

// ─── Nomes ─────────────────────────────────────────────────────────────────────

export const toPascal = s => s.replace(/(^\w|-\w|_\w)/g, m => m.replace(/[-_]/, '').toUpperCase())

export const toKebab = s => s
  .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
  .replace(/([a-z])([A-Z])/g, '$1-$2')
  .replace(/([a-zA-Z])(\d)/g, '$1-$2')
  .replace(/[\s_]+/g, '-')
  .toLowerCase()

/** ID determinístico: o mesmo nome gera sempre o mesmo sufixo (re-extrair não duplica) */
export const deterministicSuffix = name =>
  String((name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 9000) + 1000)

// ─── Categorias ─────────────────────────────────────────────────────────────────

export const COMPONENT_CATEGORIES = [
  'Hero', 'Header', 'Navigation', 'Features', 'Services', 'Pricing',
  'Testimonials', 'Process', 'CTA', 'FAQ', 'Stats', 'Gallery',
  'Contact', 'Footer', 'About', 'Team', 'Trust', 'UI', 'Misc', 'Other',
]

export function inferCategory(name) {
  const n = name.toLowerCase().replace(/\d+$/, '')
  if (/^(button|btn|icon|badge|tag|chip|card|modal|dialog|tooltip|popover|dropdown|input|textarea|select|checkbox|radio|toggle|switch|form|label|avatar|spinner|loader|alert|toast|banner|divider|separator|breadcrumb|pagination|tab|accordion|collapse|drawer|sidebar|nav|navbar|menu|link|image|img|picture|video|embed)s?(\d+)?$/.test(n)) return 'UI'
  if (/^hero/.test(n))               return 'Hero'
  if (/^(header|nav(bar)?)/.test(n)) return 'Header'
  if (/^feature/.test(n))            return 'Features'
  if (/^service/.test(n))            return 'Services'
  if (/^testimonial/.test(n))        return 'Testimonials'
  if (/^(process|step)/.test(n))     return 'Process'
  if (/^pric/.test(n))               return 'Pricing'
  if (/^faq/.test(n))                return 'FAQ'
  if (/^cta/.test(n))                return 'CTA'
  if (/^contact/.test(n))            return 'Contact'
  if (/^footer/.test(n))             return 'Footer'
  if (/^(trust|award)/.test(n))      return 'Trust'
  if (/^stat/.test(n))               return 'Stats'
  if (/^galler/.test(n))             return 'Gallery'
  if (/^about/.test(n))              return 'About'
  if (/^team/.test(n))               return 'Team'
  return 'Other'
}

// ─── Detecção de props ──────────────────────────────────────────────────────────

export function detectProps(code) {
  const interfaceMatch = code.match(/interface\s+Props\s*\{([^}]+)\}/s)
  if (!interfaceMatch) return []

  const interfaceBody = interfaceMatch[1]
  const propRegex = /(\w+)(\?)?:\s*(string|boolean|number|string\[\]|[A-Z]\w+\[\]|\w+)/g
  const props = []
  let match

  while ((match = propRegex.exec(interfaceBody)) !== null) {
    const [, name, optional, type] = match
    const normalizedType = type.includes('[]') ? 'array' : type

    let defaultVal = ''
    const frontmatterMatch = code.match(/^---\r?\n([\s\S]*?)\r?\n---/m)
    const searchScope = frontmatterMatch ? frontmatterMatch[1] : code
    const stringDefault = searchScope.match(new RegExp(`\\b${name}\\s*=\\s*['"]([^'"]+)['"]`))
    const numberDefault = searchScope.match(new RegExp(`\\b${name}\\s*=\\s*(\\d+(?:\\.\\d+)?)`))
    const boolDefault = searchScope.match(new RegExp(`\\b${name}\\s*=\\s*(true|false)`))

    if (stringDefault?.[1]) defaultVal = stringDefault[1]
    else if (numberDefault?.[1]) defaultVal = numberDefault[1]
    else if (boolDefault?.[1]) defaultVal = boolDefault[1]

    props.push({
      name,
      type: normalizedType,
      required: !optional,
      ...(defaultVal ? { default: defaultVal } : {}),
    })
  }

  return props
}

// ─── Slots e copy ───────────────────────────────────────────────────────────────

export function detectSlots(code) {
  const slotRegex = /<slot\s+(?:name=["']([^"']+)["'])?\s*\/?>/g
  const slots = ['default']
  let match
  while ((match = slotRegex.exec(code)) !== null) {
    if (match[1]) slots.push(match[1])
  }
  return [...new Set(slots)]
}

/** Extrai textos padrão do template como defaults de copy editável */
export function extractCopyDefaults(code) {
  const parts = code.split('---')
  if (parts.length < 3) return undefined
  const templateSection = parts[2]

  const copy = {}

  const attrRegex = /\b(title|subtitle|label|description|text|cta|heading|caption|eyebrow)\s*=\s*"([^"]{3,100})"/gi
  for (const [, key, val] of templateSection.matchAll(attrRegex)) {
    const keyLower = key.toLowerCase()
    if (!copy[keyLower]) copy[keyLower] = val
  }

  const tagRegex = /<(h[1-6]|p|button|a|span|li)[^>]*>\s*([A-ZÀ-ÿa-z][^<]{5,120}?)\s*<\/\1>/gi
  let tagIdx = 0
  for (const [, tag, text] of templateSection.matchAll(tagRegex)) {
    const cleaned = text.trim()
    if (!cleaned.startsWith('{') && !cleaned.includes('\n') && cleaned.length >= 5) {
      copy[`${tag}_${tagIdx++}`] = cleaned
    }
  }

  return Object.keys(copy).length > 0 ? copy : undefined
}

// ─── Sanitização (biblioteca) ───────────────────────────────────────────────────
//
// Remove imports/usos de assets locais e dados sensíveis. PRESERVA `import type`
// (são só tipos, não afetam runtime e o componente quebra sem eles).

export function sanitizeCode(code) {
  const assetPatterns = [
    /^import\s+\{[^}]*\}\s+from\s+['"][^'"]*\/assets[^'"]*['"];?\s*$/gm,
    /^import\s+(\w+)\s+from\s+['"][^'"]*\/assets\/[^'"]*['"];?\s*$/gm,
    /^import\s+(\w+)\s+from\s+['"](?:\.{1,2}\/)*(?:@|~)?\/?\s*assets\/[^'"]*['"];?\s*$/gm,
  ]

  const removedVars = []
  for (const pattern of assetPatterns) {
    code = code.replace(pattern, (match) => {
      // Nunca remover import type — apenas tipos, seguros e necessários
      if (match.includes('import type')) return match
      const named = match.match(/import\s+\{([^}]+)\}/)
      const def   = match.match(/import\s+(\w+)\s+from/)
      if (named?.[1]) {
        named[1].split(',').map(s => s.trim().split(/\s+as\s+/).pop()).filter(Boolean)
          .forEach(v => removedVars.push(v))
      } else if (def?.[1]) {
        removedVars.push(def[1])
      }
      return ''
    })
  }

  for (const v of removedVars) {
    const ev = v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    code = code.replace(new RegExp(String.raw`^\s*\w+:\s*` + ev + String.raw`\s*,?\s*$`, 'gm'), '')
    code = code.replace(new RegExp(String.raw`(\{|,)\s*\w+:\s*` + ev + String.raw`\s*(?=,|\}|\n)`, 'g'), '$1')
    code = code.replace(new RegExp(String.raw`\{` + ev + String.raw`\}`, 'g'), '{null}')
  }

  code = code.replace(/<Image\s[^/]*src=\{[^}]+\}[^/]*\/>/gs, '<img src="/preview-assets/placeholder.svg" alt="imagem" />')
  code = code.replace(/<Picture\s[^/]*\/>/gs, '<img src="/preview-assets/placeholder.svg" alt="imagem" />')
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
