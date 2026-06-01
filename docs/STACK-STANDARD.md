# STACK STANDARD — Padrão Técnico e Auditoria

> Versão 1.0  
> Documento de referência para todos os projetos de landing page.  
> Use como checklist no início de projetos novos e como guia de adequação para projetos existentes.

---

## 1. Stack Oficial

### Framework e Tooling

| Ferramenta | Versão mínima | Função |
|---|---|---|
| Astro | 5.x latest | Framework principal |
| TypeScript | 5.x | Tipagem (strict mode obrigatório) |
| Vite | 6.x | Build (embutido no Astro) |
| Biome | 1.9.x | Linting + formatação (substitui ESLint + Prettier) |
| pnpm | 9.x | Gerenciador de pacotes |

### Estilo e Animação

| Ferramenta | Versão mínima | Função |
|---|---|---|
| Tailwind CSS | 4.x | Utilitários CSS (configuração CSS-first) |
| GSAP + ScrollTrigger | 3.12.x | Animações de scroll e timelines complexas |
| Motion One | 10.x | Micro-interações leves (hover, entrada de modais) |
| Lottie-web | 5.x | Animações vetoriais (usar só quando necessário) |

### Integrações

| Ferramenta | Função |
|---|---|
| Resend | Email transacional (leads, notificações) |
| React Email | Templates de email tipados |
| Plausible Analytics | Analytics privacy-first, compatível LGPD |
| Hotjar ou MS Clarity | Heatmaps e gravação de sessão |

### Deploy e CI/CD

| Ferramenta | Função |
|---|---|
| Cloudflare Pages | Hospedagem edge (prioridade para projetos BR) |
| GitHub Actions | CI/CD automatizado |
| Lighthouse CI | Auditoria de performance em cada PR |

### Componentes

- Biblioteca interna: `minha-lib-astro` (GitHub ou npm privado)
- Referenciada via `"minha-lib-astro": "github:seuuser/minha-lib-astro#v1.x.x"`

---

## 2. Estrutura de Projeto Obrigatória

Todo projeto gerado a partir do `_base-project` deve seguir esta estrutura:

```
projeto-cliente/
├── public/
│   ├── fonts/                ← fontes variáveis subsetadas e auto-hospedadas
│   │   └── inter-variable.woff2
│   ├── og/
│   │   └── og-default.png    ← 1200×630px
│   └── favicons/
│       ├── favicon-16.png
│       ├── favicon-32.png
│       ├── apple-touch-icon.png  ← 180px
│       ├── favicon.svg
│       └── site.webmanifest
│
├── src/
│   ├── assets/
│   │   └── images/           ← todas as imagens (Astro processa e converte)
│   │
│   ├── components/
│   │   ├── ui/               ← átomos locais se não estiverem na lib
│   │   └── sections/         ← seções locais se não estiverem na lib
│   │
│   ├── layouts/
│   │   └── BaseLayout.astro  ← head completo: SEO, fontes, GTM, ViewTransitions
│   │
│   ├── pages/
│   │   ├── index.astro       ← composição das sections
│   │   └── api/
│   │       └── contact.ts    ← endpoint do formulário → Resend
│   │
│   ├── scripts/
│   │   ├── animations.ts     ← setup GSAP + ScrollTrigger
│   │   └── analytics.ts      ← helpers de evento (trackClick, trackForm, etc.)
│   │
│   ├── styles/
│   │   ├── global.css        ← reset + base tipográfica
│   │   └── tokens.css        ← design tokens do cliente (único arquivo que muda)
│   │
│   └── data/
│       └── site.config.ts    ← todo o conteúdo do site (tipado)
│
├── CLAUDE.md                 ← instruções permanentes para Claude Code
├── manifesto.md              ← briefing completo do projeto
├── .env.example              ← variáveis necessárias documentadas
├── astro.config.mjs
├── biome.json
├── tsconfig.json
└── package.json
```

---

## 3. Configurações Obrigatórias

### astro.config.mjs

```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://dominio-do-cliente.com.br',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap(),
    icon(),
  ],
  image: {
    domains: [],
  },
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
```

### tsconfig.json

```json
{
  "extends": "astro/tsconfigs/strictest",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*":            ["src/*"],
      "@components/*":  ["src/components/*"],
      "@layouts/*":     ["src/layouts/*"],
      "@styles/*":      ["src/styles/*"],
      "@scripts/*":     ["src/scripts/*"],
      "@data/*":        ["src/data/*"],
      "@assets/*":      ["src/assets/*"]
    }
  }
}
```

### biome.json

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": { "noExplicitAny": "error" },
      "style": { "noNonNullAssertion": "warn" }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "files": {
    "ignore": ["dist/**", "node_modules/**", ".astro/**"]
  }
}
```

### package.json (scripts obrigatórios)

```json
{
  "scripts": {
    "dev":     "astro dev",
    "build":   "astro build",
    "preview": "astro preview",
    "lint":    "biome check src/",
    "format":  "biome format --write src/",
    "check":   "astro check && biome check src/",
    "lhci":    "lhci autorun"
  }
}
```

---

## 4. Sistema de Tokens — Estrutura Obrigatória

O arquivo `src/styles/tokens.css` é o único arquivo que muda entre projetos.
Todo estilo visual deve derivar dele. Nenhum valor de cor, fonte ou tamanho
pode estar hardcodado em outros arquivos.

```css
/* src/styles/tokens.css */

:root {
  /* ─── Marca ─────────────────────────────────────── */
  --color-brand:          oklch(55% 0.25 250);
  --color-brand-hover:    oklch(48% 0.25 250);
  --color-brand-light:    oklch(95% 0.05 250);
  --color-brand-text:     oklch(99% 0.005 250);  /* texto sobre bg brand */

  /* ─── Superfícies ───────────────────────────────── */
  --color-surface:        oklch(99% 0.005 260);
  --color-surface-alt:    oklch(96% 0.008 260);
  --color-border:         oklch(88% 0.01 260);

  /* ─── Texto ─────────────────────────────────────── */
  --color-text-strong:    oklch(12% 0.01 260);
  --color-text-base:      oklch(30% 0.01 260);
  --color-text-muted:     oklch(55% 0.01 260);

  /* ─── Tipografia ────────────────────────────────── */
  --font-heading:         "Inter Variable", sans-serif;
  --font-body:            "Inter Variable", sans-serif;
  --font-mono:            "JetBrains Mono", monospace;

  /* ─── Escala tipográfica (responsiva) ───────────── */
  --text-hero:            clamp(2.5rem, 5vw, 4.5rem);
  --text-headline:        clamp(1.75rem, 3vw, 2.5rem);
  --text-subheadline:     clamp(1.125rem, 2vw, 1.375rem);
  --text-body:            1rem;
  --text-small:           0.875rem;
  --text-xs:              0.75rem;

  /* ─── Line heights ──────────────────────────────── */
  --leading-tight:        1.2;
  --leading-snug:         1.4;
  --leading-normal:       1.6;
  --leading-relaxed:      1.8;

  /* ─── Bordas ────────────────────────────────────── */
  --radius-button:        8px;
  --radius-card:          16px;
  --radius-input:         8px;
  --radius-badge:         100px;

  /* ─── Espaçamento de seções ─────────────────────── */
  --section-padding-y:    clamp(4rem, 8vw, 8rem);
  --container-max:        1200px;
  --container-padding:    clamp(1rem, 4vw, 2rem);

  /* ─── Transições ────────────────────────────────── */
  --transition-fast:      150ms ease;
  --transition-base:      250ms ease;
  --transition-slow:      400ms ease;

  /* ─── Sombras ───────────────────────────────────── */
  --shadow-card:          0 1px 3px oklch(0% 0 0 / 0.08),
                          0 4px 12px oklch(0% 0 0 / 0.05);
  --shadow-hover:         0 4px 16px oklch(0% 0 0 / 0.12),
                          0 8px 32px oklch(0% 0 0 / 0.06);
}

/* ─── Dark mode automático ──────────────────────── */
@media (prefers-color-scheme: dark) {
  :root {
    --color-surface:      oklch(12% 0.01 260);
    --color-surface-alt:  oklch(16% 0.01 260);
    --color-border:       oklch(25% 0.01 260);
    --color-text-strong:  oklch(96% 0.005 260);
    --color-text-base:    oklch(80% 0.008 260);
    --color-text-muted:   oklch(55% 0.01 260);
    --shadow-card:        0 1px 3px oklch(0% 0 0 / 0.3),
                          0 4px 12px oklch(0% 0 0 / 0.2);
  }
}
```

---

## 5. Padrões de Código

### Componentes Astro

```astro
---
// ✅ CORRETO — props sempre tipadas com interface
interface Props {
  headline: string;
  subheadline?: string;
  variant?: 'centered' | 'split-left' | 'split-right';
}

const { headline, subheadline, variant = 'centered' } = Astro.props;
---

<!-- ✅ Sempre <Image /> do Astro, nunca <img> nativo -->
<Image src={heroImg} alt="Descrição da imagem" width={800} height={600} />

<!-- ❌ NUNCA fazer isso -->
<img src="/hero.jpg" />
```

### CSS dentro de componentes

```css
/* ✅ CORRETO — valores vêm sempre dos tokens */
.hero__title {
  font-family: var(--font-heading);
  font-size: var(--text-hero);
  color: var(--color-text-strong);
}

/* ❌ NUNCA hardcodar valores */
.hero__title {
  font-family: "Inter", sans-serif;
  font-size: 48px;
  color: #111;
}
```

### TypeScript

```typescript
// ✅ CORRETO — tipagem explícita, sem any
interface SiteConfig {
  title: string;
  description: string;
  url: string;
}

async function sendLead(data: LeadFormData): Promise<{ success: boolean }> {
  // ...
}

// ❌ NUNCA
const config: any = { ... };
function sendLead(data) { ... }
```

### Performance — regras de JavaScript

```astro
---
// ✅ Islands com client:visible para componentes abaixo do fold
import Counter from '@/components/Counter';
---
<Counter client:visible />

// ✅ client:load apenas para o que precisa estar pronto imediatamente
<HeaderMenu client:load />

// ✅ Animações GSAP em scripts separados, nunca bloqueantes
```

```javascript
// ✅ CORRETO — GSAP importado de forma segura no Astro
// src/scripts/animations.ts

document.addEventListener('DOMContentLoaded', () => {
  // garante que não vai quebrar no SSG
  if (typeof window === 'undefined') return;

  import('gsap').then(({ gsap }) => {
    import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
      gsap.registerPlugin(ScrollTrigger);
      // suas animações aqui
    });
  });
});
```

---

## 6. Requisitos de Performance (obrigatórios na entrega)

Medição: Lighthouse em modo incógnito, conexão simulada 4G, desktop e mobile.

| Métrica | Mínimo aceitável | Meta |
|---|---|---|
| Performance | 95 | 100 |
| Acessibilidade | 95 | 100 |
| Best Practices | 95 | 100 |
| SEO | 95 | 100 |
| LCP | < 2.5s | < 1.5s |
| CLS | < 0.1 | 0 |
| INP | < 200ms | < 50ms |
| TTFB | < 600ms | < 200ms |
| JS total (gzip) | < 50kb | < 30kb |

---

## 7. SEO Técnico — Checklist Completo

### Meta tags (BaseLayout.astro)

```astro
---
interface Props {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
}

const {
  title,
  description,
  canonical,
  ogImage = '/og/og-default.png',
} = Astro.props;
---

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonical} />

  <!-- Open Graph -->
  <meta property="og:title"       content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image"       content={new URL(ogImage, canonical).href} />
  <meta property="og:url"         content={canonical} />
  <meta property="og:type"        content="website" />
  <meta property="og:locale"      content="pt_BR" />

  <!-- Twitter -->
  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:title"       content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image"       content={new URL(ogImage, canonical).href} />

  <!-- Fontes (preload do subset crítico) -->
  <link rel="preload" href="/fonts/inter-variable.woff2"
        as="font" type="font/woff2" crossorigin />

  <!-- Favicons -->
  <link rel="icon"             href="/favicons/favicon.svg" type="image/svg+xml" />
  <link rel="icon"             href="/favicons/favicon-32.png" sizes="32x32" />
  <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
  <link rel="manifest"         href="/favicons/site.webmanifest" />

  <!-- ViewTransitions (Astro nativo) -->
  <ViewTransitions />

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json" set:html={JSON.stringify(schema)} />
</head>
```

### Schema.org mínimo

```typescript
// src/data/site.config.ts
export const schema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",          // ou "Organization", "Service", etc.
  "name": "Nome do Cliente",
  "description": "Descrição do negócio",
  "url": "https://dominio.com.br",
  "telephone": "+55 xx xxxxx-xxxx",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Cidade",
    "addressRegion": "Estado",
    "addressCountry": "BR"
  },
  "openingHours": "Mo-Fr 09:00-18:00",
  "sameAs": [
    "https://instagram.com/...",
    "https://linkedin.com/company/..."
  ]
};
```

---

## 8. Acessibilidade — Checklist WCAG 2.1 AA

```astro
<!-- ✅ Skip link (primeiro elemento do <body>) -->
<a href="#main-content" class="skip-link">Ir para o conteúdo principal</a>

<!-- ✅ Contraste verificado (mínimo 4.5:1 para texto normal) -->
<!-- Ferramenta: https://webaim.org/resources/contrastchecker/ -->

<!-- ✅ Imagens decorativas -->
<Image src={bg} alt="" aria-hidden="true" />

<!-- ✅ Imagens de conteúdo -->
<Image src={team} alt="Equipe da Acme durante workshop de inovação" />

<!-- ✅ Ícones interativos sem texto visível -->
<button aria-label="Abrir menu de navegação">
  <Icon name="menu" aria-hidden="true" />
</button>

<!-- ✅ Formulários com label associado -->
<label for="email">E-mail</label>
<input id="email" type="email" name="email" required
       aria-describedby="email-hint" />
<span id="email-hint">Digite seu melhor e-mail</span>

<!-- ✅ Links com texto descritivo -->
<a href="/cases">Ver estudos de caso</a>  <!-- ✅ -->
<a href="/cases">Clique aqui</a>           <!-- ❌ -->
```

```css
/* ✅ Focus visível para navegação por teclado */
:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 3px;
  border-radius: 4px;
}

/* ✅ Respeitar preferência de redução de movimento */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. Deploy — Configurações Cloudflare Pages

### Configurações do projeto (dashboard ou wrangler.toml)

```toml
# wrangler.toml (opcional, mas recomendado)
name = "projeto-cliente"
compatibility_date = "2024-01-01"

[build]
command = "pnpm build"
publish = "dist"

[build.environment_variables]
NODE_VERSION = "20"
```

### _headers (em /public/_headers)

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

### GitHub Actions (CI)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with: { version: 9 }

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm check          # TypeScript + Biome
      - run: pnpm build

      # Lighthouse CI (opcional mas recomendado)
      - name: Lighthouse CI
        run: pnpm lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

---

## CHECKLIST DE AUDITORIA

Copie este checklist para um novo issue no GitHub ou para o `manifesto.md` de cada projeto.

---

### ✅ PROJETOS NOVOS — antes de começar o desenvolvimento

**Setup do projeto**
- [ ] Criado a partir do `_base-project` (não do zero)
- [ ] `minha-lib-astro` instalada como dependência com versão fixada
- [ ] TypeScript strict mode ativo (`astro/tsconfigs/strictest`)
- [ ] Biome configurado e rodando sem erros
- [ ] Path aliases configurados no tsconfig
- [ ] `.env.example` documentado com todas as variáveis necessárias
- [ ] `CLAUDE.md` presente e atualizado
- [ ] `manifesto.md` completo e aprovado pelo cliente

**Design e identidade**
- [ ] `tokens.css` preenchido (cores, fontes, bordas, espaçamentos)
- [ ] Fontes variáveis baixadas, subsetadas e em `/public/fonts/`
- [ ] OG Image criada (1200×630px, texto legível, branding do cliente)
- [ ] Favicon set completo (16, 32, 180px, SVG, webmanifest)
- [ ] Dark mode implementado nos tokens

**Conteúdo e SEO**
- [ ] `site.config.ts` preenchido com todo o conteúdo
- [ ] `<title>` entre 50–60 caracteres
- [ ] `<meta description>` entre 150–160 caracteres
- [ ] Open Graph completo (title, description, image, url)
- [ ] Twitter Card configurado
- [ ] Canonical URL definido
- [ ] Schema.org JSON-LD implementado (tipo adequado ao negócio)
- [ ] FAQ Schema se tiver seção de FAQ

**Antes do primeiro deploy**
- [ ] Lighthouse ≥ 95 nas 4 métricas (mobile e desktop)
- [ ] LCP < 2.5s no mobile
- [ ] CLS = 0
- [ ] Formulário testado (email chegando na caixa correta)
- [ ] Todos os links testados e funcionando
- [ ] Mobile testado em dispositivo real (iOS Safari + Android Chrome)
- [ ] Analytics disparando pageview e eventos de conversão
- [ ] Sitemap acessível em `/sitemap-index.xml`
- [ ] `robots.txt` configurado
- [ ] Schema.org validado em https://search.google.com/test/rich-results
- [ ] Headers de segurança configurados (`/public/_headers`)

---

### 🔧 PROJETOS EXISTENTES — adequação ao padrão

**Diagnóstico inicial (rodar primeiro)**
- [ ] Lighthouse rodado — scores anotados: P__ / A__ / BP__ / SEO__
- [ ] `grep -r ": any" src/` — quantidade de ocorrências: ____
- [ ] `grep -r "<img " src/` — imagens sem `<Image />`: ____
- [ ] Verificar cores hardcodadas no CSS (buscar por `#`, `rgb(`, `hsl(`)
- [ ] Verificar fontes hardcodadas (buscar por `font-family:` sem `var(`)

**Prioridade ALTA — impacta SEO e Core Web Vitals**
- [ ] Substituir todos os `<img>` por `<Image />` do Astro
- [ ] Adicionar `width` e `height` em todas as imagens
- [ ] Adicionar `loading="eager"` na imagem hero, `loading="lazy"` nas demais
- [ ] Verificar e corrigir o elemento de LCP (geralmente imagem hero ou h1)
- [ ] Adicionar `font-display: swap` nas fontes
- [ ] Adicionar `<link rel="preload">` para fonte principal
- [ ] Completar meta tags SEO ausentes (title, description, OG, canonical)
- [ ] Adicionar Schema.org se ausente

**Prioridade MÉDIA — qualidade e manutenção**
- [ ] Mover valores visuais para `tokens.css` (eliminar hardcodes)
- [ ] Tipar props dos componentes (eliminar `any`)
- [ ] Configurar Biome (substituir ESLint + Prettier se existente)
- [ ] Adicionar `CLAUDE.md` ao projeto
- [ ] Adicionar `STACK-STANDARD.md` como referência no repositório
- [ ] Documentar variáveis de ambiente no `.env.example`
- [ ] Verificar e adicionar `_headers` de segurança

**Prioridade BAIXA — melhoria contínua**
- [ ] Adicionar GitHub Actions com CI
- [ ] Configurar Lighthouse CI
- [ ] Adicionar skip link de acessibilidade
- [ ] Verificar animações com `prefers-reduced-motion`
- [ ] Verificar contraste de todas as combinações de texto/fundo
- [ ] Extrair componentes reutilizáveis para a `minha-lib-astro`
- [ ] Subsetar fontes para reduzir tamanho dos arquivos

---

## Referências Rápidas

| Ferramenta | Link |
|---|---|
| Astro Docs | https://docs.astro.build |
| Tailwind v4 | https://tailwindcss.com/docs |
| Biome | https://biomejs.dev |
| Cloudflare Pages | https://developers.cloudflare.com/pages |
| Lighthouse CI | https://github.com/GoogleChrome/lighthouse-ci |
| Rich Results Test | https://search.google.com/test/rich-results |
| Contrast Checker | https://webaim.org/resources/contrastchecker |
| Font Subsetting | https://fonts.google.com/knowledge/using_type/using_web_fonts |
