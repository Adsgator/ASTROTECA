// src/components/builder/ComponentsStep.tsx

import { useState } from 'react'
import type { ComponentMeta, SelectedComponent, PageSection } from '../../types'
import * as ui from '../../styles/ui'
import { cn } from '../../lib/utils'

interface ComponentsStepProps {
  availableComponents: ComponentMeta[]
  selected: SelectedComponent[]
  onChange: (selected: SelectedComponent[]) => void
  sections: PageSection[]
  onSectionsChange: (sections: PageSection[]) => void
}

export default function ComponentsStep({
  availableComponents,
  selected,
  onChange,
  sections,
  onSectionsChange,
}: ComponentsStepProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('Todos')

  const categories = ['Todos', ...Array.from(new Set(availableComponents.map(c => c.category)))]

  const filtered = availableComponents.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'Todos' || c.category === category
    return matchSearch && matchCat
  })

  const counts = availableComponents.reduce<Record<string, number>>((acc, c) => {
    acc[c.category] = (acc[c.category] ?? 0) + 1
    return acc
  }, {})

  function isSelected(id: string) {
    return selected.some(s => s.meta.id === id)
  }

  function toggleComponent(comp: ComponentMeta) {
    if (isSelected(comp.id)) {
      onChange(selected.filter(s => s.meta.id !== comp.id))
      // Remove link da seção se estava linkado
      onSectionsChange(sections.map(s =>
        s.componentId === comp.id ? { ...s, fromLibrary: false, componentId: undefined } : s
      ))
    } else {
      const position = selected.length
      const newSelected: SelectedComponent = { meta: comp, position }
      onChange([...selected, newSelected])

      // Auto-link à seção compatível (por categoria)
      const categoryLower = comp.category.toLowerCase()
      const matchSection = sections.find(s =>
        !s.fromLibrary &&
        (s.type === categoryLower ||
         s.type.includes(categoryLower) ||
         categoryLower.includes(s.type))
      )
      if (matchSection) {
        onSectionsChange(sections.map(s =>
          s.id === matchSection.id
            ? { ...s, fromLibrary: true, componentId: comp.id }
            : s
        ))
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Banner informativo */}
      <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-xs text-ink-secondary flex items-start gap-2">
        <svg className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Este passo é opcional — pule se vai criar todos os componentes com Claude a partir do documento.
      </div>

      {/* Barra de busca + filtros */}
      <div className="space-y-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar componentes..."
          className={ui.inputBase}
        />
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
          {categories.map(cat => {
            const count = cat === 'Todos' ? availableComponents.length : (counts[cat] ?? 0)
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  'flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                  category === cat
                    ? 'bg-accent text-black border-accent'
                    : 'text-ink-secondary border-transparent hover:bg-raised hover:text-ink-primary',
                )}
              >
                {cat} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid de componentes */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-ink-muted">
          <svg className="w-10 h-10 mb-2 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/></svg>
          <p className="text-sm">
            {availableComponents.length === 0
              ? 'Nenhum componente na biblioteca ainda'
              : 'Nenhum resultado para esta busca'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
          {filtered.map(comp => {
            const sel = isSelected(comp.id)
            return (
              <button
                key={comp.id}
                onClick={() => toggleComponent(comp)}
                className={cn(
                  ui.cardBase,
                  'text-left overflow-hidden hover:border-accent/40 transition-all cursor-pointer relative',
                  sel && 'border-accent shadow-[0_0_0_1px_var(--accent)]',
                )}
              >
                {/* Thumbnail */}
                <div className="h-24 w-full flex-shrink-0 relative overflow-hidden">
                  {comp.screenshotUrl ? (
                    <img
                      src={comp.screenshotUrl}
                      alt={comp.name}
                      className="w-full h-full object-cover object-top transition-opacity group-hover:opacity-90"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
                      <svg className="w-8 h-8 opacity-20 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/></svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-xs font-semibold text-ink-primary leading-tight">{comp.name}</p>
                    {sel && (
                      <svg className="w-3.5 h-3.5 text-ok flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </div>
                  <span className={cn(ui.badgeBase, 'bg-raised text-ink-muted mt-1 text-[10px]')}>
                    {comp.category}
                  </span>
                  {comp.description && (
                    <p className="text-[11px] text-ink-muted mt-1.5 line-clamp-2 leading-relaxed">
                      {comp.description}
                    </p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
