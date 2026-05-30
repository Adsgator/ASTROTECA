// src/lib/github.ts

import type { ComponentMeta, AppSettings, CreateProjectResult } from '../types'
import { toBase64, slugify, wait } from './utils'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

function apiUrl(path: string) {
  return `https://api.github.com${path}`
}

// ─── Registry ────────────────────────────────────────────────────────────────

/**
 * Converte URL raw.githubusercontent.com para api.github.com/contents
 * para evitar cache do CDN do GitHub.
 * Ex: https://raw.githubusercontent.com/owner/repo/branch/registry.json
 *  → https://api.github.com/repos/owner/repo/contents/registry.json?ref=branch
 *
 * Se a URL já for api.github.com ou não seguir o padrão raw.githubusercontent.com,
 * retorna sem modificação (comportamento intencional para URLs customizadas).
 */
function toApiUrl(url: string): string {
  const match = url.match(/^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/)
  if (!match) return url
  const [, owner, repo, ref, path] = match
  return `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`
}

/**
 * Busca o registry.json via API do GitHub (sem cache de CDN).
 */
export async function fetchRegistry(registryUrl: string): Promise<ComponentMeta[]> {
  const url = toApiUrl(registryUrl)
  const isApiUrl = url.includes('api.github.com')

  const res = await fetch(url, {
    cache: 'no-store',
    headers: isApiUrl
      ? { Accept: 'application/vnd.github.raw+json', 'X-GitHub-Api-Version': '2022-11-28' }
      : {},
  })
  if (!res.ok) throw new Error(`Erro ao buscar registry: ${res.status}`)
  return res.json()
}

/**
 * Atualiza o registry.json no GitHub
 */
export async function updateRegistry(
  settings: AppSettings,
  components: ComponentMeta[]
): Promise<void> {
  const { githubToken, githubOwner, componentsRepo } = settings
  const path = `/repos/${githubOwner}/${componentsRepo}/contents/registry.json`

  // Busca o SHA atual do arquivo (necessário para atualizar)
  let sha: string | undefined
  try {
    const existing = await fetch(apiUrl(path), { headers: headers(githubToken) })
    if (existing.ok) {
      const data = await existing.json()
      sha = data.sha
    }
  } catch {}

  const content = toBase64(JSON.stringify(components, null, 2))

  const res = await fetch(apiUrl(path), {
    method: 'PUT',
    headers: headers(githubToken),
    body: JSON.stringify({
      message: `chore: update registry.json [${new Date().toISOString()}]`,
      content,
      ...(sha ? { sha } : {}),
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Erro ao atualizar registry')
  }
}

// ─── Publicar Componente ──────────────────────────────────────────────────────

interface PublishComponentPayload {
  meta: ComponentMeta
  astroCode: string
  previewCode: string
  indexCode: string
  currentRegistry: ComponentMeta[]
}

export async function publishComponent(
  settings: AppSettings,
  payload: PublishComponentPayload
): Promise<void> {
  const { githubToken, githubOwner, componentsRepo } = settings
  const { meta, astroCode, previewCode, indexCode, currentRegistry } = payload
  const basePath = `/repos/${githubOwner}/${componentsRepo}/contents/src/components/${meta.name}`

  async function upsertFile(path: string, content: string, message: string) {
    let sha: string | undefined
    try {
      const existing = await fetch(apiUrl(path), { headers: headers(githubToken) })
      if (existing.ok) {
        const data = await existing.json()
        sha = data.sha
      }
    } catch {}

    const res = await fetch(apiUrl(path), {
      method: 'PUT',
      headers: headers(githubToken),
      body: JSON.stringify({ message, content: toBase64(content), ...(sha ? { sha } : {}) }),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || `Erro ao criar ${path}`)
    }
  }

  // 1. Cria os 3 arquivos do componente
  await upsertFile(`${basePath}/${meta.name}.astro`, astroCode, `feat: add ${meta.name} component`)
  await upsertFile(`${basePath}/${meta.name}.preview.astro`, previewCode, `feat: add ${meta.name} preview`)
  await upsertFile(`${basePath}/index.ts`, indexCode, `feat: add ${meta.name} index`)

  // 2. Atualiza o registry
  const exists = currentRegistry.findIndex(c => c.id === meta.id)
  const updated =
    exists >= 0
      ? currentRegistry.map(c => (c.id === meta.id ? { ...meta, updatedAt: new Date().toISOString() } : c))
      : [...currentRegistry, { ...meta, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]

  await updateRegistry(settings, updated)
}

// ─── Criar Projeto ─────────────────────────────────────────────────────────────

/** Busca o conteúdo de um arquivo do repo de componentes via GitHub API */
async function fetchComponentFile(
  token: string,
  owner: string,
  repo: string,
  filePath: string
): Promise<string | null> {
  const res = await fetch(apiUrl(`/repos/${owner}/${repo}/contents/${filePath}`), {
    headers: headers(token),
  })
  if (!res.ok) return null
  const data = await res.json()
  if (!data.content) return null
  return atob(data.content.replace(/\n/g, ''))
}

/** Commita um arquivo no repositório destino, criando ou atualizando */
async function commitFile(
  token: string,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string
): Promise<void> {
  await fetch(apiUrl(`/repos/${owner}/${repo}/contents/${path}`), {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify({ message, content: toBase64(content) }),
  })
}

/** Gera o index.astro com imports e uso dos componentes na ordem selecionada */
function generateIndexAstro(
  clientName: string,
  componentNames: string[]
): string {
  const imports = componentNames
    .map(name => `import ${name} from '../components/${name}/${name}.astro'`)
    .join('\n')

  const usages = componentNames.map(name => `  <${name} />`).join('\n')

  return `---
import Layout from '../layouts/Layout.astro'
${imports}
---

<Layout title="${clientName}">
  <main>
${usages}
  </main>
</Layout>
`
}

export async function createProjectFromTemplate(
  settings: AppSettings,
  clientName: string,
  manifestContent: string,
  selectedComponents?: import('../types').ComponentMeta[]
): Promise<CreateProjectResult> {
  const { githubToken, githubOwner, baseProjectRepo, componentsRepo } = settings
  const repoName = slugify(clientName)
  const usedComponentIds: string[] = []

  try {
    // 1. Cria o repo a partir do template
    const createRes = await fetch(
      apiUrl(`/repos/${githubOwner}/${baseProjectRepo}/generate`),
      {
        method: 'POST',
        headers: headers(githubToken),
        body: JSON.stringify({
          owner: githubOwner,
          name: repoName,
          private: true,
          description: `Landing page — ${clientName}`,
          include_all_branches: false,
        }),
      }
    )

    if (!createRes.ok) {
      const err = await createRes.json()
      throw new Error(err.message || 'Erro ao criar repositório')
    }

    const repo = await createRes.json()

    // 2. Aguarda o GitHub terminar de inicializar o repo
    await wait(3500)

    // 3. Commita o MANIFESTO.md
    await commitFile(
      githubToken, githubOwner, repoName,
      'MANIFESTO.md', manifestContent,
      'init: manifesto do projeto'
    )

    // 4. Copia os componentes selecionados + gera index.astro
    if (selectedComponents && selectedComponents.length > 0 && componentsRepo) {
      const copiedNames: string[] = []

      for (const meta of selectedComponents) {
        const srcPath = `src/components/${meta.name}/${meta.name}.astro`
        const content = await fetchComponentFile(githubToken, githubOwner, componentsRepo, srcPath)
        if (content) {
          await commitFile(
            githubToken, githubOwner, repoName,
            srcPath, content,
            `feat: add component ${meta.name}`
          )
          copiedNames.push(meta.name)
          usedComponentIds.push(meta.id)
        }
      }

      if (copiedNames.length > 0) {
        const indexAstro = generateIndexAstro(clientName, copiedNames)
        await commitFile(
          githubToken, githubOwner, repoName,
          'src/pages/index.astro', indexAstro,
          'init: index.astro com componentes selecionados'
        )
      }
    }

    return {
      repoUrl: repo.html_url,
      cloneUrl: repo.clone_url,
      sshUrl: repo.ssh_url,
      vscodeUrl: `vscode://vscode.git/clone?url=${encodeURIComponent(repo.clone_url)}`,
      success: true,
      usedComponentIds,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return { repoUrl: '', cloneUrl: '', sshUrl: '', vscodeUrl: '', success: false, error: message }
  }
}

// ─── Validar Token ────────────────────────────────────────────────────────────

export async function validateGithubToken(token: string): Promise<{ valid: boolean; login?: string; error?: string }> {
  try {
    const res = await fetch(apiUrl('/user'), { headers: headers(token) })
    if (!res.ok) return { valid: false, error: `HTTP ${res.status}` }
    const data = await res.json()
    return { valid: true, login: data.login }
  } catch (e) {
    return { valid: false, error: e instanceof Error ? e.message : 'Erro desconhecido' }
  }
}
