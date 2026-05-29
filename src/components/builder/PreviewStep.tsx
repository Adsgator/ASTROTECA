// src/components/builder/PreviewStep.tsx

import type { SelectedComponent, ArtDirectionV2 } from '../../types'
import * as ui from '../../styles/ui'

interface PreviewStepProps {
  selected: SelectedComponent[]
  art: ArtDirectionV2
}

export default function PreviewStep({ selected, art }: PreviewStepProps) {
  function openFullPreview() {
    const ids = selected.map(s => s.meta.id).join(',')
    window.open(`/builder/preview-full?components=${ids}`, '_blank')
  }

  const swatches = [
    { color: art.colorPrimary, label: 'Primary' },
    { color: art.colorSecondary, label: 'Secondary' },
    { color: art.colorBackground, label: 'BG' },
    { color: art.colorText, label: 'Text' },
  ]

  return (
    <div className="space-y-3">
      {/* Barra superior */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink-primary">Preview da Página</span>
          <div className="flex gap-1.5">
            {swatches.map(s => (
              <div
                key={s.label}
                className="w-4 h-4 rounded-full border border-white/10"
                style={{ background: s.color }}
                title={`${s.label}: ${s.color}`}
              />
            ))}
          </div>
        </div>
        <button onClick={openFullPreview} className={ui.btnOutline + ' text-xs'}>
          ↗ Abrir em Nova Aba
        </button>
      </div>

      {/* Container principal */}
      <div className="rounded-xl bg-white overflow-hidden border border-white/10 max-h-[calc(100vh-14rem)] overflow-y-auto">
        {selected.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-8" style={{ background: art.colorBackground }}>
            <span className="text-4xl mb-3">👁️</span>
            <p className="text-sm font-medium" style={{ color: art.colorText }}>
              Nenhum componente selecionado
            </p>
            <p className="text-xs mt-1" style={{ color: art.colorTextSoft }}>
              Volte ao passo anterior e selecione componentes da biblioteca
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {selected
              .sort((a, b) => a.position - b.position)
              .map(s => (
                <iframe
                  key={s.meta.id}
                  src={s.meta.previewUrl ?? s.meta.previewPath ?? `/preview/${s.meta.id}`}
                  className="w-full border-0"
                  style={{ height: 400 }}
                  title={s.meta.name}
                  loading="lazy"
                />
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
