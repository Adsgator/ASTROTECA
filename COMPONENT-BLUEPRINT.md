# Component Blueprint — Astroteca

Guia completo para criar componentes profissionais para a biblioteca Astroteca.
Envie este documento para o Claude junto com o pedido do componente.

---

## Contexto

A Astroteca é uma biblioteca de componentes Astro para criar landing pages de alta performance e conversao. Os componentes sao neutros e adaptaveis — usam tokens de cor e tipografia que sao substituidos para cada cliente no `tailwind.config.js`.

**Stack:** Astro + Tailwind CSS 3.x (sem React, sem JavaScript inline exceto interatividade essencial)
**Padrao visual:** Premium, limpo, com bastante espaco em branco, tipografia elegante e micro-interacoes CSS sutis.

---

## Tokens Obrigatorios

### Cores (Tailwind)

| Token | Uso |
|-------|-----|
| `bg-background` | Fundo base da pagina (geralmente branco) |
| `bg-surface` | Cards, secoes alternadas |
| `bg-surface-alt` | Fundos com mais contraste |
| `bg-dark` | Secoes escuras (footer, CTAs de impacto) |
| `bg-primary` | Botao primario, CTAs |
| `bg-primary-dark` | Hover do primario |
| `bg-secondary` | Badges, labels, gradientes de destaque |
| `text-text-main` | Texto principal |
| `text-text-soft` | Texto secundario, descricoes |
| `text-text-muted` | Placeholders, texto de apoio |
| `text-primary` | Links, destaques em texto |
| `text-secondary` | Labels, badges |
| `border-border` | Bordas de cards e inputs |
| `bg-wa` / `text-wa` | Botao WhatsApp (#25D366) |

**PROIBIDO:** Valores literais de cor como `text-gray-600`, `bg-blue-500`, `text-[#333]`. Sempre use os tokens acima.

### Tipografia

| Classe | Uso |
|--------|-----|
| `font-serif` | Headlines e titulos (h1, h2, h3). Serif elegante (ex: Cormorant Garamond) |
| `font-sans` | Corpo, botoes, labels. Sans-serif moderna (ex: DM Sans) |
| `text-display-xl` | Hero headline principal — `clamp(2.6rem, 5.5vw, 4.2rem)` |
| `text-display-lg` | Titulo de secao — `clamp(2rem, 4vw, 3.2rem)` |
| `text-display-md` | Subtitulo — `clamp(1.7rem, 3vw, 2.4rem)` |
| `text-display-sm` | Titulo de card — `clamp(1.4rem, 2.5vw, 1.9rem)` |
| `text-body-lg` | Texto de destaque — `1.125rem` |
| `text-body-md` | Corpo padrao — `1rem` |
| `text-body-sm` | Texto menor — `0.9rem` |
| `text-label` | Labels em caixa alta — `0.72rem, tracking 0.16em` |
| `text-label-lg` | Labels maiores — `0.8rem, tracking 0.14em` |

### Espacamento e Layout

| Pattern | Uso |
|---------|-----|
| `py-section` | Padding vertical de secao — `clamp(5rem, 10vw, 8rem)` |
| `py-[clamp(3rem,6vw,5rem)]` | Secao menor (section-sm) |
| `py-[clamp(7rem,14vw,12rem)]` | Secao maior (section-lg) |
| `w-[90%] max-w-wide mx-auto` | Container padrao (max 1200px) |
| `w-[90%] max-w-content mx-auto` | Container de conteudo (max 860px) |
| `max-w-prose` | Largura de texto otima (65ch) |

### Sombras

| Token | Uso |
|-------|-----|
| `shadow-card` | Sombra leve para cards |
| `shadow-card-hover` | Sombra no hover de cards |
| `shadow-float` | Elementos flutuantes |
| `shadow-float-hover` | Hover em elementos flutuantes |
| `shadow-primary-sm` | Sombra colorida do primary (botoes) |
| `shadow-primary-md` | Sombra colorida maior |
| `shadow-secondary-sm` | Sombra colorida do secondary |

### Animacoes

| Classe | Efeito |
|--------|--------|
| `animate-fade-up` | Entra de baixo (0.6s) |
| `animate-fade-in` | Fade simples (0.5s) |
| `animate-fade-down` | Entra de cima (0.5s) |
| `animate-slide-right` | Entra da esquerda (0.6s) |
| `animate-scale-in` | Escala de 0.95 (0.4s, spring) |
| `animate-float` | Flutuacao infinita |
| `animate-pulse-soft` | Pulso suave infinito |

### Data Attributes (animacao de scroll via GSAP)

| Atributo | Efeito |
|----------|--------|
| `data-animate` | Fade up ao entrar na viewport |
| `data-animate-left` | Slide da esquerda |
| `data-animate-right` | Slide da direita |
| `data-animate-scale` | Scale in |
| `data-animate-group` + `data-animate-item` | Stagger nos filhos |
| `data-counter="150"` | Contador numerico animado |
| `data-parallax="0.3"` | Parallax sutil no scroll |

---

## Estrutura Obrigatoria de um Componente

```astro
---
// Categoria/NomeComponente.astro
// Breve descricao do componente

interface Props {
  headline: string
  subheadline?: string
  ctaLabel?: string
  ctaHref?: string
  // ... mais props conforme necessario
}

const {
  headline,
  subheadline = 'Subtitulo padrao aqui',
  ctaLabel = 'Fale Comigo',
  ctaHref = '#contato',
} = Astro.props
---

<section class="py-section bg-background">
  <div class="w-[90%] max-w-wide mx-auto">
    <!-- Conteudo aqui -->
  </div>
</section>
```

### Regras Absolutas

1. **Arquivo .astro puro** — sem React, sem imports JS complexos
2. **Interface Props tipada** — todas as props com tipos corretos
3. **Defaults em todas as props opcionais** — o componente deve renderizar sem nenhuma prop obrigatoria alem do essencial
4. **Sem imports de assets locais** — imagens via URL ou props (ficam em `/public/`)
5. **Sem JavaScript inline** exceto para: accordion (toggle), slider, mobile menu
6. **Sem dados reais** — textos placeholder genericos, nunca dados de cliente real
7. **Nome em PascalCase** — `HeroSplit.astro`, `FeaturesGrid3.astro`
8. **Responsivo mobile-first** — funcionar perfeitamente em 375px, 768px, 1280px
9. **Acessibilidade basica** — `alt` em imagens, `aria-label` em botoes iconicos, semantica HTML5

---

## Classes Utilitarias Disponiveis (global.css)

O `_base-project` ja inclui estas classes prontas:

```css
/* Layout */
.container-content  /* w-[90%] max-w-content mx-auto */
.container-wide     /* w-[90%] max-w-wide mx-auto */
.section-py         /* py-section */
.section-py-sm      /* py menor */
.section-py-lg      /* py maior */

/* Botoes */
.btn-primary        /* bg-primary hover:bg-primary-dark, shadow-primary-sm hover:shadow-primary-md, ease-smooth duration-350, hover:-translate-y-0.5 */
.btn-ghost          /* border-primary text-primary hover:bg-primary hover:text-white, ease-smooth duration-350 */
.btn-secondary-gold /* bg-secondary-gradient text-dark, shadow-secondary-sm hover:shadow-secondary-md, hover:-translate-y-0.5 */
.btn-wa             /* bg-wa hover:opacity-90 text-white, shadow-sm hover:shadow-float, ease-smooth duration-350 — sempre com icone WhatsApp e target="_blank" rel="noopener noreferrer" */

/* Tipografia */
.label-tag          /* text-label uppercase tracking-widest text-secondary */

/* Hover */
.img-hover          /* overflow-hidden + scale-[1.04] na imagem filha */
.card-hover         /* -translate-y-1 + shadow-card-hover */
.link-underline     /* underline animado de baixo */

/* Decoracoes */
.divider-ornament   /* divisor com ornamento central */
.badge              /* pill: bg-primary/10, texto primary */
.badge-secondary    /* pill: bg-secondary/10, texto secondary */
.blockquote-premium /* citacao elegante com aspas decorativas */
.stat-number        /* numero grande em serif primary */
```

---

## Categorias de Componentes

### Hero (acima da dobra)
- `HeroSplit` — imagem ao lado, headline + CTA
- `HeroCentered` — centralizado, fullwidth
- `HeroVideo` — com background video
- `HeroMinimal` — texto apenas, elegante

### Features / Diferenciais
- `FeaturesGrid3` — 3 cards em grid
- `FeaturesGrid4` — 4 cards
- `FeaturesAlternating` — imagem/texto alternado
- `FeaturesIconList` — lista com icones

### Testimonials / Depoimentos
- `TestimonialsCards` — cards com foto e quote
- `TestimonialsSlider` — carousel (unico caso que precisa JS)
- `TestimonialsGrid` — grid masonry

### Pricing / Precos
- `PricingCards` — 2-3 planos lado a lado
- `PricingTable` — tabela comparativa

### CTA (call-to-action)
- `CTABanner` — banner fullwidth
- `CTAInline` — dentro do conteudo
- `CTAWhatsApp` — CTA focado em WhatsApp

### FAQ
- `FAQAccordion` — perguntas com toggle (precisa script)
- `FAQGrid` — perguntas em grid sem toggle

### Contact
- `ContactSection` — formulario + info
- `ContactCTA` — apenas info de contato + mapa

### Footer
- `FooterSimples` — logo, links, redes, copyright
- `FooterCompleto` — com newsletter, mapa, etc.

### Header / Navigation
- `HeaderFixed` — navbar fixa
- `HeaderTransparent` — transparente no hero

### About / Sobre
- `AboutHistory` — historia com timeline
- `AboutTeam` — equipe com fotos

### Stats / Numeros
- `StatsCounter` — numeros com contador animado
- `StatsBanner` — banner com estatisticas

### Process / Como Funciona
- `ProcessSteps` — passos numerados
- `ProcessTimeline` — timeline vertical

### UI (utilitarios)
- `WhatsAppFloat` — botao flutuante WA
- `CookieBanner` — banner LGPD
- `ScrollToTop` — botao voltar ao topo

---

## Padrao de Copy (textos placeholder)

Use textos realistas mas genericos. Exemplos:

```
headline: "Transforme sua saude com acompanhamento profissional"
subheadline: "Mais de 500 pacientes atendidos com resultados comprovados"
ctaLabel: "Agende sua Consulta"
ctaHref: "#contato"
label: "Por que nos escolher"
```

**Evite:** "Lorem ipsum", "Texto aqui", "Exemplo"
**Prefira:** Textos que poderiam ser reais para um profissional liberal

---

## Padrao Premium — Design de Alta Conversao

### Hierarquia Visual
1. **Headline serif grande** — captura atencao
2. **Subheadline sans menor** — explica o beneficio
3. **Prova social** — numeros, badges, logos
4. **CTA claro** — botao primario com acao especifica
5. **Conteudo de suporte** — features, depoimentos, FAQ

### Cru vs Alto Padrao

Se qualquer item da coluna esquerda aparecer no componente, ele nao esta pronto.

| Elemento | Cru ❌ | Alto padrao ✅ |
|----------|--------|----------------|
| Cor hardcodada | `bg-blue-500`, `text-[#333]` | `bg-primary`, `text-text-main` |
| Sombra generica | `shadow-md`, `shadow-lg` | `shadow-card` + `hover:shadow-card-hover` |
| Hover de botao | `hover:opacity-80` | `hover:bg-primary-dark hover:shadow-primary-md ease-smooth duration-350` |
| Tipografia heading | `font-bold text-2xl` | `font-serif text-display-lg leading-tight` |
| Entrada no scroll | elemento estatico | `animate-fade-up` ou `data-animate` |
| Espacamento vertical | `py-12 md:py-24` manual | `py-section` via token |
| Fundos das secoes | branco em todas | alterna `bg-surface` e `bg-surface-alt` |
| Labels e rotulos | texto normal | `text-label uppercase tracking-widest text-text-soft` |
| Hover de card | sem interacao | `card-hover` (translate + shadow) + `ease-smooth duration-350` |
| Gradiente/destaque | ausente | `bg-secondary-gradient` em badges e highlights |
| Imagens | `<img>` nativo, sem dimensoes | `<Image />` do Astro, `width` e `height` explicitos |

### Detalhes Premium (que diferenciam R$500 de R$5.000+)
- Micro-espacamento generoso entre secoes
- Labels em caixa alta antes dos titulos (`text-label text-secondary`)
- Sombras sutis em cards (nunca pesadas)
- Transicoes CSS suaves em hover (300ms ease-out)
- Borda decorativa sutil em cards (`border border-border`)
- Citacoes com aspas decorativas
- Numeros/stats em `font-serif` grande
- Alternancia de fundos entre secoes (background/surface)
- Ornamentos sutis: linhas decorativas, icones monocromaticos
- Imagens com `rounded-xl` ou `rounded-2xl` e `object-cover`

### Dark Mode
Componentes devem funcionar com dark mode via classe `.dark` no `<html>`:
```html
<!-- O global.css ja faz o swap automatico destes tokens: -->
.dark .bg-background  → bg-dark-bg
.dark .bg-surface     → bg-dark-surface
.dark .text-text-main → text-dark-text-main
.dark .text-text-soft → text-dark-text-soft
.dark .border-border  → border-dark-border
```
Nao precisa de classes extras — o swap e automatico se voce usar os tokens corretos.

---

## Exemplo Completo — Componente de Referencia

```astro
---
// Testimonials/TestimonialsCards.astro
// Cards de depoimentos com foto, citacao e nome

interface Testimonial {
  name: string
  role: string
  quote: string
  photoUrl?: string
}

interface Props {
  label?: string
  headline?: string
  subheadline?: string
  testimonials: Testimonial[]
}

const {
  label = 'Depoimentos',
  headline = 'O que nossos clientes dizem',
  subheadline = 'Resultados reais de quem ja passou por aqui',
  testimonials,
} = Astro.props
---

<section class="py-section bg-surface" data-animate>
  <div class="w-[90%] max-w-wide mx-auto">
    <!-- Header -->
    <div class="text-center mb-16 max-w-content mx-auto">
      <span class="label-tag block mb-3">{label}</span>
      <h2 class="font-serif text-display-lg text-text-main mb-4">
        {headline}
      </h2>
      <p class="text-body-lg text-text-soft leading-relaxed max-w-prose mx-auto">
        {subheadline}
      </p>
    </div>

    <!-- Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-animate-group>
      {testimonials.map((t) => (
        <div
          class="bg-background rounded-xl p-8 shadow-card border border-border
                 card-hover relative"
          data-animate-item
        >
          <!-- Aspas decorativas -->
          <span class="absolute top-6 right-6 text-5xl font-serif text-primary/10 leading-none select-none">
            &ldquo;
          </span>

          <p class="text-text-soft text-body-md leading-relaxed mb-6 relative z-10 italic">
            &ldquo;{t.quote}&rdquo;
          </p>

          <div class="flex items-center gap-4 pt-4 border-t border-border">
            {t.photoUrl ? (
              <img
                src={t.photoUrl}
                alt={t.name}
                class="w-12 h-12 rounded-full object-cover"
                loading="lazy"
              />
            ) : (
              <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span class="text-primary font-semibold text-lg">
                  {t.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <p class="font-sans font-medium text-text-main text-body-sm">{t.name}</p>
              <p class="text-text-muted text-body-sm">{t.role}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

---

## Arquivo de Preview (.preview.astro)

Cada componente precisa de um arquivo de preview para visualizacao na Astroteca:

```astro
---
// Testimonials/TestimonialsCards.preview.astro
import TestimonialsCards from './TestimonialsCards.astro'
---

<TestimonialsCards
  testimonials={[
    {
      name: 'Maria Silva',
      role: 'Empresaria',
      quote: 'Resultado incrivel! Em 3 meses consegui transformar meu negocio completamente.',
    },
    {
      name: 'Joao Santos',
      role: 'Medico',
      quote: 'Profissionalismo e atencao aos detalhes. Recomendo sem hesitar.',
    },
    {
      name: 'Ana Costa',
      role: 'Advogada',
      quote: 'A melhor decisao que tomei. O retorno veio mais rapido do que eu esperava.',
    },
  ]}
/>
```

---

## Checklist Antes de Entregar

- [ ] Usa APENAS tokens do design system (zero cores/fontes literais)
- [ ] Props tipadas com `interface Props`
- [ ] Defaults em todas as props opcionais
- [ ] Responsivo: mobile (375px), tablet (768px), desktop (1280px)
- [ ] Sem imports de assets locais
- [ ] Sem dados reais de clientes
- [ ] Nome PascalCase correto
- [ ] Semantica HTML5 (section, article, nav, etc.)
- [ ] Acessibilidade basica (alt, aria-label)
- [ ] Dark mode funciona (usa tokens, nao cores literais)
- [ ] Arquivo .preview.astro com dados de exemplo
- [ ] Visual premium e profissional (R$5.000+ de valor percebido)
