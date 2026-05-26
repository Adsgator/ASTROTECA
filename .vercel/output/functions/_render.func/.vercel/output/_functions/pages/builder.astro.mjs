import { Q as createComponent, $ as renderComponent, a6 as renderTemplate, O as createAstro } from '../chunks/astro/server_BdknY_pA.mjs';
import 'kleur/colors';
import { $ as $$AppLayout } from '../chunks/AppLayout_CKk9I17a.mjs';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { useState, useEffect, useMemo } from 'react';
import { g as generateManifest } from '../chunks/manifest_DPK6IvCu.mjs';
import { f as fetchRegistry } from '../chunks/github_B0bVnyLs.mjs';
export { renderers } from '../renderers.mjs';

function Field({ label, children }) {
  return /* @__PURE__ */ jsxs("div", { className: "field", children: [
    /* @__PURE__ */ jsx("label", { className: "label", children: label }),
    children
  ] });
}
function Pair({ label, value }) {
  return /* @__PURE__ */ jsxs("div", { className: "builder__pair", children: [
    /* @__PURE__ */ jsx("span", { className: "builder__pair-label", children: label }),
    /* @__PURE__ */ jsx("span", { className: "builder__pair-value", children: value || "-" })
  ] });
}
function ColorSwatch({
  label,
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxs("div", { className: "field", children: [
    /* @__PURE__ */ jsx("label", { className: "label", children: label }),
    /* @__PURE__ */ jsxs("div", { className: "builder__color-row", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "color",
          value,
          onChange: (e) => onChange(e.target.value),
          className: "builder__color-picker"
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          className: "input",
          value,
          onChange: (e) => onChange(e.target.value),
          placeholder: "#000000"
        }
      )
    ] })
  ] });
}
const STEPS = ["Configurar", "Componentes", "Revisar"];
const EMPTY_PROJECT = {
  clientName: "",
  projectType: "landing-page",
  niche: "",
  pageGoal: "",
  siteUrl: "",
  googleAnalyticsId: ""
};
const EMPTY_ART = {
  colorPrimary: "#6366f1",
  colorSecondary: "#f59e0b",
  colorBackground: "#ffffff",
  colorText: "#111111",
  fontHeading: "Inter",
  fontBody: "Inter",
  mood: "",
  references: "",
  notes: ""
};
function Builder({ availableComponents }) {
  const [step, setStep] = useState("Configurar");
  const [project, setProject] = useState(EMPTY_PROJECT);
  const [art, setArt] = useState(EMPTY_ART);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState(null);
  const [components, setComponents] = useState(availableComponents);
  const [expandedCopy, setExpandedCopy] = useState({});
  const [copyEdits, setCopyEdits] = useState({});
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const saved = localStorage.getItem("acs-settings");
    if (saved) {
      const settings = JSON.parse(saved);
      if (settings.defaultFontHeading) {
        setArt((prev) => ({ ...prev, fontHeading: settings.defaultFontHeading || prev.fontHeading }));
      }
      if (settings.defaultFontBody) {
        setArt((prev) => ({ ...prev, fontBody: settings.defaultFontBody || prev.fontBody }));
      }
      if (settings.defaultColorPrimary) {
        setArt((prev) => ({ ...prev, colorPrimary: settings.defaultColorPrimary || prev.colorPrimary }));
      }
    }
    const builderComponents = localStorage.getItem("acs-builder-components");
    if (builderComponents) {
      const list = JSON.parse(builderComponents);
      setSelected(list);
      const edits = {};
      list.forEach((sc) => {
        if (sc.meta.copy) {
          edits[sc.meta.id] = { ...sc.meta.copy };
        }
      });
      setCopyEdits(edits);
    }
    if (availableComponents.length === 0) {
      const s = localStorage.getItem("acs-settings");
      if (s) {
        const settings = JSON.parse(s);
        if (settings.registryUrl) {
          fetch(settings.registryUrl).then((r) => r.json()).then((data) => setComponents(data)).catch(() => {
          });
        }
      }
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("acs-builder-components", JSON.stringify(selected));
  }, [selected]);
  const categories = useMemo(() => {
    const cats = /* @__PURE__ */ new Set();
    components.forEach((c) => cats.add(c.category));
    return Array.from(cats).sort();
  }, [components]);
  const filteredComponents = useMemo(() => {
    return components.filter((c) => {
      const matchSearch = search === "" || c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = !filterCategory || c.category === filterCategory;
      return matchSearch && matchCat;
    });
  }, [components, search, filterCategory]);
  function updateProject(key, value) {
    setProject((prev) => ({ ...prev, [key]: value }));
  }
  function updateArt(key, value) {
    setArt((prev) => ({ ...prev, [key]: value }));
  }
  function toggleComponent(meta) {
    setSelected((prev) => {
      const exists = prev.find((s) => s.meta.id === meta.id);
      if (exists) {
        const filtered = prev.filter((s) => s.meta.id !== meta.id);
        return filtered.map((s, i) => ({ ...s, position: i + 1 }));
      }
      const newList = [...prev, { meta, position: prev.length + 1 }];
      if (meta.copy) {
        setCopyEdits((ce) => ({ ...ce, [meta.id]: { ...meta.copy } }));
      }
      return newList;
    });
  }
  function moveComponent(index, direction) {
    setSelected((prev) => {
      const arr = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= arr.length) return prev;
      const temp = arr[index];
      arr[index] = arr[target];
      arr[target] = temp;
      return arr.map((s, i) => ({ ...s, position: i + 1 }));
    });
  }
  function removeComponent(id) {
    setSelected(
      (prev) => prev.filter((s) => s.meta.id !== id).map((s, i) => ({ ...s, position: i + 1 }))
    );
  }
  function updateCopy(componentId, key, value) {
    setCopyEdits((prev) => ({
      ...prev,
      [componentId]: { ...prev[componentId] || {}, [key]: value }
    }));
  }
  function toggleCopyExpand(id) {
    setExpandedCopy((prev) => ({ ...prev, [id]: !prev[id] }));
  }
  function getSelectedWithCopy() {
    return selected.map((sc) => ({
      ...sc,
      meta: {
        ...sc.meta,
        copy: copyEdits[sc.meta.id] || sc.meta.copy || {}
      }
    }));
  }
  function getManifest() {
    const raw = localStorage.getItem("acs-settings");
    const settings = raw ? JSON.parse(raw) : {};
    return generateManifest(project, art, getSelectedWithCopy(), settings);
  }
  function downloadManifest() {
    const text = getManifest();
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.clientName || "projeto"}-manifest.md`;
    a.click();
    URL.revokeObjectURL(url);
  }
  async function createProject() {
    setCreating(true);
    setError("");
    try {
      const raw = localStorage.getItem("acs-settings");
      if (!raw) throw new Error("Configure o GitHub em Configuracoes primeiro.");
      const settings = JSON.parse(raw);
      const manifest = getManifest();
      const res = await fetch("/api/create-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings,
          clientName: project.clientName,
          manifest
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar projeto");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setCreating(false);
    }
  }
  function isSelected(id) {
    return selected.some((s) => s.meta.id === id);
  }
  function getPosition(id) {
    const s = selected.find((sc) => sc.meta.id === id);
    return s ? s.position : null;
  }
  if (result) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("style", { children: `
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
        ` }),
      /* @__PURE__ */ jsxs("div", { className: "builder__result", children: [
        /* @__PURE__ */ jsx("div", { className: "builder__result-title", children: "Projeto criado com sucesso!" }),
        /* @__PURE__ */ jsxs("div", { className: "card", children: [
          /* @__PURE__ */ jsx(Pair, { label: "Repositorio", value: result.repoUrl }),
          /* @__PURE__ */ jsxs("div", { className: "builder__result-links", children: [
            /* @__PURE__ */ jsx("a", { href: result.repoUrl, target: "_blank", rel: "noopener", className: "btn btn-primary", children: "Abrir no GitHub" }),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: `vscode://vscode.git/clone?url=${encodeURIComponent(result.cloneUrl)}`,
                className: "btn btn-outline",
                children: "Abrir no VS Code"
              }
            ),
            /* @__PURE__ */ jsx("button", { className: "btn btn-outline", onClick: downloadManifest, children: "Baixar Manifesto (.md)" })
          ] })
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("style", { children: `
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
      ` }),
    /* @__PURE__ */ jsxs("div", { className: "builder", children: [
      /* @__PURE__ */ jsxs("div", { className: "builder__content", children: [
        /* @__PURE__ */ jsx("div", { className: "tab-bar", children: STEPS.map((s, i) => /* @__PURE__ */ jsxs(
          "button",
          {
            className: `tab ${step === s ? "active" : ""}`,
            onClick: () => setStep(s),
            children: [
              i + 1,
              ". ",
              s
            ]
          },
          s
        )) }),
        step === "Configurar" && /* @__PURE__ */ jsxs("div", { className: "card", children: [
          /* @__PURE__ */ jsx("h2", { className: "section-title", children: "Dados do Projeto" }),
          /* @__PURE__ */ jsxs("div", { className: "builder__form-grid", children: [
            /* @__PURE__ */ jsx(Field, { label: "Nome do cliente", children: /* @__PURE__ */ jsx(
              "input",
              {
                className: "input",
                value: project.clientName,
                onChange: (e) => updateProject("clientName", e.target.value),
                placeholder: "acme-corp"
              }
            ) }),
            /* @__PURE__ */ jsx(Field, { label: "Tipo de projeto", children: /* @__PURE__ */ jsxs(
              "select",
              {
                className: "input",
                value: project.projectType,
                onChange: (e) => updateProject("projectType", e.target.value),
                children: [
                  /* @__PURE__ */ jsx("option", { value: "landing-page", children: "Landing Page" }),
                  /* @__PURE__ */ jsx("option", { value: "site-institucional", children: "Site Institucional" }),
                  /* @__PURE__ */ jsx("option", { value: "portfolio", children: "Portfolio" }),
                  /* @__PURE__ */ jsx("option", { value: "blog", children: "Blog" }),
                  /* @__PURE__ */ jsx("option", { value: "ecommerce", children: "E-commerce" })
                ]
              }
            ) }),
            /* @__PURE__ */ jsx(Field, { label: "Nicho", children: /* @__PURE__ */ jsx(
              "input",
              {
                className: "input",
                value: project.niche,
                onChange: (e) => updateProject("niche", e.target.value),
                placeholder: "ex: saude, tech, educacao"
              }
            ) }),
            /* @__PURE__ */ jsx(Field, { label: "Objetivo da pagina", children: /* @__PURE__ */ jsx(
              "input",
              {
                className: "input",
                value: project.pageGoal,
                onChange: (e) => updateProject("pageGoal", e.target.value),
                placeholder: "ex: captar leads, vender produto"
              }
            ) }),
            /* @__PURE__ */ jsx(Field, { label: "URL do site", children: /* @__PURE__ */ jsx(
              "input",
              {
                className: "input",
                value: project.siteUrl,
                onChange: (e) => updateProject("siteUrl", e.target.value),
                placeholder: "https://..."
              }
            ) }),
            /* @__PURE__ */ jsx(Field, { label: "Google Analytics ID", children: /* @__PURE__ */ jsx(
              "input",
              {
                className: "input",
                value: project.googleAnalyticsId,
                onChange: (e) => updateProject("googleAnalyticsId", e.target.value),
                placeholder: "G-XXXXXXXXXX"
              }
            ) })
          ] }),
          /* @__PURE__ */ jsx("h2", { className: "section-title", children: "Direcao de Arte" }),
          /* @__PURE__ */ jsxs("div", { className: "builder__form-grid", children: [
            /* @__PURE__ */ jsx(
              ColorSwatch,
              {
                label: "Cor Primaria",
                value: art.colorPrimary,
                onChange: (v) => updateArt("colorPrimary", v)
              }
            ),
            /* @__PURE__ */ jsx(
              ColorSwatch,
              {
                label: "Cor Secundaria",
                value: art.colorSecondary,
                onChange: (v) => updateArt("colorSecondary", v)
              }
            ),
            /* @__PURE__ */ jsx(
              ColorSwatch,
              {
                label: "Cor de Fundo",
                value: art.colorBackground,
                onChange: (v) => updateArt("colorBackground", v)
              }
            ),
            /* @__PURE__ */ jsx(
              ColorSwatch,
              {
                label: "Cor do Texto",
                value: art.colorText,
                onChange: (v) => updateArt("colorText", v)
              }
            ),
            /* @__PURE__ */ jsx(Field, { label: "Fonte dos titulos", children: /* @__PURE__ */ jsx(
              "input",
              {
                className: "input",
                value: art.fontHeading,
                onChange: (e) => updateArt("fontHeading", e.target.value),
                placeholder: "Inter"
              }
            ) }),
            /* @__PURE__ */ jsx(Field, { label: "Fonte do corpo", children: /* @__PURE__ */ jsx(
              "input",
              {
                className: "input",
                value: art.fontBody,
                onChange: (e) => updateArt("fontBody", e.target.value),
                placeholder: "Inter"
              }
            ) }),
            /* @__PURE__ */ jsx("div", { className: "builder__form-full", children: /* @__PURE__ */ jsx(Field, { label: "Mood / Tom", children: /* @__PURE__ */ jsx(
              "input",
              {
                className: "input",
                value: art.mood,
                onChange: (e) => updateArt("mood", e.target.value),
                placeholder: "ex: profissional, acolhedor, moderno"
              }
            ) }) }),
            /* @__PURE__ */ jsx("div", { className: "builder__form-full", children: /* @__PURE__ */ jsx(Field, { label: "Referencias visuais", children: /* @__PURE__ */ jsx(
              "textarea",
              {
                className: "input",
                value: art.references,
                onChange: (e) => updateArt("references", e.target.value),
                placeholder: "Links ou descricao de referencias",
                rows: 3
              }
            ) }) }),
            /* @__PURE__ */ jsx("div", { className: "builder__form-full", children: /* @__PURE__ */ jsx(Field, { label: "Observacoes", children: /* @__PURE__ */ jsx(
              "textarea",
              {
                className: "input",
                value: art.notes,
                onChange: (e) => updateArt("notes", e.target.value),
                placeholder: "Qualquer nota adicional sobre o projeto",
                rows: 3
              }
            ) }) })
          ] })
        ] }),
        step === "Componentes" && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "builder__form-grid", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                className: "input",
                placeholder: "Buscar componentes...",
                value: search,
                onChange: (e) => setSearch(e.target.value)
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "browser__categories", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: `btn btn-sm ${!filterCategory ? "btn-primary" : "btn-ghost"}`,
                  onClick: () => setFilterCategory(null),
                  children: "Todos"
                }
              ),
              categories.map((cat) => /* @__PURE__ */ jsx(
                "button",
                {
                  className: `btn btn-sm ${filterCategory === cat ? "btn-primary" : "btn-ghost"}`,
                  onClick: () => setFilterCategory(cat),
                  children: cat
                },
                cat
              ))
            ] })
          ] }),
          filteredComponents.length === 0 ? /* @__PURE__ */ jsx("div", { className: "empty-state", children: "Nenhum componente encontrado." }) : /* @__PURE__ */ jsx("div", { className: "builder__comp-grid", children: filteredComponents.map((c) => {
            const sel = isSelected(c.id);
            const pos = getPosition(c.id);
            return /* @__PURE__ */ jsxs(
              "div",
              {
                className: `card card-interactive ${sel ? "card-selected" : ""}`,
                onClick: () => toggleComponent(c),
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "builder__comp-card-header", children: [
                    /* @__PURE__ */ jsx("span", { className: "builder__comp-card-name", children: c.name }),
                    pos !== null && /* @__PURE__ */ jsx("span", { className: "badge badge-accent", children: pos })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "builder__comp-card-desc", children: c.description }),
                  /* @__PURE__ */ jsx("div", { className: "builder__comp-card-category", children: /* @__PURE__ */ jsx("span", { className: "badge badge-default", children: c.category }) })
                ]
              },
              c.id
            );
          }) })
        ] }),
        step === "Revisar" && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "card", children: [
            /* @__PURE__ */ jsx("h2", { className: "section-title", children: "Resumo do Projeto" }),
            /* @__PURE__ */ jsxs("div", { className: "builder__form-grid", children: [
              /* @__PURE__ */ jsx(Pair, { label: "Cliente", value: project.clientName }),
              /* @__PURE__ */ jsx(Pair, { label: "Tipo", value: project.projectType }),
              /* @__PURE__ */ jsx(Pair, { label: "Nicho", value: project.niche }),
              /* @__PURE__ */ jsx(Pair, { label: "Objetivo", value: project.pageGoal }),
              /* @__PURE__ */ jsx(Pair, { label: "URL", value: project.siteUrl }),
              /* @__PURE__ */ jsx(Pair, { label: "GA ID", value: project.googleAnalyticsId })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "card", children: [
            /* @__PURE__ */ jsxs("h2", { className: "section-title", children: [
              "Componentes (",
              selected.length,
              ")"
            ] }),
            selected.length === 0 ? /* @__PURE__ */ jsx("div", { className: "empty-state", children: "Nenhum componente selecionado." }) : selected.map((sc, index) => /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "builder__review-item", children: [
                /* @__PURE__ */ jsx("span", { className: "builder__review-position", children: sc.position }),
                /* @__PURE__ */ jsxs("div", { className: "builder__review-info", children: [
                  /* @__PURE__ */ jsx("strong", { children: sc.meta.name }),
                  /* @__PURE__ */ jsx("div", { className: "builder__comp-card-desc", children: sc.meta.description })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "builder__review-actions", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      className: "btn btn-ghost btn-sm btn-icon",
                      onClick: () => moveComponent(index, "up"),
                      disabled: index === 0,
                      children: "^"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      className: "btn btn-ghost btn-sm btn-icon",
                      onClick: () => moveComponent(index, "down"),
                      disabled: index === selected.length - 1,
                      children: "v"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      className: "btn btn-danger btn-sm btn-icon",
                      onClick: () => removeComponent(sc.meta.id),
                      children: "x"
                    }
                  )
                ] })
              ] }),
              sc.meta.copy && Object.keys(sc.meta.copy).length > 0 && /* @__PURE__ */ jsxs("div", { className: "builder__copy-section", children: [
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    className: "builder__copy-toggle",
                    onClick: () => toggleCopyExpand(sc.meta.id),
                    children: [
                      expandedCopy[sc.meta.id] ? "v" : ">",
                      " Editar textos (",
                      Object.keys(sc.meta.copy).length,
                      " campos)"
                    ]
                  }
                ),
                expandedCopy[sc.meta.id] && /* @__PURE__ */ jsx("div", { children: Object.entries(copyEdits[sc.meta.id] || sc.meta.copy).map(
                  ([key, value]) => /* @__PURE__ */ jsxs("div", { className: "builder__copy-field", children: [
                    /* @__PURE__ */ jsx("label", { children: key }),
                    /* @__PURE__ */ jsx(
                      "textarea",
                      {
                        className: "input",
                        value,
                        onChange: (e) => updateCopy(sc.meta.id, key, e.target.value),
                        rows: 2
                      }
                    )
                  ] }, key)
                ) })
              ] })
            ] }, sc.meta.id))
          ] }),
          error && /* @__PURE__ */ jsx("div", { className: "builder__error", children: error }),
          /* @__PURE__ */ jsxs("div", { className: "builder__actions", children: [
            /* @__PURE__ */ jsx("button", { className: "btn btn-outline", onClick: downloadManifest, children: "Baixar Manifesto (.md)" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "btn btn-primary",
                onClick: createProject,
                disabled: creating || !project.clientName,
                children: creating ? "Criando..." : "Criar Projeto no GitHub"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "builder__aside", children: [
        /* @__PURE__ */ jsx("div", { className: "card", children: /* @__PURE__ */ jsxs("div", { className: "builder__aside-section", children: [
          /* @__PURE__ */ jsx("div", { className: "builder__aside-title", children: "Cliente" }),
          /* @__PURE__ */ jsx("div", { children: project.clientName || "(nao definido)" }),
          /* @__PURE__ */ jsxs("div", { className: "builder__comp-card-desc", children: [
            project.projectType,
            " - ",
            project.niche || "-"
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "card", children: /* @__PURE__ */ jsxs("div", { className: "builder__aside-section", children: [
          /* @__PURE__ */ jsx("div", { className: "builder__aside-title", children: "Estrutura da Pagina" }),
          selected.length === 0 ? /* @__PURE__ */ jsx("div", { className: "builder__comp-card-desc", children: "Nenhum componente adicionado" }) : selected.map((sc) => /* @__PURE__ */ jsxs("div", { className: "builder__aside-component", children: [
            /* @__PURE__ */ jsx("span", { className: "badge badge-accent", children: sc.position }),
            /* @__PURE__ */ jsx("span", { children: sc.meta.name })
          ] }, sc.meta.id))
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "card", children: /* @__PURE__ */ jsxs("div", { className: "builder__aside-section", children: [
          /* @__PURE__ */ jsx("div", { className: "builder__aside-title", children: "Cores" }),
          /* @__PURE__ */ jsxs("div", { className: "builder__aside-colors", children: [
            /* @__PURE__ */ jsx("div", { className: "builder__aside-swatch", style: { background: art.colorPrimary }, title: "Primaria" }),
            /* @__PURE__ */ jsx("div", { className: "builder__aside-swatch", style: { background: art.colorSecondary }, title: "Secundaria" }),
            /* @__PURE__ */ jsx("div", { className: "builder__aside-swatch", style: { background: art.colorBackground }, title: "Fundo" }),
            /* @__PURE__ */ jsx("div", { className: "builder__aside-swatch", style: { background: art.colorText }, title: "Texto" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "card", children: /* @__PURE__ */ jsxs("div", { className: "builder__aside-section", children: [
          /* @__PURE__ */ jsx("div", { className: "builder__aside-title", children: "Tipografia" }),
          /* @__PURE__ */ jsx(Pair, { label: "Titulos", value: art.fontHeading }),
          /* @__PURE__ */ jsx(Pair, { label: "Corpo", value: art.fontBody })
        ] }) })
      ] })
    ] })
  ] });
}

const $$Astro = createAstro();
const $$Builder = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Builder;
  let components = [];
  const registryUrl = "https://raw.githubusercontent.com/seuusuario/minha-lib-astro/main/registry.json";
  {
    try {
      components = await fetchRegistry(registryUrl);
    } catch {
    }
  }
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Builder - Astroteca" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Builder", Builder, { "client:load": true, "availableComponents": components, "client:component-hydration": "load", "client:component-path": "C:/PROJETOS/ADSGATOR/ASTROTECA/src/components/Builder", "client:component-export": "default" })} ` })}`;
}, "C:/PROJETOS/ADSGATOR/ASTROTECA/src/pages/builder.astro", void 0);
const $$file = "C:/PROJETOS/ADSGATOR/ASTROTECA/src/pages/builder.astro";
const $$url = "/builder";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Builder,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
