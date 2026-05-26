import 'cookie';
import 'kleur/colors';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_DOqxCOmc.mjs';
import 'es-module-lexer';
import { V as decodeKey } from './chunks/astro/server_BdknY_pA.mjs';
import 'clsx';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///C:/PROJETOS/ADSGATOR/ASTROTECA/","adapterName":"@astrojs/vercel/serverless","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"inline","content":".app-sidebar[data-astro-cid-j3tygqaf]{display:flex;flex-direction:column;background:var(--surface);border-right:1px solid var(--border);padding:20px 0;height:100vh;position:sticky;top:0}.app-sidebar__header[data-astro-cid-j3tygqaf]{padding:0 20px 20px;border-bottom:1px solid var(--border);margin-bottom:12px}.app-sidebar__logo[data-astro-cid-j3tygqaf]{font-size:var(--text-lg);font-weight:700;color:var(--accent);letter-spacing:-.02em;font-family:Syne,sans-serif}.app-sidebar__links[data-astro-cid-j3tygqaf]{display:flex;flex-direction:column;gap:4px;padding:8px 12px;flex:1}.app-sidebar__footer[data-astro-cid-j3tygqaf]{padding:16px 20px 0;border-top:1px solid var(--border);text-align:center}.app-main[data-astro-cid-j3tygqaf]{padding:32px;overflow-y:auto;height:100vh}\n"}],"routeData":{"route":"/admin","isIndex":false,"type":"page","pattern":"^\\/admin\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin.astro","pathname":"/admin","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/create-project","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/create-project\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"create-project","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/create-project.ts","pathname":"/api/create-project","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/publish-component","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/publish-component\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"publish-component","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/publish-component.ts","pathname":"/api/publish-component","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"inline","content":".app-sidebar[data-astro-cid-j3tygqaf]{display:flex;flex-direction:column;background:var(--surface);border-right:1px solid var(--border);padding:20px 0;height:100vh;position:sticky;top:0}.app-sidebar__header[data-astro-cid-j3tygqaf]{padding:0 20px 20px;border-bottom:1px solid var(--border);margin-bottom:12px}.app-sidebar__logo[data-astro-cid-j3tygqaf]{font-size:var(--text-lg);font-weight:700;color:var(--accent);letter-spacing:-.02em;font-family:Syne,sans-serif}.app-sidebar__links[data-astro-cid-j3tygqaf]{display:flex;flex-direction:column;gap:4px;padding:8px 12px;flex:1}.app-sidebar__footer[data-astro-cid-j3tygqaf]{padding:16px 20px 0;border-top:1px solid var(--border);text-align:center}.app-main[data-astro-cid-j3tygqaf]{padding:32px;overflow-y:auto;height:100vh}\n"}],"routeData":{"route":"/builder","isIndex":false,"type":"page","pattern":"^\\/builder\\/?$","segments":[[{"content":"builder","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/builder.astro","pathname":"/builder","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"inline","content":".app-sidebar[data-astro-cid-j3tygqaf]{display:flex;flex-direction:column;background:var(--surface);border-right:1px solid var(--border);padding:20px 0;height:100vh;position:sticky;top:0}.app-sidebar__header[data-astro-cid-j3tygqaf]{padding:0 20px 20px;border-bottom:1px solid var(--border);margin-bottom:12px}.app-sidebar__logo[data-astro-cid-j3tygqaf]{font-size:var(--text-lg);font-weight:700;color:var(--accent);letter-spacing:-.02em;font-family:Syne,sans-serif}.app-sidebar__links[data-astro-cid-j3tygqaf]{display:flex;flex-direction:column;gap:4px;padding:8px 12px;flex:1}.app-sidebar__footer[data-astro-cid-j3tygqaf]{padding:16px 20px 0;border-top:1px solid var(--border);text-align:center}.app-main[data-astro-cid-j3tygqaf]{padding:32px;overflow-y:auto;height:100vh}\n"}],"routeData":{"route":"/config","isIndex":false,"type":"page","pattern":"^\\/config\\/?$","segments":[[{"content":"config","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/config.astro","pathname":"/config","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"inline","content":".app-sidebar[data-astro-cid-j3tygqaf]{display:flex;flex-direction:column;background:var(--surface);border-right:1px solid var(--border);padding:20px 0;height:100vh;position:sticky;top:0}.app-sidebar__header[data-astro-cid-j3tygqaf]{padding:0 20px 20px;border-bottom:1px solid var(--border);margin-bottom:12px}.app-sidebar__logo[data-astro-cid-j3tygqaf]{font-size:var(--text-lg);font-weight:700;color:var(--accent);letter-spacing:-.02em;font-family:Syne,sans-serif}.app-sidebar__links[data-astro-cid-j3tygqaf]{display:flex;flex-direction:column;gap:4px;padding:8px 12px;flex:1}.app-sidebar__footer[data-astro-cid-j3tygqaf]{padding:16px 20px 0;border-top:1px solid var(--border);text-align:center}.app-main[data-astro-cid-j3tygqaf]{padding:32px;overflow-y:auto;height:100vh}\n"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["C:/PROJETOS/ADSGATOR/ASTROTECA/src/pages/admin.astro",{"propagation":"none","containsHead":true}],["C:/PROJETOS/ADSGATOR/ASTROTECA/src/pages/builder.astro",{"propagation":"none","containsHead":true}],["C:/PROJETOS/ADSGATOR/ASTROTECA/src/pages/config.astro",{"propagation":"none","containsHead":true}],["C:/PROJETOS/ADSGATOR/ASTROTECA/src/pages/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(o,t)=>{let i=async()=>{await(await o())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000noop-middleware":"_noop-middleware.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-page:src/pages/api/create-project@_@ts":"pages/api/create-project.astro.mjs","\u0000@astro-page:src/pages/api/publish-component@_@ts":"pages/api/publish-component.astro.mjs","\u0000@astro-page:src/pages/admin@_@astro":"pages/admin.astro.mjs","\u0000@astro-page:src/pages/builder@_@astro":"pages/builder.astro.mjs","\u0000@astro-page:src/pages/config@_@astro":"pages/config.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","C:/PROJETOS/ADSGATOR/ASTROTECA/node_modules/astro/dist/env/setup.js":"chunks/astro/env-setup_Cr6XTFvb.mjs","\u0000@astrojs-manifest":"manifest_3ZV1rHIn.mjs","C:/PROJETOS/ADSGATOR/ASTROTECA/src/components/AdminForm":"_astro/AdminForm.eo7Wl-yM.js","C:/PROJETOS/ADSGATOR/ASTROTECA/src/components/Builder":"_astro/Builder.BW7Ln6GX.js","C:/PROJETOS/ADSGATOR/ASTROTECA/src/components/ConfigPanel":"_astro/ConfigPanel.IE_fwd7b.js","C:/PROJETOS/ADSGATOR/ASTROTECA/src/components/ComponentBrowser":"_astro/ComponentBrowser.Bl-iKQEP.js","@astrojs/react/client.js":"_astro/client.DrE9CFQR.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/AdminForm.eo7Wl-yM.js","/_astro/Builder.BW7Ln6GX.js","/_astro/client.DrE9CFQR.js","/_astro/ComponentBrowser.Bl-iKQEP.js","/_astro/ConfigPanel.IE_fwd7b.js","/_astro/index.CVf8TyFT.js","/_astro/jsx-runtime.TBa3i5EZ.js","/_astro/manifest.BsNAuYwp.js"],"buildFormat":"directory","checkOrigin":false,"serverIslandNameMap":[],"key":"dXDpgM4yFAlkW9Yjn3YWAQvAGvQHKTGEc+1+YbSvoqA=","experimentalEnvGetSecretEnabled":false});

export { manifest };
