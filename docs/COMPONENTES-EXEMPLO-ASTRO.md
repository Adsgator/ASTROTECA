# 🧩 Componentes Astro — Seções de Exemplo

> Coleção de seções prontas para uso na biblioteca. Todos usam CSS custom properties para herdar o tema do cliente sem modificação. Copie, adapte e publique.

---

## Índice

1. [HeroSplit](#1-herosplit--hero-com-imagem-ao-lado)
2. [HeroCentered](#2-herocentered--hero-centralizado-com-badge)
3. [FeaturesGrid](#3-featuresgrid--diferenciais-em-grid)
4. [ServicesAlternating](#4-servicesalternating--serviços-em-alternância)
5. [TestimonialsCards](#5-testimonialscards--depoimentos-em-cards)
6. [ProcessSteps](#6-processsteps--como-funciona-passo-a-passo)
7. [PricingCards](#7-pricingcards--tabela-de-preços)
8. [FAQAccordion](#8-faqaccordion--perguntas-frequentes)
9. [CTABanner](#9-ctabanner--call-to-action-final)
10. [ContactSection](#10-contactsection--seção-de-contato)
11. [FooterSimples](#11-footersimples--rodapé)

---

## 1. HeroSplit — Hero com imagem ao lado

**Quando usar:** Profissionais liberais, serviços com rosto humano (fotógrafos, médicos, consultores, coaches). A imagem ao lado humaniza e gera confiança.

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
  badge?: string           // ex: "⭐ +200 clientes atendidos"
  trustItems?: string[]    // ex: ["Sem fidelidade", "Resultado garantido"]
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

<section class="hero-split">
  <div class="hero-split__container">

    <!-- Texto -->
    <div class="hero-split__content">
      {badge && <span class="hero-split__badge">{badge}</span>}

      <h1 class="hero-split__headline" set:html={headline} />

      {subheadline && (
        <p class="hero-split__subheadline">{subheadline}</p>
      )}

      <div class="hero-split__actions">
        <a href={ctaHref} class="btn btn--primary">{ctaLabel}</a>
        {ctaSecondaryLabel && (
          <a href={ctaSecondaryHref} class="btn btn--ghost">{ctaSecondaryLabel}</a>
        )}
      </div>

      {trustItems.length > 0 && (
        <ul class="hero-split__trust">
          {trustItems.map(item => (
            <li>
              <span class="check-icon" aria-hidden="true">✓</span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>

    <!-- Imagem -->
    <div class="hero-split__media">
      <div class="hero-split__image-wrapper">
        <img
          src={imageSrc}
          alt={imageAlt}
          class="hero-split__image"
          loading="eager"
          decoding="async"
        />
      </div>
    </div>

  </div>
</section>

<style>
  .hero-split {
    background-color: var(--color-bg, #fff);
    padding: clamp(4rem, 10vw, 8rem) var(--container-padding, 1.5rem);
  }

  .hero-split__container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(2rem, 6vw, 5rem);
    align-items: center;
    max-width: var(--container-max, 1200px);
    margin: 0 auto;
  }

  /* Badge */
  .hero-split__badge {
    display: inline-block;
    background: color-mix(in srgb, var(--color-primary, #333) 12%, transparent);
    color: var(--color-primary, #333);
    border: 1px solid color-mix(in srgb, var(--color-primary, #333) 25%, transparent);
    padding: 0.375rem 0.875rem;
    border-radius: 100px;
    font-size: 0.8rem;
    font-weight: 600;
    margin-bottom: 1.25rem;
  }

  /* Headline */
  .hero-split__headline {
    font-family: var(--font-heading, serif);
    font-size: clamp(2rem, 4.5vw, 3.75rem);
    font-weight: 700;
    color: var(--color-heading, #111);
    line-height: 1.1;
    letter-spacing: -0.02em;
    margin-bottom: 1.25rem;
  }

  /* Permite destacar palavras via <em> */
  .hero-split__headline em {
    font-style: normal;
    color: var(--color-primary, #333);
  }

  .hero-split__subheadline {
    font-family: var(--font-body, sans-serif);
    font-size: clamp(1rem, 1.5vw, 1.2rem);
    color: var(--color-text-muted, #666);
    line-height: 1.65;
    margin-bottom: 2rem;
    max-width: 44ch;
  }

  /* Botões */
  .hero-split__actions {
    display: flex;
    gap: 0.875rem;
    flex-wrap: wrap;
    margin-bottom: 2rem;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.75rem;
    border-radius: var(--radius, 8px);
    font-size: 0.95rem;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .btn--primary {
    background: var(--color-primary, #333);
    color: var(--color-on-primary, #fff);
    box-shadow: 0 4px 14px color-mix(in srgb, var(--color-primary, #333) 35%, transparent);
  }

  .btn--primary:hover {
    opacity: 0.88;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px color-mix(in srgb, var(--color-primary, #333) 45%, transparent);
  }

  .btn--ghost {
    background: transparent;
    color: var(--color-heading, #111);
    border: 1.5px solid color-mix(in srgb, var(--color-heading, #111) 20%, transparent);
  }

  .btn--ghost:hover {
    border-color: var(--color-primary, #333);
    color: var(--color-primary, #333);
  }

  /* Trust items */
  .hero-split__trust {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.5rem;
  }

  .hero-split__trust li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--color-text-muted, #666);
  }

  .check-icon {
    color: var(--color-primary, #333);
    font-weight: 700;
  }

  /* Imagem */
  .hero-split__media {
    position: relative;
  }

  .hero-split__image-wrapper {
    position: relative;
    border-radius: var(--radius-lg, 16px);
    overflow: hidden;
    aspect-ratio: 4 / 5;
  }

  /* Decoração: borda deslocada */
  .hero-split__image-wrapper::before {
    content: '';
    position: absolute;
    inset: -12px -12px 12px 12px;
    border: 2px solid color-mix(in srgb, var(--color-primary, #333) 25%, transparent);
    border-radius: var(--radius-lg, 16px);
    z-index: -1;
  }

  .hero-split__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Responsivo */
  @media (max-width: 768px) {
    .hero-split__container {
      grid-template-columns: 1fr;
    }

    .hero-split__media {
      order: -1;
    }

    .hero-split__image-wrapper {
      aspect-ratio: 3 / 2;
    }

    .hero-split__image-wrapper::before {
      display: none;
    }

    .hero-split__subheadline {
      max-width: none;
    }
  }
</style>
```

**Exemplo de uso:**

```astro
<HeroSplit
  badge="⭐ +300 casamentos fotografados"
  headline="Fotografias que guardam o que <em>palavras</em> não alcançam"
  subheadline="Especialista em casamentos em Minas Gerais. Cada detalhe registrado com cuidado, sensibilidade e um olhar único."
  ctaLabel="Ver meu portfólio"
  ctaHref="#portfolio"
  ctaSecondaryLabel="Saiba mais"
  ctaSecondaryHref="#sobre"
  imageSrc="/foto-fotografa.webp"
  imageAlt="Aline Ferreira, fotógrafa de casamentos"
  trustItems={["Sem fidelidade", "Resposta em 24h", "Albuns físicos incluídos"]}
/>
```

---

## 2. HeroCentered — Hero centralizado com badge

**Quando usar:** Produtos digitais, SaaS, agências, startups. Foco total na mensagem — sem distração de imagem. Ótimo quando o headline é muito forte.

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

<section class="hero-centered">
  <!-- Fundo decorativo -->
  <div class="hero-centered__bg" aria-hidden="true">
    <div class="hero-centered__glow" />
  </div>

  <div class="hero-centered__container">
    {badge && (
      <div class="hero-centered__badge-wrap">
        <span class="hero-centered__badge">{badge}</span>
      </div>
    )}

    <h1 class="hero-centered__headline" set:html={headline} />

    {subheadline && (
      <p class="hero-centered__subheadline">{subheadline}</p>
    )}

    <div class="hero-centered__actions">
      <a href={ctaHref} class="btn btn--primary btn--lg">{ctaLabel}</a>
      {ctaSecondaryLabel && (
        <a href={ctaSecondaryHref} class="btn btn--ghost">{ctaSecondaryLabel}</a>
      )}
    </div>

    {stats.length > 0 && (
      <div class="hero-centered__stats">
        {stats.map((stat, i) => (
          <>
            <div class="stat-item">
              <span class="stat-value">{stat.value}</span>
              <span class="stat-label">{stat.label}</span>
            </div>
            {i < stats.length - 1 && (
              <div class="stat-divider" aria-hidden="true" />
            )}
          </>
        ))}
      </div>
    )}
  </div>
</section>

<style>
  .hero-centered {
    position: relative;
    background-color: var(--color-bg, #fff);
    padding: clamp(5rem, 12vw, 10rem) var(--container-padding, 1.5rem);
    text-align: center;
    overflow: hidden;
  }

  /* Glow de fundo sutil */
  .hero-centered__bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .hero-centered__glow {
    position: absolute;
    top: -20%;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    height: 60%;
    background: radial-gradient(
      ellipse,
      color-mix(in srgb, var(--color-primary, #333) 12%, transparent) 0%,
      transparent 70%
    );
    filter: blur(60px);
  }

  .hero-centered__container {
    position: relative;
    max-width: 800px;
    margin: 0 auto;
  }

  /* Badge */
  .hero-centered__badge-wrap {
    margin-bottom: 1.5rem;
  }

  .hero-centered__badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: color-mix(in srgb, var(--color-primary, #333) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-primary, #333) 20%, transparent);
    color: var(--color-primary, #333);
    padding: 0.4rem 1rem;
    border-radius: 100px;
    font-size: 0.825rem;
    font-weight: 600;
    letter-spacing: 0.01em;
  }

  /* Headline */
  .hero-centered__headline {
    font-family: var(--font-heading, serif);
    font-size: clamp(2.25rem, 5vw, 4.5rem);
    font-weight: 700;
    color: var(--color-heading, #111);
    line-height: 1.1;
    letter-spacing: -0.02em;
    margin-bottom: 1.5rem;
  }

  .hero-centered__headline em {
    font-style: normal;
    color: var(--color-primary, #333);
    position: relative;
  }

  /* Sublinhado decorativo na palavra em destaque */
  .hero-centered__headline em::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -4px;
    width: 100%;
    height: 3px;
    background: var(--color-primary, #333);
    border-radius: 2px;
    opacity: 0.4;
  }

  .hero-centered__subheadline {
    font-size: clamp(1rem, 1.5vw, 1.2rem);
    color: var(--color-text-muted, #666);
    line-height: 1.7;
    margin-bottom: 2.5rem;
    max-width: 54ch;
    margin-inline: auto;
  }

  /* Botões */
  .hero-centered__actions {
    display: flex;
    justify-content: center;
    gap: 0.875rem;
    flex-wrap: wrap;
    margin-bottom: 3.5rem;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    padding: 0.875rem 1.75rem;
    border-radius: var(--radius, 8px);
    font-size: 0.95rem;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .btn--lg { padding: 1rem 2rem; font-size: 1rem; }

  .btn--primary {
    background: var(--color-primary, #333);
    color: var(--color-on-primary, #fff);
    box-shadow: 0 4px 20px color-mix(in srgb, var(--color-primary, #333) 40%, transparent);
  }

  .btn--primary:hover {
    opacity: 0.88;
    transform: translateY(-2px);
  }

  .btn--ghost {
    background: transparent;
    color: var(--color-text, #333);
    border: 1.5px solid color-mix(in srgb, var(--color-text, #333) 20%, transparent);
  }

  .btn--ghost:hover {
    border-color: var(--color-primary, #333);
    color: var(--color-primary, #333);
  }

  /* Stats */
  .hero-centered__stats {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0;
    flex-wrap: wrap;
    padding-top: 2.5rem;
    border-top: 1px solid color-mix(in srgb, var(--color-text, #333) 10%, transparent);
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0 2.5rem;
  }

  .stat-value {
    font-family: var(--font-heading, serif);
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-heading, #111);
    line-height: 1;
  }

  .stat-label {
    font-size: 0.8rem;
    color: var(--color-text-muted, #888);
    text-align: center;
  }

  .stat-divider {
    width: 1px;
    height: 40px;
    background: color-mix(in srgb, var(--color-text, #333) 12%, transparent);
  }

  @media (max-width: 600px) {
    .stat-item { padding: 1rem 1.5rem; }
    .stat-divider { display: none; }
    .hero-centered__stats { gap: 0.5rem; }
  }
</style>
```

**Exemplo de uso:**

```astro
<HeroCentered
  badge="🚀 Mais de 50 projetos entregues"
  headline="Landing pages que <em>convertem</em> de verdade"
  subheadline="Design estratégico para negócios que querem crescer. Da direção de arte ao código — tudo em suas mãos."
  ctaLabel="Ver projetos"
  ctaHref="#projetos"
  ctaSecondaryLabel="Como funciona?"
  ctaSecondaryHref="#processo"
  stats={[
    { value: "50+", label: "Projetos entregues" },
    { value: "98%", label: "Clientes satisfeitos" },
    { value: "14d", label: "Prazo médio de entrega" },
  ]}
/>
```

---

## 3. FeaturesGrid — Diferenciais em grid

**Quando usar:** Apresentar 3 a 6 diferenciais ou benefícios. Funciona em qualquer nicho. É a seção mais versátil da biblioteca.

```astro
---
// src/components/Features/FeaturesGrid.astro

interface FeatureItem {
  icon: string          // emoji ou texto curto
  title: string
  description: string
}

interface Props {
  sectionLabel?: string  // rótulo acima do título (ex: "Por que nos escolher")
  sectionTitle?: string
  sectionSubtitle?: string
  items: FeatureItem[]
  columns?: 2 | 3 | 4
  variant?: 'cards' | 'minimal' | 'bordered'
}

const {
  sectionLabel,
  sectionTitle,
  sectionSubtitle,
  items,
  columns = 3,
  variant = 'cards',
} = Astro.props
---

<section class="features" data-variant={variant}>
  <div class="features__container">

    {(sectionLabel || sectionTitle || sectionSubtitle) && (
      <div class="features__header">
        {sectionLabel && <span class="section-label">{sectionLabel}</span>}
        {sectionTitle && <h2 class="features__title" set:html={sectionTitle} />}
        {sectionSubtitle && <p class="features__subtitle">{sectionSubtitle}</p>}
      </div>
    )}

    <div
      class="features__grid"
      style={`--cols: ${columns}`}
    >
      {items.map((item) => (
        <div class="feature-card">
          <div class="feature-card__icon" aria-hidden="true">
            {item.icon}
          </div>
          <h3 class="feature-card__title">{item.title}</h3>
          <p class="feature-card__desc">{item.description}</p>
        </div>
      ))}
    </div>

  </div>
</section>

<style>
  .features {
    padding: clamp(4rem, 8vw, 7rem) var(--container-padding, 1.5rem);
    background: var(--color-bg, #fff);
  }

  .features__container {
    max-width: var(--container-max, 1200px);
    margin: 0 auto;
  }

  /* Header */
  .features__header {
    text-align: center;
    margin-bottom: clamp(2.5rem, 5vw, 4rem);
    max-width: 620px;
    margin-inline: auto;
  }

  .section-label {
    display: inline-block;
    font-size: 0.775rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-primary, #333);
    margin-bottom: 0.875rem;
  }

  .features__title {
    font-family: var(--font-heading, serif);
    font-size: clamp(1.75rem, 3.5vw, 2.75rem);
    font-weight: 700;
    color: var(--color-heading, #111);
    line-height: 1.2;
    margin-bottom: 1rem;
    letter-spacing: -0.02em;
  }

  .features__title em {
    font-style: normal;
    color: var(--color-primary, #333);
  }

  .features__subtitle {
    font-size: 1.05rem;
    color: var(--color-text-muted, #666);
    line-height: 1.65;
  }

  /* Grid */
  .features__grid {
    display: grid;
    grid-template-columns: repeat(var(--cols, 3), 1fr);
    gap: 1.5rem;
  }

  /* Card — variante "cards" (padrão) */
  .feature-card {
    padding: 2rem;
    border-radius: var(--radius-lg, 16px);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  [data-variant="cards"] .feature-card {
    background: color-mix(in srgb, var(--color-primary, #333) 5%, var(--color-bg, #fff));
    border: 1px solid color-mix(in srgb, var(--color-primary, #333) 12%, transparent);
  }

  [data-variant="cards"] .feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px color-mix(in srgb, var(--color-primary, #333) 12%, transparent);
  }

  /* Variante "minimal" */
  [data-variant="minimal"] .feature-card {
    padding-left: 0;
    padding-right: 0;
  }

  /* Variante "bordered" — linha superior colorida */
  [data-variant="bordered"] .feature-card {
    border-top: 3px solid var(--color-primary, #333);
    background: transparent;
    padding-left: 0;
    padding-right: 0;
  }

  .feature-card__icon {
    font-size: 2rem;
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    width: 52px;
    height: 52px;
    background: color-mix(in srgb, var(--color-primary, #333) 10%, transparent);
    border-radius: var(--radius, 8px);
    justify-content: center;
    line-height: 1;
  }

  [data-variant="minimal"] .feature-card__icon,
  [data-variant="bordered"] .feature-card__icon {
    background: transparent;
    width: auto;
    height: auto;
    font-size: 2rem;
    border-radius: 0;
  }

  .feature-card__title {
    font-family: var(--font-heading, serif);
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--color-heading, #111);
    margin-bottom: 0.625rem;
    line-height: 1.3;
  }

  .feature-card__desc {
    font-size: 0.9rem;
    color: var(--color-text-muted, #666);
    line-height: 1.65;
    margin: 0;
  }

  /* Responsivo */
  @media (max-width: 960px) {
    .features__grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 560px) {
    .features__grid { grid-template-columns: 1fr; }
  }
</style>
```

**Exemplo de uso:**

```astro
<FeaturesGrid
  sectionLabel="Diferenciais"
  sectionTitle="Por que trabalhar <em>comigo</em>?"
  sectionSubtitle="Não sou uma agência. Você tem contato direto com quem vai fazer o seu projeto."
  columns={3}
  variant="cards"
  items={[
    {
      icon: "🎯",
      title: "Foco em conversão",
      description: "Cada elemento da página é pensado para transformar visitantes em clientes. Design bonito não paga boleto — resultado sim."
    },
    {
      icon: "⚡",
      title: "Entrega em até 14 dias",
      description: "Processo ágil e bem definido. Sem enrolação, sem reuniões intermináveis. Do briefing ao ar em menos de duas semanas."
    },
    {
      icon: "🔧",
      title: "Suporte pós-entrega",
      description: "30 dias de ajustes incluídos. Porque entendemos que a perfeição às vezes precisa de um segundo olhar."
    },
    {
      icon: "📱",
      title: "100% responsivo",
      description: "Testado em todos os tamanhos de tela. Mobile-first porque é onde seus clientes estão."
    },
    {
      icon: "🔍",
      title: "SEO técnico incluído",
      description: "Meta tags, Open Graph, Schema.org e performance otimizada. Sua página vai aparecer no Google."
    },
    {
      icon: "♾️",
      title: "Código limpo e mantível",
      description: "Astro + componentes bem estruturados. Se precisar de ajustes no futuro, qualquer dev consegue entrar."
    }
  ]}
/>
```

---

## 4. ServicesAlternating — Serviços em alternância

**Quando usar:** Apresentar 2 a 4 serviços com mais detalhe — quando uma lista simples não é suficiente. Cada serviço tem imagem e texto alternando de lado.

```astro
---
// src/components/Services/ServicesAlternating.astro

interface ServiceItem {
  title: string
  description: string
  imageSrc: string
  imageAlt?: string
  features?: string[]
  ctaLabel?: string
  ctaHref?: string
  badge?: string
}

interface Props {
  sectionLabel?: string
  sectionTitle?: string
  items: ServiceItem[]
}

const { sectionLabel, sectionTitle, items } = Astro.props
---

<section class="services-alt">
  <div class="services-alt__container">

    {(sectionLabel || sectionTitle) && (
      <div class="services-alt__header">
        {sectionLabel && <span class="section-label">{sectionLabel}</span>}
        {sectionTitle && <h2 class="services-alt__title" set:html={sectionTitle} />}
      </div>
    )}

    <div class="services-alt__list">
      {items.map((item, index) => (
        <article class="service-item" data-reverse={index % 2 !== 0 ? 'true' : 'false'}>

          <!-- Imagem -->
          <div class="service-item__media">
            {item.badge && (
              <span class="service-item__badge">{item.badge}</span>
            )}
            <img
              src={item.imageSrc}
              alt={item.imageAlt || item.title}
              class="service-item__image"
              loading="lazy"
              decoding="async"
            />
          </div>

          <!-- Conteúdo -->
          <div class="service-item__content">
            <h3 class="service-item__title">{item.title}</h3>
            <p class="service-item__desc">{item.description}</p>

            {item.features && item.features.length > 0 && (
              <ul class="service-item__features">
                {item.features.map(feat => (
                  <li>
                    <span class="check" aria-hidden="true">→</span>
                    {feat}
                  </li>
                ))}
              </ul>
            )}

            {item.ctaLabel && (
              <a href={item.ctaHref || '#'} class="service-item__cta">
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

<style>
  .services-alt {
    padding: clamp(4rem, 8vw, 7rem) var(--container-padding, 1.5rem);
    background: var(--color-bg, #fff);
  }

  .services-alt__container {
    max-width: var(--container-max, 1200px);
    margin: 0 auto;
  }

  .services-alt__header {
    text-align: center;
    margin-bottom: clamp(3rem, 6vw, 5rem);
  }

  .section-label {
    display: inline-block;
    font-size: 0.775rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-primary, #333);
    margin-bottom: 0.875rem;
  }

  .services-alt__title {
    font-family: var(--font-heading, serif);
    font-size: clamp(1.75rem, 3.5vw, 2.75rem);
    font-weight: 700;
    color: var(--color-heading, #111);
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  .services-alt__title em {
    font-style: normal;
    color: var(--color-primary, #333);
  }

  /* Lista de serviços */
  .services-alt__list {
    display: flex;
    flex-direction: column;
    gap: clamp(4rem, 8vw, 7rem);
  }

  .service-item {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(2rem, 5vw, 5rem);
    align-items: center;
  }

  /* Inverte a ordem no eixo horizontal para itens pares */
  .service-item[data-reverse="true"] .service-item__media {
    order: 2;
  }

  .service-item[data-reverse="true"] .service-item__content {
    order: 1;
  }

  /* Imagem */
  .service-item__media {
    position: relative;
    border-radius: var(--radius-lg, 16px);
    overflow: hidden;
    aspect-ratio: 4 / 3;
  }

  .service-item__badge {
    position: absolute;
    top: 1rem;
    left: 1rem;
    z-index: 10;
    background: var(--color-primary, #333);
    color: var(--color-on-primary, #fff);
    font-size: 0.775rem;
    font-weight: 700;
    padding: 0.35rem 0.75rem;
    border-radius: 100px;
  }

  .service-item__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.4s ease;
  }

  .service-item:hover .service-item__image {
    transform: scale(1.03);
  }

  /* Conteúdo */
  .service-item__title {
    font-family: var(--font-heading, serif);
    font-size: clamp(1.5rem, 2.5vw, 2rem);
    font-weight: 700;
    color: var(--color-heading, #111);
    margin-bottom: 1rem;
    line-height: 1.25;
    letter-spacing: -0.01em;
  }

  .service-item__desc {
    font-size: 1rem;
    color: var(--color-text-muted, #666);
    line-height: 1.7;
    margin-bottom: 1.5rem;
  }

  /* Lista de features */
  .service-item__features {
    list-style: none;
    padding: 0;
    margin: 0 0 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  .service-item__features li {
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    font-size: 0.9rem;
    color: var(--color-text, #444);
    line-height: 1.5;
  }

  .check {
    color: var(--color-primary, #333);
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 2px;
  }

  /* CTA inline */
  .service-item__cta {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-primary, #333);
    font-weight: 700;
    font-size: 0.95rem;
    text-decoration: none;
    border-bottom: 2px solid color-mix(in srgb, var(--color-primary, #333) 30%, transparent);
    padding-bottom: 2px;
    transition: gap 0.2s ease, border-color 0.2s ease;
  }

  .service-item__cta:hover {
    gap: 0.875rem;
    border-color: var(--color-primary, #333);
  }

  /* Responsivo */
  @media (max-width: 768px) {
    .service-item {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .service-item[data-reverse="true"] .service-item__media,
    .service-item[data-reverse="true"] .service-item__content {
      order: unset;
    }
  }
</style>
```

**Exemplo de uso:**

```astro
<ServicesAlternating
  sectionLabel="O que eu faço"
  sectionTitle="Serviços pensados para o <em>seu crescimento</em>"
  items={[
    {
      badge: "Mais pedido",
      title: "Landing Page Completa",
      description: "Uma página de alta conversão com design estratégico, copy persuasivo e código limpo. Tudo que você precisa para transformar visitantes em clientes.",
      imageSrc: "/servicos/landing-page.webp",
      features: [
        "Design exclusivo e personalizado",
        "Otimizado para conversão",
        "SEO técnico incluído",
        "Responsivo para todos os dispositivos",
      ],
      ctaLabel: "Ver exemplos",
      ctaHref: "#portfolio"
    },
    {
      title: "Identidade Visual",
      description: "Logo, paleta de cores, tipografia e guia de marca. Para você ter consistência em todos os pontos de contato com seu cliente.",
      imageSrc: "/servicos/identidade.webp",
      features: [
        "Logo em formatos vetoriais",
        "Paleta de cores e tipografia",
        "Guia de uso da marca",
        "Aplicações: cartão, assinatura de email",
      ],
      ctaLabel: "Saiba mais",
      ctaHref: "#identidade"
    },
  ]}
/>
```

---

## 5. TestimonialsCards — Depoimentos em cards

**Quando usar:** Qualquer negócio baseado em confiança. Depoimentos aumentam conversão de 20% a 50%. Use com fotos reais quando possível.

```astro
---
// src/components/Testimonials/TestimonialsCards.astro

interface TestimonialItem {
  quote: string
  authorName: string
  authorRole?: string     // ex: "CEO, Empresa X"
  authorPhoto?: string
  rating?: number         // 1 a 5 — se não passar, não mostra estrelas
  highlight?: string      // frase em destaque dentro do depoimento
}

interface Props {
  sectionLabel?: string
  sectionTitle?: string
  items: TestimonialItem[]
}

const { sectionLabel, sectionTitle, items } = Astro.props
---

<section class="testimonials">
  <div class="testimonials__container">

    {(sectionLabel || sectionTitle) && (
      <div class="testimonials__header">
        {sectionLabel && <span class="section-label">{sectionLabel}</span>}
        {sectionTitle && <h2 class="testimonials__title" set:html={sectionTitle} />}
      </div>
    )}

    <div class="testimonials__grid">
      {items.map((item) => (
        <article class="testimonial-card">

          {/* Estrelas */}
          {item.rating && (
            <div class="testimonial-card__stars" aria-label={`${item.rating} de 5 estrelas`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span class:list={['star', { 'star--filled': i < item.rating! }]} aria-hidden="true">
                  ★
                </span>
              ))}
            </div>
          )}

          {/* Aspas decorativas */}
          <div class="testimonial-card__quote-icon" aria-hidden="true">"</div>

          {/* Depoimento */}
          <blockquote class="testimonial-card__quote">
            {item.quote}
          </blockquote>

          {/* Autor */}
          <footer class="testimonial-card__author">
            {item.authorPhoto && (
              <img
                src={item.authorPhoto}
                alt={item.authorName}
                class="testimonial-card__photo"
                loading="lazy"
              />
            )}
            <div>
              <cite class="testimonial-card__name">{item.authorName}</cite>
              {item.authorRole && (
                <span class="testimonial-card__role">{item.authorRole}</span>
              )}
            </div>
          </footer>

        </article>
      ))}
    </div>

  </div>
</section>

<style>
  .testimonials {
    padding: clamp(4rem, 8vw, 7rem) var(--container-padding, 1.5rem);
    background: color-mix(in srgb, var(--color-primary, #333) 4%, var(--color-bg, #fff));
  }

  .testimonials__container {
    max-width: var(--container-max, 1200px);
    margin: 0 auto;
  }

  .testimonials__header {
    text-align: center;
    margin-bottom: clamp(2.5rem, 5vw, 4rem);
  }

  .section-label {
    display: inline-block;
    font-size: 0.775rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-primary, #333);
    margin-bottom: 0.875rem;
  }

  .testimonials__title {
    font-family: var(--font-heading, serif);
    font-size: clamp(1.75rem, 3.5vw, 2.75rem);
    font-weight: 700;
    color: var(--color-heading, #111);
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .testimonials__title em {
    font-style: normal;
    color: var(--color-primary, #333);
  }

  /* Grid: 3 colunas no desktop */
  .testimonials__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }

  /* Card */
  .testimonial-card {
    background: var(--color-bg, #fff);
    border: 1px solid color-mix(in srgb, var(--color-text, #333) 8%, transparent);
    border-radius: var(--radius-lg, 16px);
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .testimonial-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px color-mix(in srgb, var(--color-text, #333) 8%, transparent);
  }

  /* Estrelas */
  .testimonial-card__stars {
    display: flex;
    gap: 0.125rem;
  }

  .star {
    font-size: 1rem;
    color: color-mix(in srgb, var(--color-text, #333) 15%, transparent);
  }

  .star--filled {
    color: #f59e0b;
  }

  /* Aspas grandes decorativas */
  .testimonial-card__quote-icon {
    font-family: var(--font-heading, serif);
    font-size: 5rem;
    line-height: 0.5;
    color: var(--color-primary, #333);
    opacity: 0.2;
    user-select: none;
  }

  /* Texto do depoimento */
  .testimonial-card__quote {
    font-size: 0.95rem;
    color: var(--color-text, #444);
    line-height: 1.7;
    margin: 0;
    flex: 1;
    font-style: normal;
  }

  /* Autor */
  .testimonial-card__author {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding-top: 1rem;
    border-top: 1px solid color-mix(in srgb, var(--color-text, #333) 8%, transparent);
    margin-top: auto;
  }

  .testimonial-card__photo {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .testimonial-card__name {
    display: block;
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--color-heading, #111);
    font-style: normal;
  }

  .testimonial-card__role {
    font-size: 0.8rem;
    color: var(--color-text-muted, #888);
  }

  @media (max-width: 960px) {
    .testimonials__grid { grid-template-columns: 1fr 1fr; }
  }

  @media (max-width: 560px) {
    .testimonials__grid { grid-template-columns: 1fr; }
  }
</style>
```

**Exemplo de uso:**

```astro
<TestimonialsCards
  sectionLabel="Depoimentos"
  sectionTitle="O que meus clientes <em>dizem</em>"
  items={[
    {
      rating: 5,
      quote: "Entregou além do que esperava. A página ficou linda e os resultados apareceram na primeira semana. Já indicou para três amigas.",
      authorName: "Mariana Costa",
      authorRole: "Proprietária, Studio Mariana",
      authorPhoto: "/fotos/mariana.webp"
    },
    {
      rating: 5,
      quote: "Profissional impecável. Prazo respeitado, comunicação clara e o resultado foi exatamente o que precisávamos para nossa clínica.",
      authorName: "Dr. Paulo Mendes",
      authorRole: "Dentista — Clínica Sorriso",
      authorPhoto: "/fotos/paulo.webp"
    },
    {
      rating: 5,
      quote: "Em dois anos trabalhando com agências, nunca tive uma entrega tão alinhada com a minha visão. Recomendo sem hesitar.",
      authorName: "Joana Ferreira",
      authorRole: "Coach de Carreira",
      authorPhoto: "/fotos/joana.webp"
    },
  ]}
/>
```

---

## 6. ProcessSteps — Como funciona / Passo a passo

**Quando usar:** Explicar o processo de trabalho ou jornada do cliente. Reduz objeções e aumenta a percepção de profissionalismo.

```astro
---
// src/components/Process/ProcessSteps.astro

interface StepItem {
  number?: string      // se não passar, usa o índice automático
  title: string
  description: string
  icon?: string
}

interface Props {
  sectionLabel?: string
  sectionTitle?: string
  sectionSubtitle?: string
  items: StepItem[]
  variant?: 'vertical' | 'horizontal'
}

const {
  sectionLabel,
  sectionTitle,
  sectionSubtitle,
  items,
  variant = 'horizontal',
} = Astro.props
---

<section class="process" data-variant={variant}>
  <div class="process__container">

    {(sectionLabel || sectionTitle || sectionSubtitle) && (
      <div class="process__header">
        {sectionLabel && <span class="section-label">{sectionLabel}</span>}
        {sectionTitle && <h2 class="process__title" set:html={sectionTitle} />}
        {sectionSubtitle && <p class="process__subtitle">{sectionSubtitle}</p>}
      </div>
    )}

    <div class="process__steps">
      {items.map((item, index) => (
        <div class="step">
          <div class="step__number-wrapper">
            <div class="step__number">
              {item.icon || item.number || String(index + 1).padStart(2, '0')}
            </div>
            {/* Linha conectora (exceto no último) */}
            {index < items.length - 1 && (
              <div class="step__connector" aria-hidden="true" />
            )}
          </div>
          <div class="step__content">
            <h3 class="step__title">{item.title}</h3>
            <p class="step__desc">{item.description}</p>
          </div>
        </div>
      ))}
    </div>

  </div>
</section>

<style>
  .process {
    padding: clamp(4rem, 8vw, 7rem) var(--container-padding, 1.5rem);
    background: var(--color-bg, #fff);
  }

  .process__container {
    max-width: var(--container-max, 1200px);
    margin: 0 auto;
  }

  .process__header {
    text-align: center;
    margin-bottom: clamp(3rem, 6vw, 5rem);
    max-width: 600px;
    margin-inline: auto;
  }

  .section-label {
    display: inline-block;
    font-size: 0.775rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-primary, #333);
    margin-bottom: 0.875rem;
  }

  .process__title {
    font-family: var(--font-heading, serif);
    font-size: clamp(1.75rem, 3.5vw, 2.75rem);
    font-weight: 700;
    color: var(--color-heading, #111);
    line-height: 1.2;
    letter-spacing: -0.02em;
    margin-bottom: 1rem;
  }

  .process__title em {
    font-style: normal;
    color: var(--color-primary, #333);
  }

  .process__subtitle {
    font-size: 1rem;
    color: var(--color-text-muted, #666);
    line-height: 1.65;
  }

  /* Variante horizontal: steps em linha */
  [data-variant="horizontal"] .process__steps {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0;
    position: relative;
  }

  [data-variant="horizontal"] .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 1rem;
    position: relative;
  }

  [data-variant="horizontal"] .step__number-wrapper {
    display: flex;
    align-items: center;
    width: 100%;
    margin-bottom: 1.5rem;
    position: relative;
  }

  [data-variant="horizontal"] .step__number {
    flex-shrink: 0;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  /* Linha conectora horizontal */
  [data-variant="horizontal"] .step__connector {
    position: absolute;
    top: 50%;
    left: calc(50% + 28px);
    right: calc(-50% + 28px);
    height: 1px;
    background: color-mix(in srgb, var(--color-primary, #333) 25%, transparent);
    transform: translateY(-50%);
  }

  /* Variante vertical */
  [data-variant="vertical"] .process__steps {
    display: flex;
    flex-direction: column;
    gap: 0;
    max-width: 640px;
    margin: 0 auto;
  }

  [data-variant="vertical"] .step {
    display: grid;
    grid-template-columns: 56px 1fr;
    gap: 1.5rem;
    padding-bottom: 2.5rem;
  }

  [data-variant="vertical"] .step:last-child {
    padding-bottom: 0;
  }

  [data-variant="vertical"] .step__number-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* Linha conectora vertical */
  [data-variant="vertical"] .step__connector {
    flex: 1;
    width: 1px;
    background: color-mix(in srgb, var(--color-primary, #333) 25%, transparent);
    margin-top: 0.5rem;
    min-height: 2rem;
  }

  /* Número do step */
  .step__number {
    width: 52px;
    height: 52px;
    background: var(--color-primary, #333);
    color: var(--color-on-primary, #fff);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-heading, serif);
    font-size: 1.1rem;
    font-weight: 700;
    flex-shrink: 0;
  }

  .step__title {
    font-family: var(--font-heading, serif);
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--color-heading, #111);
    margin-bottom: 0.5rem;
    line-height: 1.3;
  }

  .step__desc {
    font-size: 0.9rem;
    color: var(--color-text-muted, #666);
    line-height: 1.65;
    margin: 0;
  }

  @media (max-width: 768px) {
    [data-variant="horizontal"] .process__steps {
      grid-template-columns: 1fr;
    }
    [data-variant="horizontal"] .step__connector { display: none; }
    [data-variant="horizontal"] .step { align-items: flex-start; text-align: left; }
    [data-variant="horizontal"] .step__number { margin: 0 0 1rem; }
    [data-variant="horizontal"] .step__number-wrapper { margin-bottom: 0.75rem; }
  }
</style>
```

**Exemplo de uso:**

```astro
<ProcessSteps
  sectionLabel="Como funciona"
  sectionTitle="Do briefing ao ar em <em>4 passos</em>"
  sectionSubtitle="Um processo claro e sem surpresas para você saber exatamente o que esperar em cada etapa."
  variant="horizontal"
  items={[
    {
      title: "Briefing e alinhamento",
      description: "Conversamos sobre seu negócio, público, objetivos e referências. Esse é o fundamento de tudo."
    },
    {
      title: "Direção de arte",
      description: "Defino a identidade visual da página: cores, tipografia, mood e estrutura de seções."
    },
    {
      title: "Desenvolvimento",
      description: "Codifico a página com performance e SEO desde o início. Você acompanha em tempo real."
    },
    {
      title: "Entrega e ajustes",
      description: "Página no ar com 30 dias de suporte para pequenos ajustes incluídos."
    },
  ]}
/>
```

---

## 7. PricingCards — Tabela de preços

**Quando usar:** Quando você oferece pacotes fixos ou quer apresentar opções de forma transparente. Transparência gera confiança.

```astro
---
// src/components/Pricing/PricingCards.astro

interface PricingPlan {
  name: string
  price: string
  priceNote?: string       // ex: "pagamento único"
  description: string
  features: string[]
  ctaLabel?: string
  ctaHref?: string
  highlighted?: boolean    // destaca este plano
  badge?: string           // ex: "Mais popular"
}

interface Props {
  sectionLabel?: string
  sectionTitle?: string
  sectionSubtitle?: string
  plans: PricingPlan[]
  disclaimer?: string      // ex: "Parcelamento disponível. Preços em BRL."
}

const {
  sectionLabel,
  sectionTitle,
  sectionSubtitle,
  plans,
  disclaimer,
} = Astro.props
---

<section class="pricing">
  <div class="pricing__container">

    {(sectionLabel || sectionTitle || sectionSubtitle) && (
      <div class="pricing__header">
        {sectionLabel && <span class="section-label">{sectionLabel}</span>}
        {sectionTitle && <h2 class="pricing__title" set:html={sectionTitle} />}
        {sectionSubtitle && <p class="pricing__subtitle">{sectionSubtitle}</p>}
      </div>
    )}

    <div class="pricing__grid" style={`--plan-count: ${plans.length}`}>
      {plans.map((plan) => (
        <article class:list={['pricing-card', { 'pricing-card--highlighted': plan.highlighted }]}>

          {plan.badge && (
            <div class="pricing-card__badge">{plan.badge}</div>
          )}

          <div class="pricing-card__header">
            <h3 class="pricing-card__name">{plan.name}</h3>
            <div class="pricing-card__price">
              <span class="pricing-card__value">{plan.price}</span>
              {plan.priceNote && (
                <span class="pricing-card__note">{plan.priceNote}</span>
              )}
            </div>
            <p class="pricing-card__desc">{plan.description}</p>
          </div>

          <ul class="pricing-card__features">
            {plan.features.map(feat => (
              <li class="pricing-card__feature">
                <span class="feature-check" aria-hidden="true">✓</span>
                {feat}
              </li>
            ))}
          </ul>

          <a
            href={plan.ctaHref || '#contato'}
            class:list={['pricing-card__cta', { 'pricing-card__cta--filled': plan.highlighted }]}
          >
            {plan.ctaLabel || 'Quero esse plano'}
          </a>

        </article>
      ))}
    </div>

    {disclaimer && (
      <p class="pricing__disclaimer">{disclaimer}</p>
    )}

  </div>
</section>

<style>
  .pricing {
    padding: clamp(4rem, 8vw, 7rem) var(--container-padding, 1.5rem);
    background: var(--color-bg, #fff);
  }

  .pricing__container {
    max-width: var(--container-max, 1200px);
    margin: 0 auto;
  }

  .pricing__header {
    text-align: center;
    margin-bottom: clamp(2.5rem, 5vw, 4rem);
    max-width: 600px;
    margin-inline: auto;
  }

  .section-label {
    display: inline-block;
    font-size: 0.775rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-primary, #333);
    margin-bottom: 0.875rem;
  }

  .pricing__title {
    font-family: var(--font-heading, serif);
    font-size: clamp(1.75rem, 3.5vw, 2.75rem);
    font-weight: 700;
    color: var(--color-heading, #111);
    line-height: 1.2;
    letter-spacing: -0.02em;
    margin-bottom: 1rem;
  }

  .pricing__title em {
    font-style: normal;
    color: var(--color-primary, #333);
  }

  .pricing__subtitle {
    font-size: 1rem;
    color: var(--color-text-muted, #666);
    line-height: 1.65;
  }

  /* Grid de planos */
  .pricing__grid {
    display: grid;
    grid-template-columns: repeat(var(--plan-count, 3), 1fr);
    gap: 1.5rem;
    align-items: start;
  }

  /* Card */
  .pricing-card {
    position: relative;
    border: 1.5px solid color-mix(in srgb, var(--color-text, #333) 12%, transparent);
    border-radius: var(--radius-lg, 16px);
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    background: var(--color-bg, #fff);
    transition: transform 0.2s ease;
  }

  .pricing-card:hover {
    transform: translateY(-4px);
  }

  .pricing-card--highlighted {
    border-color: var(--color-primary, #333);
    background: color-mix(in srgb, var(--color-primary, #333) 4%, var(--color-bg, #fff));
    box-shadow: 0 20px 60px color-mix(in srgb, var(--color-primary, #333) 15%, transparent);
  }

  /* Badge de destaque */
  .pricing-card__badge {
    position: absolute;
    top: -13px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-primary, #333);
    color: var(--color-on-primary, #fff);
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.3rem 1rem;
    border-radius: 100px;
    white-space: nowrap;
  }

  /* Header do card */
  .pricing-card__name {
    font-family: var(--font-heading, serif);
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-heading, #111);
    margin-bottom: 0.75rem;
  }

  .pricing-card__price {
    margin-bottom: 0.75rem;
  }

  .pricing-card__value {
    display: block;
    font-family: var(--font-heading, serif);
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--color-primary, #333);
    line-height: 1;
  }

  .pricing-card__note {
    display: block;
    font-size: 0.8rem;
    color: var(--color-text-muted, #888);
    margin-top: 0.25rem;
  }

  .pricing-card__desc {
    font-size: 0.875rem;
    color: var(--color-text-muted, #666);
    line-height: 1.6;
    margin: 0;
  }

  /* Lista de features */
  .pricing-card__features {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    flex: 1;
  }

  .pricing-card__feature {
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    font-size: 0.875rem;
    color: var(--color-text, #444);
    line-height: 1.5;
  }

  .feature-check {
    color: var(--color-primary, #333);
    font-weight: 700;
    flex-shrink: 0;
  }

  /* CTA */
  .pricing-card__cta {
    display: block;
    text-align: center;
    padding: 0.875rem;
    border-radius: var(--radius, 8px);
    font-weight: 700;
    font-size: 0.95rem;
    text-decoration: none;
    transition: all 0.2s ease;
    border: 1.5px solid var(--color-primary, #333);
    color: var(--color-primary, #333);
  }

  .pricing-card__cta:hover {
    background: color-mix(in srgb, var(--color-primary, #333) 8%, transparent);
  }

  .pricing-card__cta--filled {
    background: var(--color-primary, #333);
    color: var(--color-on-primary, #fff);
    border-color: transparent;
  }

  .pricing-card__cta--filled:hover {
    opacity: 0.88;
  }

  /* Disclaimer */
  .pricing__disclaimer {
    text-align: center;
    margin-top: 2rem;
    font-size: 0.8rem;
    color: var(--color-text-muted, #999);
  }

  @media (max-width: 900px) {
    .pricing__grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 560px) {
    .pricing__grid {
      grid-template-columns: 1fr;
    }
  }
</style>
```

---

## 8. FAQAccordion — Perguntas frequentes

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
}

const {
  sectionLabel,
  sectionTitle,
  items,
  columns = 1,
} = Astro.props
---

<section class="faq">
  <div class="faq__container">

    {(sectionLabel || sectionTitle) && (
      <div class="faq__header">
        {sectionLabel && <span class="section-label">{sectionLabel}</span>}
        {sectionTitle && <h2 class="faq__title" set:html={sectionTitle} />}
      </div>
    )}

    <div class="faq__list" style={`--cols: ${columns}`}>
      {items.map((item, index) => (
        <details class="faq-item" name="faq-group">
          <summary class="faq-item__question">
            <span>{item.question}</span>
            <span class="faq-item__icon" aria-hidden="true">+</span>
          </summary>
          <div class="faq-item__answer">
            <p>{item.answer}</p>
          </div>
        </details>
      ))}
    </div>

  </div>
</section>

<style>
  .faq {
    padding: clamp(4rem, 8vw, 7rem) var(--container-padding, 1.5rem);
    background: var(--color-bg, #fff);
  }

  .faq__container {
    max-width: 800px;
    margin: 0 auto;
  }

  .faq__header {
    text-align: center;
    margin-bottom: clamp(2.5rem, 5vw, 4rem);
  }

  .section-label {
    display: inline-block;
    font-size: 0.775rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-primary, #333);
    margin-bottom: 0.875rem;
  }

  .faq__title {
    font-family: var(--font-heading, serif);
    font-size: clamp(1.75rem, 3.5vw, 2.75rem);
    font-weight: 700;
    color: var(--color-heading, #111);
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  .faq__title em {
    font-style: normal;
    color: var(--color-primary, #333);
  }

  /* Lista */
  .faq__list {
    display: grid;
    grid-template-columns: repeat(var(--cols, 1), 1fr);
    gap: 0;
    align-items: start;
  }

  /* Item */
  .faq-item {
    border-bottom: 1px solid color-mix(in srgb, var(--color-text, #333) 10%, transparent);
  }

  .faq-item:first-child {
    border-top: 1px solid color-mix(in srgb, var(--color-text, #333) 10%, transparent);
  }

  /* Summary (título clicável) */
  .faq-item__question {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem 0;
    cursor: pointer;
    list-style: none;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-heading, #111);
    transition: color 0.15s;
    user-select: none;
  }

  .faq-item__question::-webkit-details-marker { display: none; }
  .faq-item__question::marker { display: none; }

  .faq-item__question:hover {
    color: var(--color-primary, #333);
  }

  /* Ícone + / × */
  .faq-item__icon {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--color-primary, #333) 10%, transparent);
    color: var(--color-primary, #333);
    border-radius: 50%;
    font-size: 1.25rem;
    font-weight: 300;
    line-height: 1;
    transition: transform 0.25s ease, background 0.15s;
  }

  .faq-item[open] .faq-item__icon {
    transform: rotate(45deg);
    background: var(--color-primary, #333);
    color: var(--color-on-primary, #fff);
  }

  .faq-item[open] .faq-item__question {
    color: var(--color-primary, #333);
  }

  /* Resposta com animação */
  .faq-item__answer {
    overflow: hidden;
    animation: faq-open 0.3s ease;
  }

  .faq-item__answer p {
    padding-bottom: 1.25rem;
    font-size: 0.95rem;
    color: var(--color-text-muted, #666);
    line-height: 1.7;
    margin: 0;
  }

  @keyframes faq-open {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
</style>
```

---

## 9. CTABanner — Call to action final

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
  variant?: 'filled' | 'outline' | 'image'
  backgroundImage?: string   // para variant="image"
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
---

<section class="cta-banner" data-variant={variant}>
  {variant === 'image' && backgroundImage && (
    <div class="cta-banner__bg" aria-hidden="true">
      <img src={backgroundImage} alt="" />
      <div class="cta-banner__overlay" />
    </div>
  )}

  <div class="cta-banner__container">
    <h2 class="cta-banner__headline" set:html={headline} />

    {subheadline && (
      <p class="cta-banner__sub">{subheadline}</p>
    )}

    <div class="cta-banner__actions">
      <a href={ctaHref} class="cta-btn cta-btn--primary">{ctaLabel}</a>
      {ctaSecondaryLabel && (
        <a href={ctaSecondaryHref} class="cta-btn cta-btn--secondary">
          {ctaSecondaryLabel}
        </a>
      )}
    </div>
  </div>
</section>

<style>
  .cta-banner {
    padding: clamp(4rem, 8vw, 7rem) var(--container-padding, 1.5rem);
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  /* Variante "filled" — fundo colorido sólido */
  [data-variant="filled"] {
    background: var(--color-primary, #333);
  }

  /* Variante "outline" — fundo suave, borda sutil */
  [data-variant="outline"] {
    background: color-mix(in srgb, var(--color-primary, #333) 6%, var(--color-bg, #fff));
    border-top: 1px solid color-mix(in srgb, var(--color-primary, #333) 15%, transparent);
    border-bottom: 1px solid color-mix(in srgb, var(--color-primary, #333) 15%, transparent);
  }

  /* Variante "image" — imagem de fundo escurecida */
  [data-variant="image"] {
    background: var(--color-secondary, #111);
  }

  .cta-banner__bg {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .cta-banner__bg img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.25;
  }

  .cta-banner__overlay {
    position: absolute;
    inset: 0;
    background: var(--color-secondary, #111);
    opacity: 0.6;
  }

  .cta-banner__container {
    position: relative;
    z-index: 1;
    max-width: 680px;
    margin: 0 auto;
  }

  /* Headline */
  .cta-banner__headline {
    font-family: var(--font-heading, serif);
    font-size: clamp(1.75rem, 4vw, 3rem);
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.02em;
    margin-bottom: 1rem;
  }

  [data-variant="filled"] .cta-banner__headline { color: var(--color-on-primary, #fff); }
  [data-variant="outline"] .cta-banner__headline { color: var(--color-heading, #111); }
  [data-variant="image"] .cta-banner__headline { color: #fff; }

  .cta-banner__headline em {
    font-style: normal;
    opacity: 0.75;
  }

  /* Subheadline */
  .cta-banner__sub {
    font-size: 1.05rem;
    line-height: 1.65;
    margin-bottom: 2.5rem;
  }

  [data-variant="filled"] .cta-banner__sub { color: color-mix(in srgb, var(--color-on-primary, #fff) 75%, transparent); }
  [data-variant="outline"] .cta-banner__sub { color: var(--color-text-muted, #666); }
  [data-variant="image"] .cta-banner__sub { color: rgba(255,255,255,0.7); }

  /* Botões */
  .cta-banner__actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .cta-btn {
    display: inline-block;
    padding: 1rem 2rem;
    border-radius: var(--radius, 8px);
    font-weight: 700;
    font-size: 1rem;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  /* Botão primário — muda conforme a variante da seção */
  [data-variant="filled"] .cta-btn--primary {
    background: var(--color-on-primary, #fff);
    color: var(--color-primary, #333);
  }

  [data-variant="filled"] .cta-btn--primary:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  [data-variant="outline"] .cta-btn--primary,
  [data-variant="image"] .cta-btn--primary {
    background: var(--color-primary, #333);
    color: var(--color-on-primary, #fff);
    box-shadow: 0 6px 20px color-mix(in srgb, var(--color-primary, #333) 40%, transparent);
  }

  [data-variant="outline"] .cta-btn--primary:hover,
  [data-variant="image"] .cta-btn--primary:hover {
    opacity: 0.88;
    transform: translateY(-2px);
  }

  /* Botão secundário */
  [data-variant="filled"] .cta-btn--secondary {
    background: transparent;
    color: var(--color-on-primary, #fff);
    border: 1.5px solid color-mix(in srgb, var(--color-on-primary, #fff) 40%, transparent);
  }

  [data-variant="filled"] .cta-btn--secondary:hover {
    border-color: var(--color-on-primary, #fff);
    background: color-mix(in srgb, var(--color-on-primary, #fff) 10%, transparent);
  }

  [data-variant="outline"] .cta-btn--secondary,
  [data-variant="image"] .cta-btn--secondary {
    background: transparent;
    color: var(--color-text, #333);
    border: 1.5px solid color-mix(in srgb, var(--color-text, #333) 25%, transparent);
  }

  [data-variant="image"] .cta-btn--secondary {
    color: rgba(255,255,255,0.85);
    border-color: rgba(255,255,255,0.3);
  }
</style>
```

**Exemplo de uso:**

```astro
<CTABanner
  variant="filled"
  headline="Pronto para ter uma página que <em>realmente vende</em>?"
  subheadline="Vamos conversar sobre o seu projeto. Respondo em até 24 horas."
  ctaLabel="Solicitar orçamento grátis"
  ctaHref="#contato"
  ctaSecondaryLabel="Ver portfólio antes"
  ctaSecondaryHref="#portfolio"
/>
```

---

## 10. ContactSection — Seção de contato

**Quando usar:** Final da página, geralmente após a CTA. Formulário + informações de contato lado a lado.

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
  formAction?: string    // endpoint do formulário (ex: Netlify, Formspree)
  formspreeId?: string   // se usar Formspree: ID do formulário
}

const {
  sectionLabel,
  sectionTitle,
  sectionSubtitle,
  contactInfo = [],
  formAction,
  formspreeId,
} = Astro.props

const action = formAction || (formspreeId ? `https://formspree.io/f/${formspreeId}` : '#')
---

<section class="contact" id="contato">
  <div class="contact__container">

    <!-- Lado esquerdo: informações -->
    <div class="contact__info">
      {sectionLabel && <span class="section-label">{sectionLabel}</span>}
      {sectionTitle && <h2 class="contact__title" set:html={sectionTitle} />}
      {sectionSubtitle && <p class="contact__subtitle">{sectionSubtitle}</p>}

      {contactInfo.length > 0 && (
        <ul class="contact__details">
          {contactInfo.map(info => (
            <li class="contact__detail-item">
              <span class="contact__detail-icon" aria-hidden="true">{info.icon}</span>
              <div>
                <span class="contact__detail-label">{info.label}</span>
                {info.href ? (
                  <a href={info.href} class="contact__detail-value">{info.value}</a>
                ) : (
                  <span class="contact__detail-value">{info.value}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>

    <!-- Lado direito: formulário -->
    <div class="contact__form-wrap">
      <form
        class="contact-form"
        action={action}
        method="POST"
      >
        <!-- Honeypot anti-spam -->
        <input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off" />

        <div class="contact-form__row">
          <div class="contact-form__field">
            <label for="contact-name">Seu nome</label>
            <input
              type="text"
              id="contact-name"
              name="name"
              required
              placeholder="Ana Costa"
              autocomplete="name"
            />
          </div>
          <div class="contact-form__field">
            <label for="contact-email">E-mail</label>
            <input
              type="email"
              id="contact-email"
              name="email"
              required
              placeholder="ana@email.com"
              autocomplete="email"
            />
          </div>
        </div>

        <div class="contact-form__field">
          <label for="contact-subject">Assunto</label>
          <input
            type="text"
            id="contact-subject"
            name="subject"
            placeholder="Quero um orçamento para minha landing page"
          />
        </div>

        <div class="contact-form__field">
          <label for="contact-message">Mensagem</label>
          <textarea
            id="contact-message"
            name="message"
            required
            rows="5"
            placeholder="Conte um pouco sobre o seu projeto..."
          ></textarea>
        </div>

        <button type="submit" class="contact-form__submit">
          Enviar mensagem
          <span aria-hidden="true">→</span>
        </button>
      </form>
    </div>

  </div>
</section>

<style>
  .contact {
    padding: clamp(4rem, 8vw, 7rem) var(--container-padding, 1.5rem);
    background: color-mix(in srgb, var(--color-primary, #333) 4%, var(--color-bg, #fff));
  }

  .contact__container {
    display: grid;
    grid-template-columns: 1fr 1.4fr;
    gap: clamp(3rem, 6vw, 6rem);
    max-width: var(--container-max, 1200px);
    margin: 0 auto;
    align-items: start;
  }

  /* Info */
  .section-label {
    display: inline-block;
    font-size: 0.775rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-primary, #333);
    margin-bottom: 0.875rem;
  }

  .contact__title {
    font-family: var(--font-heading, serif);
    font-size: clamp(1.75rem, 3.5vw, 2.75rem);
    font-weight: 700;
    color: var(--color-heading, #111);
    line-height: 1.2;
    letter-spacing: -0.02em;
    margin-bottom: 1rem;
  }

  .contact__title em {
    font-style: normal;
    color: var(--color-primary, #333);
  }

  .contact__subtitle {
    font-size: 1rem;
    color: var(--color-text-muted, #666);
    line-height: 1.65;
    margin-bottom: 2rem;
  }

  .contact__details {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .contact__detail-item {
    display: flex;
    align-items: flex-start;
    gap: 0.875rem;
  }

  .contact__detail-icon {
    font-size: 1.25rem;
    width: 40px;
    height: 40px;
    background: color-mix(in srgb, var(--color-primary, #333) 10%, transparent);
    border-radius: var(--radius, 8px);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .contact__detail-label {
    display: block;
    font-size: 0.75rem;
    color: var(--color-text-muted, #888);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.125rem;
  }

  .contact__detail-value {
    display: block;
    font-size: 0.95rem;
    color: var(--color-heading, #111);
    font-weight: 500;
    text-decoration: none;
  }

  a.contact__detail-value:hover {
    color: var(--color-primary, #333);
  }

  /* Formulário */
  .contact__form-wrap {
    background: var(--color-bg, #fff);
    border: 1px solid color-mix(in srgb, var(--color-text, #333) 8%, transparent);
    border-radius: var(--radius-lg, 16px);
    padding: 2.5rem;
  }

  .contact-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .contact-form__row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .contact-form__field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .contact-form__field label {
    font-size: 0.825rem;
    font-weight: 600;
    color: var(--color-heading, #111);
  }

  .contact-form__field input,
  .contact-form__field textarea {
    padding: 0.75rem 1rem;
    border: 1.5px solid color-mix(in srgb, var(--color-text, #333) 15%, transparent);
    border-radius: var(--radius, 8px);
    font-size: 0.95rem;
    font-family: var(--font-body, sans-serif);
    color: var(--color-heading, #111);
    background: var(--color-bg, #fff);
    outline: none;
    transition: border-color 0.15s;
    width: 100%;
    box-sizing: border-box;
  }

  .contact-form__field input::placeholder,
  .contact-form__field textarea::placeholder {
    color: color-mix(in srgb, var(--color-text, #333) 35%, transparent);
  }

  .contact-form__field input:focus,
  .contact-form__field textarea:focus {
    border-color: var(--color-primary, #333);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary, #333) 12%, transparent);
  }

  .contact-form__field textarea {
    resize: vertical;
    min-height: 120px;
    line-height: 1.6;
  }

  .contact-form__submit {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.625rem;
    padding: 1rem;
    background: var(--color-primary, #333);
    color: var(--color-on-primary, #fff);
    border: none;
    border-radius: var(--radius, 8px);
    font-size: 1rem;
    font-weight: 700;
    font-family: var(--font-body, sans-serif);
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
  }

  .contact-form__submit:hover {
    opacity: 0.88;
    transform: translateY(-1px);
  }

  /* Responsivo */
  @media (max-width: 900px) {
    .contact__container { grid-template-columns: 1fr; }
  }

  @media (max-width: 540px) {
    .contact-form__row { grid-template-columns: 1fr; }
    .contact__form-wrap { padding: 1.5rem; }
  }
</style>
```

---

## 11. FooterSimples — Rodapé

**Quando usar:** Em toda landing page. Inclui logo, links rápidos, redes sociais e copyright.

```astro
---
// src/components/Footer/FooterSimples.astro

interface FooterLink {
  label: string
  href: string
}

interface SocialLink {
  platform: string   // ex: "Instagram", "LinkedIn"
  href: string
  icon: string       // emoji ou SVG inline
}

interface Props {
  brandName: string
  tagline?: string
  links?: FooterLink[]
  socialLinks?: SocialLink[]
  copyrightName?: string
  bottomLinks?: FooterLink[]   // ex: Política de Privacidade, Termos
}

const {
  brandName,
  tagline,
  links = [],
  socialLinks = [],
  copyrightName,
  bottomLinks = [],
} = Astro.props

const year = new Date().getFullYear()
---

<footer class="footer">
  <div class="footer__container">

    <div class="footer__top">

      <!-- Marca -->
      <div class="footer__brand">
        <span class="footer__brand-name">{brandName}</span>
        {tagline && <p class="footer__tagline">{tagline}</p>}

        {socialLinks.length > 0 && (
          <div class="footer__social">
            {socialLinks.map(s => (
              <a
                href={s.href}
                class="footer__social-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.platform}
              >
                {s.icon}
              </a>
            ))}
          </div>
        )}
      </div>

      <!-- Links de navegação -->
      {links.length > 0 && (
        <nav class="footer__nav" aria-label="Links do rodapé">
          <ul>
            {links.map(link => (
              <li>
                <a href={link.href} class="footer__nav-link">{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}

    </div>

    <!-- Linha inferior -->
    <div class="footer__bottom">
      <p class="footer__copyright">
        © {year} {copyrightName || brandName}. Todos os direitos reservados.
      </p>

      {bottomLinks.length > 0 && (
        <div class="footer__bottom-links">
          {bottomLinks.map(link => (
            <a href={link.href} class="footer__bottom-link">{link.label}</a>
          ))}
        </div>
      )}
    </div>

  </div>
</footer>

<style>
  .footer {
    background: var(--color-secondary, #111);
    padding: clamp(3rem, 6vw, 5rem) var(--container-padding, 1.5rem) 2rem;
  }

  .footer__container {
    max-width: var(--container-max, 1200px);
    margin: 0 auto;
  }

  .footer__top {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 3rem;
    margin-bottom: 3rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  /* Marca */
  .footer__brand-name {
    display: block;
    font-family: var(--font-heading, serif);
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 0.75rem;
  }

  .footer__tagline {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.45);
    line-height: 1.6;
    max-width: 300px;
    margin-bottom: 1.5rem;
  }

  .footer__social {
    display: flex;
    gap: 0.75rem;
  }

  .footer__social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: var(--radius, 8px);
    color: rgba(255, 255, 255, 0.65);
    text-decoration: none;
    font-size: 1rem;
    transition: background 0.15s, color 0.15s;
  }

  .footer__social-link:hover {
    background: var(--color-primary, #444);
    color: var(--color-on-primary, #fff);
  }

  /* Nav */
  .footer__nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    text-align: right;
  }

  .footer__nav-link {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.55);
    text-decoration: none;
    transition: color 0.15s;
  }

  .footer__nav-link:hover {
    color: #fff;
  }

  /* Bottom */
  .footer__bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .footer__copyright {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.3);
    margin: 0;
  }

  .footer__bottom-links {
    display: flex;
    gap: 1.5rem;
  }

  .footer__bottom-link {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.3);
    text-decoration: none;
    transition: color 0.15s;
  }

  .footer__bottom-link:hover {
    color: rgba(255, 255, 255, 0.7);
  }

  @media (max-width: 640px) {
    .footer__top {
      grid-template-columns: 1fr;
    }

    .footer__nav ul {
      text-align: left;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 0.5rem 1.25rem;
    }

    .footer__bottom {
      flex-direction: column;
      text-align: center;
    }
  }
</style>
```

**Exemplo de uso:**

```astro
<FooterSimples
  brandName="João Silva Design"
  tagline="Landing pages que convertem. Feitas com cuidado, entregues com prazo."
  links={[
    { label: "Início", href: "#inicio" },
    { label: "Serviços", href: "#servicos" },
    { label: "Portfólio", href: "#portfolio" },
    { label: "Contato", href: "#contato" },
  ]}
  socialLinks={[
    { platform: "Instagram", href: "https://instagram.com/seuusuario", icon: "📸" },
    { platform: "LinkedIn", href: "https://linkedin.com/in/seuusuario", icon: "💼" },
    { platform: "WhatsApp", href: "https://wa.me/5531999999999", icon: "💬" },
  ]}
  bottomLinks={[
    { label: "Política de Privacidade", href: "/privacidade" },
    { label: "Termos de Uso", href: "/termos" },
  ]}
/>
```

---

## Referência Rápida — Todas as CSS Variables

Coloque isso em `src/styles/theme.css` em cada projeto. Os componentes herdam tudo automaticamente.

```css
:root {
  /* === Cores === */
  --color-primary:      #7c3aed;   /* cor de destaque, botões, ícones */
  --color-on-primary:   #ffffff;   /* texto sobre cor primary */
  --color-secondary:    #111827;   /* rodapé, fundos escuros */
  --color-bg:           #ffffff;   /* fundo geral da página */
  --color-heading:      #111827;   /* títulos e headlines */
  --color-text:         #374151;   /* corpo do texto */
  --color-text-muted:   #6b7280;   /* subtítulos, notas */

  /* === Tipografia === */
  --font-heading: 'Playfair Display', serif;
  --font-body:    'Inter', sans-serif;

  /* === Layout === */
  --container-max:     1200px;
  --container-padding: 1.5rem;

  /* === Bordas === */
  --radius:    8px;
  --radius-lg: 16px;

  /* === Espaçamentos === */
  --space-sm:  0.5rem;
  --space-md:  1rem;
  --space-lg:  2rem;
  --space-xl:  4rem;
  --space-2xl: 6rem;
}
```

---

*Documento v1.0 — 11 componentes de seção prontos para a biblioteca*
*Todos os componentes são 100% responsivos, acessíveis e customizáveis via CSS variables.*
