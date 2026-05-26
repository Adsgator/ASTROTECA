import { Q as createComponent, $ as renderComponent, a6 as renderTemplate, O as createAstro } from '../chunks/astro/server_BdknY_pA.mjs';
import 'kleur/colors';
import { $ as $$AppLayout } from '../chunks/AppLayout_CKk9I17a.mjs';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { v as validateGithubToken } from '../chunks/github_B0bVnyLs.mjs';
import { D as DEFAULT_TEMPLATE } from '../chunks/manifest_DPK6IvCu.mjs';
export { renderers } from '../renderers.mjs';

const SECTIONS = [
  { key: "github", label: "GitHub" },
  { key: "defaults", label: "Padroes" },
  { key: "template", label: "Template do Manifesto" },
  { key: "about", label: "Sobre" }
];
const EMPTY_SETTINGS = {
  githubToken: "",
  githubOwner: "",
  componentsRepo: "astro-components",
  baseProjectRepo: "_base-project",
  registryUrl: "",
  previewBaseUrl: "",
  defaultFontHeading: "Inter",
  defaultFontBody: "Inter",
  defaultColorPrimary: "#6366f1",
  defaultCtaLabel: "Comecar agora",
  manifestTemplate: DEFAULT_TEMPLATE,
  yourName: "",
  studioName: "",
  npmNamespace: ""
};
function ConfigPanel() {
  const [section, setSection] = useState("github");
  const [settings, setSettings] = useState(EMPTY_SETTINGS);
  const [showToken, setShowToken] = useState(false);
  const [validating, setValidating] = useState(false);
  const [tokenUser, setTokenUser] = useState(null);
  const [tokenError, setTokenError] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const raw = localStorage.getItem("acs-settings");
    if (raw) {
      const parsed = JSON.parse(raw);
      setSettings({ ...EMPTY_SETTINGS, ...parsed });
    }
  }, []);
  function update(key, value) {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem("acs-settings", JSON.stringify(next));
      setSaved(true);
      setTimeout(() => setSaved(false), 2e3);
      return next;
    });
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
  function resetTemplate() {
    update("manifestTemplate", DEFAULT_TEMPLATE);
  }
  function Field({ label, children }) {
    return /* @__PURE__ */ jsxs("div", { className: "field", children: [
      /* @__PURE__ */ jsx("label", { className: "label", children: label }),
      children
    ] });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("style", { children: `
        .config {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: var(--space-6);
          max-width: 900px;
        }

        .config__nav {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .config__content {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .config__title {
          font-size: var(--text-xl);
          font-weight: 700;
          margin-bottom: var(--space-2);
        }

        .config__row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
        }

        .config__full {
          grid-column: 1 / -1;
        }

        .config__token-row {
          display: flex;
          gap: var(--space-2);
          align-items: end;
        }

        .config__token-input {
          flex: 1;
        }

        .config__token-result {
          font-size: var(--text-sm);
          margin-top: var(--space-2);
        }

        .config__template-area {
          width: 100%;
          min-height: 400px;
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          resize: vertical;
        }

        .config__template-actions {
          display: flex;
          justify-content: flex-end;
        }

        .config__saved {
          font-size: var(--text-sm);
          color: var(--accent);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .config__saved--visible {
          opacity: 1;
        }

        .config__color-row {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .config__color-picker {
          width: 40px;
          height: 40px;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 2px;
          cursor: pointer;
          background: none;
        }

        .config__template-help {
          font-size: var(--text-xs);
          color: var(--muted);
          margin-bottom: var(--space-3);
        }
      ` }),
    /* @__PURE__ */ jsxs("div", { className: "config", children: [
      /* @__PURE__ */ jsxs("nav", { className: "config__nav", children: [
        SECTIONS.map((s) => /* @__PURE__ */ jsx(
          "button",
          {
            className: `sidebar-link ${section === s.key ? "active" : ""}`,
            onClick: () => setSection(s.key),
            children: s.label
          },
          s.key
        )),
        /* @__PURE__ */ jsx("div", { className: `config__saved ${saved ? "config__saved--visible" : ""}`, children: "Salvo!" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "config__content", children: [
        section === "github" && /* @__PURE__ */ jsxs("div", { className: "card", children: [
          /* @__PURE__ */ jsx("h2", { className: "config__title", children: "GitHub" }),
          /* @__PURE__ */ jsxs("div", { className: "config__row", children: [
            /* @__PURE__ */ jsx("div", { className: "config__full", children: /* @__PURE__ */ jsxs(Field, { label: "Token de acesso", children: [
              /* @__PURE__ */ jsxs("div", { className: "config__token-row", children: [
                /* @__PURE__ */ jsx("div", { className: "config__token-input", children: /* @__PURE__ */ jsx(
                  "input",
                  {
                    className: "input",
                    type: showToken ? "text" : "password",
                    value: settings.githubToken,
                    onChange: (e) => update("githubToken", e.target.value),
                    placeholder: "ghp_..."
                  }
                ) }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: "btn btn-ghost btn-sm",
                    onClick: () => setShowToken(!showToken),
                    children: showToken ? "Ocultar" : "Mostrar"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: "btn btn-outline btn-sm",
                    onClick: handleValidateToken,
                    disabled: validating || !settings.githubToken,
                    children: validating ? "Validando..." : "Validar"
                  }
                )
              ] }),
              tokenUser && /* @__PURE__ */ jsx("div", { className: "config__token-result", children: /* @__PURE__ */ jsxs("span", { className: "badge badge-ok", children: [
                "Conectado como ",
                tokenUser
              ] }) }),
              tokenError && /* @__PURE__ */ jsx("div", { className: "config__token-result", children: /* @__PURE__ */ jsx("span", { className: "badge badge-fail", children: tokenError }) })
            ] }) }),
            /* @__PURE__ */ jsx(Field, { label: "Owner (usuario ou org)", children: /* @__PURE__ */ jsx(
              "input",
              {
                className: "input",
                value: settings.githubOwner,
                onChange: (e) => update("githubOwner", e.target.value),
                placeholder: "seu-usuario"
              }
            ) }),
            /* @__PURE__ */ jsx(Field, { label: "Repo de componentes", children: /* @__PURE__ */ jsx(
              "input",
              {
                className: "input",
                value: settings.componentsRepo,
                onChange: (e) => update("componentsRepo", e.target.value),
                placeholder: "astro-components"
              }
            ) }),
            /* @__PURE__ */ jsx(Field, { label: "Repo base do projeto", children: /* @__PURE__ */ jsx(
              "input",
              {
                className: "input",
                value: settings.baseProjectRepo,
                onChange: (e) => update("baseProjectRepo", e.target.value),
                placeholder: "_base-project"
              }
            ) }),
            /* @__PURE__ */ jsx("div", { className: "config__full", children: /* @__PURE__ */ jsx(Field, { label: "URL do registry.json", children: /* @__PURE__ */ jsx(
              "input",
              {
                className: "input",
                value: settings.registryUrl,
                onChange: (e) => update("registryUrl", e.target.value),
                placeholder: "https://raw.githubusercontent.com/..."
              }
            ) }) }),
            /* @__PURE__ */ jsx("div", { className: "config__full", children: /* @__PURE__ */ jsx(Field, { label: "Base URL dos previews", children: /* @__PURE__ */ jsx(
              "input",
              {
                className: "input",
                value: settings.previewBaseUrl,
                onChange: (e) => update("previewBaseUrl", e.target.value),
                placeholder: "https://seu-usuario.github.io/astro-components"
              }
            ) }) })
          ] })
        ] }),
        section === "defaults" && /* @__PURE__ */ jsxs("div", { className: "card", children: [
          /* @__PURE__ */ jsx("h2", { className: "config__title", children: "Padroes" }),
          /* @__PURE__ */ jsxs("div", { className: "config__row", children: [
            /* @__PURE__ */ jsx(Field, { label: "Fonte padrao (titulos)", children: /* @__PURE__ */ jsx(
              "input",
              {
                className: "input",
                value: settings.defaultFontHeading,
                onChange: (e) => update("defaultFontHeading", e.target.value),
                placeholder: "Inter"
              }
            ) }),
            /* @__PURE__ */ jsx(Field, { label: "Fonte padrao (corpo)", children: /* @__PURE__ */ jsx(
              "input",
              {
                className: "input",
                value: settings.defaultFontBody,
                onChange: (e) => update("defaultFontBody", e.target.value),
                placeholder: "Inter"
              }
            ) }),
            /* @__PURE__ */ jsx(Field, { label: "Cor primaria padrao", children: /* @__PURE__ */ jsxs("div", { className: "config__color-row", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "color",
                  value: settings.defaultColorPrimary,
                  onChange: (e) => update("defaultColorPrimary", e.target.value),
                  className: "config__color-picker"
                }
              ),
              /* @__PURE__ */ jsx(
                "input",
                {
                  className: "input",
                  value: settings.defaultColorPrimary,
                  onChange: (e) => update("defaultColorPrimary", e.target.value),
                  placeholder: "#6366f1"
                }
              )
            ] }) }),
            /* @__PURE__ */ jsx(Field, { label: "Label padrao do CTA", children: /* @__PURE__ */ jsx(
              "input",
              {
                className: "input",
                value: settings.defaultCtaLabel,
                onChange: (e) => update("defaultCtaLabel", e.target.value),
                placeholder: "Comecar agora"
              }
            ) })
          ] })
        ] }),
        section === "template" && /* @__PURE__ */ jsxs("div", { className: "card", children: [
          /* @__PURE__ */ jsx("h2", { className: "config__title", children: "Template do Manifesto" }),
          /* @__PURE__ */ jsxs("p", { className: "config__template-help", children: [
            "Use ",
            "{{variavel}}",
            " para interpolar valores. Variaveis disponiveis: clientName, date, projectType, niche, pageGoal, googleAnalyticsId, siteUrl, npmNamespace, repoName, colorPrimary, colorSecondary, colorBackground, colorText, fontHeading, fontBody, mood, references, notes, components, studioName."
          ] }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              className: "input config__template-area",
              value: settings.manifestTemplate,
              onChange: (e) => update("manifestTemplate", e.target.value)
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "config__template-actions", children: /* @__PURE__ */ jsx("button", { type: "button", className: "btn btn-ghost btn-sm", onClick: resetTemplate, children: "Restaurar Padrao" }) })
        ] }),
        section === "about" && /* @__PURE__ */ jsxs("div", { className: "card", children: [
          /* @__PURE__ */ jsx("h2", { className: "config__title", children: "Sobre Voce" }),
          /* @__PURE__ */ jsxs("div", { className: "config__row", children: [
            /* @__PURE__ */ jsx(Field, { label: "Seu nome", children: /* @__PURE__ */ jsx(
              "input",
              {
                className: "input",
                value: settings.yourName,
                onChange: (e) => update("yourName", e.target.value),
                placeholder: "Seu nome completo"
              }
            ) }),
            /* @__PURE__ */ jsx(Field, { label: "Nome do estudio", children: /* @__PURE__ */ jsx(
              "input",
              {
                className: "input",
                value: settings.studioName,
                onChange: (e) => update("studioName", e.target.value),
                placeholder: "Meu Estudio"
              }
            ) }),
            /* @__PURE__ */ jsx(Field, { label: "Namespace npm", children: /* @__PURE__ */ jsx(
              "input",
              {
                className: "input",
                value: settings.npmNamespace,
                onChange: (e) => update("npmNamespace", e.target.value),
                placeholder: "@meu-estudio"
              }
            ) })
          ] })
        ] })
      ] })
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
