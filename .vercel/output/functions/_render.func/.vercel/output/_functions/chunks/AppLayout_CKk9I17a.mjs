import { Q as createComponent, a1 as renderHead, B as addAttribute, a4 as renderSlot, a6 as renderTemplate, O as createAstro } from './astro/server_BdknY_pA.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                         */

const $$Astro = createAstro();
const $$AppLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$AppLayout;
  const { title = "Astroteca" } = Astro2.props;
  const currentPath = Astro2.url.pathname;
  return renderTemplate`<html lang="pt-BR" data-astro-cid-j3tygqaf> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title><link rel="stylesheet" href="/styles/app.css">${renderHead()}</head> <body data-astro-cid-j3tygqaf> <div class="app-shell" data-astro-cid-j3tygqaf> <aside class="app-sidebar" data-astro-cid-j3tygqaf> <div class="app-sidebar__header" data-astro-cid-j3tygqaf> <span class="app-sidebar__logo" data-astro-cid-j3tygqaf>Astroteca</span> </div> <nav class="app-sidebar__links" data-astro-cid-j3tygqaf> <a href="/"${addAttribute(["sidebar-link", { active: currentPath === "/" }], "class:list")} data-astro-cid-j3tygqaf>
Biblioteca
</a> <a href="/builder"${addAttribute(["sidebar-link", { active: currentPath === "/builder" }], "class:list")} data-astro-cid-j3tygqaf>
Builder
</a> <a href="/admin"${addAttribute(["sidebar-link", { active: currentPath === "/admin" }], "class:list")} data-astro-cid-j3tygqaf>
Adicionar
</a> <a href="/config"${addAttribute(["sidebar-link", { active: currentPath === "/config" }], "class:list")} data-astro-cid-j3tygqaf>
Configuracoes
</a> </nav> <div class="app-sidebar__footer" data-astro-cid-j3tygqaf> <span class="badge badge-default" data-astro-cid-j3tygqaf>v2.0.0</span> </div> </aside> <main class="app-main" data-astro-cid-j3tygqaf> ${renderSlot($$result, $$slots["default"])} </main> </div>  </body> </html>`;
}, "C:/PROJETOS/ADSGATOR/ASTROTECA/src/layouts/AppLayout.astro", void 0);

export { $$AppLayout as $ };
