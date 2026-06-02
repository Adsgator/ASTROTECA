// src/components/builder/BuilderSidebar.tsx

import { useState, useMemo } from 'react'
import type { BuilderState, AppSettingsV2 } from '../../types'
import { generateDocument } from '../../lib/export-document'
import { markdownToHtml } from '../../lib/markdown'
import * as ui from '../../styles/ui'
import { cn } from '../../lib/utils'
import ComponentThumbnail from '../ui/ComponentThumbnail'
import { Check, X, Copy, ChevronRight, ChevronUp, ChevronDown, Moon, Sun, LayoutGrid } from 'lucide-react'

type SidebarTab = 'resumo' | 'componentes' | 'documento'

interface BuilderSidebarProps {
  tab: SidebarTab
  onTabChange: (tab: SidebarTab) => void
  state: BuilderState
  settings: AppSettingsV2
  onRemoveComponent: (id: string) => void
  onMoveComponent: (index: number, dir: 'up' | 'down') => void
  collapsed: boolean
  onToggleCollapse: () => void
}

const TABS: { key: SidebarTab; label: string }[] = [
  { key: 'resumo', label: 'Resumo' },
  { key: 'componentes', label: 'Selecionados' },
  { key: 'documento', label: 'Documento' },
]

export default function BuilderSidebar({
  tab,
  onTabChange,
  state,
  settings,
  onRemoveComponent,
  onMoveComponent,
  collapsed,
  onToggleCollapse,
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
  const coveredCount = enabledSections.filter(s => s.fromLibrary && s.componentId).length

  const collapseIcon = (
    <ChevronRight className={cn('w-4 h-4 transition-transform', collapsed ? 'rotate-180' : '')} />
  )

  if (collapsed) {
    return (
      <div className="flex flex-col items-center py-3 gap-3 h-full">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-raised transition-colors"
          title="Expandir painel"
        >
          {collapseIcon}
        </button>
        {/* Indicadores verticais compactos */}
        <div className="flex flex-col gap-2 items-center mt-2">
          {sortedSelected.length > 0 && (
            <div className="w-6 h-6 rounded-full bg-accent/20 text-accent text-[10px] font-bold flex items-center justify-center" title={`${sortedSelected.length} componentes selecionados`}>
              {sortedSelected.length}
            </div>
          )}
          {enabledSections.length > 0 && (
            <div className={cn('w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center',
              coveredCount === enabledSections.length ? 'bg-ok/20 text-ok' : 'bg-raised text-ink-muted'
            )} title={`${coveredCount}/${enabledSections.length} seções cobertas`}>
              {coveredCount}/{enabledSections.length}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header da sidebar com botão colapsar */}
      <div className="flex items-center gap-1 px-3 pt-3 mb-2 flex-shrink-0">
        <div className="flex gap-0.5 p-1 bg-raised/50 rounded-lg border border-white/5 flex-1">
          {TABS.map(t => {
            const isComponents = t.key === 'componentes'
            return (
              <button
                key={t.key}
                onClick={() => onTabChange(t.key)}
                className={cn(
                  'flex-1 px-1.5 py-1.5 rounded-md text-[11px] font-semibold transition-all relative',
                  tab === t.key ? ui.tabActive : ui.tabInactive,
                )}
              >
                {t.label}
                {isComponents && sortedSelected.length > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-accent text-black text-[9px] font-bold">
                    {sortedSelected.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-raised transition-colors flex-shrink-0"
          title="Recolher painel"
        >
          {collapseIcon}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">

        {/* ── Tab Resumo ── */}
        {tab === 'resumo' && (
          <>
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
                  <><Moon className="w-3 h-3" />Tema escuro</>
                ) : (
                  <><Sun className="w-3 h-3" />Tema claro</>
                )}
              </p>
            </div>

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

        {/* ── Tab Componentes ── */}
        {tab === 'componentes' && (
          <>
            {/* Barra de cobertura */}
            {enabledSections.length > 0 && (
              <div className={ui.cardBase + ' p-3'}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-ink-muted uppercase tracking-wider">Cobertura</p>
                  <span className={cn(
                    'text-[11px] font-semibold',
                    coveredCount === enabledSections.length ? 'text-ok' : 'text-ink-muted'
                  )}>
                    {coveredCount}/{enabledSections.length} seções
                  </span>
                </div>
                {/* Barra de progresso */}
                <div className="h-1.5 rounded-full bg-raised overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500',
                      coveredCount === enabledSections.length ? 'bg-ok' : 'bg-accent'
                    )}
                    style={{ width: `${enabledSections.length ? (coveredCount / enabledSections.length) * 100 : 0}%` }}
                  />
                </div>
                {/* Seções não cobertas */}
                {enabledSections.filter(s => !(s.fromLibrary && s.componentId)).length > 0 && (
                  <p className="text-[10px] text-ink-muted mt-2">
                    Sem componente: {enabledSections
                      .filter(s => !(s.fromLibrary && s.componentId))
                      .map(s => s.label)
                      .join(', ')}
                  </p>
                )}
              </div>
            )}

            {sortedSelected.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-ink-muted">
                <LayoutGrid className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-xs">Nenhum selecionado</p>
                <p className="text-[10px] text-ink-muted/60 mt-0.5">Vá ao step Componentes para adicionar</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedSelected.map((s, idx) => (
                  <div
                    key={s.meta.id}
                    className="bg-raised/50 rounded-xl border border-white/[0.05] overflow-hidden"
                  >
                    {/* Thumbnail miniatura */}
                    <div className="h-20 w-full overflow-hidden">
                      <ComponentThumbnail
                        previewUrl={s.meta.previewUrl || s.meta.previewPath}
                        screenshotUrl={s.meta.screenshotUrl}
                        name={s.meta.name}
                        category={s.meta.category}
                        height={80}
                      />
                    </div>
                    {/* Info + controles */}
                    <div className="px-3 py-2 flex items-center gap-2">
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
                          className="w-6 h-6 flex items-center justify-center rounded text-ink-muted hover:text-ink-primary hover:bg-raised disabled:opacity-30 transition-colors"
                          title="Mover para cima"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onMoveComponent(idx, 'down')}
                          disabled={idx === sortedSelected.length - 1}
                          className="w-6 h-6 flex items-center justify-center rounded text-ink-muted hover:text-ink-primary hover:bg-raised disabled:opacity-30 transition-colors"
                          title="Mover para baixo"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onRemoveComponent(s.meta.id)}
                          className="w-6 h-6 flex items-center justify-center rounded text-ink-muted hover:text-fail hover:bg-fail/10 transition-colors ml-0.5"
                          title="Remover"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Tab Documento ── */}
        {tab === 'documento' && (
          <div className="space-y-2">
            <div className="flex gap-1.5">
              <button onClick={handleCopy} className={cn(ui.btnGhost, 'text-[11px] flex-1 py-1.5 flex items-center justify-center gap-1.5')}>
                {copied ? (
                  <><Check className="w-3.5 h-3.5 text-ok" />Copiado!</>
                ) : (
                  <><Copy className="w-3.5 h-3.5" />Copiar</>
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
