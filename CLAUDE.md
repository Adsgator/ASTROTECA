# CLAUDE.md — Astroteca

Guia para qualquer IA trabalhando neste projeto. Leia antes de qualquer edição.

---

## O que é este projeto

**Astroteca** é uma ferramenta interna da Adsgator para criar sites de clientes rapidamente.
Funciona como uma biblioteca de componentes Astro + um studio para orquestrar projetos.

**Fluxo principal:**
1. **Adicionar / Extrair componente** — duas portas, mesmo motor (`src/lib/component-writer.ts`):
   - Pela UI (recomendado): `/admin` cola um `.astro` criado pelo Claude (ver `COMPONENT-BLUEPRINT.md`); `/admin/extract` extrai de um projeto de cliente (arrasta o `.astro` ou cola o caminho). Ambos sanitizam, gravam em `minha-lib-astro/`, geram preview e publicam no GitHub.
   - Pelo CLI: `npm run new` (criar) e `npm run extract` (extrair). Compartilham `scripts/component-core.mjs` com o motor da UI.
2. **Selecionar** (Builder) — escolhe componentes da biblioteca
3. **Configurar** (Builder) — cores, fontes, dados do cliente → ArtDirection
4. **Gerar** (Builder) — cria repo no GitHub com `MANIFESTO.md` para o Claude adaptar

O projeto gerado não é editado aqui — ele vai para outro repositório e é adaptado por um Claude separado seguindo o manifesto.

---

## Documentos de referência

| Documento | Propósito |
|-----------|-----------|
| `DESIGN-SYSTEM.md` | Tokens e padrões visuais do studio (app.css, tailwind.config.js, ui.ts) |
| `COMPONENT-BLUEPRINT.md` | Guia completo para criar componentes da biblioteca — tokens, estrutura, categorias, exemplo de referência |

---

## Estrutura crítica

```
src/
  components/    — React/TSX: Builder, AdminPanel, ComponentBrowser, ConfigPanel
  lib/           — TypeScript puro: manifest.ts, github.ts, analytics.ts, utils.ts
  pages/         — Astro: index, builder, admin (+ admin/extract, admin/remove), analytics, config + preview/*
  pages/api/     — Endpoints Astro: auth, create-project, extract-component, remove-component, publish-component, record-component-usage, registry-proxy
  middleware.ts  — Auth por PIN (cookie de sessão); rotas públicas: /login, /api/auth
  types/         — index.ts com todos os tipos compartilhados
  layouts/       — AppLayout.astro (sidebar), PreviewLayout.astro (preview isolado)
  styles/        — ui.ts (tokens CSS em JS), app.css, preview.css (estilo isolado do preview)

minha-lib-astro/ — Repo git próprio (in-tree, não submodule). NUNCA editar diretamente aqui a menos que pedido.
scripts/         — Node.js CLI: extract-component.mjs, add-component.mjs, generate-previews.mjs, remove-component.mjs, analytics.mjs + component-core.mjs (núcleo único, espelha component-writer.ts)
public/          — Assets estáticos (logo_astroteca_branca.svg) + public/data/ (config.json, analytics.json)
_base-project/   — Template base copiado ao criar projeto no GitHub. Self-contained com Tailwind v4 CSS-first (tokens.css + global.css)
```

---

## Regras inegociáveis

### minha-lib-astro é repo git independente (in-tree)
- Não é submodule — vive dentro do Astroteca mas tem `.git` próprio
- Nunca commitar mudanças de `minha-lib-astro/` junto com commits do Astroteca
- Commits em `minha-lib-astro/` são feitos separadamente dentro da pasta
- `registry.json` dentro de `minha-lib-astro/` é a fonte da verdade da biblioteca

### Tokens de design system
Os componentes da biblioteca usam tokens Tailwind fixos. **Nunca substituir por valores literais:**
- Cores: `bg-primary`, `text-text-main`, `bg-surface`, `border-border`, etc.
- Fontes: `font-serif` (heading), `font-sans` (corpo)
- Espaçamento: `py-section`, `w-[90%] max-w-wide mx-auto`
- Sombras: `shadow-card`, `shadow-float`

Ver [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) para referência completa.

### AppLayout.astro — sidebar do studio
A sidebar usa `logo_astroteca_branca.svg` como `<img>`. Animações CSS e SMIL do SVG funcionam nesse contexto.

### Tipos compartilhados
Todos os tipos ficam em `src/types/index.ts`. Nunca criar tipos duplicados em componentes.

### Build sem erros
`npm run build` deve passar limpo antes de qualquer commit. O projeto usa Astro + Vercel adapter + React islands.

---

## Scripts disponíveis

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | Inicia dev em localhost:4321 (ou 4322 se ocupada) |
| `npm run build` | Build de produção — deve passar sem erros |
| `npm run extract <caminho>` | Extrai componente de um projeto para minha-lib-astro/ — faz commit + push automático do repo in-tree, previews e analytics |
| `npm run new` | Wizard para criar componente novo na biblioteca |
| `npm run previews` | Gera as páginas de preview de todos os componentes |
| `npm run remove` | Remove componente do registry |
| `npm run preview:css` | (auxiliar) Recompila o CSS isolado do preview em watch — rode ao mexer em `preview.css` ou tokens de preview |
| `npm run build:preview-css` | (auxiliar) Build minificado do CSS de preview em `public/preview-components.css` |

---

## Fluxo de dados — Builder

```
ProjectConfig + ArtDirection + SelectedComponent[] + AppSettingsV2
       ↓
generateDocument() — src/lib/export-document.ts   (Path A / B / Hybrid)
generateCreateManifest() — src/lib/manifest.ts    (Path C — criar componentes)
       ↓
MANIFESTO.md (markdown para o Claude do projeto do cliente)
       ↓
createProjectFromTemplate() — src/lib/github.ts
  (Path C: chamado via /api/create-project para ler COMPONENT-BLUEPRINT.md do disco)
       ↓
Novo repositório GitHub com componentes + MANIFESTO.md (+ COMPONENT-BLUEPRINT.md no Path C)
```

---

## Pontos de atenção

- **Config do studio** fica em `public/data/config.json` (GitHub token, repos, etc.) — template com placeholders já existe, nunca commitar com token real
- **Registry** é buscado em runtime via `/api/registry-proxy`, que usa a GitHub API para evitar cache de CDN. O `registryUrl` vem do config (ou do localStorage no browser)
- **Analytics** em `public/data/analytics.json` — gerado automaticamente, não editar à mão. A escrita usa `node:fs`, então só persiste em ambiente local; em serverless (Vercel) o filesystem é read-only
- **Preview pages** em `src/pages/preview/` — uma por componente, geradas por `npm run extract` e `npm run previews`
- **PreviewLayout** injeta CSS de preview isolado — não confundir com AppLayout
- **CSS de preview** (`src/styles/preview.css`) usa Tailwind v4 via `@tailwindcss/cli`. O studio usa Tailwind v3 para seu próprio UI — coexistem. Não existe mais `tailwind-tokens.js` nem `tailwind.preview.config.js`

---

## O que NÃO fazer

- Não criar componentes Astro de UI novos no studio (`src/`) — o studio é React + Astro pages
- Não modificar `_base-project/` sem entender que ele é o template copiado para cada cliente
- Não alterar tokens de cor/fonte no DESIGN-SYSTEM.md sem atualizar o tailwind padrão junto
- Não fazer push para `main` sem build limpo
