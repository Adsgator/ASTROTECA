# Scripts de Automação

## `npm run new`
Cria um componente novo na biblioteca passo a passo.

## `npm run extract caminho/Componente.astro`
Extrai um componente de um projeto existente para a biblioteca.
Detecta as props automaticamente e registra no registry.json.

## `npm run previews`
Gera as páginas de preview para todos os componentes.
Rode isso após adicionar ou modificar componentes.

## Fluxo completo para adicionar um componente novo:
1. `npm run new` → responde as perguntas
2. Implementa o HTML/CSS no arquivo gerado
3. `npm run previews` → gera as páginas de preview
4. `cd minha-lib-astro && git push` → sobe para o GitHub

## Fluxo para extrair um componente de outro projeto:
1. `npm run extract ../outro-projeto/src/components/Hero.astro`
2. Revisa o arquivo (ajusta cores hardcoded para CSS variables)
3. `npm run previews`
4. `cd minha-lib-astro && git push`
