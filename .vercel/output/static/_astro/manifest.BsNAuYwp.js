const i=`# Projeto: {{clientName}}
**Gerado em:** {{date}}
**Tipo:** {{projectType}}
**Nicho:** {{niche}}
**Objetivo da pagina:** {{pageGoal}}
**URL do site:** {{siteUrl}}
**Google Analytics:** {{googleAnalyticsId}}
**Namespace npm:** {{npmNamespace}}

---

## Direcao de Arte

| Item | Valor |
|------|-------|
| Primary | {{colorPrimary}} |
| Secondary | {{colorSecondary}} |
| Background | {{colorBackground}} |
| Texto | {{colorText}} |
| Heading font | {{fontHeading}} |
| Body font | {{fontBody}} |
| Mood | {{mood}} |
| Referencias | {{references}} |

{{#notes}}
### Notas
{{notes}}
{{/notes}}

---

## Componentes Selecionados

{{components}}

---

## Instrucoes para o Claude Code

1. Duplicar a pasta base e renomear para \`{{repoName}}\`
2. Rodar \`npm install\`
3. Criar \`src/styles/theme.css\` com as variaveis CSS abaixo:
\`\`\`css
:root {
  --color-primary: {{colorPrimary}};
  --color-secondary: {{colorSecondary}};
  --color-bg: {{colorBackground}};
  --color-text: {{colorText}};
  --font-heading: '{{fontHeading}}', serif;
  --font-body: '{{fontBody}}', sans-serif;
}
\`\`\`
4. Implementar os componentes na ordem listada acima
5. Preencher cada componente com o copy correspondente
6. Colocar imagens na pasta \`/public/\` com os nomes referenciados
7. Rodar \`npm run dev\` e validar responsividade em mobile e desktop
8. Fazer build com \`npm run build\` e confirmar zero erros

---

**Gerado por:** {{studioName}}
`;function d(o,e){let a=o;for(const[r,n]of Object.entries(e))a=a.replace(new RegExp(`{{${r}}}`,"g"),n);return a=a.replace(/\{\{#\w+\}\}[\s\S]*?\{\{\/\w+\}\}/g,r=>{const n=r.match(/\{\{#(\w+)\}\}/);if(!n)return"";const t=n[1],c=e[t];return!c||c.trim()===""?"":r.replace(/\{\{#\w+\}\}/,"").replace(/\{\{\/\w+\}\}/,"")}),a}function p(o){return o.length===0?"_Nenhum componente selecionado_":o.map((e,a)=>{const r=e.copy||{},n=Object.entries(r).filter(([,t])=>t.trim()!=="").map(([t,c])=>`  - **${t}:** ${c}`).join(`
`);return`### Secao ${a+1} — \`${e.meta.id}\`
**Componente:** ${e.meta.name}
${n?`
**Copy / Props:**
${n}`:""}`}).join(`

`)}function u(o,e,a,r){const{manifestTemplate:n,studioName:t,npmNamespace:c}=r,s=n?.trim()?n:i,l=o.clientName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),m={clientName:o.clientName,date:new Intl.DateTimeFormat("pt-BR").format(new Date),projectType:o.projectType,niche:o.niche,pageGoal:o.pageGoal,googleAnalyticsId:o.googleAnalyticsId||"—",siteUrl:o.siteUrl||"—",npmNamespace:c||"—",repoName:l,colorPrimary:e.colorPrimary,colorSecondary:e.colorSecondary,colorBackground:e.colorBackground,colorText:e.colorText,fontHeading:e.fontHeading,fontBody:e.fontBody,mood:e.mood,references:e.references||"—",notes:e.notes||"",components:p(a),studioName:t||"Astro Component Studio"};return d(s,m)}export{i as D,u as g};
