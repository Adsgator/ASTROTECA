import{j as e}from"./jsx-runtime.TBa3i5EZ.js";import{r as l}from"./index.CVf8TyFT.js";const z=["Hero","Features","Pricing","Testimonials","CTA","Footer","Navigation","FAQ","Gallery","Contact","About","Stats","Team","Misc"],B={name:"",type:"string",required:!1,description:"",previewValue:""};function R(){const[i,y]=l.useState(""),[u,k]=l.useState("Hero"),[h,N]=l.useState(""),[g,w]=l.useState(""),[v,_]=l.useState(""),[c,m]=l.useState([]),[x,C]=l.useState(""),[S,P]=l.useState(!1),[b,f]=l.useState(null);function j(a){return a.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase().replace(/[^a-z0-9-]/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"")}function O(){m(a=>[...a,{...B}])}function E(a){m(t=>t.filter((r,n)=>n!==a))}function p(a,t,r){m(n=>{const d=[...n];return d[a]={...d[a],[t]:r},d})}function $(){const a=c.map(t=>t.type==="boolean"?`  ${t.name}={${t.previewValue||"true"}}`:t.type==="number"?`  ${t.name}={${t.previewValue||"0"}}`:t.type.includes("[]")||t.type.includes("Array")?`  ${t.name}={${t.previewValue||"[]"}}`:`  ${t.name}="${t.previewValue||""}"`).join(`
`);return`---
import ${i} from './${i}.astro'
---

<${i}
${a}
/>`}function V(){const a=c.map(n=>({name:n.name,type:n.type,required:n.required,description:n.description,previewValue:n.previewValue||""})),t={};c.forEach(n=>{n.type==="string"&&n.previewValue&&(t[n.name]=n.previewValue)});const r={id:j(i),name:i,category:u,description:h,tags:g.split(",").map(n=>n.trim()).filter(Boolean),bestFor:v.split(",").map(n=>n.trim()).filter(Boolean),props:a,copy:Object.keys(t).length>0?t:void 0,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};return`export const meta = ${JSON.stringify(r,null,2)} as const`}async function D(a){a.preventDefault(),f(null),P(!0);try{const t=localStorage.getItem("acs-settings");if(!t)throw new Error("Configure o GitHub em Configuracoes primeiro.");const r=JSON.parse(t),n=c.map(s=>({name:s.name,type:s.type,required:s.required,description:s.description,previewValue:s.previewValue||""})),d={};c.forEach(s=>{s.type==="string"&&s.previewValue&&(d[s.name]=s.previewValue)});const F={id:j(i),name:i,category:u,description:h,tags:g.split(",").map(s=>s.trim()).filter(Boolean),bestFor:v.split(",").map(s=>s.trim()).filter(Boolean),props:n,copy:Object.keys(d).length>0?d:void 0,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},q=$(),I=V(),A=await fetch("/api/publish-component",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({settings:r,meta:F,astroCode:x,previewCode:q,indexCode:I})}),T=await A.json();if(!A.ok)throw new Error(T.error||"Erro ao publicar");f({type:"ok",message:`Componente "${i}" publicado com sucesso!`}),y(""),N(""),w(""),_(""),m([]),C("")}catch(t){f({type:"fail",message:t instanceof Error?t.message:"Erro desconhecido"})}finally{P(!1)}}function o({label:a,children:t}){return e.jsxs("div",{className:"field",children:[e.jsx("label",{className:"label",children:a}),t]})}return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        .admin {
          max-width: 800px;
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .admin__title {
          font-size: var(--text-2xl);
          font-weight: 700;
        }

        .admin__row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
        }

        .admin__full {
          grid-column: 1 / -1;
        }

        .admin__props-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-2);
        }

        .admin__prop-item {
          display: grid;
          grid-template-columns: 1fr 100px 80px 1fr 1fr 40px;
          gap: var(--space-2);
          align-items: end;
          padding: var(--space-2) 0;
          border-bottom: 1px solid var(--border);
        }

        .admin__prop-item:last-child {
          border-bottom: none;
        }

        .admin__code-area {
          width: 100%;
          min-height: 300px;
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          resize: vertical;
        }

        .admin__generated {
          background: var(--surface-2);
          padding: var(--space-3);
          border-radius: var(--radius);
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          white-space: pre-wrap;
          max-height: 200px;
          overflow-y: auto;
        }

        .admin__id-preview {
          margin-top: var(--space-2);
        }
      `}),e.jsxs("form",{className:"admin",onSubmit:D,children:[e.jsx("h1",{className:"admin__title",children:"Adicionar Componente"}),b&&e.jsx("div",{className:`badge ${b.type==="ok"?"badge-ok":"badge-fail"}`,children:b.message}),e.jsxs("div",{className:"card",children:[e.jsx("h2",{className:"section-title",children:"Informacoes Basicas"}),e.jsxs("div",{className:"admin__row",children:[e.jsx(o,{label:"Nome (PascalCase)",children:e.jsx("input",{className:"input",value:i,onChange:a=>y(a.target.value),placeholder:"HeroSplit",required:!0})}),e.jsx(o,{label:"Categoria",children:e.jsx("select",{className:"input",value:u,onChange:a=>k(a.target.value),children:z.map(a=>e.jsx("option",{value:a,children:a},a))})}),e.jsx("div",{className:"admin__full",children:e.jsx(o,{label:"Descricao",children:e.jsx("input",{className:"input",value:h,onChange:a=>N(a.target.value),placeholder:"Descricao curta do componente",required:!0})})}),e.jsx(o,{label:"Tags (separadas por virgula)",children:e.jsx("input",{className:"input",value:g,onChange:a=>w(a.target.value),placeholder:"hero, split, imagem"})}),e.jsx(o,{label:"Melhor para",children:e.jsx("input",{className:"input",value:v,onChange:a=>_(a.target.value),placeholder:"Landing pages com imagem lateral"})})]}),i&&e.jsxs("div",{className:"admin__id-preview",children:[e.jsx("span",{className:"label",children:"ID gerado: "}),e.jsx("code",{children:j(i)})]})]}),e.jsxs("div",{className:"card",children:[e.jsxs("div",{className:"admin__props-header",children:[e.jsx("h2",{className:"section-title",children:"Props"}),e.jsx("button",{type:"button",className:"btn btn-outline btn-sm",onClick:O,children:"+ Adicionar Prop"})]}),c.length===0&&e.jsx("div",{className:"empty-state",children:"Nenhuma prop adicionada ainda."}),c.map((a,t)=>e.jsxs("div",{className:"admin__prop-item",children:[e.jsx(o,{label:"Nome",children:e.jsx("input",{className:"input",value:a.name,onChange:r=>p(t,"name",r.target.value),placeholder:"titulo"})}),e.jsx(o,{label:"Tipo",children:e.jsxs("select",{className:"input",value:a.type,onChange:r=>p(t,"type",r.target.value),children:[e.jsx("option",{value:"string",children:"string"}),e.jsx("option",{value:"number",children:"number"}),e.jsx("option",{value:"boolean",children:"boolean"}),e.jsx("option",{value:"string[]",children:"string[]"}),e.jsx("option",{value:"Record<string, string>",children:"Record"})]})}),e.jsx(o,{label:"Obrig.",children:e.jsx("input",{type:"checkbox",checked:a.required,onChange:r=>p(t,"required",r.target.checked)})}),e.jsx(o,{label:"Descricao",children:e.jsx("input",{className:"input",value:a.description,onChange:r=>p(t,"description",r.target.value),placeholder:"Descricao da prop"})}),e.jsx(o,{label:"Preview Value",children:e.jsx("input",{className:"input",value:a.previewValue,onChange:r=>p(t,"previewValue",r.target.value),placeholder:"Valor no preview"})}),e.jsx("div",{children:e.jsx("button",{type:"button",className:"btn btn-danger btn-sm btn-icon",onClick:()=>E(t),children:"x"})})]},t))]}),e.jsxs("div",{className:"card",children:[e.jsx("h2",{className:"section-title",children:"Codigo do Componente (.astro)"}),e.jsx("textarea",{className:"input admin__code-area",value:x,onChange:a=>C(a.target.value),placeholder:`---
interface Props {
  titulo: string
}
const { titulo } = Astro.props
---

<section>
  <h1>{titulo}</h1>
</section>`,required:!0})]}),i&&c.length>0&&e.jsxs("div",{className:"card",children:[e.jsx("h2",{className:"section-title",children:"Preview Gerado"}),e.jsx("div",{className:"admin__generated",children:$()}),e.jsx("h2",{className:"section-title",children:"index.ts Gerado"}),e.jsx("div",{className:"admin__generated",children:V()})]}),e.jsx("button",{type:"submit",className:"btn btn-primary btn-lg",disabled:S||!i||!x,children:S?"Publicando...":"Publicar Componente"})]})]})}export{R as default};
