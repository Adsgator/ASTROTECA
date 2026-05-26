import { Q as createComponent, $ as renderComponent, a6 as renderTemplate, O as createAstro } from '../chunks/astro/server_BdknY_pA.mjs';
import 'kleur/colors';
import { $ as $$AppLayout } from '../chunks/AppLayout_CMGUMeQX.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
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
  const [addedId, setAddedId] = useState(null);
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
    setAddedId(meta.id);
    setTimeout(() => setAddedId(null), 2e3);
  }
  const btnBase = "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors";
  const btnPrimary = `${btnBase} bg-accent text-bg hover:bg-accent-hover`;
  const btnGhost = `${btnBase} bg-transparent text-ink-secondary hover:bg-raised hover:text-ink-primary`;
  const cardBase = "rounded-xl border border-border bg-surface overflow-hidden cursor-pointer transition-all hover:border-accent/50";
  const badgeBase = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
  return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-6 h-[calc(100vh-4rem)]", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            className: "w-full rounded-lg border border-border bg-raised px-4 py-2 text-sm text-ink-primary placeholder-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent",
            placeholder: "Buscar componentes...",
            value: search,
            onChange: (e) => setSearch(e.target.value)
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: !activeCategory ? btnPrimary : btnGhost,
              onClick: () => setActiveCategory(null),
              children: "Todos"
            }
          ),
          categories.map((cat) => /* @__PURE__ */ jsx(
            "button",
            {
              className: activeCategory === cat ? btnPrimary : btnGhost,
              onClick: () => setActiveCategory(cat),
              children: cat
            },
            cat
          ))
        ] })
      ] }),
      loading && /* @__PURE__ */ jsx("div", { className: "flex flex-1 items-center justify-center text-ink-secondary", children: "Carregando componentes..." }),
      error && /* @__PURE__ */ jsx("div", { className: "flex flex-1 items-center justify-center text-fail", children: error }),
      !loading && !error && filtered.length === 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-1 items-center justify-center text-ink-secondary", children: "Nenhum componente encontrado." }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 overflow-y-auto pr-2", children: filtered.map((c) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: `${cardBase} ${selectedId === c.id ? "ring-2 ring-accent" : ""}`,
          onClick: () => setSelectedId(c.id),
          children: [
            c.screenshotUrl && /* @__PURE__ */ jsx(
              "img",
              {
                src: c.screenshotUrl,
                alt: c.name,
                className: "h-28 w-full object-cover"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "p-3", children: [
              /* @__PURE__ */ jsx("div", { className: "mb-1 font-semibold text-sm", children: c.name }),
              /* @__PURE__ */ jsx("div", { className: "mb-2 text-xs text-ink-secondary line-clamp-2", children: c.description }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1", children: [
                /* @__PURE__ */ jsx("span", { className: `${badgeBase} bg-raised text-ink-secondary`, children: c.category }),
                c.tags.slice(0, 2).map((t) => /* @__PURE__ */ jsx("span", { className: `${badgeBase} bg-border-subtle text-ink-muted`, children: t }, t))
              ] })
            ] })
          ]
        },
        c.id
      )) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-4 overflow-y-auto", children: !selected ? /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center text-ink-secondary", children: "Selecione um componente para ver detalhes." }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-border bg-surface overflow-hidden min-h-[200px]", children: selected.screenshotUrl ? /* @__PURE__ */ jsx(
        "img",
        {
          src: selected.screenshotUrl,
          alt: selected.name,
          className: "w-full h-auto max-h-[300px] object-cover"
        }
      ) : /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center text-ink-secondary p-8", children: "Sem preview disponivel" }) }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-surface p-5 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold mb-1", children: selected.name }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-secondary", children: selected.description })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: `${btnPrimary} ${addedId === selected.id ? "bg-ok" : ""}`,
              onClick: () => addToBuilder(selected),
              children: addedId === selected.id ? "Adicionado!" : "Adicionar ao Builder"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: `${badgeBase} bg-accent-dim text-accent`, children: selected.category }),
          selected.tags.map((t) => /* @__PURE__ */ jsx("span", { className: `${badgeBase} bg-raised text-ink-secondary`, children: t }, t))
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-ink-muted uppercase mb-1", children: "Melhor para" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm", children: selected.bestFor.join(", ") })
        ] }),
        selected.props.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-ink-muted uppercase", children: "Props" }),
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border", children: [
              /* @__PURE__ */ jsx("th", { className: "text-left py-2 px-3 text-xs font-medium text-ink-muted uppercase", children: "Nome" }),
              /* @__PURE__ */ jsx("th", { className: "text-left py-2 px-3 text-xs font-medium text-ink-muted uppercase", children: "Tipo" }),
              /* @__PURE__ */ jsx("th", { className: "text-left py-2 px-3 text-xs font-medium text-ink-muted uppercase", children: "Obrig." }),
              /* @__PURE__ */ jsx("th", { className: "text-left py-2 px-3 text-xs font-medium text-ink-muted uppercase", children: "Descricao" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { children: selected.props.map((p) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-border-subtle last:border-0", children: [
              /* @__PURE__ */ jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsx("code", { className: "text-xs bg-raised px-1.5 py-0.5 rounded", children: p.name }) }),
              /* @__PURE__ */ jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsx("code", { className: "text-xs bg-raised px-1.5 py-0.5 rounded", children: p.type }) }),
              /* @__PURE__ */ jsx("td", { className: "py-2 px-3", children: p.required ? "Sim" : "Nao" }),
              /* @__PURE__ */ jsx("td", { className: "py-2 px-3 text-ink-secondary", children: p.description })
            ] }, p.name)) })
          ] }) })
        ] }),
        selected.copy && Object.keys(selected.copy).length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-ink-muted uppercase", children: "Copy editavel" }),
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border", children: [
              /* @__PURE__ */ jsx("th", { className: "text-left py-2 px-3 text-xs font-medium text-ink-muted uppercase", children: "Chave" }),
              /* @__PURE__ */ jsx("th", { className: "text-left py-2 px-3 text-xs font-medium text-ink-muted uppercase", children: "Valor padrao" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { children: Object.entries(selected.copy).map(([k, v]) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-border-subtle last:border-0", children: [
              /* @__PURE__ */ jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsx("code", { className: "text-xs bg-raised px-1.5 py-0.5 rounded", children: k }) }),
              /* @__PURE__ */ jsx("td", { className: "py-2 px-3 text-ink-secondary", children: v })
            ] }, k)) })
          ] }) })
        ] })
      ] })
    ] }) })
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
