import{j as e}from"./jsx-runtime.TBa3i5EZ.js";import{r as n}from"./index.CVf8TyFT.js";import{g as Z}from"./manifest.BsNAuYwp.js";function u({label:b,children:c}){return e.jsxs("div",{className:"field",children:[e.jsx("label",{className:"label",children:b}),c]})}function m({label:b,value:c}){return e.jsxs("div",{className:"builder__pair",children:[e.jsx("span",{className:"builder__pair-label",children:b}),e.jsx("span",{className:"builder__pair-value",children:c||"-"})]})}function C({label:b,value:c,onChange:v}){return e.jsxs("div",{className:"field",children:[e.jsx("label",{className:"label",children:b}),e.jsxs("div",{className:"builder__color-row",children:[e.jsx("input",{type:"color",value:c,onChange:i=>v(i.target.value),className:"builder__color-picker"}),e.jsx("input",{type:"text",className:"input",value:c,onChange:i=>v(i.target.value),placeholder:"#000000"})]})]})}const ee=["Configurar","Componentes","Revisar"],ae={clientName:"",projectType:"landing-page",niche:"",pageGoal:"",siteUrl:"",googleAnalyticsId:""},se={colorPrimary:"#6366f1",colorSecondary:"#f59e0b",colorBackground:"#ffffff",colorText:"#111111",fontHeading:"Inter",fontBody:"Inter",mood:"",references:"",notes:""};function le({availableComponents:b}){const[c,v]=n.useState("Configurar"),[i,F]=n.useState(ae),[o,j]=n.useState(se),[d,_]=n.useState([]),[x,H]=n.useState(""),[g,k]=n.useState(null),[N,z]=n.useState(b),[P,G]=n.useState({}),[E,w]=n.useState({}),[T,B]=n.useState(!1),[y,M]=n.useState(null),[I,O]=n.useState("");n.useEffect(()=>{const a=localStorage.getItem("acs-settings");if(a){const t=JSON.parse(a);t.defaultFontHeading&&j(r=>({...r,fontHeading:t.defaultFontHeading||r.fontHeading})),t.defaultFontBody&&j(r=>({...r,fontBody:t.defaultFontBody||r.fontBody})),t.defaultColorPrimary&&j(r=>({...r,colorPrimary:t.defaultColorPrimary||r.colorPrimary}))}const s=localStorage.getItem("acs-builder-components");if(s){const t=JSON.parse(s);_(t);const r={};t.forEach(l=>{l.meta.copy&&(r[l.meta.id]={...l.meta.copy})}),w(r)}if(b.length===0){const t=localStorage.getItem("acs-settings");if(t){const r=JSON.parse(t);r.registryUrl&&fetch(r.registryUrl).then(l=>l.json()).then(l=>z(l)).catch(()=>{})}}},[]),n.useEffect(()=>{localStorage.setItem("acs-builder-components",JSON.stringify(d))},[d]);const X=n.useMemo(()=>{const a=new Set;return N.forEach(s=>a.add(s.category)),Array.from(a).sort()},[N]),R=n.useMemo(()=>N.filter(a=>{const s=x===""||a.name.toLowerCase().includes(x.toLowerCase())||a.description.toLowerCase().includes(x.toLowerCase()),t=!g||a.category===g;return s&&t}),[N,x,g]);function h(a,s){F(t=>({...t,[a]:s}))}function p(a,s){j(t=>({...t,[a]:s}))}function J(a){_(s=>{if(s.find(l=>l.meta.id===a.id))return s.filter(f=>f.meta.id!==a.id).map((f,S)=>({...f,position:S+1}));const r=[...s,{meta:a,position:s.length+1}];return a.copy&&w(l=>({...l,[a.id]:{...a.copy}})),r})}function U(a,s){_(t=>{const r=[...t],l=s==="up"?a-1:a+1;if(l<0||l>=r.length)return t;const f=r[a];return r[a]=r[l],r[l]=f,r.map((S,K)=>({...S,position:K+1}))})}function $(a){_(s=>s.filter(t=>t.meta.id!==a).map((t,r)=>({...t,position:r+1})))}function D(a,s,t){w(r=>({...r,[a]:{...r[a]||{},[s]:t}}))}function Y(a){G(s=>({...s,[a]:!s[a]}))}function q(){return d.map(a=>({...a,meta:{...a.meta,copy:E[a.meta.id]||a.meta.copy||{}}}))}function A(){const a=localStorage.getItem("acs-settings"),s=a?JSON.parse(a):{};return Z(i,o,q(),s)}function L(){const a=A(),s=new Blob([a],{type:"text/markdown"}),t=URL.createObjectURL(s),r=document.createElement("a");r.href=t,r.download=`${i.clientName||"projeto"}-manifest.md`,r.click(),URL.revokeObjectURL(t)}async function Q(){B(!0),O("");try{const a=localStorage.getItem("acs-settings");if(!a)throw new Error("Configure o GitHub em Configuracoes primeiro.");const s=JSON.parse(a),t=A(),r=await fetch("/api/create-project",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({settings:s,clientName:i.clientName,manifest:t})}),l=await r.json();if(!r.ok)throw new Error(l.error||"Erro ao criar projeto");M(l)}catch(a){O(a instanceof Error?a.message:"Erro desconhecido")}finally{B(!1)}}function V(a){return d.some(s=>s.meta.id===a)}function W(a){const s=d.find(t=>t.meta.id===a);return s?s.position:null}return y?e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
          .builder__result {
            max-width: 600px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: var(--space-4);
            padding-top: var(--space-8);
          }
          .builder__result-title {
            font-size: var(--text-2xl);
            font-weight: 700;
            color: var(--accent);
          }
          .builder__result-links {
            display: flex;
            flex-direction: column;
            gap: var(--space-2);
          }
        `}),e.jsxs("div",{className:"builder__result",children:[e.jsx("div",{className:"builder__result-title",children:"Projeto criado com sucesso!"}),e.jsxs("div",{className:"card",children:[e.jsx(m,{label:"Repositorio",value:y.repoUrl}),e.jsxs("div",{className:"builder__result-links",children:[e.jsx("a",{href:y.repoUrl,target:"_blank",rel:"noopener",className:"btn btn-primary",children:"Abrir no GitHub"}),e.jsx("a",{href:`vscode://vscode.git/clone?url=${encodeURIComponent(y.cloneUrl)}`,className:"btn btn-outline",children:"Abrir no VS Code"}),e.jsx("button",{className:"btn btn-outline",onClick:L,children:"Baixar Manifesto (.md)"})]})]})]})]}):e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        .builder {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: var(--space-6);
          min-height: calc(100vh - var(--space-6) * 2);
        }

        .builder__content {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .builder__aside {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .builder__form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
        }

        .builder__form-full {
          grid-column: 1 / -1;
        }

        .builder__color-row {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .builder__color-picker {
          width: 40px;
          height: 40px;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 2px;
          cursor: pointer;
          background: none;
        }

        .builder__comp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: var(--space-3);
        }

        .builder__comp-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-1);
        }

        .builder__comp-card-name {
          font-weight: 600;
          font-size: var(--text-sm);
        }

        .builder__comp-card-desc {
          font-size: var(--text-xs);
          color: var(--muted);
        }

        .builder__review-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3);
          border-bottom: 1px solid var(--border);
        }

        .builder__review-item:last-child {
          border-bottom: none;
        }

        .builder__review-position {
          font-weight: 700;
          color: var(--accent);
          min-width: 24px;
          text-align: center;
        }

        .builder__review-info {
          flex: 1;
        }

        .builder__review-actions {
          display: flex;
          gap: var(--space-1);
        }

        .builder__copy-section {
          padding: var(--space-3);
          border-top: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .builder__copy-toggle {
          cursor: pointer;
          color: var(--accent);
          font-size: var(--text-sm);
          font-weight: 500;
          background: none;
          border: none;
          text-align: left;
          padding: 0;
        }

        .builder__copy-field {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .builder__copy-field label {
          font-size: var(--text-xs);
          color: var(--muted);
          font-weight: 500;
        }

        .builder__copy-field textarea {
          min-height: 60px;
          resize: vertical;
        }

        .builder__pair {
          display: flex;
          justify-content: space-between;
          padding: var(--space-1) 0;
          font-size: var(--text-sm);
          border-bottom: 1px solid var(--border);
        }

        .builder__pair-label {
          color: var(--muted);
        }

        .builder__pair-value {
          font-weight: 500;
        }

        .builder__error {
          color: var(--danger);
          padding: var(--space-3);
          border: 1px solid var(--danger);
          border-radius: var(--radius);
          font-size: var(--text-sm);
        }

        .builder__aside-section {
          padding: var(--space-3);
        }

        .builder__aside-title {
          font-size: var(--text-sm);
          font-weight: 600;
          margin-bottom: var(--space-2);
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .builder__aside-component {
          font-size: var(--text-sm);
          padding: var(--space-1) 0;
          display: flex;
          gap: var(--space-2);
          align-items: center;
        }

        .builder__actions {
          display: flex;
          gap: var(--space-3);
          padding-top: var(--space-4);
          border-top: 1px solid var(--border);
        }

        .builder__comp-card-category {
          margin-top: var(--space-2);
        }

        .builder__aside-colors {
          display: flex;
          gap: var(--space-2);
          flex-wrap: wrap;
        }

        .builder__aside-swatch {
          width: 32px;
          height: 32px;
          border-radius: var(--radius);
          border: 1px solid var(--border);
        }
      `}),e.jsxs("div",{className:"builder",children:[e.jsxs("div",{className:"builder__content",children:[e.jsx("div",{className:"tab-bar",children:ee.map((a,s)=>e.jsxs("button",{className:`tab ${c===a?"active":""}`,onClick:()=>v(a),children:[s+1,". ",a]},a))}),c==="Configurar"&&e.jsxs("div",{className:"card",children:[e.jsx("h2",{className:"section-title",children:"Dados do Projeto"}),e.jsxs("div",{className:"builder__form-grid",children:[e.jsx(u,{label:"Nome do cliente",children:e.jsx("input",{className:"input",value:i.clientName,onChange:a=>h("clientName",a.target.value),placeholder:"acme-corp"})}),e.jsx(u,{label:"Tipo de projeto",children:e.jsxs("select",{className:"input",value:i.projectType,onChange:a=>h("projectType",a.target.value),children:[e.jsx("option",{value:"landing-page",children:"Landing Page"}),e.jsx("option",{value:"site-institucional",children:"Site Institucional"}),e.jsx("option",{value:"portfolio",children:"Portfolio"}),e.jsx("option",{value:"blog",children:"Blog"}),e.jsx("option",{value:"ecommerce",children:"E-commerce"})]})}),e.jsx(u,{label:"Nicho",children:e.jsx("input",{className:"input",value:i.niche,onChange:a=>h("niche",a.target.value),placeholder:"ex: saude, tech, educacao"})}),e.jsx(u,{label:"Objetivo da pagina",children:e.jsx("input",{className:"input",value:i.pageGoal,onChange:a=>h("pageGoal",a.target.value),placeholder:"ex: captar leads, vender produto"})}),e.jsx(u,{label:"URL do site",children:e.jsx("input",{className:"input",value:i.siteUrl,onChange:a=>h("siteUrl",a.target.value),placeholder:"https://..."})}),e.jsx(u,{label:"Google Analytics ID",children:e.jsx("input",{className:"input",value:i.googleAnalyticsId,onChange:a=>h("googleAnalyticsId",a.target.value),placeholder:"G-XXXXXXXXXX"})})]}),e.jsx("h2",{className:"section-title",children:"Direcao de Arte"}),e.jsxs("div",{className:"builder__form-grid",children:[e.jsx(C,{label:"Cor Primaria",value:o.colorPrimary,onChange:a=>p("colorPrimary",a)}),e.jsx(C,{label:"Cor Secundaria",value:o.colorSecondary,onChange:a=>p("colorSecondary",a)}),e.jsx(C,{label:"Cor de Fundo",value:o.colorBackground,onChange:a=>p("colorBackground",a)}),e.jsx(C,{label:"Cor do Texto",value:o.colorText,onChange:a=>p("colorText",a)}),e.jsx(u,{label:"Fonte dos titulos",children:e.jsx("input",{className:"input",value:o.fontHeading,onChange:a=>p("fontHeading",a.target.value),placeholder:"Inter"})}),e.jsx(u,{label:"Fonte do corpo",children:e.jsx("input",{className:"input",value:o.fontBody,onChange:a=>p("fontBody",a.target.value),placeholder:"Inter"})}),e.jsx("div",{className:"builder__form-full",children:e.jsx(u,{label:"Mood / Tom",children:e.jsx("input",{className:"input",value:o.mood,onChange:a=>p("mood",a.target.value),placeholder:"ex: profissional, acolhedor, moderno"})})}),e.jsx("div",{className:"builder__form-full",children:e.jsx(u,{label:"Referencias visuais",children:e.jsx("textarea",{className:"input",value:o.references,onChange:a=>p("references",a.target.value),placeholder:"Links ou descricao de referencias",rows:3})})}),e.jsx("div",{className:"builder__form-full",children:e.jsx(u,{label:"Observacoes",children:e.jsx("textarea",{className:"input",value:o.notes,onChange:a=>p("notes",a.target.value),placeholder:"Qualquer nota adicional sobre o projeto",rows:3})})})]})]}),c==="Componentes"&&e.jsxs("div",{children:[e.jsxs("div",{className:"builder__form-grid",children:[e.jsx("input",{className:"input",placeholder:"Buscar componentes...",value:x,onChange:a=>H(a.target.value)}),e.jsxs("div",{className:"browser__categories",children:[e.jsx("button",{className:`btn btn-sm ${g?"btn-ghost":"btn-primary"}`,onClick:()=>k(null),children:"Todos"}),X.map(a=>e.jsx("button",{className:`btn btn-sm ${g===a?"btn-primary":"btn-ghost"}`,onClick:()=>k(a),children:a},a))]})]}),R.length===0?e.jsx("div",{className:"empty-state",children:"Nenhum componente encontrado."}):e.jsx("div",{className:"builder__comp-grid",children:R.map(a=>{const s=V(a.id),t=W(a.id);return e.jsxs("div",{className:`card card-interactive ${s?"card-selected":""}`,onClick:()=>J(a),children:[e.jsxs("div",{className:"builder__comp-card-header",children:[e.jsx("span",{className:"builder__comp-card-name",children:a.name}),t!==null&&e.jsx("span",{className:"badge badge-accent",children:t})]}),e.jsx("div",{className:"builder__comp-card-desc",children:a.description}),e.jsx("div",{className:"builder__comp-card-category",children:e.jsx("span",{className:"badge badge-default",children:a.category})})]},a.id)})})]}),c==="Revisar"&&e.jsxs("div",{children:[e.jsxs("div",{className:"card",children:[e.jsx("h2",{className:"section-title",children:"Resumo do Projeto"}),e.jsxs("div",{className:"builder__form-grid",children:[e.jsx(m,{label:"Cliente",value:i.clientName}),e.jsx(m,{label:"Tipo",value:i.projectType}),e.jsx(m,{label:"Nicho",value:i.niche}),e.jsx(m,{label:"Objetivo",value:i.pageGoal}),e.jsx(m,{label:"URL",value:i.siteUrl}),e.jsx(m,{label:"GA ID",value:i.googleAnalyticsId})]})]}),e.jsxs("div",{className:"card",children:[e.jsxs("h2",{className:"section-title",children:["Componentes (",d.length,")"]}),d.length===0?e.jsx("div",{className:"empty-state",children:"Nenhum componente selecionado."}):d.map((a,s)=>e.jsxs("div",{children:[e.jsxs("div",{className:"builder__review-item",children:[e.jsx("span",{className:"builder__review-position",children:a.position}),e.jsxs("div",{className:"builder__review-info",children:[e.jsx("strong",{children:a.meta.name}),e.jsx("div",{className:"builder__comp-card-desc",children:a.meta.description})]}),e.jsxs("div",{className:"builder__review-actions",children:[e.jsx("button",{className:"btn btn-ghost btn-sm btn-icon",onClick:()=>U(s,"up"),disabled:s===0,children:"^"}),e.jsx("button",{className:"btn btn-ghost btn-sm btn-icon",onClick:()=>U(s,"down"),disabled:s===d.length-1,children:"v"}),e.jsx("button",{className:"btn btn-danger btn-sm btn-icon",onClick:()=>$(a.meta.id),children:"x"})]})]}),a.meta.copy&&Object.keys(a.meta.copy).length>0&&e.jsxs("div",{className:"builder__copy-section",children:[e.jsxs("button",{className:"builder__copy-toggle",onClick:()=>Y(a.meta.id),children:[P[a.meta.id]?"v":">"," Editar textos (",Object.keys(a.meta.copy).length," campos)"]}),P[a.meta.id]&&e.jsx("div",{children:Object.entries(E[a.meta.id]||a.meta.copy).map(([t,r])=>e.jsxs("div",{className:"builder__copy-field",children:[e.jsx("label",{children:t}),e.jsx("textarea",{className:"input",value:r,onChange:l=>D(a.meta.id,t,l.target.value),rows:2})]},t))})]})]},a.meta.id))]}),I&&e.jsx("div",{className:"builder__error",children:I}),e.jsxs("div",{className:"builder__actions",children:[e.jsx("button",{className:"btn btn-outline",onClick:L,children:"Baixar Manifesto (.md)"}),e.jsx("button",{className:"btn btn-primary",onClick:Q,disabled:T||!i.clientName,children:T?"Criando...":"Criar Projeto no GitHub"})]})]})]}),e.jsxs("div",{className:"builder__aside",children:[e.jsx("div",{className:"card",children:e.jsxs("div",{className:"builder__aside-section",children:[e.jsx("div",{className:"builder__aside-title",children:"Cliente"}),e.jsx("div",{children:i.clientName||"(nao definido)"}),e.jsxs("div",{className:"builder__comp-card-desc",children:[i.projectType," - ",i.niche||"-"]})]})}),e.jsx("div",{className:"card",children:e.jsxs("div",{className:"builder__aside-section",children:[e.jsx("div",{className:"builder__aside-title",children:"Estrutura da Pagina"}),d.length===0?e.jsx("div",{className:"builder__comp-card-desc",children:"Nenhum componente adicionado"}):d.map(a=>e.jsxs("div",{className:"builder__aside-component",children:[e.jsx("span",{className:"badge badge-accent",children:a.position}),e.jsx("span",{children:a.meta.name})]},a.meta.id))]})}),e.jsx("div",{className:"card",children:e.jsxs("div",{className:"builder__aside-section",children:[e.jsx("div",{className:"builder__aside-title",children:"Cores"}),e.jsxs("div",{className:"builder__aside-colors",children:[e.jsx("div",{className:"builder__aside-swatch",style:{background:o.colorPrimary},title:"Primaria"}),e.jsx("div",{className:"builder__aside-swatch",style:{background:o.colorSecondary},title:"Secundaria"}),e.jsx("div",{className:"builder__aside-swatch",style:{background:o.colorBackground},title:"Fundo"}),e.jsx("div",{className:"builder__aside-swatch",style:{background:o.colorText},title:"Texto"})]})]})}),e.jsx("div",{className:"card",children:e.jsxs("div",{className:"builder__aside-section",children:[e.jsx("div",{className:"builder__aside-title",children:"Tipografia"}),e.jsx(m,{label:"Titulos",value:o.fontHeading}),e.jsx(m,{label:"Corpo",value:o.fontBody})]})})]})]})]})}export{le as default};
