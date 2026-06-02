# Scripts de Automação

> Forma recomendada no dia a dia: use a **UI do studio** — ela publica no GitHub
> automaticamente e evita mexer no código à mão.
> - `/admin` → **Adicionar componente** (cole o `.astro` gerado pelo Claude via COMPONENT-BLUEPRINT.md)
> - `/admin/extract` → **Extrair componente** de um projeto de cliente (arraste o `.astro` ou cole o caminho)
>
> Ambos usam o mesmo motor (`src/lib/component-writer.ts`). Os scripts CLI abaixo
> fazem o mesmo pelo terminal e compartilham o núcleo `scripts/component-core.mjs`.

## `npm run new`
Cria um componente novo na biblioteca passo a passo. O template gerado já segue o
padrão de tokens do [COMPONENT-BLUEPRINT.md](../COMPONENT-BLUEPRINT.md)
(classes Tailwind dos tokens — `bg-surface`, `text-text-main`, `font-serif`, `.section-py`).

## `npm run extract caminho/Componente.astro`
Extrai um componente de um projeto existente para a biblioteca. Detecta props,
sanitiza (remove assets e dados sensíveis, preserva `import type`), gera o preview,
registra no `registry.json` e **commita/publica automaticamente** (lib + Astroteca).

## `npm run previews`
Gera as páginas de preview para todos os componentes. Rode após adicionar ou
modificar componentes manualmente.

## Convenção de tokens
Os componentes da biblioteca usam **classes Tailwind dos tokens** da stack v4
(`bg-primary`, `text-text-main`, `font-serif`) ou `var(--t-...)` em CSS escopado —
nunca valores literais nem classes de paleta nativa do Tailwind. Detalhes no
[COMPONENT-BLUEPRINT.md](../COMPONENT-BLUEPRINT.md).

## Fluxo para criar um componente novo pelo CLI
1. `npm run new` → responde as perguntas
2. Implementa o HTML/CSS no arquivo gerado (seguindo as classes de token)
3. `npm run previews` → gera as páginas de preview
4. `cd minha-lib-astro && git push` → sobe a biblioteca para o GitHub
