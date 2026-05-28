// src/pages/api/record-component-usage.ts
// Registra o uso de componentes em novos projetos no analytics

import { recordComponentUsage } from '../../lib/analytics'
import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ request }) => {
  try {
    const { componentIds, repoUrl, projectName } = await request.json()

    if (!componentIds || !Array.isArray(componentIds) || !repoUrl || !projectName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: componentIds, repoUrl, projectName' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Registra uso de cada componente
    for (const componentId of componentIds) {
      recordComponentUsage(componentId, repoUrl, projectName)
    }

    return new Response(
      JSON.stringify({ success: true, recorded: componentIds.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
