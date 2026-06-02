// src/components/builder/ComponentsStep.tsx

import { useState } from 'react'
import type { ComponentMeta, SelectedComponent, PageSection } from '../../types'
import * as ui from '../../styles/ui'
import { cn } from '../../lib/utils'
import ComponentThumbnail from '../ui/ComponentThumbnail'
import { Check, Info, AlertTriangle, LayoutGrid, MinusCircle } from 'lucide-react'

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

  const enabledSections = sections.filter(s => s.enabled).sort((a, b) => a.position - b.position)
  const coveredCount = enabledSections.filter(s => s.fromLibrary && s.componentId).length

  return (
    <div className="space-y-4">
      {/* Banner informativo */}
      <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-xs text-ink-secondary flex items-start gap-2">
        <Info className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
        Este passo é opcional — pule se vai criar todos os componentes com Claude a partir do documento.
      </div>

      {/* Cobertura de seções */}
      {enabledSections.length > 0 && (
        <div className={cn(ui.cardBase, 'p-4')}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">Cobertura de Seções</p>
            <span className="text-xs text-ink-muted">{coveredCount}/{enabledSections.length} cobertas</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {enabledSections.map(s => {
              const covered = s.fromLibrary && s.componentId
              return (
                <div
                  key={s.id}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium border',
                    covered
                      ? 'bg-ok/10 border-ok/20 text-ok'
                      : 'bg-raised border-white/5 text-ink-muted',
                  )}
                >
                  {covered ? <Check className="w-3 h-3" /> : <MinusCircle className="w-3 h-3" />}
                  {s.label}
                </div>
              )
            })}
          </div>

          {/* Aviso de seções sem componente */}
          {enabledSections.filter(s => !(s.fromLibrary && s.componentId)).length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/[0.06]">
              <p className="text-[10px] text-amber-500 font-medium mb-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                Seções sem componente vinculado — serão criadas pelo Claude Code:
              </p>
              <p className="text-[10px] text-ink-muted">
                {enabledSections
                  .filter(s => !(s.fromLibrary && s.componentId))
                  .map(s => s.label)
                  .join(' · ')}
              </p>
            </div>
          )}
        </div>
      )}

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
          <LayoutGrid className="w-10 h-10 mb-2 opacity-30" />
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
                <ComponentThumbnail
                  previewUrl={comp.previewUrl || comp.previewPath}
                  screenshotUrl={comp.screenshotUrl}
                  name={comp.name}
                  category={comp.category}
                  height={96}
                />

                {/* Info */}
                <div className="p-3">
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-xs font-semibold text-ink-primary leading-tight">{comp.name}</p>
                    {sel && <Check className="w-3.5 h-3.5 text-ok flex-shrink-0" />}
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
