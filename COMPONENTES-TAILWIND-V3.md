# 🧩 Componentes Astro — Tailwind CSS v3
> Biblioteca completa para landing pages de alta conversão.  
> 17 componentes prontos, responsivos, acessíveis e customizáveis via `primary` color.

---

## ⚙️ Configuração Obrigatória

### `tailwind.config.mjs`
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Define primary com suporte a modificadores de opacidade (bg-primary/10, etc.)
        primary: 'rgb(var(--color-primary-rgb) / <alpha-value>)',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'serif'],
        body:    ['var(--font-body)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### `src/styles/theme.css`
```css
/* Troque os valores aqui para cada cliente — os componentes herdam tudo. */
:root {
  /* Cor primária em RGB separado por espaços (obrigatório para bg-primary/10 funcionar) */
  --color-primary-rgb: 124 58 237;   /* violet-600 — troque aqui */

  /* Tipografia */
  --font-heading: 'Playfair Display', serif;
  --font-body:    'Inter', sans-serif;
}
```

> **Dica:** Use `--color-primary-rgb: 14 165 233` para azul, `37 99 235` para índigo, `220 38 38` para vermelho, etc.

---

## Índice

| # | Componente | Status |
|---|-----------|--------|
| 1 | [HeroSplit](#1-herosplit) | ✅ Original |
| 2 | [HeroCentered](#2-herocentered) | ✅ Original |
| 3 | [FeaturesGrid](#3-featuresgrid) | ✅ Original |
| 4 | [ServicesAlternating](#4-servicesalternating) | ✅ Original |
| 5 | [TestimonialsCards](#5-testimonialscards) | ✅ Original |
| 6 | [ProcessSteps](#6-processsteps) | ✅ Original |
| 7 | [PricingCards](#7-pricingcards) | ✅ Original |
| 8 | [FAQAccordion](#8-faqaccordion) | ✅ Original |
| 9 | [CTABanner](#9-ctabanner) | ✅ Original |
| 10 | [ContactSection](#10-contactsection) | ✅ Original |
| 11 | [FooterSimples](#11-footersimples) | ✅ Original |
| 12 | [StatsBar](#12-statsbar) | 🆕 Novo |
| 13 | [LogoCloud](#13-logocloud) | 🆕 Novo |
| 14 | [TeamSection](#14-teamsection) | 🆕 Novo |
| 15 | [PortfolioGrid](#15-portfoliogrid) | 🆕 Novo |
| 16 | [HeroVideo](#16-herovideo) | 🆕 Novo |
| 17 | [WhatsAppFloat](#17-whatsappfloat) | 🆕 Novo |

---

## 1. HeroSplit

**Quando usar:** Profissionais liberais com rosto humano — médicos, advogados, arquitetos, fotógrafos, coaches. A imagem lateral humaniza e gera confiança imediata.

```astro
---
// src/components/Hero/HeroSplit.astro

interface Props {
  headline: string
  subheadline?: string
  ctaLabel?: string
  ctaHref?: string
  ctaSecondaryLabel?: string
  ctaSecondaryHref?: string
  imageSrc: string
  imageAlt?: string
  badge?: string
  trustItems?: string[]
}

const {
  headline,
  subheadline = '',
  ctaLabel = 'Fale comigo',
  ctaHref = '#contato',
  ctaSecondaryLabel,
  ctaSecondaryHref,
  imageSrc,
  imageAlt = '',
  badge,
  trustItems = [],
} = Astro.props
---

<section class="bg-white py-16 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12">
  <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

    <!-- Conteúdo -->
    <div>
      {badge && (
        <span class="inline-block bg-primary/10 text-primary border border-primary/20
                     px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide mb-5">
          {badge}
        </span>
      )}

      <h1
        class="font-heading text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-gray-900
               leading-[1.1] tracking-tight mb-5
               [&_em]:text-primary [&_em]:not-italic"
        set:html={headline}
      />

      {subheadline && (
        <p class="text-lg text-gray-500 leading-relaxed mb-8 max-w-[44ch]">
          {subheadline}
        </p>
      )}

      <div class="flex flex-wrap gap-3 mb-8">
        <a
          href={ctaHref}
          class="inline-flex items-center gap-2 bg-primary text-white px-7 py-3.5
                 rounded-xl font-semibold text-[0.95rem] shadow-lg shadow-primary/30
                 hover:opacity-90 hover:-translate-y-px transition-all duration-200"
        >
          {ctaLabel}
        </a>
        {ctaSecondaryLabel && (
          <a
            href={ctaSecondaryHref}
            class="inline-flex items-center gap-2 border border-gray-200 text-gray-800
                   px-7 py-3.5 rounded-xl font-semibold text-[0.95rem]
                   hover:border-primary hover:text-primary transition-colors duration-200"
          >
            {ctaSecondaryLabel}
          </a>
        )}
      </div>

      {trustItems.length > 0 && (
        <ul class="flex flex-wrap gap-x-6 gap-y-2">
          {trustItems.map(item => (
            <li class="flex items-center gap-2 text-sm text-gray-500">
              <span class="text-primary font-bold" aria-hidden="true">✓</span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>

    <!-- Imagem -->
    <div class="order-first lg:order-last">
      <div class="relative rounded-2xl overflow-hidden aspect-[4/5] hero-split__frame">
        <img
          src={imageSrc}
          alt={imageAlt}
          class="w-full h-full object-cover"
          loading="eager"
          decoding="async"
        />
      </div>
    </div>

  </div>
</section>

<style>
  /* Decoração: borda deslocada — não há equivalente em Tailwind puro */
  @media (min-width: 1024px) {
    .hero-split__frame::before {
      content: '';
      position: absolute;
      inset: -12px -12px 12px 12px;
      border: 2px solid rgb(var(--color-primary-rgb) / 0.2);
      border-radius: 1rem;
      z-index: -1;
    }
  }
</style>
```

**Exemplo de uso:**
```astro
<HeroSplit
  badge="⭐ +300 casamentos fotografados"
  headline="Fotografias que guardam o que <em>palavras</em> não alcançam"
  subheadline="Especialista em casamentos em Minas Gerais. Cada detalhe registrado com cuidado e um olhar único."
  ctaLabel="Ver meu portfólio"
  ctaHref="#portfolio"
  ctaSecondaryLabel="Saiba mais"
  ctaSecondaryHref="#sobre"
  imageSrc="/foto-fotografa.webp"
  imageAlt="Aline Ferreira, fotógrafa de casamentos"
  trustItems={["Sem fidelidade", "Resposta em 24h", "Álbuns físicos incluídos"]}
/>
```

---

## 2. HeroCentered

**Quando usar:** Agências, consultores, prestadores de serviço com headline muito forte. Foco total na mensagem — sem distração de imagem.

```astro
---
// src/components/Hero/HeroCentered.astro

interface Props {
  headline: string
  subheadline?: string
  ctaLabel?: string
  ctaHref?: string
  ctaSecondaryLabel?: string
  ctaSecondaryHref?: string
  badge?: string
  stats?: Array<{ value: string; label: string }>
}

const {
  headline,
  subheadline = '',
  ctaLabel = 'Começar agora',
  ctaHref = '#contato',
  ctaSecondaryLabel,
  ctaSecondaryHref,
  badge,
  stats = [],
} = Astro.props
---

<section class="relative bg-white py-20 lg:py-32 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">

  <!-- Glow decorativo -->
  <div class="pointer-events-none absolute inset-0" aria-hidden="true">
    <div class="hero-centered__glow absolute -top-1/4 left-1/2 -translate-x-1/2
                w-[60%] h-[60%] rounded-full blur-[80px] opacity-40
                bg-primary/20" />
  </div>

  <div class="relative max-w-3xl mx-auto">

    {badge && (
      <div class="mb-6">
        <span class="inline-flex items-center gap-2 bg-primary/8 border border-primary/20
                     text-primary px-4 py-2 rounded-full text-[0.825rem] font-semibold
                     tracking-[0.01em]">
          {badge}
        </span>
      </div>
    )}

    <h1
      class="font-heading text-4xl sm:text-5xl lg:text-[4.25rem] font-bold text-gray-900
             leading-[1.1] tracking-tight mb-6
             [&_em]:text-primary [&_em]:not-italic [&_em]:hero-em-underline"
      set:html={headline}
    />

    {subheadline && (
      <p class="text-lg sm:text-xl text-gray-500 leading-relaxed mb-10 max-w-[54ch] mx-auto">
        {subheadline}
      </p>
    )}

    <div class="flex justify-center flex-wrap gap-3 mb-14">
      <a
        href={ctaHref}
        class="inline-flex items-center bg-primary text-white px-8 py-4 rounded-xl
               font-semibold text-base shadow-xl shadow-primary/35
               hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
      >
        {ctaLabel}
      </a>
      {ctaSecondaryLabel && (
        <a
          href={ctaSecondaryHref}
          class="inline-flex items-center border border-gray-200 text-gray-700 px-8 py-4
                 rounded-xl font-semibold text-base
                 hover:border-primary hover:text-primary transition-colors duration-200"
        >
          {ctaSecondaryLabel}
        </a>
      )}
    </div>

    {stats.length > 0 && (
      <div class="flex justify-center items-center flex-wrap border-t border-gray-100 pt-10">
        {stats.map((stat, i) => (
          <>
            <div class="flex flex-col items-center gap-1 px-8 py-2">
              <span class="font-heading text-[2rem] font-bold text-gray-900 leading-none">
                {stat.value}
              </span>
              <span class="text-xs text-gray-400 text-center">{stat.label}</span>
            </div>
            {i < stats.length - 1 && (
              <div class="w-px h-10 bg-gray-100 hidden sm:block" aria-hidden="true" />
            )}
          </>
        ))}
      </div>
    )}

  </div>
</section>

<style>
  /* Sublinhado decorativo no <em> do headline */
  .hero-em-underline {
    position: relative;
  }
  .hero-em-underline::after {
    content: '';
    position: absolute;
    left: 0; bottom: -4px;
    width: 100%; height: 3px;
    background: rgb(var(--color-primary-rgb));
    border-radius: 2px;
    opacity: 0.35;
  }
  /* Força bg-primary/8 que não existe nativamente no Tailwind v3 */
  .bg-primary\/8 { background-color: rgb(var(--color-primary-rgb) / 0.08); }
</style>
```

**Exemplo de uso:**
```astro
<HeroCentered
  badge="🚀 Mais de 50 projetos entregues"
  headline="Landing pages que <em>convertem</em> de verdade"
  subheadline="Design estratégico para negócios que querem crescer. Da direção de arte ao código — tudo em suas mãos."
  ctaLabel="Solicitar orçamento"
  ctaHref="#contato"
  ctaSecondaryLabel="Ver projetos"
  ctaSecondaryHref="#portfolio"
  stats={[
    { value: "50+", label: "Projetos entregues" },
    { value: "98%", label: "Clientes satisfeitos" },
    { value: "14d", label: "Prazo médio de entrega" },
  ]}
/>
```

---

## 3. FeaturesGrid

**Quando usar:** Apresentar 3–6 diferenciais ou benefícios. Funciona em qualquer nicho. É a seção mais versátil da biblioteca.

```astro
---
// src/components/Features/FeaturesGrid.astro

interface FeatureItem {
  icon: string
  title: string
  description: string
}

interface Props {
  sectionLabel?: string
  sectionTitle?: string
  sectionSubtitle?: string
  items: FeatureItem[]
  columns?: 2 | 3 | 4
  variant?: 'cards' | 'minimal' | 'bordered'
  background?: 'white' | 'gray'
}

const {
  sectionLabel,
  sectionTitle,
  sectionSubtitle,
  items,
  columns = 3,
  variant = 'cards',
  background = 'white',
} = Astro.props

const colClass: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

const cardBase = 'flex flex-col gap-4 p-7 rounded-2xl transition-all duration-200'
const cardVariant: Record<string, string> = {
  cards:    'bg-white shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-lg',
  minimal:  '',
  bordered: 'border border-gray-200 hover:border-primary/40 hover:-translate-y-1',
}
---

<section class={`py-16 lg:py-24 px-4 sm:px-6 lg:px-8 ${background === 'gray' ? 'bg-gray-50' : 'bg-white'}`}>
  <div class="max-w-7xl mx-auto">

    {(sectionLabel || sectionTitle || sectionSubtitle) && (
      <div class="text-center mb-12 lg:mb-16 max-w-2xl mx-auto">
        {sectionLabel && (
          <span class="inline-block text-[0.7rem] font-bold uppercase tracking-[0.12em]
                       text-primary mb-3">
            {sectionLabel}
          </span>
        )}
        {sectionTitle && (
          <h2
            class="font-heading text-3xl lg:text-[2.75rem] font-bold text-gray-900
                   leading-tight tracking-tight mb-4
                   [&_em]:text-primary [&_em]:not-italic"
            set:html={sectionTitle}
          />
        )}
        {sectionSubtitle && (
          <p class="text-gray-500 text-lg leading-relaxed">{sectionSubtitle}</p>
        )}
      </div>
    )}

    <div class={`grid grid-cols-1 ${colClass[columns] || colClass[3]} gap-6`}>
      {items.map((item) => (
        <div class={`${cardBase} ${cardVariant[variant]}`}>
          <div class="w-12 h-12 flex items-center justify-center rounded-xl
                      bg-primary/10 text-2xl shrink-0" aria-hidden="true">
            {item.icon}
          </div>
          <h3 class="font-heading text-xl font-bold text-gray-900">{item.title}</h3>
          <p class="text-gray-500 text-[0.95rem] leading-relaxed">{item.description}</p>
        </div>
      ))}
    </div>

  </div>
</section>
```

**Exemplo de uso:**
```astro
<FeaturesGrid
  sectionLabel="Por que nos escolher"
  sectionTitle="Tudo que você precisa para <em>crescer online</em>"
  columns={3}
  variant="cards"
  background="gray"
  items={[
    { icon: "⚡", title: "Entrega Rápida", description: "Prazo médio de 14 dias. Sem enrolação, sem atrasos." },
    { icon: "🎯", title: "Foco em Conversão", description: "Cada elemento da página foi pensado para transformar visitante em cliente." },
    { icon: "📱", title: "100% Responsivo", description: "Perfeito em qualquer dispositivo — do celular ao desktop." },
    { icon: "🔒", title: "Suporte Incluído", description: "30 dias de suporte após a entrega, sem custo adicional." },
    { icon: "📈", title: "SEO Técnico", description: "Código otimizado para aparecer no Google desde o primeiro dia." },
    { icon: "✏️", title: "Design Exclusivo", description: "Nenhuma página igual à outra. Identidade visual única para cada cliente." },
  ]}
/>
```

---

## 4. ServicesAlternating

**Quando usar:** Detalhar 2–4 serviços principais com imagem. A alternância cria ritmo visual e mantém o leitor engajado.

```astro
---
// src/components/Services/ServicesAlternating.astro

interface ServiceItem {
  badge?: string
  title: string
  description: string
  imageSrc: string
  imageAlt?: string
  features?: string[]
  ctaLabel?: string
  ctaHref?: string
}

interface Props {
  sectionLabel?: string
  sectionTitle?: string
  items: ServiceItem[]
}

const { sectionLabel, sectionTitle, items } = Astro.props
---

<section class="bg-white py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
  <div class="max-w-7xl mx-auto">

    {(sectionLabel || sectionTitle) && (
      <div class="text-center mb-16 max-w-2xl mx-auto">
        {sectionLabel && (
          <span class="inline-block text-[0.7rem] font-bold uppercase tracking-[0.12em] text-primary mb-3">
            {sectionLabel}
          </span>
        )}
        {sectionTitle && (
          <h2
            class="font-heading text-3xl lg:text-[2.75rem] font-bold text-gray-900
                   leading-tight tracking-tight [&_em]:text-primary [&_em]:not-italic"
            set:html={sectionTitle}
          />
        )}
      </div>
    )}

    <div class="flex flex-col gap-20 lg:gap-28">
      {items.map((item, index) => (
        <article class={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center
                         ${index % 2 !== 0 ? 'lg:[direction:rtl]' : ''}`}>

          <!-- Imagem -->
          <div class="relative rounded-2xl overflow-hidden aspect-[4/3] group
                      lg:[direction:ltr]">
            {item.badge && (
              <span class="absolute top-4 left-4 z-10 bg-primary text-white text-[0.75rem]
                           font-bold px-3 py-1 rounded-full">
                {item.badge}
              </span>
            )}
            <img
              src={item.imageSrc}
              alt={item.imageAlt || ''}
              class="w-full h-full object-cover transition-transform duration-500
                     group-hover:scale-[1.03]"
              loading="lazy"
              decoding="async"
            />
          </div>

          <!-- Conteúdo -->
          <div class="lg:[direction:ltr]">
            <h3 class="font-heading text-2xl lg:text-[2rem] font-bold text-gray-900
                        leading-tight tracking-tight mb-4">
              {item.title}
            </h3>
            <p class="text-gray-500 leading-[1.75] mb-6">{item.description}</p>

            {item.features && item.features.length > 0 && (
              <ul class="flex flex-col gap-2.5 mb-8">
                {item.features.map(feat => (
                  <li class="flex items-start gap-2.5 text-[0.9rem] text-gray-700">
                    <span class="text-primary font-bold shrink-0 mt-0.5" aria-hidden="true">→</span>
                    {feat}
                  </li>
                ))}
              </ul>
            )}

            {item.ctaLabel && (
              <a
                href={item.ctaHref || '#'}
                class="inline-flex items-center gap-2 text-primary font-bold text-[0.95rem]
                       border-b-2 border-primary/30 pb-0.5
                       hover:gap-3 hover:border-primary transition-all duration-200"
              >
                {item.ctaLabel}
                <span aria-hidden="true">→</span>
              </a>
            )}
          </div>

        </article>
      ))}
    </div>

  </div>
</section>
```

---

## 5. TestimonialsCards

**Quando usar:** Qualquer negócio baseado em confiança. Depoimentos aumentam conversão em 20–50%. Use com fotos reais.

```astro
---
// src/components/Testimonials/TestimonialsCards.astro

interface TestimonialItem {
  quote: string
  authorName: string
  authorRole?: string
  authorPhoto?: string
  rating?: number
}

interface Props {
  sectionLabel?: string
  sectionTitle?: string
  items: TestimonialItem[]
  background?: 'white' | 'tint'
}

const { sectionLabel, sectionTitle, items, background = 'tint' } = Astro.props
---

<section class={`py-16 lg:py-24 px-4 sm:px-6 lg:px-8 ${background === 'tint' ? 'bg-primary/[0.04]' : 'bg-white'}`}>
  <div class="max-w-7xl mx-auto">

    {(sectionLabel || sectionTitle) && (
      <div class="text-center mb-12 lg:mb-16">
        {sectionLabel && (
          <span class="inline-block text-[0.7rem] font-bold uppercase tracking-[0.12em] text-primary mb-3">
            {sectionLabel}
          </span>
        )}
        {sectionTitle && (
          <h2
            class="font-heading text-3xl lg:text-[2.75rem] font-bold text-gray-900
                   leading-tight tracking-tight [&_em]:text-primary [&_em]:not-italic"
            set:html={sectionTitle}
          />
        )}
      </div>
    )}

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <article class="flex flex-col gap-4 bg-white border border-gray-100 rounded-2xl p-8
                         transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">

          {/* Estrelas */}
          {item.rating && (
            <div class="flex gap-0.5" aria-label={`${item.rating} de 5 estrelas`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  class={`text-base ${i < item.rating! ? 'text-amber-400' : 'text-gray-200'}`}
                  aria-hidden="true"
                >★</span>
              ))}
            </div>
          )}

          {/* Aspas decorativas */}
          <div class="font-heading text-[5rem] leading-[0.5] text-primary/20 select-none"
               aria-hidden="true">"</div>

          {/* Depoimento */}
          <blockquote class="flex-1 text-[0.95rem] text-gray-600 leading-[1.75] not-italic m-0">
            {item.quote}
          </blockquote>

          {/* Autor */}
          <footer class="flex items-center gap-3.5 pt-4 mt-auto
                          border-t border-gray-100">
            {item.authorPhoto && (
              <img
                src={item.authorPhoto}
                alt={item.authorName}
                class="w-11 h-11 rounded-full object-cover shrink-0"
                loading="lazy"
              />
            )}
            {!item.authorPhoto && (
              <div class="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center
                           text-primary font-bold text-lg shrink-0">
                {item.authorName.charAt(0)}
              </div>
            )}
            <div>
              <cite class="block text-sm font-bold text-gray-900 not-italic">
                {item.authorName}
              </cite>
              {item.authorRole && (
                <span class="text-xs text-gray-400">{item.authorRole}</span>
              )}
            </div>
          </footer>

        </article>
      ))}
    </div>

  </div>
</section>
```

---

## 6. ProcessSteps

**Quando usar:** Explicar o processo de trabalho. Reduz objeções e aumenta percepção de profissionalismo.

```astro
---
// src/components/Process/ProcessSteps.astro

interface StepItem {
  number?: string
  title: string
  description: string
  icon?: string
}

interface Props {
  sectionLabel?: string
  sectionTitle?: string
  sectionSubtitle?: string
  items: StepItem[]
  variant?: 'horizontal' | 'vertical'
  background?: 'white' | 'gray'
}

const {
  sectionLabel, sectionTitle, sectionSubtitle,
  items, variant = 'horizontal', background = 'white',
} = Astro.props
---

<section class={`py-16 lg:py-24 px-4 sm:px-6 lg:px-8 ${background === 'gray' ? 'bg-gray-50' : 'bg-white'}`}>
  <div class="max-w-7xl mx-auto">

    {(sectionLabel || sectionTitle || sectionSubtitle) && (
      <div class="text-center mb-12 lg:mb-16 max-w-2xl mx-auto">
        {sectionLabel && (
          <span class="inline-block text-[0.7rem] font-bold uppercase tracking-[0.12em] text-primary mb-3">
            {sectionLabel}
          </span>
        )}
        {sectionTitle && (
          <h2
            class="font-heading text-3xl lg:text-[2.75rem] font-bold text-gray-900
                   leading-tight tracking-tight mb-4 [&_em]:text-primary [&_em]:not-italic"
            set:html={sectionTitle}
          />
        )}
        {sectionSubtitle && (
          <p class="text-gray-500 text-lg leading-relaxed">{sectionSubtitle}</p>
        )}
      </div>
    )}

    {variant === 'horizontal' ? (
      <div class="process-steps-horizontal grid gap-0"
           style={`grid-template-columns: repeat(${items.length}, 1fr)`}>
        {items.map((item, index) => (
          <div class="flex flex-col items-center text-center px-4 relative">

            <!-- Número + linha conectora -->
            <div class="flex items-center w-full mb-6 relative">
              <div class="flex-1 h-px bg-gray-200 process-line-left"
                   style={index === 0 ? 'visibility:hidden' : ''} />
              <div class="w-14 h-14 rounded-full bg-primary text-white font-heading font-bold
                           text-lg flex items-center justify-center shrink-0 z-10
                           shadow-lg shadow-primary/25">
                {item.icon || item.number || String(index + 1).padStart(2, '0')}
              </div>
              <div class="flex-1 h-px bg-gray-200 process-line-right"
                   style={index === items.length - 1 ? 'visibility:hidden' : ''} />
            </div>

            <h3 class="font-heading text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
            <p class="text-sm text-gray-500 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    ) : (
      <div class="max-w-2xl mx-auto flex flex-col gap-0">
        {items.map((item, index) => (
          <div class="flex gap-6 relative">
            <!-- Trilha vertical -->
            <div class="flex flex-col items-center shrink-0">
              <div class="w-12 h-12 rounded-full bg-primary text-white font-heading font-bold
                           flex items-center justify-center shadow-lg shadow-primary/25 z-10">
                {item.icon || item.number || String(index + 1).padStart(2, '0')}
              </div>
              {index < items.length - 1 && (
                <div class="w-px flex-1 bg-gray-200 my-2 min-h-[3rem]" aria-hidden="true" />
              )}
            </div>
            <!-- Conteúdo -->
            <div class={`pb-10 ${index === items.length - 1 ? 'pb-0' : ''}`}>
              <h3 class="font-heading text-xl font-bold text-gray-900 mb-2 mt-2.5">
                {item.title}
              </h3>
              <p class="text-gray-500 leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    )}

  </div>
</section>

<style>
  /* Grid responsivo para horizontal — colapsa para 2 colunas no mobile */
  @media (max-width: 640px) {
    .process-steps-horizontal {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 2rem 0;
    }
    .process-line-left,
    .process-line-right { display: none; }
  }
</style>
```

---

## 7. PricingCards

**Quando usar:** Quando há múltiplos pacotes. Destaque sempre o plano principal com `highlighted: true`.

```astro
---
// src/components/Pricing/PricingCards.astro

interface PricingPlan {
  name: string
  price: string
  priceNote?: string
  description: string
  features: string[]
  ctaLabel?: string
  ctaHref?: string
  highlighted?: boolean
  badge?: string
}

interface Props {
  sectionLabel?: string
  sectionTitle?: string
  sectionSubtitle?: string
  plans: PricingPlan[]
  disclaimer?: string
}

const { sectionLabel, sectionTitle, sectionSubtitle, plans, disclaimer } = Astro.props
---

<section class="bg-white py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
  <div class="max-w-7xl mx-auto">

    {(sectionLabel || sectionTitle || sectionSubtitle) && (
      <div class="text-center mb-12 lg:mb-16 max-w-2xl mx-auto">
        {sectionLabel && (
          <span class="inline-block text-[0.7rem] font-bold uppercase tracking-[0.12em] text-primary mb-3">
            {sectionLabel}
          </span>
        )}
        {sectionTitle && (
          <h2
            class="font-heading text-3xl lg:text-[2.75rem] font-bold text-gray-900
                   leading-tight tracking-tight mb-4 [&_em]:text-primary [&_em]:not-italic"
            set:html={sectionTitle}
          />
        )}
        {sectionSubtitle && (
          <p class="text-gray-500 text-lg leading-relaxed">{sectionSubtitle}</p>
        )}
      </div>
    )}

    <div class={`grid grid-cols-1 md:grid-cols-${Math.min(plans.length, 2)} lg:grid-cols-${Math.min(plans.length, 3)} gap-6 items-start`}>
      {plans.map((plan) => (
        <article
          class={`relative flex flex-col gap-6 rounded-2xl p-8 transition-transform duration-200 hover:-translate-y-1
                  ${plan.highlighted
                    ? 'bg-primary text-white shadow-2xl shadow-primary/30 scale-[1.02]'
                    : 'bg-white border border-gray-150 shadow-sm'}`}
        >
          {plan.badge && (
            <div class={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full
                          text-xs font-bold whitespace-nowrap
                          ${plan.highlighted ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
              {plan.badge}
            </div>
          )}

          <!-- Header -->
          <div>
            <h3 class={`font-heading text-xl font-bold mb-3 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
              {plan.name}
            </h3>
            <div class="mb-3">
              <span class={`block font-heading text-[2.5rem] font-bold leading-none
                            ${plan.highlighted ? 'text-white' : 'text-primary'}`}>
                {plan.price}
              </span>
              {plan.priceNote && (
                <span class={`text-xs mt-1 block ${plan.highlighted ? 'text-white/60' : 'text-gray-400'}`}>
                  {plan.priceNote}
                </span>
              )}
            </div>
            <p class={`text-sm leading-relaxed ${plan.highlighted ? 'text-white/75' : 'text-gray-500'}`}>
              {plan.description}
            </p>
          </div>

          <!-- Features -->
          <ul class="flex flex-col gap-2.5 flex-1">
            {plan.features.map(feat => (
              <li class={`flex items-start gap-2.5 text-sm leading-relaxed
                           ${plan.highlighted ? 'text-white/90' : 'text-gray-700'}`}>
                <span class={`font-bold shrink-0 mt-0.5 ${plan.highlighted ? 'text-white' : 'text-primary'}`}
                      aria-hidden="true">✓</span>
                {feat}
              </li>
            ))}
          </ul>

          <!-- CTA -->
          <a
            href={plan.ctaHref || '#contato'}
            class={`block text-center py-3.5 rounded-xl font-bold text-[0.95rem]
                    transition-all duration-200
                    ${plan.highlighted
                      ? 'bg-white text-primary hover:opacity-90'
                      : 'border-2 border-primary text-primary hover:bg-primary/5'}`}
          >
            {plan.ctaLabel || 'Quero esse plano'}
          </a>

        </article>
      ))}
    </div>

    {disclaimer && (
      <p class="text-center mt-8 text-xs text-gray-400">{disclaimer}</p>
    )}

  </div>
</section>
```

---

## 8. FAQAccordion

**Quando usar:** Toda landing page precisa de FAQ. Responde objeções, melhora SEO e reduz atrito antes da conversão.

```astro
---
// src/components/FAQ/FAQAccordion.astro

interface FAQItem {
  question: string
  answer: string
}

interface Props {
  sectionLabel?: string
  sectionTitle?: string
  items: FAQItem[]
  columns?: 1 | 2
  background?: 'white' | 'gray'
}

const {
  sectionLabel, sectionTitle, items,
  columns = 1, background = 'white',
} = Astro.props
---

<section class={`py-16 lg:py-24 px-4 sm:px-6 lg:px-8 ${background === 'gray' ? 'bg-gray-50' : 'bg-white'}`}>
  <div class="max-w-3xl mx-auto">

    {(sectionLabel || sectionTitle) && (
      <div class="text-center mb-12">
        {sectionLabel && (
          <span class="inline-block text-[0.7rem] font-bold uppercase tracking-[0.12em] text-primary mb-3">
            {sectionLabel}
          </span>
        )}
        {sectionTitle && (
          <h2
            class="font-heading text-3xl lg:text-[2.75rem] font-bold text-gray-900
                   leading-tight tracking-tight [&_em]:text-primary [&_em]:not-italic"
            set:html={sectionTitle}
          />
        )}
      </div>
    )}

    <div class={columns === 2 ? 'grid sm:grid-cols-2 gap-x-8' : ''}>
      {items.map((item, index) => (
        <details
          class="group border-b border-gray-100 first:border-t"
          name="faq-group"
        >
          <summary
            class="flex items-center justify-between gap-4 py-5 cursor-pointer
                   list-none font-semibold text-gray-900 text-[1rem]
                   hover:text-primary transition-colors duration-150 select-none
                   group-open:text-primary
                   [&::-webkit-details-marker]:hidden"
          >
            <span>{item.question}</span>
            <span
              class="w-7 h-7 shrink-0 flex items-center justify-center rounded-full
                     bg-primary/10 text-primary text-xl font-light leading-none
                     transition-all duration-250
                     group-open:rotate-45 group-open:bg-primary group-open:text-white"
              aria-hidden="true"
            >+</span>
          </summary>

          <div class="faq-answer overflow-hidden">
            <p class="pb-5 text-[0.95rem] text-gray-500 leading-[1.75]">
              {item.answer}
            </p>
          </div>

        </details>
      ))}
    </div>

  </div>
</section>

<style>
  /* Animação de abertura */
  .faq-answer {
    animation: faq-reveal 0.28s ease;
  }
  @keyframes faq-reveal {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
</style>
```

---

## 9. CTABanner

**Quando usar:** Sempre — toda página precisa de uma CTA forte antes do footer. É a última chance de converter.

```astro
---
// src/components/CTA/CTABanner.astro

interface Props {
  headline: string
  subheadline?: string
  ctaLabel?: string
  ctaHref?: string
  ctaSecondaryLabel?: string
  ctaSecondaryHref?: string
  variant?: 'filled' | 'outline' | 'dark'
  backgroundImage?: string
}

const {
  headline,
  subheadline,
  ctaLabel = 'Fale comigo agora',
  ctaHref = '#contato',
  ctaSecondaryLabel,
  ctaSecondaryHref,
  variant = 'filled',
  backgroundImage,
} = Astro.props

const sectionClass: Record<string, string> = {
  filled:  'bg-primary text-white',
  outline: 'bg-primary/[0.05] border-y border-primary/15',
  dark:    'bg-gray-950 text-white relative overflow-hidden',
}

const headlineClass: Record<string, string> = {
  filled:  'text-white',
  outline: 'text-gray-900',
  dark:    'text-white',
}

const subClass: Record<string, string> = {
  filled:  'text-white/75',
  outline: 'text-gray-500',
  dark:    'text-white/60',
}
---

<section class={`py-16 lg:py-24 px-4 sm:px-6 lg:px-8 text-center ${sectionClass[variant]}`}>

  {variant === 'dark' && backgroundImage && (
    <div class="absolute inset-0 z-0" aria-hidden="true">
      <img src={backgroundImage} alt="" class="w-full h-full object-cover opacity-20" />
      <div class="absolute inset-0 bg-gray-950/60" />
    </div>
  )}

  <div class="relative z-10 max-w-2xl mx-auto">
    <h2
      class={`font-heading text-3xl lg:text-[2.75rem] font-bold leading-tight tracking-tight mb-4
              [&_em]:opacity-75 [&_em]:not-italic ${headlineClass[variant]}`}
      set:html={headline}
    />

    {subheadline && (
      <p class={`text-lg leading-relaxed mb-10 ${subClass[variant]}`}>
        {subheadline}
      </p>
    )}

    <div class="flex justify-center flex-wrap gap-4">
      <a
        href={ctaHref}
        class={`inline-block px-8 py-4 rounded-xl font-bold text-[1rem]
                transition-all duration-200 hover:-translate-y-0.5
                ${variant === 'filled'
                  ? 'bg-white text-primary hover:opacity-90'
                  : 'bg-primary text-white shadow-xl shadow-primary/35 hover:opacity-90'}`}
      >
        {ctaLabel}
      </a>
      {ctaSecondaryLabel && (
        <a
          href={ctaSecondaryHref}
          class={`inline-block px-8 py-4 rounded-xl font-bold text-[1rem]
                  border-2 transition-all duration-200
                  ${variant === 'filled'
                    ? 'border-white/40 text-white hover:border-white hover:bg-white/10'
                    : variant === 'dark'
                      ? 'border-white/25 text-white/80 hover:border-white/60'
                      : 'border-gray-300 text-gray-700 hover:border-primary hover:text-primary'}`}
        >
          {ctaSecondaryLabel}
        </a>
      )}
    </div>
  </div>

</section>
```

---

## 10. ContactSection

**Quando usar:** Final da página. Formulário + informações de contato lado a lado. Gera leads diretamente.

```astro
---
// src/components/Contact/ContactSection.astro

interface ContactInfo {
  icon: string
  label: string
  value: string
  href?: string
}

interface Props {
  sectionLabel?: string
  sectionTitle?: string
  sectionSubtitle?: string
  contactInfo?: ContactInfo[]
  formAction?: string
  formspreeId?: string
}

const {
  sectionLabel, sectionTitle, sectionSubtitle,
  contactInfo = [], formAction, formspreeId,
} = Astro.props

const action = formAction || (formspreeId ? `https://formspree.io/f/${formspreeId}` : '#')
---

<section class="bg-gray-50 py-16 lg:py-24 px-4 sm:px-6 lg:px-8" id="contato">
  <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

    <!-- Info lateral -->
    <div>
      {sectionLabel && (
        <span class="inline-block text-[0.7rem] font-bold uppercase tracking-[0.12em] text-primary mb-3">
          {sectionLabel}
        </span>
      )}
      {sectionTitle && (
        <h2
          class="font-heading text-3xl lg:text-[2.5rem] font-bold text-gray-900
                 leading-tight tracking-tight mb-4 [&_em]:text-primary [&_em]:not-italic"
          set:html={sectionTitle}
        />
      )}
      {sectionSubtitle && (
        <p class="text-gray-500 text-lg leading-relaxed mb-10">{sectionSubtitle}</p>
      )}

      {contactInfo.length > 0 && (
        <ul class="flex flex-col gap-5">
          {contactInfo.map(info => (
            <li class="flex items-start gap-4">
              <span class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center
                            justify-center text-lg shrink-0" aria-hidden="true">
                {info.icon}
              </span>
              <div>
                <span class="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                  {info.label}
                </span>
                {info.href ? (
                  <a href={info.href}
                     class="text-gray-900 font-medium hover:text-primary transition-colors">
                    {info.value}
                  </a>
                ) : (
                  <span class="text-gray-900 font-medium">{info.value}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>

    <!-- Formulário -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-10">
      <form action={action} method="POST" class="flex flex-col gap-5">

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div class="flex flex-col gap-1.5">
            <label for="contact-name" class="text-sm font-semibold text-gray-700">Nome</label>
            <input
              id="contact-name" name="nome" type="text" required
              placeholder="Seu nome completo"
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-[0.95rem]
                     text-gray-900 placeholder-gray-400 bg-gray-50
                     focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                     transition-colors duration-150"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="contact-phone" class="text-sm font-semibold text-gray-700">WhatsApp</label>
            <input
              id="contact-phone" name="whatsapp" type="tel"
              placeholder="(00) 00000-0000"
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-[0.95rem]
                     text-gray-900 placeholder-gray-400 bg-gray-50
                     focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                     transition-colors duration-150"
            />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="contact-email" class="text-sm font-semibold text-gray-700">E-mail</label>
          <input
            id="contact-email" name="email" type="email" required
            placeholder="seu@email.com"
            class="w-full border border-gray-200 rounded-xl px-4 py-3 text-[0.95rem]
                   text-gray-900 placeholder-gray-400 bg-gray-50
                   focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                   transition-colors duration-150"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="contact-message" class="text-sm font-semibold text-gray-700">Mensagem</label>
          <textarea
            id="contact-message" name="mensagem" rows="5"
            placeholder="Fale um pouco sobre seu projeto..."
            class="w-full border border-gray-200 rounded-xl px-4 py-3 text-[0.95rem]
                   text-gray-900 placeholder-gray-400 bg-gray-50 resize-y min-h-[120px]
                   focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                   transition-colors duration-150"
          ></textarea>
        </div>

        <button
          type="submit"
          class="w-full bg-primary text-white font-bold text-base py-4 rounded-xl
                 hover:opacity-90 hover:-translate-y-px transition-all duration-200
                 shadow-lg shadow-primary/25"
        >
          Enviar mensagem →
        </button>

      </form>
    </div>

  </div>
</section>
```

---

## 11. FooterSimples

**Quando usar:** Em toda landing page. Logo, links, redes sociais e copyright.

```astro
---
// src/components/Footer/FooterSimples.astro

interface FooterLink  { label: string; href: string }
interface SocialLink  { platform: string; href: string; icon: string }

interface Props {
  brandName: string
  tagline?: string
  links?: FooterLink[]
  socialLinks?: SocialLink[]
  copyrightName?: string
  bottomLinks?: FooterLink[]
}

const {
  brandName, tagline, links = [],
  socialLinks = [], copyrightName, bottomLinks = [],
} = Astro.props

const year = new Date().getFullYear()
---

<footer class="bg-gray-950 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
  <div class="max-w-7xl mx-auto">

    <!-- Topo -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-10 pb-10 mb-8 border-b border-white/8">

      <!-- Marca -->
      <div>
        <span class="block font-heading text-2xl font-bold text-white mb-3">
          {brandName}
        </span>
        {tagline && (
          <p class="text-sm text-white/40 leading-relaxed max-w-xs mb-6">{tagline}</p>
        )}
        {socialLinks.length > 0 && (
          <div class="flex gap-2">
            {socialLinks.map(s => (
              <a
                href={s.href}
                class="w-9 h-9 flex items-center justify-center rounded-xl
                       bg-white/8 text-white/60 text-base
                       hover:bg-primary hover:text-white transition-all duration-150"
                target="_blank" rel="noopener noreferrer"
                aria-label={s.platform}
              >
                {s.icon}
              </a>
            ))}
          </div>
        )}
      </div>

      <!-- Navegação -->
      {links.length > 0 && (
        <nav aria-label="Links do rodapé" class="sm:text-right">
          <ul class="flex flex-col sm:items-end gap-3">
            {links.map(link => (
              <li>
                <a href={link.href}
                   class="text-sm text-white/50 hover:text-white transition-colors duration-150">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

    </div>

    <!-- Rodapé inferior -->
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4 flex-wrap">
      <p class="text-[0.8rem] text-white/25">
        © {year} {copyrightName || brandName}. Todos os direitos reservados.
      </p>
      {bottomLinks.length > 0 && (
        <div class="flex gap-6">
          {bottomLinks.map(link => (
            <a href={link.href}
               class="text-[0.8rem] text-white/25 hover:text-white/60 transition-colors">
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>

  </div>
</footer>

<style>
  /* Garante bg-white/8 que pode não estar no purge do Tailwind v3 */
  .bg-white\/8 { background-color: rgb(255 255 255 / 0.08); }
  .border-white\/8 { border-color: rgb(255 255 255 / 0.08); }
</style>
```

---

## 12. StatsBar 🆕

**Quando usar:** Qualquer seção de prova social rápida — números de clientes, anos de experiência, projetos entregues, taxa de satisfação. Funciona sozinho ou logo abaixo do hero.

```astro
---
// src/components/Stats/StatsBar.astro

interface StatItem {
  value: string       // ex: "500+", "98%", "10 anos"
  label: string       // ex: "Clientes atendidos"
  icon?: string
}

interface Props {
  items: StatItem[]
  background?: 'white' | 'primary' | 'dark' | 'gray'
}

const { items, background = 'primary' } = Astro.props

const bgClass: Record<string, string> = {
  white:   'bg-white border-y border-gray-100',
  primary: 'bg-primary',
  dark:    'bg-gray-950',
  gray:    'bg-gray-50 border-y border-gray-200',
}
const valueClass: Record<string, string> = {
  white:   'text-primary',
  primary: 'text-white',
  dark:    'text-white',
  gray:    'text-primary',
}
const labelClass: Record<string, string> = {
  white:   'text-gray-500',
  primary: 'text-white/70',
  dark:    'text-white/50',
  gray:    'text-gray-500',
}
const dividerClass: Record<string, string> = {
  white:   'bg-gray-200',
  primary: 'bg-white/20',
  dark:    'bg-white/10',
  gray:    'bg-gray-300',
}
---

<section class={`py-12 px-4 sm:px-6 lg:px-8 ${bgClass[background]}`}>
  <div class="max-w-7xl mx-auto">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
      {items.map((stat, i) => (
        <div class={`flex flex-col items-center text-center gap-1 relative
                     ${i < items.length - 1
                       ? `after:hidden lg:after:block after:content-[''] after:absolute
                          after:right-0 after:top-1/2 after:-translate-y-1/2
                          after:h-12 after:w-px after:${dividerClass[background]}`
                       : ''}`}>
          {stat.icon && (
            <span class="text-2xl mb-1" aria-hidden="true">{stat.icon}</span>
          )}
          <span class={`font-heading text-[2.25rem] lg:text-[2.75rem] font-bold leading-none
                         ${valueClass[background]}`}>
            {stat.value}
          </span>
          <span class={`text-sm font-medium ${labelClass[background]}`}>
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  </div>
</section>
```

**Exemplo de uso:**
```astro
<StatsBar
  background="primary"
  items={[
    { icon: "👥", value: "500+", label: "Clientes atendidos" },
    { icon: "⭐", value: "98%",  label: "Taxa de satisfação" },
    { icon: "🏆", value: "8",    label: "Anos de experiência" },
    { icon: "📍", value: "12",   label: "Cidades atendidas" },
  ]}
/>
```

---

## 13. LogoCloud 🆕

**Quando usar:** Mostrar marcas parceiras, clientes conhecidos ou plataformas utilizadas. Gera credibilidade instantânea. Ótimo logo após o hero ou antes dos depoimentos.

```astro
---
// src/components/Logos/LogoCloud.astro

interface LogoItem {
  src: string
  alt: string
  href?: string
}

interface Props {
  label?: string        // ex: "Empresas que confiam no nosso trabalho"
  items: LogoItem[]
  grayscale?: boolean   // deixa os logos em cinza (mais elegante)
  background?: 'white' | 'gray'
}

const { label, items, grayscale = true, background = 'gray' } = Astro.props
---

<section class={`py-12 px-4 sm:px-6 lg:px-8 ${background === 'gray' ? 'bg-gray-50' : 'bg-white'}`}>
  <div class="max-w-7xl mx-auto">

    {label && (
      <p class="text-center text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 mb-8">
        {label}
      </p>
    )}

    <div class="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
      {items.map((logo) => (
        logo.href ? (
          <a href={logo.href} target="_blank" rel="noopener noreferrer"
             class="opacity-50 hover:opacity-100 transition-opacity duration-200">
            <img
              src={logo.src} alt={logo.alt}
              class={`h-8 w-auto object-contain ${grayscale ? 'grayscale' : ''}`}
            />
          </a>
        ) : (
          <img
            src={logo.src} alt={logo.alt}
            class={`h-8 w-auto object-contain opacity-50 ${grayscale ? 'grayscale' : ''}`}
          />
        )
      ))}
    </div>

  </div>
</section>
```

**Exemplo de uso:**
```astro
<LogoCloud
  label="Parceiros e plataformas"
  grayscale={true}
  items={[
    { src: "/logos/google.svg", alt: "Google" },
    { src: "/logos/facebook.svg", alt: "Meta" },
    { src: "/logos/shopify.svg", alt: "Shopify" },
    { src: "/logos/wordpress.svg", alt: "WordPress" },
    { src: "/logos/hotmart.svg", alt: "Hotmart" },
  ]}
/>
```

---

## 14. TeamSection 🆕

**Quando usar:** Humanizar a marca — clínicas, escritórios, consultorias, agências. Mostrar quem está por trás é um dos maiores gatilhos de confiança para prestadores de serviço regionais.

```astro
---
// src/components/Team/TeamSection.astro

interface TeamMember {
  name: string
  role: string
  photo?: string
  bio?: string
  socialLinks?: Array<{ icon: string; href: string; label: string }>
}

interface Props {
  sectionLabel?: string
  sectionTitle?: string
  sectionSubtitle?: string
  members: TeamMember[]
  columns?: 2 | 3 | 4
}

const {
  sectionLabel, sectionTitle, sectionSubtitle,
  members, columns = 3,
} = Astro.props

const colClass: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}
---

<section class="bg-white py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
  <div class="max-w-7xl mx-auto">

    {(sectionLabel || sectionTitle || sectionSubtitle) && (
      <div class="text-center mb-12 lg:mb-16 max-w-2xl mx-auto">
        {sectionLabel && (
          <span class="inline-block text-[0.7rem] font-bold uppercase tracking-[0.12em] text-primary mb-3">
            {sectionLabel}
          </span>
        )}
        {sectionTitle && (
          <h2
            class="font-heading text-3xl lg:text-[2.75rem] font-bold text-gray-900
                   leading-tight tracking-tight mb-4 [&_em]:text-primary [&_em]:not-italic"
            set:html={sectionTitle}
          />
        )}
        {sectionSubtitle && (
          <p class="text-gray-500 text-lg leading-relaxed">{sectionSubtitle}</p>
        )}
      </div>
    )}

    <div class={`grid grid-cols-1 ${colClass[columns] || colClass[3]} gap-8`}>
      {members.map((member) => (
        <article class="flex flex-col items-center text-center group">

          <!-- Foto -->
          <div class="relative w-32 h-32 mb-5 rounded-2xl overflow-hidden
                      ring-4 ring-gray-100 group-hover:ring-primary/30 transition-all duration-300">
            {member.photo ? (
              <img
                src={member.photo} alt={member.name}
                class="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div class="w-full h-full bg-primary/10 flex items-center justify-center
                           text-primary font-heading font-bold text-4xl">
                {member.name.charAt(0)}
              </div>
            )}
            <div class="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
          </div>

          <h3 class="font-heading text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
          <span class="text-sm font-semibold text-primary mb-3">{member.role}</span>

          {member.bio && (
            <p class="text-sm text-gray-500 leading-relaxed mb-4">{member.bio}</p>
          )}

          {member.socialLinks && member.socialLinks.length > 0 && (
            <div class="flex gap-2 mt-auto">
              {member.socialLinks.map(s => (
                <a
                  href={s.href} target="_blank" rel="noopener noreferrer"
                  aria-label={s.label}
                  class="w-8 h-8 flex items-center justify-center rounded-lg
                         bg-gray-100 text-gray-500 text-sm
                         hover:bg-primary hover:text-white transition-all duration-150"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          )}

        </article>
      ))}
    </div>

  </div>
</section>
```

**Exemplo de uso:**
```astro
<TeamSection
  sectionLabel="Nossa equipe"
  sectionTitle="As pessoas por trás de cada <em>resultado</em>"
  sectionSubtitle="Uma equipe especializada em transformar negócios regionais em referências no digital."
  columns={3}
  members={[
    {
      name: "Ana Paula Rocha",
      role: "Diretora de Arte",
      photo: "/equipe/ana.webp",
      bio: "10 anos criando identidades visuais que as pessoas não esquecem.",
      socialLinks: [
        { icon: "📸", href: "https://instagram.com/", label: "Instagram" },
        { icon: "💼", href: "https://linkedin.com/", label: "LinkedIn" },
      ]
    },
    {
      name: "Rafael Torres",
      role: "Dev Front-end",
      photo: "/equipe/rafael.webp",
      bio: "Especialista em performance e landing pages de alta conversão.",
      socialLinks: [
        { icon: "💻", href: "https://github.com/", label: "GitHub" },
      ]
    },
  ]}
/>
```

---

## 15. PortfolioGrid 🆕

**Quando usar:** Fotógrafos, arquitetos, designers, reformas, gastronomia — qualquer serviço visual onde mostrar o trabalho já vende. O grid com hover effect é premium e funcional.

```astro
---
// src/components/Portfolio/PortfolioGrid.astro

interface PortfolioItem {
  imageSrc: string
  imageAlt?: string
  title: string
  category?: string
  href?: string
}

interface Props {
  sectionLabel?: string
  sectionTitle?: string
  items: PortfolioItem[]
  ctaLabel?: string
  ctaHref?: string
  columns?: 2 | 3
}

const {
  sectionLabel, sectionTitle, items,
  ctaLabel, ctaHref, columns = 3,
} = Astro.props
---

<section class="bg-gray-50 py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
  <div class="max-w-7xl mx-auto">

    {(sectionLabel || sectionTitle) && (
      <div class="text-center mb-12 max-w-2xl mx-auto">
        {sectionLabel && (
          <span class="inline-block text-[0.7rem] font-bold uppercase tracking-[0.12em] text-primary mb-3">
            {sectionLabel}
          </span>
        )}
        {sectionTitle && (
          <h2
            class="font-heading text-3xl lg:text-[2.75rem] font-bold text-gray-900
                   leading-tight tracking-tight [&_em]:text-primary [&_em]:not-italic"
            set:html={sectionTitle}
          />
        )}
      </div>
    )}

    <div class={`grid grid-cols-1 ${columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-4`}>
      {items.map((item, index) => (
        <a
          href={item.href || '#'}
          class={`group relative overflow-hidden rounded-2xl bg-gray-200
                  ${index === 0 && columns === 3 ? 'sm:col-span-2 lg:col-span-1' : ''}
                  aspect-[4/3] block`}
        >
          <img
            src={item.imageSrc}
            alt={item.imageAlt || item.title}
            class="w-full h-full object-cover transition-transform duration-500
                   group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />

          <!-- Overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/20 to-transparent
                       opacity-0 group-hover:opacity-100 transition-opacity duration-300
                       flex flex-col justify-end p-6">
            {item.category && (
              <span class="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                {item.category}
              </span>
            )}
            <span class="text-white font-heading font-bold text-xl leading-tight">
              {item.title}
            </span>
          </div>
        </a>
      ))}
    </div>

    {ctaLabel && ctaHref && (
      <div class="text-center mt-10">
        <a
          href={ctaHref}
          class="inline-flex items-center gap-2 border-2 border-primary text-primary
                 px-7 py-3.5 rounded-xl font-semibold hover:bg-primary hover:text-white
                 transition-all duration-200"
        >
          {ctaLabel} →
        </a>
      </div>
    )}

  </div>
</section>
```

**Exemplo de uso:**
```astro
<PortfolioGrid
  sectionLabel="Portfólio"
  sectionTitle="Trabalhos que <em>falam por si</em>"
  columns={3}
  ctaLabel="Ver todos os projetos"
  ctaHref="/portfolio"
  items={[
    { imageSrc: "/portfolio/casa-moderna.webp", title: "Casa Jardins", category: "Arquitetura Residencial", href: "/portfolio/casa-jardins" },
    { imageSrc: "/portfolio/escritorio.webp",   title: "Escritório Contábil", category: "Design Comercial" },
    { imageSrc: "/portfolio/clinica.webp",       title: "Clínica Bem Estar", category: "Saúde & Bem-estar" },
    { imageSrc: "/portfolio/restaurante.webp",   title: "Restaurante Sabor", category: "Gastronomia" },
    { imageSrc: "/portfolio/loja.webp",          title: "Loja Moda & Arte", category: "Varejo" },
    { imageSrc: "/portfolio/salao.webp",         title: "Salão Glamour", category: "Beleza" },
  ]}
/>
```

---

## 16. HeroVideo 🆕

**Quando usar:** Festas, eventos, gastronomia, turismo, academia — negócios onde mostrar o ambiente em movimento faz toda a diferença. Use vídeo curto (5–15s), sem som, em loop.

```astro
---
// src/components/Hero/HeroVideo.astro

interface Props {
  headline: string
  subheadline?: string
  ctaLabel?: string
  ctaHref?: string
  ctaSecondaryLabel?: string
  ctaSecondaryHref?: string
  videoSrc: string        // .mp4 otimizado para web
  videoPoster?: string    // imagem de fallback
  badge?: string
  overlay?: 'dark' | 'gradient' | 'primary'
}

const {
  headline, subheadline,
  ctaLabel = 'Saiba mais', ctaHref = '#contato',
  ctaSecondaryLabel, ctaSecondaryHref,
  videoSrc, videoPoster,
  badge,
  overlay = 'dark',
} = Astro.props

const overlayClass: Record<string, string> = {
  dark:     'bg-gray-950/60',
  gradient: 'bg-gradient-to-t from-gray-950/80 via-gray-950/40 to-gray-950/20',
  primary:  'bg-primary/70',
}
---

<section class="relative min-h-[85vh] flex items-center justify-center text-center
                 overflow-hidden px-4 sm:px-6 lg:px-8">

  <!-- Vídeo de fundo -->
  <video
    class="absolute inset-0 w-full h-full object-cover"
    src={videoSrc}
    poster={videoPoster}
    autoplay muted loop playsinline
    aria-hidden="true"
  />

  <!-- Overlay -->
  <div class={`absolute inset-0 ${overlayClass[overlay]}`} aria-hidden="true" />

  <!-- Conteúdo -->
  <div class="relative z-10 max-w-3xl mx-auto">

    {badge && (
      <div class="mb-6">
        <span class="inline-block bg-white/15 backdrop-blur-sm border border-white/25
                     text-white px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide">
          {badge}
        </span>
      </div>
    )}

    <h1
      class="font-heading text-4xl sm:text-5xl lg:text-[3.75rem] font-bold text-white
             leading-[1.1] tracking-tight mb-6
             [&_em]:text-white [&_em]:not-italic [&_em]:hero-video-em"
      set:html={headline}
    />

    {subheadline && (
      <p class="text-lg sm:text-xl text-white/80 leading-relaxed mb-10 max-w-[50ch] mx-auto">
        {subheadline}
      </p>
    )}

    <div class="flex justify-center flex-wrap gap-4">
      <a
        href={ctaHref}
        class="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4
               rounded-xl font-bold text-base hover:opacity-90 hover:-translate-y-0.5
               transition-all duration-200"
      >
        {ctaLabel}
      </a>
      {ctaSecondaryLabel && (
        <a
          href={ctaSecondaryHref}
          class="inline-flex items-center gap-2 border-2 border-white/40 text-white
                 px-8 py-4 rounded-xl font-bold text-base
                 hover:border-white hover:bg-white/10 transition-all duration-200"
        >
          {ctaSecondaryLabel}
        </a>
      )}
    </div>

  </div>

  <!-- Scroll indicator -->
  <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2
               text-white/40 text-xs tracking-widest uppercase animate-bounce"
       aria-hidden="true">
    <span>scroll</span>
    <span>↓</span>
  </div>

</section>

<style>
  /* Destaque em <em> com sublinhado branco */
  .hero-video-em {
    position: relative;
    opacity: 0.95;
  }
  .hero-video-em::after {
    content: '';
    position: absolute;
    left: 0; bottom: -3px;
    width: 100%; height: 2px;
    background: #fff;
    border-radius: 2px;
    opacity: 0.5;
  }
</style>
```

**Exemplo de uso:**
```astro
<HeroVideo
  badge="🏆 Melhor academia da cidade 3 anos seguidos"
  headline="Resultados reais para pessoas <em>reais</em>"
  subheadline="Treinos personalizados, equipe especializada e o ambiente que vai te fazer querer voltar todo dia."
  ctaLabel="Agendar aula experimental"
  ctaHref="#contato"
  ctaSecondaryLabel="Conheça os planos"
  ctaSecondaryHref="#planos"
  videoSrc="/videos/academia-bg.mp4"
  videoPoster="/videos/academia-poster.webp"
  overlay="gradient"
/>
```

---

## 17. WhatsAppFloat 🆕

**Quando usar:** Em toda landing page de prestador de serviço regional. O botão flutuante de WhatsApp é, sozinho, responsável por 30–60% dos contatos em negócios locais. Não tem desculpa para não ter.

```astro
---
// src/components/UI/WhatsAppFloat.astro

interface Props {
  phone: string          // apenas números, ex: "5531999999999"
  message?: string       // mensagem pré-preenchida
  label?: string         // texto ao lado do botão (tooltip)
  position?: 'right' | 'left'
  showAfterScroll?: boolean  // aparece só após rolar um pouco
}

const {
  phone,
  message = 'Olá! Gostaria de saber mais informações.',
  label = 'Fale no WhatsApp',
  position = 'right',
  showAfterScroll = false,
} = Astro.props

const encodedMsg = encodeURIComponent(message)
const waLink = `https://wa.me/${phone}?text=${encodedMsg}`
const posClass = position === 'left' ? 'left-5 lg:left-8' : 'right-5 lg:right-8'
---

<div
  id="whatsapp-float"
  class={`fixed bottom-6 lg:bottom-8 z-50 flex items-center gap-3 ${posClass}
          ${showAfterScroll ? 'opacity-0 translate-y-4 transition-all duration-300' : ''}`}
>
  <!-- Tooltip / label -->
  <span
    class={`hidden lg:block bg-gray-900 text-white text-sm font-semibold px-3 py-2
             rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none
             whitespace-nowrap shadow-xl
             ${position === 'right' ? 'order-first' : 'order-last'}`}
    aria-hidden="true"
  >
    {label}
  </span>

  <a
    href={waLink}
    target="_blank"
    rel="noopener noreferrer"
    class="group w-14 h-14 lg:w-16 lg:h-16 flex items-center justify-center
           bg-[#25D366] text-white rounded-2xl shadow-xl shadow-green-500/40
           hover:scale-110 hover:shadow-2xl hover:shadow-green-500/50
           transition-all duration-200 active:scale-95"
    aria-label={label}
  >
    <svg viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7 lg:w-8 lg:h-8" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  </a>
</div>

{showAfterScroll && (
  <script>
    const el = document.getElementById('whatsapp-float')
    if (el) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
          el.classList.remove('opacity-0', 'translate-y-4')
        } else {
          el.classList.add('opacity-0', 'translate-y-4')
        }
      }, { passive: true })
    }
  </script>
)}
```

**Exemplo de uso:**
```astro
<!-- Em BaseLayout.astro, antes de </body> -->
<WhatsAppFloat
  phone="5531999999999"
  message="Olá! Vi seu site e gostaria de solicitar um orçamento."
  label="Fale no WhatsApp"
  position="right"
  showAfterScroll={true}
/>
```

---

## Referência Rápida — Mapeamento CSS → Tailwind

| CSS Custom Property | Classe Tailwind |
|---|---|
| `var(--color-primary)` | `primary` (ex: `bg-primary`, `text-primary`) |
| `color-mix(primary 10%)` | `bg-primary/10`, `border-primary/20` |
| `var(--color-heading, #111)` | `text-gray-900` |
| `var(--color-text, #444)` | `text-gray-700` |
| `var(--color-text-muted, #666)` | `text-gray-500` |
| `var(--color-bg, #fff)` | `bg-white` |
| `var(--color-secondary, #111)` | `bg-gray-950` |
| `var(--radius, 8px)` | `rounded-xl` |
| `var(--radius-lg, 16px)` | `rounded-2xl` |
| `font-family: var(--font-heading)` | `font-heading` |
| `font-family: var(--font-body)` | `font-body` |
| `clamp(4rem, 8vw, 7rem)` | `py-16 lg:py-24` |
| `max-width: 1200px` | `max-w-7xl` |
| `letter-spacing: -0.02em` | `tracking-tight` |
| `line-height: 1.1` | `leading-[1.1]` ou `leading-tight` |
| `transition: all 0.2s ease` | `transition-all duration-200` |

---

*Biblioteca v2.0 — 17 componentes | Tailwind CSS v3 | Astro*  
*Todos os componentes são responsivos, acessíveis e prontos para landing pages de alta conversão.*
