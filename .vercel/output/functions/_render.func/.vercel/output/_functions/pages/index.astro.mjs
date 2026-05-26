import { Q as createComponent, $ as renderComponent, a6 as renderTemplate, O as createAstro } from '../chunks/astro/server_BdknY_pA.mjs';
import 'kleur/colors';
import { $ as $$AppLayout } from '../chunks/AppLayout_CV10e5-C.mjs';
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
      setComponents(getFallbackRegistry());
    }
  }, [initialComponents.length, initialError]);
  function getFallbackRegistry() {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    return [
      {
        id: "hero-split",
        name: "Hero Split",
        category: "Hero",
        description: "Hero com imagem ao lado. Ideal para servicos.",
        previewUrl: "/preview/hero-split",
        screenshotUrl: "",
        codeUrl: "Hero/HeroSplit.astro",
        tags: ["hero", "split"],
        props: [{ name: "title", type: "string", required: true, previewValue: "Título" }],
        bestFor: ["servicos"],
        createdAt: now,
        updatedAt: now
      },
      {
        id: "features-grid-3",
        name: "Features Grid 3",
        category: "Features",
        description: "3 diferenciais em grid.",
        previewUrl: "/preview/features-grid-3",
        screenshotUrl: "",
        codeUrl: "Features/FeaturesGrid3.astro",
        tags: ["features", "grid"],
        props: [{ name: "title", type: "string", required: true, previewValue: "Título" }],
        bestFor: ["qualquer"],
        createdAt: now,
        updatedAt: now
      },
      {
        id: "testimonials-cards",
        name: "Testimonials Cards",
        category: "Testimonials",
        description: "Depoimentos em cards.",
        previewUrl: "/preview/testimonials-cards",
        screenshotUrl: "",
        codeUrl: "Testimonials/TestimonialsCards.astro",
        tags: ["testimonials", "cards"],
        props: [{ name: "title", type: "string", required: true, previewValue: "Título" }],
        bestFor: ["social"],
        createdAt: now,
        updatedAt: now
      },
      {
        id: "pricing-cards",
        name: "Pricing Cards",
        category: "Pricing",
        description: "Tabela de precos em cards.",
        previewUrl: "/preview/pricing-cards",
        screenshotUrl: "",
        codeUrl: "Pricing/PricingCards.astro",
        tags: ["pricing", "cards"],
        props: [{ name: "title", type: "string", required: true, previewValue: "Título" }],
        bestFor: ["precos"],
        createdAt: now,
        updatedAt: now
      },
      {
        id: "cta-banner",
        name: "CTA Banner",
        category: "CTA",
        description: "Banner de call-to-action.",
        previewUrl: "/preview/cta-banner",
        screenshotUrl: "",
        codeUrl: "CTA/CTABanner.astro",
        tags: ["cta", "banner"],
        props: [{ name: "title", type: "string", required: true, previewValue: "Título" }],
        bestFor: ["todos"],
        createdAt: now,
        updatedAt: now
      },
      {
        id: "faq-accordion",
        name: "FAQ Accordion",
        category: "FAQ",
        description: "Perguntas frequentes.",
        previewUrl: "/preview/faq-accordion",
        screenshotUrl: "",
        codeUrl: "FAQ/FAQAccordion.astro",
        tags: ["faq", "accordion"],
        props: [{ name: "title", type: "string", required: true, previewValue: "Título" }],
        bestFor: ["todos"],
        createdAt: now,
        updatedAt: now
      },
      {
        id: "contact-section",
        name: "Contact Section",
        category: "Contact",
        description: "Secao de contato com formulario.",
        previewUrl: "/preview/contact-section",
        screenshotUrl: "",
        codeUrl: "Contact/ContactSection.astro",
        tags: ["contact", "formulario"],
        props: [{ name: "title", type: "string", required: true, previewValue: "Título" }],
        bestFor: ["todos"],
        createdAt: now,
        updatedAt: now
      },
      {
        id: "footer-simples",
        name: "Footer Simples",
        category: "Footer",
        description: "Rodape com links e social.",
        previewUrl: "/preview/footer-simples",
        screenshotUrl: "",
        codeUrl: "Footer/FooterSimples.astro",
        tags: ["footer", "rodape"],
        props: [{ name: "title", type: "string", required: true, previewValue: "Título" }],
        bestFor: ["todos"],
        createdAt: now,
        updatedAt: now
      }
    ];
  }
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
  const btnPrimary = `${btnBase} bg-blue-600 text-white hover:bg-blue-700`;
  const btnGhost = `${btnBase} bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900`;
  const cardBase = "rounded-xl border border-gray-200 bg-white overflow-hidden cursor-pointer transition-all hover:border-blue-300 hover:shadow-sm";
  const badgeBase = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
  return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-6 h-[calc(100vh-4rem)] bg-gray-50", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 overflow-hidden p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            className: "w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
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
      loading && /* @__PURE__ */ jsx("div", { className: "flex flex-1 items-center justify-center text-gray-500", children: "Carregando componentes..." }),
      error && /* @__PURE__ */ jsx("div", { className: "flex flex-1 items-center justify-center text-red-600", children: error }),
      !loading && !error && filtered.length === 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-1 items-center justify-center text-gray-500", children: "Nenhum componente encontrado." }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 overflow-y-auto pr-2", children: filtered.map((c) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: `${cardBase} ${selectedId === c.id ? "ring-2 ring-blue-500" : ""}`,
          onClick: () => setSelectedId(c.id),
          children: [
            /* @__PURE__ */ jsx("div", { className: "h-28 bg-gray-100 flex items-center justify-center text-gray-400 text-xs", children: c.id }),
            /* @__PURE__ */ jsxs("div", { className: "p-3", children: [
              /* @__PURE__ */ jsx("div", { className: "mb-1 font-semibold text-sm text-gray-900", children: c.name }),
              /* @__PURE__ */ jsx("div", { className: "mb-2 text-xs text-gray-500 line-clamp-2", children: c.description }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1", children: [
                /* @__PURE__ */ jsx("span", { className: `${badgeBase} bg-blue-100 text-blue-700`, children: c.category }),
                c.tags.slice(0, 2).map((t) => /* @__PURE__ */ jsx("span", { className: `${badgeBase} bg-gray-100 text-gray-600`, children: t }, t))
              ] })
            ] })
          ]
        },
        c.id
      )) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-4 overflow-y-auto p-4 bg-white", children: !selected ? /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center text-gray-500", children: "Selecione um componente para ver detalhes." }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-gray-200 bg-white overflow-hidden min-h-[300px]", children: selected.previewUrl ? /* @__PURE__ */ jsx(
        "iframe",
        {
          src: selected.previewUrl,
          title: `Preview de ${selected.name}`,
          className: "w-full h-[300px] border-0",
          loading: "lazy"
        }
      ) : /* @__PURE__ */ jsx("div", { className: "flex h-[300px] items-center justify-center text-gray-500 p-8", children: "Sem preview disponivel" }) }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-200 bg-white p-5 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold mb-1 text-gray-900", children: selected.name }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: selected.description })
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
          /* @__PURE__ */ jsx("span", { className: `${badgeBase} bg-blue-100 text-blue-700`, children: selected.category }),
          selected.tags.map((t) => /* @__PURE__ */ jsx("span", { className: `${badgeBase} bg-gray-100 text-gray-600`, children: t }, t))
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-gray-400 uppercase mb-1", children: "Melhor para" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-700", children: selected.bestFor.join(", ") })
        ] }),
        selected.props.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-gray-400 uppercase", children: "Props" }),
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-200", children: [
              /* @__PURE__ */ jsx("th", { className: "text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase", children: "Nome" }),
              /* @__PURE__ */ jsx("th", { className: "text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase", children: "Tipo" }),
              /* @__PURE__ */ jsx("th", { className: "text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase", children: "Obrig." }),
              /* @__PURE__ */ jsx("th", { className: "text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase", children: "Descricao" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { children: selected.props.map((p) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 last:border-0", children: [
              /* @__PURE__ */ jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsx("code", { className: "text-xs bg-gray-100 px-1.5 py-0.5 rounded", children: p.name }) }),
              /* @__PURE__ */ jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsx("code", { className: "text-xs bg-gray-100 px-1.5 py-0.5 rounded", children: p.type }) }),
              /* @__PURE__ */ jsx("td", { className: "py-2 px-3", children: p.required ? "Sim" : "Nao" }),
              /* @__PURE__ */ jsx("td", { className: "py-2 px-3 text-gray-600", children: p.description })
            ] }, p.name)) })
          ] }) })
        ] }),
        selected.copy && Object.keys(selected.copy).length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-gray-400 uppercase", children: "Copy editavel" }),
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-200", children: [
              /* @__PURE__ */ jsx("th", { className: "text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase", children: "Chave" }),
              /* @__PURE__ */ jsx("th", { className: "text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase", children: "Valor padrao" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { children: Object.entries(selected.copy).map(([k, v]) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 last:border-0", children: [
              /* @__PURE__ */ jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsx("code", { className: "text-xs bg-gray-100 px-1.5 py-0.5 rounded", children: k }) }),
              /* @__PURE__ */ jsx("td", { className: "py-2 px-3 text-gray-600", children: v })
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
