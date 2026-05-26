/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx}',
    './src/components/**/*.{tsx,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#080810',
        surface: '#0f0f1c',
        raised: '#161625',
        hover: '#1c1c2e',
        border: '#1f1f35',
        'border-subtle': '#141428',
        'ink-primary': '#ededf5',
        'ink-secondary': '#6b6b85',
        'ink-muted': '#35354a',
        accent: '#f0a500',
        'accent-dim': 'rgba(240,165,0,0.10)',
        'accent-hover': '#fbbf24',
        ok: '#22c55e',
        fail: '#ef4444',
        warn: '#f59e0b',
      },
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      spacing: {
        'sidebar': '220px',
        'topbar': '56px',
      },
      borderRadius: {
        DEFAULT: '10px',
        sm: '6px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
}
