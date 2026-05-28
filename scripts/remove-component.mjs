#!/usr/bin/env node
// scripts/remove-component.mjs
// Remove um componente da biblioteca pelo ID ou escolha interativa

import { intro, outro, select, confirm, cancel, isCancel, note } from '@clack/prompts'
import { existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { resolve, join, relative } from 'node:path'

const c = {
  red:   s => `\x1b[31m${s}\x1b[0m`,
  green: s => `\x1b[32m${s}\x1b[0m`,
  dim:   s => `\x1b[2m${s}\x1b[0m`,
  bold:  s => `\x1b[1m${s}\x1b[0m`,
}

const ROOT     = resolve(process.cwd())
const REGISTRY = join(ROOT, 'minha-lib-astro', 'registry.json')
const LIB_COMPS = join(ROOT, 'minha-lib-astro', 'src', 'components')
const PREVIEW_DIR = join(ROOT, 'src', 'pages', 'preview')

async function main() {
  console.log()
  intro(c.bold('  🗑️  Astroteca — Remover Componente'))

  if (!existsSync(REGISTRY)) {
    cancel('registry.json não encontrado.')
    process.exit(1)
  }

  let registry = []
  try {
    registry = JSON.parse(readFileSync(REGISTRY, 'utf8'))
  } catch {
    cancel('Erro ao ler registry.json.')
    process.exit(1)
  }

  if (registry.length === 0) {
    cancel('Nenhum componente registrado.')
    process.exit(0)
  }

  // Verifica se foi passado ID como argumento
  const argId = process.argv[2]
  let component = argId ? registry.find(r => r.id === argId) : null

  if (argId && !component) {
    cancel(`Componente com ID "${argId}" não encontrado.`)
    process.exit(1)
  }

  // Se não passou argumento, mostra lista interativa
  if (!component) {
    const choice = await select({
      message: 'Qual componente remover?',
      options: registry.map(r => ({
        value: r.id,
        label: `${r.name}`,
        hint: `${r.category} · ${r.id}`,
      })),
    })

    if (isCancel(choice)) {
      cancel('Cancelado.')
      process.exit(0)
    }

    component = registry.find(r => r.id === choice)
  }

  note(
    `ID: ${component.id}\nCategoria: ${component.category}\nArquivo: ${component.componentFile}`,
    `Remover "${component.name}"`
  )

  const ok = await confirm({
    message: 'Tem certeza? Isso remove o arquivo .astro, .preview.astro e a entrada no registry.',
    initialValue: false,
  })

  if (isCancel(ok) || !ok) {
    cancel('Cancelado.')
    process.exit(0)
  }

  const removed = []

  // 1. Remove o arquivo .astro do componente
  const compFile = join(LIB_COMPS, component.componentFile)
  if (existsSync(compFile)) {
    rmSync(compFile)
    removed.push(`minha-lib-astro/src/components/${component.componentFile}`)
  }

  // 2. Remove o .preview.astro
  const previewSrc = join(LIB_COMPS, component.componentFile.replace('.astro', '.preview.astro'))
  if (existsSync(previewSrc)) {
    rmSync(previewSrc)
    removed.push(relative(ROOT, previewSrc).replace(/\\/g, '/'))
  }

  // 3. Remove a página de preview gerada
  const previewPage = join(PREVIEW_DIR, `${component.id}.astro`)
  if (existsSync(previewPage)) {
    rmSync(previewPage)
    removed.push(`src/pages/preview/${component.id}.astro`)
  }

  // 4. Limpa index.ts da categoria
  const categoryIndexPath = join(LIB_COMPS, component.category, 'index.ts')
  if (existsSync(categoryIndexPath)) {
    const exportLine = `export { default as ${component.name} }`
    const lines = readFileSync(categoryIndexPath, 'utf8').split('\n')
    const filtered = lines.filter(l => !l.trim().startsWith(exportLine))
    const hasRealExports = filtered.some(l => l.trim().startsWith('export'))
    if (hasRealExports) {
      writeFileSync(categoryIndexPath, filtered.join('\n'))
      removed.push(`minha-lib-astro/src/components/${component.category}/index.ts`)
    } else {
      rmSync(categoryIndexPath)
      removed.push(`minha-lib-astro/src/components/${component.category}/index.ts (deletado)`)
      // Remove a linha do src/index.ts que re-exportava essa categoria
      const srcIndexPath = join(ROOT, 'minha-lib-astro', 'src', 'index.ts')
      if (existsSync(srcIndexPath)) {
        const srcLines = readFileSync(srcIndexPath, 'utf8').split('\n')
        const srcFiltered = srcLines.filter(l => !l.includes(`./components/${component.category}/index`))
        writeFileSync(srcIndexPath, srcFiltered.join('\n'))
        removed.push('minha-lib-astro/src/index.ts')
      }
    }
  }

  // 5. Remove do registry
  const newRegistry = registry.filter(r => r.id !== component.id)
  writeFileSync(REGISTRY, JSON.stringify(newRegistry, null, 2) + '\n')
  removed.push('minha-lib-astro/registry.json')

  console.log()
  removed.forEach(f => console.log(c.green('  ✓ removido: ') + c.dim(f)))
  console.log()
  outro(c.bold(c.green(`  ✅ "${component.name}" removido com sucesso!`)))
}

main().catch(e => { console.error('  Erro:', e.message); process.exit(1) })
