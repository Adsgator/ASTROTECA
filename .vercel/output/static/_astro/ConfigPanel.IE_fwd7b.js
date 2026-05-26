import{j as e}from"./jsx-runtime.TBa3i5EZ.js";import{r as i}from"./index.CVf8TyFT.js";import{D as _}from"./manifest.BsNAuYwp.js";function T(o){return{Authorization:`Bearer ${o}`,"Content-Type":"application/json",Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"}}function w(o){return`https://api.github.com${o}`}async function S(o){try{const l=await fetch(w("/user"),{headers:T(o)});return l.ok?{valid:!0,login:(await l.json()).login}:{valid:!1,error:`HTTP ${l.status}`}}catch(l){return{valid:!1,error:l instanceof Error?l.message:"Erro desconhecido"}}}const E=[{key:"github",label:"GitHub"},{key:"defaults",label:"Padroes"},{key:"template",label:"Template do Manifesto"},{key:"about",label:"Sobre"}],b={githubToken:"",githubOwner:"",componentsRepo:"astro-components",baseProjectRepo:"_base-project",registryUrl:"",previewBaseUrl:"",defaultFontHeading:"Inter",defaultFontBody:"Inter",defaultColorPrimary:"#6366f1",defaultCtaLabel:"Comecar agora",manifestTemplate:_,yourName:"",studioName:"",npmNamespace:""};function F(){const[o,l]=i.useState("github"),[t,u]=i.useState(b),[c,j]=i.useState(!1),[p,m]=i.useState(!1),[g,f]=i.useState(null),[h,d]=i.useState(""),[N,v]=i.useState(!1);i.useEffect(()=>{const a=localStorage.getItem("acs-settings");if(a){const r=JSON.parse(a);u({...b,...r})}},[]);function s(a,r){u(C=>{const x={...C,[a]:r};return localStorage.setItem("acs-settings",JSON.stringify(x)),v(!0),setTimeout(()=>v(!1),2e3),x})}async function y(){m(!0),d(""),f(null);try{const a=await S(t.githubToken);a.valid?f(a.login||"Autenticado"):d(a.error||"Token invalido")}catch(a){d(a instanceof Error?a.message:"Erro ao validar")}finally{m(!1)}}function k(){s("manifestTemplate",_)}function n({label:a,children:r}){return e.jsxs("div",{className:"field",children:[e.jsx("label",{className:"label",children:a}),r]})}return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        .config {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: var(--space-6);
          max-width: 900px;
        }

        .config__nav {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .config__content {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .config__title {
          font-size: var(--text-xl);
          font-weight: 700;
          margin-bottom: var(--space-2);
        }

        .config__row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
        }

        .config__full {
          grid-column: 1 / -1;
        }

        .config__token-row {
          display: flex;
          gap: var(--space-2);
          align-items: end;
        }

        .config__token-input {
          flex: 1;
        }

        .config__token-result {
          font-size: var(--text-sm);
          margin-top: var(--space-2);
        }

        .config__template-area {
          width: 100%;
          min-height: 400px;
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          resize: vertical;
        }

        .config__template-actions {
          display: flex;
          justify-content: flex-end;
        }

        .config__saved {
          font-size: var(--text-sm);
          color: var(--accent);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .config__saved--visible {
          opacity: 1;
        }

        .config__color-row {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .config__color-picker {
          width: 40px;
          height: 40px;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 2px;
          cursor: pointer;
          background: none;
        }

        .config__template-help {
          font-size: var(--text-xs);
          color: var(--muted);
          margin-bottom: var(--space-3);
        }
      `}),e.jsxs("div",{className:"config",children:[e.jsxs("nav",{className:"config__nav",children:[E.map(a=>e.jsx("button",{className:`sidebar-link ${o===a.key?"active":""}`,onClick:()=>l(a.key),children:a.label},a.key)),e.jsx("div",{className:`config__saved ${N?"config__saved--visible":""}`,children:"Salvo!"})]}),e.jsxs("div",{className:"config__content",children:[o==="github"&&e.jsxs("div",{className:"card",children:[e.jsx("h2",{className:"config__title",children:"GitHub"}),e.jsxs("div",{className:"config__row",children:[e.jsx("div",{className:"config__full",children:e.jsxs(n,{label:"Token de acesso",children:[e.jsxs("div",{className:"config__token-row",children:[e.jsx("div",{className:"config__token-input",children:e.jsx("input",{className:"input",type:c?"text":"password",value:t.githubToken,onChange:a=>s("githubToken",a.target.value),placeholder:"ghp_..."})}),e.jsx("button",{type:"button",className:"btn btn-ghost btn-sm",onClick:()=>j(!c),children:c?"Ocultar":"Mostrar"}),e.jsx("button",{type:"button",className:"btn btn-outline btn-sm",onClick:y,disabled:p||!t.githubToken,children:p?"Validando...":"Validar"})]}),g&&e.jsx("div",{className:"config__token-result",children:e.jsxs("span",{className:"badge badge-ok",children:["Conectado como ",g]})}),h&&e.jsx("div",{className:"config__token-result",children:e.jsx("span",{className:"badge badge-fail",children:h})})]})}),e.jsx(n,{label:"Owner (usuario ou org)",children:e.jsx("input",{className:"input",value:t.githubOwner,onChange:a=>s("githubOwner",a.target.value),placeholder:"seu-usuario"})}),e.jsx(n,{label:"Repo de componentes",children:e.jsx("input",{className:"input",value:t.componentsRepo,onChange:a=>s("componentsRepo",a.target.value),placeholder:"astro-components"})}),e.jsx(n,{label:"Repo base do projeto",children:e.jsx("input",{className:"input",value:t.baseProjectRepo,onChange:a=>s("baseProjectRepo",a.target.value),placeholder:"_base-project"})}),e.jsx("div",{className:"config__full",children:e.jsx(n,{label:"URL do registry.json",children:e.jsx("input",{className:"input",value:t.registryUrl,onChange:a=>s("registryUrl",a.target.value),placeholder:"https://raw.githubusercontent.com/..."})})}),e.jsx("div",{className:"config__full",children:e.jsx(n,{label:"Base URL dos previews",children:e.jsx("input",{className:"input",value:t.previewBaseUrl,onChange:a=>s("previewBaseUrl",a.target.value),placeholder:"https://seu-usuario.github.io/astro-components"})})})]})]}),o==="defaults"&&e.jsxs("div",{className:"card",children:[e.jsx("h2",{className:"config__title",children:"Padroes"}),e.jsxs("div",{className:"config__row",children:[e.jsx(n,{label:"Fonte padrao (titulos)",children:e.jsx("input",{className:"input",value:t.defaultFontHeading,onChange:a=>s("defaultFontHeading",a.target.value),placeholder:"Inter"})}),e.jsx(n,{label:"Fonte padrao (corpo)",children:e.jsx("input",{className:"input",value:t.defaultFontBody,onChange:a=>s("defaultFontBody",a.target.value),placeholder:"Inter"})}),e.jsx(n,{label:"Cor primaria padrao",children:e.jsxs("div",{className:"config__color-row",children:[e.jsx("input",{type:"color",value:t.defaultColorPrimary,onChange:a=>s("defaultColorPrimary",a.target.value),className:"config__color-picker"}),e.jsx("input",{className:"input",value:t.defaultColorPrimary,onChange:a=>s("defaultColorPrimary",a.target.value),placeholder:"#6366f1"})]})}),e.jsx(n,{label:"Label padrao do CTA",children:e.jsx("input",{className:"input",value:t.defaultCtaLabel,onChange:a=>s("defaultCtaLabel",a.target.value),placeholder:"Comecar agora"})})]})]}),o==="template"&&e.jsxs("div",{className:"card",children:[e.jsx("h2",{className:"config__title",children:"Template do Manifesto"}),e.jsxs("p",{className:"config__template-help",children:["Use ","{{variavel}}"," para interpolar valores. Variaveis disponiveis: clientName, date, projectType, niche, pageGoal, googleAnalyticsId, siteUrl, npmNamespace, repoName, colorPrimary, colorSecondary, colorBackground, colorText, fontHeading, fontBody, mood, references, notes, components, studioName."]}),e.jsx("textarea",{className:"input config__template-area",value:t.manifestTemplate,onChange:a=>s("manifestTemplate",a.target.value)}),e.jsx("div",{className:"config__template-actions",children:e.jsx("button",{type:"button",className:"btn btn-ghost btn-sm",onClick:k,children:"Restaurar Padrao"})})]}),o==="about"&&e.jsxs("div",{className:"card",children:[e.jsx("h2",{className:"config__title",children:"Sobre Voce"}),e.jsxs("div",{className:"config__row",children:[e.jsx(n,{label:"Seu nome",children:e.jsx("input",{className:"input",value:t.yourName,onChange:a=>s("yourName",a.target.value),placeholder:"Seu nome completo"})}),e.jsx(n,{label:"Nome do estudio",children:e.jsx("input",{className:"input",value:t.studioName,onChange:a=>s("studioName",a.target.value),placeholder:"Meu Estudio"})}),e.jsx(n,{label:"Namespace npm",children:e.jsx("input",{className:"input",value:t.npmNamespace,onChange:a=>s("npmNamespace",a.target.value),placeholder:"@meu-estudio"})})]})]})]})]})]})}export{F as default};
