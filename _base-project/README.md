# Projeto Cliente

Este projeto foi gerado pelo Astroteca Builder.

## Inicio Rapido

1. Clone o repositorio
2. `npm install`
3. Leia o arquivo `MANIFESTO.md` na raiz
4. Siga as instrucoes do manifesto para instalar componentes e personalizar

## Instrucoes para Claude Code

Ao trabalhar neste projeto com Claude Code:

1. Leia `MANIFESTO.md` primeiro - ele contem todas as decisoes de design e lista de componentes
2. Instale componentes do registro:
   ```bash
   npm install
   # Os componentes ja estao disponiveis via `minha-lib-astro` (instalado em package.json)
   # Importe-os em `src/pages/index.astro` conforme listado no manifesto
   ```
3. Preencha as variaveis CSS em `src/styles/theme.css` com as cores e fontes do manifesto
4. Monte a pagina em `src/pages/index.astro` seguindo a ordem de componentes do manifesto
5. Adapte os textos (copy) de cada componente conforme especificado na secao "Copy / Props"
6. Teste com `npm run dev` e faca build com `npm run build`
