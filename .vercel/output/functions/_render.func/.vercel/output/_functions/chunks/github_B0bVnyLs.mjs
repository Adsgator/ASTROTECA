function slugify(str) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function toBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}
function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
  };
}
function apiUrl(path) {
  return `https://api.github.com${path}`;
}
async function fetchRegistry(registryUrl) {
  const res = await fetch(`${registryUrl}?t=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Erro ao buscar registry: ${res.status}`);
  return res.json();
}
async function updateRegistry(settings, components) {
  const { githubToken, githubOwner, componentsRepo } = settings;
  const path = `/repos/${githubOwner}/${componentsRepo}/contents/registry.json`;
  let sha;
  try {
    const existing = await fetch(apiUrl(path), { headers: headers(githubToken) });
    if (existing.ok) {
      const data = await existing.json();
      sha = data.sha;
    }
  } catch {
  }
  const content = toBase64(JSON.stringify(components, null, 2));
  const res = await fetch(apiUrl(path), {
    method: "PUT",
    headers: headers(githubToken),
    body: JSON.stringify({
      message: `chore: update registry.json [${(/* @__PURE__ */ new Date()).toISOString()}]`,
      content,
      ...sha ? { sha } : {}
    })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Erro ao atualizar registry");
  }
}
async function publishComponent(settings, payload) {
  const { githubToken, githubOwner, componentsRepo } = settings;
  const { meta, astroCode, previewCode, indexCode, currentRegistry } = payload;
  const basePath = `/repos/${githubOwner}/${componentsRepo}/contents/src/components/${meta.name}`;
  async function upsertFile(path, content, message) {
    let sha;
    try {
      const existing = await fetch(apiUrl(path), { headers: headers(githubToken) });
      if (existing.ok) {
        const data = await existing.json();
        sha = data.sha;
      }
    } catch {
    }
    const res = await fetch(apiUrl(path), {
      method: "PUT",
      headers: headers(githubToken),
      body: JSON.stringify({ message, content: toBase64(content), ...sha ? { sha } : {} })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || `Erro ao criar ${path}`);
    }
  }
  await upsertFile(`${basePath}/${meta.name}.astro`, astroCode, `feat: add ${meta.name} component`);
  await upsertFile(`${basePath}/${meta.name}.preview.astro`, previewCode, `feat: add ${meta.name} preview`);
  await upsertFile(`${basePath}/index.ts`, indexCode, `feat: add ${meta.name} index`);
  const exists = currentRegistry.findIndex((c) => c.id === meta.id);
  const updated = exists >= 0 ? currentRegistry.map((c) => c.id === meta.id ? { ...meta, updatedAt: (/* @__PURE__ */ new Date()).toISOString() } : c) : [...currentRegistry, { ...meta, createdAt: (/* @__PURE__ */ new Date()).toISOString(), updatedAt: (/* @__PURE__ */ new Date()).toISOString() }];
  await updateRegistry(settings, updated);
}
async function createProjectFromTemplate(settings, clientName, manifestContent) {
  const { githubToken, githubOwner, baseProjectRepo } = settings;
  const repoName = slugify(clientName);
  try {
    const createRes = await fetch(
      apiUrl(`/repos/${githubOwner}/${baseProjectRepo}/generate`),
      {
        method: "POST",
        headers: headers(githubToken),
        body: JSON.stringify({
          owner: githubOwner,
          name: repoName,
          private: true,
          description: `Landing page — ${clientName}`,
          include_all_branches: false
        })
      }
    );
    if (!createRes.ok) {
      const err = await createRes.json();
      throw new Error(err.message || "Erro ao criar repositório");
    }
    const repo = await createRes.json();
    await wait(3500);
    await fetch(
      apiUrl(`/repos/${githubOwner}/${repoName}/contents/MANIFESTO.md`),
      {
        method: "PUT",
        headers: headers(githubToken),
        body: JSON.stringify({
          message: "init: manifesto do projeto",
          content: toBase64(manifestContent)
        })
      }
    );
    return {
      repoUrl: repo.html_url,
      cloneUrl: repo.clone_url,
      sshUrl: repo.ssh_url,
      vscodeUrl: `vscode://vscode.git/clone?url=${encodeURIComponent(repo.clone_url)}`,
      success: true
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { repoUrl: "", cloneUrl: "", sshUrl: "", vscodeUrl: "", success: false, error: message };
  }
}
async function validateGithubToken(token) {
  try {
    const res = await fetch(apiUrl("/user"), { headers: headers(token) });
    if (!res.ok) return { valid: false, error: `HTTP ${res.status}` };
    const data = await res.json();
    return { valid: true, login: data.login };
  } catch (e) {
    return { valid: false, error: e instanceof Error ? e.message : "Erro desconhecido" };
  }
}

export { createProjectFromTemplate as c, fetchRegistry as f, publishComponent as p, validateGithubToken as v };
