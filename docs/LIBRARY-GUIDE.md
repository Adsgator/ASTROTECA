# LIBRARY GUIDE — Como Construir e Usar a Biblioteca de Componentes

> Versão 1.0  
> Guia completo do sistema: `minha-lib-astro` + `_base-project` + geração de projetos + Claude Code.  
> Leia do início ao fim uma vez. Depois use como referência.

---

## Visão Geral do Sistema

O sistema é composto por quatro peças que trabalham juntas:

```
┌─────────────────────────────────────────────────────┐
│  minha-lib-astro          (GitHub repo)             │
│  Componentes Astro reutilizáveis + tokens base      │
└────────────────────┬────────────────────────────────┘
                     │ instalada como dependência
┌────────────────────▼────────────────────────────────┐
│  _base-project            (GitHub repo)             │
│  Template com estrutura, configs e CLAUDE.md        │
└────────────────────┬────────────────────────────────┘
                     │ clonado para cada cliente
┌────────────────────▼────────────────────────────────┐
│  projeto-cliente-acme     (GitHub repo)             │
│  tokens.css + site.config.ts + manifesto.md         │
└────────────────────┬────────────────────────────────┘
                     │ Claude Code lê e implementa
┌────────────────────▼────────────────────────────────┐
│  manifesto.md + CLAUDE.md                           │
│  Contexto completo para o Claude Code agir          │
└─────────────────────────────────────────────────────┘
```

**Princípio central:** componentes nunca são criados dentro de projetos de cliente. Tudo começa na biblioteca. Projetos de cliente apenas configuram (tokens) e compõem (quais componentes usar, com qual conteúdo).

---

## Parte 1: A Biblioteca (`minha-lib-astro`)

### 1.1 Estrutura do repositório

```
minha-lib-astro/
├── src/
│   ├── components/
│   │   ├── sections/          ← seções de landing page
│   │   │   ├── Hero.astro
│   │   │   ├── Features.astro
│   │   │   ├── HowItWorks.astro
│   │   │   ├── Testimonials.astro
│   │   │   ├── Pricing.astro
│   │   │   ├── FAQ.astro
│   │   │   ├── TrustBar.astro
│   │   │   ├── CTASection.astro
│   │   │   └── ContactForm.astro
│   │   │
│   │   └── ui/                ← átomos (blocos menores)
│   │       ├── Button.astro
│   │       ├── Badge.astro
│   │       ├── Card.astro
│   │       ├── Input.astro
│   │       ├── Textarea.astro
│   │       ├── Select.astro
│   │       ├── Accordion.astro
│   │       └── StarRating.astro
│   │
│   ├── styles/
│   │   ├── base.css           ← reset + tokens padrão da biblioteca
│   │   └── global.css         ← estilos base (tipografia, links, etc.)
│   │
│   └── index.ts               ← exports de tudo
│
├── CHANGELOG.md               ← histórico de mudanças
├── package.json
└── README.md
```

### 1.2 package.json da biblioteca

```json
{
  "name": "minha-lib-astro",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".":                "./src/index.ts",
    "./styles/*":       "./src/styles/*",
    "./components/*":   "./src/components/*"
  },
  "keywords": ["astro", "components", "landing-page"],
  "peerDependencies": {
    "astro": "^5.0.0"
  },
  "devDependencies": {
    "astro": "^5.0.0",
    "typescript": "^5.0.0"
  }
}
```

### 1.3 src/index.ts — exports centralizados

```typescript
// Sections
export { default as Hero }         from './components/sections/Hero.astro';
export { default as Features }     from './components/sections/Features.astro';
export { default as HowItWorks }   from './components/sections/HowItWorks.astro';
export { default as Testimonials } from './components/sections/Testimonials.astro';
export { default as Pricing }      from './components/sections/Pricing.astro';
export { default as FAQ }          from './components/sections/FAQ.astro';
export { default as TrustBar }     from './components/sections/TrustBar.astro';
export { default as CTASection }   from './components/sections/CTASection.astro';
export { default as ContactForm }  from './components/sections/ContactForm.astro';

// UI
export { default as Button }       from './components/ui/Button.astro';
export { default as Badge }        from './components/ui/Badge.astro';
export { default as Card }         from './components/ui/Card.astro';
export { default as Accordion }    from './components/ui/Accordion.astro';
export { default as StarRating }   from './components/ui/StarRating.astro';
```

---

## Parte 2: Como Escrever Componentes para a Biblioteca

Esta é a parte mais importante. Componentes mal escritos quebram o sistema de tematização.

### 2.1 Anatomia de um componente de seção

```astro
---
// src/components/sections/Hero.astro

// 1. Interface tipada — tudo que o projeto de cliente pode configurar
interface Props {
  // Conteúdo (obrigatório)
  headline: string;

  // Conteúdo (opcional com defaults sensatos)
  subheadline?: string;
  badge?: string;
  cta: {
    text: string;
    href: string;
  };
  ctaSecondary?: {
    text: string;
    href: string;
  };
  socialProof?: {
    rating: number;      // ex: 4.9
    count: string;       // ex: "200+"
    label: string;       // ex: "empresas atendidas"
  };

  // Layout
  variant?: 'centered' | 'split-left' | 'split-right';
}

// 2. Desestruturação com defaults
const {
  headline,
  subheadline,
  badge,
  cta,
  ctaSecondary,
  socialProof,
  variant = 'centered',
} = Astro.props;
---

<!-- 3. Markup semântico -->
<section class={`hero hero--${variant}`}>
  <div class="container">

    <div class="hero__content">
      {badge && <span class="hero__badge">{badge}</span>}

      <h1 class="hero__headline">{headline}</h1>

      {subheadline && (
        <p class="hero__subheadline">{subheadline}</p>
      )}

      <div class="hero__ctas">
        <a href={cta.href} class="btn btn--primary">
          {cta.text}
        </a>
        {ctaSecondary && (
          <a href={ctaSecondary.href} class="btn btn--ghost">
            {ctaSecondary.text}
          </a>
        )}
      </div>

      {socialProof && (
        <div class="hero__social-proof" aria-label="Prova social">
          <span class="hero__rating" aria-label={`Avaliação ${socialProof.rating}`}>
            ★ {socialProof.rating}
          </span>
          <span class="hero__count">
            {socialProof.count} {socialProof.label}
          </span>
        </div>
      )}
    </div>

    <!-- 4. Slot para mídia — cada cliente coloca o que quiser aqui -->
    <div class="hero__media">
      <slot name="media" />
    </div>

    <!-- 5. Slot para trust bar abaixo do conteúdo -->
    <slot name="below" />

  </div>
</section>

<!-- 6. CSS 100% via custom properties — NUNCA hardcodar valores -->
<style>
  .hero {
    padding: var(--section-padding-y) var(--container-padding);
    background: var(--color-surface);
  }

  .container {
    max-width: var(--container-max);
    margin-inline: auto;
  }

  .hero--centered .hero__content {
    text-align: center;
    max-width: 780px;
    margin-inline: auto;
  }

  .hero--split-left,
  .hero--split-right {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(2rem, 5vw, 5rem);
    align-items: center;
  }

  .hero--split-right .hero__content { order: 2; }
  .hero--split-right .hero__media   { order: 1; }

  .hero__badge {
    display: inline-block;
    font-size: var(--text-small);
    font-family: var(--font-body);
    color: var(--color-brand);
    background: var(--color-brand-light);
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius-badge);
    margin-bottom: 1rem;
  }

  .hero__headline {
    font-family: var(--font-heading);
    font-size: var(--text-hero);
    line-height: var(--leading-tight);
    color: var(--color-text-strong);
    margin-bottom: 1.25rem;
  }

  .hero__subheadline {
    font-family: var(--font-body);
    font-size: var(--text-subheadline);
    line-height: var(--leading-relaxed);
    color: var(--color-text-muted);
    margin-bottom: 2rem;
  }

  .hero__ctas {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .hero--centered .hero__ctas {
    justify-content: center;
  }

  /* Botões — estilos base que herdam os tokens */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.75rem;
    border-radius: var(--radius-button);
    font-family: var(--font-body);
    font-size: var(--text-body);
    font-weight: 500;
    text-decoration: none;
    transition: all var(--transition-base);
    cursor: pointer;
    border: 2px solid transparent;
  }

  .btn--primary {
    background: var(--color-brand);
    color: var(--color-brand-text);
    border-color: var(--color-brand);
  }

  .btn--primary:hover {
    background: var(--color-brand-hover);
    border-color: var(--color-brand-hover);
  }

  .btn--ghost {
    background: transparent;
    color: var(--color-brand);
    border-color: var(--color-brand);
  }

  .btn--ghost:hover {
    background: var(--color-brand-light);
  }

  .hero__social-proof {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: var(--text-small);
    color: var(--color-text-muted);
  }

  .hero__rating {
    color: #f59e0b;  /* âmbar para estrelas — exceção intencional */
    font-weight: 500;
  }

  /* Responsivo */
  @media (max-width: 768px) {
    .hero--split-left,
    .hero--split-right {
      grid-template-columns: 1fr;
    }

    .hero--split-right .hero__content,
    .hero--split-right .hero__media {
      order: unset;
    }
  }
</style>
```

### 2.2 Regras de ouro para componentes da biblioteca

1. **Nenhum valor visual hardcodado.** Cores, fontes, tamanhos e espaçamentos sempre via `var(--token)`.

2. **Props tipadas com interface TypeScript.** Sem `any`, sem props implícitas.

3. **Defaults sensatos para props opcionais.** O componente deve funcionar mesmo passando só o mínimo.

4. **Slots para conteúdo variável.** Mídia, CTAs adicionais, badges customizados — use slots, não props de string para HTML.

5. **Sem JavaScript no componente de seção** (a menos que seja uma island interativa). Animações ficam em `src/scripts/animations.ts` do projeto.

6. **Marcação semântica.** Seções são `<section>`, títulos usam hierarquia correta (`h1` no hero, `h2` nas demais seções), listas são `<ul>/<ol>`.

7. **Acessibilidade sempre.** `aria-label` em elementos sem texto, `alt` em imagens, `for` em labels.

---

## Parte 3: Como Alimentar a Biblioteca

### 3.1 Adicionando um componente novo

Fluxo correto: **biblioteca primeiro, projeto depois**.

```bash
# 1. Clone a biblioteca localmente
git clone https://github.com/seuuser/minha-lib-astro
cd minha-lib-astro

# 2. Crie o componente na pasta certa
touch src/components/sections/Pricing.astro

# 3. Desenvolva seguindo as regras da Parte 2
# Use um projeto de teste local para visualizar

# 4. Exporte no index.ts
# src/index.ts
export { default as Pricing } from './components/sections/Pricing.astro';

# 5. Atualize o CHANGELOG.md
# ## [1.x.x] - 2025-xx-xx
# ### Added
# - Componente Pricing com variantes 'cards' e 'table'

# 6. Bumpe a versão no package.json
# "version": "1.x.x"

# 7. Commit e push com tag
git add .
git commit -m "feat: add Pricing component"
git tag v1.x.x
git push && git push --tags
```

### 3.2 Extraindo um componente de um projeto de cliente

Quando você cria algo bom em um projeto de cliente e quer mover para a biblioteca:

**Passo 1 — Identificar o que é específico do cliente**

Antes de extrair, separe o que é configuração do cliente do que é componente genérico.

```astro
<!-- ❌ Versão presa no cliente (valores hardcodados) -->
<section style="background: #1a2b5c">
  <h2 style="color: white; font-family: 'Playfair Display'">
    Por que a Acme é diferente
  </h2>
  ...
</section>

<!-- ✅ Versão extraível para a biblioteca -->
<section class="features">
  <h2 class="features__title">
    <slot name="title" />
  </h2>
  ...
</section>
<!-- estilo vem dos tokens do projeto que o usar -->
```

**Passo 2 — Generalizar as props**

```typescript
// No projeto de cliente (antes)
interface Props {
  title: string;  // "Por que a Acme é diferente" — específico demais
}

// Na biblioteca (depois)
interface Props {
  title?: string;             // título opcional, pode vir via slot
  subtitle?: string;
  items: FeatureItem[];
  columns?: 2 | 3 | 4;       // configurável
  variant?: 'cards' | 'list' | 'icon-grid';
}
```

**Passo 3 — Mover, testar, exportar**

```bash
# Copie o componente generalizado para a biblioteca
cp src/components/sections/Features.astro ../minha-lib-astro/src/components/sections/

# Instale a nova versão no projeto de cliente
# package.json
"minha-lib-astro": "github:seuuser/minha-lib-astro#v1.x.x"

# Importe da biblioteca agora
import { Features } from 'minha-lib-astro';
```

---

## Parte 4: O Projeto Base (`_base-project`)

### 4.1 O que é e o que não é

O `_base-project` é um **template de estrutura**, não um projeto funcional. Ele contém:

- ✅ Todas as configurações (astro.config, tsconfig, biome)
- ✅ BaseLayout.astro com a estrutura do `<head>` completo
- ✅ `CLAUDE.md` com as instruções permanentes
- ✅ `tokens.css` vazio com os nomes das variáveis comentados
- ✅ `site.config.ts` com a interface tipada e exemplos comentados
- ✅ `manifesto.md` template para preencher
- ✅ GitHub Actions configurado
- ✅ `_headers` de segurança
- ✅ `.env.example` com todas as variáveis possíveis

O `_base-project` **não contém**:
- ❌ Conteúdo de nenhum cliente
- ❌ Nenhuma cor ou fonte específica nos tokens
- ❌ `index.astro` montado (só tem o layout)
- ❌ Imagens ou assets de cliente

### 4.2 CLAUDE.md do `_base-project`

Este arquivo fica na raiz e o Claude Code lê automaticamente ao abrir o projeto.

```markdown
# CLAUDE.md

## Sobre este projeto
Landing page de alto padrão construída com Astro 5.
Consulte o `manifesto.md` para todos os detalhes do projeto atual.

## Stack
- Astro 5.x + TypeScript strict
- Tailwind CSS v4 (CSS-first, sem tailwind.config.js)
- GSAP + ScrollTrigger para animações
- Motion One para micro-interações
- Resend para email transacional
- Plausible para analytics

## Componentes
Vêm de `minha-lib-astro` instalada como dependência.
Importar sempre de lá — nunca recriar localmente o que já existe na lib.

```typescript
import { Hero, Features, FAQ } from 'minha-lib-astro';
```

## Arquivos importantes
- `src/styles/tokens.css` — design tokens do cliente (cores, fontes, etc.)
- `src/data/site.config.ts` — todo o conteúdo do site (tipado)
- `src/pages/index.astro` — composição das sections
- `src/pages/api/contact.ts` — endpoint do formulário → Resend
- `src/layouts/BaseLayout.astro` — head com SEO, fontes, scripts

## Regras absolutas
1. NUNCA hardcodar cores, fontes ou tamanhos — sempre via `var(--token)` do tokens.css
2. SEMPRE usar `<Image />` do Astro, nunca `<img>` nativo
3. TypeScript strict — sem `any` em nenhum arquivo
4. Lighthouse ≥ 95 nas 4 métricas é requisito de entrega, não meta
5. Mobile-first em todo CSS
6. Sem `!important` em nenhum arquivo CSS

## Ordem de implementação
Sempre seguir a ordem das tarefas no `manifesto.md`.
Não pular etapas. Não criar arquivos não previstos sem perguntar antes.

## Quando tiver dúvida
Pergunte antes de agir. É melhor uma pergunta que uma implementação errada
que precisa ser desfeita.
```

### 4.3 Criando um novo projeto a partir do base

```bash
# Método simples (degit — sem histórico do template)
npx degit github:seuuser/_base-project projeto-acme
cd projeto-acme

# Inicia novo git
git init
git add .
git commit -m "chore: init from base project"

# Instala dependências (inclui minha-lib-astro)
pnpm install

# Cria novo repo no GitHub e faz push
gh repo create projeto-acme --private --push --source=.
```

---

## Parte 5: O Manifesto — Estrutura Completa

O `manifesto.md` é o documento que você envia ao Claude Code com tudo que ele precisa saber sobre o projeto. Quanto mais completo, melhor o resultado.

```markdown
# manifesto.md — [Nome do Cliente]

> Gerado em: [data]
> Projeto: [nome do repo]
> Status: Em desenvolvimento

---

## 1. IDENTIDADE DO PROJETO

- **Cliente:** Acme Consultoria Financeira
- **URL de produção:** acme.com.br
- **Objetivo da landing page:** Capturar leads para consultoria financeira B2B
- **Público-alvo:** Empresários e CFOs, 35-55 anos, empresas de R$500k–R$50M/ano
- **Tom de voz:** Sério, confiável, direto. Sem jargão financeiro desnecessário.
- **Diferencial principal:** Diagnóstico em 48h, processo 100% digital

---

## 2. DESIGN TOKENS

Aplicar em `src/styles/tokens.css`:

```css
:root {
  --color-brand:        oklch(42% 0.18 250);
  --color-brand-hover:  oklch(35% 0.18 250);
  --color-brand-light:  oklch(95% 0.05 250);
  --color-brand-text:   oklch(99% 0.005 250);

  --color-surface:      oklch(99% 0.005 260);
  --color-surface-alt:  oklch(96% 0.008 260);
  --color-border:       oklch(88% 0.01 260);

  --color-text-strong:  oklch(12% 0.01 260);
  --color-text-base:    oklch(30% 0.01 260);
  --color-text-muted:   oklch(55% 0.01 260);

  --font-heading:       "Playfair Display", serif;
  --font-body:          "Inter Variable", sans-serif;

  --radius-button:      4px;
  --radius-card:        8px;
}
```

---

## 3. COMPONENTES SELECIONADOS

Montar `src/pages/index.astro` com os componentes na ordem abaixo:

1. `<Hero>` — variante: `split-left`
2. `<TrustBar>` — logos de parceiros
3. `<Features>` — 3 itens, variante: `icon-grid`
4. `<HowItWorks>` — 4 etapas
5. `<Testimonials>` — 3 cards
6. `<CTASection>` — intermediário (sem formulário)
7. `<FAQ>` — 5 perguntas
8. `<ContactForm>` — formulário inline com CTA final

---

## 4. CONTEÚDO

### Hero
- **Badge:** "Especialistas em reestruturação financeira"
- **Headline:** "Sua empresa pode crescer sem depender de crédito caro"
- **Subheadline:** "Ajudamos mais de 200 empresas a reduzir custos financeiros
  em até 40% sem cortar equipe ou comprometer o crescimento"
- **CTA primário:** "Quero uma análise gratuita" → `#contato`
- **CTA secundário:** "Ver casos de sucesso" → `#depoimentos`
- **Social proof:** ⭐ 4.9 · 200+ empresas atendidas
- **Imagem:** `/src/assets/images/hero-consultor.webp` (a inserir depois)
- **Alt text da imagem:** "Consultor financeiro em reunião com cliente"

### TrustBar
- **Texto acima dos logos:** "Empresas que já transformaram seus resultados"
- **Logos:** Serão fornecidos em SVG (placeholder por ora)

### Features
- **Título da seção:** "Por que a Acme é diferente"
- **Subtítulo:** "Não somos um escritório de contabilidade. Somos parceiros de crescimento."
- **Itens:**
  1. **Diagnóstico em 48h** | Mapeamos toda a estrutura financeira em dois dias úteis
  2. **Sem burocracia** | Processo 100% digital, sem papelada ou reuniões desnecessárias
  3. **Resultado garantido** | Se não atingirmos a meta acordada, devolvemos os honorários

### HowItWorks
- **Título da seção:** "Como funciona"
- **Etapas:**
  1. **Diagnóstico gratuito** | Você agenda uma call de 30 minutos. Nós analisamos sua situação atual sem custo.
  2. **Plano personalizado** | Montamos uma estratégia específica para o seu negócio e apresentamos em 48h.
  3. **Implementação conjunta** | Nossa equipe executa junto com o seu time. Sem terceirizar o problema.
  4. **Acompanhamento contínuo** | 6 meses de suporte pós-implementação inclusos em todos os planos.

### Testimonials
- **Título da seção:** "O que nossos clientes dizem"
1. "Reduzimos o custo financeiro em 38% em apenas 4 meses. Superou todas as expectativas."
   — Carlos Mendes, CEO, Distribuidora Mendes (São Paulo)
2. "Processo simples, comunicação clara e resultado acima do que imaginávamos possível."
   — Patricia Souza, CFO, TechBrasil (Belo Horizonte)
3. "A melhor decisão que tomamos para o caixa da empresa nos últimos cinco anos."
   — Roberto Lima, Sócio-Fundador, Lima & Associados (Curitiba)

### CTASection (intermediário)
- **Headline:** "Mais de 200 empresas já reduziram seus custos"
- **Subheadline:** "A análise inicial é gratuita e leva 48 horas."
- **CTA:** "Agendar análise gratuita" → `#contato`

### FAQ
- **Título da seção:** "Perguntas frequentes"
1. **Quanto tempo leva o diagnóstico?**
   O diagnóstico completo é entregue em até 48 horas úteis após a reunião inicial.
2. **Quais documentos precisarei fornecer?**
   Basicamente os extratos bancários dos últimos 6 meses e o DRE do último exercício.
3. **Qual o investimento para contratar a Acme?**
   A análise inicial é gratuita. O projeto completo é orçado após o diagnóstico,
   com valores a partir de R$8.000.
4. **Atendem empresas de qual porte?**
   Empresas com faturamento entre R$500.000 e R$50.000.000 anuais.
5. **O atendimento é presencial ou online?**
   100% online. Atendemos em todo o Brasil.

### ContactForm (CTA final)
- **Headline:** "Pronto para reduzir seus custos financeiros?"
- **Subheadline:** "Análise gratuita. Sem compromisso. Resultado apresentado em 48 horas."
- **CTA do botão:** "Agendar análise gratuita"
- **Campos:** nome (text), empresa (text), faturamento (select: até 1M / 1M-5M / 5M-20M / acima de 20M), WhatsApp (tel)
- **Mensagem de sucesso:** "Ótimo! Entraremos em contato em até 1 hora útil."
- **Email de destino:** contato@acme.com.br

---

## 5. SEO

- **Title:** "Acme Consultoria | Reestruturação Financeira para Empresas"  ← 58 chars
- **Description:** "Reduzimos custos financeiros de empresas em até 40% em 4 meses.
  Diagnóstico gratuito em 48h. Mais de 200 empresas atendidas em todo o Brasil."  ← 155 chars
- **Canonical:** https://acme.com.br
- **OG Image:** `/public/og/og-acme.png` (a criar: 1200×630, texto + logo no fundo azul da marca)
- **Schema.org tipo:** `LocalBusiness`
- **Schema.org adicional:** `FAQPage` (usar as 5 perguntas do FAQ acima)

---

## 6. INTEGRAÇÕES

### Email (Resend)
- Variável de ambiente: `RESEND_API_KEY`
- Email de origem: `noreply@acme.com.br`
- Email de destino: `contato@acme.com.br`
- Assunto do email: `Novo lead: {nome} - {empresa}`

### Analytics
- Plausible: domínio `acme.com.br`
- Script: carregar via `<script defer>` no BaseLayout

### Pixels de marketing
- Meta Pixel ID: `[a preencher]`
- GTM ID: `[a preencher]`
- Evento de conversão: disparar no submit bem-sucedido do formulário

---

## 7. TAREFAS DE IMPLEMENTAÇÃO

Executar nesta ordem. Não pular etapas.

- [ ] 1. Aplicar tokens em `src/styles/tokens.css`
- [ ] 2. Preencher `src/data/site.config.ts` com todo o conteúdo acima
- [ ] 3. Configurar BaseLayout com SEO, fontes e scripts de terceiros
- [ ] 4. Montar `src/pages/index.astro` com os 8 componentes na ordem definida
- [ ] 5. Implementar `src/pages/api/contact.ts` com Resend
- [ ] 6. Adicionar Schema.org JSON-LD (LocalBusiness + FAQPage)
- [ ] 7. Verificar que todas as imagens têm `width` e `height` explícitos
- [ ] 8. Adicionar imagens placeholder onde as reais ainda não chegaram
- [ ] 9. Configurar variáveis de ambiente no `.env` (e documentar no `.env.example`)
- [ ] 10. Rodar `pnpm check` — resolver todos os erros TypeScript e Biome
- [ ] 11. Rodar Lighthouse localmente — garantir ≥ 95 nas 4 métricas
- [ ] 12. Testar formulário ponta a ponta (email chegando)
- [ ] 13. Testar em mobile (iOS Safari e Android Chrome)
- [ ] 14. Verificar dark mode

---

## 8. RESTRIÇÕES

- Sem `!important` em nenhum CSS
- Sem `any` em nenhum TypeScript
- Sem `<img>` nativo — sempre `<Image />` do Astro
- Sem JavaScript inline nas páginas `.astro` — usar `<script>` separado
- Sem dependências novas não previstas neste documento — perguntar antes
- Sem `console.log` no código final
```

---

## Parte 6: O Workflow Completo

### 6.1 Do briefing ao primeiro deploy

```
SEMANA 1 — ANTES DE ABRIR O EDITOR

1. Reunião de intake com o cliente (30–60 min)
   ↓
2. IA preenche os campos do manifesto a partir das notas da reunião
   ↓
3. Você revisa e escreve a copy final
   (headlines, subheadlines, CTAs, depoimentos, FAQ)
   ↓
4. Você seleciona os componentes no showcase
   (quais seções, qual variante de cada uma)
   ↓
5. Você define os tokens (cores da identidade, fontes, bordas)

HORA DO CÓDIGO

6. Clonar o _base-project
   $ npx degit github:seuuser/_base-project projeto-acme
   ↓
7. Instalar dependências (inclui minha-lib-astro)
   $ cd projeto-acme && pnpm install
   ↓
8. Criar o manifesto.md na raiz (preencher com o que foi preparado)
   ↓
9. Abrir no Claude Code:
   $ claude                    (na raiz do projeto)
   > Leia o manifesto.md e implemente as tarefas na ordem definida.
   ↓
10. Claude Code implementa. Você revisa cada tarefa.
    ↓
11. Ajustes de polish (animações, detalhes visuais)
    ↓
12. Lighthouse ≥ 95 confirmado
    ↓
13. Push para GitHub → deploy automático no Cloudflare Pages
    ↓
14. Teste final em produção → entrega para o cliente
```

### 6.2 Como instruir o Claude Code

O CLAUDE.md já dá o contexto permanente. Para cada sessão de trabalho, use prompts claros:

```
# Para começar do zero
"Leia o manifesto.md e implemente as tarefas na ordem definida,
começando pelo tokens.css e site.config.ts."

# Para uma tarefa específica
"Implemente o endpoint src/pages/api/contact.ts conforme
especificado na seção 6 do manifesto.md. Use Resend com React Email."

# Para revisar o que foi feito
"Rode pnpm check e corrija todos os erros de TypeScript e Biome.
Não altere nenhuma lógica — apenas a tipagem."

# Para ajustes visuais
"Os botões primários estão com padding muito pequeno no mobile.
Ajuste o componente de acordo com o padrão mobile-first do STACK-STANDARD.md."

# Para auditoria final
"Revise o projeto contra o STACK-STANDARD.md e marque cada item
do checklist. Para os que estiverem com problema, liste o que precisa corrigir."
```

### 6.3 Depois da entrega — o que vai para a biblioteca

Após entregar um projeto, avalie:

```
Para cada componente ou pattern criado no projeto:

1. É genérico o suficiente para outros clientes?
   - Sim → extrair para minha-lib-astro (Parte 3.2)
   - Não → manter no projeto, documentar no CLAUDE.md do projeto

2. Resolveu um problema que você vai ter de novo?
   - Sim → extrair definitivamente
   - Talvez → deixar no projeto e decidir no próximo

3. O código segue os padrões da biblioteca?
   - Não → refatorar antes de extrair
```

---

## Parte 7: Versionamento da Biblioteca

### 7.1 Convenção de versões

Use Semantic Versioning (semver):

| Tipo de mudança | Versão | Exemplo |
|---|---|---|
| Correção de bug, sem quebrar nada | PATCH: 1.0.X | 1.0.1 |
| Novo componente ou prop opcional | MINOR: 1.X.0 | 1.1.0 |
| Mudança que quebra o que existia | MAJOR: X.0.0 | 2.0.0 |

### 7.2 CHANGELOG.md

Manter um CHANGELOG na raiz da biblioteca:

```markdown
# CHANGELOG

## [1.2.0] - 2025-06-01
### Added
- Componente `Pricing` com variantes `cards` e `table`
- Prop `columns` no componente `Features` (aceita 2, 3 ou 4)

## [1.1.0] - 2025-05-15
### Added
- Componente `TrustBar` para logos de parceiros
- Slot `below` no `Hero` para conteúdo após o CTA

### Fixed
- CLS no componente `Testimonials` (imagens sem dimensões explícitas)

## [1.0.0] - 2025-05-01
### Added
- Lançamento inicial com Hero, Features, HowItWorks, Testimonials, FAQ, CTASection, ContactForm
```

### 7.3 Instalando versões específicas nos projetos

```json
// package.json do projeto de cliente
{
  "dependencies": {
    "minha-lib-astro": "github:seuuser/minha-lib-astro#v1.2.0"
  }
}
```

```bash
# Para atualizar um projeto específico
pnpm update minha-lib-astro

# Para verificar qual versão está instalada
pnpm list minha-lib-astro
```

---

## Referência Rápida — Comandos do Dia a Dia

```bash
# Novo projeto de cliente
npx degit github:seuuser/_base-project nome-do-projeto
cd nome-do-projeto && pnpm install

# Adicionar novo componente à biblioteca
cd minha-lib-astro
# ... criar componente ...
git tag v1.x.x && git push --tags

# Atualizar biblioteca num projeto
cd projeto-cliente
pnpm update minha-lib-astro

# Verificar qualidade do código
pnpm check          # TypeScript + Biome

# Build local
pnpm build && pnpm preview

# Lighthouse local
pnpm lhci autorun

# Abrir Claude Code no projeto
claude              # na raiz do projeto, lê CLAUDE.md automaticamente
```
