// scripts/analytics.mjs
// Utilitários de analytics — versão Node.js para usar em scripts

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

const ANALYTICS_PATH = resolve('public/data/analytics.json')

export function loadAnalytics() {
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

export function saveAnalytics(data) {
  const dir = dirname(ANALYTICS_PATH)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  writeFileSync(ANALYTICS_PATH, JSON.stringify(data, null, 2))
}

export function recordComponentExtraction(componentId, componentName, category) {
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

export function recordComponentUsage(componentId, repoUrl, projectName) {
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
