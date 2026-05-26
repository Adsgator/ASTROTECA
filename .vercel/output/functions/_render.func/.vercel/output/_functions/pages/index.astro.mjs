import { Q as createComponent, $ as renderComponent, a6 as renderTemplate, O as createAstro } from '../chunks/astro/server_BdknY_pA.mjs';
import 'kleur/colors';
import { $ as $$AppLayout } from '../chunks/AppLayout_CKk9I17a.mjs';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { useState, useEffect, useMemo } from 'react';
import { f as fetchRegistry } from '../chunks/github_B0bVnyLs.mjs';
export { renderers } from '../renderers.mjs';

function ComponentBrowser({ initialComponents, registryUrl, initialError }) {
  const [components, setComponents] = useState(initialComponents);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (initialComponents.length === 0 && !initialError) {
      const saved = localStorage.getItem("acs-settings");
      if (saved) {
        const settings = JSON.parse(saved);
        if (settings.registryUrl) {
          setLoading(true);
          fetch(settings.registryUrl).then((r) => r.json()).then((data) => {
            setComponents(data);
            setLoading(false);
          }).catch((e) => {
            setError(e instanceof Error ? e.message : "Erro ao carregar");
            setLoading(false);
          });
        }
      }
    }
  }, []);
  const categories = useMemo(() => {
    const cats = /* @__PURE__ */ new Set();
    components.forEach((c) => cats.add(c.category));
    return Array.from(cats).sort();
  }, [components]);
  const filtered = useMemo(() => {
    return components.filter((c) => {
      const matchSearch = search === "" || c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()) || c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchCategory = !activeCategory || c.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [components, search, activeCategory]);
  const selected = useMemo(() => {
    return components.find((c) => c.id === selectedId) || null;
  }, [components, selectedId]);
  function addToBuilder(meta) {
    const raw = localStorage.getItem("acs-builder-components");
    const list = raw ? JSON.parse(raw) : [];
    if (list.some((s) => s.meta.id === meta.id)) return;
    list.push({ meta, position: list.length + 1 });
    localStorage.setItem("acs-builder-components", JSON.stringify(list));
    alert(`"${meta.name}" adicionado ao Builder!`);
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("style", { children: `
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
      ` }),
    /* @__PURE__ */ jsxs("div", { className: "browser", children: [
      /* @__PURE__ */ jsxs("div", { className: "browser__left", children: [
        /* @__PURE__ */ jsxs("div", { className: "browser__filters", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
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
                className: `btn btn-sm ${!activeCategory ? "btn-primary" : "btn-ghost"}`,
                onClick: () => setActiveCategory(null),
                children: "Todos"
              }
            ),
            categories.map((cat) => /* @__PURE__ */ jsx(
              "button",
              {
                className: `btn btn-sm ${activeCategory === cat ? "btn-primary" : "btn-ghost"}`,
                onClick: () => setActiveCategory(cat),
                children: cat
              },
              cat
            ))
          ] })
        ] }),
        loading && /* @__PURE__ */ jsx("div", { className: "empty-state", children: "Carregando componentes..." }),
        error && /* @__PURE__ */ jsx("div", { className: "empty-state", children: error }),
        !loading && !error && filtered.length === 0 && /* @__PURE__ */ jsx("div", { className: "empty-state", children: "Nenhum componente encontrado." }),
        /* @__PURE__ */ jsx("div", { className: "browser__grid", children: filtered.map((c) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: `card card-interactive ${selectedId === c.id ? "card-selected" : ""}`,
            onClick: () => setSelectedId(c.id),
            children: [
              c.screenshotUrl && /* @__PURE__ */ jsx(
                "img",
                {
                  src: c.screenshotUrl,
                  alt: c.name,
                  className: "browser__screenshot"
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "browser__card-inner", children: [
                /* @__PURE__ */ jsx("div", { className: "browser__card-title", children: c.name }),
                /* @__PURE__ */ jsx("div", { className: "browser__card-desc", children: c.description }),
                /* @__PURE__ */ jsxs("div", { className: "browser__card-tags", children: [
                  /* @__PURE__ */ jsx("span", { className: "badge badge-default", children: c.category }),
                  c.tags.slice(0, 2).map((t) => /* @__PURE__ */ jsx("span", { className: "badge", children: t }, t))
                ] })
              ] })
            ]
          },
          c.id
        )) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "browser__right", children: !selected ? /* @__PURE__ */ jsx("div", { className: "empty-state", children: "Selecione um componente para ver detalhes." }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "browser__preview", children: selected.screenshotUrl ? /* @__PURE__ */ jsx(
          "img",
          {
            src: selected.screenshotUrl,
            alt: selected.name,
            className: "browser__screenshot",
            style: { height: "auto", maxHeight: "300px" }
          }
        ) : /* @__PURE__ */ jsx("div", { className: "empty-state", children: "Sem preview disponivel" }) }),
        /* @__PURE__ */ jsxs("div", { className: "card", children: [
          /* @__PURE__ */ jsxs("div", { className: "browser__detail-header", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "browser__detail-title", children: selected.name }),
              /* @__PURE__ */ jsx("p", { className: "browser__card-desc", children: selected.description })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "btn btn-primary",
                onClick: () => addToBuilder(selected),
                children: "Adicionar ao Builder"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "browser__card-tags", children: [
            /* @__PURE__ */ jsx("span", { className: "badge badge-accent", children: selected.category }),
            selected.tags.map((t) => /* @__PURE__ */ jsx("span", { className: "badge badge-default", children: t }, t))
          ] }),
          /* @__PURE__ */ jsx("p", { className: "label", children: "Melhor para" }),
          /* @__PURE__ */ jsx("p", { children: selected.bestFor.join(", ") }),
          selected.props.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("p", { className: "label", children: "Props" }),
            /* @__PURE__ */ jsxs("table", { className: "browser__props-table", children: [
              /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
                /* @__PURE__ */ jsx("th", { children: "Nome" }),
                /* @__PURE__ */ jsx("th", { children: "Tipo" }),
                /* @__PURE__ */ jsx("th", { children: "Obrigatoria" }),
                /* @__PURE__ */ jsx("th", { children: "Descricao" })
              ] }) }),
              /* @__PURE__ */ jsx("tbody", { children: selected.props.map((p) => /* @__PURE__ */ jsxs("tr", { children: [
                /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("code", { children: p.name }) }),
                /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("code", { children: p.type }) }),
                /* @__PURE__ */ jsx("td", { children: p.required ? "Sim" : "Nao" }),
                /* @__PURE__ */ jsx("td", { children: p.description })
              ] }, p.name)) })
            ] })
          ] }),
          selected.copy && Object.keys(selected.copy).length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("p", { className: "label", children: "Copy editavel" }),
            /* @__PURE__ */ jsxs("table", { className: "browser__props-table", children: [
              /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
                /* @__PURE__ */ jsx("th", { children: "Chave" }),
                /* @__PURE__ */ jsx("th", { children: "Valor padrao" })
              ] }) }),
              /* @__PURE__ */ jsx("tbody", { children: Object.entries(selected.copy).map(([k, v]) => /* @__PURE__ */ jsxs("tr", { children: [
                /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("code", { children: k }) }),
                /* @__PURE__ */ jsx("td", { children: v })
              ] }, k)) })
            ] })
          ] })
        ] })
      ] }) })
    ] })
  ] });
}

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  let components = [];
  let error = "";
  const registryUrl = "https://raw.githubusercontent.com/seuusuario/minha-lib-astro/main/registry.json";
  {
    try {
      components = await fetchRegistry(registryUrl);
    } catch (e) {
      error = e instanceof Error ? e.message : "Erro ao carregar registro";
    }
  }
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Biblioteca - Astroteca" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "ComponentBrowser", ComponentBrowser, { "client:load": true, "initialComponents": components, "registryUrl": registryUrl, "initialError": error, "client:component-hydration": "load", "client:component-path": "C:/PROJETOS/ADSGATOR/ASTROTECA/src/components/ComponentBrowser", "client:component-export": "default" })} ` })}`;
}, "C:/PROJETOS/ADSGATOR/ASTROTECA/src/pages/index.astro", void 0);
const $$file = "C:/PROJETOS/ADSGATOR/ASTROTECA/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
