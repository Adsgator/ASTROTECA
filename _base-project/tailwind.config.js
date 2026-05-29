/** @type {import('tailwindcss').Config} */

// ─────────────────────────────────────────────────────────────
// TAILWIND CONFIG DO PROJETO CLIENTE
//
// Os tokens vêm de tailwind-tokens.js (fonte única da verdade).
// Para customizar este projeto: substitua os VALORES das cores,
// fontes etc. abaixo — nunca mude os nomes dos tokens.
// ─────────────────────────────────────────────────────────────

import { tokens } from '../tailwind-tokens.js'

export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      ...tokens,

      // ── Substituições do cliente ──────────────────────────
      // Edite APENAS estes valores. Os demais tokens (escala
      // tipográfica, espaçamento, sombras, animações) herdam
      // de tailwind-tokens.js e raramente precisam mudar.

      colors: {
        ...tokens.colors,
        // primary:        '#sua-cor-primaria',
        // 'primary-dark': '#sua-cor-primaria-escura',
        // secondary:      '#sua-cor-secundaria',
        // background:     '#seu-fundo',
        // surface:        '#sua-surface',
        // 'surface-alt':  '#sua-surface-alternativa',
        // dark:           '#seu-tom-escuro',
        // 'text-main':    '#seu-texto-principal',
        // 'text-soft':    '#seu-texto-suave',
        // 'text-muted':   '#seu-texto-muted',
        // border:         '#sua-borda',
      },

      fontFamily: {
        ...tokens.fontFamily,
        // serif: ['"Sua Fonte Serif"', 'Georgia', 'ui-serif', 'serif'],
        // sans:  ['"Sua Fonte Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },

      boxShadow: {
        ...tokens.boxShadow,
        // Atualizar com as cores do cliente após definir primary/secondary:
        // 'primary-sm':   '0 4px 14px <cor-primary-hex>40',
        // 'primary-md':   '0 8px 24px <cor-primary-hex>4d',
        // 'secondary-sm': '0 4px 15px <cor-secondary-hex>40',
        // 'secondary-md': '0 8px 25px <cor-secondary-hex>59',
      },

      backgroundImage: {
        ...tokens.backgroundImage,
        // Atualizar gradiente secundário com a cor do cliente:
        // 'secondary-gradient': 'linear-gradient(135deg, <cor> 0%, <cor-clara> 50%, <cor-escura> 100%)',
      },
    },
  },
  plugins: [],
}
