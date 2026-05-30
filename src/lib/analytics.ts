// src/lib/analytics.ts
// Rastreamento de componentes extraídos e uso em projetos.
// Leitura: public/data/analytics.json (funciona local e em Vercel via static).
// Escrita: GitHub API — persiste em qualquer ambiente (local e serverless).

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { toBase64 } from './utils'

export interface AnalyticsEntry {
  id: string
  name: string
  category: string
  extractedAt: string
  usedIn: {
    repo: string
    projectName: string
    date: string
  }[]
  totalProjects: number
}

export interface AnalyticsData {
  [componentId: string]: AnalyticsEntry
}

const ANALYTICS_PATH = resolve('public/data/analytics.json')
const ANALYTICS_GITHUB_PATH = 'public/data/analytics.json'

export function getAnalyticsPath(): string {
  return ANALYTICS_PATH
}

/** Carrega o arquivo de analytics do filesystem local (para leitura em SSR/dev) */
export function loadAnalytics(): AnalyticsData {
  if (!existsSync(ANALYTICS_PATH)) return {}
  try {
    return JSON.parse(readFileSync(ANALYTICS_PATH, 'utf-8'))
  } catch {
    return {}
  }
}

/** Persiste analytics via GitHub API (funciona em local e serverless) */
async function saveAnalyticsToGitHub(data: AnalyticsData): Promise<void> {
  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo  = process.env.COMPONENTS_REPO

  if (!token || !owner || !repo) {
    // Ambiente sem credenciais GitHub — silently skip (ex: preview/CI)
    return
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${ANALYTICS_GITHUB_PATH}`
  const ghHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  let sha: string | undefined
  try {
    const existing = await fetch(url, { headers: ghHeaders })
    if (existing.ok) sha = (await existing.json()).sha
  } catch {}

  await fetch(url, {
    method: 'PUT',
    headers: ghHeaders,
    body: JSON.stringify({
      message: `chore: update analytics.json [${new Date().toISOString()}]`,
      content: toBase64(JSON.stringify(data, null, 2)),
      ...(sha ? { sha } : {}),
    }),
  })
}

/** Registra uma nova extração de componente */
export async function recordComponentExtraction(
  componentId: string,
  componentName: string,
  category: string
): Promise<void> {
  const analytics = loadAnalytics()

  if (!analytics[componentId]) {
    analytics[componentId] = {
      id: componentId,
      name: componentName,
      category,
      extractedAt: new Date().toISOString(),
      usedIn: [],
      totalProjects: 0,
    }
    await saveAnalyticsToGitHub(analytics)
  }
}

/** Registra o uso de um componente em um novo projeto */
export async function recordComponentUsage(
  componentId: string,
  repoUrl: string,
  projectName: string
): Promise<void> {
  const analytics = loadAnalytics()

  if (analytics[componentId]) {
    analytics[componentId].usedIn.push({
      repo: repoUrl,
      projectName,
      date: new Date().toISOString(),
    })
    analytics[componentId].totalProjects = analytics[componentId].usedIn.length
    await saveAnalyticsToGitHub(analytics)
  }
}

/** Retorna dados formatados para exibição no dashboard */
export function getAnalyticsSummary(data: AnalyticsData) {
  const components = Object.values(data)
  const totalComponents = components.length
  const totalProjects = components.reduce((sum, c) => sum + c.totalProjects, 0)
  const mostUsed = [...components].sort((a, b) => b.totalProjects - a.totalProjects).slice(0, 5)
  const recentExtractions = [...components].sort(
    (a, b) => new Date(b.extractedAt).getTime() - new Date(a.extractedAt).getTime()
  ).slice(0, 5)

  return {
    totalComponents,
    totalProjects,
    mostUsed,
    recentExtractions,
    allComponents: components,
  }
}

/** Formata data para exibição (pt-BR) */
export function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoString))
}
