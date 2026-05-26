import { Q as createComponent, $ as renderComponent, a6 as renderTemplate, O as createAstro } from '../chunks/astro/server_BdknY_pA.mjs';
import 'kleur/colors';
import { $ as $$AppLayout } from '../chunks/AppLayout_CV10e5-C.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { v as validateGithubToken } from '../chunks/github_B0bVnyLs.mjs';
export { renderers } from '../renderers.mjs';

const inputBase = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
const btnBase = "px-4 py-2 rounded-lg text-sm font-medium transition-colors";
const btnPrimary = `${btnBase} bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50`;
const btnOutline = `${btnBase} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`;
const btnSuccess = `${btnBase} bg-green-600 text-white hover:bg-green-700`;
const cardBase = "rounded-xl border border-gray-200 bg-white p-5";
const badgeBase = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
const DEFAULT_SETTINGS = {
  githubToken: "",
  githubOwner: "",
  componentsRepo: "minha-lib-astro",
  baseProjectRepo: "_base-project",
  previewBaseUrl: "",
  registryUrl: "",
  yourName: "",
  studioName: "Astroteca Studio",
  manifestTemplate: "",
  defaultFontHeading: "Inter",
  defaultFontBody: "Inter",
  defaultColorPrimary: "#6366f1",
  defaultCtaLabel: "Saiba mais",
  npmNamespace: "@astroteca",
  userName: "",
  userEmail: ""
};
function ConfigPanel() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [validating, setValidating] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [tokenUser, setTokenUser] = useState(null);
  useEffect(() => {
    const saved2 = localStorage.getItem("acs-settings");
    if (saved2) {
      setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved2) });
    }
  }, []);
  function update(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }
  function handleSave() {
    localStorage.setItem("acs-settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2e3);
  }
  async function handleValidateToken() {
    setValidating(true);
    setTokenError("");
    setTokenUser(null);
    try {
      const result = await validateGithubToken(settings.githubToken);
      if (result.valid) {
        setTokenUser(result.login || "Autenticado");
      } else {
        setTokenError(result.error || "Token invalido");
      }
    } catch (e) {
      setTokenError(e instanceof Error ? e.message : "Erro ao validar");
    } finally {
      setValidating(false);
    }
  }
  function Field({ label, children }) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600", children: label }),
      children
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "max-w-3xl flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Configuracoes" }),
      /* @__PURE__ */ jsx("button", { onClick: handleSave, className: saved ? btnSuccess : btnPrimary, children: saved ? "Salvo!" : "Salvar" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: cardBase, children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-4", children: "GitHub" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsx(Field, { label: "Token de Acesso", children: /* @__PURE__ */ jsx(
            "input",
            {
              className: inputBase,
              type: "password",
              value: settings.githubToken,
              onChange: (e) => update("githubToken", e.target.value),
              placeholder: "ghp_xxxxxxxxxxxxxxxxxxxx"
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mt-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                className: `${btnOutline} py-1 px-3 text-xs`,
                onClick: handleValidateToken,
                disabled: validating || !settings.githubToken,
                children: validating ? "Validando..." : "Validar Token"
              }
            ),
            tokenUser && /* @__PURE__ */ jsxs("span", { className: `${badgeBase} bg-green-100 text-green-700`, children: [
              "✓ ",
              tokenUser
            ] }),
            tokenError && /* @__PURE__ */ jsxs("span", { className: `${badgeBase} bg-red-100 text-red-700`, children: [
              "✗ ",
              tokenError
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Field, { label: "Owner (usuario ou org)", children: /* @__PURE__ */ jsx(
          "input",
          {
            className: inputBase,
            value: settings.githubOwner,
            onChange: (e) => update("githubOwner", e.target.value),
            placeholder: "seuusuario"
          }
        ) }),
        /* @__PURE__ */ jsx(Field, { label: "Repo de Componentes", children: /* @__PURE__ */ jsx(
          "input",
          {
            className: inputBase,
            value: settings.componentsRepo,
            onChange: (e) => update("componentsRepo", e.target.value),
            placeholder: "minha-lib-astro"
          }
        ) }),
        /* @__PURE__ */ jsx(Field, { label: "Repo Base (template)", children: /* @__PURE__ */ jsx(
          "input",
          {
            className: inputBase,
            value: settings.baseProjectRepo,
            onChange: (e) => update("baseProjectRepo", e.target.value),
            placeholder: "_base-project"
          }
        ) }),
        /* @__PURE__ */ jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsx(Field, { label: "URL do Registry", children: /* @__PURE__ */ jsx(
          "input",
          {
            className: inputBase,
            value: settings.registryUrl,
            onChange: (e) => update("registryUrl", e.target.value),
            placeholder: "https://raw.githubusercontent.com/.../registry.json"
          }
        ) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: cardBase, children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-4", children: "Padroes" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsx(Field, { label: "Fonte dos Titulos", children: /* @__PURE__ */ jsx(
          "input",
          {
            className: inputBase,
            value: settings.defaultFontHeading,
            onChange: (e) => update("defaultFontHeading", e.target.value),
            placeholder: "Inter"
          }
        ) }),
        /* @__PURE__ */ jsx(Field, { label: "Fonte do Corpo", children: /* @__PURE__ */ jsx(
          "input",
          {
            className: inputBase,
            value: settings.defaultFontBody,
            onChange: (e) => update("defaultFontBody", e.target.value),
            placeholder: "Inter"
          }
        ) }),
        /* @__PURE__ */ jsx(Field, { label: "Cor Primaria Padrao", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "color",
              value: settings.defaultColorPrimary,
              onChange: (e) => update("defaultColorPrimary", e.target.value),
              className: "w-10 h-10 rounded-lg border border-gray-300 bg-transparent cursor-pointer p-0.5"
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              className: inputBase,
              value: settings.defaultColorPrimary,
              onChange: (e) => update("defaultColorPrimary", e.target.value),
              placeholder: "#6366f1"
            }
          )
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: cardBase, children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-4", children: "Studio" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsx(Field, { label: "Nome do Studio", children: /* @__PURE__ */ jsx(
          "input",
          {
            className: inputBase,
            value: settings.studioName,
            onChange: (e) => update("studioName", e.target.value),
            placeholder: "Astroteca Studio"
          }
        ) }),
        /* @__PURE__ */ jsx(Field, { label: "Namespace NPM", children: /* @__PURE__ */ jsx(
          "input",
          {
            className: inputBase,
            value: settings.npmNamespace,
            onChange: (e) => update("npmNamespace", e.target.value),
            placeholder: "@astroteca"
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: cardBase, children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-4", children: "Usuario Git" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsx(Field, { label: "Nome", children: /* @__PURE__ */ jsx(
          "input",
          {
            className: inputBase,
            value: settings.userName,
            onChange: (e) => update("userName", e.target.value),
            placeholder: "Seu Nome"
          }
        ) }),
        /* @__PURE__ */ jsx(Field, { label: "Email", children: /* @__PURE__ */ jsx(
          "input",
          {
            className: inputBase,
            type: "email",
            value: settings.userEmail,
            onChange: (e) => update("userEmail", e.target.value),
            placeholder: "seu@email.com"
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: cardBase, children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-4", children: "Template do Manifesto" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          className: `${inputBase} min-h-[200px] font-mono text-sm resize-y`,
          value: settings.manifestTemplate,
          onChange: (e) => update("manifestTemplate", e.target.value),
          placeholder: "# {{PROJECT_NAME}}\\n\\n## Art Direction\\n...",
          rows: 10
        }
      )
    ] })
  ] });
}

const $$Astro = createAstro();
const $$Config = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Config;
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Configuracoes - Astroteca" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "ConfigPanel", ConfigPanel, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/PROJETOS/ADSGATOR/ASTROTECA/src/components/ConfigPanel", "client:component-export": "default" })} ` })}`;
}, "C:/PROJETOS/ADSGATOR/ASTROTECA/src/pages/config.astro", void 0);

const $$file = "C:/PROJETOS/ADSGATOR/ASTROTECA/src/pages/config.astro";
const $$url = "/config";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Config,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
