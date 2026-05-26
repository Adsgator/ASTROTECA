import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint__B_1YbLI.mjs';
import { manifest } from './manifest_DHHguTsy.mjs';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin.astro.mjs');
const _page2 = () => import('./pages/api/create-project.astro.mjs');
const _page3 = () => import('./pages/api/publish-component.astro.mjs');
const _page4 = () => import('./pages/builder.astro.mjs');
const _page5 = () => import('./pages/config.astro.mjs');
const _page6 = () => import('./pages/preview/_---slug_.astro.mjs');
const _page7 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/admin.astro", _page1],
    ["src/pages/api/create-project.ts", _page2],
    ["src/pages/api/publish-component.ts", _page3],
    ["src/pages/builder.astro", _page4],
    ["src/pages/config.astro", _page5],
    ["src/pages/preview/[...slug].astro", _page6],
    ["src/pages/index.astro", _page7]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "9dfaaab1-1238-438b-bf83-1a6399ab89a5",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
