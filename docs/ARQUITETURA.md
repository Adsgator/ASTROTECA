# Arquitetura do Projeto Astroteca

**Versão:** 2.0  
**Data:** 2026-05-26  
**Status:** Production-Ready

---

## 📋 Visão Geral

**Astroteca** é um **Component Studio** — uma plataforma para criar, gerenciar e distribuir componentes Astro reutilizáveis para landing pages e websites premium.

### Stack Tecnológico
- **Frontend:** Astro 4 + React 18 (componentes interativos)
- **Estilo:** Tailwind CSS 3.4 + Custom CSS variables
- **Deploy:** Vercel Serverless Functions
- **Controle de versão:** GitHub API
- **Linguagem:** TypeScript + JSX/TSX

---

## 🏗️ Estrutura de Pastas

```
src/
├── components/           # Componentes React interativos
│   ├── AdminForm.tsx     # Formulário para adicionar componentes
│   ├── Builder.tsx       # Wizard 3-step para criar projetos
│   ├── ComponentBrowser.tsx  # Grid com filtros de componentes
│   └── ConfigPanel.tsx   # Painel de configurações do GitHub
│
├── layouts/              # Layouts Astro reutilizáveis
│   └── AppLayout.astro   # Shell principal (sidebar + main)
│
├── pages/                # Rotas do Astro
│   ├── index.astro       # "/" → ComponentBrowser
│   ├── builder.astro     # "/builder" → Builder
│   ├── admin.astro       # "/admin" → AdminForm
│   ├── config.astro      # "/config" → ConfigPanel
│   ├── api/
│   │   ├── publish-component.ts  # POST para publicar componentes
│   │   └── create-project.ts     # POST para criar projeto
│   └── preview/
│       └── [...slug].astro       # Preview dinâmico de componentes
│
├── lib/                  # Funções utilitárias
│   ├── github.ts         # API GitHub (fetch, publish, create repo)
│   ├── manifest.ts       # Gerador de manifesto MANIFESTO.md
│   └── utils.ts          # Helpers (cn, slugify, generateId, etc)
│
├── styles/               # Estilo
│   ├── app.css           # Design tokens + componentes CSS
│   └── ui.ts             # Constantes Tailwind reutilizáveis
│
├── types/                # Definições TypeScript
│   └── index.ts          # Types para todo o projeto
│
└── env.d.ts              # Tipos para variáveis de ambiente
```

---

## 📝 Tipos Principais

### `ComponentMeta`
Metadados de um componente reutilizável:
```typescript
{
  id: string              // "hero-split"
  name: string            // "Hero Split"
  category: ComponentCategory  // "Hero", "Features", etc
  description: string
  previewUrl?: string     // URL para preview
  screenshotUrl?: string
  codeUrl?: string
  tags: string[]
  bestFor: string[]       // Casos de uso
  props: PropDefinition[] // Propriedades esperadas
  copy?: Record<string, string>  // Textos editáveis
  createdAt: string
  updatedAt: string
}
```

### `ProjectConfig`
Dados de um projeto sendo criado:
```typescript
{
  clientName: string      // Nome do cliente
  projectType: string     // "landing-page", "site-institucional", etc
  niche: string           // "saude", "tech", "educacao"
  pageGoal: string        // "captar leads", "vender produto"
  siteUrl: string         // URL final do site
  googleAnalyticsId: string
}
```

### `ArtDirection`
Direção de arte e design:
```typescript
{
  colorPrimary: string    // "#6366f1"
  colorSecondary: string
  colorBackground: string
  colorText: string
  fontHeading: string     // "Inter", "Syne"
  fontBody: string
  mood: string            // "profissional", "acolhedor"
  references: string      // Links ou descrição de refs visuais
  notes: string           // Observações gerais
}
```

### `AppSettings`
Configurações salvas no localStorage:
```typescript
{
  githubToken: string          // PAT do GitHub
  githubOwner: string          // Usuário ou org
  componentsRepo: string       // Repo com componentes
  baseProjectRepo: string      // Repo template (_base-project)
  registryUrl: string          // URL do registry.json
  studioName: string           // Nome do studio
  manifestTemplate: string     // Template customizado
  defaultFontHeading: string
  defaultFontBody: string
  defaultColorPrimary: string
  npmNamespace: string         // "@astroteca"
  userName: string             // Para commits
  userEmail: string
}
```

---

## 🔄 Fluxos Principais

### 1️⃣ Fluxo: Navegar pela Biblioteca de Componentes

**Rota:** `/` → `index.astro` → `ComponentBrowser`

```
ComponentBrowser (React)
├── Estado: componentes[], search, activeCategory, selectedId
├── Efeito: Carrega fallback se não tiver registry
├── Lado esquerdo:
│   ├── Filtro por texto
│   ├── Botões por categoria
│   └── Grid de cards
└── Lado direito:
    ├── Preview em iframe
    └── Painel de detalhes (props, copy, tags)
```

**localStorage usado:**
- `acs-builder-components` → Componentes selecionados para Builder

---

### 2️⃣ Fluxo: Criar um Novo Projeto

**Rota:** `/builder` → `builder.astro` → `Builder`

**Passo 1: Configurar**
```
Inputs:
- Nome do cliente
- Tipo (landing-page, site-institucional, etc)
- Nicho, objetivo, URL, GA ID
- Cores (primary, secondary, background, text)
- Fontes (heading, body)
- Mood, referencias, notas
```

**Passo 2: Selecionar Componentes**
```
- Grid filtrado de componentes
- Click para toggle seleção
- Mostra posição ao lado
- Salva em localStorage "acs-builder-components"
```

**Passo 3: Revisar**
```
- Resumo do projeto
- Lista de componentes com reordenação (↑/↓)
- Editor de copy inline por componente
- Botões:
  - Baixar MANIFESTO.md
  - Criar Projeto no GitHub
```

**Resultado:**
```
POST /api/create-project
└── Cria novo repo a partir de template
└── Aguarda 3.5s
└── Faz commit do MANIFESTO.md
└── Retorna: repoUrl, cloneUrl, vscodeUrl
```

**localStorage usado:**
- `acs-settings` → AppSettings
- `acs-builder-components` → Componentes selecionados

---

### 3️⃣ Fluxo: Publicar um Novo Componente

**Rota:** `/admin` → `admin.astro` → `AdminForm`

**Inputs:**
```
1. Informações básicas
   - Nome (PascalCase) → gera ID
   - Categoria
   - Descrição
   - Tags
   - Melhor para

2. Props (dinâmicas)
   - Nome, tipo, obrigatório, descrição, preview

3. Código Astro
   - Colar .astro completo

4. Preview gerado
   - Mostra código de preview auto-gerado
   - Mostra index.ts auto-gerado
```

**Envio:**
```
POST /api/publish-component
├── Busca registry atual
├── Cria/atualiza 3 arquivos no GitHub:
│   ├── components/ComponentName/ComponentName.astro
│   ├── components/ComponentName/ComponentName.preview.astro
│   └── components/ComponentName/index.ts
└── Atualiza registry.json com nova entry
```

**localStorage usado:**
- `acs-settings` → Pega token e URLs do GitHub

---

### 4️⃣ Fluxo: Configurar GitHub e Padrões

**Rota:** `/config` → `config.astro` → `ConfigPanel`

**Seções:**
```
1. GitHub
   - Token (password input)
   - Owner/org
   - Repos (componentes, base template)
   - URL do Registry

2. Padrões
   - Fonte padrão (heading, body)
   - Cor primária padrão

3. Studio
   - Nome do studio
   - Namespace npm

4. Usuário Git
   - Nome e email (para commits)

5. Template do Manifesto
   - Textarea com template customizável
```

**Persistência:**
```
localStorage.setItem('acs-settings', JSON.stringify(settings))
```

---

## 🎨 Design System

### Design Tokens (CSS Variables)

```css
/* Cores */
--bg:            #06060e      (fundo principal)
--surface:       #0c0c1a      (cards)
--raised:        #131325      (hover states)
--hover:         #1a1a30
--border:        #1e1e38
--border-subtle: #141428

--ink-primary:   #ededf5      (texto principal)
--ink-secondary: #7a7a95      (texto secondary)
--ink-muted:     #3a3a52      (texto disabled)

--accent:        #f0a500      (botões, highlights)
--accent-dim:    rgba(..., 0.08)
--accent-hover:  #fbbf24
--accent-glow:   rgba(..., 0.15)

--ok:   #22c55e   (sucesso)
--fail: #ef4444   (erro)
--warn: #f59e0b   (aviso)

/* Layout */
--sidebar-w:     240px
--radius:        12px
--radius-sm:     8px
--radius-lg:     16px

/* Sombras */
--shadow-sm:  0 1px 2px rgba(0,0,0,0.3), ...
--shadow-md:  0 4px 12px rgba(0,0,0,0.4), ...
--shadow-lg:  0 8px 30px rgba(0,0,0,0.5), ...
--shadow-glow: 0 0 20px var(--accent-glow), ...
```

### Componentes CSS Reutilizáveis

**Botões:**
- `.btn-primary` → Accent + gradient + glow
- `.btn-outline` → Border + hover lift
- `.btn-ghost` → Transparent, low contrast
- `.btn-danger` → Red theme
- `.btn-sm`, `.btn-lg`, `.btn-icon` → Tamanhos

**Cards:**
- `.card` → Base com border e shadow
- `.card-interactive` → Hover lift + glow
- `.card-selected` → Accent border + glow ring

**Inputs:**
- `.input` → Styled com focus glow
- `.label` → Uppercase, small, secondary color
- `.field` → Flex column wrapper

**Badges:**
- `.badge-default`, `.badge-accent`, `.badge-ok`, `.badge-fail`

**Animations:**
- `.stagger > *` → Fade-up com delays
- `.page-enter` → Fade-up on mount
- `.pulse-glow` → Keyframe para efeitos

### Tipografia

**Fontes:**
- `font-heading: 'Syne'` → Display, bold, tight tracking
- `font-body: 'DM Sans'` → Body text, limpo
- `font-mono: 'JetBrains Mono'` → Code blocks

---

## 🔌 Integração GitHub API

### `lib/github.ts`

#### `fetchRegistry(url: string)`
```
GET raw.githubusercontent.com/owner/repo/main/registry.json
→ Array<ComponentMeta>
```

#### `updateRegistry(settings, components)`
```
PUT /repos/{owner}/{repo}/contents/registry.json
Body: { message, content: base64(json), sha? }
```

#### `publishComponent(settings, payload)`
```
1. PUT 3 arquivos do componente
   - {name}.astro
   - {name}.preview.astro
   - index.ts

2. updateRegistry() com nova entry
```

#### `createProjectFromTemplate(settings, clientName, manifest)`
```
1. POST /repos/{owner}/{template}/generate
   Body: { owner, name, private: true, ... }
   → Repo criado

2. Wait 3.5s (GitHub inicializar)

3. PUT /repos/{owner}/{repoName}/contents/MANIFESTO.md
   Body: { message, content: base64(manifest) }

→ CreateProjectResult { repoUrl, cloneUrl, ... }
```

#### `validateGithubToken(token)`
```
GET /user com token
→ { valid: bool, login?: string, error?: string }
```

---

## 📄 Geração de Manifesto

**Arquivo:** `lib/manifest.ts`

### Fluxo
```
generateManifest(project, artDirection, components, settings)
├── Prepara variáveis (cores, fontes, data, etc)
├── Constrói seção de componentes
│   └── Cada componente com copy editado
├── Renderiza template com renderTemplate()
│   └── Substitui {{var}} por valores
│   └── Remove blocos {{#key}}...{{/key}} vazios
└── Retorna Markdown string
```

### Template Padrão

```markdown
# Projeto: {{clientName}}
**Gerado em:** {{date}}
**Tipo:** {{projectType}}
...

## Direcao de Arte
| Item | Valor |
| Primary | {{colorPrimary}} |
...

## Componentes Selecionados
### Secao 1 — `{{meta.id}}`
**Componente:** {{meta.name}}
**Copy / Props:**
  - {{key}}: {{value}}
...

## Instrucoes para o Claude Code
1. Duplicar pasta base...
2. npm install
3. Criar src/styles/theme.css
...
```

---

## 🚀 API Routes

### `POST /api/publish-component`

**Request:**
```json
{
  "settings": AppSettings,
  "meta": ComponentMeta,
  "astroCode": string,
  "previewCode": string,
  "indexCode": string
}
```

**Response (200):**
```json
{ "success": true }
```

**Response (500):**
```json
{ "error": "Mensagem de erro" }
```

---

### `POST /api/create-project`

**Request:**
```json
{
  "settings": AppSettings,
  "clientName": string,
  "manifest": string
}
```

**Response (200):**
```json
{
  "repoUrl": "https://github.com/owner/repo",
  "cloneUrl": "https://github.com/owner/repo.git",
  "sshUrl": "git@github.com:owner/repo.git",
  "vscodeUrl": "vscode://vscode.git/clone?url=...",
  "success": true
}
```

**Response (400):**
```json
{ "error": "Mensagem de erro" }
```

---

## 💾 Persistência (localStorage)

```javascript
// Configurações do GitHub
localStorage.setItem('acs-settings', JSON.stringify(AppSettings))

// Componentes selecionados no Builder
localStorage.setItem('acs-builder-components', JSON.stringify(SelectedComponent[]))
```

---

## 🎯 Responsividade Mobile

```css
/* Desktop: sidebar fixed left (240px) */
.app-shell {
  grid-template-columns: 240px 1fr;
}

/* Mobile: sidebar off-canvas, menu button visible */
@media (max-width: 768px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .app-sidebar {
    position: fixed;
    left: -260px;
    transition: left 0.3s;
    z-index: 40;
  }

  .app-sidebar.open {
    left: 0;
  }

  .mobile-overlay {
    opacity: 0;
    pointer-events: none;
  }

  .mobile-overlay.open {
    opacity: 1;
    pointer-events: all;
    backdrop-filter: blur(4px);
  }

  .mobile-menu-btn {
    display: flex;
  }
}
```

---

## 📊 Fluxo de Dados

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  AppLayout (Astro) - Sidebar + Main                    │
│  ├── Logo + Navigation                                  │
│  ├── Icons + Mobile menu                               │
│  └── <slot /> → Pages                                  │
│                                                         │
│  Pages (Astro):                                         │
│  ├── index.astro        → ComponentBrowser              │
│  ├── builder.astro      → Builder (3 steps)             │
│  ├── admin.astro        → AdminForm                     │
│  └── config.astro       → ConfigPanel                   │
│                                                         │
│  Componentes (React):                                   │
│  ├── Gerenciam estado local (useState)                  │
│  ├── Persistem em localStorage                          │
│  └── Chamam APIs via fetch()                            │
│                                                         │
│  APIs (Astro):                                          │
│  ├── /api/publish-component → GitHub                    │
│  └── /api/create-project → GitHub Template             │
│                                                         │
│  GitHub:                                                │
│  ├── registry.json (lista de componentes)              │
│  ├── Componentes (astro + preview + index)             │
│  └── Projetos gerados (MANIFESTO.md)                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Variáveis de Ambiente

```env
# Opcional - não deve estar definida em produção
PUBLIC_REGISTRY_URL=https://raw.githubusercontent.com/...
```

Nota: `PUBLIC_` prefix = acessível no cliente. Sem ele = server-only.

---

## 📈 Performance & Bundle Size

**Cliente-side JS:**
- `ui.ts` → 1.78 kB (gzip)
- `ComponentBrowser` → 9.69 kB (gzip)
- `Builder` → 17.63 kB (gzip)
- `AdminForm` → 7.22 kB (gzip)
- `ConfigPanel` → 5.91 kB (gzip)
- React client → 135.60 kB (gzip)

**Total:** ~180 kB gzip (sem contar HTML/CSS)

**Otimizações:**
- Code splitting por página
- `client:load` no Astro para hidratação
- Tailwind purging automático
- localStorage para estado persistente

---

## 🚀 Deploy

**Plataforma:** Vercel Serverless

**Configuração:** `astro.config.mjs`
```javascript
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [react(), tailwind()],
})
```

**Build:**
```bash
npm run build
```

**Saída:**
```
.vercel/output/
├── static/ (HTML/CSS/JS)
├── functions/
│   └── entry.mjs (handler do servidor)
└── config.json
```

---

## 📋 Checklist de Desenvolvimento

- [x] Design system com tokens CSS
- [x] Sidebar com ícones e mobile menu
- [x] 4 páginas principais (Biblioteca, Builder, Admin, Config)
- [x] ComponentBrowser com filtros e preview
- [x] Builder 3-step com drag-reorder
- [x] AdminForm com gerador de código
- [x] ConfigPanel com validação de token
- [x] Integração GitHub API completa
- [x] Gerador de MANIFESTO.md
- [x] localStorage para persistência
- [x] Responsividade mobile
- [x] Fallback de dados (sem registry)
- [x] SEO meta tags
- [x] Build sem erros
- [x] Animações e transições

---

## 🔍 Troubleshooting

### Erro: "Erro ao buscar registry: 404"
**Causa:** `PUBLIC_REGISTRY_URL` aponta para arquivo inexistente  
**Solução:** Remova a env var ou crie o arquivo no GitHub

### Componentes não aparecem
**Causa:** Registry vazio ou formato inválido  
**Solução:** Verifique se `registry.json` existe e é um Array válido

### Erro ao publicar componente
**Causa:** Token expirado ou repositório não acessível  
**Solução:** Revalide token em `/config`

### Build falha no Vercel
**Causa:** Node.js 24 (local) vs Node.js 18 (Vercel)  
**Solução:** Use `node:18` locally ou atualize Vercel

---

## 📚 Referências Internas

- [Tipos](/src/types/index.ts)
- [GitHub API](/src/lib/github.ts)
- [Manifest Builder](/src/lib/manifest.ts)
- [CSS Design System](/src/styles/app.css)
- [UI Components](/src/styles/ui.ts)

---

**Mantido por:** AdsGator Chief Engineer  
**Última atualização:** 2026-05-26
