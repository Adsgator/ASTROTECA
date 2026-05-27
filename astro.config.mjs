import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import vercel from '@astrojs/vercel'
import { execSync } from 'child_process'

// ─── Plugin: compila CSS de preview dos componentes ───────────────────────────
// Usa tailwind.preview.config.js (tokens do _base-project) para gerar
// public/preview-components.css. Roda automaticamente ao iniciar o dev e
// ao alterar arquivos da biblioteca ou dos tokens.
function previewCssPlugin() {
  const cmd = 'npx tailwindcss -c tailwind.preview.config.js -i src/styles/preview.css -o public/preview-components.css'

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

    // Em dev: recompila quando arquivos da biblioteca ou tokens mudam
    configureServer(server) {
      const watched = [
        'minha-lib-astro/src',
        'tailwind-tokens.js',
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
  ],
  vite: {
    plugins: [previewCssPlugin()],
  },
})
