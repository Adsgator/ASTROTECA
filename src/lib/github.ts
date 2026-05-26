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
 * Busca o registry.json diretamente da URL raw do GitHub
 * (não precisa de token se o repo for público)
 */
export async function fetchRegistry(registryUrl: string): Promise<ComponentMeta[]> {
  const res = await fetch(`${registryUrl}?t=${Date.now()}`, { cache: 'no-store' })
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

export async function createProjectFromTemplate(
  settings: AppSettings,
  clientName: string,
  manifestContent: string
): Promise<CreateProjectResult> {
  const { githubToken, githubOwner, baseProjectRepo } = settings
  const repoName = slugify(clientName)

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

    // 3. Commita o MANIFESTO.md no novo repo
    await fetch(
      apiUrl(`/repos/${githubOwner}/${repoName}/contents/MANIFESTO.md`),
      {
        method: 'PUT',
        headers: headers(githubToken),
        body: JSON.stringify({
          message: 'init: manifesto do projeto',
          content: toBase64(manifestContent),
        }),
      }
    )

    return {
      repoUrl: repo.html_url,
      cloneUrl: repo.clone_url,
      sshUrl: repo.ssh_url,
      vscodeUrl: `vscode://vscode.git/clone?url=${encodeURIComponent(repo.clone_url)}`,
      success: true,
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
