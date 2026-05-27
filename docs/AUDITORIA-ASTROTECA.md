# Auditoria Completa — Astroteca
**Data:** 27/05/2026  
**Arquivos analisados:** 39 (snapshot parcialmente truncado após linha 277)

---

## Veredicto Geral

O projeto está **bem mais avançado do que o esperado**. A estrutura é sólida, o design system é profissional, os tipos TypeScript são cuidadosos e você já foi além do que foi documentado — tem `ExtractForm`, `RemoveForm`, `AdminPanel`, rotas de API para extração e remoção, e 12 páginas de preview criadas.

Dito isso, tem **problemas reais que precisam ser resolvidos** antes de você considerar isso pronto. Vou separar por grau de urgência.

---

## 🔴 Crítico — Quebra ou compromete o funcionamento

### 1. Builder.tsx tem 29.4KB e ComponentBrowser.tsx tem 29.8KB

Isso é sintoma de componentes fazendo coisas demais. Um componente React saudável raramente passa de 8-10KB. Com 29KB cada, esses arquivos provavelmente têm:

- Estado demais em um lugar só
- Lógica de negócio misturada com renderização
- Sub-componentes definidos dentro do mesmo arquivo
- Funções utilitárias que deveriam estar em `lib/`

**Consequências práticas:**
- Difícil de debugar quando algo quebrar
- Difícil de editar sem quebrar outra coisa
- O Astro vai hidratar tudo isso no cliente — impacto na performance

**O que fazer:** não precisa refatorar agora, mas está na lista.

---

### 2. Inconsistência entre `ComponentCategory` no tipo e as categorias do `AdminForm`

No `types/index.ts`:
```typescript
export type ComponentCategory =
  | 'Hero' | 'Navigation' | 'Features' | 'Pricing'
  | 'Testimonials' | 'CTA' | 'FAQ' | 'Stats'
  | 'Gallery' | 'Contact' | 'Footer' | 'Misc'
```

No `AdminForm.tsx`:
```typescript
const CATEGORIES = [
  'Hero', 'Features', 'Pricing', 'Testimonials', 'CTA', 'Footer',
  'Navigation', 'FAQ', 'Gallery', 'Contact', 'About', 'Stats', 'Team', 'Misc',
]
```

**Diferenças:**
- `AdminForm` tem `About` e `Team` — o tipo não tem
- O tipo tem todas as que o `AdminForm` tem (menos About e Team)

Isso significa que se alguém publicar um componente na categoria `About` ou `Team`, o TypeScript vai reclamar em algum ponto, ou pior — vai silenciosamente aceitar um valor inválido por causa do cast `category as ComponentCategory['category']` na linha 212 do AdminForm.

**Correção imediata** no `types/index.ts`:
```typescript
export type ComponentCategory =
  | 'Hero' | 'Navigation' | 'Features' | 'Pricing'
  | 'Testimonials' | 'CTA' | 'FAQ' | 'Stats'
  | 'Gallery' | 'Contact' | 'Footer'
  | 'About' | 'Team' | 'Misc'  // ← adicionar esses dois
```

---

### 3. `PropDefinition.type` tem `'array'` e `'string[]'` como opções separadas

```typescript
export interface PropDefinition {
  type: 'string' | 'boolean' | 'number' | 'string[]' | 'Record<string, string>' | 'array'
  //                                                                                ^^^^^^
  //                                          'string[]' e 'array' são a mesma coisa
```

Isso vai causar inconsistência no registry.json — alguns componentes vão ter `"type": "array"` e outros `"type": "string[]"` para o mesmo tipo de dado. O código que consome esse valor vai precisar tratar os dois casos.

**Correção:** escolha um e remova o outro. Recomendo manter `'string[]'` por ser mais específico, ou `'array'` por ser mais simples. Mas precisa ser um só.

---

### 4. `previewUrl` e `previewPath` coexistem em `ComponentMeta`

```typescript
export interface ComponentMeta {
  previewUrl?: string    // ← qual dos dois é usado?
  previewPath?: string   // ← e este?
```

Os dois existem mas provavelmente só um é populado de verdade. Se o ComponentBrowser usa `previewUrl` mas a API publica `previewPath` (ou vice-versa), o preview simplesmente não vai aparecer — sem erro, só iframe vazio.

**Correção:** escolha um nome, remova o outro, busque todos os usos no projeto e padronize.

---

### 5. Token do GitHub exposto no cliente via localStorage

O `AdminForm.tsx` faz isso:
```typescript
const raw = localStorage.getItem('acs-settings')
const settings: AppSettings = JSON.parse(raw)
// settings.githubToken é enviado para /api/publish-component
```

Isso significa que o `githubToken` fica salvo em `localStorage` — acessível por qualquer JavaScript rodando na página, incluindo extensões de browser e scripts injetados. E é enviado no body de uma requisição POST, o que aparece no Network tab do DevTools.

Para uso pessoal num computador próprio, o risco é baixo. Mas se você um dia deployar isso num servidor público ou usar em wi-fi compartilhado, o token fica exposto.

**Solução ideal:** o token fica só no `.env` do servidor e nunca vai para o cliente. A API usa `import.meta.env.GITHUB_TOKEN` diretamente, sem receber do frontend.

**Solução prática para agora:** não deployar o Astroteca publicamente. Manter só local ou em rede privada.

---

## 🟡 Importante — Não quebra agora, mas vai causar problema

### 6. `app.css` com 20.7KB é grande demais

20KB de CSS para a interface interna de uma ferramenta que só você usa é muito. Isso geralmente indica:

- Classes duplicadas ou muito parecidas
- CSS que foi copiado e adaptado várias vezes
- Estilos para componentes que não existem mais
- Comentários muito verbosos tomando espaço

Não precisa auditar agora, mas quando tiver tempo, uma passada com olho crítico vai encontrar pelo menos 30-40% de código morto.

---

### 7. `AdminPanel.tsx` existe mas não aparece nas páginas principais

O snapshot mostra `AdminPanel.tsx` em `components/` mas as pages são `admin.astro`, `admin/extract.astro` e `admin/remove.astro`. Isso sugere que:

- Ou `AdminPanel.tsx` é usado dentro de `admin.astro` como wrapper
- Ou é um arquivo legado que não é mais usado

Se for legado, está ocupando espaço e criando confusão. **Verifique se é importado em algum lugar e, se não for, delete.**

---

### 8. `extract-component.ts` na API tem 15.3KB

Uma rota de API com 15KB é muito. Isso sugere que ela está fazendo coisas que deveriam estar em `lib/github.ts` ou `lib/utils.ts`. A lógica de extração de props do `.astro`, o parsing do código, a geração dos arquivos — tudo isso provavelmente está inline na rota.

**Consequência:** se você quiser reutilizar qualquer parte dessa lógica em outro lugar (ex: no script CLI `extract-component.mjs`), vai ter que duplicar o código.

**O que fazer:** mover a lógica pesada para `lib/` e deixar a rota só como orquestrador.

---

### 9. `PreviewLayout.astro` existe mas a relação com `[...slug].astro` não é clara

Você tem um layout específico para preview, o que é bom. Mas também tem páginas individuais de preview (hero-split.astro, etc.) e o `[...slug].astro` dinâmico. A questão é: qual deles é o canônico?

Se as páginas individuais usam `PreviewLayout` e o `[...slug].astro` tem sua própria estrutura HTML inline, o resultado visual pode ser diferente entre os dois. O ComponentBrowser vai apontar para `/preview/hero-split` que pode bater na página individual (boa) ou no slug dinâmico (pode não funcionar).

**O que verificar:** abra `http://localhost:4321/preview/hero-split` no browser. Se aparece o componente renderizado corretamente, está ok. Se aparecer erro ou HTML nu, tem problema.

---

### 10. Sem feedback de loading no ComponentBrowser quando o registry está carregando

O erro que você viu antes (`Erro ao buscar registry: 404`) some quando o registry existe, mas não há indicação visual clara enquanto o fetch está acontecendo. Se o GitHub estiver lento, o usuário fica olhando para uma tela vazia sem saber se está carregando ou se deu erro.

**O que deve existir:** um estado de loading com skeleton ou spinner enquanto o registry carrega, e um estado de erro claro (não só no console) quando falha.

---

## 🟢 O que está bem feito

### ✅ Sistema de tipos TypeScript

O `types/index.ts` é bem estruturado. Todos os tipos relevantes estão centralizados, nomeados com clareza, e separados por domínio (componentes, builder, configurações, GitHub, admin). Isso vai facilitar muito qualquer refatoração futura.

---

### ✅ `ui.ts` com classes Tailwind centralizadas

```typescript
export const inputBase = 'w-full rounded-lg border border-white/5 bg-raised/70...'
export const btnPrimary = `${btnBase} bg-accent text-black hover:bg-accent-hover...`
export const cardBase = 'rounded-xl border border-white/[0.06] bg-surface/60...'
```

Essa abordagem é excelente. Em vez de repetir strings longas de Tailwind em cada componente, você tem uma fonte única da verdade. Quando quiser mudar o estilo de todos os inputs, muda em um lugar. Poucos projetos fazem isso e faz diferença enorme na manutenção.

---

### ✅ Design system no `app.css`

O que vi do CSS mostra variáveis bem organizadas, camadas de superfície (bg, surface, raised), sistema de cores consistente com accent, ok, fail, e efeitos glass implementados corretamente. O visual do projeto vai ser profissional por causa disso.

---

### ✅ Rotas de admin separadas

Ter `/admin/extract` e `/admin/remove` como páginas separadas em vez de tudo dentro de `/admin` é uma decisão correta. Cada ação tem sua URL, seu contexto e pode ser acessada diretamente. Bom.

---

### ✅ 12 páginas de preview já criadas

hero-split, hero-centered, hero-simples, features-grid-3, testimonials-cards, pricing-cards, cta-banner, faq-accordion, footer-simples, contact-section, button, avaliacoes-google. Isso é muito trabalho feito. Significa que o sistema de preview está funcionando ou está muito perto disso.

---

### ✅ `copy` no `ComponentMeta`

```typescript
export interface ComponentMeta {
  copy?: Record<string, string>
```

Guardar os valores de copy (headline, subheadline, etc.) junto com os metadados do componente é inteligente. Isso vai alimentar o MANIFESTO.md com conteúdo real em vez de placeholders vazios.

---

### ✅ `AdminForm` reseta o estado após publicar com sucesso

```typescript
setFeedback({ type: 'ok', message: `Componente "${name}" publicado com sucesso!` })
setName('')
setDescription('')
// etc...
```

Detalhe pequeno mas importante. Sem isso, o formulário ficaria com os dados do componente anterior e o usuário poderia publicar acidentalmente o mesmo componente duas vezes.

---

## 📋 Lista de Correções por Prioridade

### Fazer agora (15 minutos)

```
1. Adicionar 'About' e 'Team' ao ComponentCategory em types/index.ts
2. Remover 'array' ou 'string[]' do PropDefinition.type — escolher um
3. Remover previewUrl OU previewPath do ComponentMeta — escolher um
4. Verificar se AdminPanel.tsx é usado; se não, deletar
5. Testar /preview/hero-split no browser e confirmar que renderiza
```

### Fazer em breve (1-2 horas)

```
6. Adicionar loading skeleton no ComponentBrowser durante fetch do registry
7. Adicionar estado de erro visível (não só console.error) quando registry falha
8. Mover lógica pesada de extract-component.ts para lib/
9. Verificar se PreviewLayout.astro é usado em todas as páginas de preview
```

### Fazer quando tiver tempo (não urgente)

```
10. Auditar app.css em busca de CSS morto
11. Quebrar Builder.tsx em sub-componentes menores
12. Quebrar ComponentBrowser.tsx em sub-componentes menores
13. Considerar mover githubToken para .env em vez de localStorage
```

---

## O que o snapshot não mostrou (e precisa verificar manualmente)

O arquivo foi truncado e não vi o conteúdo de:

- `Builder.tsx` — o maior e mais crítico
- `ComponentBrowser.tsx` — o segundo maior
- `github.ts` — onde ficam todas as chamadas de API
- `manifest.ts` — gerador do MANIFESTO.md
- `[...slug].astro` — o preview dinâmico
- `AppLayout.astro` — o shell principal
- Todas as pages (index, builder, admin, config)

Para uma auditoria 100% completa, manda um novo snapshot que capture esses arquivos. O mais importante é ver o `github.ts` e o `[...slug].astro`.

---

## Resumo executivo

| Categoria | Status |
|---|---|
| Estrutura de pastas | ✅ Sólida |
| TypeScript | ⚠️ Bom mas com inconsistências |
| Design system | ✅ Profissional |
| Sistema de preview | ⚠️ Existe mas precisa verificar |
| Segurança do token | ⚠️ Aceitável só para uso local |
| Tamanho dos componentes | 🔴 Builder e Browser grandes demais |
| Cobertura de funcionalidades | ✅ Além do planejado |
| Pronto para uso diário | ⚠️ Quase — corrige os 5 itens críticos primeiro |
