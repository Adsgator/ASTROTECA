import { Q as createComponent, $ as renderComponent, a6 as renderTemplate, O as createAstro } from '../chunks/astro/server_BdknY_pA.mjs';
import 'kleur/colors';
import { $ as $$AppLayout } from '../chunks/AppLayout_CV10e5-C.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
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
const inputBase = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
const btnBase = "px-4 py-2 rounded-lg text-sm font-medium transition-colors";
const btnPrimary = `${btnBase} bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50`;
const btnOutline = `${btnBase} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`;
const btnDanger = `${btnBase} bg-red-600 text-white hover:bg-red-700 px-2 py-1`;
const cardBase = "rounded-xl border border-gray-200 bg-white p-5";
const badgeBase = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
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
        body: JSON.stringify({ settings, meta, astroCode, previewCode, indexCode })
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
      setFeedback({ type: "fail", message: e2 instanceof Error ? e2.message : "Erro desconhecido" });
    } finally {
      setSubmitting(false);
    }
  }
  function Field({ label, children }) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600", children: label }),
      children
    ] });
  }
  return /* @__PURE__ */ jsxs("form", { className: "max-w-3xl flex flex-col gap-4", onSubmit: handleSubmit, children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Adicionar Componente" }),
    feedback && /* @__PURE__ */ jsx("div", { className: `${badgeBase} ${feedback.type === "ok" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} px-3 py-2`, children: feedback.message }),
    /* @__PURE__ */ jsxs("div", { className: cardBase, children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-4", children: "Informacoes Basicas" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsx(Field, { label: "Nome (PascalCase)", children: /* @__PURE__ */ jsx(
          "input",
          {
            className: inputBase,
            value: name,
            onChange: (e) => setName(e.target.value),
            placeholder: "HeroSplit",
            required: true
          }
        ) }),
        /* @__PURE__ */ jsx(Field, { label: "Categoria", children: /* @__PURE__ */ jsx("select", { className: inputBase, value: category, onChange: (e) => setCategory(e.target.value), children: CATEGORIES.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, c)) }) }),
        /* @__PURE__ */ jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsx(Field, { label: "Descricao", children: /* @__PURE__ */ jsx(
          "input",
          {
            className: inputBase,
            value: description,
            onChange: (e) => setDescription(e.target.value),
            placeholder: "Descricao curta do componente",
            required: true
          }
        ) }) }),
        /* @__PURE__ */ jsx(Field, { label: "Tags (separadas por virgula)", children: /* @__PURE__ */ jsx(
          "input",
          {
            className: inputBase,
            value: tags,
            onChange: (e) => setTags(e.target.value),
            placeholder: "hero, split, imagem"
          }
        ) }),
        /* @__PURE__ */ jsx(Field, { label: "Melhor para", children: /* @__PURE__ */ jsx(
          "input",
          {
            className: inputBase,
            value: bestFor,
            onChange: (e) => setBestFor(e.target.value),
            placeholder: "Landing pages com imagem lateral"
          }
        ) })
      ] }),
      name && /* @__PURE__ */ jsxs("div", { className: "mt-3 text-sm", children: [
        /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "ID gerado: " }),
        /* @__PURE__ */ jsx("code", { className: "bg-gray-100 px-1.5 py-0.5 rounded text-xs", children: generateId(name) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: cardBase, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Props" }),
        /* @__PURE__ */ jsx("button", { type: "button", className: `${btnOutline} py-1 px-3 text-xs`, onClick: addProp, children: "+ Adicionar Prop" })
      ] }),
      props.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-gray-600 py-4 text-center", children: "Nenhuma prop adicionada ainda." }),
      props.map((prop, i) => /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[1fr_100px_60px_1fr_1fr_auto] gap-2 items-end py-2 border-b border-gray-100 last:border-0", children: [
        /* @__PURE__ */ jsx(Field, { label: "Nome", children: /* @__PURE__ */ jsx("input", { className: inputBase, value: prop.name, onChange: (e) => updateProp(i, "name", e.target.value), placeholder: "titulo" }) }),
        /* @__PURE__ */ jsx(Field, { label: "Tipo", children: /* @__PURE__ */ jsxs("select", { className: inputBase, value: prop.type, onChange: (e) => updateProp(i, "type", e.target.value), children: [
          /* @__PURE__ */ jsx("option", { value: "string", children: "string" }),
          /* @__PURE__ */ jsx("option", { value: "number", children: "number" }),
          /* @__PURE__ */ jsx("option", { value: "boolean", children: "boolean" }),
          /* @__PURE__ */ jsx("option", { value: "string[]", children: "string[]" }),
          /* @__PURE__ */ jsx("option", { value: "Record<string, string>", children: "Record" })
        ] }) }),
        /* @__PURE__ */ jsx(Field, { label: "Obrig.", children: /* @__PURE__ */ jsx("input", { type: "checkbox", checked: prop.required, onChange: (e) => updateProp(i, "required", e.target.checked) }) }),
        /* @__PURE__ */ jsx(Field, { label: "Descricao", children: /* @__PURE__ */ jsx("input", { className: inputBase, value: prop.description, onChange: (e) => updateProp(i, "description", e.target.value), placeholder: "Descricao" }) }),
        /* @__PURE__ */ jsx(Field, { label: "Preview", children: /* @__PURE__ */ jsx("input", { className: inputBase, value: prop.previewValue, onChange: (e) => updateProp(i, "previewValue", e.target.value), placeholder: "Valor" }) }),
        /* @__PURE__ */ jsx("button", { type: "button", className: btnDanger, onClick: () => removeProp(i), children: "×" })
      ] }, i))
    ] }),
    /* @__PURE__ */ jsxs("div", { className: cardBase, children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-4", children: "Codigo do Componente (.astro)" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          className: `${inputBase} min-h-[300px] font-mono text-sm resize-y`,
          value: astroCode,
          onChange: (e) => setAstroCode(e.target.value),
          placeholder: "---\ninterface Props {\n  titulo: string\n}\nconst { titulo } = Astro.props\n---\n\n<section>\n  <h1>{titulo}</h1>\n</section>",
          required: true
        }
      )
    ] }),
    name && props.length > 0 && /* @__PURE__ */ jsxs("div", { className: cardBase, children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-2", children: "Preview Gerado" }),
      /* @__PURE__ */ jsx("pre", { className: "bg-gray-100 p-3 rounded-lg text-xs font-mono overflow-x-auto mb-4", children: generatePreviewCode() }),
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-2", children: "index.ts Gerado" }),
      /* @__PURE__ */ jsx("pre", { className: "bg-gray-100 p-3 rounded-lg text-xs font-mono overflow-x-auto", children: generateIndexCode() })
    ] }),
    /* @__PURE__ */ jsx("button", { type: "submit", className: `${btnPrimary} py-3 text-base`, disabled: submitting || !name || !astroCode, children: submitting ? "Publicando..." : "Publicar Componente" })
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
