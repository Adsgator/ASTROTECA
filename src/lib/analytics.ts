// src/lib/analytics.ts
// Sistema de rastreamento de componentes extraídos e seu uso em projetos

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

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

export function getAnalyticsPath(): string {
  return ANALYTICS_PATH
}

/** Carrega o arquivo de analytics, retorna {} se não existir */
export function loadAnalytics(): AnalyticsData {
  if (!existsSync(ANALYTICS_PATH)) {
    return {}
  }
  try {
    const content = readFileSync(ANALYTICS_PATH, 'utf-8')
    return JSON.parse(content)
  } catch {
    return {}
  }
}

/** Salva analytics de volta ao arquivo */
export function saveAnalytics(data: AnalyticsData): void {
  writeFileSync(ANALYTICS_PATH, JSON.stringify(data, null, 2))
}

/** Registra uma nova extração de componente */
export function recordComponentExtraction(
  componentId: string,
  componentName: string,
  category: string
): void {
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
  }

  saveAnalytics(analytics)
}

/** Registra o uso de um componente em um novo projeto */
export function recordComponentUsage(
  componentId: string,
  repoUrl: string,
  projectName: string
): void {
  const analytics = loadAnalytics()

  if (analytics[componentId]) {
    analytics[componentId].usedIn.push({
      repo: repoUrl,
      projectName,
      date: new Date().toISOString(),
    })
    analytics[componentId].totalProjects = analytics[componentId].usedIn.length
    saveAnalytics(analytics)
  }
}

/** Retorna dados formatados para exibição no dashboard */
export function getAnalyticsSummary(data: AnalyticsData) {
  const components = Object.values(data)
  const totalComponents = components.length
  const totalProjects = components.reduce((sum, c) => sum + c.totalProjects, 0)
  const mostUsed = components.sort((a, b) => b.totalProjects - a.totalProjects).slice(0, 5)
  const recentExtractions = components.sort(
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
