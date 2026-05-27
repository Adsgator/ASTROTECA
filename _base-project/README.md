# _base-project — Padrão Adsgator de Landing Page

Base de partida para todos os projetos de landing page da Adsgator. Inclui tokens de design, animações, componentes de UI e estrutura pronta para personalização por cliente.

---

## 1. Iniciando um novo projeto

```bash
# 1. Copie a base para a pasta do novo cliente
cp -r _base-project projetos/nome-do-cliente

# 2. Entre na pasta e instale as dependências
cd projetos/nome-do-cliente
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Abra .env e preencha todos os valores antes de continuar

# 4. Preencha o manifesto do projeto
# Abra MANIFESTO-TEMPLATE.md, renomeie para MANIFESTO.md e preencha
# Envie o MANIFESTO.md ao Claude para configurar cores, textos e componentes

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

---

## 2. Como usar o manifesto

O arquivo `MANIFESTO-TEMPLATE.md` é o ponto de partida de cada projeto. Fluxo:

1. Copie `MANIFESTO-TEMPLATE.md` para `MANIFESTO.md`
2. Preencha todas as seções com as informações do cliente:
   - Identidade e tom de comunicação
   - Paleta de cores (valores hexadecimais)
   - Tipografia (nomes exatos do Google Fonts)
   - Textos de cada seção da página
   - Configuração técnica (domínio, GTM, WhatsApp)
   - SEO e Schema.org
   - Lista de imagens disponíveis
3. Envie o `MANIFESTO.md` ao Claude com a instrução: "Configure o projeto a partir deste manifesto"
4. O Claude vai atualizar `tailwind.config.js`, `.env`, fontes e montar `src/pages/index.astro`

---

## 3. Tokens do tailwind.config.js que precisam ser trocados por projeto

Ao personalizar um projeto, altere apenas os **valores** — nunca os nomes dos tokens. Isso garante que todos os componentes da biblioteca continuem funcionando sem ajuste.

### Cores obrigatórias
| Token | O que é |
|---|---|
| `primary` | Cor principal da marca |
| `primary-dark` | Variante escura (hover, destaques) |
| `secondary` | Acento / CTA (ex: dourado, coral) |
| `complement` | Tom complementar para gradientes |
| `background` | Fundo geral da página |
| `surface` | Fundo de seções alternadas |
| `surface-alt` | Fundo de seções ainda mais contrastadas |
| `text-main` | Texto principal |
| `text-soft` | Texto secundário |
| `text-muted` | Placeholder, legenda |
| `border` | Bordas e divisores |

> `wa` (#25D366) é fixo — não altere.

### Sombras coloridas
As sombras `primary-sm`, `primary-md`, `secondary-sm` e `secondary-md` usam RGBA hardcoded das cores padrão. Ao trocar `primary` ou `secondary`, atualize também os valores RGBA correspondentes nas sombras.

### Tipografia
| Token | Onde trocar |
|---|---|
| `fontFamily.serif` | Fonte de títulos (Google Fonts ou @fontsource) |
| `fontFamily.sans` | Fonte de corpo |

Lembre de atualizar os `@import` em `src/styles/global.css` com os pesos corretos da fonte escolhida.

---

## 4. Atributos data-* disponíveis para animações

O componente `ScrollAnimations.tsx` (carregado com `client:load` no Layout) ativa automaticamente todos os atributos abaixo:

### Animações de entrada (scroll)
| Atributo | Efeito |
|---|---|
| `data-animate` | Entra de baixo (translateY 30px → 0) |
| `data-animate-left` | Entra da esquerda (translateX -30px → 0) |
| `data-animate-right` | Entra da direita (translateX 30px → 0) |
| `data-animate-scale` | Escala de 0.95 → 1 com fade |

### Animações de grupo (stagger)
```html
<div data-animate-group>
  <div data-animate-item>Item 1</div>
  <div data-animate-item>Item 2</div>
  <div data-animate-item>Item 3</div>
</div>
```
Os itens entram em sequência com intervalo de 100ms entre cada um.

### Contador numérico
```html
<!-- Anima de 0 até o valor do atributo quando entra na viewport -->
<span data-counter="1500">0</span>

<!-- Formata automaticamente com separador de milhar se > 999 -->
<span data-counter="12000">0</span> <!-- exibe "12.000" -->
```

### Parallax sutil
```html
<!-- Factor: 0.1 (sutil) a 0.5 (intenso) -->
<div data-parallax="0.2">
  <img src="foto.webp" alt="" />
</div>
```
O elemento se move verticalmente proporcional ao scroll. Ideal para imagens de fundo ou elementos decorativos.

> Todos os efeitos são desativados automaticamente quando `prefers-reduced-motion: reduce` está ativo.

---

## 5. Como importar componentes da biblioteca Astroteca

Os componentes da Astroteca estão disponíveis como pacote npm instalado em `package.json`. Para usar:

```astro
---
// src/pages/index.astro
import HeroSplit from 'astroteca/HeroSplit.astro';
import SobreFoto from 'astroteca/SobreFoto.astro';
import GridServicos from 'astroteca/GridServicos.astro';
import Depoimentos from 'astroteca/Depoimentos.astro';
import FAQ from 'astroteca/FAQ.astro';
import CTAFinal from 'astroteca/CTAFinal.astro';
---

<Layout>
  <HeroSplit
    headline="Título principal"
    sub="Subtítulo da hero"
    cta="Quero saber mais"
    ctaHref="#contato"
    image="/img/hero.webp"
  />
  <SobreFoto ... />
  <GridServicos servicos={[...]} />
  <Depoimentos items={[...]} />
  <FAQ items={[...]} />
  <CTAFinal ... />
</Layout>
```

Cada componente aceita apenas props documentadas — sem CSS customizado necessário. Todos os tokens de cores, tipografia e espaçamento vêm automaticamente do `tailwind.config.js` do projeto.

### Padrão de montagem da página

Ordem recomendada de seções para landing page de profissional liberal:

1. Header (fixo, incluso no Layout)
2. Hero (imagem + headline + CTA)
3. Confiança (logos, certificações, números)
4. Sobre (foto + texto + citação)
5. Serviços (grid de cards)
6. Diferenciais (ícone + título + texto)
7. Como funciona (passos numerados)
8. Depoimentos (carrossel ou grid)
9. FAQ (accordion)
10. CTA Final (fundo escuro ou colorido)
11. Footer

---

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

| Variável | Descrição |
|---|---|
| `PUBLIC_SITE_URL` | URL completa do site (sem barra final) |
| `PUBLIC_SITE_NAME` | Nome do cliente/empresa |
| `PUBLIC_GTM_ID` | ID do Google Tag Manager (GTM-XXXXXXX) |
| `PUBLIC_WA_NUMBER` | Número WhatsApp com DDI (5511999999999) |
| `PUBLIC_WA_MESSAGE` | Mensagem pré-preenchida do WhatsApp |
| `PUBLIC_SEO_TITLE` | Title tag da página |
| `PUBLIC_SEO_DESCRIPTION` | Meta description (até 160 caracteres) |
| `PUBLIC_SEO_KEYWORDS` | Keywords separadas por vírgula |

Todas as variáveis são tipadas em `src/env.d.ts` — o TypeScript alertará se alguma estiver faltando.
