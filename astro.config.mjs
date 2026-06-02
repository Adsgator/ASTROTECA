import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import vercel from '@astrojs/vercel'
import icon from 'astro-icon'
import { execSync } from 'child_process'

// ─── Plugin: compila CSS de preview dos componentes ───────────────────────────
// Usa @tailwindcss/cli (v4) com preview.css como entry point CSS-first para
// gerar public/preview-components.css. Roda automaticamente ao iniciar o dev
// e ao alterar arquivos da biblioteca ou do preview.css.
function previewCssPlugin() {
  const cmd = 'node node_modules/@tailwindcss/cli/dist/index.mjs -i src/styles/preview.css -o public/preview-components.css'

  function build(label = '') {
    try {
      if (label) process.stdout.write(`\n[preview-css] ${label}...`)
      execSync(cmd, { stdio: 'pipe' })
      if (label) console.log(' ok')
    } catch (e) {
      console.error('\n[preview-css] erro ao compilar:', e.message)
    }
  }

  return {
    name: 'preview-css',

    // Compila antes de iniciar o servidor / build
    buildStart() {
      build('compilando preview-components.css')
    },

    // Em dev: recompila quando arquivos da biblioteca ou preview mudam
    configureServer(server) {
      const watched = [
        'minha-lib-astro/src',
        'src/styles/preview.css',
        'src/layouts/PreviewLayout.astro',
      ]
      watched.forEach(p => server.watcher.add(p))

      server.watcher.on('change', (file) => {
        const isRelevant = watched.some(p => file.replace(/\\/g, '/').includes(p.replace(/\\/g, '/')))
        if (isRelevant) build('alteração detectada, recompilando')
      })
    },
  }
}

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    icon({ include: { lucide: ['*'] } }),
  ],
  vite: {
    plugins: [previewCssPlugin()],
  },
  security: {
    checkOrigin: false,
  },
})
