# Biblioteca de Componentes Astro — Guia Completo de Implementação

> Documento unificado para implementação do ecossistema completo de criação de landing pages profissionais com componentes reutilizáveis, biblioteca visual, builder interativo, painel admin, gerador de manifesto e automação via GitHub API.
> 
> **Stack:** Astro SSR + React Islands + CSS puro com design tokens
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
│   ├── styles/
│   │   └── base.css
│   └── index.ts
├── registry.json                 ← CATÁLOGO DE COMPONENTES
├── package.json
└── tsconfig.json
```

### 3.3 package.json

```json
{
  "name": "@seuusuario/minha-lib-astro",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./styles": "./src/styles/base.css"
  },
  "peerDependencies": {
    "astro": "^4.0.0"
  },
  "devDependencies": {
    "astro": "^4.0.0",
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

<section class="hero hero--split">
  <div class="hero__content">
    <h1 class="hero__headline">{headline}</h1>
    {subheadline && <p class="hero__subheadline">{subheadline}</p>}
    <a href={ctaHref} class="btn btn--primary">{ctaLabel}</a>
  </div>

  {imageSrc && (
    <div class="hero__image-wrapper">
      <img src={imageSrc} alt="" class="hero__image" loading="eager" />
    </div>
  )}
</section>

<style>
  .hero--split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-xl, 4rem);
    align-items: center;
    padding: var(--space-2xl, 6rem) var(--container-padding, 1.5rem);
    max-width: var(--container-max, 1200px);
    margin: 0 auto;
  }

  .hero__headline {
    font-family: var(--font-heading, serif);
    font-size: clamp(2rem, 5vw, 3.5rem);
    color: var(--color-heading, #111);
    line-height: 1.1;
    margin-bottom: 1rem;
  }

  .hero__subheadline {
    font-size: 1.125rem;
    color: var(--color-text-muted, #555);
    margin-bottom: 2rem;
    line-height: 1.6;
  }

  .btn--primary {
    display: inline-block;
    background: var(--color-primary, #333);
    color: var(--color-on-primary, #fff);
    padding: 0.875rem 2rem;
    border-radius: var(--radius, 6px);
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.2s;
  }

  .btn--primary:hover {
    opacity: 0.88;
  }

  .hero__image {
    width: 100%;
    height: auto;
    border-radius: var(--radius-lg, 12px);
    object-fit: cover;
  }

  @media (max-width: 768px) {
    .hero--split {
      grid-template-columns: 1fr;
    }
  }
</style>
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

    <!-- Estilos base da lib -->
    <link rel="stylesheet" href="/styles/theme.css" />
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
import vercel from '@astrojs/vercel/serverless'

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [react()],
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
    "@astrojs/vercel": "^7.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
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

### 4.5 Design System (app.css)

Este é o design system completo da aplicação. Sem Tailwind — CSS puro com design tokens.

```css
/* src/styles/app.css */

@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

/* ─── Design Tokens ──────────────────────────────────────────────────────── */
:root {
  --bg:            #080810;
  --surface:       #0f0f1c;
  --raised:        #161625;
  --hover:         #1c1c2e;
  --border:        #1f1f35;
  --border-subtle: #141428;

  --ink-primary:   #ededf5;
  --ink-secondary: #6b6b85;
  --ink-muted:     #35354a;

  --accent:        #f0a500;
  --accent-dim:    rgba(240,165,0,0.10);
  --accent-hover:  #fbbf24;

  --ok:   #22c55e;
  --fail: #ef4444;
  --warn: #f59e0b;

  --sidebar-w: 220px;
  --radius:    10px;
  --radius-sm: 6px;
  --radius-lg: 14px;
}

/* ─── Reset & Base ───────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { font-size: 16px; -webkit-font-smoothing: antialiased; }

body {
  background: var(--bg);
  color: var(--ink-primary);
  font-family: 'DM Sans', system-ui, sans-serif;
  min-height: 100vh;
  /* Grain texture */
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
}

a { color: inherit; text-decoration: none; }
img { display: block; max-width: 100%; }
button { font-family: inherit; }

/* ─── Scrollbar ──────────────────────────────────────────────────────────── */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
::-webkit-scrollbar-thumb:hover { background: var(--ink-muted); }

/* ─── Typography ─────────────────────────────────────────────────────────── */
h1, h2, h3, h4, h5, h6 {
  font-family: 'Syne', system-ui, sans-serif;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--ink-primary);
}

code, kbd, pre, .mono {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875em;
}

/* ─── Layout Shell ───────────────────────────────────────────────────────── */
.app-shell {
  display: grid;
  grid-template-columns: var(--sidebar-w) 1fr;
  min-height: 100vh;
}

.app-sidebar {
  grid-column: 1;
  grid-row: 1;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  background: var(--surface);
  border-right: 1px solid var(--border);
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.app-main {
  grid-column: 2;
  grid-row: 1;
  overflow-y: auto;
  height: 100vh;
  padding: 32px;
}

/* ─── Cards ──────────────────────────────────────────────────────────────── */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}

.card-interactive:hover {
  border-color: rgba(240,165,0,0.3);
  box-shadow: 0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(240,165,0,0.15);
  transform: translateY(-1px);
  cursor: pointer;
}

.card-selected {
  border-color: var(--accent) !important;
  box-shadow: 0 0 0 1px var(--accent), 0 4px 20px rgba(240,165,0,0.1) !important;
}

/* ─── Buttons ────────────────────────────────────────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  text-decoration: none;
}

.btn:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-primary {
  background: var(--accent);
  color: #000;
}
.btn-primary:hover:not(:disabled) { background: var(--accent-hover); }

.btn-outline {
  background: transparent;
  color: var(--ink-primary);
  border: 1px solid var(--border);
}
.btn-outline:hover:not(:disabled) {
  background: var(--raised);
  border-color: var(--ink-muted);
}

.btn-ghost {
  background: transparent;
  color: var(--ink-secondary);
}
.btn-ghost:hover:not(:disabled) {
  background: var(--raised);
  color: var(--ink-primary);
}

.btn-danger {
  background: rgba(239,68,68,0.1);
  color: var(--fail);
  border: 1px solid rgba(239,68,68,0.2);
}
.btn-danger:hover:not(:disabled) { background: rgba(239,68,68,0.2); }

.btn-sm { padding: 5px 10px; font-size: 12px; }
.btn-lg { padding: 11px 22px; font-size: 15px; }
.btn-icon { padding: 7px; aspect-ratio: 1; }

/* ─── Form Controls ──────────────────────────────────────────────────────── */
.input {
  background: var(--raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--ink-primary);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  padding: 8px 12px;
  width: 100%;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.input::placeholder { color: var(--ink-muted); }
.input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-dim);
}
.input:disabled { opacity: 0.5; cursor: not-allowed; }

textarea.input {
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
}

select.input {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b6b85' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 30px;
}

.label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-secondary);
  margin-bottom: 6px;
}

.field { display: flex; flex-direction: column; gap: 4px; }

/* ─── Badge ──────────────────────────────────────────────────────────────── */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  font-family: 'DM Sans', sans-serif;
}

.badge-default { background: var(--raised); color: var(--ink-secondary); border: 1px solid var(--border); }
.badge-accent  { background: var(--accent-dim); color: var(--accent); border: 1px solid rgba(240,165,0,0.2); }
.badge-ok      { background: rgba(34,197,94,0.1); color: var(--ok); border: 1px solid rgba(34,197,94,0.2); }
.badge-fail    { background: rgba(239,68,68,0.1); color: var(--fail); border: 1px solid rgba(239,68,68,0.2); }

/* ─── Sidebar ────────────────────────────────────────────────────────────── */
.sidebar-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  margin: 0 8px;
  border-radius: var(--radius-sm);
  color: var(--ink-secondary);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.15s;
  cursor: pointer;
  border: none;
  background: none;
  width: calc(100% - 16px);
}
.sidebar-link:hover { background: var(--raised); color: var(--ink-primary); }
.sidebar-link.active {
  background: var(--accent-dim);
  color: var(--accent);
  border: 1px solid rgba(240,165,0,0.15);
}
.sidebar-link.active svg { color: var(--accent); }

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--surface) 0%,
    var(--raised) 50%,
    var(--surface) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.8s infinite linear;
  border-radius: var(--radius-sm);
}

@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position:  200% 0; }
}

/* ─── Stagger Animation ─────────────────────────────────────────────────── */
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

@keyframes fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ─── Code Preview ───────────────────────────────────────────────────────── */
.code-block {
  background: #050509;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius);
  padding: 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  line-height: 1.7;
  color: #9d9dbf;
  overflow-x: auto;
  white-space: pre;
}

/* ─── Drag Handle ────────────────────────────────────────────────────────── */
.drag-handle {
  cursor: grab;
  color: var(--ink-muted);
  transition: color 0.15s;
}
.drag-handle:hover { color: var(--ink-secondary); }
.drag-handle:active { cursor: grabbing; }

/* ─── Divider ────────────────────────────────────────────────────────────── */
.divider {
  height: 1px;
  background: var(--border);
  margin: 0;
}

/* ─── Tabs ───────────────────────────────────────────────────────────────── */
.tab-bar {
  display: flex;
  gap: 2px;
  padding: 3px;
  background: var(--raised);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

.tab {
  flex: 1;
  padding: 6px 12px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: transparent;
  color: var(--ink-secondary);
  transition: all 0.15s;
  font-family: 'DM Sans', sans-serif;
}
.tab:hover { color: var(--ink-primary); }
.tab.active {
  background: var(--surface);
  color: var(--ink-primary);
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

/* ─── Empty State ────────────────────────────────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 24px;
  color: var(--ink-muted);
  text-align: center;
}
.empty-state svg { opacity: 0.3; }
.empty-state p { font-size: 13px; max-width: 240px; line-height: 1.6; }

/* ─── Color Swatch ───────────────────────────────────────────────────────── */
.color-swatch {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.1);
  cursor: pointer;
  flex-shrink: 0;
}

/* ─── Section Title ──────────────────────────────────────────────────────── */
.section-title {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-muted);
  padding: 0 12px;
  margin-bottom: 4px;
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

> **Nota:** Sem `cn()`, sem `clsx`, sem `tailwind-merge`. Usamos classes CSS diretas do design system.

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
    <aside class="app-nav">
      <div class="app-nav__header">
        <span class="app-nav__logo">Astroteca</span>
      </div>

      <nav class="app-nav__links">
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

      <div class="app-nav__footer">
        <span class="badge badge-default">v2.0.0</span>
      </div>
    </aside>

    <main class="app-main">
      <slot />
    </main>
  </div>

  <style>
    .app-nav {
      display: flex;
      flex-direction: column;
      background: var(--surface-1);
      border-right: 1px solid var(--border);
      padding: var(--space-4) 0;
      height: 100vh;
      position: sticky;
      top: 0;
    }

    .app-nav__header {
      padding: 0 var(--space-4) var(--space-4);
      border-bottom: 1px solid var(--border);
      margin-bottom: var(--space-2);
    }

    .app-nav__logo {
      font-size: var(--text-lg);
      font-weight: 700;
      color: var(--accent);
      letter-spacing: -0.02em;
    }

    .app-nav__links {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      padding: var(--space-2) var(--space-2);
      flex: 1;
    }

    .app-nav__footer {
      padding: var(--space-3) var(--space-4) 0;
      border-top: 1px solid var(--border);
      text-align: center;
    }

    .app-main {
      padding: var(--space-6);
      overflow-y: auto;
      height: 100vh;
    }
  </style>
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
      <style>{`
        .browser {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-6);
          height: calc(100vh - var(--space-6) * 2);
        }

        .browser__left {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          overflow: hidden;
        }

        .browser__filters {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .browser__categories {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-1);
        }

        .browser__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: var(--space-3);
          overflow-y: auto;
          flex: 1;
          padding-right: var(--space-2);
        }

        .browser__card-title {
          font-weight: 600;
          font-size: var(--text-sm);
          margin-bottom: var(--space-1);
        }

        .browser__card-desc {
          font-size: var(--text-xs);
          color: var(--muted);
          margin-bottom: var(--space-2);
        }

        .browser__card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-1);
        }

        .browser__right {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          overflow-y: auto;
        }

        .browser__preview {
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          background: var(--surface-2);
          min-height: 300px;
        }

        .browser__preview iframe {
          width: 100%;
          height: 300px;
          border: none;
        }

        .browser__detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--space-3);
        }

        .browser__detail-title {
          font-size: var(--text-xl);
          font-weight: 700;
        }

        .browser__props-table {
          width: 100%;
          border-collapse: collapse;
          font-size: var(--text-sm);
        }

        .browser__props-table th,
        .browser__props-table td {
          text-align: left;
          padding: var(--space-2) var(--space-3);
          border-bottom: 1px solid var(--border);
        }

        .browser__props-table th {
          color: var(--muted);
          font-weight: 500;
          text-transform: uppercase;
          font-size: var(--text-xs);
        }

        .browser__screenshot {
          width: 100%;
          height: 120px;
          object-fit: cover;
          border-radius: var(--radius) var(--radius) 0 0;
        }

        .browser__card-inner {
          padding: var(--space-3);
        }
      `}</style>

      <div className="browser">
        <div className="browser__left">
          <div className="browser__filters">
            <input
              type="text"
              className="input"
              placeholder="Buscar componentes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="browser__categories">
              <button
                className={`btn btn-sm ${!activeCategory ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveCategory(null)}
              >
                Todos
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="empty-state">Carregando componentes...</div>
          )}

          {error && (
            <div className="empty-state">{error}</div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="empty-state">
              Nenhum componente encontrado.
            </div>
          )}

          <div className="browser__grid">
            {filtered.map(c => (
              <div
                key={c.id}
                className={`card card-interactive ${selectedId === c.id ? 'card-selected' : ''}`}
                onClick={() => setSelectedId(c.id)}
              >
                {c.screenshot && (
                  <img
                    src={c.screenshot}
                    alt={c.name}
                    className="browser__screenshot"
                  />
                )}
                <div className="browser__card-inner">
                  <div className="browser__card-title">{c.name}</div>
                  <div className="browser__card-desc">{c.description}</div>
                  <div className="browser__card-tags">
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

        <div className="browser__right">
          {!selected ? (
            <div className="empty-state">
              Selecione um componente para ver detalhes.
            </div>
          ) : (
            <>
              <div className="browser__preview">
                {selected.screenshot ? (
                  <img
                    src={selected.screenshot}
                    alt={selected.name}
                    className="browser__screenshot"
                  />
                ) : (
                  <div className="empty-state">Sem preview disponivel</div>
                )}
              </div>

              <div className="card">
                <div className="browser__detail-header">
                  <div>
                    <div className="browser__detail-title">{selected.name}</div>
                    <p className="browser__card-desc">{selected.description}</p>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => addToBuilder(selected)}
                  >
                    Adicionar ao Builder
                  </button>
                </div>

                <div className="browser__card-tags">
                  <span className="badge badge-accent">{selected.category}</span>
                  {selected.tags.map(t => (
                    <span key={t} className="badge badge-default">{t}</span>
                  ))}
                </div>

                <p className="label">Melhor para</p>
                <p>{selected.bestFor}</p>

                {selected.props.length > 0 && (
                  <>
                    <p className="label">Props</p>
                    <table className="browser__props-table">
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>Tipo</th>
                          <th>Obrigatoria</th>
                          <th>Descricao</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.props.map(p => (
                          <tr key={p.name}>
                            <td><code>{p.name}</code></td>
                            <td><code>{p.type}</code></td>
                            <td>{p.required ? 'Sim' : 'Nao'}</td>
                            <td>{p.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}

                {selected.copy && Object.keys(selected.copy).length > 0 && (
                  <>
                    <p className="label">Copy editavel</p>
                    <table className="browser__props-table">
                      <thead>
                        <tr>
                          <th>Chave</th>
                          <th>Valor padrao</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(selected.copy).map(([k, v]) => (
                          <tr key={k}>
                            <td><code>{k}</code></td>
                            <td>{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
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
      <>
        <style>{`
          .builder__result {
            max-width: 600px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: var(--space-4);
            padding-top: var(--space-8);
          }
          .builder__result-title {
            font-size: var(--text-2xl);
            font-weight: 700;
            color: var(--accent);
          }
          .builder__result-links {
            display: flex;
            flex-direction: column;
            gap: var(--space-2);
          }
        `}</style>
        <div className="builder__result">
          <div className="builder__result-title">Projeto criado com sucesso!</div>
          <div className="card">
            <Pair label="Repositorio" value={result.repoUrl} />
            <div className="builder__result-links">
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
      </>
    )
  }

  /* --- Main render --- */

  return (
    <>
      <style>{`
        .builder {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: var(--space-6);
          min-height: calc(100vh - var(--space-6) * 2);
        }

        .builder__content {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .builder__aside {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .builder__form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
        }

        .builder__form-full {
          grid-column: 1 / -1;
        }

        .builder__color-row {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .builder__color-picker {
          width: 40px;
          height: 40px;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 2px;
          cursor: pointer;
          background: none;
        }

        .builder__comp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: var(--space-3);
        }

        .builder__comp-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-1);
        }

        .builder__comp-card-name {
          font-weight: 600;
          font-size: var(--text-sm);
        }

        .builder__comp-card-desc {
          font-size: var(--text-xs);
          color: var(--muted);
        }

        .builder__review-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3);
          border-bottom: 1px solid var(--border);
        }

        .builder__review-item:last-child {
          border-bottom: none;
        }

        .builder__review-position {
          font-weight: 700;
          color: var(--accent);
          min-width: 24px;
          text-align: center;
        }

        .builder__review-info {
          flex: 1;
        }

        .builder__review-actions {
          display: flex;
          gap: var(--space-1);
        }

        .builder__copy-section {
          padding: var(--space-3);
          border-top: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .builder__copy-toggle {
          cursor: pointer;
          color: var(--accent);
          font-size: var(--text-sm);
          font-weight: 500;
          background: none;
          border: none;
          text-align: left;
          padding: 0;
        }

        .builder__copy-field {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .builder__copy-field label {
          font-size: var(--text-xs);
          color: var(--muted);
          font-weight: 500;
        }

        .builder__copy-field textarea {
          min-height: 60px;
          resize: vertical;
        }

        .builder__pair {
          display: flex;
          justify-content: space-between;
          padding: var(--space-1) 0;
          font-size: var(--text-sm);
          border-bottom: 1px solid var(--border);
        }

        .builder__pair-label {
          color: var(--muted);
        }

        .builder__pair-value {
          font-weight: 500;
        }

        .builder__error {
          color: var(--danger);
          padding: var(--space-3);
          border: 1px solid var(--danger);
          border-radius: var(--radius);
          font-size: var(--text-sm);
        }

        .builder__aside-section {
          padding: var(--space-3);
        }

        .builder__aside-title {
          font-size: var(--text-sm);
          font-weight: 600;
          margin-bottom: var(--space-2);
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .builder__aside-component {
          font-size: var(--text-sm);
          padding: var(--space-1) 0;
          display: flex;
          gap: var(--space-2);
          align-items: center;
        }

        .builder__actions {
          display: flex;
          gap: var(--space-3);
          padding-top: var(--space-4);
          border-top: 1px solid var(--border);
        }

        .builder__comp-card-category {
          margin-top: var(--space-2);
        }

        .builder__aside-colors {
          display: flex;
          gap: var(--space-2);
          flex-wrap: wrap;
        }

        .builder__aside-swatch {
          width: 32px;
          height: 32px;
          border-radius: var(--radius);
          border: 1px solid var(--border);
        }
      `}</style>

      <div className="builder">
        <div className="builder__content">
          {/* Tab navigation */}
          <div className="tab-bar">
            {STEPS.map((s, i) => (
              <button
                key={s}
                className={`tab ${step === s ? 'active' : ''}`}
                onClick={() => setStep(s)}
              >
                {i + 1}. {s}
              </button>
            ))}
          </div>

          {/* --- Step 1: Configurar --- */}
          {step === 'Configurar' && (
            <div className="card">
              <h2 className="section-title">Dados do Projeto</h2>
              <div className="builder__form-grid">
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
              <div className="builder__form-grid">
                <ColorSwatch
                  label="Cor Primaria"
                  value={art.colorPrimary}
                  onChange={v => updateArt('colorPrimary', v)}
                />
                <ColorSwatch
                  label="Cor Secundaria"
                  value={art.colorSecondary}
                  onChange={v => updateArt('colorSecondary', v)}
                />
                <ColorSwatch
                  label="Cor de Fundo"
                  value={art.colorBackground}
                  onChange={v => updateArt('colorBackground', v)}
                />
                <ColorSwatch
                  label="Cor do Texto"
                  value={art.colorText}
                  onChange={v => updateArt('colorText', v)}
                />
                <Field label="Fonte dos titulos">
                  <input
                    className="input"
                    value={art.fontHeading}
                    onChange={e => updateArt('fontHeading', e.target.value)}
                    placeholder="Inter"
                  />
                </Field>
                <Field label="Fonte do corpo">
                  <input
                    className="input"
                    value={art.fontBody}
                    onChange={e => updateArt('fontBody', e.target.value)}
                    placeholder="Inter"
                  />
                </Field>
                <div className="builder__form-full">
                  <Field label="Mood / Tom">
                    <input
                      className="input"
                      value={art.mood}
                      onChange={e => updateArt('mood', e.target.value)}
                      placeholder="ex: profissional, acolhedor, moderno"
                    />
                  </Field>
                </div>
                <div className="builder__form-full">
                  <Field label="Referencias visuais">
                    <textarea
                      className="input"
                      value={art.references}
                      onChange={e => updateArt('references', e.target.value)}
                      placeholder="Links ou descricao de referencias"
                      rows={3}
                    />
                  </Field>
                </div>
                <div className="builder__form-full">
                  <Field label="Observacoes">
                    <textarea
                      className="input"
                      value={art.notes}
                      onChange={e => updateArt('notes', e.target.value)}
                      placeholder="Qualquer nota adicional sobre o projeto"
                      rows={3}
                    />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* --- Step 2: Componentes --- */}
          {step === 'Componentes' && (
            <div>
              <div className="builder__form-grid">
                <input
                  className="input"
                  placeholder="Buscar componentes..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <div className="browser__categories">
                  <button
                    className={`btn btn-sm ${!filterCategory ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setFilterCategory(null)}
                  >
                    Todos
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      className={`btn btn-sm ${filterCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setFilterCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {filteredComponents.length === 0 ? (
                <div className="empty-state">Nenhum componente encontrado.</div>
              ) : (
                <div className="builder__comp-grid">
                  {filteredComponents.map(c => {
                    const sel = isSelected(c.id)
                    const pos = getPosition(c.id)
                    return (
                      <div
                        key={c.id}
                        className={`card card-interactive ${sel ? 'card-selected' : ''}`}
                        onClick={() => toggleComponent(c)}
                      >
                        <div className="builder__comp-card-header">
                          <span className="builder__comp-card-name">{c.name}</span>
                          {pos !== null && <span className="badge badge-accent">{pos}</span>}
                        </div>
                        <div className="builder__comp-card-desc">{c.description}</div>
                        <div className="builder__comp-card-category">
                          <span className="badge badge-default">{c.category}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* --- Step 3: Revisar --- */}
          {step === 'Revisar' && (
            <div>
              {/* Project summary */}
              <div className="card">
                <h2 className="section-title">Resumo do Projeto</h2>
                <div className="builder__form-grid">
                  <Pair label="Cliente" value={project.clientName} />
                  <Pair label="Tipo" value={project.projectType} />
                  <Pair label="Nicho" value={project.niche} />
                  <Pair label="Objetivo" value={project.pageGoal} />
                  <Pair label="URL" value={project.siteUrl} />
                  <Pair label="GA ID" value={project.googleAnalyticsId} />
                </div>
              </div>

              {/* Components list */}
              <div className="card">
                <h2 className="section-title">Componentes ({selected.length})</h2>
                {selected.length === 0 ? (
                  <div className="empty-state">Nenhum componente selecionado.</div>
                ) : (
                  selected.map((sc, index) => (
                    <div key={sc.meta.id}>
                      <div className="builder__review-item">
                        <span className="builder__review-position">{sc.position}</span>
                        <div className="builder__review-info">
                          <strong>{sc.meta.name}</strong>
                          <div className="builder__comp-card-desc">{sc.meta.description}</div>
                        </div>
                        <div className="builder__review-actions">
                          <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={() => moveComponent(index, 'up')}
                            disabled={index === 0}
                          >
                            ^
                          </button>
                          <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={() => moveComponent(index, 'down')}
                            disabled={index === selected.length - 1}
                          >
                            v
                          </button>
                          <button
                            className="btn btn-danger btn-sm btn-icon"
                            onClick={() => removeComponent(sc.meta.id)}
                          >
                            x
                          </button>
                        </div>
                      </div>

                      {/* Copy editing */}
                      {sc.meta.copy && Object.keys(sc.meta.copy).length > 0 && (
                        <div className="builder__copy-section">
                          <button
                            className="builder__copy-toggle"
                            onClick={() => toggleCopyExpand(sc.meta.id)}
                          >
                            {expandedCopy[sc.meta.id] ? 'v' : '>'} Editar textos (
                            {Object.keys(sc.meta.copy).length} campos)
                          </button>
                          {expandedCopy[sc.meta.id] && (
                            <div>
                              {Object.entries(copyEdits[sc.meta.id] || sc.meta.copy).map(
                                ([key, value]) => (
                                  <div key={key} className="builder__copy-field">
                                    <label>{key}</label>
                                    <textarea
                                      className="input"
                                      value={value}
                                      onChange={e => updateCopy(sc.meta.id, key, e.target.value)}
                                      rows={2}
                                    />
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Actions */}
              {error && <div className="builder__error">{error}</div>}

              <div className="builder__actions">
                <button className="btn btn-outline" onClick={downloadManifest}>
                  Baixar Manifesto (.md)
                </button>
                <button
                  className="btn btn-primary"
                  onClick={createProject}
                  disabled={creating || !project.clientName}
                >
                  {creating ? 'Criando...' : 'Criar Projeto no GitHub'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- Right Sidebar --- */}
        <div className="builder__aside">
          <div className="card">
            <div className="builder__aside-section">
              <div className="builder__aside-title">Cliente</div>
              <div>{project.clientName || '(nao definido)'}</div>
              <div className="builder__comp-card-desc">
                {project.projectType} - {project.niche || '-'}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="builder__aside-section">
              <div className="builder__aside-title">Estrutura da Pagina</div>
              {selected.length === 0 ? (
                <div className="builder__comp-card-desc">Nenhum componente adicionado</div>
              ) : (
                selected.map(sc => (
                  <div key={sc.meta.id} className="builder__aside-component">
                    <span className="badge badge-accent">{sc.position}</span>
                    <span>{sc.meta.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <div className="builder__aside-section">
              <div className="builder__aside-title">Cores</div>
              <div className="builder__aside-colors">
                <div className="builder__aside-swatch" style={{ background: art.colorPrimary }} title="Primaria" />
                <div className="builder__aside-swatch" style={{ background: art.colorSecondary }} title="Secundaria" />
                <div className="builder__aside-swatch" style={{ background: art.colorBackground }} title="Fundo" />
                <div className="builder__aside-swatch" style={{ background: art.colorText }} title="Texto" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="builder__aside-section">
              <div className="builder__aside-title">Tipografia</div>
              <Pair label="Titulos" value={art.fontHeading} />
              <Pair label="Corpo" value={art.fontBody} />
            </div>
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
