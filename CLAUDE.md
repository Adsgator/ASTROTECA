# CLAUDE.md — Astroteca

Guia para qualquer IA trabalhando neste projeto. Leia antes de qualquer edição.

---

## O que é este projeto

**Astroteca** é uma ferramenta interna da Adsgator para criar sites de clientes rapidamente.
Funciona como uma biblioteca de componentes Astro + um studio para orquestrar projetos.

**Fluxo principal:**
1. **Extrair** (`npm run extract`) — componente do projeto atual vai para `minha-lib-astro/`
2. **Publicar** (Admin → publish) — sincroniza `minha-lib-astro/` com o registry
3. **Selecionar** (Builder step 1) — escolhe componentes da biblioteca
4. **Configurar** (Builder step 2) — cores, fontes, dados do cliente → ArtDirection
5. **Gerar** (Builder step 3) — cria repo no GitHub com `MANIFEST.md` para o Claude adaptar

O projeto gerado não é editado aqui — ele vai para outro repositório e é adaptado por um Claude separado seguindo o manifesto.

---

## Estrutura crítica

```
src/
  components/    — React/TSX: Builder, AdminPanel, ComponentBrowser, ConfigPanel
  lib/           — TypeScript puro: manifest.ts, github.ts, analytics.ts, utils.ts
  pages/         — Astro: index, builder, admin, analytics, config + preview/*
  pages/api/     — Endpoints Astro: create-project, extract, remove, publish, record-usage
  types/         — index.ts com todos os tipos compartilhados
  layouts/       — AppLayout.astro (sidebar), PreviewLayout.astro (preview isolado)
  styles/        — ui.ts (tokens CSS em JS), app.css

minha-lib-astro/ — Submodule git. NUNCA editar diretamente aqui a menos que pedido.
scripts/         — Node.js CLI: extract-component.mjs, add-component.mjs, etc.
public/          — Assets estáticos, incluindo logo_astroteca_branca.svg
_base-project/   — Template base copiado ao criar projeto no GitHub
```

---

## Regras inegociáveis

### minha-lib-astro é submodule
- Nunca fazer commit no root do Astroteca com mudanças do submodule sem confirmar com o usuário
- Commits no submodule são feitos separadamente dentro de `minha-lib-astro/`
- `registry.json` dentro do submodule é a fonte da verdade da biblioteca

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
| `npm run extract` | Extrai componente da pasta ativa para minha-lib-astro/ |
| `npm run add` | Wizard para criar componente novo na biblioteca |
| `npm run remove` | Remove componente do registry |

---

## Fluxo de dados — Builder

```
ProjectConfig + ArtDirection + SelectedComponent[] + AppSettings
       ↓
generateManifest() — src/lib/manifest.ts
       ↓
MANIFEST.md (markdown para o Claude do projeto do cliente)
       ↓
createProjectFromTemplate() — src/lib/github.ts
       ↓
Novo repositório GitHub com componentes + MANIFEST.md
```

---

## Pontos de atenção

- **Config do studio** fica em `public/data/config.json` (GitHub token, repos, etc.) — nunca commitar com token real
- **Analytics** em `public/data/analytics.json` — gerado automaticamente, não editar à mão
- **Preview pages** em `src/pages/preview/` — uma por componente, geradas pelo extract-component
- **PreviewLayout** injeta CSS de preview isolado — não confundir com AppLayout

---

## O que NÃO fazer

- Não criar componentes Astro de UI novos no studio (`src/`) — o studio é React + Astro pages
- Não modificar `_base-project/` sem entender que ele é o template copiado para cada cliente
- Não alterar tokens de cor/fonte no DESIGN-SYSTEM.md sem atualizar o tailwind padrão junto
- Não fazer push para `main` sem build limpo
