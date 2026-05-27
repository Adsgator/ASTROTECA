# Design System — Astroteca

Referência para criar componentes compatíveis com a biblioteca e com todos os projetos.
Use este arquivo como contexto ao pedir componentes para uma IA.

---

## Como funciona a compatibilidade

Os componentes usam classes Tailwind com tokens customizados (`bg-primary`, `text-text-main`, etc.).
Para o componente funcionar em um projeto, o `tailwind.config.js` dele precisa ter os mesmos tokens.
O `tailwind.config.js` padrão abaixo deve ser copiado para todos os projetos novos.

---

## tailwind.config.js padrão

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
        // fonte de títulos — substituir pela do cliente
        serif: ['"Cormorant Garamond"', 'Georgia', 'ui-serif', 'serif'],
        // fonte de corpo — substituir pela do cliente
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
        section: 'clamp(5rem, 10vw, 8rem)',  // padding vertical de seções
      },

      maxWidth: {
        prose:   '65ch',    // texto corrido
        content: '860px',   // coluna de conteúdo
        wide:    '1200px',  // container máximo
      },

      borderRadius: {
        DEFAULT: '6px',
        sm:      '4px',
        lg:      '12px',
        xl:      '20px',
      },

      boxShadow: {
        card:  '0 2px 16px rgba(29,29,28,0.07)',
        float: '0 4px 24px rgba(29,29,28,0.15)',
      },

      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
```

---

## Estrutura de pastas da biblioteca

```
minha-lib-astro/src/components/
  Hero/           — seções de hero (HeroSplit, HeroCentered, HeroSimples...)
  Features/       — grade de features / diferenciais
  Services/       — seções de serviços
  Testimonials/   — depoimentos / avaliações
  Process/        — etapas / como funciona
  Pricing/        — tabelas de preço
  FAQ/            — perguntas frequentes
  CTA/            — call to action
  Contact/        — formulário e seção de contato
  Footer/         — rodapés
  Trust/          — selos, prêmios, logos de clientes
  UI/             — componentes atômicos: Button, Badge, Icon, Card...
  Other/          — qualquer outro que não se encaixa acima
```

---

## Estrutura de um componente

Todo componente segue este padrão:

```astro
---
// Categoria/NomeComponente.astro

interface Props {
  // props tipadas aqui
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
- Usar `max-w-content` para colunas de texto
- Sem JavaScript no componente salvo exceções (accordions, sliders)
- Sem imports de assets locais (imagens ficam em `public/`)

---

## Tokens de cor — uso correto

| Token | Uso |
|---|---|
| `bg-background` | fundo base da página |
| `bg-surface` | cards, seções alternadas |
| `bg-surface-alt` | fundos mais escuros / contraste leve |
| `bg-primary` | botão primário, CTA principal |
| `bg-primary-dark` | hover do botão primário |
| `bg-secondary` | badge, label, destaque dourado |
| `text-main` | todo texto principal |
| `text-soft` | texto secundário / descrições |
| `text-muted` | placeholders, textos de apoio |
| `text-primary` | links, destaques em texto |
| `border-border` | bordas de cards e inputs |
| `text-wa` / `bg-wa` | botão/link de WhatsApp |

---

## Tokens de fonte — uso correto

| Classe | Uso |
|---|---|
| `font-serif` | títulos, headlines (h1, h2, h3) |
| `font-sans` | corpo de texto, botões, labels |
| `text-display-xl` | hero headline principal |
| `text-display-lg` | títulos de seção |
| `text-display-md` | subtítulos |
| `text-display-sm` | títulos de cards |
| `text-label` | labels em caixa alta (`uppercase tracking-widest`) |

---

## Padrões de seção

### Seção padrão (fundo branco)
```astro
<section class="py-section bg-background">
  <div class="w-[90%] max-w-wide mx-auto">
    <!-- conteúdo -->
  </div>
</section>
```

### Seção alternada (fundo surface)
```astro
<section class="py-section bg-surface">
  <div class="w-[90%] max-w-wide mx-auto">
    <!-- conteúdo -->
  </div>
</section>
```

### Cabeçalho de seção (label + título + descrição)
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

### Botão secundário (outline)
```astro
<a
  href={href}
  class="inline-flex items-center justify-center font-sans font-medium
         bg-transparent text-text-main border border-border rounded
         px-6 py-3 text-sm
         transition-all duration-200 hover:border-text-soft hover:bg-surface"
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

## Prompt para pedir componentes a uma IA

Use este bloco como contexto ao pedir um componente novo:

```
Crie um componente Astro para a Astroteca seguindo estas regras:

DESIGN SYSTEM:
- Cores: primary (#436f3e), primary-dark (#2f5129), secondary (#d59740),
  background (#fff), surface (#f7f4f0), surface-alt (#f0ebe3),
  text-main (#1d1d1c), text-soft (#535353), text-muted (#8a8a8a), border (#e5dfd6)
- Fontes: font-serif (Cormorant Garamond) para títulos, font-sans (DM Sans) para corpo
- Tamanhos: text-display-xl/lg/md/sm para títulos, text-label para labels em caps
- Espaçamento: py-section para seções, w-[90%] max-w-wide mx-auto para container
- Border radius: rounded (6px), rounded-lg (12px), rounded-xl (20px)
- Sombras: shadow-card, shadow-float

ESTRUTURA OBRIGATÓRIA:
- Arquivo .astro com interface Props tipada no frontmatter
- Valores padrão em todas as props opcionais
- Sem imports de imagens locais
- Sem JavaScript inline (exceto se for accordion/slider)
- Props de texto simples (string), não JSX

CATEGORIA: [Hero / Features / Services / Testimonials / Process / Pricing / FAQ / CTA / Contact / Footer / UI]

COMPONENTE: [descreva o que quer aqui]
```

---

## Checklist antes de extrair um componente

- [ ] Componente não tem imports de `../assets/` (imagens locais removidas)
- [ ] Não contém dados reais do cliente (telefone, CNPJ, redes sociais pessoais)
- [ ] Props estão declaradas com `interface Props`
- [ ] Funciona com dados de exemplo genéricos
- [ ] Nome do arquivo está em PascalCase (ex: `HeroSplit.astro`)
