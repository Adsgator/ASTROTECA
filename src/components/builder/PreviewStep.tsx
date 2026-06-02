// src/components/builder/PreviewStep.tsx

import { useState } from 'react'
import type { SelectedComponent, ArtDirectionV2, PageSection } from '../../types'
import * as ui from '../../styles/ui'
import { cn } from '../../lib/utils'
import { Check, Monitor, Smartphone, Eye } from 'lucide-react'

interface PreviewStepProps {
  selected: SelectedComponent[]
  art: ArtDirectionV2
  sections?: PageSection[]
}

export default function PreviewStep({ selected, art, sections = [] }: PreviewStepProps) {
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop')

  const enabledSections = sections.filter(s => s.enabled).sort((a, b) => a.position - b.position)

  // Componentes ordenados por posição
  const sortedComponents = [...selected].sort((a, b) => a.position - b.position)

  // Monta URL do preview com art direction (light + dark) como query params
  function buildPreviewUrl(compId: string): string {
    const params = new URLSearchParams({
      primary: art.colorPrimary,
      secondary: art.colorSecondary,
      bg: art.colorBackground,
      surface: art.colorSurface,
      text: art.colorText,
      fontHeading: art.fontHeading,
      fontBody: art.fontBody,
      // dark mode
      darkBg: art.darkColorBackground || '',
      darkSurface: art.darkColorSurface || '',
      darkText: art.darkColorText || '',
      darkTextSoft: art.darkColorTextSoft || '',
      darkBorder: art.darkColorBorder || '',
      defaultTheme: art.defaultTheme || 'light',
    })
    return `/preview/${compId}?${params.toString()}`
  }

  const swatches = [
    { color: art.colorPrimary, label: 'Primary' },
    { color: art.colorSecondary, label: 'Secondary' },
    { color: art.colorBackground, label: 'BG' },
    { color: art.colorText, label: 'Text' },
  ]

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Barra superior */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-sm font-semibold text-ink-primary">Preview</span>
          <div className="flex gap-1.5">
            {swatches.map(s => s.color && (
              <div
                key={s.label}
                className="w-4 h-4 rounded-full border border-white/10 flex-shrink-0"
                style={{ background: s.color }}
                title={`${s.label}: ${s.color}`}
              />
            ))}
          </div>
          {art.fontHeading && (
            <span className="text-[10px] text-ink-muted bg-raised px-1.5 py-0.5 rounded">
              {art.fontHeading}
            </span>
          )}
        </div>

        {/* Toggle viewport */}
        <div className="flex items-center gap-1 bg-raised/50 rounded-lg p-0.5 border border-white/5">
          <button
            onClick={() => setViewport('desktop')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all',
              viewport === 'desktop' ? ui.tabActive : ui.tabInactive,
            )}
          >
            <Monitor className="w-3.5 h-3.5" />
            Desktop
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all',
              viewport === 'mobile' ? ui.tabActive : ui.tabInactive,
            )}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Mobile
          </button>
        </div>
      </div>

      {/* Container de preview */}
      <div className="flex-1 min-h-0 flex gap-4">
        {/* Área de iframes */}
        <div
          className={cn(
            'flex-1 rounded-xl overflow-hidden border border-white/10 overflow-y-auto transition-all bg-white',
            viewport === 'mobile' && 'max-w-[390px] mx-auto',
          )}
        >
          {sortedComponents.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-24 text-center px-8"
              style={{ background: art.colorBackground || '#fff' }}
            >
              <Eye className="w-10 h-10 mb-3 opacity-20" style={{ color: art.colorText || '#333' }} />
              <p className="text-sm font-medium" style={{ color: art.colorText || '#333' }}>
                Nenhum componente selecionado
              </p>
              <p className="text-xs mt-1" style={{ color: art.colorTextSoft || '#666' }}>
                Volte ao passo anterior e selecione componentes da biblioteca
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {sortedComponents.map(s => (
                <iframe
                  key={s.meta.id}
                  src={buildPreviewUrl(s.meta.id)}
                  className="w-full border-0 border-b border-black/5"
                  style={{ height: viewport === 'mobile' ? 500 : 420 }}
                  title={s.meta.name}
                  loading="lazy"
                />
              ))}
            </div>
          )}
        </div>

        {/* Painel lateral: seções e componentes */}
        {(enabledSections.length > 0 || sortedComponents.length > 0) && (
          <div className="w-52 flex-shrink-0 flex flex-col gap-3 overflow-y-auto">
            {sortedComponents.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-widest mb-2">Componentes</p>
                <div className="space-y-1">
                  {sortedComponents.map((s, i) => (
                    <div key={s.meta.id} className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-raised/40 border border-white/5">
                      <span className="w-4 h-4 rounded-full bg-accent/20 text-accent text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-ink-primary truncate">{s.meta.name}</p>
                        <p className="text-[10px] text-ink-muted">{s.meta.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {enabledSections.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-widest mb-2">Seções</p>
                <div className="space-y-1">
                  {enabledSections.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-raised/30 border border-white/5">
                      <span className="text-[10px] text-ink-muted w-3 text-right flex-shrink-0">{i + 1}</span>
                      <p className="text-[11px] text-ink-secondary truncate">{s.label}</p>
                      {s.fromLibrary && <Check className="w-3 h-3 text-ok flex-shrink-0 ml-auto" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
