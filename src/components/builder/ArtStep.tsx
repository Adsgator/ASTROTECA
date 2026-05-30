// src/components/builder/ArtStep.tsx

import { useState, useEffect } from 'react'
import type { ArtDirectionV2 } from '../../types'
import { generateDarkPalette } from '../../lib/color-utils'
import * as ui from '../../styles/ui'
import { cn } from '../../lib/utils'

interface ArtStepProps {
  art: ArtDirectionV2
  onChange: (art: ArtDirectionV2) => void
  nomeCliente?: string
  studioName?: string
}

const PALETTE_PRESETS = [
  { label: 'Médico', colors: { colorPrimary: '#2d6a4f', colorSecondary: '#52b788', colorBackground: '#ffffff', colorSurface: '#f0fdf4' } },
  { label: 'Advocacia', colors: { colorPrimary: '#1e3a5f', colorSecondary: '#c9a961', colorBackground: '#ffffff', colorSurface: '#f8f6f0' } },
  { label: 'Estética', colors: { colorPrimary: '#be185d', colorSecondary: '#f9a8d4', colorBackground: '#ffffff', colorSurface: '#fdf2f8' } },
  { label: 'Tech', colors: { colorPrimary: '#6366f1', colorSecondary: '#06b6d4', colorBackground: '#ffffff', colorSurface: '#f1f5f9' } },
  { label: 'Alimentação', colors: { colorPrimary: '#c2410c', colorSecondary: '#fb923c', colorBackground: '#ffffff', colorSurface: '#fff7ed' } },
  { label: 'Luxo', colors: { colorPrimary: '#1c1917', colorSecondary: '#d4af37', colorBackground: '#0a0a0a', colorSurface: '#1c1917' } },
]

function ColorSwatch({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5 min-w-0">
      <label className="block text-[10px] font-medium text-ink-secondary truncate uppercase tracking-wide">{label}</label>
      <div className="flex items-center gap-1.5 min-w-0">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-9 h-9 rounded-lg border border-white/10 bg-transparent cursor-pointer p-0.5 flex-shrink-0"
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className={cn(ui.inputBase, 'text-xs py-1.5 min-w-0')}
          placeholder="#000000"
        />
      </div>
    </div>
  )
}

function FontPreview({ font }: { font: string }) {
  const [loaded, setLoaded] = useState(false)
  const encoded = font.replace(/\s+/g, '+')

  useEffect(() => {
    if (!font.trim()) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;700&display=swap`
    link.onload = () => setLoaded(true)
    document.head.appendChild(link)
    return () => { document.head.removeChild(link) }
  }, [font])

  if (!font.trim() || !loaded) return null

  return (
    <div style={{ fontFamily: `"${font}", serif` }} className="mt-2 p-3 bg-raised rounded-lg border border-white/5">
      <p className="text-base font-bold text-ink-primary">Aa Bb Cc — {font}</p>
      <p className="text-xs text-ink-secondary mt-1">O rápido salto do gato preguiçoso sobre a cerca velha.</p>
    </div>
  )
}

// Mini-preview de landing page com as cores aplicadas
function ColorPreview({ art, nomeCliente }: { art: ArtDirectionV2; nomeCliente: string }) {
  const isDark = art.defaultTheme === 'dark'
  const bg = isDark ? art.darkColorBackground || '#111827' : art.colorBackground
  const surface = isDark ? art.darkColorSurface || '#1f2937' : art.colorSurface
  const text = isDark ? art.darkColorText || '#f9fafb' : art.colorText
  const textSoft = isDark ? art.darkColorTextSoft || '#d1d5db' : art.colorTextSoft
  const border = isDark ? art.darkColorBorder || '#374151' : art.colorBorder

  return (
    <div
      className="rounded-xl overflow-hidden border border-white/10 shadow-lg"
      style={{ background: bg, color: text, fontFamily: art.fontBody ? `"${art.fontBody}", sans-serif` : undefined }}
    >
      {/* Header */}
      <div style={{ background: surface, borderBottom: `1px solid ${border}` }} className="px-4 py-2.5 flex items-center justify-between">
        <span style={{ fontFamily: art.fontHeading ? `"${art.fontHeading}", serif` : undefined, color: text }} className="text-sm font-bold">
          {nomeCliente || 'Marca'}
        </span>
        <div
          className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{ background: art.colorPrimary, color: '#fff' }}
        >
          Contato
        </div>
      </div>
      {/* Hero */}
      <div style={{ background: art.colorDark || '#1a1a2e', padding: '20px 16px' }}>
        <div style={{ fontFamily: art.fontHeading ? `"${art.fontHeading}", serif` : undefined, color: '#fff', fontSize: 18, fontWeight: 700, lineHeight: 1.2, marginBottom: 8 }}>
          Título Principal da Página
        </div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginBottom: 12 }}>
          Subtítulo descritivo do serviço ou proposta de valor.
        </div>
        <div className="flex gap-2">
          <div className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: art.colorPrimary, color: '#fff' }}>
            CTA Principal
          </div>
          <div className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: 'transparent', color: '#fff', border: `1px solid rgba(255,255,255,0.3)` }}>
            Saiba Mais
          </div>
        </div>
      </div>
      {/* Seção clara */}
      <div style={{ background: bg, padding: '12px 16px', borderTop: `1px solid ${border}` }}>
        <div style={{ color: art.colorPrimary, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
          Serviços
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: surface, borderRadius: 8, padding: '8px', border: `1px solid ${border}` }}>
              <div style={{ background: art.colorPrimary, width: 20, height: 20, borderRadius: 4, marginBottom: 6 }} />
              <div style={{ color: text, fontSize: 10, fontWeight: 600, marginBottom: 3 }}>Serviço {i}</div>
              <div style={{ color: textSoft, fontSize: 9 }}>Descrição breve aqui.</div>
            </div>
          ))}
        </div>
      </div>
      {/* Footer */}
      <div style={{ background: surface, borderTop: `1px solid ${border}`, padding: '8px 16px' }}>
        <div style={{ color: textSoft, fontSize: 9, textAlign: 'center' }}>
          © {new Date().getFullYear()} {nomeCliente || 'Marca'} — Todos os direitos reservados
        </div>
      </div>
    </div>
  )
}

export default function ArtStep({ art, onChange, nomeCliente = 'Cliente', studioName = 'Astroteca' }: ArtStepProps) {
  const [darkExpanded, setDarkExpanded] = useState(false)
  const [shared, setShared] = useState(false)
  const [showPreview, setShowPreview] = useState(true)

  function shareArtDirection() {
    const payload = { ...art, nomeCliente, studioName }
    const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
    const url = `${window.location.origin}/art-direction?data=${base64}`
    navigator.clipboard.writeText(url).then(() => {
      setShared(true)
      setTimeout(() => setShared(false), 2500)
    })
  }

  function patch(partial: Partial<ArtDirectionV2>) {
    onChange({ ...art, ...partial })
  }

  function applyPreset(preset: typeof PALETTE_PRESETS[0]) {
    patch(preset.colors)
  }

  function generateDark() {
    const dark = generateDarkPalette({
      colorBackground: art.colorBackground,
      colorSurface: art.colorSurface,
      colorSurfaceAlt: art.colorSurfaceAlt,
      colorText: art.colorText,
      colorTextSoft: art.colorTextSoft,
      colorTextMuted: art.colorTextMuted,
      colorBorder: art.colorBorder,
    })
    patch(dark)
    setDarkExpanded(true)
  }

  return (
    <div className="grid grid-cols-[1fr_320px] gap-5 h-full">
      {/* Coluna esquerda: controles */}
      <div className="space-y-5 overflow-y-auto min-h-0">
      {/* Presets */}
      <div>
        <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-2">Presets de Paleta</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {PALETTE_PRESETS.map(preset => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              className={cn(
                ui.cardBase,
                'flex-shrink-0 p-3 flex flex-col items-center gap-2 hover:border-accent/40 transition-all cursor-pointer',
                art.palettePreset === preset.label && 'border-accent',
              )}
              style={{ minWidth: 100 }}
            >
              <div className="flex gap-1">
                {Object.values(preset.colors).map((c, i) => (
                  <div key={i} className="w-4 h-4 rounded-full border border-white/10" style={{ background: c }} />
                ))}
              </div>
              <span className="text-[11px] text-ink-secondary">{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tema padrão */}
      <div>
        <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-2">Tema Padrão</p>
        <div className="grid grid-cols-2 gap-2">
          {(['light', 'dark'] as const).map(theme => (
            <button
              key={theme}
              onClick={() => patch({ defaultTheme: theme })}
              className={cn(
                ui.cardBase,
                'p-3 text-left transition-all',
                art.defaultTheme === theme ? 'border-accent bg-accent/5' : 'hover:border-white/10',
              )}
            >
              <div className="text-accent">
                {theme === 'light' ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                )}
              </div>
              <p className="text-xs font-semibold text-ink-primary mt-1">
                {theme === 'light' ? 'Tema Claro' : 'Tema Escuro'}
              </p>
              <p className="text-[10px] text-ink-muted">
                {theme === 'light' ? 'Fundo branco, texto escuro' : 'Fundo escuro, texto claro'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Cores Light */}
      <div className={ui.cardBase + ' p-4'}>
        <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-3">Cores Light</p>
        <div className="grid grid-cols-3 gap-3">
          <ColorSwatch label="Primary" value={art.colorPrimary} onChange={v => patch({ colorPrimary: v })} />
          <ColorSwatch label="Primary Dark" value={art.colorPrimaryDark} onChange={v => patch({ colorPrimaryDark: v })} />
          <ColorSwatch label="Secondary" value={art.colorSecondary} onChange={v => patch({ colorSecondary: v })} />
          <ColorSwatch label="Background" value={art.colorBackground} onChange={v => patch({ colorBackground: v })} />
          <ColorSwatch label="Surface" value={art.colorSurface} onChange={v => patch({ colorSurface: v })} />
          <ColorSwatch label="Surface Alt" value={art.colorSurfaceAlt} onChange={v => patch({ colorSurfaceAlt: v })} />
          <ColorSwatch label="Dark (seções escuras)" value={art.colorDark} onChange={v => patch({ colorDark: v })} />
          <ColorSwatch label="Text" value={art.colorText} onChange={v => patch({ colorText: v })} />
          <ColorSwatch label="Text Soft" value={art.colorTextSoft} onChange={v => patch({ colorTextSoft: v })} />
          <ColorSwatch label="Text Muted" value={art.colorTextMuted} onChange={v => patch({ colorTextMuted: v })} />
          <ColorSwatch label="Border" value={art.colorBorder} onChange={v => patch({ colorBorder: v })} />
        </div>
      </div>

      {/* Cores Dark */}
      <div className={ui.cardBase + ' overflow-hidden'}>
        <div
          onClick={() => setDarkExpanded(v => !v)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-raised/30 transition-colors cursor-pointer"
        >
          <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
            Cores Dark
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); generateDark() }}
              className={cn(ui.btnGhost, 'text-[11px] py-1 px-2')}
            >
              Gerar do Light
            </button>
            <svg className="w-3.5 h-3.5 text-ink-muted transition-transform" style={{ transform: darkExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>

        {darkExpanded && (
          <div className="p-4 pt-0 border-t border-white/[0.06]">
            <div className="grid grid-cols-3 gap-3 mt-3">
              <ColorSwatch label="Dark BG" value={art.darkColorBackground} onChange={v => patch({ darkColorBackground: v })} />
              <ColorSwatch label="Dark Surface" value={art.darkColorSurface} onChange={v => patch({ darkColorSurface: v })} />
              <ColorSwatch label="Dark Surface Alt" value={art.darkColorSurfaceAlt} onChange={v => patch({ darkColorSurfaceAlt: v })} />
              <ColorSwatch label="Dark Text" value={art.darkColorText} onChange={v => patch({ darkColorText: v })} />
              <ColorSwatch label="Dark Text Soft" value={art.darkColorTextSoft} onChange={v => patch({ darkColorTextSoft: v })} />
              <ColorSwatch label="Dark Text Muted" value={art.darkColorTextMuted} onChange={v => patch({ darkColorTextMuted: v })} />
              <ColorSwatch label="Dark Border" value={art.darkColorBorder} onChange={v => patch({ darkColorBorder: v })} />
            </div>
          </div>
        )}
      </div>

      {/* Tipografia */}
      <div className={ui.cardBase + ' p-4'}>
        <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-3">Tipografia</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1.5 uppercase tracking-wider">
              Fonte Heading (font-serif)
            </label>
            <input
              type="text"
              value={art.fontHeading}
              onChange={e => patch({ fontHeading: e.target.value })}
              className={ui.inputBase}
              placeholder="Playfair Display"
            />
            <FontPreview font={art.fontHeading} />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1.5 uppercase tracking-wider">
              Fonte Body (font-sans)
            </label>
            <input
              type="text"
              value={art.fontBody}
              onChange={e => patch({ fontBody: e.target.value })}
              className={ui.inputBase}
              placeholder="Inter"
            />
            <FontPreview font={art.fontBody} />
          </div>
        </div>
      </div>

      {/* Mood */}
      <div className={ui.cardBase + ' p-4'}>
        <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-3">Mood & Referências</p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1.5">Mood / Sensação</label>
            <textarea
              value={art.mood}
              onChange={e => patch({ mood: e.target.value })}
              className={cn(ui.inputBase, 'resize-none')}
              rows={2}
              placeholder="Clean, minimalista, transmite confiança e profissionalismo"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1.5">Referências Visuais</label>
            <textarea
              value={art.references}
              onChange={e => patch({ references: e.target.value })}
              className={cn(ui.inputBase, 'resize-none')}
              rows={2}
              placeholder="URLs de sites de referência, marcas admiradas..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1.5">Notas Adicionais</label>
            <textarea
              value={art.notes}
              onChange={e => patch({ notes: e.target.value })}
              className={cn(ui.inputBase, 'resize-none')}
              rows={2}
              placeholder="Qualquer instrução extra para o Claude..."
            />
          </div>
        </div>
      </div>

      {/* Compartilhar */}
      <div className="flex justify-end">
        <button
          onClick={shareArtDirection}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all',
            shared
              ? 'bg-ok/20 text-ok border border-ok/30'
              : 'bg-white/5 text-ink-secondary border border-white/10 hover:border-accent/40 hover:text-ink-primary'
          )}
        >
          {shared ? (
            <><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>Link copiado!</>
          ) : (
            <><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>Compartilhar Direção de Arte</>
          )}
        </button>
      </div>
      </div>{/* fim coluna esquerda */}

      {/* Coluna direita: preview ao vivo */}
      <div className="flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-widest">Preview ao Vivo</p>
          <button
            onClick={() => setShowPreview(v => !v)}
            className="text-[10px] text-ink-muted hover:text-ink-primary transition-colors"
          >
            {showPreview ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
        {showPreview && (
          <div className="flex-1 overflow-y-auto">
            <ColorPreview art={art} nomeCliente={nomeCliente} />
            <div className="mt-3 flex gap-1.5 flex-wrap">
              {[
                { label: 'Primary', color: art.colorPrimary },
                { label: 'Secondary', color: art.colorSecondary },
                { label: 'BG', color: art.colorBackground },
                { label: 'Surface', color: art.colorSurface },
                { label: 'Text', color: art.colorText },
                { label: 'Dark BG', color: art.darkColorBackground },
              ].map(({ label, color }) => color && (
                <div key={label} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-raised/50 border border-white/5">
                  <div className="w-3 h-3 rounded-sm border border-white/10 flex-shrink-0" style={{ background: color }} />
                  <span className="text-[10px] text-ink-muted">{label}</span>
                  <span className="text-[10px] text-ink-secondary font-mono">{color}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
