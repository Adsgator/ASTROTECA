# Design System — Astroteca Studio

Tokens e padrões visuais do **studio** (sidebar, cards, botões, formulários do próprio Astroteca).

Não confundir com o design system dos projetos de clientes — esse vive em `COMPONENT-BLUEPRINT.md`.

---

## Tokens CSS (`:root` em `app.css`)

```css
/* Superfícies */
--bg:            #040409   /* fundo base */
--surface:       #0c0c1a   /* cards, painéis */
--raised:        #131325   /* itens elevados */
--hover:         #1a1a30   /* hover de itens */
--border:        #1e1e38   /* bordas */
--border-subtle: #141428   /* divisores suaves */

/* Texto */
--ink-primary:   #ededf5   /* texto principal */
--ink-secondary: #7a7a95   /* texto secundário */
--ink-muted:     #3a3a52   /* texto desabilitado */

/* Accent (laranja âmbar — cor da marca Astroteca) */
--accent:        #f0a500
--accent-dim:    rgba(240,165,0,0.08)
--accent-hover:  #fbbf24
--accent-glow:   rgba(240,165,0,0.15)

/* Status */
--ok:   #22c55e
--fail: #ef4444
--warn: #f59e0b

/* Layout */
--sidebar-w: 240px
--radius:    12px
--radius-sm: 8px
--radius-lg: 16px

/* Sombras */
--shadow-sm:   0 1px 2px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.15)
--shadow-md:   0 4px 12px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.2)
--shadow-lg:   0 8px 30px rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.3)
--shadow-glow: 0 0 20px var(--accent-glow), 0 0 40px rgba(240,165,0,0.05)
```

---

## Classes Tailwind do studio (`tailwind.config.js`)

| Classe | Token |
|--------|-------|
| `bg-bg` | `var(--bg)` |
| `bg-surface` | `var(--surface)` |
| `bg-raised` | `var(--raised)` |
| `bg-hover` | `var(--hover)` |
| `border-border` | `var(--border)` |
| `border-border-subtle` | `var(--border-subtle)` |
| `text-ink-primary` | `var(--ink-primary)` |
| `text-ink-secondary` | `var(--ink-secondary)` |
| `text-ink-muted` | `var(--ink-muted)` |
| `text-accent` / `bg-accent` | `var(--accent)` |
| `text-ok` / `text-fail` / `text-warn` | status vars |

---

## Tipografia do studio

| Fonte | Classe Tailwind | Uso |
|-------|----------------|-----|
| DM Sans (300–700) | `font-body` | interface, corpo, labels |
| Syne (400–800) | `font-heading` | headings (`h1`–`h6` via `app.css`) |
| JetBrains Mono (400/500) | `font-mono` | código, IDs, paths |

---

## Padrões de componente no studio

**Card padrão:**
```astro
<div class="bg-surface border border-border rounded-[var(--radius)] p-6 shadow-[var(--shadow-sm)]">
  <!-- conteúdo -->
</div>
```

**Constantes de estilo** ficam em `src/styles/ui.ts` — importe de lá, não escreva classes Tailwind soltas nos componentes React.

---

## Componentes da biblioteca (projetos de clientes)

Ver **[COMPONENT-BLUEPRINT.md](COMPONENT-BLUEPRINT.md)** — guia completo com tokens, estrutura, categorias e exemplos.

## Checklist antes de extrair um componente

- [ ] Sem imports de `../assets/` (imagens locais removidas)
- [ ] Sem dados reais do cliente (telefone, CNPJ, redes sociais)
- [ ] Props declaradas com `interface Props` e valores padrão razoáveis
- [ ] Usa tokens Tailwind (`bg-primary`, `text-text-main`, `py-section`) — sem valores literais
- [ ] Nome do arquivo em PascalCase (`HeroSplit.astro`)
- [ ] `npm run build` sem erros após adicionar ao registry
