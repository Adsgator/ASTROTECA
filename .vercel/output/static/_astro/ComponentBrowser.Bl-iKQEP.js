import{j as e}from"./jsx-runtime.TBa3i5EZ.js";import{r as o}from"./index.CVf8TyFT.js";function L({initialComponents:m,registryUrl:y,initialError:x}){const[i,_]=o.useState(m),[l,v]=o.useState(""),[c,b]=o.useState(null),[n,u]=o.useState(null),[d,w]=o.useState(x),[g,h]=o.useState(!1);o.useEffect(()=>{if(m.length===0&&!x){const s=localStorage.getItem("acs-settings");if(s){const a=JSON.parse(s);a.registryUrl&&(h(!0),fetch(a.registryUrl).then(t=>t.json()).then(t=>{_(t),h(!1)}).catch(t=>{w(t instanceof Error?t.message:"Erro ao carregar"),h(!1)}))}}},[]);const f=o.useMemo(()=>{const s=new Set;return i.forEach(a=>s.add(a.category)),Array.from(s).sort()},[i]),j=o.useMemo(()=>i.filter(s=>{const a=l===""||s.name.toLowerCase().includes(l.toLowerCase())||s.description.toLowerCase().includes(l.toLowerCase())||s.tags.some(p=>p.toLowerCase().includes(l.toLowerCase())),t=!c||s.category===c;return a&&t}),[i,l,c]),r=o.useMemo(()=>i.find(s=>s.id===n)||null,[i,n]);function N(s){const a=localStorage.getItem("acs-builder-components"),t=a?JSON.parse(a):[];t.some(p=>p.meta.id===s.id)||(t.push({meta:s,position:t.length+1}),localStorage.setItem("acs-builder-components",JSON.stringify(t)),alert(`"${s.name}" adicionado ao Builder!`))}return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        .browser {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-6);
          height: calc(100vh - var(--space-6) * 2);
        }

        .browser__left {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          overflow: hidden;
        }

        .browser__filters {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .browser__categories {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-1);
        }

        .browser__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: var(--space-3);
          overflow-y: auto;
          flex: 1;
          padding-right: var(--space-2);
        }

        .browser__card-title {
          font-weight: 600;
          font-size: var(--text-sm);
          margin-bottom: var(--space-1);
        }

        .browser__card-desc {
          font-size: var(--text-xs);
          color: var(--muted);
          margin-bottom: var(--space-2);
        }

        .browser__card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-1);
        }

        .browser__right {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          overflow-y: auto;
        }

        .browser__preview {
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          background: var(--surface-2);
          min-height: 300px;
        }

        .browser__preview iframe {
          width: 100%;
          height: 300px;
          border: none;
        }

        .browser__detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--space-3);
        }

        .browser__detail-title {
          font-size: var(--text-xl);
          font-weight: 700;
        }

        .browser__props-table {
          width: 100%;
          border-collapse: collapse;
          font-size: var(--text-sm);
        }

        .browser__props-table th,
        .browser__props-table td {
          text-align: left;
          padding: var(--space-2) var(--space-3);
          border-bottom: 1px solid var(--border);
        }

        .browser__props-table th {
          color: var(--muted);
          font-weight: 500;
          text-transform: uppercase;
          font-size: var(--text-xs);
        }

        .browser__screenshot {
          width: 100%;
          height: 120px;
          object-fit: cover;
          border-radius: var(--radius) var(--radius) 0 0;
        }

        .browser__card-inner {
          padding: var(--space-3);
        }
      `}),e.jsxs("div",{className:"browser",children:[e.jsxs("div",{className:"browser__left",children:[e.jsxs("div",{className:"browser__filters",children:[e.jsx("input",{type:"text",className:"input",placeholder:"Buscar componentes...",value:l,onChange:s=>v(s.target.value)}),e.jsxs("div",{className:"browser__categories",children:[e.jsx("button",{className:`btn btn-sm ${c?"btn-ghost":"btn-primary"}`,onClick:()=>b(null),children:"Todos"}),f.map(s=>e.jsx("button",{className:`btn btn-sm ${c===s?"btn-primary":"btn-ghost"}`,onClick:()=>b(s),children:s},s))]})]}),g&&e.jsx("div",{className:"empty-state",children:"Carregando componentes..."}),d&&e.jsx("div",{className:"empty-state",children:d}),!g&&!d&&j.length===0&&e.jsx("div",{className:"empty-state",children:"Nenhum componente encontrado."}),e.jsx("div",{className:"browser__grid",children:j.map(s=>e.jsxs("div",{className:`card card-interactive ${n===s.id?"card-selected":""}`,onClick:()=>u(s.id),children:[s.screenshotUrl&&e.jsx("img",{src:s.screenshotUrl,alt:s.name,className:"browser__screenshot"}),e.jsxs("div",{className:"browser__card-inner",children:[e.jsx("div",{className:"browser__card-title",children:s.name}),e.jsx("div",{className:"browser__card-desc",children:s.description}),e.jsxs("div",{className:"browser__card-tags",children:[e.jsx("span",{className:"badge badge-default",children:s.category}),s.tags.slice(0,2).map(a=>e.jsx("span",{className:"badge",children:a},a))]})]})]},s.id))})]}),e.jsx("div",{className:"browser__right",children:r?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"browser__preview",children:r.screenshotUrl?e.jsx("img",{src:r.screenshotUrl,alt:r.name,className:"browser__screenshot",style:{height:"auto",maxHeight:"300px"}}):e.jsx("div",{className:"empty-state",children:"Sem preview disponivel"})}),e.jsxs("div",{className:"card",children:[e.jsxs("div",{className:"browser__detail-header",children:[e.jsxs("div",{children:[e.jsx("div",{className:"browser__detail-title",children:r.name}),e.jsx("p",{className:"browser__card-desc",children:r.description})]}),e.jsx("button",{className:"btn btn-primary",onClick:()=>N(r),children:"Adicionar ao Builder"})]}),e.jsxs("div",{className:"browser__card-tags",children:[e.jsx("span",{className:"badge badge-accent",children:r.category}),r.tags.map(s=>e.jsx("span",{className:"badge badge-default",children:s},s))]}),e.jsx("p",{className:"label",children:"Melhor para"}),e.jsx("p",{children:r.bestFor.join(", ")}),r.props.length>0&&e.jsxs(e.Fragment,{children:[e.jsx("p",{className:"label",children:"Props"}),e.jsxs("table",{className:"browser__props-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Nome"}),e.jsx("th",{children:"Tipo"}),e.jsx("th",{children:"Obrigatoria"}),e.jsx("th",{children:"Descricao"})]})}),e.jsx("tbody",{children:r.props.map(s=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:s.name})}),e.jsx("td",{children:e.jsx("code",{children:s.type})}),e.jsx("td",{children:s.required?"Sim":"Nao"}),e.jsx("td",{children:s.description})]},s.name))})]})]}),r.copy&&Object.keys(r.copy).length>0&&e.jsxs(e.Fragment,{children:[e.jsx("p",{className:"label",children:"Copy editavel"}),e.jsxs("table",{className:"browser__props-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Chave"}),e.jsx("th",{children:"Valor padrao"})]})}),e.jsx("tbody",{children:Object.entries(r.copy).map(([s,a])=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:s})}),e.jsx("td",{children:a})]},s))})]})]})]})]}):e.jsx("div",{className:"empty-state",children:"Selecione um componente para ver detalhes."})})]})]})}export{L as default};
