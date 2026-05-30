# Auditoria de Projeto — Padrao Adsgator

Envie este documento para o Claude Code auditar qualquer projeto de landing page.
Ele vai analisar o projeto, identificar problemas e aplicar o padrao profissional.

---

## Instrucoes para o Claude

Voce e um auditor de projetos de landing pages premium da Adsgator.
Seu trabalho e garantir que o projeto entregue vale entre R$5.000 e R$10.000.

**Execute cada secao abaixo na ordem. Para cada item, verifique e corrija se necessario.**

---

## 1. Estrutura do Projeto

- [ ] `package.json` com scripts `dev`, `build`, `preview`
- [ ] `astro.config.mjs` configurado corretamente
- [ ] `tailwind.config.js` importando tokens de `tailwind-tokens.js`
- [ ] `src/styles/global.css` com fontes, reset, classes utilitarias
- [ ] `src/layouts/Layout.astro` com SEO, GTM, Schema.org, WhatsApp, CookieBanner
- [ ] `src/pages/index.astro` com todos os componentes importados na ordem
- [ ] `src/pages/404.astro` com pagina de erro estilizada
- [ ] `src/pages/politica-de-privacidade.astro` (LGPD)
- [ ] `src/pages/termos-de-uso.astro`
- [ ] `src/components/global/GTM.astro`
- [ ] `src/components/global/WhatsAppFloat.astro`
- [ ] `src/components/islands/CookieBanner.tsx`
- [ ] `src/components/islands/ScrollAnimations.tsx`
- [ ] `src/components/islands/ThemeToggle.tsx`
- [ ] `src/components/islands/MobileMenu.tsx` (se houver header com menu mobile)
- [ ] `public/favicon.svg` presente
- [ ] `public/og-image.webp` presente (1200x630px)

---

## 2. SEO e Meta Tags (Layout.astro)

Verifique no `Layout.astro`:

- [ ] `<title>` com nome do cliente + cidade/nicho
- [ ] `<meta name="description">` com descricao de 150-160 caracteres
- [ ] `<meta name="keywords">` com 5-10 palavras-chave relevantes
- [ ] `<link rel="canonical">` com URL real do dominio
- [ ] Open Graph: `og:title`, `og:description`, `og:image`, `og:url`, `og:locale="pt_BR"`
- [ ] Twitter Card: `twitter:card="summary_large_image"`, `twitter:title`, `twitter:description`, `twitter:image`
- [ ] `<meta name="theme-color">` com cor primaria do cliente
- [ ] Schema.org JSON-LD com `@type` correto para o negocio
- [ ] Schema.org com: name, description, url, telephone, email, openingHours, sameAs
- [ ] Google Fonts carregando via `preload` + `noscript` fallback
- [ ] `lang="pt-BR"` no `<html>`

---

## 3. Performance

- [ ] `npm run build` sem erros
- [ ] Imagens em formato WebP (nao PNG/JPG grandes)
- [ ] Imagens com `loading="lazy"` (exceto hero que deve ser `eager`)
- [ ] Hero image com `fetchpriority="high"` ou `loading="eager"`
- [ ] Fontes com `display=swap` no Google Fonts
- [ ] Sem scripts bloqueantes desnecessarios
- [ ] CSS do Tailwind purgado (build de producao)
- [ ] Sem imports de bibliotecas nao usadas no `package.json`
- [ ] Componentes React/islands com `client:idle` ou `client:visible` (nao `client:load` desnecessario)

---

## 4. Tokens e Design System

Verifique em TODOS os componentes `.astro`:

- [ ] **ZERO cores literais** — sem `text-gray-600`, `bg-blue-500`, `text-[#333]`
- [ ] Usando tokens corretos: `text-text-main`, `bg-primary`, `bg-surface`, etc.
- [ ] Fontes via tokens: `font-serif` para titulos, `font-sans` para corpo
- [ ] Tamanhos de texto: `text-display-xl/lg/md/sm`, `text-body-lg/md/sm`, `text-label`
- [ ] Espacamento de secao: `py-section` ou `section-py` (class utilitaria)
- [ ] Container: `w-[90%] max-w-wide mx-auto`
- [ ] Sombras: `shadow-card`, `shadow-float`, `shadow-primary-sm`
- [ ] Border radius consistente: `rounded`, `rounded-lg`, `rounded-xl`
- [ ] Botoes usando `.btn-primary`, `.btn-ghost`, ou `.btn-secondary-gold`

---

## 5. Dark Mode

- [ ] `darkMode: 'class'` no `tailwind.config.js`
- [ ] Script de deteccao no `<head>` (antes do CSS)
- [ ] `ThemeToggle` importado e ativo
- [ ] Cores dark definidas em `tailwind-tokens.js`
- [ ] global.css com swaps `.dark .bg-background → bg-dark-bg` etc.
- [ ] Testar visualmente: fundo, texto, cards, botoes, bordas todos legiveis

---

## 6. Responsividade

Testar em 3 breakpoints:

### Mobile (375px)
- [ ] Texto legivel sem zoom
- [ ] Botoes com tamanho minimo de 44x44px
- [ ] Sem overflow horizontal (nada cortado)
- [ ] Menu mobile funcional (hamburguer)
- [ ] Imagens redimensionadas corretamente
- [ ] WhatsApp float nao obstrui conteudo
- [ ] CTA principal visivel sem scroll excessivo

### Tablet (768px)
- [ ] Grid adaptado (2 colunas onde faz sentido)
- [ ] Espacamento proporcional
- [ ] Navegacao funcional

### Desktop (1280px)
- [ ] Layout completo com todas as colunas
- [ ] Max-width respeitado (1200px ou 1440px)
- [ ] Hover effects funcionando
- [ ] Espacamento generoso e premium

---

## 7. Conversao e UX

- [ ] CTA principal acima da dobra (hero)
- [ ] WhatsApp float visivel e funcional
- [ ] Numero de WhatsApp correto (formato internacional: 5511999999999)
- [ ] Mensagem padrao do WhatsApp configurada
- [ ] Smooth scroll para ancoras internas (`#contato`, `#sobre`, etc.)
- [ ] Formulario de contato funcional (se houver)
- [ ] Links de redes sociais abrindo em nova aba (`target="_blank" rel="noopener"`)
- [ ] Telefone clicavel com `tel:`
- [ ] Email clicavel com `mailto:`
- [ ] CTA presente em pelo menos 3 pontos da pagina

---

## 8. GTM e Analytics

- [ ] GTM ID real configurado (nao GTM-XXXXXXX)
- [ ] Google Consent Mode v2 antes do GTM
- [ ] CookieBanner com opcoes de aceitar/recusar
- [ ] Consent mode atualizado apos aceite do usuario
- [ ] GTM noscript no `<body>` para fallback

---

## 9. Acessibilidade Basica

- [ ] `alt` em todas as imagens (descritivo, nao "imagem")
- [ ] Headings em ordem hierarquica (h1 → h2 → h3, sem pular)
- [ ] Apenas UM `<h1>` por pagina
- [ ] Contraste de cor adequado (texto legivel sobre fundo)
- [ ] Focus ring visivel em elementos interativos
- [ ] Links com texto descritivo (nao "clique aqui")
- [ ] `aria-label` em botoes com apenas icone
- [ ] `prefers-reduced-motion` respeitado

---

## 10. Qualidade Visual Premium

Estes detalhes separam um site de R$500 de um de R$5.000+:

- [ ] Labels em caixa alta antes de titulos de secao (`text-label text-secondary uppercase`)
- [ ] Headlines em `font-serif` com tamanhos responsivos (`text-display-*`)
- [ ] Espaco generoso entre secoes (min 5rem)
- [ ] Alternancia de fundos: `bg-background` e `bg-surface` entre secoes
- [ ] Transicoes CSS suaves (300ms ease-out) em hover de cards e botoes
- [ ] Imagens com `rounded-xl` ou `rounded-2xl` (nunca quadradas)
- [ ] Cards com `border border-border shadow-card` (sutil, nunca pesado)
- [ ] Citacoes/depoimentos com aspas decorativas
- [ ] Numeros/stats em `font-serif` grande com animacao de contagem
- [ ] Divisores sutis entre secoes (nunca `<hr>` crua)
- [ ] Animacoes de entrada no scroll (`data-animate`, `data-animate-group`)
- [ ] Icones consistentes (todos SVG, mesmo estilo)
- [ ] Sem textos placeholder restantes ("Lorem ipsum", "Texto aqui")
- [ ] Todas as secoes com copy real e persuasivo do cliente
- [ ] Fotos/imagens de qualidade (nao pixeladas, bem enquadradas)

---

## 11. Legal e Compliance

- [ ] Politica de privacidade linkada (LGPD)
- [ ] Termos de uso linkados
- [ ] Cookie banner funcional
- [ ] Copyright no footer com ano atual
- [ ] Sem dados sensiveis expostos no codigo-fonte

---

## 12. Deploy

- [ ] Build sem erros (`npm run build`)
- [ ] Sem warnings criticos no build
- [ ] Testar `npm run preview` localmente
- [ ] Verificar que todas as paginas carregam
- [ ] Testar em navegadores: Chrome, Safari, Firefox
- [ ] Lighthouse score: Performance >90, SEO >90, Accessibility >80

---

## Formato de Relatorio

Ao auditar, gere um relatorio neste formato:

```markdown
# Relatorio de Auditoria — [Nome do Cliente]
Data: [data]

## Resumo
- Total de itens verificados: X
- Aprovados: X
- Problemas encontrados: X
- Problemas corrigidos: X

## Problemas Encontrados e Correcoes

### [Critico] Titulo do problema
- **O que:** descricao
- **Onde:** arquivo:linha
- **Correcao:** o que foi feito

### [Medio] Titulo do problema
...

### [Baixo] Titulo do problema
...

## Score Final
- Estrutura: X/10
- SEO: X/10
- Performance: X/10
- Design: X/10
- Conversao: X/10
- **Total: X/50**
```
