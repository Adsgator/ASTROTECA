// Painel de boas-vindas exibido acima do ComponentBrowser na homepage.
// Mostra projetos recentes, status da biblioteca e guia de 4 passos.

import { useState, useEffect } from 'react'
import type { ClientProject, AppSettingsV2 } from '../../types'
import { getProjects } from '../../lib/projects'
import * as ui from '../../styles/ui'
import { cn } from '../../lib/utils'

const STEPS_GUIDE = [
  { label: 'Briefing', desc: 'Descreva o cliente — Gemini preenche automaticamente' },
  { label: 'Arte', desc: 'Cores, fontes e tema do projeto' },
  { label: 'Componentes', desc: 'Selecione da biblioteca' },
  { label: 'Gerar', desc: 'Cria o repo e gera o MANIFESTO.md' },
]

function loadSettings(): AppSettingsV2 | null {
  try {
    const raw = localStorage.getItem('acs-settings')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function OnboardingPanel() {
  const [projects, setProjects] = useState<ClientProject[]>([])
  const [hasConfig, setHasConfig] = useState(true)

  useEffect(() => {
    setProjects(getProjects().slice(0, 3))
    const s = loadSettings()
    setHasConfig(!!s?.githubToken && !!s?.githubOwner && !!s?.registryUrl)
  }, [])

  return (
    <div className="space-y-4 mb-6">
      {/* Aviso de configuração */}
      {!hasConfig && (
        <div className={cn(ui.cardBase, 'p-4 border-l-2 border-amber-500 bg-amber-50/5 flex items-start gap-3')}>
          <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-amber-600">Configure o GitHub e Gemini para criar projetos</p>
            <a href="/config" className="text-xs text-amber-500 hover:underline">Ir para Configurações →</a>
          </div>
        </div>
      )}

      {/* Header com CTA + guia de passos */}
      <div className={cn(ui.cardBase, 'p-5')}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-lg font-bold text-ink-primary">Astroteca Studio</h1>
            <p className="text-xs text-ink-muted mt-0.5">Crie landing pages de clientes em minutos.</p>
          </div>
          <a href="/builder" className={cn(ui.btnPrimary, 'text-sm flex-shrink-0 flex items-center gap-1.5')}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Novo Projeto
          </a>
        </div>

        {/* 4 passos */}
        <div className="grid grid-cols-4 gap-2">
          {STEPS_GUIDE.map((step, i) => (
            <div key={step.label} className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-accent/20 text-accent text-[10px] font-semibold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-[11px] font-semibold text-ink-primary">{step.label}</span>
              </div>
              <p className="text-[10px] text-ink-muted leading-relaxed pl-5">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Projetos recentes */}
      {projects.length > 0 && (
        <div className={cn(ui.cardBase, 'p-4')}>
          <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-3">Projetos recentes</p>
          <div className="space-y-1.5">
            {projects.map(p => (
              <a
                key={p.id}
                href={`/builder?project=${p.id}`}
                className={cn(ui.cardBase, 'px-3 py-2 flex items-center gap-3 hover:border-white/10 transition-colors')}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-ink-primary truncate">{p.name}</p>
                  <p className="text-[10px] text-ink-muted">
                    {new Date(p.updatedAt).toLocaleDateString('pt-BR')} · {p.builderState.sections.filter(s => s.enabled).length} seções
                  </p>
                </div>
                <svg className="w-3.5 h-3.5 text-ink-muted flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
