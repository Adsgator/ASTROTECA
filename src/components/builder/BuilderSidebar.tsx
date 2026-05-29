// src/components/builder/BuilderSidebar.tsx

import { useState, useMemo } from 'react'
import type { BuilderState, AppSettingsV2, SelectedComponent } from '../../types'
import { generateDocument } from '../../lib/export-document'
import { markdownToHtml } from '../../lib/markdown'
import { formatDate } from '../../lib/utils'
import * as ui from '../../styles/ui'
import { cn } from '../../lib/utils'

type SidebarTab = 'resumo' | 'componentes' | 'documento'

interface BuilderSidebarProps {
  tab: SidebarTab
  onTabChange: (tab: SidebarTab) => void
  state: BuilderState
  settings: AppSettingsV2
  onRemoveComponent: (id: string) => void
  onMoveComponent: (index: number, dir: 'up' | 'down') => void
}

const TABS: { key: SidebarTab; label: string }[] = [
  { key: 'resumo', label: 'Resumo' },
  { key: 'componentes', label: 'Componentes' },
  { key: 'documento', label: 'Documento' },
]

export default function BuilderSidebar({
  tab,
  onTabChange,
  state,
  settings,
  onRemoveComponent,
  onMoveComponent,
}: BuilderSidebarProps) {
  const [copied, setCopied] = useState(false)

  const docHtml = useMemo(() => {
    if (tab !== 'documento') return ''
    const md = generateDocument(state, settings)
    return markdownToHtml(md)
  }, [tab, state, settings])

  function handleCopy() {
    const md = generateDocument(state, settings)
    navigator.clipboard.writeText(md)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    const md = generateDocument(state, settings)
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `manifesto-${state.briefing.nomeCliente || 'projeto'}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const art = state.art
  const enabledSections = state.sections.filter(s => s.enabled).sort((a, b) => a.position - b.position)
  const sortedSelected = [...state.selected].sort((a, b) => a.position - b.position)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tabs */}
      <div className="flex gap-0.5 p-1 bg-raised/50 rounded-lg border border-white/5 mx-3 mt-3 mb-2 flex-shrink-0">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => onTabChange(t.key)}
            className={cn(
              'flex-1 px-1.5 py-1.5 rounded-md text-[11px] font-semibold transition-all',
              tab === t.key ? ui.tabActive : ui.tabInactive,
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
        {/* Tab Resumo */}
        {tab === 'resumo' && (
          <>
            {/* Cliente */}
            <div className={ui.cardBase + ' p-3'}>
              <p className="text-[10px] text-ink-muted uppercase tracking-wider mb-2">Cliente</p>
              {state.briefing.nomeCliente ? (
                <>
                  <p className="text-sm font-semibold text-ink-primary">{state.briefing.nomeCliente}</p>
                  {state.briefing.tipo && (
                    <span className={cn(ui.badgeBase, 'bg-raised text-ink-muted text-[10px] mt-1')}>
                      {state.briefing.tipo}
                    </span>
                  )}
                  {state.briefing.segmento && (
                    <p className="text-[11px] text-ink-secondary mt-1">{state.briefing.segmento}</p>
                  )}
                </>
              ) : (
                <p className="text-xs text-ink-muted italic">Não preenchido</p>
              )}
            </div>

            {/* Estrutura */}
            {enabledSections.length > 0 && (
              <div className={ui.cardBase + ' p-3'}>
                <p className="text-[10px] text-ink-muted uppercase tracking-wider mb-2">
                  Estrutura ({enabledSections.length})
                </p>
                <div className="space-y-0.5">
                  {enabledSections.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-1.5 text-[11px] text-ink-secondary">
                      <span className="text-ink-muted w-3.5 text-right flex-shrink-0">{i + 1}.</span>
                      <span>{s.label}</span>
                      {s.fromLibrary && <span className="text-accent text-[9px]">●</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cores */}
            <div className={ui.cardBase + ' p-3'}>
              <p className="text-[10px] text-ink-muted uppercase tracking-wider mb-2">Cores</p>
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { color: art.colorPrimary, label: 'Primary' },
                  { color: art.colorSecondary, label: 'Secondary' },
                  { color: art.colorBackground, label: 'BG' },
                  { color: art.colorText, label: 'Text' },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-1" title={`${s.label}: ${s.color}`}>
                    <div className="w-4 h-4 rounded-md border border-white/10 flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-[10px] text-ink-muted">{s.color}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-ink-muted mt-2">
                {art.defaultTheme === 'dark' ? '🌙 Tema escuro' : '☀️ Tema claro'}
              </p>
            </div>

            {/* Tipografia */}
            {(art.fontHeading || art.fontBody) && (
              <div className={ui.cardBase + ' p-3'}>
                <p className="text-[10px] text-ink-muted uppercase tracking-wider mb-2">Tipografia</p>
                <p className="text-[11px] text-ink-secondary">
                  <span className="text-ink-muted">Heading:</span> {art.fontHeading || '—'}
                </p>
                <p className="text-[11px] text-ink-secondary">
                  <span className="text-ink-muted">Body:</span> {art.fontBody || '—'}
                </p>
              </div>
            )}
          </>
        )}

        {/* Tab Componentes */}
        {tab === 'componentes' && (
          <>
            {sortedSelected.length === 0 ? (
              <div className="text-center py-8 text-ink-muted">
                <p className="text-xl mb-1">🧩</p>
                <p className="text-xs">Nenhum selecionado</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {sortedSelected.map((s, idx) => (
                  <div
                    key={s.meta.id}
                    className="bg-raised/50 rounded-lg p-2.5 border border-white/[0.04] flex items-center gap-2"
                  >
                    <span className="w-5 h-5 rounded-full bg-accent/20 text-accent text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-ink-primary truncate">{s.meta.name}</p>
                      <span className={cn(ui.badgeBase, 'bg-raised text-ink-muted text-[9px]')}>
                        {s.meta.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <button
                        onClick={() => onMoveComponent(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-ink-muted hover:text-ink-primary disabled:opacity-30 text-xs"
                      >↑</button>
                      <button
                        onClick={() => onMoveComponent(idx, 'down')}
                        disabled={idx === sortedSelected.length - 1}
                        className="p-1 text-ink-muted hover:text-ink-primary disabled:opacity-30 text-xs"
                      >↓</button>
                      <button
                        onClick={() => onRemoveComponent(s.meta.id)}
                        className="p-1 text-ink-muted hover:text-fail transition-colors text-xs"
                      >✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Tab Documento */}
        {tab === 'documento' && (
          <div className="space-y-2">
            <div className="flex gap-1.5">
              <button onClick={handleCopy} className={cn(ui.btnGhost, 'text-[11px] flex-1 py-1.5')}>
                {copied ? '✓ Copiado!' : '📋 Copiar'}
              </button>
              <button onClick={handleDownload} className={cn(ui.btnGhost, 'text-[11px] flex-1 py-1.5')}>
                ↓ Baixar .md
              </button>
            </div>
            <div
              className="max-h-[calc(100vh-20rem)] overflow-y-auto text-xs"
              dangerouslySetInnerHTML={{ __html: docHtml }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
