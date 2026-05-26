import { Q as createComponent, $ as renderComponent, a6 as renderTemplate, O as createAstro } from '../chunks/astro/server_BdknY_pA.mjs';
import 'kleur/colors';
import { $ as $$AppLayout } from '../chunks/AppLayout_CMGUMeQX.mjs';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
export { renderers } from '../renderers.mjs';

const CATEGORIES = [
  "Hero",
  "Features",
  "Pricing",
  "Testimonials",
  "CTA",
  "Footer",
  "Navigation",
  "FAQ",
  "Gallery",
  "Contact",
  "About",
  "Stats",
  "Team",
  "Misc"
];
const EMPTY_PROP = {
  name: "",
  type: "string",
  required: false,
  description: "",
  previewValue: ""
};
function AdminForm() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Hero");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [bestFor, setBestFor] = useState("");
  const [props, setProps] = useState([]);
  const [astroCode, setAstroCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  function generateId(n) {
    return n.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  }
  function addProp() {
    setProps((prev) => [...prev, { ...EMPTY_PROP }]);
  }
  function removeProp(index) {
    setProps((prev) => prev.filter((_, i) => i !== index));
  }
  function updateProp(index, key, value) {
    setProps((prev) => {
      const arr = [...prev];
      arr[index] = { ...arr[index], [key]: value };
      return arr;
    });
  }
  function generatePreviewCode() {
    const propsStr = props.map((p) => {
      if (p.type === "boolean") return `  ${p.name}={${p.previewValue || "true"}}`;
      if (p.type === "number") return `  ${p.name}={${p.previewValue || "0"}}`;
      if (p.type.includes("[]") || p.type.includes("Array"))
        return `  ${p.name}={${p.previewValue || "[]"}}`;
      return `  ${p.name}="${p.previewValue || ""}"`;
    }).join("\n");
    return `---
import ${name} from './${name}.astro'
---

<${name}
${propsStr}
/>`;
  }
  function generateIndexCode() {
    const propsMeta = props.map((p) => ({
      name: p.name,
      type: p.type,
      required: p.required,
      description: p.description,
      previewValue: p.previewValue || ""
    }));
    const copy = {};
    props.forEach((p) => {
      if (p.type === "string" && p.previewValue) {
        copy[p.name] = p.previewValue;
      }
    });
    const meta = {
      id: generateId(name),
      name,
      category,
      description,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      bestFor: bestFor.split(",").map((t) => t.trim()).filter(Boolean),
      props: propsMeta,
      copy: Object.keys(copy).length > 0 ? copy : void 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    return `export const meta = ${JSON.stringify(meta, null, 2)} as const`;
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);
    try {
      const raw = localStorage.getItem("acs-settings");
      if (!raw) throw new Error("Configure o GitHub em Configuracoes primeiro.");
      const settings = JSON.parse(raw);
      const propsMeta = props.map((p) => ({
        name: p.name,
        type: p.type,
        required: p.required,
        description: p.description,
        previewValue: p.previewValue || ""
      }));
      const copy = {};
      props.forEach((p) => {
        if (p.type === "string" && p.previewValue) {
          copy[p.name] = p.previewValue;
        }
      });
      const meta = {
        id: generateId(name),
        name,
        category,
        description,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        bestFor: bestFor.split(",").map((t) => t.trim()).filter(Boolean),
        props: propsMeta,
        copy: Object.keys(copy).length > 0 ? copy : void 0,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const previewCode = generatePreviewCode();
      const indexCode = generateIndexCode();
      const res = await fetch("/api/publish-component", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings,
          meta,
          astroCode,
          previewCode,
          indexCode
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao publicar");
      setFeedback({ type: "ok", message: `Componente "${name}" publicado com sucesso!` });
      setName("");
      setDescription("");
      setTags("");
      setBestFor("");
      setProps([]);
      setAstroCode("");
    } catch (e2) {
      setFeedback({
        type: "fail",
        message: e2 instanceof Error ? e2.message : "Erro desconhecido"
      });
    } finally {
      setSubmitting(false);
    }
  }
  function Field({ label, children }) {
    return /* @__PURE__ */ jsxs("div", { className: "field", children: [
      /* @__PURE__ */ jsx("label", { className: "label", children: label }),
      children
    ] });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("style", { children: `
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
      ` }),
    /* @__PURE__ */ jsxs("form", { className: "admin", onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsx("h1", { className: "admin__title", children: "Adicionar Componente" }),
      feedback && /* @__PURE__ */ jsx("div", { className: `badge ${feedback.type === "ok" ? "badge-ok" : "badge-fail"}`, children: feedback.message }),
      /* @__PURE__ */ jsxs("div", { className: "card", children: [
        /* @__PURE__ */ jsx("h2", { className: "section-title", children: "Informacoes Basicas" }),
        /* @__PURE__ */ jsxs("div", { className: "admin__row", children: [
          /* @__PURE__ */ jsx(Field, { label: "Nome (PascalCase)", children: /* @__PURE__ */ jsx(
            "input",
            {
              className: "input",
              value: name,
              onChange: (e) => setName(e.target.value),
              placeholder: "HeroSplit",
              required: true
            }
          ) }),
          /* @__PURE__ */ jsx(Field, { label: "Categoria", children: /* @__PURE__ */ jsx(
            "select",
            {
              className: "input",
              value: category,
              onChange: (e) => setCategory(e.target.value),
              children: CATEGORIES.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, c))
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: "admin__full", children: /* @__PURE__ */ jsx(Field, { label: "Descricao", children: /* @__PURE__ */ jsx(
            "input",
            {
              className: "input",
              value: description,
              onChange: (e) => setDescription(e.target.value),
              placeholder: "Descricao curta do componente",
              required: true
            }
          ) }) }),
          /* @__PURE__ */ jsx(Field, { label: "Tags (separadas por virgula)", children: /* @__PURE__ */ jsx(
            "input",
            {
              className: "input",
              value: tags,
              onChange: (e) => setTags(e.target.value),
              placeholder: "hero, split, imagem"
            }
          ) }),
          /* @__PURE__ */ jsx(Field, { label: "Melhor para", children: /* @__PURE__ */ jsx(
            "input",
            {
              className: "input",
              value: bestFor,
              onChange: (e) => setBestFor(e.target.value),
              placeholder: "Landing pages com imagem lateral"
            }
          ) })
        ] }),
        name && /* @__PURE__ */ jsxs("div", { className: "admin__id-preview", children: [
          /* @__PURE__ */ jsx("span", { className: "label", children: "ID gerado: " }),
          /* @__PURE__ */ jsx("code", { children: generateId(name) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "card", children: [
        /* @__PURE__ */ jsxs("div", { className: "admin__props-header", children: [
          /* @__PURE__ */ jsx("h2", { className: "section-title", children: "Props" }),
          /* @__PURE__ */ jsx("button", { type: "button", className: "btn btn-outline btn-sm", onClick: addProp, children: "+ Adicionar Prop" })
        ] }),
        props.length === 0 && /* @__PURE__ */ jsx("div", { className: "empty-state", children: "Nenhuma prop adicionada ainda." }),
        props.map((prop, i) => /* @__PURE__ */ jsxs("div", { className: "admin__prop-item", children: [
          /* @__PURE__ */ jsx(Field, { label: "Nome", children: /* @__PURE__ */ jsx(
            "input",
            {
              className: "input",
              value: prop.name,
              onChange: (e) => updateProp(i, "name", e.target.value),
              placeholder: "titulo"
            }
          ) }),
          /* @__PURE__ */ jsx(Field, { label: "Tipo", children: /* @__PURE__ */ jsxs(
            "select",
            {
              className: "input",
              value: prop.type,
              onChange: (e) => updateProp(i, "type", e.target.value),
              children: [
                /* @__PURE__ */ jsx("option", { value: "string", children: "string" }),
                /* @__PURE__ */ jsx("option", { value: "number", children: "number" }),
                /* @__PURE__ */ jsx("option", { value: "boolean", children: "boolean" }),
                /* @__PURE__ */ jsx("option", { value: "string[]", children: "string[]" }),
                /* @__PURE__ */ jsx("option", { value: "Record<string, string>", children: "Record" })
              ]
            }
          ) }),
          /* @__PURE__ */ jsx(Field, { label: "Obrig.", children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: prop.required,
              onChange: (e) => updateProp(i, "required", e.target.checked)
            }
          ) }),
          /* @__PURE__ */ jsx(Field, { label: "Descricao", children: /* @__PURE__ */ jsx(
            "input",
            {
              className: "input",
              value: prop.description,
              onChange: (e) => updateProp(i, "description", e.target.value),
              placeholder: "Descricao da prop"
            }
          ) }),
          /* @__PURE__ */ jsx(Field, { label: "Preview Value", children: /* @__PURE__ */ jsx(
            "input",
            {
              className: "input",
              value: prop.previewValue,
              onChange: (e) => updateProp(i, "previewValue", e.target.value),
              placeholder: "Valor no preview"
            }
          ) }),
          /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "btn btn-danger btn-sm btn-icon",
              onClick: () => removeProp(i),
              children: "x"
            }
          ) })
        ] }, i))
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "card", children: [
        /* @__PURE__ */ jsx("h2", { className: "section-title", children: "Codigo do Componente (.astro)" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            className: "input admin__code-area",
            value: astroCode,
            onChange: (e) => setAstroCode(e.target.value),
            placeholder: "---\ninterface Props {\n  titulo: string\n}\nconst { titulo } = Astro.props\n---\n\n<section>\n  <h1>{titulo}</h1>\n</section>",
            required: true
          }
        )
      ] }),
      name && props.length > 0 && /* @__PURE__ */ jsxs("div", { className: "card", children: [
        /* @__PURE__ */ jsx("h2", { className: "section-title", children: "Preview Gerado" }),
        /* @__PURE__ */ jsx("div", { className: "admin__generated", children: generatePreviewCode() }),
        /* @__PURE__ */ jsx("h2", { className: "section-title", children: "index.ts Gerado" }),
        /* @__PURE__ */ jsx("div", { className: "admin__generated", children: generateIndexCode() })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          className: "btn btn-primary btn-lg",
          disabled: submitting || !name || !astroCode,
          children: submitting ? "Publicando..." : "Publicar Componente"
        }
      )
    ] })
  ] });
}

const $$Astro = createAstro();
const $$Admin = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Admin;
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Adicionar Componente - Astroteca" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "AdminForm", AdminForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/PROJETOS/ADSGATOR/ASTROTECA/src/components/AdminForm", "client:component-export": "default" })} ` })}`;
}, "C:/PROJETOS/ADSGATOR/ASTROTECA/src/pages/admin.astro", void 0);

const $$file = "C:/PROJETOS/ADSGATOR/ASTROTECA/src/pages/admin.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Admin,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
