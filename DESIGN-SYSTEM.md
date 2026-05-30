# Design System — Astroteca

Este arquivo documenta **dois sistemas de design distintos** que coexistem no projeto:

1. **Studio UI** — o tema dark do próprio Astroteca (sidebar, cards, botões do studio)
2. **Biblioteca de componentes** — o design system dos componentes que vão para projetos de clientes

---

## 1. Studio UI (app.css + Tailwind)

O studio usa um tema dark premium com CSS custom properties e classes Tailwind utilitárias.

### Tokens CSS (`:root` em app.css)

```css
/* Superfícies (dark, em camadas) */
--bg:            #06060e   /* fundo base da página */
--surface:       #0c0c1a   /* cards, painéis */
--raised:        #131325   /* itens elevados, hover background */
--hover:         #1a1a30   /* estado hover de itens */
--border:        #1e1e38   /* bordas */
--border-subtle: #141428   /* divisores suaves */

/* Texto */
--ink-primary:   #ededf5   /* texto principal */
--ink-secondary: #7a7a95   /* texto secundário */
--ink-muted:     #3a3a52   /* texto desabilitado */

/* Accent (laranja âmbar — cor da marca Astroteca) */
--accent:        #f0a500
--accent-dim:    rgba(240,165,0,0.08)
--accent-hover:  #fbbf24
--accent-glow:   rgba(240,165,0,0.15)

/* Status */
--ok:   #22c55e   /* sucesso */
--fail: #ef4444   /* erro */
--warn: #f59e0b   /* aviso */

/* Layout */
--sidebar-w: 240px
--radius:    12px
--radius-sm: 8px
--radius-lg: 16px

/* Sombras */
--shadow-sm:   0 1px 2px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.15)
--shadow-md:   0 4px 12px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.2)
--shadow-lg:   0 8px 30px rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.3)
--shadow-glow: 0 0 20px var(--accent-glow), 0 0 40px rgba(240,165,0,0.05)
```

### Classes Tailwind do studio (definidas em `tailwind.config.js`)

As cores/fontes abaixo são tokens do `tailwind.config.js` da Astroteca; os mesmos valores existem como CSS custom properties em `app.css` (usados nas classes utilitárias `.btn`, `.card`, etc.). **São exclusivas do studio**, não dos componentes da biblioteca.

| Classe | Token/valor |
|--------|-------------|
| `bg-bg` | `var(--bg)` |
| `bg-surface` | `var(--surface)` |
| `bg-raised` | `var(--raised)` |
| `bg-hover` | `var(--hover)` |
| `border-border` | `var(--border)` |
| `border-border-subtle` | `var(--border-subtle)` |
| `text-ink-primary` | `var(--ink-primary)` |
| `text-ink-secondary` | `var(--ink-secondary)` |
| `text-ink-muted` | `var(--ink-muted)` |
| `text-accent` | `var(--accent)` |
| `bg-accent` | `var(--accent)` |
| `text-ok` | `var(--ok)` |
| `text-fail` | `var(--fail)` |
| `text-warn` | `var(--warn)` |

### Tipografia do studio

Fontes carregadas via Google Fonts no topo de `app.css`. No `tailwind.config.js`: `font-body` (DM Sans), `font-heading` (Syne), `font-mono` (JetBrains Mono).

- **Interface / corpo:** `DM Sans` (300–700) — aplicada ao `body`
- **Display / headings:** `Syne` (400–800) — aplicada automaticamente a todos os `h1`–`h6` via `app.css`
- **Monospace:** `JetBrains Mono` (400/500) — para código, IDs, paths (`.mono`, `.code-block`)

### Padrão de card no studio

```astro
<div class="bg-surface border border-border rounded-[var(--radius)] p-6 shadow-[var(--shadow-sm)]">
  <!-- conteúdo -->
</div>
```

---

## 2. Componentes da Biblioteca (projetos de clientes)

Os componentes em `minha-lib-astro/` seguem um design system **diferente** — neutro e adaptável para qualquer cliente. Os tokens abaixo são substituídos pelos valores do cliente em `tailwind.config.js`.

### tailwind.config.js padrão (copiado para cada projeto)

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Marca (substituir pelos valores do cliente) ──────────────────────
        primary:        '#436f3e',       // cor principal — botões, links, destaques
        'primary-dark': '#2f5129',       // hover / versão escura do primary
        secondary:      '#d59740',       // cor de apoio — badges, labels, gradientes
        complement:     '#f9f395',       // cor complementar — fundos suaves, acentos

        // ── Superfícies ──────────────────────────────────────────────────────
        background:     '#ffffff',       // fundo base da página
        surface:        '#f7f4f0',       // fundo de cards, seções alternadas
        'surface-alt':  '#f0ebe3',       // fundo alternativo mais escuro

        // ── Texto ────────────────────────────────────────────────────────────
        dark:           '#1d1d1c',       // preto do projeto
        'text-main':    '#1d1d1c',       // texto principal
        'text-soft':    '#535353',       // texto secundário
        'text-muted':   '#8a8a8a',       // texto desabilitado / placeholder

        // ── Bordas ───────────────────────────────────────────────────────────
        border:         '#e5dfd6',       // bordas de cards, inputs, divisores

        // ── Utilitários ──────────────────────────────────────────────────────
        wa:             '#25D366',       // WhatsApp — sempre fixo
      },

      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'ui-serif', 'serif'],
        sans:  ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        'display-xl': ['clamp(2.6rem, 5.5vw, 4.2rem)', { lineHeight: '1',   letterSpacing: '-0.01em' }],
        'display-lg': ['clamp(2rem,   4vw,   3.2rem)',  { lineHeight: '1',   letterSpacing: '-0.01em' }],
        'display-md': ['clamp(1.7rem, 3vw,   2.4rem)',  { lineHeight: '1.2' }],
        'display-sm': ['clamp(1.4rem, 2.5vw, 1.9rem)',  { lineHeight: '1.25' }],
        'label':      ['0.72rem',                        { lineHeight: '1',   letterSpacing: '0.16em' }],
      },

      spacing: {
        section: 'clamp(5rem, 10vw, 8rem)',
      },

      maxWidth: {
        prose:   '65ch',
        content: '860px',
        wide:    '1200px',
      },

      borderRadius: {
        DEFAULT: '6px',
        sm:      '4px',
        lg:      '12px',
        xl:      '20px',
      },

      boxShadow: {
        card:         '0 2px 16px rgba(29,29,28,0.07)',
        float:        '0 4px 24px rgba(29,29,28,0.15)',
        'primary-sm': '0 4px 14px {{colorPrimary}}40',
        'primary-md': '0 8px 24px {{colorPrimary}}4d',
      },

      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
```

### Estrutura de um componente da biblioteca

```astro
---
// Categoria/NomeComponente.astro

interface Props {
  headline: string
  subheadline?: string
  ctaLabel?: string
  ctaHref?: string
}

const {
  headline,
  subheadline = '',
  ctaLabel = 'Começar',
  ctaHref = '#',
} = Astro.props
---

<section class="py-section bg-background">
  <div class="w-[90%] max-w-wide mx-auto">
    <!-- conteúdo aqui -->
  </div>
</section>
```

**Regras:**
- Sempre exportar `interface Props` no frontmatter
- Sempre ter valores padrão razoáveis para props opcionais
- Usar `py-section` para padding vertical de seções
- Usar `w-[90%] max-w-wide mx-auto` para container padrão
- Sem JavaScript no componente (exceto acordeões, sliders)
- Sem imports de assets locais (imagens ficam em `public/`)

### Tokens de cor — uso correto

| Token | Uso |
|-------|-----|
| `bg-background` | fundo base da página |
| `bg-surface` | cards, seções alternadas |
| `bg-surface-alt` | fundos mais escuros / contraste leve |
| `bg-primary` | botão primário, CTA principal |
| `bg-primary-dark` | hover do botão primário |
| `bg-secondary` | badge, label, destaque dourado |
| `text-text-main` | todo texto principal |
| `text-text-soft` | texto secundário / descrições |
| `text-text-muted` | placeholders, textos de apoio |
| `text-primary` | links, destaques em texto |
| `border-border` | bordas de cards e inputs |
| `text-wa` / `bg-wa` | botão/link de WhatsApp |

### Tokens de fonte — uso correto

| Classe | Uso |
|--------|-----|
| `font-serif` | títulos, headlines (h1, h2, h3) |
| `font-sans` | corpo de texto, botões, labels |
| `text-display-xl` | hero headline principal |
| `text-display-lg` | títulos de seção |
| `text-display-md` | subtítulos |
| `text-display-sm` | títulos de cards |
| `text-label` | labels em caixa alta (`uppercase tracking-widest`) |

### Padrões de seção

```astro
<!-- Fundo branco -->
<section class="py-section bg-background">
  <div class="w-[90%] max-w-wide mx-auto">
    <!-- conteúdo -->
  </div>
</section>

<!-- Fundo surface -->
<section class="py-section bg-surface">
  <div class="w-[90%] max-w-wide mx-auto">
    <!-- conteúdo -->
  </div>
</section>
```

### Cabeçalho de seção padrão

```astro
<div class="text-center mb-12 max-w-content mx-auto">
  <span class="text-label font-sans font-medium uppercase tracking-widest text-secondary block mb-3">
    {label}
  </span>
  <h2 class="font-serif text-display-lg text-text-main mb-4">
    {title}
  </h2>
  <p class="text-text-soft text-lg leading-relaxed">
    {description}
  </p>
</div>
```

### Botão primário

```astro
<a
  href={href}
  class="inline-flex items-center justify-center font-sans font-medium
         bg-primary text-white border border-primary rounded
         px-6 py-3 text-sm
         transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98]
         hover:bg-primary-dark"
>
  {label}
</a>
```

### Card padrão

```astro
<div class="bg-surface rounded-lg shadow-card p-6 border border-border">
  <!-- conteúdo -->
</div>
```

---

## Guia completo para criar componentes

Para instruções detalhadas sobre como criar componentes profissionais para a biblioteca, incluindo todas as categorias, tokens, animações, data attributes e exemplo completo de referência, consulte **[COMPONENT-BLUEPRINT.md](COMPONENT-BLUEPRINT.md)**.

---

## Auditoria de projetos de clientes

Para auditar projetos gerados (SEO, performance, design, conversão, acessibilidade, LGPD), consulte **[AUDIT-CHECKLIST.md](AUDIT-CHECKLIST.md)**.

---

## Checklist antes de extrair um componente

- [ ] Sem imports de `../assets/` (imagens locais removidas)
- [ ] Sem dados reais do cliente (telefone, CNPJ, redes sociais pessoais)
- [ ] Props declaradas com `interface Props`
- [ ] Funciona com dados de exemplo genéricos
- [ ] Nome do arquivo em PascalCase (`HeroSplit.astro`)
- [ ] `npm run build` sem erros após adicionar ao registry
