// tailwind.preview.config.js
// CSS de preview para componentes da biblioteca.
// Compilado para public/preview-components.css pelo Vite plugin.
// Usa os mesmos tokens do _base-project — garantia de preview fiel.

import { tokens } from './tailwind-tokens.js'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './minha-lib-astro/src/**/*.{astro,html,js,jsx,ts,tsx}',
    './src/pages/preview/**/*.{astro,html}',
    './src/layouts/PreviewLayout.astro',
  ],
  theme: {
    extend: tokens,
  },
  plugins: [],
}
