import { Q as createComponent, $ as renderComponent, a6 as renderTemplate, O as createAstro } from '../chunks/astro/server_BdknY_pA.mjs';
import 'kleur/colors';
import { $ as $$AppLayout } from '../chunks/AppLayout_CMGUMeQX.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect, useMemo } from 'react';
import { g as generateManifest } from '../chunks/manifest_DPK6IvCu.mjs';
import { f as fetchRegistry } from '../chunks/github_B0bVnyLs.mjs';
export { renderers } from '../renderers.mjs';

const inputBase = "w-full rounded-lg border border-border bg-raised px-3 py-2 text-sm text-ink-primary placeholder-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";
const btnBase = "px-4 py-2 rounded-lg text-sm font-medium transition-colors";
const btnPrimary = `${btnBase} bg-accent text-bg hover:bg-accent-hover disabled:opacity-50`;
const btnOutline = `${btnBase} border border-border bg-transparent text-ink-primary hover:bg-raised`;
const btnGhost = `${btnBase} bg-transparent text-ink-secondary hover:bg-raised hover:text-ink-primary`;
const btnDanger = `${btnBase} bg-fail text-white hover:opacity-90`;
const cardBase = "rounded-xl border border-border bg-surface overflow-hidden";
const cardInteractive = `${cardBase} cursor-pointer transition-all hover:border-accent/50`;
const badgeBase = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
function Field({ label, children }) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-ink-secondary", children: label }),
    children
  ] });
}
function Pair({ label, value }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-1 text-sm border-b border-border-subtle last:border-0", children: [
    /* @__PURE__ */ jsx("span", { className: "text-ink-muted", children: label }),
    /* @__PURE__ */ jsx("span", { className: "font-medium", children: value || "-" })
  ] });
}
function ColorSwatch({
  label,
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-ink-secondary", children: label }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "color",
          value,
          onChange: (e) => onChange(e.target.value),
          className: "w-10 h-10 rounded-lg border border-border bg-transparent cursor-pointer p-0.5"
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          className: inputBase,
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
    return /* @__PURE__ */ jsxs("div", { className: "max-w-xl mx-auto flex flex-col gap-4 pt-12", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-accent", children: "Projeto criado com sucesso!" }),
      /* @__PURE__ */ jsxs("div", { className: `${cardBase} p-5 space-y-4`, children: [
        /* @__PURE__ */ jsx(Pair, { label: "Repositorio", value: result.repoUrl }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 pt-2", children: [
          /* @__PURE__ */ jsx("a", { href: result.repoUrl, target: "_blank", rel: "noopener", className: btnPrimary, children: "Abrir no GitHub" }),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: `vscode://vscode.git/clone?url=${encodeURIComponent(result.cloneUrl)}`,
              className: btnOutline,
              children: "Abrir no VS Code"
            }
          ),
          /* @__PURE__ */ jsx("button", { className: btnOutline, onClick: downloadManifest, children: "Baixar Manifesto (.md)" })
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[1fr_280px] gap-6 min-h-[calc(100vh-4rem)]", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4", children: [
      /* @__PURE__ */ jsx("div", { className: "flex gap-2 border-b border-border pb-2", children: STEPS.map((s, i) => /* @__PURE__ */ jsxs(
        "button",
        {
          className: `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${step === s ? "bg-accent text-bg" : "text-ink-secondary hover:bg-raised hover:text-ink-primary"}`,
          onClick: () => setStep(s),
          children: [
            i + 1,
            ". ",
            s
          ]
        },
        s
      )) }),
      step === "Configurar" && /* @__PURE__ */ jsx("div", { className: cardBase, children: /* @__PURE__ */ jsxs("div", { className: "p-5 space-y-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Dados do Projeto" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsx(Field, { label: "Nome do cliente", children: /* @__PURE__ */ jsx(
            "input",
            {
              className: inputBase,
              value: project.clientName,
              onChange: (e) => updateProject("clientName", e.target.value),
              placeholder: "acme-corp"
            }
          ) }),
          /* @__PURE__ */ jsx(Field, { label: "Tipo de projeto", children: /* @__PURE__ */ jsxs(
            "select",
            {
              className: inputBase,
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
              className: inputBase,
              value: project.niche,
              onChange: (e) => updateProject("niche", e.target.value),
              placeholder: "ex: saude, tech, educacao"
            }
          ) }),
          /* @__PURE__ */ jsx(Field, { label: "Objetivo da pagina", children: /* @__PURE__ */ jsx(
            "input",
            {
              className: inputBase,
              value: project.pageGoal,
              onChange: (e) => updateProject("pageGoal", e.target.value),
              placeholder: "ex: captar leads, vender produto"
            }
          ) }),
          /* @__PURE__ */ jsx(Field, { label: "URL do site", children: /* @__PURE__ */ jsx(
            "input",
            {
              className: inputBase,
              value: project.siteUrl,
              onChange: (e) => updateProject("siteUrl", e.target.value),
              placeholder: "https://..."
            }
          ) }),
          /* @__PURE__ */ jsx(Field, { label: "Google Analytics ID", children: /* @__PURE__ */ jsx(
            "input",
            {
              className: inputBase,
              value: project.googleAnalyticsId,
              onChange: (e) => updateProject("googleAnalyticsId", e.target.value),
              placeholder: "G-XXXXXXXXXX"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold pt-4 border-t border-border", children: "Direcao de Arte" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
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
              className: inputBase,
              value: art.fontHeading,
              onChange: (e) => updateArt("fontHeading", e.target.value),
              placeholder: "Inter"
            }
          ) }),
          /* @__PURE__ */ jsx(Field, { label: "Fonte do corpo", children: /* @__PURE__ */ jsx(
            "input",
            {
              className: inputBase,
              value: art.fontBody,
              onChange: (e) => updateArt("fontBody", e.target.value),
              placeholder: "Inter"
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsx(Field, { label: "Mood / Tom", children: /* @__PURE__ */ jsx(
            "input",
            {
              className: inputBase,
              value: art.mood,
              onChange: (e) => updateArt("mood", e.target.value),
              placeholder: "ex: profissional, acolhedor, moderno"
            }
          ) }) }),
          /* @__PURE__ */ jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsx(Field, { label: "Referencias visuais", children: /* @__PURE__ */ jsx(
            "textarea",
            {
              className: `${inputBase} min-h-[80px] resize-y`,
              value: art.references,
              onChange: (e) => updateArt("references", e.target.value),
              placeholder: "Links ou descricao de referencias",
              rows: 3
            }
          ) }) }),
          /* @__PURE__ */ jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsx(Field, { label: "Observacoes", children: /* @__PURE__ */ jsx(
            "textarea",
            {
              className: `${inputBase} min-h-[80px] resize-y`,
              value: art.notes,
              onChange: (e) => updateArt("notes", e.target.value),
              placeholder: "Qualquer nota adicional sobre o projeto",
              rows: 3
            }
          ) }) })
        ] })
      ] }) }),
      step === "Componentes" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              className: `${inputBase} max-w-xs`,
              placeholder: "Buscar componentes...",
              value: search,
              onChange: (e) => setSearch(e.target.value)
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                className: !filterCategory ? btnPrimary : btnGhost,
                onClick: () => setFilterCategory(null),
                children: "Todos"
              }
            ),
            categories.map((cat) => /* @__PURE__ */ jsx(
              "button",
              {
                className: filterCategory === cat ? btnPrimary : btnGhost,
                onClick: () => setFilterCategory(cat),
                children: cat
              },
              cat
            ))
          ] })
        ] }),
        filteredComponents.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-ink-secondary py-8 text-center", children: "Nenhum componente encontrado." }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3", children: filteredComponents.map((c) => {
          const sel = isSelected(c.id);
          const pos = getPosition(c.id);
          return /* @__PURE__ */ jsxs(
            "div",
            {
              className: `${cardInteractive} ${sel ? "ring-2 ring-accent" : ""} p-4`,
              onClick: () => toggleComponent(c),
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-1", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm", children: c.name }),
                  pos !== null && /* @__PURE__ */ jsx("span", { className: `${badgeBase} bg-accent-dim text-accent`, children: pos })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-ink-secondary line-clamp-2", children: c.description }),
                /* @__PURE__ */ jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsx("span", { className: `${badgeBase} bg-raised text-ink-secondary`, children: c.category }) })
              ]
            },
            c.id
          );
        }) })
      ] }),
      step === "Revisar" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: cardBase, children: /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-4", children: "Resumo do Projeto" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-x-4", children: [
            /* @__PURE__ */ jsx(Pair, { label: "Cliente", value: project.clientName }),
            /* @__PURE__ */ jsx(Pair, { label: "Tipo", value: project.projectType }),
            /* @__PURE__ */ jsx(Pair, { label: "Nicho", value: project.niche }),
            /* @__PURE__ */ jsx(Pair, { label: "Objetivo", value: project.pageGoal }),
            /* @__PURE__ */ jsx(Pair, { label: "URL", value: project.siteUrl }),
            /* @__PURE__ */ jsx(Pair, { label: "GA ID", value: project.googleAnalyticsId })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: cardBase, children: /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-lg font-semibold mb-4", children: [
            "Componentes (",
            selected.length,
            ")"
          ] }),
          selected.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-ink-secondary py-4 text-center", children: "Nenhum componente selecionado." }) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: selected.map((sc, index) => /* @__PURE__ */ jsxs("div", { className: "border-b border-border-subtle last:border-0 pb-4 last:pb-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("span", { className: "w-6 h-6 rounded bg-accent-dim text-accent flex items-center justify-center text-sm font-bold", children: sc.position }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx("strong", { className: "block", children: sc.meta.name }),
                /* @__PURE__ */ jsx("div", { className: "text-sm text-ink-secondary", children: sc.meta.description })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    className: `${btnGhost} px-2 py-1`,
                    onClick: () => moveComponent(index, "up"),
                    disabled: index === 0,
                    children: "↑"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    className: `${btnGhost} px-2 py-1`,
                    onClick: () => moveComponent(index, "down"),
                    disabled: index === selected.length - 1,
                    children: "↓"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    className: `${btnDanger} px-2 py-1`,
                    onClick: () => removeComponent(sc.meta.id),
                    children: "×"
                  }
                )
              ] })
            ] }),
            sc.meta.copy && Object.keys(sc.meta.copy).length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-3 pt-3 border-t border-border-subtle pl-9", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  className: "text-accent text-sm font-medium hover:underline",
                  onClick: () => toggleCopyExpand(sc.meta.id),
                  children: [
                    expandedCopy[sc.meta.id] ? "▼" : "▶",
                    " Editar textos (",
                    Object.keys(sc.meta.copy).length,
                    " campos)"
                  ]
                }
              ),
              expandedCopy[sc.meta.id] && /* @__PURE__ */ jsx("div", { className: "mt-2 space-y-3", children: Object.entries(copyEdits[sc.meta.id] || sc.meta.copy).map(
                ([key, value]) => /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-ink-muted mb-1", children: key }),
                  /* @__PURE__ */ jsx(
                    "textarea",
                    {
                      className: `${inputBase} min-h-[60px] resize-y`,
                      value,
                      onChange: (e) => updateCopy(sc.meta.id, key, e.target.value),
                      rows: 2
                    }
                  )
                ] }, key)
              ) })
            ] })
          ] }, sc.meta.id)) })
        ] }) }),
        error && /* @__PURE__ */ jsx("div", { className: "p-4 border border-fail rounded-lg text-fail text-sm", children: error }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 pt-4 border-t border-border", children: [
          /* @__PURE__ */ jsx("button", { className: btnOutline, onClick: downloadManifest, children: "Baixar Manifesto (.md)" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: btnPrimary,
              onClick: createProject,
              disabled: creating || !project.clientName,
              children: creating ? "Criando..." : "Criar Projeto no GitHub"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4", children: [
      /* @__PURE__ */ jsx("div", { className: cardBase, children: /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3", children: "Cliente" }),
        /* @__PURE__ */ jsx("div", { className: "font-medium", children: project.clientName || "(nao definido)" }),
        /* @__PURE__ */ jsxs("div", { className: "text-sm text-ink-secondary", children: [
          project.projectType,
          " - ",
          project.niche || "-"
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: cardBase, children: /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3", children: "Estrutura da Pagina" }),
        selected.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-sm text-ink-secondary", children: "Nenhum componente adicionado" }) : /* @__PURE__ */ jsx("div", { className: "space-y-1", children: selected.map((sc) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: `${badgeBase} bg-accent-dim text-accent`, children: sc.position }),
          /* @__PURE__ */ jsx("span", { children: sc.meta.name })
        ] }, sc.meta.id)) })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: cardBase, children: /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3", children: "Cores" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg border border-border", style: { background: art.colorPrimary }, title: "Primaria" }),
          /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg border border-border", style: { background: art.colorSecondary }, title: "Secundaria" }),
          /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg border border-border", style: { background: art.colorBackground }, title: "Fundo" }),
          /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg border border-border", style: { background: art.colorText }, title: "Texto" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: cardBase, children: /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3", children: "Tipografia" }),
        /* @__PURE__ */ jsx(Pair, { label: "Titulos", value: art.fontHeading }),
        /* @__PURE__ */ jsx(Pair, { label: "Corpo", value: art.fontBody })
      ] }) })
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
