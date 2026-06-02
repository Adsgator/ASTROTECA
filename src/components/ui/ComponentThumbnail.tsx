import { useEffect, useRef, useState } from 'react'

interface ComponentThumbnailProps {
  /** URL da página de preview: /preview/{id} */
  previewUrl?: string
  /** Screenshot estática (fallback quando previewUrl ausente) */
  screenshotUrl?: string
  /** Nome do componente (usado no alt e no placeholder) */
  name: string
  /** Categoria (usada para cor do placeholder) */
  category?: string
  /** Altura do container em px (o iframe é escalado internamente) */
  height?: number
  /** Largura do iframe virtual — o componente será renderizado nessa largura e escalado */
  virtualWidth?: number
}

const CATEGORY_COLORS: Record<string, [string, string]> = {
  Hero:         ['#6366f1', '#8b5cf6'],
  Header:       ['#3b82f6', '#60a5fa'],
  Navigation:   ['#3b82f6', '#60a5fa'],
  Features:     ['#10b981', '#34d399'],
  Services:     ['#14b8a6', '#2dd4bf'],
  Pricing:      ['#f59e0b', '#fbbf24'],
  Testimonials: ['#ec4899', '#f472b6'],
  Process:      ['#8b5cf6', '#a78bfa'],
  CTA:          ['#ef4444', '#f87171'],
  FAQ:          ['#6366f1', '#818cf8'],
  Stats:        ['#f59e0b', '#fbbf24'],
  Gallery:      ['#ec4899', '#f472b6'],
  Contact:      ['#10b981', '#34d399'],
  Footer:       ['#64748b', '#94a3b8'],
  About:        ['#0ea5e9', '#38bdf8'],
  Team:         ['#0ea5e9', '#38bdf8'],
  Trust:        ['#f59e0b', '#fbbf24'],
  UI:           ['#6366f1', '#8b5cf6'],
  Misc:         ['#64748b', '#94a3b8'],
  Other:        ['#64748b', '#94a3b8'],
}

export default function ComponentThumbnail({
  previewUrl,
  screenshotUrl,
  name,
  category = 'Other',
  height = 128,
  virtualWidth = 1280,
}: ComponentThumbnailProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [iframeError, setIframeError] = useState(false)

  // IntersectionObserver — só carrega o iframe quando o card entra na viewport
  useEffect(() => {
    if (!previewUrl || screenshotUrl) return
    const el = containerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { rootMargin: '200px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [previewUrl, screenshotUrl])

  const [g1, g2] = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Other
  // Escala para caber no container: height / (height da página de preview esperado)
  // Usamos proporção container_width / virtualWidth
  const scale = containerRef.current
    ? containerRef.current.offsetWidth / virtualWidth
    : height / 900

  if (screenshotUrl) {
    return (
      <img
        src={screenshotUrl}
        alt={name}
        className="w-full h-full object-cover object-top"
        style={{ height }}
        loading="lazy"
      />
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden w-full flex-shrink-0"
      style={{ height }}
    >
      {/* Fundo gradiente sempre presente (visível enquanto carrega) */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(135deg, ${g1}14, ${g2}0a)` }}
      />

      {/* Wireframe placeholder visível enquanto não carregou */}
      {!iframeLoaded && !iframeError && (
        <div className="absolute inset-x-4 top-4 space-y-1.5 opacity-[0.07]">
          <div className="h-2 rounded-full bg-white w-3/4" />
          <div className="h-1.5 rounded-full bg-white w-full" />
          <div className="h-1.5 rounded-full bg-white w-5/6" />
          <div className="flex gap-1.5 mt-2">
            <div className="h-8 rounded bg-white w-1/3" />
            <div className="h-8 rounded bg-white w-1/3" />
            <div className="h-8 rounded bg-white w-1/3" />
          </div>
        </div>
      )}

      {/* Iframe lazy — só renderiza quando visível */}
      {previewUrl && visible && !iframeError && (
        <iframe
          src={previewUrl}
          title={`Preview ${name}`}
          scrolling="no"
          onLoad={() => setIframeLoaded(true)}
          onError={() => setIframeError(true)}
          style={{
            width: virtualWidth,
            height: virtualWidth * (height / (containerRef.current?.offsetWidth || virtualWidth)),
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            pointerEvents: 'none',
            border: 'none',
            opacity: iframeLoaded ? 1 : 0,
            transition: 'opacity 0.3s',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      )}
    </div>
  )
}
