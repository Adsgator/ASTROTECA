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
              <p className="text-[10px] text-ink-muted mt-2 flex items-center gap-1">
                {art.defaultTheme === 'dark' ? (
                  <><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>Tema escuro</>
                ) : (
                  <><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>Tema claro</>
                )}
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
              <div className="flex flex-col items-center py-8 text-ink-muted">
                <svg className="w-8 h-8 mb-2 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/></svg>
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
              <button onClick={handleCopy} className={cn(ui.btnGhost, 'text-[11px] flex-1 py-1.5 flex items-center justify-center gap-1.5')}>
                {copied ? (
                  <><svg className="w-3.5 h-3.5 text-ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>Copiado!</>
                ) : (
                  <><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copiar</>
                )}
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
