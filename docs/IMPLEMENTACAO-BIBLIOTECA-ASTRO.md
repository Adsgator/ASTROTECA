# Biblioteca de Componentes Astro — Guia Completo de Implementação

> Documento unificado para implementação do ecossistema completo de criação de landing pages profissionais com componentes reutilizáveis, biblioteca visual, builder interativo, painel admin, gerador de manifesto e automação via GitHub API.
> 
> **Stack:** Astro SSR + React Islands + Tailwind CSS com design tokens customizados
> **Objetivo:** Landing pages de alta qualidade para negócios locais, prestadores de serviço, cursos e mentorias — com aspecto profissional de projetos de R$10k+

---

## Índice

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Pré-requisitos e Setup Inicial](#2-pré-requisitos-e-setup-inicial)
3. [Repositório 1 — minha-lib-astro (Componentes)](#3-repositório-1--minha-lib-astro-componentes)
4. [Repositório 2 — astro-library-browser (Biblioteca Visual)](#4-repositório-2--astro-library-browser-biblioteca-visual)
5. [Repositório 3 — _base-project (Template)](#5-repositório-3--_base-project-template)
6. [Fluxo de Trabalho Completo](#6-fluxo-de-trabalho-completo)
7. [Deploy e Configuração](#7-deploy-e-configuração)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Visão Geral da Arquitetura

### O que você está construindo

Um ecossistema com **4 repositórios** no GitHub que trabalham juntos:

```
GitHub (seus repositórios)
│
├── minha-lib-astro/              ← Seus componentes Astro (pacote npm privado)
│   ├── src/components/           ← Os componentes em si
│   └── registry.json             ← Catálogo de todos os componentes
│
├── astro-library-browser/        ← A biblioteca visual (deploy na Vercel)
│   ├── src/pages/                ← Interface de navegação e builder
│   └── src/components/           ← UI da biblioteca
│
├── _base-project/                ← Template de projeto (marcado como Template no GitHub)
│   └── (estrutura base Astro)    ← Duplicado automaticamente a cada cliente novo
│
└── [cliente-nome]/               ← Criado automaticamente pela biblioteca
    ├── MANIFESTO.md              ← Gerado e commitado automaticamente
    └── (cópia do _base-project)
```

### O fluxo de ponta a ponta

```
1. Cliente novo → Você faz briefing + direção de arte
         ↓
2. Entra na biblioteca visual (astro-library-browser)
         ↓
3. Preenche: nome do cliente, cores, fontes, mood
         ↓
4. Navega pelos componentes → vê preview real → seleciona e ordena
         ↓
5. Clica "Criar Projeto"
         ↓
6. GitHub API cria repo novo a partir do _base-project template
         ↓
7. MANIFESTO.md é commitado automaticamente no repo novo
         ↓
8. Botão "Abrir no VS Code" → clona e abre localmente
         ↓
9. npm install → manda o MANIFESTO.md pro Claude Code
         ↓
10. Claude Code implementa tudo → você ajusta detalhes → deploy
```

---

## 2. Pré-requisitos e Setup Inicial

### O que você precisa ter instalado

```bash
node --version    # v18+ recomendado
npm --version     # v9+
git --version     # qualquer versão recente
```

### GitHub Personal Access Token

1. Acesse: **GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)**
2. Clique em **"Generate new token (classic)"**
3. Nome: `biblioteca-astro`
4. Expiration: `No expiration` (ou 1 ano)
5. Marque as permissões:
   - `repo` (todas as subpermissões)
   - `workflow`
6. Clique **Generate token**
7. **Copie o token agora** — ele não aparece novamente

Guarde esse token, vai ser usado nos `.env` de todos os projetos.

### Estrutura de pastas no seu computador

```
~/projetos/
├── minha-lib-astro/              ← vai criar agora
├── astro-library-browser/        ← vai criar agora
├── _base-project/                ← vai criar agora
└── clientes/                     ← onde os projetos clonados vão ficar
    ├── clinica-ana-costa/
    ├── studio-fotos-joao/
    └── ...
```

---

## 3. Repositório 1 — minha-lib-astro (Componentes)

Este é o repositório onde ficam seus componentes Astro reais. Ele é o "pacote" que os outros projetos instalam.

### 3.1 Criando o repositório

```bash
# No terminal
mkdir minha-lib-astro
cd minha-lib-astro
git init
npm init -y
```

### 3.2 Estrutura completa de pastas

```
minha-lib-astro/
├── src/
│   ├── components/
│   │   ├── Hero/
│   │   │   ├── HeroSplit.astro
│   │   │   ├── HeroSplit.preview.astro
│   │   │   ├── HeroCentered.astro
│   │   │   ├── HeroCentered.preview.astro
│   │   │   └── index.ts
│   │   ├── Features/
│   │   │   ├── FeaturesGrid3.astro
│   │   │   ├── FeaturesGrid3.preview.astro
│   │   │   └── index.ts
│   │   ├── Testimonials/
│   │   │   └── ...
│   │   ├── Pricing/
│   │   │   └── ...
│   │   ├── CTA/
│   │   │   └── ...
│   │   └── Footer/
│   │       └── ...
│   ├── layouts/
│   │   └── BaseLayout.astro
│   └── index.ts
├── registry.json                 ← CATÁLOGO DE COMPONENTES
├── package.json
├── tailwind.config.mjs
└── tsconfig.json
```

### 3.3 package.json

```json
{
  "name": "@seuusuario/minha-lib-astro",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "peerDependencies": {
    "astro": "^4.0.0",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "@astrojs/tailwind": "^5.0.0",
    "astro": "^4.0.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.0.0"
  }
}
```

### 3.4 O registry.json — coração da biblioteca

Este arquivo é o catálogo. **Todo componente novo precisa ter uma entrada aqui.**

```json
[
  {
    "id": "hero-split",
    "name": "Hero Split",
    "category": "Hero",
    "description": "Hero com imagem ao lado. Ideal para serviços com foto do profissional ou do produto.",
    "previewPath": "/preview/hero-split",
    "screenshot": "https://raw.githubusercontent.com/seuusuario/minha-lib-astro/main/screenshots/hero-split.png",
    "componentFile": "Hero/HeroSplit.astro",
    "tags": ["hero", "acima-da-dobra", "imagem", "split"],
    "props": [
      { "name": "headline", "type": "string", "required": true, "description": "Título principal" },
      { "name": "subheadline", "type": "string", "required": false, "description": "Subtítulo ou descrição curta" },
      { "name": "ctaLabel", "type": "string", "required": false, "default": "Saiba mais" },
      { "name": "ctaHref", "type": "string", "required": false, "default": "#contato" },
      { "name": "imageSrc", "type": "string", "required": false, "description": "Caminho para a imagem" }
    ],
    "bestFor": ["serviços", "profissionais liberais", "consultórios"],
    "order": 1
  },
  {
    "id": "hero-centered",
    "name": "Hero Centered",
    "category": "Hero",
    "description": "Hero centralizado com call to action em destaque. Ideal para produtos e SaaS.",
    "previewPath": "/preview/hero-centered",
    "screenshot": "https://raw.githubusercontent.com/seuusuario/minha-lib-astro/main/screenshots/hero-centered.png",
    "componentFile": "Hero/HeroCentered.astro",
    "tags": ["hero", "acima-da-dobra", "centralizado", "produto"],
    "props": [
      { "name": "headline", "type": "string", "required": true },
      { "name": "subheadline", "type": "string", "required": false },
      { "name": "ctaLabel", "type": "string", "required": false, "default": "Começar agora" },
      { "name": "ctaHref", "type": "string", "required": false }
    ],
    "bestFor": ["produtos digitais", "SaaS", "apps"],
    "order": 2
  },
  {
    "id": "features-grid-3",
    "name": "Features Grid 3",
    "category": "Features",
    "description": "3 diferenciais em grid. Cada card com ícone, título e descrição.",
    "previewPath": "/preview/features-grid-3",
    "screenshot": "https://raw.githubusercontent.com/seuusuario/minha-lib-astro/main/screenshots/features-grid-3.png",
    "componentFile": "Features/FeaturesGrid3.astro",
    "tags": ["features", "diferenciais", "grid", "ícones"],
    "props": [
      { "name": "sectionTitle", "type": "string", "required": false },
      { "name": "items", "type": "array", "required": true, "description": "Array de {icon, title, description}" }
    ],
    "bestFor": ["qualquer nicho"],
    "order": 10
  }
]
```

> **Regra:** Sempre que criar um componente novo, adicione a entrada no `registry.json` antes de qualquer outra coisa.

### 3.5 Anatomia de um componente — template padrão

**Todo componente novo segue exatamente essa estrutura:**

#### `ComponentName.astro` — o componente real

```astro
---
// src/components/Hero/HeroSplit.astro

interface Props {
  headline: string
  subheadline?: string
  ctaLabel?: string
  ctaHref?: string
  imageSrc?: string
}

const {
  headline,
  subheadline = '',
  ctaLabel = 'Saiba mais',
  ctaHref = '#contato',
  imageSrc,
} = Astro.props
---

<section class="grid grid-cols-1 md:grid-cols-2 gap-16 items-center py-24 px-6 max-w-[1200px] mx-auto">
  <div>
    <h1 class="font-[var(--font-heading,serif)] text-[clamp(2rem,5vw,3.5rem)] text-[var(--color-heading,#111)] leading-[1.1] mb-4">
      {headline}
    </h1>
    {subheadline && (
      <p class="text-lg text-[var(--color-text-muted,#555)] mb-8 leading-relaxed">
        {subheadline}
      </p>
    )}
    <a
      href={ctaHref}
      class="inline-block bg-[var(--color-primary,#333)] text-[var(--color-on-primary,#fff)] px-8 py-3.5 rounded-[var(--radius,6px)] font-semibold no-underline transition-opacity duration-200 hover:opacity-[0.88]"
    >
      {ctaLabel}
    </a>
  </div>

  {imageSrc && (
    <div>
      <img
        src={imageSrc}
        alt=""
        class="w-full h-auto rounded-[var(--radius-lg,12px)] object-cover"
        loading="eager"
      />
    </div>
  )}
</section>
```

#### `ComponentName.preview.astro` — para a biblioteca visual

```astro
---
// src/components/Hero/HeroSplit.preview.astro
// Este arquivo só existe para a biblioteca — nunca vai para produção
import HeroSplit from './HeroSplit.astro'
---

<HeroSplit
  headline="Transforme sua presença digital"
  subheadline="Resultados reais para negócios que querem crescer. Sem enrolação."
  ctaLabel="Quero saber mais"
  ctaHref="#"
  imageSrc="/preview-assets/hero-placeholder.jpg"
/>
```

#### `index.ts` — exportação do grupo

```typescript
// src/components/Hero/index.ts
export { default as HeroSplit } from './HeroSplit.astro'
export { default as HeroCentered } from './HeroCentered.astro'
```

#### `src/index.ts` — exportação geral da lib

```typescript
// src/index.ts
export * from './components/Hero/index'
export * from './components/Features/index'
export * from './components/Testimonials/index'
export * from './components/Pricing/index'
export * from './components/CTA/index'
export * from './components/Footer/index'
```

### 3.6 BaseLayout.astro — o que já vem configurado em todo projeto

```astro
---
// src/layouts/BaseLayout.astro
interface Props {
  title: string
  description: string
  ogImage?: string
  canonicalUrl?: string
  gtagId?: string
}

const {
  title,
  description,
  ogImage = '/og-image.png',
  canonicalUrl,
  gtagId,
} = Astro.props

const siteUrl = canonicalUrl || Astro.url.href
---

<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />

    <!-- Open Graph -->
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={ogImage} />
    <meta property="og:url" content={siteUrl} />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="pt_BR" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={ogImage} />

    <!-- Canonical -->
    <link rel="canonical" href={siteUrl} />

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

    <!-- View Transitions (Astro nativo) -->
    <meta name="view-transition" content="same-origin" />

    <title>{title}</title>

    <!-- Google Analytics (opcional) -->
    {gtagId && (
      <>
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`}></script>
        <script define:vars={{ gtagId }}>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', gtagId);
        </script>
      </>
    )}

    <!-- Estilos base: Tailwind já inclui via astro.config.mjs -->
  </head>
  <body>
    <slot />
  </body>
</html>
```

### 3.7 Publicando no GitHub

```bash
cd minha-lib-astro
git init
git add .
git commit -m "feat: estrutura inicial da lib de componentes"

# Crie o repo no GitHub (pode ser privado)
# Depois:
git remote add origin git@github.com:seuusuario/minha-lib-astro.git
git push -u origin main
```

---

## 4. Repositório 2 — astro-library-browser (Biblioteca Visual)

Este é o projeto mais importante do ecossistema. É a interface que você usa no dia a dia.

### 4.1 Criando o projeto

```bash
npm create astro@latest astro-library-browser
# Escolha: "Empty" template
# TypeScript: Yes, Strict
# Install dependencies: Yes

cd astro-library-browser
npm install react @astrojs/react
```

### 4.2 Estrutura de pastas

```
astro-library-browser/
├── src/
│   ├── pages/
│   │   ├── index.astro
│   │   ├── builder.astro
│   │   ├── admin.astro
│   │   ├── config.astro
│   │   └── api/
│   │       ├── create-project.ts
│   │       └── publish-component.ts
│   ├── components/
│   │   ├── ComponentBrowser.tsx    ← Ilha React
│   │   ├── Builder.tsx             ← Ilha React
│   │   ├── AdminForm.tsx           ← Ilha React
│   │   └── ConfigPanel.tsx         ← Ilha React
│   ├── layouts/
│   │   └── AppLayout.astro
│   ├── lib/
│   │   ├── github.ts              ← Funções puras GitHub API
│   │   ├── manifest.ts            ← Template engine do manifesto
│   │   └── utils.ts               ← Utilitários
│   ├── types/
│   │   └── index.ts               ← Tipos centralizados
│   └── styles/
│       └── app.css                ← Design system completo
├── .env
├── .env.example
└── astro.config.mjs
```

### 4.3 astro.config.mjs

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import vercel from '@astrojs/vercel/serverless'

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [react(), tailwind()],
})
```

### 4.3b package.json

```json
{
  "name": "astro-library-browser",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "start": "node dist/server/entry.mjs"
  },
  "dependencies": {
    "astro": "^4.0.0",
    "@astrojs/react": "^3.0.0",
    "@astrojs/tailwind": "^5.0.0",
    "@astrojs/vercel": "^7.0.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.0.0"
  }
}
```

### 4.4 Variáveis de ambiente

#### `.env.example`

```env
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_OWNER=seuusuario
COMPONENTS_REPO=minha-lib-astro
BASE_PROJECT_REPO=_base-project
PUBLIC_REGISTRY_URL=https://raw.githubusercontent.com/seuusuario/minha-lib-astro/main/registry.json
```

#### `.env`

```env
GITHUB_TOKEN=ghp_SEU_TOKEN_REAL_AQUI
GITHUB_OWNER=seuusuario
COMPONENTS_REPO=minha-lib-astro
BASE_PROJECT_REPO=_base-project
PUBLIC_REGISTRY_URL=https://raw.githubusercontent.com/seuusuario/minha-lib-astro/main/registry.json
```

> **Importante:** Variáveis com `PUBLIC_` são acessíveis ao cliente e server. Variáveis sem `PUBLIC_` só funcionam no server-side (API routes). No código Astro, acesse via `import.meta.env.VARIAVEL`.

### 4.5 Design System — tailwind.config.mjs + app.css

Com Tailwind, o design system vive no `tailwind.config.mjs` (tokens como valores de tema) e num `app.css` mínimo só para o que o Tailwind não consegue gerar (scrollbar customizado, grain texture, animações de keyframe).

#### `tailwind.config.mjs`

```javascript
// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#080810',
        surface: '#0f0f1c',
        raised:  '#161625',
        hover:   '#1c1c2e',
        border: {
          DEFAULT: '#1f1f35',
          subtle:  '#141428',
        },
        ink: {
          primary:   '#ededf5',
          secondary: '#6b6b85',
          muted:     '#35354a',
        },
        accent: {
          DEFAULT: '#f0a500',
          hover:   '#fbbf24',
        },
        ok:   '#22c55e',
        fail: '#ef4444',
        warn: '#f59e0b',
      },
      fontFamily: {
        syne: ['Syne', 'system-ui', 'sans-serif'],
        dm:   ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '10px',
        sm: '6px',
        lg: '14px',
      },
      width: {
        sidebar: '220px',
      },
    },
  },
}
```

#### `src/styles/app.css`

O CSS agora só contém: Google Fonts, scrollbar, grain texture e animações de keyframe — tudo que o Tailwind não gera nativamente. As classes de componente (card, btn, badge, input, etc.) ficam em `@layer components` usando `@apply`.

```css
/* src/styles/app.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

/* ─── Base ───────────────────────────────────────────────────────────────── */
@layer base {
  html {
    -webkit-font-smoothing: antialiased;
  }

  body {
    @apply bg-bg text-ink-primary font-dm min-h-screen;
    /* Grain texture — não tem equivalente em utilitários Tailwind */
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
  }

  a { @apply text-inherit no-underline; }
  img { @apply block max-w-full; }
  button { font-family: inherit; }

  h1, h2, h3, h4, h5, h6 {
    @apply font-syne font-bold leading-tight tracking-tight text-ink-primary;
    letter-spacing: -0.02em;
  }

  ::-webkit-scrollbar       { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { @apply bg-border rounded-full; }
  ::-webkit-scrollbar-thumb:hover { @apply bg-ink-muted; }
}

/* ─── Component layer — classes reutilizáveis via @apply ─────────────────── */
@layer components {

  /* Layout shell */
  .app-shell {
    @apply grid min-h-screen;
    grid-template-columns: theme('width.sidebar') 1fr;
  }
  .app-sidebar {
    @apply sticky top-0 h-screen overflow-y-auto bg-surface border-r border-border py-5 flex flex-col gap-1;
  }
  .app-main {
    @apply overflow-y-auto h-screen p-8;
  }

  /* Cards */
  .card {
    @apply bg-surface border border-border rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.4)] transition-all duration-200;
  }
  .card-interactive {
    @apply hover:border-accent/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_0_1px_rgba(240,165,0,0.15)] hover:-translate-y-px hover:cursor-pointer;
  }
  .card-selected {
    @apply !border-accent shadow-[0_0_0_1px_theme('colors.accent.DEFAULT'),0_4px_20px_rgba(240,165,0,0.1)];
  }

  /* Buttons */
  .btn {
    @apply inline-flex items-center gap-1.5 px-4 py-2 rounded-sm font-dm text-[13px] font-medium border-0 cursor-pointer transition-all duration-150 whitespace-nowrap no-underline disabled:opacity-40 disabled:cursor-not-allowed;
  }
  .btn-primary {
    @apply bg-accent text-black hover:bg-accent-hover;
  }
  .btn-outline {
    @apply bg-transparent text-ink-primary border border-border hover:bg-raised hover:border-ink-muted;
  }
  .btn-ghost {
    @apply bg-transparent text-ink-secondary hover:bg-raised hover:text-ink-primary;
  }
  .btn-danger {
    @apply bg-fail/10 text-fail border border-fail/20 hover:bg-fail/20;
  }
  .btn-sm  { @apply px-2.5 py-1 text-xs; }
  .btn-lg  { @apply px-5 py-2.5 text-[15px]; }
  .btn-icon { @apply p-1.5 aspect-square; }

  /* Form controls */
  .input {
    @apply bg-raised border border-border rounded-sm text-ink-primary font-dm text-[13px] px-3 py-2 w-full outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-muted focus:border-accent focus:shadow-[0_0_0_2px_rgba(240,165,0,0.10)] disabled:opacity-50 disabled:cursor-not-allowed;
  }
  textarea.input {
    @apply resize-y min-h-[80px] leading-snug;
  }
  select.input {
    @apply appearance-none pr-8;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b6b85' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
  }
  .label {
    @apply block text-[11px] font-semibold tracking-[0.06em] uppercase text-ink-secondary mb-1.5;
  }
  .field { @apply flex flex-col gap-1; }

  /* Badges */
  .badge {
    @apply inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-[0.04em] font-dm;
  }
  .badge-default { @apply bg-raised text-ink-secondary border border-border; }
  .badge-accent  { @apply bg-accent/10 text-accent border border-accent/20; }
  .badge-ok      { @apply bg-ok/10 text-ok border border-ok/20; }
  .badge-fail    { @apply bg-fail/10 text-fail border border-fail/20; }

  /* Sidebar links */
  .sidebar-link {
    @apply flex items-center gap-2.5 py-2 px-3 mx-2 rounded-sm text-ink-secondary text-[13px] font-medium no-underline transition-all duration-150 cursor-pointer border-0 bg-transparent w-[calc(100%-1rem)] hover:bg-raised hover:text-ink-primary;
  }
  .sidebar-link.active {
    @apply bg-accent/10 text-accent;
    border: 1px solid rgba(240,165,0,0.15);
  }

  /* Skeleton loader */
  .skeleton {
    background: linear-gradient(
      90deg,
      theme('colors.surface') 0%,
      theme('colors.raised') 50%,
      theme('colors.surface') 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.8s infinite linear;
    @apply rounded-sm;
  }

  /* Stagger animation helper */
  .stagger > * {
    opacity: 0;
    animation: fade-up 0.4s ease forwards;
  }
  .stagger > *:nth-child(1) { animation-delay: 0.05s; }
  .stagger > *:nth-child(2) { animation-delay: 0.10s; }
  .stagger > *:nth-child(3) { animation-delay: 0.15s; }
  .stagger > *:nth-child(4) { animation-delay: 0.20s; }
  .stagger > *:nth-child(5) { animation-delay: 0.25s; }
  .stagger > *:nth-child(6) { animation-delay: 0.30s; }
  .stagger > *:nth-child(7) { animation-delay: 0.35s; }
  .stagger > *:nth-child(8) { animation-delay: 0.40s; }
  .stagger > *:nth-child(n+9) { animation-delay: 0.45s; }

  /* Code block */
  .code-block {
    @apply bg-[#050509] border border-border rounded-[10px] p-4 font-mono text-xs leading-[1.7] text-[#9d9dbf] overflow-x-auto whitespace-pre;
  }

  /* Drag handle */
  .drag-handle {
    @apply cursor-grab text-ink-muted transition-colors duration-150 hover:text-ink-secondary active:cursor-grabbing;
  }

  /* Divider */
  .divider { @apply h-px bg-border m-0; }

  /* Tabs */
  .tab-bar {
    @apply flex gap-0.5 p-[3px] bg-raised rounded-sm border border-border;
  }
  .tab {
    @apply flex-1 py-1.5 px-3 rounded-[5px] text-xs font-medium cursor-pointer border-0 bg-transparent text-ink-secondary transition-all duration-150 font-dm hover:text-ink-primary;
  }
  .tab.active {
    @apply bg-surface text-ink-primary shadow-[0_1px_3px_rgba(0,0,0,0.3)];
  }

  /* Empty state */
  .empty-state {
    @apply flex flex-col items-center justify-center gap-3 py-[60px] px-6 text-ink-muted text-center;
  }
  .empty-state p { @apply text-[13px] max-w-[240px] leading-relaxed; }

  /* Color swatch */
  .color-swatch {
    @apply w-7 h-7 rounded-[6px] border border-white/10 cursor-pointer flex-shrink-0;
  }

  /* Section title */
  .section-title {
    @apply text-[10px] font-bold tracking-[0.1em] uppercase text-ink-muted px-3 mb-1;
  }
}

/* ─── Keyframes (não gráveis via @apply) ─────────────────────────────────── */
@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position:  200% 0; }
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### 4.6 Tipos centralizados (types/index.ts)

Todos os tipos vivem aqui. Os componentes React e os arquivos `lib/` importam deste arquivo — **nunca redeclaram tipos inline**.

```typescript
// src/types/index.ts

// ─── Componentes ───────────────────────────────────────────────────────────

export type ComponentCategory =
  | 'Hero'
  | 'Navigation'
  | 'Features'
  | 'Pricing'
  | 'Testimonials'
  | 'CTA'
  | 'FAQ'
  | 'Stats'
  | 'Gallery'
  | 'Contact'
  | 'Footer'
  | 'Misc'

export interface PropDefinition {
  name: string
  type: 'string' | 'boolean' | 'number'
  required: boolean
  description?: string
  default?: string
  previewValue: string
}

export interface ComponentMeta {
  id: string
  name: string
  category: ComponentCategory
  description: string
  previewUrl?: string
  screenshotUrl?: string
  codeUrl?: string
  props: PropDefinition[]
  tags: string[]
  bestFor: string[]
  copy?: Record<string, string>
  createdAt: string
  updatedAt: string
}

// ─── Builder ────────────────────────────────────────────────────────────────

export interface SelectedComponent {
  meta: ComponentMeta
  position: number
  copy?: Record<string, string>
}

export interface ArtDirection {
  colorPrimary: string
  colorSecondary: string
  colorBackground: string
  colorText: string
  fontHeading: string
  fontBody: string
  mood: string
  references: string
  notes: string
}

export interface ProjectConfig {
  clientName: string
  projectType: string
  niche: string
  pageGoal: string
  googleAnalyticsId: string
  siteUrl: string
}

// ─── Configurações ──────────────────────────────────────────────────────────

export interface AppSettings {
  githubToken: string
  githubOwner: string
  componentsRepo: string
  baseProjectRepo: string
  previewBaseUrl: string
  registryUrl: string
  yourName: string
  studioName: string
  manifestTemplate: string
  defaultFontHeading: string
  defaultFontBody: string
  defaultColorPrimary: string
  defaultCtaLabel: string
  npmNamespace: string
}

// ─── GitHub API ─────────────────────────────────────────────────────────────

export interface GitHubFile {
  name: string
  path: string
  sha: string
  content?: string
  encoding?: string
}

export interface CreateProjectResult {
  repoUrl: string
  cloneUrl: string
  sshUrl: string
  vscodeUrl: string
  success: boolean
  error?: string
}
```

### 4.7 Lib — funções puras

Toda lógica de negócio fica em `lib/`. As API routes e componentes React **delegam** para essas funções — nunca reimplementam a lógica inline.

#### `lib/utils.ts`

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Utilitário padrão para combinar classes Tailwind de forma segura */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function toBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
}

export function wait(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}
```

> **Nota:** O `cn()` combina `clsx` (condicionais legíveis) com `tailwind-merge` (resolve conflitos entre classes Tailwind, ex: `px-2 px-4` → só fica `px-4`). Use sempre que montar classes condicionalmente nos componentes React.

#### `lib/github.ts`

```typescript
// src/lib/github.ts

import type { ComponentMeta, AppSettings, CreateProjectResult } from '../types'
import { toBase64, slugify, wait } from './utils'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

function apiUrl(path: string) {
  return `https://api.github.com${path}`
}

// ─── Registry ────────────────────────────────────────────────────────────────

/**
 * Busca o registry.json diretamente da URL raw do GitHub
 * (não precisa de token se o repo for público)
 */
export async function fetchRegistry(registryUrl: string): Promise<ComponentMeta[]> {
  const res = await fetch(`${registryUrl}?t=${Date.now()}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Erro ao buscar registry: ${res.status}`)
  return res.json()
}

/**
 * Atualiza o registry.json no GitHub
 */
export async function updateRegistry(
  settings: AppSettings,
  components: ComponentMeta[]
): Promise<void> {
  const { githubToken, githubOwner, componentsRepo } = settings
  const path = `/repos/${githubOwner}/${componentsRepo}/contents/registry.json`

  // Busca o SHA atual do arquivo (necessário para atualizar)
  let sha: string | undefined
  try {
    const existing = await fetch(apiUrl(path), { headers: headers(githubToken) })
    if (existing.ok) {
      const data = await existing.json()
      sha = data.sha
    }
  } catch {}

  const content = toBase64(JSON.stringify(components, null, 2))

  const res = await fetch(apiUrl(path), {
    method: 'PUT',
    headers: headers(githubToken),
    body: JSON.stringify({
      message: `chore: update registry.json [${new Date().toISOString()}]`,
      content,
      ...(sha ? { sha } : {}),
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Erro ao atualizar registry')
  }
}

// ─── Publicar Componente ──────────────────────────────────────────────────────

interface PublishComponentPayload {
  meta: ComponentMeta
  astroCode: string
  previewCode: string
  indexCode: string
  currentRegistry: ComponentMeta[]
}

export async function publishComponent(
  settings: AppSettings,
  payload: PublishComponentPayload
): Promise<void> {
  const { githubToken, githubOwner, componentsRepo } = settings
  const { meta, astroCode, previewCode, indexCode, currentRegistry } = payload
  const basePath = `/repos/${githubOwner}/${componentsRepo}/contents/src/components/${meta.name}`

  async function upsertFile(path: string, content: string, message: string) {
    let sha: string | undefined
    try {
      const existing = await fetch(apiUrl(path), { headers: headers(githubToken) })
      if (existing.ok) {
        const data = await existing.json()
        sha = data.sha
      }
    } catch {}

    const res = await fetch(apiUrl(path), {
      method: 'PUT',
      headers: headers(githubToken),
      body: JSON.stringify({ message, content: toBase64(content), ...(sha ? { sha } : {}) }),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || `Erro ao criar ${path}`)
    }
  }

  // 1. Cria os 3 arquivos do componente
  await upsertFile(`${basePath}/${meta.name}.astro`, astroCode, `feat: add ${meta.name} component`)
  await upsertFile(`${basePath}/${meta.name}.preview.astro`, previewCode, `feat: add ${meta.name} preview`)
  await upsertFile(`${basePath}/index.ts`, indexCode, `feat: add ${meta.name} index`)

  // 2. Atualiza o registry
  const exists = currentRegistry.findIndex(c => c.id === meta.id)
  const updated =
    exists >= 0
      ? currentRegistry.map(c => (c.id === meta.id ? { ...meta, updatedAt: new Date().toISOString() } : c))
      : [...currentRegistry, { ...meta, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]

  await updateRegistry(settings, updated)
}

// ─── Criar Projeto ─────────────────────────────────────────────────────────────

export async function createProjectFromTemplate(
  settings: AppSettings,
  clientName: string,
  manifestContent: string
): Promise<CreateProjectResult> {
  const { githubToken, githubOwner, baseProjectRepo } = settings
  const repoName = slugify(clientName)

  try {
    // 1. Cria o repo a partir do template
    const createRes = await fetch(
      apiUrl(`/repos/${githubOwner}/${baseProjectRepo}/generate`),
      {
        method: 'POST',
        headers: headers(githubToken),
        body: JSON.stringify({
          owner: githubOwner,
          name: repoName,
          private: true,
          description: `Landing page — ${clientName}`,
          include_all_branches: false,
        }),
      }
    )

    if (!createRes.ok) {
      const err = await createRes.json()
      throw new Error(err.message || 'Erro ao criar repositório')
    }

    const repo = await createRes.json()

    // 2. Aguarda o GitHub terminar de inicializar o repo
    await wait(3500)

    // 3. Commita o MANIFESTO.md no novo repo
    await fetch(
      apiUrl(`/repos/${githubOwner}/${repoName}/contents/MANIFESTO.md`),
      {
        method: 'PUT',
        headers: headers(githubToken),
        body: JSON.stringify({
          message: 'init: manifesto do projeto',
          content: toBase64(manifestContent),
        }),
      }
    )

    return {
      repoUrl: repo.html_url,
      cloneUrl: repo.clone_url,
      sshUrl: repo.ssh_url,
      vscodeUrl: `vscode://vscode.git/clone?url=${encodeURIComponent(repo.clone_url)}`,
      success: true,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return { repoUrl: '', cloneUrl: '', sshUrl: '', vscodeUrl: '', success: false, error: message }
  }
}

// ─── Validar Token ────────────────────────────────────────────────────────────

export async function validateGithubToken(token: string): Promise<{ valid: boolean; user?: string }> {
  try {
    const res = await fetch(apiUrl('/user'), { headers: headers(token) })
    if (!res.ok) return { valid: false }
    const data = await res.json()
    return { valid: true, user: data.login }
  } catch {
    return { valid: false }
  }
}
```

#### `lib/manifest.ts`

```typescript
// src/lib/manifest.ts

import type { ProjectConfig, ArtDirection, SelectedComponent, AppSettings } from '../types'

const DEFAULT_TEMPLATE = `# Projeto: {{clientName}}
**Gerado em:** {{date}}
**Tipo:** {{projectType}}
**Nicho:** {{niche}}
**Objetivo da página:** {{pageGoal}}
**URL do site:** {{siteUrl}}
**Google Analytics:** {{googleAnalyticsId}}
**Namespace npm:** {{npmNamespace}}

---

## Direção de Arte

| Item | Valor |
|------|-------|
| Primary | {{colorPrimary}} |
| Secondary | {{colorSecondary}} |
| Background | {{colorBackground}} |
| Texto | {{colorText}} |
| Heading font | {{fontHeading}} |
| Body font | {{fontBody}} |
| Mood | {{mood}} |
| Referências | {{references}} |

{{#notes}}
### Notas
{{notes}}
{{/notes}}

---

## Componentes Selecionados

{{components}}

---

## Instruções para o Claude Code

1. Duplicar a pasta base e renomear para \`{{repoName}}\`
2. Rodar \`npm install\`
3. Criar \`src/styles/theme.css\` com as variáveis CSS abaixo:
\`\`\`css
:root {
  --color-primary: {{colorPrimary}};
  --color-secondary: {{colorSecondary}};
  --color-bg: {{colorBackground}};
  --color-text: {{colorText}};
  --font-heading: '{{fontHeading}}', serif;
  --font-body: '{{fontBody}}', sans-serif;
}
\`\`\`
4. Implementar os componentes na ordem listada acima
5. Preencher cada componente com o copy correspondente
6. Colocar imagens na pasta \`/public/\` com os nomes referenciados
7. Rodar \`npm run dev\` e validar responsividade em mobile e desktop
8. Fazer build com \`npm run build\` e confirmar zero erros

---

**Gerado por:** {{studioName}}
`

function renderTemplate(template: string, vars: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value)
  }
  // Remove blocos condicionais vazios: {{#notes}}...{{/notes}}
  result = result.replace(/\{\{#\w+\}\}[\s\S]*?\{\{\/\w+\}\}/g, match => {
    const keyMatch = match.match(/\{\{#(\w+)\}\}/)
    if (!keyMatch) return ''
    const key = keyMatch[1]
    const value = vars[key]
    if (!value || value.trim() === '') return ''
    return match.replace(/\{\{#\w+\}\}/, '').replace(/\{\{\/\w+\}\}/, '')
  })
  return result
}

function buildComponentsSection(components: SelectedComponent[]): string {
  if (components.length === 0) return '_Nenhum componente selecionado_'

  return components
    .map((comp, i) => {
      const copy = comp.copy || {}
      const copyLines = Object.entries(copy)
        .filter(([, v]) => v.trim() !== '')
        .map(([k, v]) => `  - **${k}:** ${v}`)
        .join('\n')

      return `### Seção ${i + 1} — \`${comp.meta.id}\`
**Componente:** ${comp.meta.name}
${copyLines ? `\n**Copy / Props:**\n${copyLines}` : ''}`
    })
    .join('\n\n')
}

export function generateManifest(
  project: ProjectConfig,
  artDirection: ArtDirection,
  components: SelectedComponent[],
  settings: AppSettings
): string {
  const { manifestTemplate, studioName, npmNamespace } = settings

  const template = manifestTemplate?.trim() ? manifestTemplate : DEFAULT_TEMPLATE

  const repoName = project.clientName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const vars: Record<string, string> = {
    clientName:        project.clientName,
    date:              new Intl.DateTimeFormat('pt-BR').format(new Date()),
    projectType:       project.projectType,
    niche:             project.niche,
    pageGoal:          project.pageGoal,
    googleAnalyticsId: project.googleAnalyticsId || '—',
    siteUrl:           project.siteUrl || '—',
    npmNamespace:      npmNamespace || '—',
    repoName,
    colorPrimary:      artDirection.colorPrimary,
    colorSecondary:    artDirection.colorSecondary,
    colorBackground:   artDirection.colorBackground,
    colorText:         artDirection.colorText,
    fontHeading:       artDirection.fontHeading,
    fontBody:          artDirection.fontBody,
    mood:              artDirection.mood,
    references:        artDirection.references || '—',
    notes:             artDirection.notes || '',
    components:        buildComponentsSection(components),
    studioName:        studioName || 'Astro Component Studio',
  }

  return renderTemplate(template, vars)
}

export { DEFAULT_TEMPLATE }
```

<!-- Continua na parte 2: AppLayout, páginas, componentes React, _base-project, deploy -->


## 4.8 AppLayout.astro

`src/layouts/AppLayout.astro`

```astro
---
interface Props {
  title?: string
}

const { title = 'Astroteca' } = Astro.props
const currentPath = Astro.url.pathname
---

<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <link rel="stylesheet" href="/styles/app.css" />
</head>
<body>
  <div class="app-shell">
    <aside class="app-sidebar">
      <div class="px-4 pb-4 border-b border-border mb-2">
        <span class="text-lg font-bold text-accent tracking-tight" style="letter-spacing:-0.02em">Astroteca</span>
      </div>

      <nav class="flex flex-col gap-1 px-2 flex-1">
        <a href="/" class:list={['sidebar-link', { active: currentPath === '/' }]}>
          Biblioteca
        </a>
        <a href="/builder" class:list={['sidebar-link', { active: currentPath === '/builder' }]}>
          Builder
        </a>
        <a href="/admin" class:list={['sidebar-link', { active: currentPath === '/admin' }]}>
          Adicionar
        </a>
        <a href="/config" class:list={['sidebar-link', { active: currentPath === '/config' }]}>
          Configuracoes
        </a>
      </nav>

      <div class="pt-3 px-4 border-t border-border text-center">
        <span class="badge badge-default">v2.0.0</span>
      </div>
    </aside>

    <main class="app-main">
      <slot />
    </main>
  </div>
</body>
</html>
```

---

## 4.9 index.astro + ComponentBrowser.tsx

### `src/pages/index.astro`

```astro
---
import AppLayout from '../layouts/AppLayout.astro'
import ComponentBrowser from '../components/ComponentBrowser'
import { fetchRegistry } from '../lib/github'

let components: import('../types').ComponentMeta[] = []
let error = ''

const registryUrl = import.meta.env.PUBLIC_REGISTRY_URL || ''

if (registryUrl) {
  try {
    components = await fetchRegistry(registryUrl)
  } catch (e) {
    error = e instanceof Error ? e.message : 'Erro ao carregar registro'
  }
}
---

<AppLayout title="Biblioteca - Astroteca">
  <ComponentBrowser
    client:load
    initialComponents={components}
    registryUrl={registryUrl}
    initialError={error}
  />
</AppLayout>
```

### `src/components/ComponentBrowser.tsx`

```tsx
import { useState, useMemo, useEffect } from 'react'
import type { ComponentMeta, SelectedComponent } from '../types'
import { cn } from '../lib/utils'

interface Props {
  initialComponents: ComponentMeta[]
  registryUrl: string
  initialError: string
}

export default function ComponentBrowser({ initialComponents, registryUrl, initialError }: Props) {
  const [components, setComponents] = useState<ComponentMeta[]>(initialComponents)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [error, setError] = useState(initialError)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialComponents.length === 0 && !initialError) {
      const saved = localStorage.getItem('acs-settings')
      if (saved) {
        const settings = JSON.parse(saved)
        if (settings.registryUrl) {
          setLoading(true)
          fetch(settings.registryUrl)
            .then(r => r.json())
            .then((data: ComponentMeta[]) => {
              setComponents(data)
              setLoading(false)
            })
            .catch(e => {
              setError(e instanceof Error ? e.message : 'Erro ao carregar')
              setLoading(false)
            })
        }
      }
    }
  }, [])

  const categories = useMemo(() => {
    const cats = new Set<string>()
    components.forEach(c => cats.add(c.category))
    return Array.from(cats).sort()
  }, [components])

  const filtered = useMemo(() => {
    return components.filter(c => {
      const matchSearch = search === '' ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase()) ||
        c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      const matchCategory = !activeCategory || c.category === activeCategory
      return matchSearch && matchCategory
    })
  }, [components, search, activeCategory])

  const selected = useMemo(() => {
    return components.find(c => c.id === selectedId) || null
  }, [components, selectedId])

  function addToBuilder(meta: ComponentMeta) {
    const raw = localStorage.getItem('acs-builder-components')
    const list: SelectedComponent[] = raw ? JSON.parse(raw) : []
    if (list.some(s => s.meta.id === meta.id)) return
    list.push({ meta, position: list.length + 1 })
    localStorage.setItem('acs-builder-components', JSON.stringify(list))
    alert(`"${meta.name}" adicionado ao Builder!`)
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-6 h-[calc(100vh-4rem)]">
        {/* Left panel */}
        <div className="flex flex-col gap-4 overflow-hidden">
          <div className="flex flex-col gap-3">
            <input
              type="text"
              className="input"
              placeholder="Buscar componentes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="flex flex-wrap gap-1">
              <button
                className={cn('btn btn-sm', !activeCategory ? 'btn-primary' : 'btn-ghost')}
                onClick={() => setActiveCategory(null)}
              >
                Todos
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={cn('btn btn-sm', activeCategory === cat ? 'btn-primary' : 'btn-ghost')}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading && <div className="empty-state">Carregando componentes...</div>}
          {error  && <div className="empty-state">{error}</div>}
          {!loading && !error && filtered.length === 0 && (
            <div className="empty-state">Nenhum componente encontrado.</div>
          )}

          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 overflow-y-auto flex-1 pr-2">
            {filtered.map(c => (
              <div
                key={c.id}
                className={cn('card card-interactive', selectedId === c.id && 'card-selected')}
                onClick={() => setSelectedId(c.id)}
              >
                {c.screenshot && (
                  <img
                    src={c.screenshot}
                    alt={c.name}
                    className="w-full h-[120px] object-cover rounded-t-[10px]"
                  />
                )}
                <div className="p-3">
                  <div className="font-semibold text-sm mb-1">{c.name}</div>
                  <div className="text-xs text-ink-secondary mb-2">{c.description}</div>
                  <div className="flex flex-wrap gap-1">
                    <span className="badge badge-default">{c.category}</span>
                    {c.tags.slice(0, 2).map(t => (
                      <span key={t} className="badge">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          {!selected ? (
            <div className="empty-state">Selecione um componente para ver detalhes.</div>
          ) : (
            <>
              <div className="border border-border rounded-[10px] overflow-hidden bg-raised min-h-[300px]">
                {selected.screenshot ? (
                  <img
                    src={selected.screenshot}
                    alt={selected.name}
                    className="w-full h-[300px] object-cover"
                  />
                ) : (
                  <div className="empty-state">Sem preview disponivel</div>
                )}
              </div>

              <div className="card p-4 flex flex-col gap-4">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <div className="text-xl font-bold">{selected.name}</div>
                    <p className="text-xs text-ink-secondary mt-1">{selected.description}</p>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => addToBuilder(selected)}
                  >
                    Adicionar ao Builder
                  </button>
                </div>

                <div className="flex flex-wrap gap-1">
                  <span className="badge badge-accent">{selected.category}</span>
                  {selected.tags.map(t => (
                    <span key={t} className="badge badge-default">{t}</span>
                  ))}
                </div>

                <div>
                  <p className="label">Melhor para</p>
                  <p className="text-sm text-ink-secondary">{selected.bestFor}</p>
                </div>

                {selected.props.length > 0 && (
                  <div>
                    <p className="label">Props</p>
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr>
                          {['Nome','Tipo','Obrigatoria','Descricao'].map(h => (
                            <th key={h} className="text-left py-2 px-3 border-b border-border text-ink-muted font-medium uppercase text-xs">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selected.props.map(p => (
                          <tr key={p.name}>
                            <td className="py-2 px-3 border-b border-border"><code>{p.name}</code></td>
                            <td className="py-2 px-3 border-b border-border"><code>{p.type}</code></td>
                            <td className="py-2 px-3 border-b border-border">{p.required ? 'Sim' : 'Nao'}</td>
                            <td className="py-2 px-3 border-b border-border">{p.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {selected.copy && Object.keys(selected.copy).length > 0 && (
                  <div>
                    <p className="label">Copy editavel</p>
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr>
                          {['Chave','Valor padrao'].map(h => (
                            <th key={h} className="text-left py-2 px-3 border-b border-border text-ink-muted font-medium uppercase text-xs">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(selected.copy).map(([k, v]) => (
                          <tr key={k}>
                            <td className="py-2 px-3 border-b border-border"><code>{k}</code></td>
                            <td className="py-2 px-3 border-b border-border">{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
```

---

## 4.10 builder.astro + Builder.tsx

### `src/pages/builder.astro`

```astro
---
import AppLayout from '../layouts/AppLayout.astro'
import Builder from '../components/Builder'
import { fetchRegistry } from '../lib/github'

let components: import('../types').ComponentMeta[] = []

const registryUrl = import.meta.env.PUBLIC_REGISTRY_URL || ''

if (registryUrl) {
  try {
    components = await fetchRegistry(registryUrl)
  } catch {
    // sera carregado client-side
  }
}
---

<AppLayout title="Builder - Astroteca">
  <Builder client:load availableComponents={components} />
</AppLayout>
```

### `src/components/Builder.tsx`

```tsx
import { useState, useEffect, useMemo } from 'react'
import type {
  ComponentMeta,
  ProjectConfig,
  ArtDirection,
  SelectedComponent,
  AppSettings,
} from '../types'
import { generateManifest } from '../lib/manifest'

/* --- Helper sub-components --- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div className="builder__pair">
      <span className="builder__pair-label">{label}</span>
      <span className="builder__pair-value">{value || '-'}</span>
    </div>
  )
}

function ColorSwatch({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      <div className="builder__color-row">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="builder__color-picker"
        />
        <input
          type="text"
          className="input"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="#000000"
        />
      </div>
    </div>
  )
}

/* --- Constants --- */

const STEPS = ['Configurar', 'Componentes', 'Revisar'] as const
type Step = (typeof STEPS)[number]

const EMPTY_PROJECT: ProjectConfig = {
  clientName: '',
  projectType: 'landing-page',
  niche: '',
  pageGoal: '',
  siteUrl: '',
  googleAnalyticsId: '',
}

const EMPTY_ART: ArtDirection = {
  colorPrimary: '#6366f1',
  colorSecondary: '#f59e0b',
  colorBackground: '#ffffff',
  colorText: '#111111',
  fontHeading: 'Inter',
  fontBody: 'Inter',
  mood: '',
  references: '',
  notes: '',
}

/* --- Main Component --- */

interface Props {
  availableComponents: ComponentMeta[]
}

export default function Builder({ availableComponents }: Props) {
  const [step, setStep] = useState<Step>('Configurar')
  const [project, setProject] = useState<ProjectConfig>(EMPTY_PROJECT)
  const [art, setArt] = useState<ArtDirection>(EMPTY_ART)
  const [selected, setSelected] = useState<SelectedComponent[]>([])
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [components, setComponents] = useState<ComponentMeta[]>(availableComponents)
  const [expandedCopy, setExpandedCopy] = useState<Record<string, boolean>>({})
  const [copyEdits, setCopyEdits] = useState<Record<string, Record<string, string>>>({})
  const [creating, setCreating] = useState(false)
  const [result, setResult] = useState<{ repoUrl: string; cloneUrl: string } | null>(null)
  const [error, setError] = useState('')

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('acs-settings')
    if (saved) {
      const settings: AppSettings = JSON.parse(saved)
      if (settings.defaultFontHeading) {
        setArt(prev => ({ ...prev, fontHeading: settings.defaultFontHeading || prev.fontHeading }))
      }
      if (settings.defaultFontBody) {
        setArt(prev => ({ ...prev, fontBody: settings.defaultFontBody || prev.fontBody }))
      }
      if (settings.defaultColorPrimary) {
        setArt(prev => ({ ...prev, colorPrimary: settings.defaultColorPrimary || prev.colorPrimary }))
      }
    }

    const builderComponents = localStorage.getItem('acs-builder-components')
    if (builderComponents) {
      const list: SelectedComponent[] = JSON.parse(builderComponents)
      setSelected(list)
      // Initialize copy edits from component defaults
      const edits: Record<string, Record<string, string>> = {}
      list.forEach(sc => {
        if (sc.meta.copy) {
          edits[sc.meta.id] = { ...sc.meta.copy }
        }
      })
      setCopyEdits(edits)
    }

    // Load components from settings if not provided
    if (availableComponents.length === 0) {
      const s = localStorage.getItem('acs-settings')
      if (s) {
        const settings: AppSettings = JSON.parse(s)
        if (settings.registryUrl) {
          fetch(settings.registryUrl)
            .then(r => r.json())
            .then((data: ComponentMeta[]) => setComponents(data))
            .catch(() => {})
        }
      }
    }
  }, [])

  // Persist selected to localStorage
  useEffect(() => {
    localStorage.setItem('acs-builder-components', JSON.stringify(selected))
  }, [selected])

  const categories = useMemo(() => {
    const cats = new Set<string>()
    components.forEach(c => cats.add(c.category))
    return Array.from(cats).sort()
  }, [components])

  const filteredComponents = useMemo(() => {
    return components.filter(c => {
      const matchSearch =
        search === '' ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
      const matchCat = !filterCategory || c.category === filterCategory
      return matchSearch && matchCat
    })
  }, [components, search, filterCategory])

  function updateProject<K extends keyof ProjectConfig>(key: K, value: ProjectConfig[K]) {
    setProject(prev => ({ ...prev, [key]: value }))
  }

  function updateArt<K extends keyof ArtDirection>(key: K, value: ArtDirection[K]) {
    setArt(prev => ({ ...prev, [key]: value }))
  }

  function toggleComponent(meta: ComponentMeta) {
    setSelected(prev => {
      const exists = prev.find(s => s.meta.id === meta.id)
      if (exists) {
        const filtered = prev.filter(s => s.meta.id !== meta.id)
        return filtered.map((s, i) => ({ ...s, position: i + 1 }))
      }
      const newList = [...prev, { meta, position: prev.length + 1 }]
      // Init copy edits
      if (meta.copy) {
        setCopyEdits(ce => ({ ...ce, [meta.id]: { ...meta.copy! } }))
      }
      return newList
    })
  }

  function moveComponent(index: number, direction: 'up' | 'down') {
    setSelected(prev => {
      const arr = [...prev]
      const target = direction === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= arr.length) return prev
      const temp = arr[index]
      arr[index] = arr[target]
      arr[target] = temp
      return arr.map((s, i) => ({ ...s, position: i + 1 }))
    })
  }

  function removeComponent(id: string) {
    setSelected(prev =>
      prev.filter(s => s.meta.id !== id).map((s, i) => ({ ...s, position: i + 1 }))
    )
  }

  function updateCopy(componentId: string, key: string, value: string) {
    setCopyEdits(prev => ({
      ...prev,
      [componentId]: { ...(prev[componentId] || {}), [key]: value },
    }))
  }

  function toggleCopyExpand(id: string) {
    setExpandedCopy(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function getSelectedWithCopy(): SelectedComponent[] {
    return selected.map(sc => ({
      ...sc,
      meta: {
        ...sc.meta,
        copy: copyEdits[sc.meta.id] || sc.meta.copy || {},
      },
    }))
  }

  function getManifest(): string {
    const raw = localStorage.getItem('acs-settings')
    const settings: AppSettings = raw ? JSON.parse(raw) : ({} as AppSettings)
    return generateManifest(project, art, getSelectedWithCopy(), settings)
  }

  function downloadManifest() {
    const text = getManifest()
    const blob = new Blob([text], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.clientName || 'projeto'}-manifest.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function createProject() {
    setCreating(true)
    setError('')
    try {
      const raw = localStorage.getItem('acs-settings')
      if (!raw) throw new Error('Configure o GitHub em Configuracoes primeiro.')
      const settings: AppSettings = JSON.parse(raw)
      const manifest = getManifest()

      const res = await fetch('/api/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings,
          clientName: project.clientName,
          manifest,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao criar projeto')
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setCreating(false)
    }
  }

  function isSelected(id: string) {
    return selected.some(s => s.meta.id === id)
  }

  function getPosition(id: string) {
    const s = selected.find(sc => sc.meta.id === id)
    return s ? s.position : null
  }

  /* --- Result screen --- */

  if (result) {
    return (
      <div className="max-w-[600px] mx-auto flex flex-col gap-4 pt-16">
        <div className="text-2xl font-bold text-accent">Projeto criado com sucesso!</div>
        <div className="card p-4">
          <Pair label="Repositorio" value={result.repoUrl} />
          <div className="flex flex-col gap-2 mt-3">
            <a href={result.repoUrl} target="_blank" rel="noopener" className="btn btn-primary">
              Abrir no GitHub
            </a>
            <a
              href={`vscode://vscode.git/clone?url=${encodeURIComponent(result.cloneUrl)}`}
              className="btn btn-outline"
            >
              Abrir no VS Code
            </a>
            <button className="btn btn-outline" onClick={downloadManifest}>
              Baixar Manifesto (.md)
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* --- Main render --- */

  return (
    <>
      <div className="grid grid-cols-[1fr_300px] gap-6 min-h-[calc(100vh-4rem)]">
        {/* Main content */}
        <div className="flex flex-col gap-4">
          {/* Tab navigation */}
          <div className="tab-bar">
            {STEPS.map((s, i) => (
              <button
                key={s}
                className={cn('tab', step === s && 'active')}
                onClick={() => setStep(s)}
              >
                {i + 1}. {s}
              </button>
            ))}
          </div>

          {/* --- Step 1: Configurar --- */}
          {step === 'Configurar' && (
            <div className="card p-4 flex flex-col gap-4">
              <h2 className="section-title">Dados do Projeto</h2>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nome do cliente">
                  <input
                    className="input"
                    value={project.clientName}
                    onChange={e => updateProject('clientName', e.target.value)}
                    placeholder="acme-corp"
                  />
                </Field>
                <Field label="Tipo de projeto">
                  <select
                    className="input"
                    value={project.projectType}
                    onChange={e => updateProject('projectType', e.target.value)}
                  >
                    <option value="landing-page">Landing Page</option>
                    <option value="site-institucional">Site Institucional</option>
                    <option value="portfolio">Portfolio</option>
                    <option value="blog">Blog</option>
                    <option value="ecommerce">E-commerce</option>
                  </select>
                </Field>
                <Field label="Nicho">
                  <input
                    className="input"
                    value={project.niche}
                    onChange={e => updateProject('niche', e.target.value)}
                    placeholder="ex: saude, tech, educacao"
                  />
                </Field>
                <Field label="Objetivo da pagina">
                  <input
                    className="input"
                    value={project.pageGoal}
                    onChange={e => updateProject('pageGoal', e.target.value)}
                    placeholder="ex: captar leads, vender produto"
                  />
                </Field>
                <Field label="URL do site">
                  <input
                    className="input"
                    value={project.siteUrl}
                    onChange={e => updateProject('siteUrl', e.target.value)}
                    placeholder="https://..."
                  />
                </Field>
                <Field label="Google Analytics ID">
                  <input
                    className="input"
                    value={project.googleAnalyticsId}
                    onChange={e => updateProject('googleAnalyticsId', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                </Field>
              </div>

              <h2 className="section-title">Direcao de Arte</h2>
              <div className="grid grid-cols-2 gap-3">
                <ColorSwatch label="Cor Primaria"   value={art.colorPrimary}    onChange={v => updateArt('colorPrimary', v)} />
                <ColorSwatch label="Cor Secundaria" value={art.colorSecondary}  onChange={v => updateArt('colorSecondary', v)} />
                <ColorSwatch label="Cor de Fundo"   value={art.colorBackground} onChange={v => updateArt('colorBackground', v)} />
                <ColorSwatch label="Cor do Texto"   value={art.colorText}       onChange={v => updateArt('colorText', v)} />
                <Field label="Fonte dos titulos">
                  <input className="input" value={art.fontHeading} onChange={e => updateArt('fontHeading', e.target.value)} placeholder="Inter" />
                </Field>
                <Field label="Fonte do corpo">
                  <input className="input" value={art.fontBody} onChange={e => updateArt('fontBody', e.target.value)} placeholder="Inter" />
                </Field>
                <div className="col-span-2">
                  <Field label="Mood / Tom">
                    <input className="input" value={art.mood} onChange={e => updateArt('mood', e.target.value)} placeholder="ex: profissional, acolhedor, moderno" />
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label="Referencias visuais">
                    <textarea className="input" value={art.references} onChange={e => updateArt('references', e.target.value)} placeholder="Links ou descricao de referencias" rows={3} />
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label="Observacoes">
                    <textarea className="input" value={art.notes} onChange={e => updateArt('notes', e.target.value)} placeholder="Qualquer nota adicional sobre o projeto" rows={3} />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* --- Step 2: Componentes --- */}
          {step === 'Componentes' && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <input className="input" placeholder="Buscar componentes..." value={search} onChange={e => setSearch(e.target.value)} />
                <div className="flex flex-wrap gap-1">
                  <button className={cn('btn btn-sm', !filterCategory ? 'btn-primary' : 'btn-ghost')} onClick={() => setFilterCategory(null)}>Todos</button>
                  {categories.map(cat => (
                    <button key={cat} className={cn('btn btn-sm', filterCategory === cat ? 'btn-primary' : 'btn-ghost')} onClick={() => setFilterCategory(cat)}>{cat}</button>
                  ))}
                </div>
              </div>

              {filteredComponents.length === 0 ? (
                <div className="empty-state">Nenhum componente encontrado.</div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
                  {filteredComponents.map(c => {
                    const sel = isSelected(c.id)
                    const pos = getPosition(c.id)
                    return (
                      <div key={c.id} className={cn('card card-interactive p-3', sel && 'card-selected')} onClick={() => toggleComponent(c)}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-sm">{c.name}</span>
                          {pos !== null && <span className="badge badge-accent">{pos}</span>}
                        </div>
                        <div className="text-xs text-ink-secondary mb-2">{c.description}</div>
                        <span className="badge badge-default">{c.category}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* --- Step 3: Revisar --- */}
          {step === 'Revisar' && (
            <div className="flex flex-col gap-4">
              <div className="card p-4">
                <h2 className="section-title">Resumo do Projeto</h2>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Pair label="Cliente"  value={project.clientName} />
                  <Pair label="Tipo"     value={project.projectType} />
                  <Pair label="Nicho"    value={project.niche} />
                  <Pair label="Objetivo" value={project.pageGoal} />
                  <Pair label="URL"      value={project.siteUrl} />
                  <Pair label="GA ID"    value={project.googleAnalyticsId} />
                </div>
              </div>

              <div className="card">
                <h2 className="section-title py-3">Componentes ({selected.length})</h2>
                {selected.length === 0 ? (
                  <div className="empty-state">Nenhum componente selecionado.</div>
                ) : (
                  selected.map((sc, index) => (
                    <div key={sc.meta.id}>
                      <div className="flex items-center gap-3 p-3 border-b border-border last:border-b-0">
                        <span className="font-bold text-accent min-w-[24px] text-center">{sc.position}</span>
                        <div className="flex-1">
                          <strong>{sc.meta.name}</strong>
                          <div className="text-xs text-ink-secondary mt-0.5">{sc.meta.description}</div>
                        </div>
                        <div className="flex gap-1">
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => moveComponent(index, 'up')}  disabled={index === 0}>^</button>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => moveComponent(index, 'down')} disabled={index === selected.length - 1}>v</button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => removeComponent(sc.meta.id)}>x</button>
                        </div>
                      </div>

                      {sc.meta.copy && Object.keys(sc.meta.copy).length > 0 && (
                        <div className="px-3 pb-3 pt-2 border-t border-border flex flex-col gap-2">
                          <button
                            className="text-accent text-sm font-medium bg-transparent border-0 cursor-pointer text-left p-0"
                            onClick={() => toggleCopyExpand(sc.meta.id)}
                          >
                            {expandedCopy[sc.meta.id] ? 'v' : '>'} Editar textos ({Object.keys(sc.meta.copy).length} campos)
                          </button>
                          {expandedCopy[sc.meta.id] && (
                            <div className="flex flex-col gap-2">
                              {Object.entries(copyEdits[sc.meta.id] || sc.meta.copy).map(([key, value]) => (
                                <div key={key} className="flex flex-col gap-1">
                                  <label className="text-xs text-ink-secondary font-medium">{key}</label>
                                  <textarea className="input" value={value} onChange={e => updateCopy(sc.meta.id, key, e.target.value)} rows={2} />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {error && (
                <div className="text-fail px-3 py-2.5 border border-fail/30 rounded-[10px] text-sm">{error}</div>
              )}

              <div className="flex gap-3 pt-4 border-t border-border">
                <button className="btn btn-outline" onClick={downloadManifest}>Baixar Manifesto (.md)</button>
                <button className="btn btn-primary" onClick={createProject} disabled={creating || !project.clientName}>
                  {creating ? 'Criando...' : 'Criar Projeto no GitHub'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- Right Sidebar --- */}
        <div className="flex flex-col gap-4">
          <div className="card p-3">
            <div className="text-xs font-semibold uppercase tracking-[0.05em] text-ink-secondary mb-2">Cliente</div>
            <div className="text-sm">{project.clientName || '(nao definido)'}</div>
            <div className="text-xs text-ink-secondary mt-0.5">{project.projectType} - {project.niche || '-'}</div>
          </div>

          <div className="card p-3">
            <div className="text-xs font-semibold uppercase tracking-[0.05em] text-ink-secondary mb-2">Estrutura da Pagina</div>
            {selected.length === 0 ? (
              <div className="text-xs text-ink-secondary">Nenhum componente adicionado</div>
            ) : (
              selected.map(sc => (
                <div key={sc.meta.id} className="flex gap-2 items-center text-sm py-1">
                  <span className="badge badge-accent">{sc.position}</span>
                  <span>{sc.meta.name}</span>
                </div>
              ))
            )}
          </div>

          <div className="card p-3">
            <div className="text-xs font-semibold uppercase tracking-[0.05em] text-ink-secondary mb-2">Cores</div>
            <div className="flex gap-2 flex-wrap">
              <div className="w-8 h-8 rounded-[10px] border border-border" style={{ background: art.colorPrimary }} title="Primaria" />
              <div className="w-8 h-8 rounded-[10px] border border-border" style={{ background: art.colorSecondary }} title="Secundaria" />
              <div className="w-8 h-8 rounded-[10px] border border-border" style={{ background: art.colorBackground }} title="Fundo" />
              <div className="w-8 h-8 rounded-[10px] border border-border" style={{ background: art.colorText }} title="Texto" />
            </div>
          </div>

          <div className="card p-3">
            <div className="text-xs font-semibold uppercase tracking-[0.05em] text-ink-secondary mb-2">Tipografia</div>
            <Pair label="Titulos" value={art.fontHeading} />
            <Pair label="Corpo"   value={art.fontBody} />
          </div>
        </div>
      </div>
    </>
  )
}
```

---

## 4.11 API Routes

### `src/pages/api/create-project.ts`

```typescript
import type { APIRoute } from 'astro'
import type { AppSettings } from '../../types'
import { createProjectFromTemplate } from '../../lib/github'

export const POST: APIRoute = async ({ request }) => {
  const { settings, clientName, manifest } = await request.json() as {
    settings: AppSettings
    clientName: string
    manifest: string
  }

  const result = await createProjectFromTemplate(settings, clientName, manifest)

  if (!result.success) {
    return new Response(JSON.stringify({ error: result.error }), { status: 400 })
  }

  return new Response(JSON.stringify(result), { status: 200 })
}
```

### `src/pages/api/publish-component.ts`

```typescript
import type { APIRoute } from 'astro'
import type { AppSettings, ComponentMeta } from '../../types'
import { publishComponent, fetchRegistry } from '../../lib/github'

export const POST: APIRoute = async ({ request }) => {
  const { settings, meta, astroCode, previewCode, indexCode } = await request.json() as {
    settings: AppSettings
    meta: ComponentMeta
    astroCode: string
    previewCode: string
    indexCode: string
  }

  try {
    const currentRegistry = await fetchRegistry(settings.registryUrl)
    await publishComponent(settings, { meta, astroCode, previewCode, indexCode, currentRegistry })
    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return new Response(JSON.stringify({ error: message }), { status: 500 })
  }
}
```

---

## 4.12 admin.astro + AdminForm.tsx

### `src/pages/admin.astro`

```astro
---
import AppLayout from '../layouts/AppLayout.astro'
import AdminForm from '../components/AdminForm'
---

<AppLayout title="Adicionar Componente - Astroteca">
  <AdminForm client:load />
</AppLayout>
```

### `src/components/AdminForm.tsx`

```tsx
import { useState } from 'react'
import type { ComponentMeta, PropDefinition, AppSettings } from '../types'

interface PropDraft {
  name: string
  type: string
  required: boolean
  description: string
  previewValue: string
}

const CATEGORIES = [
  'hero',
  'features',
  'pricing',
  'testimonials',
  'cta',
  'footer',
  'header',
  'faq',
  'gallery',
  'contact',
  'about',
  'stats',
  'team',
]

const EMPTY_PROP: PropDraft = {
  name: '',
  type: 'string',
  required: false,
  description: '',
  previewValue: '',
}

export default function AdminForm() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('hero')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [bestFor, setBestFor] = useState('')
  const [props, setProps] = useState<PropDraft[]>([])
  const [astroCode, setAstroCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'fail'; message: string } | null>(null)

  function generateId(n: string): string {
    return n
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  function addProp() {
    setProps(prev => [...prev, { ...EMPTY_PROP }])
  }

  function removeProp(index: number) {
    setProps(prev => prev.filter((_, i) => i !== index))
  }

  function updateProp<K extends keyof PropDraft>(index: number, key: K, value: PropDraft[K]) {
    setProps(prev => {
      const arr = [...prev]
      arr[index] = { ...arr[index], [key]: value }
      return arr
    })
  }

  function generatePreviewCode(): string {
    const propsStr = props
      .map(p => {
        if (p.type === 'boolean') return `  ${p.name}={${p.previewValue || 'true'}}`
        if (p.type === 'number') return `  ${p.name}={${p.previewValue || '0'}}`
        if (p.type.includes('[]') || p.type.includes('Array'))
          return `  ${p.name}={${p.previewValue || '[]'}}`
        return `  ${p.name}="${p.previewValue || ''}"`
      })
      .join('\n')

    return `---\nimport ${name} from './${name}.astro'\n---\n\n<${name}\n${propsStr}\n/>`
  }

  function generateIndexCode(): string {
    const propsMeta: PropDefinition[] = props.map(p => ({
      name: p.name,
      type: p.type,
      required: p.required,
      description: p.description,
      previewValue: p.previewValue || '',
    }))

    const copy: Record<string, string> = {}
    props.forEach(p => {
      if (p.type === 'string' && p.previewValue) {
        copy[p.name] = p.previewValue
      }
    })

    const meta: ComponentMeta = {
      id: generateId(name),
      name,
      category,
      description,
      tags: tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean),
      bestFor,
      props: propsMeta,
      copy: Object.keys(copy).length > 0 ? copy : undefined,
    }

    return `export const meta = ${JSON.stringify(meta, null, 2)} as const`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFeedback(null)
    setSubmitting(true)

    try {
      const raw = localStorage.getItem('acs-settings')
      if (!raw) throw new Error('Configure o GitHub em Configuracoes primeiro.')
      const settings: AppSettings = JSON.parse(raw)

      const propsMeta: PropMeta[] = props.map(p => ({
        name: p.name,
        type: p.type,
        required: p.required,
        description: p.description,
      }))

      const copy: Record<string, string> = {}
      props.forEach(p => {
        if (p.type === 'string' && p.previewValue) {
          copy[p.name] = p.previewValue
        }
      })

      const meta: ComponentMeta = {
        id: generateId(name),
        name,
        category,
        description,
        tags: tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
        bestFor,
        props: propsMeta,
        copy: Object.keys(copy).length > 0 ? copy : undefined,
      }

      const previewCode = generatePreviewCode()
      const indexCode = generateIndexCode()

      const res = await fetch('/api/publish-component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings,
          meta,
          astroCode,
          previewCode,
          indexCode,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao publicar')

      setFeedback({ type: 'ok', message: `Componente "${name}" publicado com sucesso!` })
      setName('')
      setDescription('')
      setTags('')
      setBestFor('')
      setProps([])
      setAstroCode('')
    } catch (e) {
      setFeedback({
        type: 'fail',
        message: e instanceof Error ? e.message : 'Erro desconhecido',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <style>{`
        .admin {
          max-width: 800px;
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .admin__title {
          font-size: var(--text-2xl);
          font-weight: 700;
        }

        .admin__row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
        }

        .admin__full {
          grid-column: 1 / -1;
        }

        .admin__props-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-2);
        }

        .admin__prop-item {
          display: grid;
          grid-template-columns: 1fr 100px 80px 1fr 1fr 40px;
          gap: var(--space-2);
          align-items: end;
          padding: var(--space-2) 0;
          border-bottom: 1px solid var(--border);
        }

        .admin__prop-item:last-child {
          border-bottom: none;
        }

        .admin__code-area {
          width: 100%;
          min-height: 300px;
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          resize: vertical;
        }

        .admin__generated {
          background: var(--surface-2);
          padding: var(--space-3);
          border-radius: var(--radius);
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          white-space: pre-wrap;
          max-height: 200px;
          overflow-y: auto;
        }

        .admin__id-preview {
          margin-top: var(--space-2);
        }
      `}</style>

      <form className="admin" onSubmit={handleSubmit}>
        <h1 className="admin__title">Adicionar Componente</h1>

        {feedback && (
          <div className={`badge ${feedback.type === 'ok' ? 'badge-ok' : 'badge-fail'}`}>
            {feedback.message}
          </div>
        )}

        <div className="card">
          <h2 className="section-title">Informacoes Basicas</h2>
          <div className="admin__row">
            <Field label="Nome (PascalCase)">
              <input
                className="input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="HeroSplit"
                required
              />
            </Field>
            <Field label="Categoria">
              <select
                className="input"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <div className="admin__full">
              <Field label="Descricao">
                <input
                  className="input"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Descricao curta do componente"
                  required
                />
              </Field>
            </div>
            <Field label="Tags (separadas por virgula)">
              <input
                className="input"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="hero, split, imagem"
              />
            </Field>
            <Field label="Melhor para">
              <input
                className="input"
                value={bestFor}
                onChange={e => setBestFor(e.target.value)}
                placeholder="Landing pages com imagem lateral"
              />
            </Field>
          </div>

          {name && (
            <div className="admin__id-preview">
              <span className="label">ID gerado: </span>
              <code>{generateId(name)}</code>
            </div>
          )}
        </div>

        <div className="card">
          <div className="admin__props-header">
            <h2 className="section-title">Props</h2>
            <button type="button" className="btn btn-outline btn-sm" onClick={addProp}>
              + Adicionar Prop
            </button>
          </div>

          {props.length === 0 && (
            <div className="empty-state">Nenhuma prop adicionada ainda.</div>
          )}

          {props.map((prop, i) => (
            <div key={i} className="admin__prop-item">
              <Field label="Nome">
                <input
                  className="input"
                  value={prop.name}
                  onChange={e => updateProp(i, 'name', e.target.value)}
                  placeholder="titulo"
                />
              </Field>
              <Field label="Tipo">
                <select
                  className="input"
                  value={prop.type}
                  onChange={e => updateProp(i, 'type', e.target.value)}
                >
                  <option value="string">string</option>
                  <option value="number">number</option>
                  <option value="boolean">boolean</option>
                  <option value="string[]">string[]</option>
                  <option value="Record<string, string>">Record</option>
                </select>
              </Field>
              <Field label="Obrig.">
                <input
                  type="checkbox"
                  checked={prop.required}
                  onChange={e => updateProp(i, 'required', e.target.checked)}
                />
              </Field>
              <Field label="Descricao">
                <input
                  className="input"
                  value={prop.description}
                  onChange={e => updateProp(i, 'description', e.target.value)}
                  placeholder="Descricao da prop"
                />
              </Field>
              <Field label="Preview Value">
                <input
                  className="input"
                  value={prop.previewValue}
                  onChange={e => updateProp(i, 'previewValue', e.target.value)}
                  placeholder="Valor no preview"
                />
              </Field>
              <div>
                <button
                  type="button"
                  className="btn btn-danger btn-sm btn-icon"
                  onClick={() => removeProp(i)}
                >
                  x
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="section-title">Codigo do Componente (.astro)</h2>
          <textarea
            className="input admin__code-area"
            value={astroCode}
            onChange={e => setAstroCode(e.target.value)}
            placeholder={'---\ninterface Props {\n  titulo: string\n}\nconst { titulo } = Astro.props\n---\n\n<section>\n  <h1>{titulo}</h1>\n</section>'}
            required
          />
        </div>

        {name && props.length > 0 && (
          <div className="card">
            <h2 className="section-title">Preview Gerado</h2>
            <div className="admin__generated">{generatePreviewCode()}</div>

            <h2 className="section-title">index.ts Gerado</h2>
            <div className="admin__generated">{generateIndexCode()}</div>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={submitting || !name || !astroCode}
        >
          {submitting ? 'Publicando...' : 'Publicar Componente'}
        </button>
      </form>
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      {children}
    </div>
  )
}
```

---

## 4.13 config.astro + ConfigPanel.tsx

### `src/pages/config.astro`

```astro
---
import AppLayout from '../layouts/AppLayout.astro'
import ConfigPanel from '../components/ConfigPanel'
---

<AppLayout title="Configuracoes - Astroteca">
  <ConfigPanel client:load />
</AppLayout>
```

### `src/components/ConfigPanel.tsx`

```tsx
import { useState, useEffect } from 'react'
import type { AppSettings } from '../types'
import { validateGithubToken } from '../lib/github'
import { DEFAULT_TEMPLATE } from '../lib/manifest'

type Section = 'github' | 'defaults' | 'template' | 'about'

const SECTIONS: { key: Section; label: string }[] = [
  { key: 'github', label: 'GitHub' },
  { key: 'defaults', label: 'Padroes' },
  { key: 'template', label: 'Template do Manifesto' },
  { key: 'about', label: 'Sobre' },
]

const EMPTY_SETTINGS: AppSettings = {
  githubToken: '',
  githubOwner: '',
  componentsRepo: 'astro-components',
  baseProjectRepo: '_base-project',
  registryUrl: '',
  previewBaseUrl: '',
  defaultFontHeading: 'Inter',
  defaultFontBody: 'Inter',
  defaultColorPrimary: '#6366f1',
  defaultCtaLabel: 'Comecar agora',
  manifestTemplate: DEFAULT_TEMPLATE,
  yourName: '',
  studioName: '',
  npmNamespace: '',
}

export default function ConfigPanel() {
  const [section, setSection] = useState<Section>('github')
  const [settings, setSettings] = useState<AppSettings>(EMPTY_SETTINGS)
  const [showToken, setShowToken] = useState(false)
  const [validating, setValidating] = useState(false)
  const [tokenUser, setTokenUser] = useState<string | null>(null)
  const [tokenError, setTokenError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem('acs-settings')
    if (raw) {
      const parsed = JSON.parse(raw)
      setSettings({ ...EMPTY_SETTINGS, ...parsed })
    }
  }, [])

  function update<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setSettings(prev => {
      const next = { ...prev, [key]: value }
      localStorage.setItem('acs-settings', JSON.stringify(next))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      return next
    })
  }

  async function handleValidateToken() {
    setValidating(true)
    setTokenError('')
    setTokenUser(null)
    try {
      const result = await validateGithubToken(settings.githubToken)
      if (result.valid) {
        setTokenUser(result.login || 'Autenticado')
      } else {
        setTokenError(result.error || 'Token invalido')
      }
    } catch (e) {
      setTokenError(e instanceof Error ? e.message : 'Erro ao validar')
    } finally {
      setValidating(false)
    }
  }

  function resetTemplate() {
    update('manifestTemplate', DEFAULT_TEMPLATE)
  }

  return (
    <>
      <style>{`
        .config {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: var(--space-6);
          max-width: 900px;
        }

        .config__nav {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .config__content {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .config__title {
          font-size: var(--text-xl);
          font-weight: 700;
          margin-bottom: var(--space-2);
        }

        .config__row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
        }

        .config__full {
          grid-column: 1 / -1;
        }

        .config__token-row {
          display: flex;
          gap: var(--space-2);
          align-items: end;
        }

        .config__token-input {
          flex: 1;
        }

        .config__token-result {
          font-size: var(--text-sm);
          margin-top: var(--space-2);
        }

        .config__template-area {
          width: 100%;
          min-height: 400px;
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          resize: vertical;
        }

        .config__template-actions {
          display: flex;
          justify-content: flex-end;
        }

        .config__saved {
          font-size: var(--text-sm);
          color: var(--accent);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .config__saved--visible {
          opacity: 1;
        }

        .config__color-row {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .config__color-picker {
          width: 40px;
          height: 40px;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 2px;
          cursor: pointer;
          background: none;
        }

        .config__template-help {
          font-size: var(--text-xs);
          color: var(--muted);
          margin-bottom: var(--space-3);
        }
      `}</style>

      <div className="config">
        <nav className="config__nav">
          {SECTIONS.map(s => (
            <button
              key={s.key}
              className={`sidebar-link ${section === s.key ? 'active' : ''}`}
              onClick={() => setSection(s.key)}
            >
              {s.label}
            </button>
          ))}
          <div className={`config__saved ${saved ? 'config__saved--visible' : ''}`}>
            Salvo!
          </div>
        </nav>

        <div className="config__content">
          {/* --- GitHub --- */}
          {section === 'github' && (
            <div className="card">
              <h2 className="config__title">GitHub</h2>
              <div className="config__row">
                <div className="config__full">
                  <Field label="Token de acesso">
                    <div className="config__token-row">
                      <div className="config__token-input">
                        <input
                          className="input"
                          type={showToken ? 'text' : 'password'}
                          value={settings.githubToken}
                          onChange={e => update('githubToken', e.target.value)}
                          placeholder="ghp_..."
                        />
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setShowToken(!showToken)}
                      >
                        {showToken ? 'Ocultar' : 'Mostrar'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={handleValidateToken}
                        disabled={validating || !settings.githubToken}
                      >
                        {validating ? 'Validando...' : 'Validar'}
                      </button>
                    </div>
                    {tokenUser && (
                      <div className="config__token-result">
                        <span className="badge badge-ok">Conectado como {tokenUser}</span>
                      </div>
                    )}
                    {tokenError && (
                      <div className="config__token-result">
                        <span className="badge badge-fail">{tokenError}</span>
                      </div>
                    )}
                  </Field>
                </div>

                <Field label="Owner (usuario ou org)">
                  <input
                    className="input"
                    value={settings.githubOwner}
                    onChange={e => update('githubOwner', e.target.value)}
                    placeholder="seu-usuario"
                  />
                </Field>
                <Field label="Repo de componentes">
                  <input
                    className="input"
                    value={settings.componentsRepo}
                    onChange={e => update('componentsRepo', e.target.value)}
                    placeholder="astro-components"
                  />
                </Field>
                <Field label="Repo base do projeto">
                  <input
                    className="input"
                    value={settings.baseProjectRepo}
                    onChange={e => update('baseProjectRepo', e.target.value)}
                    placeholder="_base-project"
                  />
                </Field>
                <div className="config__full">
                  <Field label="URL do registry.json">
                    <input
                      className="input"
                      value={settings.registryUrl}
                      onChange={e => update('registryUrl', e.target.value)}
                      placeholder="https://raw.githubusercontent.com/..."
                    />
                  </Field>
                </div>
                <div className="config__full">
                  <Field label="Base URL dos previews">
                    <input
                      className="input"
                      value={settings.previewBaseUrl}
                      onChange={e => update('previewBaseUrl', e.target.value)}
                      placeholder="https://seu-usuario.github.io/astro-components"
                    />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* --- Padroes --- */}
          {section === 'defaults' && (
            <div className="card">
              <h2 className="config__title">Padroes</h2>
              <div className="config__row">
                <Field label="Fonte padrao (titulos)">
                  <input
                    className="input"
                    value={settings.defaultFontHeading}
                    onChange={e => update('defaultFontHeading', e.target.value)}
                    placeholder="Inter"
                  />
                </Field>
                <Field label="Fonte padrao (corpo)">
                  <input
                    className="input"
                    value={settings.defaultFontBody}
                    onChange={e => update('defaultFontBody', e.target.value)}
                    placeholder="Inter"
                  />
                </Field>
                <Field label="Cor primaria padrao">
                  <div className="config__color-row">
                    <input
                      type="color"
                      value={settings.defaultColorPrimary}
                      onChange={e => update('defaultColorPrimary', e.target.value)}
                      className="config__color-picker"
                    />
                    <input
                      className="input"
                      value={settings.defaultColorPrimary}
                      onChange={e => update('defaultColorPrimary', e.target.value)}
                      placeholder="#6366f1"
                    />
                  </div>
                </Field>
                <Field label="Label padrao do CTA">
                  <input
                    className="input"
                    value={settings.defaultCtaLabel}
                    onChange={e => update('defaultCtaLabel', e.target.value)}
                    placeholder="Comecar agora"
                  />
                </Field>
              </div>
            </div>
          )}

          {/* --- Template --- */}
          {section === 'template' && (
            <div className="card">
              <h2 className="config__title">Template do Manifesto</h2>
              <p className="config__template-help">
                Use {'{{variavel}}'} para interpolar valores. Variaveis disponiveis: clientName, date,
                projectType, niche, pageGoal, googleAnalyticsId, siteUrl, npmNamespace, repoName,
                colorPrimary, colorSecondary, colorBackground, colorText, fontHeading, fontBody,
                mood, references, notes, components, studioName.
              </p>
              <textarea
                className="input config__template-area"
                value={settings.manifestTemplate}
                onChange={e => update('manifestTemplate', e.target.value)}
              />
              <div className="config__template-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={resetTemplate}>
                  Restaurar Padrao
                </button>
              </div>
            </div>
          )}

          {/* --- Sobre --- */}
          {section === 'about' && (
            <div className="card">
              <h2 className="config__title">Sobre Voce</h2>
              <div className="config__row">
                <Field label="Seu nome">
                  <input
                    className="input"
                    value={settings.yourName}
                    onChange={e => update('yourName', e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </Field>
                <Field label="Nome do estudio">
                  <input
                    className="input"
                    value={settings.studioName}
                    onChange={e => update('studioName', e.target.value)}
                    placeholder="Meu Estudio"
                  />
                </Field>
                <Field label="Namespace npm">
                  <input
                    className="input"
                    value={settings.npmNamespace}
                    onChange={e => update('npmNamespace', e.target.value)}
                    placeholder="@meu-estudio"
                  />
                </Field>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      {children}
    </div>
  )
}
```

---

## 5. Repositório 3 — _base-project (Template)

O repositorio template serve como base para todo projeto gerado pelo Builder. Ele deve ser criado como um repositorio no GitHub e marcado como **Template Repository**.

## 5.1 Estrutura do template

```
_base-project/
├── src/
│   ├── components/          # vazio - componentes serao instalados aqui
│   ├── layouts/
│   │   └── Layout.astro     # layout base
│   ├── pages/
│   │   └── index.astro      # pagina inicial vazia
│   └── styles/
│       └── theme.css         # variaveis CSS vazias (preenchidas pelo manifesto)
├── public/
│   └── favicon.svg
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

## 5.2 Arquivos do template

### `src/pages/index.astro`

```astro
---
import Layout from '../layouts/Layout.astro'
---

<Layout title="Novo Projeto">
  <main>
    <!-- Componentes serao adicionados aqui via Claude Code -->
    <section style="min-height: 100vh; display: flex; align-items: center; justify-content: center;">
      <h1>Projeto pronto para desenvolvimento</h1>
    </section>
  </main>
</Layout>
```

### `src/layouts/Layout.astro`

```astro
---
interface Props {
  title: string
}

const { title } = Astro.props
---

<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="/styles/theme.css" />
  <title>{title}</title>
</head>
<body>
  <slot />
</body>
</html>
```

### `src/styles/theme.css`

```css
:root {
  /* Preenchido pelo manifesto do projeto */
  --color-primary: ;
  --color-secondary: ;
  --color-background: ;
  --color-text: ;
  --font-heading: ;
  --font-body: ;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-body), system-ui, sans-serif;
  background: var(--color-background);
  color: var(--color-text);
  line-height: 1.6;
}
```

### `package.json`

```json
{
  "name": "_base-project",
  "type": "module",
  "version": "0.0.1",
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^4.0.0",
    "minha-lib-astro": "github:SEUUSERNAME/minha-lib-astro#main"
  }
}
```

### `astro.config.mjs`

```javascript
import { defineConfig } from 'astro/config'

export default defineConfig({})
```

### `README.md`

```markdown
# Projeto Cliente

Este projeto foi gerado pelo Astroteca Builder.

## Inicio Rapido

1. Clone o repositorio
2. `npm install`
3. Leia o arquivo `MANIFESTO.md` na raiz
4. Siga as instrucoes do manifesto para instalar componentes e personalizar

## Instrucoes para Claude Code

Ao trabalhar neste projeto com Claude Code:

1. Leia `MANIFESTO.md` primeiro - ele contem todas as decisoes de design e lista de componentes
2. Instale componentes do registro:
   ```bash
   npm install
   # Os componentes ja estao disponiveis via `minha-lib-astro` (instalado em package.json)
   # Importe-os em `src/pages/index.astro` conforme listado no manifesto
   ```
3. Preencha as variaveis CSS em `src/styles/theme.css` com as cores e fontes do manifesto
4. Monte a pagina em `src/pages/index.astro` seguindo a ordem de componentes do manifesto
5. Adapte os textos (copy) de cada componente conforme especificado na seção "Copy / Props"
6. Teste com `npm run dev` e faça build com `npm run build`
```

## 5.3 Marcar como Template Repository

1. No GitHub, acesse **Settings** do repositorio `_base-project`
2. Marque a opcao **Template repository**
3. Isso permite que a API crie novos repos usando este como base

---

## 6. Fluxo de Trabalho Completo

## 6.1 Criando um novo projeto (uso do dia a dia)

1. **Abra o Astroteca** no navegador
2. **Navegue pela Biblioteca** (`/`) para explorar componentes disponiveis
3. **Adicione componentes ao Builder** clicando em "Adicionar ao Builder" nos componentes desejados
4. **Va para o Builder** (`/builder`)
5. **Passo 1 - Configurar:** Preencha os dados do cliente (nome, nicho, objetivo) e direcao de arte (cores, fontes, mood)
6. **Passo 2 - Componentes:** Revise os componentes selecionados, adicione ou remova conforme necessario. A ordem define a posicao na pagina
7. **Passo 3 - Revisar:** Edite os textos (copy) de cada componente, reordene se necessario
8. **Crie o projeto:** Clique em "Criar Projeto no GitHub" - o sistema usa o template `_base-project`, cria o repo, e adiciona o manifesto
9. **Abra no VS Code:** Use o link gerado para clonar direto no editor
10. **Use Claude Code:** Abra o terminal no VS Code, execute Claude Code, e peca para ele ler o `MANIFESTO.md` e montar a pagina. Ele tera todas as instrucoes necessarias

## 6.2 Adicionando um novo componente

1. **Va para Adicionar** (`/admin`)
2. **Preencha os metadados:** Nome (PascalCase), categoria, descricao, tags, melhor para
3. **Defina as props:** Adicione cada prop com nome, tipo, obrigatoriedade, descricao e valor de preview
4. **Cole o codigo Astro:** O codigo completo do componente `.astro`
5. **Revise o preview gerado:** Confira se o codigo de preview e o `index.ts` gerados automaticamente estao corretos
6. **Publique:** Clique em "Publicar Componente" - o sistema envia ao GitHub via API

## 6.3 Atualizando um componente existente

1. **Edite o codigo** diretamente no repositorio `astro-components` no GitHub
2. **Atualize o `index.ts`** se mudou props ou metadados
3. **Faca commit** - o `registry.json` sera atualizado na proxima build (ou atualize manualmente via script)

---

## 7. Deploy e Configuração

## 7.1 Deploy na Vercel

1. Conecte o repositorio do Astroteca na Vercel
2. Configure:
   - **Framework:** Astro
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
3. Adicione a variavel de ambiente `PUBLIC_REGISTRY_URL` com a URL do `registry.json`
4. Deploy

## 7.2 Alternativa local

```bash
npm run dev
```

O Astroteca roda em `http://localhost:4321` para desenvolvimento local.

## 7.3 Checklist final

- [ ] Repositorio `astro-components` criado com pelo menos um componente
- [ ] `registry.json` acessivel via URL publica (GitHub Pages ou raw)
- [ ] Repositorio `_base-project` criado e marcado como Template
- [ ] Token do GitHub configurado com permissoes `repo` e `workflow`
- [ ] Variavel `PUBLIC_REGISTRY_URL` configurada no deploy
- [ ] Teste completo: criar projeto via Builder e verificar repo gerado

---

## 8. Troubleshooting

## 404 ao carregar registry.json

- **Causa:** URL incorreta ou repositorio privado
- **Solucao:** Verifique a URL em Configuracoes. Para repos privados, use a URL da API do GitHub (`https://api.github.com/repos/{owner}/{repo}/contents/registry.json`) em vez do raw. Certifique-se de que o token tem permissao de leitura

## 422 - Repositorio ja existe

- **Causa:** Ja existe um repo com o nome gerado (`client-{clientName}`)
- **Solucao:** Use um nome de cliente diferente ou delete o repo existente no GitHub

## Preview nao carrega

- **Causa:** GitHub Pages nao esta ativado ou o componente nao tem preview
- **Solucao:** Ative GitHub Pages no repositorio de componentes (Settings > Pages > Source: GitHub Actions ou branch `gh-pages`). Verifique se o componente tem um arquivo `preview.astro`

## Componente nao aparece na biblioteca

- **Causa:** O `registry.json` nao foi atualizado apos publicacao
- **Solucao:** Verifique se o `registry.json` na raiz do repo de componentes inclui o novo componente. Se usou a API de publicacao, verifique se o commit foi feito corretamente

## Token sem permissao

- **Causa:** O token nao tem os scopes necessarios
- **Solucao:** Crie um novo Personal Access Token (classic) com os scopes: `repo`, `workflow`. Tokens fine-grained precisam de permissao de leitura/escrita em Contents e Administration

## Erro ao criar projeto: "Not Found"

- **Causa:** O repo template (`_base-project`) nao existe ou nao esta marcado como Template
- **Solucao:** Verifique se o repo existe sob o owner configurado e se esta marcado como Template Repository nas configuracoes do repo

## Manifesto gerado com variaveis vazias

- **Causa:** Template customizado com variaveis incorretas
- **Solucao:** Use `{{nomeVariavel}}` (duas chaves) para interpolar. Clique em "Restaurar Padrao" em Configuracoes > Template para voltar ao template original

---

*Documento unificado - Versao 2.0.0*
