# Component Blueprint — Astroteca

Guia completo para criar componentes profissionais para a biblioteca Astroteca.
Envie este documento para o Claude junto com o pedido do componente.

---

## Contexto

A Astroteca é uma biblioteca de componentes Astro para criar landing pages de alta performance e conversão. Os componentes são neutros e adaptáveis — usam tokens de cor e tipografia que são substituídos para cada cliente, sem nenhum valor visual hardcodado.

**Stack:** Astro 5 + Tailwind CSS **v4** (CSS-first). Componente `.astro` puro — sem React, sem JavaScript inline exceto interatividade essencial (accordion, slider, menu mobile).
**Padrão visual:** Premium, limpo, com bastante espaço em branco, tipografia elegante e micro-interações CSS sutis.

### Como os tokens funcionam (importante)

Não existe `tailwind.config.js`. O sistema de tokens vive em dois arquivos do projeto cliente:

- `src/styles/tokens.css` — os **valores**, como CSS custom properties com prefixo `--t-` (ex: `--t-primary: #436f3e`). É o único arquivo que muda entre clientes.
- `src/styles/global.css` — um bloco `@theme inline` que mapeia cada `--t-*` para o utilitário Tailwind correspondente (`bg-primary`, `text-text-main`, etc.) e define as classes prontas (`.btn-primary`, `.section-py`…).

Para você que cria o componente, a regra prática é simples: **use as classes Tailwind dos tokens** (`bg-primary`, `font-serif`, `text-display-lg`) ou, em CSS escopado, `var(--t-primary)`. Nunca um valor literal. O swap de tema (claro/escuro) é automático porque as classes apontam para as vars.

---

## Tokens Obrigatórios

### Cores (classes Tailwind)

| Classe | Token | Uso |
|--------|-------|-----|
| `bg-background` | `--t-background` | Fundo base da página |
| `bg-surface` | `--t-surface` | Cards, seções alternadas |
| `bg-surface-alt` | `--t-surface-alt` | Fundos com mais contraste |
| `bg-dark` | `--t-dark` | Seções escuras (footer, CTAs de impacto) |
| `bg-primary` / `text-primary` | `--t-primary` | Botão primário, CTAs, links, destaques |
| `bg-primary-dark` | `--t-primary-dark` | Hover do primário, variantes escuras |
| `bg-secondary` / `text-secondary` | `--t-secondary` | Badges, labels, CTA dourado |
| `bg-complement` | `--t-complement` | Detalhes decorativos |
| `text-text-main` | `--t-text-main` | Texto principal |
| `text-text-soft` | `--t-text-soft` | Texto secundário, subtítulos |
| `text-text-muted` | `--t-text-muted` | Placeholders, metadados |
| `border-border` | `--t-border` | Bordas de cards e divisores |
| `bg-wa` / `text-wa` | `--t-wa` | Verde do WhatsApp (#25D366) |

**PROIBIDO:** Valores literais de cor (`text-gray-600`, `bg-blue-500`, `text-[#333]`) e classes de paleta nativa do Tailwind (`bg-violet-500`, `text-slate-700`). Sempre os tokens acima.

### Tipografia

| Classe | Uso |
|--------|-----|
| `font-serif` | Headlines e títulos (h1–h3). Serif elegante (padrão: Cormorant Garamond) |
| `font-sans` | Corpo, botões, labels. Sans moderna (padrão: DM Sans) |
| `text-display-xl` | Hero headline — `clamp(2.6rem, 5.5vw, 4.2rem)` |
| `text-display-lg` | Título de seção — `clamp(2rem, 4vw, 3.2rem)` |
| `text-display-md` | Subtítulo — `clamp(1.7rem, 3vw, 2.4rem)` |
| `text-display-sm` | Título de card — `clamp(1.4rem, 2.5vw, 1.9rem)` |
| `text-body-lg` | Texto de destaque — `1.125rem` |
| `text-body-md` | Corpo padrão — `1rem` |
| `text-body-sm` | Texto menor — `0.9rem` |
| `text-label` | Label em caixa alta — `0.72rem`, tracking `0.16em` |

> O line-height de cada escala já vem embutido no token (não precisa de `leading-*`).

### Espaçamento e Layout (classes prontas do global.css)

| Classe | Uso |
|--------|-----|
| `.section-py` | Padding vertical de seção — `clamp(5rem, 10vw, 8rem)` |
| `.section-py-sm` | Seção menor — `clamp(3rem, 6vw, 5rem)` |
| `.section-py-lg` | Seção maior — `clamp(7rem, 14vw, 12rem)` |
| `.container-wide` | Container padrão — `w-[90%] max-w-wide mx-auto` (máx 1200px) |
| `.container-content` | Container de conteúdo — `w-[90%] max-w-content mx-auto` (máx 860px) |
| `max-w-prose` | Largura de texto ótima (~65ch) |

### Sombras (tokens de box-shadow)

| Classe | Uso |
|--------|-----|
| `shadow-card` | Sombra leve para cards |
| `shadow-card-hover` | Sombra no hover de cards |
| `shadow-float` | Elementos flutuantes |
| `shadow-primary-sm` / `shadow-primary-md` | Sombra colorida do primário (botões) |
| `shadow-secondary-sm` / `shadow-secondary-md` | Sombra colorida do secundário |

### Animação de scroll (data attributes — GSAP no projeto cliente)

| Atributo | Efeito |
|----------|--------|
| `data-animate` | Fade up ao entrar na viewport |
| `data-animate-left` | Slide da esquerda |
| `data-animate-right` | Slide da direita |
| `data-animate-scale` | Scale in |
| `data-animate-group` + `data-animate-item` | Stagger nos filhos |

> Esses atributos são ativados pelo GSAP do projeto cliente. No preview da biblioteca eles ficam visíveis por padrão (sem JS). Use-os para marcar o que deve animar — não escreva animação manual.

---

## Classes utilitárias prontas (global.css) — use, não reinvente

Reinventar botão/card com classes soltas é a principal causa de inconsistência entre projetos. Sempre use estas:

```
/* Botões */
.btn-primary         bg-primary → hover:bg-primary-dark, shadow-primary, ease-smooth, hover:-translate-y-0.5
.btn-ghost           contorno border-primary, hover:bg-primary/5
.btn-secondary-gold  gradiente dourado (secondary→complement→primary-dark) com shimmer no hover

/* Não existe .btn-wa. Para CTA de WhatsApp inline, monte com o token: */
class="inline-flex items-center gap-2 bg-wa text-white font-sans font-medium px-7 py-3.5 rounded"
  + sempre o ícone do WhatsApp e target="_blank" rel="noopener noreferrer"

/* Tipografia / rótulos */
.label-tag           text-label uppercase tracking-[0.16em] text-secondary

/* Hover e decoração */
.card-hover          -translate-y-1 + shadow-card-hover, ease-smooth
.img-hover           overflow-hidden + scale-[1.04] na <img> filha
.link-underline      underline animado de baixo
.badge / .badge-secondary   pill (bg-primary/10 ou bg-secondary/10)
.blockquote-premium  citação com aspa decorativa
.stat-number / .stat-label   número grande serif + legenda
.divider-ornament    divisor com linha central
```

---

## Estrutura Obrigatória de um Componente

```astro
---
// Categoria/NomeComponente.astro
// Breve descrição do componente

interface Props {
  headline: string
  subheadline?: string
  ctaLabel?: string
  ctaHref?: string
  // ... mais props conforme necessário
}

const {
  headline,
  subheadline = 'Subtítulo padrão aqui',
  ctaLabel = 'Fale Comigo',
  ctaHref = '#contato',
} = Astro.props
---

<section class="section-py bg-background">
  <div class="container-wide">
    <!-- Conteúdo aqui -->
  </div>
</section>
```

### Regras Absolutas

1. **Arquivo `.astro` puro** — sem React, sem imports JS complexos.
2. **Interface Props tipada** — todas as props com tipos corretos, sem `any`.
3. **Defaults em todas as props opcionais** — o componente renderiza sem nenhuma prop obrigatória além do essencial.
4. **Sem imports de assets locais** — imagens via URL ou props (o extract substitui assets locais por placeholder).
5. **Sem JavaScript inline** exceto para: accordion (toggle), slider, menu mobile.
6. **Sem dados reais** — textos placeholder realistas, nunca dados de cliente.
7. **Nome em PascalCase** — `HeroSplit.astro`, `FeaturesGrid3.astro`.
8. **Responsivo mobile-first** — funcionar em 375px, 768px, 1280px.
9. **Acessibilidade básica** — `alt` em imagens, `aria-label` em botões icônicos, semântica HTML5.

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
- `FeaturesIconList` — lista com ícones

### Testimonials / Depoimentos
- `TestimonialsCards` — cards com foto e quote
- `TestimonialsSlider` — carousel (único caso que precisa JS)
- `TestimonialsGrid` — grid masonry

### Pricing / Preços
- `PricingCards` — 2-3 planos lado a lado
- `PricingTable` — tabela comparativa

### CTA (call-to-action)
- `CTABanner` — banner fullwidth
- `CTAInline` — dentro do conteúdo
- `CTAWhatsApp` — CTA focado em WhatsApp

### FAQ
- `FAQAccordion` — perguntas com toggle (precisa script)
- `FAQGrid` — perguntas em grid sem toggle

### Contact
- `ContactSection` — formulário + info
- `ContactCTA` — apenas info de contato + mapa

### Footer
- `FooterSimples` — logo, links, redes, copyright
- `FooterCompleto` — com newsletter, mapa, etc.

### Header / Navigation
- `HeaderFixed` — navbar fixa
- `HeaderTransparent` — transparente no hero

### About / Sobre
- `AboutHistory` — história com timeline
- `AboutTeam` — equipe com fotos

### Stats / Números
- `StatsCounter` — números com contador animado
- `StatsBanner` — banner com estatísticas

### Process / Como Funciona
- `ProcessSteps` — passos numerados
- `ProcessTimeline` — timeline vertical

### UI (utilitários)
- `WhatsAppFloat` — botão flutuante WA
- `CookieBanner` — banner LGPD
- `ScrollToTop` — botão voltar ao topo

---

## Padrão de Copy (textos placeholder)

Use textos realistas mas genéricos:

```
headline: "Transforme sua saúde com acompanhamento profissional"
subheadline: "Mais de 500 pacientes atendidos com resultados comprovados"
ctaLabel: "Agende sua Consulta"
ctaHref: "#contato"
label: "Por que nos escolher"
```

**Evite:** "Lorem ipsum", "Texto aqui", "Exemplo".
**Prefira:** Textos que poderiam ser reais para um profissional liberal.

---

## Padrão Premium — Design de Alta Conversão

### Hierarquia Visual
1. **Headline serif grande** — captura atenção
2. **Subheadline sans menor** — explica o benefício
3. **Prova social** — números, badges, logos
4. **CTA claro** — botão primário com ação específica
5. **Conteúdo de suporte** — features, depoimentos, FAQ

### Cru vs Alto Padrão

Se qualquer item da coluna esquerda aparecer no componente, ele **não** está pronto.

| Elemento | Cru ❌ | Alto padrão ✅ |
|----------|--------|----------------|
| Cor hardcodada | `bg-blue-500`, `text-[#333]` | `bg-primary`, `text-text-main` |
| Sombra genérica | `shadow-md`, `shadow-lg` | `shadow-card` + `hover:shadow-card-hover` |
| Botão na mão | classes soltas | `.btn-primary` / `.btn-ghost` / `.btn-secondary-gold` |
| Tipografia heading | `font-bold text-2xl` | `font-serif text-display-lg` |
| Entrada no scroll | elemento estático | `data-animate` |
| Espaçamento vertical | `py-12 md:py-24` manual | `.section-py` via classe pronta |
| Container | largura na mão | `.container-wide` / `.container-content` |
| Fundos das seções | branco em todas | alterna `bg-surface` e `bg-surface-alt`/`bg-background` |
| Labels e rótulos | texto normal | `.label-tag` (uppercase, tracking, secondary) |
| Hover de card | sem interação | `.card-hover` (translate + shadow) |
| Imagens | `<img>` sem dimensões | `<img>`/`<Image>` com `width`/`height` e `object-cover` |
| Ícones | SVG inline / emoji | `astro-icon` + `lucide:*` com `text-*` para cor |

### Detalhes Premium (que diferenciam R$500 de R$5.000+)
- Micro-espaçamento generoso entre seções
- Labels em caixa alta antes dos títulos (`.label-tag`)
- Sombras sutis em cards (`shadow-card`, nunca pesadas)
- Transições CSS suaves em hover (300ms ease-out — já embutido nas classes prontas)
- Borda decorativa sutil em cards (`border border-border`)
- Citações com aspas decorativas (`.blockquote-premium`)
- Números/stats em `font-serif` grande (`.stat-number`)
- Alternância de fundos entre seções (`bg-background` ↔ `bg-surface`)
- Ornamentos sutis: linhas decorativas (`.divider-ornament`), ícones monocromáticos
- Imagens com `rounded-xl`/`rounded-2xl` e `object-cover`

### Ícones

Use **`astro-icon`** com a coleção **`lucide`** — já instalado no `_base-project` e em todos os projetos gerados pela Astroteca.

```astro
---
import { Icon } from 'astro-icon/components'
---

<Icon name="lucide:arrow-right" class="w-5 h-5 text-primary" aria-hidden="true" />
<Icon name="lucide:check-circle" class="w-5 h-5 text-primary" aria-hidden="true" />
<Icon name="lucide:map-pin" class="w-5 h-5 text-text-soft" aria-hidden="true" />
```

**Por quê `astro-icon`:** o SVG é gerado **inline no build** — zero JS, zero requisição extra, mesma performance de SVG inline manual. E porque o `_base-project` já tem `astro-icon` + `@iconify-json/lucide` instalado, a dependência está sempre garantida em todo projeto de cliente.

**Padrão de uso:**
- Tamanho via classe Tailwind: `w-4 h-4`, `w-5 h-5`, `w-6 h-6`
- Cor via token de texto: `text-primary`, `text-text-soft`, `text-text-muted` — o ícone herda via `currentColor`
- Sempre `aria-hidden="true"` em ícones decorativos; `aria-label` quando o ícone é o único conteúdo de um botão
- Coleção padrão: `lucide:*`. Para ícone de nicho sem equivalente, instale `@iconify-json/<coleção>` no projeto

**Nunca:**
- SVG inline manual (difícil de manter, inconsistente entre componentes)
- Emojis como ícones de UI

### Dark Mode

O componente funciona em dark mode **automaticamente** se usar os tokens. A classe `.dark` no `<html>` redefine os valores `--t-*` em `tokens.css`, e como as classes (`bg-surface`, `text-text-main`…) apontam para essas vars, a cor troca sozinha. **Não escreva variantes `dark:` nem cores específicas de dark** — basta usar os tokens corretos.

---

## Exemplo Completo — Componente de Referência

```astro
---
// Testimonials/TestimonialsCards.astro
// Cards de depoimentos com foto, citação e nome

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
  subheadline = 'Resultados reais de quem já passou por aqui',
  testimonials,
} = Astro.props
---

<section class="section-py bg-surface">
  <div class="container-wide">
    <!-- Header -->
    <div class="text-center mb-16 max-w-content mx-auto" data-animate>
      <span class="label-tag block mb-3">{label}</span>
      <h2 class="font-serif text-display-lg text-text-main mb-4">
        {headline}
      </h2>
      <p class="text-body-lg text-text-soft max-w-prose mx-auto">
        {subheadline}
      </p>
    </div>

    <!-- Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-animate-group>
      {testimonials.map((t) => (
        <div
          class="bg-background rounded-xl p-8 shadow-card border border-border card-hover relative"
          data-animate-item
        >
          <!-- Aspas decorativas -->
          <span class="absolute top-6 right-6 text-5xl font-serif text-primary/10 leading-none select-none">
            &ldquo;
          </span>

          <p class="text-text-soft text-body-md mb-6 relative z-10 italic">
            &ldquo;{t.quote}&rdquo;
          </p>

          <div class="flex items-center gap-4 pt-4 border-t border-border">
            {t.photoUrl ? (
              <img
                src={t.photoUrl}
                alt={t.name}
                width="48"
                height="48"
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

Cada componente precisa de um arquivo de preview para visualização na Astroteca.
Ao usar `npm run extract`, esse arquivo é **gerado automaticamente** a partir do componente — você só precisa criá-lo à mão se estiver montando o componente direto na biblioteca via `npm run new`.

```astro
---
// Testimonials/TestimonialsCards.preview.astro
import TestimonialsCards from './TestimonialsCards.astro'
---

<TestimonialsCards
  testimonials={[
    {
      name: 'Maria Silva',
      role: 'Empresária',
      quote: 'Resultado incrível! Em 3 meses consegui transformar meu negócio completamente.',
    },
    {
      name: 'João Santos',
      role: 'Médico',
      quote: 'Profissionalismo e atenção aos detalhes. Recomendo sem hesitar.',
    },
    {
      name: 'Ana Costa',
      role: 'Advogada',
      quote: 'A melhor decisão que tomei. O retorno veio mais rápido do que eu esperava.',
    },
  ]}
/>
```

---

## Como adicionar à biblioteca depois de pronto

O componente entregue pelo Claude **não** é colado numa tela. Você o salva como `.astro` e roda:

```bash
npm run extract caminho/para/NomeComponente.astro
```

O script detecta as props, pede categoria/descrição/tags, gera o `.preview.astro`, registra no `registry.json`, gera a página de preview e publica. (Para criar um esqueleto novo direto na biblioteca, use `npm run new`.)

---

## Checklist Antes de Entregar

- [ ] Usa APENAS tokens do design system (zero cores/fontes literais, zero paleta nativa do Tailwind)
- [ ] Props tipadas com `interface Props`, sem `any`
- [ ] Defaults em todas as props opcionais
- [ ] Usa classes prontas (`.section-py`, `.container-wide`, `.btn-*`, `.card-hover`) em vez de remontar na mão
- [ ] Responsivo: mobile (375px), tablet (768px), desktop (1280px)
- [ ] Sem imports de assets locais
- [ ] Ícones via `astro-icon` + coleção `lucide:*` — cor via `text-*`, tamanho via `w-* h-*`, `aria-hidden="true"`
- [ ] Sem dados reais de clientes
- [ ] Nome PascalCase correto
- [ ] Semântica HTML5 (`section`, `article`, `nav`, etc.)
- [ ] Acessibilidade básica (`alt`, `aria-label`)
- [ ] Imagens com `width`/`height` explícitos (evita CLS)
- [ ] Dark mode funciona só por usar os tokens (sem variantes `dark:`)
- [ ] Visual premium e profissional (R$5.000+ de valor percebido)
