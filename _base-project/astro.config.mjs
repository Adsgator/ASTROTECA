import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// Sitemap gerado manualmente em public/sitemap.xml se necessário.
// @astrojs/sitemap requer Astro 5+ (hook astro:routes:resolved).

export default defineConfig({
  output: 'static',
  // TODO: substitua pelo domínio real do cliente
  site: 'https://seudominio.com.br',
  integrations: [
    // applyBaseStyles: false — o global.css do projeto já inclui @tailwind base
    tailwind({ applyBaseStyles: false }),
    react(),
  ],
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
});
