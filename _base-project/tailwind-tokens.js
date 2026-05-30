// tailwind-tokens.js
// ─────────────────────────────────────────────────────────────
// FONTE ÚNICA DE VERDADE — tokens do sistema Adsgator
//
// Importado por:
//   _base-project/tailwind.config.js  → projetos cliente
//   tailwind.preview.config.js        → previews no Astroteca
//
// Para customizar um projeto cliente: altere os VALORES no
// tailwind.config.js do projeto — nunca os NOMES dos tokens.
// ─────────────────────────────────────────────────────────────

/** @type {import('tailwindcss').Config['theme']['extend']} */
export const tokens = {

  // ── CORES ─────────────────────────────────────────────────
  // Valores default (Ana Ester como referência).
  // Cada projeto substitui valores, nunca os nomes.
  colors: {
    primary:        '#436f3e',
    'primary-dark': '#2f5129',
    secondary:      '#d59740',
    complement:     '#f9f395',
    background:     '#ffffff',
    surface:        '#f7f4f0',
    'surface-alt':  '#f0ebe3',
    dark:           '#1d1d1c',
    'text-main':    '#1d1d1c',
    'text-soft':    '#535353',
    'text-muted':   '#8a8a8a',
    border:         '#e5dfd6',
    wa:             '#25D366',

    // ── Dark mode palette (usada pelo ThemeToggle nos projetos cliente) ──
    // Valores default — cada projeto substitui conforme ArtDirection.
    'dark-bg':           '#0f0f0f',
    'dark-surface':      '#1a1a1a',
    'dark-surface-alt':  '#242424',
    'dark-text-main':    '#e8e8e8',
    'dark-text-soft':    '#b0b0b0',
    'dark-text-muted':   '#707070',
    'dark-border':       '#2a2a2a',
  },

  // ── TIPOGRAFIA ─────────────────────────────────────────────
  fontFamily: {
    serif: ['"Cormorant Garamond"', 'Georgia', 'ui-serif', 'serif'],
    sans:  ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  },

  // ── ESCALA TIPOGRÁFICA ──────────────────────────────────────
  fontSize: {
    'display-xl': ['clamp(2.6rem, 5.5vw, 4.2rem)', { lineHeight: '1',    letterSpacing: '-0.02em' }],
    'display-lg': ['clamp(2rem,   4vw,   3.2rem)', { lineHeight: '1',    letterSpacing: '-0.02em' }],
    'display-md': ['clamp(1.7rem, 3vw,   2.4rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
    'display-sm': ['clamp(1.4rem, 2.5vw, 1.9rem)', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
    'body-lg':    ['1.125rem',                      { lineHeight: '1.7'  }],
    'body-md':    ['1rem',                          { lineHeight: '1.7'  }],
    'body-sm':    ['0.9rem',                        { lineHeight: '1.6'  }],
    'label':      ['0.72rem',                       { lineHeight: '1',   letterSpacing: '0.16em'  }],
    'label-lg':   ['0.8rem',                        { lineHeight: '1',   letterSpacing: '0.14em'  }],
  },

  // ── ESPAÇAMENTO ────────────────────────────────────────────
  spacing: {
    section:      'clamp(5rem, 10vw, 8rem)',
    'section-sm': 'clamp(3rem, 6vw, 5rem)',
    'section-lg': 'clamp(7rem, 14vw, 12rem)',
  },

  // ── LARGURAS MÁXIMAS ────────────────────────────────────────
  maxWidth: {
    prose:   '65ch',
    content: '860px',
    wide:    '1200px',
    full:    '1440px',
  },

  // ── BORDER RADIUS ───────────────────────────────────────────
  borderRadius: {
    DEFAULT: '6px',
    sm:      '4px',
    md:      '8px',
    lg:      '12px',
    xl:      '20px',
    '2xl':   '32px',
  },

  // ── SOMBRAS ─────────────────────────────────────────────────
  boxShadow: {
    'sm':           '0 1px 3px rgba(29,29,28,0.06), 0 1px 2px rgba(29,29,28,0.04)',
    'card':         '0 2px 16px rgba(29,29,28,0.07)',
    'card-hover':   '0 8px 32px rgba(29,29,28,0.12)',
    'float':        '0 4px 24px rgba(29,29,28,0.15)',
    'float-hover':  '0 12px 40px rgba(29,29,28,0.20)',
    'primary-sm':   '0 4px 14px rgba(67,111,62,0.25)',
    'primary-md':   '0 8px 24px rgba(67,111,62,0.30)',
    'secondary-sm': '0 4px 15px rgba(213,151,64,0.25)',
    'secondary-md': '0 8px 25px rgba(213,151,64,0.35)',
    'inner-sm':     'inset 0 1px 3px rgba(29,29,28,0.06)',
  },

  // ── EASING ──────────────────────────────────────────────────
  transitionTimingFunction: {
    'spring':   'cubic-bezier(0.34, 1.56, 0.64, 1)',
    'smooth':   'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    'snappy':   'cubic-bezier(0.19, 1, 0.22, 1)',
    'in-back':  'cubic-bezier(0.36, 0, 0.66, -0.56)',
    'out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // ── DURATIONS ───────────────────────────────────────────────
  transitionDuration: {
    '250': '250ms',
    '350': '350ms',
    '450': '450ms',
    '600': '600ms',
    '800': '800ms',
  },

  // ── GRADIENTES ──────────────────────────────────────────────
  backgroundImage: {
    'secondary-gradient': 'linear-gradient(135deg, #d59740 0%, #f9f395 50%, #c4872f 100%)',
    'secondary-shimmer':  'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
    'surface-gradient':   'linear-gradient(180deg, var(--tw-gradient-stops))',
    'noise':              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
  },

  // ── KEYFRAMES ───────────────────────────────────────────────
  keyframes: {
    'fade-up': {
      '0%':   { opacity: '0', transform: 'translateY(24px)' },
      '100%': { opacity: '1', transform: 'translateY(0)' },
    },
    'fade-in': {
      '0%':   { opacity: '0' },
      '100%': { opacity: '1' },
    },
    'fade-down': {
      '0%':   { opacity: '0', transform: 'translateY(-16px)' },
      '100%': { opacity: '1', transform: 'translateY(0)' },
    },
    'slide-right': {
      '0%':   { opacity: '0', transform: 'translateX(-24px)' },
      '100%': { opacity: '1', transform: 'translateX(0)' },
    },
    'scale-in': {
      '0%':   { opacity: '0', transform: 'scale(0.95)' },
      '100%': { opacity: '1', transform: 'scale(1)' },
    },
    'shimmer': {
      '0%':   { transform: 'translateX(-100%)' },
      '100%': { transform: 'translateX(100%)' },
    },
    'float': {
      '0%, 100%': { transform: 'translateY(0px)' },
      '50%':      { transform: 'translateY(-8px)' },
    },
    'pulse-soft': {
      '0%, 100%': { opacity: '1' },
      '50%':      { opacity: '0.7' },
    },
    'spin-slow': {
      '0%':   { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    },
  },

  // ── ANIMAÇÕES ───────────────────────────────────────────────
  animation: {
    'fade-up':           'fade-up 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
    'fade-in':           'fade-in 0.5s ease both',
    'fade-down':         'fade-down 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
    'slide-right':       'slide-right 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
    'scale-in':          'scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
    'shimmer':           'shimmer 1.5s infinite',
    'float':             'float 3s ease-in-out infinite',
    'pulse-soft':        'pulse-soft 2s ease-in-out infinite',
    'spin-slow':         'spin-slow 8s linear infinite',
    'fade-up-delay-1':   'fade-up 0.6s 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
    'fade-up-delay-2':   'fade-up 0.6s 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
    'fade-up-delay-3':   'fade-up 0.6s 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
  },
}
