import { Q as createComponent, $ as renderComponent, a6 as renderTemplate, O as createAstro } from '../chunks/astro/server_7dOsTLek.mjs';
import 'kleur/colors';
import { $ as $$AppLayout } from '../chunks/AppLayout_D2cBKWlO.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useMemo, useEffect } from 'react';
import { f as fetchRegistry } from '../chunks/github_oIhC-tBw.mjs';
export { renderers } from '../renderers.mjs';

function useCountUp(target, duration = 600) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let startTime;
    function step(ts) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}
const CATEGORY_GRADIENTS = {
  Hero: ["#6366f1", "#a855f7"],
  Features: ["#3b82f6", "#06b6d4"],
  Testimonials: ["#f59e0b", "#ef4444"],
  Pricing: ["#10b981", "#059669"],
  CTA: ["#f43f5e", "#ec4899"],
  FAQ: ["#8b5cf6", "#6366f1"],
  Contact: ["#14b8a6", "#0ea5e9"],
  Footer: ["#64748b", "#475569"]
};
function getCategoryGradient(cat) {
  return CATEGORY_GRADIENTS[cat] || ["#6366f1", "#8b5cf6"];
}
const CATEGORY_ICONS = {
  Hero: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z",
  Features: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  Testimonials: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  Pricing: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  CTA: "M22 11.08V12a10 10 0 11-5.93-9.14",
  FAQ: "M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01",
  Contact: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  Footer: "M3 18h18M3 12h18M3 6h18"
};
function ComponentBrowser({ initialComponents, registryUrl, initialError }) {
  const [components, setComponents] = useState(initialComponents);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);
  const [addedId, setAddedId] = useState(null);
  const totalCount = useCountUp(components.length, 600);
  const categoriesCount = useMemo(() => [...new Set(components.map((c) => c.category))], [components]);
  const categoriesCountUp = useCountUp(categoriesCount.length, 600);
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
        description: "Hero com imagem ao lado. Ideal para servicos com foto do profissional ou produto em destaque.",
        previewUrl: "/preview/hero-split",
        screenshotUrl: "",
        codeUrl: "Hero/HeroSplit.astro",
        tags: ["hero", "split", "acima-da-dobra"],
        props: [{ name: "title", type: "string", required: true, previewValue: "Título" }],
        bestFor: ["servicos"],
        createdAt: now,
        updatedAt: now
      },
      {
        id: "hero-centered",
        name: "Hero Centered",
        category: "Hero",
        description: "Hero centralizado com call to action em destaque. Ideal para produtos e SaaS.",
        previewUrl: "/preview/hero-centered",
        screenshotUrl: "",
        codeUrl: "Hero/HeroCentered.astro",
        tags: ["hero", "acima-da-dobra"],
        props: [{ name: "title", type: "string", required: true, previewValue: "Título" }],
        bestFor: ["saas", "produtos"],
        createdAt: now,
        updatedAt: now
      },
      {
        id: "features-grid-3",
        name: "Features Grid 3",
        category: "Features",
        description: "3 diferenciais em grid. Cada card com icone, titulo e descricao.",
        previewUrl: "/preview/features-grid-3",
        screenshotUrl: "",
        codeUrl: "Features/FeaturesGrid3.astro",
        tags: ["features", "diferenciais"],
        props: [{ name: "title", type: "string", required: true, previewValue: "Título" }],
        bestFor: ["qualquer"],
        createdAt: now,
        updatedAt: now
      },
      {
        id: "testimonials-cards",
        name: "Testimonials Cards",
        category: "Testimonials",
        description: "Depoimentos em cards com foto, quote e informacoes de contato.",
        previewUrl: "/preview/testimonials-cards",
        screenshotUrl: "",
        codeUrl: "Testimonials/TestimonialsCards.astro",
        tags: ["testimonials", "depoimentos"],
        props: [{ name: "title", type: "string", required: true, previewValue: "Título" }],
        bestFor: ["social"],
        createdAt: now,
        updatedAt: now
      },
      {
        id: "pricing-cards",
        name: "Pricing Cards",
        category: "Pricing",
        description: "Tabela de precos em cards. Destaque para plano recomendado.",
        previewUrl: "/preview/pricing-cards",
        screenshotUrl: "",
        codeUrl: "Pricing/PricingCards.astro",
        tags: ["pricing", "precos"],
        props: [{ name: "title", type: "string", required: true, previewValue: "Título" }],
        bestFor: ["precos"],
        createdAt: now,
        updatedAt: now
      },
      {
        id: "cta-banner",
        name: "CTA Banner",
        category: "CTA",
        description: "Banner de call-to-action final com headline, subheadline e botao.",
        previewUrl: "/preview/cta-banner",
        screenshotUrl: "",
        codeUrl: "CTA/CTABanner.astro",
        tags: ["cta", "call-to-action"],
        props: [{ name: "title", type: "string", required: true, previewValue: "Título" }],
        bestFor: ["todos"],
        createdAt: now,
        updatedAt: now
      },
      {
        id: "faq-accordion",
        name: "FAQ Accordion",
        category: "FAQ",
        description: "Perguntas frequentes em accordion. Melhora SEO e converte objecoes.",
        previewUrl: "/preview/faq-accordion",
        screenshotUrl: "",
        codeUrl: "FAQ/FAQAccordion.astro",
        tags: ["faq", "perguntas"],
        props: [{ name: "title", type: "string", required: true, previewValue: "Título" }],
        bestFor: ["todos"],
        createdAt: now,
        updatedAt: now
      },
      {
        id: "contact-section",
        name: "Contact Section",
        category: "Contact",
        description: "Secao de contato com formulario e informacoes de contato.",
        previewUrl: "/preview/contact-section",
        screenshotUrl: "",
        codeUrl: "Contact/ContactSection.astro",
        tags: ["contact", "contato"],
        props: [{ name: "title", type: "string", required: true, previewValue: "Título" }],
        bestFor: ["todos"],
        createdAt: now,
        updatedAt: now
      },
      {
        id: "footer-simples",
        name: "Footer Simples",
        category: "Footer",
        description: "Rodape com logo, links rapidos, redes sociais e copyright.",
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
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold font-heading tracking-tight text-ink-primary", children: "Biblioteca" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-secondary mt-1", children: "Explore e adicione componentes ao seu projeto" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6 px-5 py-2.5 rounded-xl border border-white/[0.06] bg-surface/60 backdrop-blur-xl", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-lg font-bold text-ink-primary leading-none", children: totalCount }),
          /* @__PURE__ */ jsx("div", { className: "text-[10px] text-ink-muted uppercase tracking-wider mt-0.5", children: "Total" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-px h-8 bg-border" }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-lg font-bold text-accent leading-none", children: categoriesCountUp }),
          /* @__PURE__ */ jsx("div", { className: "text-[10px] text-ink-muted uppercase tracking-wider mt-0.5", children: "Categorias" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-px h-8 bg-border" }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-lg font-bold text-ink-primary leading-none", children: filtered.length }),
          /* @__PURE__ */ jsx("div", { className: "text-[10px] text-ink-muted uppercase tracking-wider mt-0.5", children: "Visíveis" })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative flex-1 max-w-md", children: [
        /* @__PURE__ */ jsxs("svg", { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
          /* @__PURE__ */ jsx("circle", { cx: "11", cy: "11", r: "8" }),
          /* @__PURE__ */ jsx("path", { d: "m21 21-4.35-4.35" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            className: "w-full rounded-xl border border-white/[0.06] bg-surface/60 backdrop-blur-xl pl-10 pr-4 py-2.5 text-sm text-ink-primary placeholder-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all",
            placeholder: "Buscar por nome, tag ou descricao...",
            value: search,
            onChange: (e) => setSearch(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5 flex-wrap", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: `px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${!activeCategory ? "bg-accent text-black shadow-[0_2px_8px_rgba(240,165,0,0.25)]" : "text-ink-secondary hover:bg-raised hover:text-ink-primary"}`,
            onClick: () => setActiveCategory(null),
            children: "Todos"
          }
        ),
        categories.map((cat) => {
          const [c1] = getCategoryGradient(cat);
          return /* @__PURE__ */ jsxs(
            "button",
            {
              className: `px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeCategory === cat ? "bg-accent text-black shadow-[0_2px_8px_rgba(240,165,0,0.25)]" : "text-ink-secondary hover:bg-raised hover:text-ink-primary"}`,
              onClick: () => setActiveCategory(cat),
              children: [
                /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full", style: { background: c1 } }),
                cat
              ]
            },
            cat
          );
        })
      ] })
    ] }),
    loading && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center py-20 text-ink-secondary", children: [
      /* @__PURE__ */ jsxs("svg", { className: "animate-spin w-5 h-5 mr-3 text-accent", viewBox: "0 0 24 24", fill: "none", children: [
        /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "3", opacity: "0.2" }),
        /* @__PURE__ */ jsx("path", { d: "M12 2a10 10 0 019.8 7.8", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round" })
      ] }),
      "Carregando componentes..."
    ] }),
    error && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-4 rounded-xl border border-fail/20 bg-fail/5 text-fail text-sm", children: [
      /* @__PURE__ */ jsxs("svg", { className: "w-5 h-5 flex-shrink-0", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
        /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
        /* @__PURE__ */ jsx("path", { d: "M12 8v4M12 16h.01" })
      ] }),
      error
    ] }),
    !loading && !error && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[1fr_380px] gap-6 min-h-[calc(100vh-14rem)]", children: [
      /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-3 overflow-y-auto pr-1", children: filtered.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-ink-muted", children: [
        /* @__PURE__ */ jsxs("svg", { className: "w-12 h-12 mb-3 opacity-30", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", children: [
          /* @__PURE__ */ jsx("circle", { cx: "11", cy: "11", r: "8" }),
          /* @__PURE__ */ jsx("path", { d: "m21 21-4.35-4.35" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Nenhum componente encontrado" })
      ] }) : /* @__PURE__ */ jsx("div", { className: "stagger grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3", children: filtered.map((c) => {
        const [g1, g2] = getCategoryGradient(c.category);
        const isSelected = selectedId === c.id;
        const iconPath = CATEGORY_ICONS[c.category] || CATEGORY_ICONS.Features;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: `group relative rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 hover-lift ${isSelected ? "border-accent shadow-[0_0_0_1px_rgba(240,165,0,0.5),0_0_20px_rgba(240,165,0,0.1)]" : "border-white/[0.06] hover:border-white/[0.12] hover:shadow-lg"} bg-surface/60 backdrop-blur-xl`,
            onClick: () => setSelectedId(c.id),
            children: [
              /* @__PURE__ */ jsxs("div", { className: "h-32 relative overflow-hidden", children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "absolute inset-0 opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-300",
                    style: { background: `linear-gradient(135deg, ${g1}, ${g2})` }
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "w-14 h-14 rounded-2xl flex items-center justify-center opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-300 animate-float",
                    style: { background: `linear-gradient(135deg, ${g1}, ${g2})` },
                    children: /* @__PURE__ */ jsx("svg", { className: "w-7 h-7 text-white", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: iconPath }) })
                  }
                ) }),
                /* @__PURE__ */ jsxs("div", { className: "absolute inset-x-4 top-5 space-y-1.5 opacity-[0.06]", children: [
                  /* @__PURE__ */ jsx("div", { className: "h-2 rounded-full bg-white w-3/4" }),
                  /* @__PURE__ */ jsx("div", { className: "h-1.5 rounded-full bg-white w-full" }),
                  /* @__PURE__ */ jsx("div", { className: "h-1.5 rounded-full bg-white w-5/6" }),
                  /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5 mt-2", children: [
                    /* @__PURE__ */ jsx("div", { className: "h-8 rounded bg-white w-1/3" }),
                    /* @__PURE__ */ jsx("div", { className: "h-8 rounded bg-white w-1/3" }),
                    /* @__PURE__ */ jsx("div", { className: "h-8 rounded bg-white w-1/3" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm", children: [
                  /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full", style: { background: g1 } }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-medium text-white/70", children: c.category })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-3.5", children: [
                /* @__PURE__ */ jsx("div", { className: "font-semibold text-sm text-ink-primary mb-1 group-hover:text-white transition-colors", children: c.name }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-ink-secondary line-clamp-2 leading-relaxed mb-2.5", children: c.description }),
                /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1", children: c.tags.slice(0, 3).map((t) => /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 rounded-md text-[10px] font-medium bg-raised/80 text-ink-secondary border border-white/[0.04]", children: t }, t)) })
              ] }),
              isSelected && /* @__PURE__ */ jsx("div", { className: "absolute top-3 left-3 w-5 h-5 rounded-full bg-accent flex items-center justify-center shadow-lg", children: /* @__PURE__ */ jsx("svg", { className: "w-3 h-3 text-black", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", children: /* @__PURE__ */ jsx("polyline", { points: "20 6 9 17 4 12" }) }) })
            ]
          },
          c.id
        );
      }) }) }),
      /* @__PURE__ */ jsx("div", { className: `flex flex-col gap-4 overflow-y-auto ${selected ? "animate-slide-right" : ""}`, children: !selected ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center h-full rounded-xl border border-dashed border-white/[0.08] text-ink-muted", children: [
        /* @__PURE__ */ jsxs("svg", { className: "w-10 h-10 mb-3 opacity-20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", children: [
          /* @__PURE__ */ jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
          /* @__PURE__ */ jsx("path", { d: "M3 9h18M9 21V9" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Clique em um componente" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-ink-muted/60 mt-0.5", children: "para ver detalhes e preview" })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-white/[0.06] bg-surface/60 backdrop-blur-xl overflow-hidden", children: selected.previewUrl ? /* @__PURE__ */ jsx(
          "iframe",
          {
            src: selected.previewUrl,
            title: `Preview de ${selected.name}`,
            className: "w-full h-[260px] border-0",
            loading: "lazy"
          }
        ) : /* @__PURE__ */ jsx("div", { className: "h-[200px] relative overflow-hidden", children: (() => {
          const [g1, g2] = getCategoryGradient(selected.category);
          return /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 opacity-10", style: { background: `linear-gradient(135deg, ${g1}, ${g2})` } }),
            /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-2xl flex items-center justify-center", style: { background: `linear-gradient(135deg, ${g1}33, ${g2}33)` }, children: /* @__PURE__ */ jsx("svg", { className: "w-8 h-8", style: { color: g1 }, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: CATEGORY_ICONS[selected.category] || CATEGORY_ICONS.Features }) }) }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-ink-muted", children: "Preview em breve" })
            ] })
          ] });
        })() }) }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-white/[0.06] bg-surface/60 backdrop-blur-xl p-5 space-y-5", children: [
          /* @__PURE__ */ jsx("div", { className: "flex items-start justify-between gap-3", children: /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              (() => {
                const [g1] = getCategoryGradient(selected.category);
                return /* @__PURE__ */ jsx("span", { className: "w-2.5 h-2.5 rounded-full", style: { background: g1 } });
              })(),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold uppercase tracking-wider text-ink-muted", children: selected.category })
            ] }),
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-ink-primary font-heading tracking-tight", children: selected.name }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-secondary mt-1 leading-relaxed", children: selected.description })
          ] }) }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: `w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${addedId === selected.id ? "bg-ok text-black shadow-[0_2px_12px_rgba(34,197,94,0.3)]" : "bg-gradient-to-r from-accent to-[#d4920a] text-black shadow-[0_2px_12px_rgba(240,165,0,0.25)] hover:shadow-[0_4px_20px_rgba(240,165,0,0.35)]"}`,
              onClick: () => addToBuilder(selected),
              children: addedId === selected.id ? /* @__PURE__ */ jsxs("span", { className: "flex items-center justify-center gap-2", children: [
                /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", children: /* @__PURE__ */ jsx("polyline", { points: "20 6 9 17 4 12" }) }),
                "Adicionado ao Builder!"
              ] }) : /* @__PURE__ */ jsxs("span", { className: "flex items-center justify-center gap-2", children: [
                /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: /* @__PURE__ */ jsx("path", { d: "M12 5v14M5 12h14" }) }),
                "Adicionar ao Builder"
              ] })
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: selected.tags.map((t) => /* @__PURE__ */ jsx("span", { className: "px-2.5 py-1 rounded-lg text-[11px] font-medium bg-raised/80 text-ink-secondary border border-white/[0.04]", children: t }, t)) }),
          /* @__PURE__ */ jsxs("div", { className: "pt-3 border-t border-white/[0.06]", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold text-ink-muted uppercase tracking-wider mb-2", children: "Melhor para" }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: selected.bestFor.map((b) => /* @__PURE__ */ jsx("span", { className: "px-2.5 py-1 rounded-lg text-[11px] font-medium bg-accent/[0.06] text-accent border border-accent/10", children: b }, b)) })
          ] }),
          selected.props.length > 0 && /* @__PURE__ */ jsxs("div", { className: "pt-3 border-t border-white/[0.06]", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold text-ink-muted uppercase tracking-wider mb-3", children: "Propriedades" }),
            /* @__PURE__ */ jsx("div", { className: "space-y-2", children: selected.props.map((p) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-2 rounded-lg bg-raised/50", children: [
              /* @__PURE__ */ jsx("code", { className: "text-xs font-mono text-accent bg-accent/[0.06] px-2 py-0.5 rounded", children: p.name }),
              /* @__PURE__ */ jsx("code", { className: "text-[10px] font-mono text-ink-muted", children: p.type }),
              p.required && /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold text-fail uppercase", children: "req" }),
              p.description && /* @__PURE__ */ jsx("span", { className: "text-[11px] text-ink-secondary ml-auto truncate max-w-[120px]", children: p.description })
            ] }, p.name)) })
          ] }),
          selected.copy && Object.keys(selected.copy).length > 0 && /* @__PURE__ */ jsxs("div", { className: "pt-3 border-t border-white/[0.06]", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold text-ink-muted uppercase tracking-wider mb-3", children: "Textos editaveis" }),
            /* @__PURE__ */ jsx("div", { className: "space-y-2", children: Object.entries(selected.copy).map(([k, v]) => /* @__PURE__ */ jsxs("div", { className: "p-2 rounded-lg bg-raised/50", children: [
              /* @__PURE__ */ jsx("code", { className: "text-[10px] font-mono text-ink-muted", children: k }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-ink-secondary mt-0.5", children: v })
            ] }, k)) })
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
  const registryUrl = "https://raw.githubusercontent.com/xXSirius/minha-lib-astro/main/registry.json";
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
