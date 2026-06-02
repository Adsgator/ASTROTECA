# CLAUDE.md — Projeto de cliente Adsgator

Você é o Claude Code responsável por implementar este site a partir do `manifesto.md`.
Leia este arquivo inteiro antes de qualquer edição. Estas regras são inegociáveis.

---

## Stack

- **Astro 5** + TypeScript strict
- **Tailwind CSS v4** — CSS-first, **sem `tailwind.config.js`**. Tokens vivem em `src/styles/global.css` (`@theme`) e os valores em `src/styles/tokens.css`.
- **GSAP + ScrollTrigger** — animações de scroll (via `src/components/islands/ScrollAnimations.tsx`)
- **Lenis** — smooth scroll (já integrado ao ScrollAnimations)
- **framer-motion** — usado no menu mobile e no banner de cookies (React islands)
- **Componentes da biblioteca Astroteca** — já copiados em `src/components/sections/` quando selecionados no Builder. Não são pacote npm: são arquivos locais, edite-os à vontade.

---

## Tokens — a regra mais importante

Todo valor visual vem de `src/styles/tokens.css` (cores e fontes) e de `@theme` em `global.css`.

- **NUNCA** hardcode cor, fonte ou tamanho. Sempre use o utilitário Tailwind correspondente (`bg-primary`, `text-text-main`, `font-serif`) ou `var(--t-...)` em CSS escopado.
- Para customizar a identidade do cliente, edite **apenas** `tokens.css`. Os nomes dos tokens nunca mudam.

Tokens de cor disponíveis (e quando usar):

| Token | Classe | Uso |
|---|---|---|
| `--t-primary` | `bg-primary` `text-primary` | botões principais, links, destaques |
| `--t-primary-dark` | `bg-primary-dark` | hover de botões, variantes escuras |
| `--t-secondary` | `bg-secondary` `text-secondary` | acentos, badges, CTA dourado |
| `--t-background` | `bg-background` | fundo da página |
| `--t-surface` | `bg-surface` | cards, seções alternadas |
| `--t-dark` | `bg-dark` | footer, blocos escuros |
| `--t-border` | `border-border` | divisores, bordas de card |
| `--t-text-main` | `text-text-main` | texto do corpo |
| `--t-text-soft` | `text-text-soft` | subtítulos, labels |
| `--t-text-muted` | `text-text-muted` | metadados, placeholders |
| `--t-wa` | `bg-wa` | verde do WhatsApp |

Tokens de layout/tipografia: `font-serif` (títulos), `font-sans` (corpo), `text-display-xl…sm`, `text-body-lg…sm`, `text-label`, `.section-py`, `.container-wide`, `.container-content`, `shadow-card`, `shadow-float`.

---

## Padrões de código prontos — use, não reinvente

O `global.css` já tem classes utilitárias prontas. **Sempre use elas** em vez de remontar estilo do zero.
Reinventar botão/card com classes soltas é a principal causa de inconsistência entre projetos.

### Estrutura padrão de seção

Toda seção de conteúdo segue este esqueleto. Alterne `bg-surface` ↔ `bg-background` (ou `bg-surface-alt`)
entre seções vizinhas para criar ritmo visual:

```astro
<section id="servicos" class="section-py bg-surface">
  <div class="container-wide">
    <span class="label-tag block mb-3">Rótulo da seção</span>
    <h2 class="font-serif text-display-lg text-text-main mb-4">Título</h2>
    <p class="text-body-lg text-text-soft max-w-prose mb-12" data-animate>Subtítulo</p>
    <!-- conteúdo -->
  </div>
</section>
```

### Botões — classes prontas (não escreva o estilo na mão)

| Quando usar | Classe | Observação |
|---|---|---|
| CTA principal | `class="btn-primary"` | sombra + hover + easing já embutidos |
| Ação secundária | `class="btn-ghost"` | contorno, sem preenchimento |
| CTA de destaque | `class="btn-secondary-gold"` | gradiente dourado com shimmer |
| WhatsApp inline | `class="inline-flex items-center gap-2 bg-wa text-white font-sans font-medium px-7 py-3.5 rounded"` + `target="_blank" rel="noopener noreferrer"` | não existe classe `.btn-wa`; use o token `bg-wa` e sempre o ícone |

O botão WhatsApp **flutuante** já existe (`WhatsAppFloat.astro`) — não recrie. O caso acima é só para CTA de WhatsApp dentro de uma seção.

### Outras classes prontas

`.card-hover` (translate + shadow no hover), `.label-tag` (rótulo uppercase), `.badge` / `.badge-secondary` (pills),
`.blockquote-premium` (citação com aspa decorativa), `.stat-number` / `.stat-label` (números grandes serif),
`.divider-ornament` (divisor com linha), `.link-underline` (underline animado), `.img-hover` (zoom sutil na imagem).

Padrão de card: `class="bg-background rounded-xl p-8 border border-border shadow-card card-hover"`.

---

## Ícones

Use **`astro-icon`** com a coleção **`@iconify-json/lucide`** (já nas dependências).

```astro
---
import { Icon } from 'astro-icon/components'
---

<Icon name="lucide:arrow-right" class="w-4 h-4" />
<Icon name="lucide:phone" class="w-5 h-5" />
```

- O SVG é gerado inline no build — zero JS, zero runtime, sem requisição extra.
- Coleção padrão: `lucide:*`. Se precisar de ícone de nicho sem equivalente, use outro prefixo do Iconify (ex: `ph:stethoscope` do Phosphor para saúde) — basta instalar o `@iconify-json/<coleção>` correspondente.
- Nunca use emojis como ícones em componentes de UI.
- Para SVG muito específico sem equivalente em nenhuma coleção, use inline diretamente.

---

## Dark mode

- A classe `.dark` é aplicada ao `<html>` pelo script anti-flash no `<head>` do `BaseLayout.astro`.
- Os tokens são redefinidos dentro de `.dark` em `tokens.css` — basta preencher a paleta dark do cliente lá.
- O toggle de tema fica **dentro do Footer** (componente da biblioteca). Não crie botão flutuante de tema.

---

## Regras absolutas de código

1. `<Image />` de `astro:assets`, nunca `<img>` nativo (exceto SVG inline trivial).
2. Sem `any` no TypeScript.
3. Sem `!important` no CSS.
4. Lighthouse ≥ 95 nas 4 métricas é requisito, não meta.
5. Implemente na ordem das tarefas do `manifesto.md`.
6. `npm run check` (astro check + biome) deve passar limpo antes de considerar pronto.

---

## Comportamentos obrigatórios de UX — TODOS devem funcionar

### Header / navegação
- Esconde ao rolar para baixo, reaparece ao rolar para cima.
- Link ativo destacado conforme a seção visível (IntersectionObserver).
- Menu mobile: overlay, fecha ao clicar em link ou fora.
- **Nenhum** link de menu aponta para `#` — todos levam a seções reais (`#servicos`, `#contato`, etc.).
- O `<header>` da biblioteca já implementa isso. Se criar um header próprio, replique o comportamento.

### Botão WhatsApp flutuante (`WhatsAppFloat.astro`)
- Visível por padrão; **some** quando o Hero (`#hero-section`) ou o Footer (`#footer`) estão na tela.
- Número e mensagem vêm de `.env` (`PUBLIC_WA_NUMBER`, `PUBLIC_WA_MESSAGE`) — preencha o `.env`.
- Posição bottom-right, z-index alto.

### Toggle de tema (dark mode)
- Dentro do Footer, **não** flutuante.
- Persiste em `localStorage`; sem flash na primeira renderização; respeita `prefers-color-scheme` na 1ª visita.

### IDs estruturais obrigatórios
- O Hero **precisa** de `id="hero-section"` (senão o botão WhatsApp não some no topo).
- O Footer **precisa** de `id="footer"`.
- O `<main>` tem `id="main-content"` (alvo do skip link).
- Cada seção de conteúdo tem `id` igual ao item de menu correspondente.

### Acessibilidade mínima
- `alt` em toda imagem; `aria-label` em botões sem texto (WhatsApp, fechar menu, toggle tema).
- Skip link "Pular para o conteúdo" já existe no `BaseLayout`.
- Focus visível em todos os interativos.

### Páginas legais
- `politica-de-privacidade.astro` e `termos-de-uso.astro` já existem. Preencha TODOS os `TODO`
  com os dados reais do cliente (nome/razão social, CNPJ, e-mail, domínio, provedor de hospedagem).

---

## Sinais de entrega incompleta — revise antes de dar por pronto

Se qualquer item abaixo for verdadeiro, o site **não** está pronto:

- Botão WhatsApp flutuante não some sobre o Hero ou o Footer → falta `id="hero-section"` / `id="footer"`.
- Algum link de menu aponta para `#` em vez de uma seção real (`#servicos`, `#contato`…).
- Menu mobile fecha só no botão X, mas não ao clicar fora ou num link.
- Trocar o tema (dark/light) deixa algum texto ou fundo com cor que **não muda** → cor hardcodada, troque por token.
- `politica-de-privacidade.astro` ou `termos-de-uso.astro` ainda têm `TODO` ou dados de placeholder.
- Alguma imagem usa `<img>` nativo, ou `<Image />` sem `width`/`height` (causa CLS).
- Todas as seções têm o mesmo fundo (sem alternância `bg-surface` ↔ `bg-background`).
- Botão estilizado com classes soltas em vez de `.btn-primary` / `.btn-ghost` / `.btn-secondary-gold`.
- `.env` com `PUBLIC_WA_NUMBER`, `PUBLIC_WA_MESSAGE`, `PUBLIC_GTM_ID`, `PUBLIC_SITE_URL` vazios.
- `npm run check` ou `npm run build` com erro ou warning.

---

## Estrutura

```
src/
  components/
    global/   → SkipLink, WhatsAppFloat, GTM
    islands/  → CookieBanner, MobileMenu, ScrollAnimations (React)
    sections/ → componentes da biblioteca copiados + seções do projeto
  layouts/    → BaseLayout.astro (head, SEO, GTM, dark mode, WhatsApp, cookies)
  pages/      → index.astro (composição), 404, política, termos
  styles/     → tokens.css (edite aqui), global.css
  data/       → site.config.ts (opcional: conteúdo tipado)
public/       → favicon, og-image, _headers
```

Composição da página (`index.astro`):
`<BaseLayout> → <Header /> + <main id="main-content"> seções </main> + <Footer /> </BaseLayout>`
