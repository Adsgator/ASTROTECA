# Manifesto do Projeto — [NOME DO CLIENTE]

> Preenchido com as informações do cliente e enviado ao Claude Code para implementar o site.
> Quanto mais específico, menos genérico fica o resultado.

---

## 1. Identidade

- **Nome do cliente / negócio:**
- **Nicho:**
- **Público-alvo:**
- **Cidade / região de atuação:**
- **Tom de comunicação:** (ex: sofisticado e acolhedor / direto e confiante)

## 2. Referência visual

- **Sites de referência (1–3):** _URLs_
- **O que agradou em cada um:** (ex: "tipografia grande no hero", "espaçamento generoso")

## 3. Personalidade da marca

- **3–5 adjetivos:**
- **O que NÃO é:** (ex: "não é minimalista demais, não é corporativo frio")
- **Emoção desejada no visitante:**

---

## 4. Tokens visuais → `src/styles/tokens.css`

Defina os VALORES; os nomes dos tokens são fixos.

```css
:root {
  --t-primary:      #______;  /* botões, links, destaques */
  --t-primary-dark: #______;  /* hover de botões */
  --t-secondary:    #______;  /* acentos, badges, CTA dourado */
  --t-complement:   #______;  /* detalhes em gradiente */
  --t-background:   #______;
  --t-surface:      #______;  /* seções alternadas, cards */
  --t-surface-alt:  #______;
  --t-dark:         #______;  /* footer, blocos escuros */
  --t-border:       #______;
  --t-text-main:    #______;
  --t-text-soft:    #______;
  --t-text-muted:   #______;
  --t-font-serif:   "______"; /* título — nome exato do Google Fonts */
  --t-font-sans:    "______"; /* corpo — nome exato do Google Fonts */
}
.dark { /* paleta dark — preencher os mesmos tokens */ }
```

- **Tema padrão:** light / dark → ajustar `data-default-theme` no `BaseLayout.astro`.

---

## 5. Estrutura e copy por seção

Para cada seção, informe o **tom** e a **mensagem central**, não só o headline.

### Hero — `id="hero-section"`
- Headline / Subheadline / CTA / itens de confiança:

### Sobre
- Texto principal / citação de destaque:

### Serviços — `id="servicos"`
- Serviço 1: título | descrição
- Serviço 2: título | descrição
- Serviço 3: título | descrição

### Como funciona — `id="como-funciona"` (3–4 passos)
- Passo 1: título | descrição

### Diferenciais — `id="diferenciais"` (3–6)
- Diferencial 1: título | descrição

### Depoimentos — `id="depoimentos"`
- Nome | nota | texto

### FAQ — `id="faq"` (4–6)
- P: | R:

### CTA final / Contato — `id="contato"`
- Título / subtítulo / CTA

### Footer — `id="footer"`
- Links, redes sociais, links legais

---

## 6. Contratos técnicos (obrigatórios)

- Hero com `id="hero-section"`; Footer com `id="footer"`; `<main id="main-content">`.
- Cada seção com `id` igual ao item de menu.
- WhatsApp: preencher `.env` (`PUBLIC_WA_NUMBER`, `PUBLIC_WA_MESSAGE` — número só dígitos com DDI).
- `politica-de-privacidade.astro` e `termos-de-uso.astro`: preencher todos os TODOs (nome, CNPJ, e-mail, domínio, hospedagem).

---

## 7. Configuração técnica e SEO

- **Domínio:** https://
- **GTM ID:** (deixe vazio se não houver)
- **WhatsApp:** 55 + DDD + número | **Mensagem padrão:**
- **E-mail / endereço / horários:**
- **Redes sociais:** Instagram | TikTok | Facebook | YouTube
- **Title (50–60 chars):**
- **Meta description (150–160 chars):**
- **Keywords (5–8):**
- **Schema.org @type:** (LocalBusiness, MedicalBusiness, LegalService, etc.)

---

## 8. Exemplo de componente bem-estruturado

```astro
---
interface Props { title: string; description: string }
const { title, description } = Astro.props;
---
<section id="servicos" class="section-py">
  <div class="container-wide">
    <h2 class="font-serif text-display-md text-text-main">{title}</h2>
    <p class="text-body-lg text-text-soft">{description}</p>
  </div>
</section>
```

Tokens de layout: `.section-py`, `.container-wide`, `.container-content`, `font-serif`,
`text-display-*`, `text-body-*`, `text-text-main`, `text-text-soft`, `bg-primary`, `bg-surface`.

---

## 9. Imagens disponíveis

- `hero-principal.webp` → hero
- `foto-sobre.webp` → seção sobre
- `logo.svg` → header e footer

---

## 10. Checklist de entrega

- [ ] Header: scroll direction detection + link ativo (IntersectionObserver) + menu mobile fechando
- [ ] Hero `id="hero-section"`; Footer `id="footer"`; `<main id="main-content">`
- [ ] WhatsApp flutuante: `.env` preenchido; some quando Hero/Footer visíveis
- [ ] Dark mode toggle no Footer; persiste; sem flash; `tokens.css` light + dark preenchidos
- [ ] Páginas legais com TODOs preenchidos
- [ ] Animações de scroll via `data-animate*`
- [ ] SEO: title, description, OG, JSON-LD, canonical
- [ ] Responsividade mobile 375px: hero ≥ 20px, botões ≥ 44px altura, padding lateral ≥ 20px
- [ ] Sitemap em `/sitemap-index.xml`
- [ ] `npm run check` e `npm run build` limpos

---

## Notas adicionais

(qualquer detalhe específico do cliente)
