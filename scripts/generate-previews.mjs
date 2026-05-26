#!/usr/bin/env node
// scripts/generate-previews.mjs
// Gera as páginas de preview para todos os componentes registrados
// Lê os .preview.astro de minha-lib-astro e cria páginas em src/pages/preview/

import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs'
import { resolve, join } from 'node:path'

const c = {
  cyan:   s => `\x1b[36m${s}\x1b[0m`,
  green:  s => `\x1b[32m${s}\x1b[0m`,
  yellow: s => `\x1b[33m${s}\x1b[0m`,
  bold:   s => `\x1b[1m${s}\x1b[0m`,
  dim:    s => `\x1b[2m${s}\x1b[0m`,
}

const toKebab = s => s
  .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
  .replace(/([a-z])([A-Z])/g, '$1-$2')
  .replace(/([a-zA-Z])(\d)/g, '$1-$2')
  .replace(/[\s_]+/g, '-')
  .toLowerCase()

const ROOT        = resolve(process.cwd())
const LIB_COMPS   = join(ROOT, 'minha-lib-astro', 'src', 'components')
const PREVIEW_DIR = join(ROOT, 'src', 'pages', 'preview')

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
