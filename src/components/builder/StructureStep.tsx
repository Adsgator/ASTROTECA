// src/components/builder/StructureStep.tsx

import { useState } from 'react'
import type { PageSection, Briefing } from '../../types'
import { getAvailableSections, prefillCopyFromBriefing } from '../../lib/section-defaults'
import * as ui from '../../styles/ui'
import { cn } from '../../lib/utils'

interface StructureStepProps {
  sections: PageSection[]
  briefing: Briefing
  onChange: (sections: PageSection[]) => void
}

export default function StructureStep({ sections, briefing, onChange }: StructureStepProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const available = getAvailableSections()

  const enabledSections = sections
    .filter(s => s.enabled)
    .sort((a, b) => a.position - b.position)

  function toggleSection(type: string) {
    const existing = sections.find(s => s.type === type)
    const template = available.find(t => t.type === type)
    if (!template || template.required) return

    if (existing) {
      onChange(sections.map(s => s.type === type ? { ...s, enabled: !s.enabled } : s))
    } else {
      // Não deveria acontecer pois sections é inicializado com todos os templates
    }
  }

  function moveSection(id: string, dir: 'up' | 'down') {
    const sorted = [...enabledSections]
    const idx = sorted.findIndex(s => s.id === id)
    if (dir === 'up' && idx === 0) return
    if (dir === 'down' && idx === sorted.length - 1) return

    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    const a = sorted[idx]
    const b = sorted[swapIdx]
    const newPos = b.position
    sorted[swapIdx] = { ...a, position: b.position }
    sorted[idx] = { ...b, position: a.position }

    onChange(sections.map(s => {
      const found = sorted.find(ss => ss.id === s.id)
      return found ? found : s
    }))
  }

  function updateCopy(sectionId: string, field: string, value: string) {
    onChange(sections.map(s =>
      s.id === sectionId ? { ...s, copy: { ...s.copy, [field]: value } } : s
    ))
  }

  function prefill(section: PageSection) {
    const updated = prefillCopyFromBriefing(section, briefing)
    onChange(sections.map(s => s.id === section.id ? updated : s))
  }

  return (
    <div className="grid grid-cols-[1fr_380px] gap-5 h-full">
      {/* Coluna esquerda: seções disponíveis */}
      <div className="flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-4">
          <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-widest">
            Seções Disponíveis
          </p>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>
        <div className="space-y-2 overflow-y-auto pr-1">
          {available.map(template => {
            const section = sections.find(s => s.type === template.type)
            const isEnabled = section?.enabled ?? false
            const conditionMet = template.condition ? template.condition(briefing) : true

            return (
              <div
                key={template.type}
                onClick={() => !template.required && toggleSection(template.type)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all',
                  'border-white/[0.06] bg-surface/60',
                  !template.required && 'cursor-pointer hover:border-white/[0.12] hover:bg-raised/60',
                  isEnabled && !template.required && 'border-accent/30 bg-accent/[0.04]',
                  !conditionMet && !template.required && 'opacity-40',
                )}
              >
                <span className="text-base flex-shrink-0 w-7 text-center">{template.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-medium leading-tight',
                    isEnabled ? 'text-ink-primary' : 'text-ink-secondary',
                  )}>
                    {template.label}
                  </p>
                  {template.required && (
                    <span className="text-[10px] text-ink-muted">obrigatória</span>
                  )}
                  {template.hint && !conditionMet && !template.required && (
                    <p className="text-[10px] text-ink-muted mt-0.5 leading-tight">{template.hint}</p>
                  )}
                </div>
                {/* Toggle */}
                <div
                  className={cn(
                    'relative w-9 h-[18px] rounded-full transition-colors flex-shrink-0',
                    isEnabled ? 'bg-accent' : 'bg-white/10',
                    template.required && 'opacity-50',
                  )}
                >
                  <span className={cn(
                    'absolute top-[2px] w-[14px] h-[14px] bg-white rounded-full shadow transition-transform',
                    isEnabled ? 'translate-x-[18px]' : 'translate-x-[2px]',
                  )} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Coluna direita: estrutura da página */}
      <div className="flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-4">
          <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-widest">
            Estrutura da Página
          </p>
          {enabledSections.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-md bg-accent/15 text-accent text-[10px] font-bold">
              {enabledSections.length}
            </span>
          )}
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        {enabledSections.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-ink-muted gap-2">
            <svg className="w-8 h-8 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            <p className="text-xs">Ative seções à esquerda</p>
          </div>
        ) : (
          <div className="space-y-1.5 overflow-y-auto pr-1">
            {enabledSections.map((section, idx) => {
              const isExpanded = expandedId === section.id
              const copyEntries = Object.entries(section.copy)

              return (
                <div
                  key={section.id}
                  className={cn(
                    'rounded-xl border overflow-hidden transition-all',
                    isExpanded
                      ? 'border-accent/30 bg-accent/[0.03]'
                      : 'border-white/[0.06] bg-surface/60',
                  )}
                >
                  <div className="flex items-center gap-2.5 px-3 py-2.5">
                    <span className="w-5 h-5 rounded-full bg-accent/20 text-accent text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-medium text-ink-primary flex-1 truncate">
                      {section.label}
                    </span>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <button
                        onClick={() => moveSection(section.id, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded text-ink-muted hover:text-ink-primary disabled:opacity-20 transition-colors"
                        title="Mover para cima"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>
                      </button>
                      <button
                        onClick={() => moveSection(section.id, 'down')}
                        disabled={idx === enabledSections.length - 1}
                        className="p-1 rounded text-ink-muted hover:text-ink-primary disabled:opacity-20 transition-colors"
                        title="Mover para baixo"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                      </button>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : section.id)}
                        className={cn(
                          'p-1 rounded transition-colors',
                          isExpanded ? 'text-accent' : 'text-ink-muted hover:text-ink-primary',
                        )}
                        title={isExpanded ? 'Fechar' : 'Editar copy'}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points={isExpanded ? '18 15 12 9 6 15' : '6 9 12 15 18 9'}/></svg>
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-white/[0.06] px-3 py-3 space-y-2.5">
                      <button
                        onClick={() => prefill(section)}
                        className={cn(ui.btnGhost, 'text-[11px] w-full py-1.5 gap-1.5')}
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        Preencher com briefing
                      </button>
                      {copyEntries.map(([field, value]) => (
                        <div key={field}>
                          <label className="block text-[10px] text-ink-muted mb-1 uppercase tracking-widest">
                            {field}
                          </label>
                          <input
                            type="text"
                            value={value}
                            onChange={e => updateCopy(section.id, field, e.target.value)}
                            className={cn(ui.inputBase, 'text-xs py-1.5')}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
