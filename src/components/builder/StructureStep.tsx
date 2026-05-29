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
    <div className="grid grid-cols-[60%_40%] gap-4 h-full">
      {/* Coluna esquerda: seções disponíveis */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-3">
          Seções Disponíveis
        </p>
        {available.map(template => {
          const section = sections.find(s => s.type === template.type)
          const isEnabled = section?.enabled ?? false
          const conditionMet = template.condition ? template.condition(briefing) : true

          return (
            <div
              key={template.type}
              className={cn(
                ui.cardBase,
                'p-3 flex items-center gap-3 transition-all',
                !conditionMet && !template.required && 'opacity-50',
                isEnabled && 'border-accent/30',
              )}
            >
              <span className="text-lg flex-shrink-0">{template.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-primary">{template.label}</p>
                {template.hint && !conditionMet && (
                  <p className="text-[10px] text-ink-muted mt-0.5">{template.hint}</p>
                )}
                {template.required && (
                  <span className="text-[10px] text-ink-muted">obrigatória</span>
                )}
              </div>
              <button
                onClick={() => toggleSection(template.type)}
                disabled={template.required}
                className={cn(
                  'relative w-10 h-5 rounded-full transition-colors flex-shrink-0',
                  isEnabled ? 'bg-accent' : 'bg-raised',
                  template.required && 'opacity-60 cursor-not-allowed',
                )}
                title={template.required ? 'Seção obrigatória' : ''}
              >
                <span className={cn(
                  'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                  isEnabled ? 'translate-x-5' : 'translate-x-0.5',
                )} />
              </button>
            </div>
          )
        })}
      </div>

      {/* Coluna direita: seções habilitadas + copy */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-3">
          Estrutura da Página ({enabledSections.length} seções)
        </p>

        {enabledSections.length === 0 && (
          <div className="text-center py-12 text-ink-muted">
            <p className="text-2xl mb-2">📋</p>
            <p className="text-xs">Nenhuma seção habilitada</p>
          </div>
        )}

        {enabledSections.map((section, idx) => {
          const isExpanded = expandedId === section.id
          const copyEntries = Object.entries(section.copy)

          return (
            <div key={section.id} className={cn(ui.cardBase, 'overflow-hidden')}>
              <div className="flex items-center gap-2 p-2.5">
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
                    className="p-1 text-ink-muted hover:text-ink-primary disabled:opacity-30 transition-colors"
                  >↑</button>
                  <button
                    onClick={() => moveSection(section.id, 'down')}
                    disabled={idx === enabledSections.length - 1}
                    className="p-1 text-ink-muted hover:text-ink-primary disabled:opacity-30 transition-colors"
                  >↓</button>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : section.id)}
                    className="p-1 text-ink-muted hover:text-ink-primary transition-colors"
                  >
                    {isExpanded ? '▲' : '▼'}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-white/[0.06] p-2.5 space-y-2">
                  <button
                    onClick={() => prefill(section)}
                    className={cn(ui.btnGhost, 'text-[11px] w-full py-1.5')}
                  >
                    ✦ Preencher com briefing
                  </button>
                  {copyEntries.map(([field, value]) => (
                    <div key={field}>
                      <label className="block text-[10px] text-ink-muted mb-1 uppercase tracking-wide">
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
    </div>
  )
}
