import { useState, useMemo, useEffect } from 'react'
import type { ComponentMeta, SelectedComponent } from '../types'
import * as ui from '../styles/ui'

interface Props {
  initialComponents: ComponentMeta[]
  registryUrl: string
  initialError: string
}

/* Count-up animation hook for stats */
function useCountUp(target: number, duration = 600) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let startTime: number
    function step(ts: number) {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      setValue(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return value
}

/* Gradient palettes per category for rich visual thumbnails */
const CATEGORY_GRADIENTS: Record<string, [string, string]> = {
  Hero: ['#6366f1', '#a855f7'],
  Features: ['#3b82f6', '#06b6d4'],
  Testimonials: ['#f59e0b', '#ef4444'],
  Pricing: ['#10b981', '#059669'],
  CTA: ['#f43f5e', '#ec4899'],
  FAQ: ['#8b5cf6', '#6366f1'],
  Contact: ['#14b8a6', '#0ea5e9'],
  Footer: ['#64748b', '#475569'],
}

function getCategoryGradient(cat: string): [string, string] {
  return CATEGORY_GRADIENTS[cat] || ['#6366f1', '#8b5cf6']
}

/* Category icons as simple SVG paths */
const CATEGORY_ICONS: Record<string, string> = {
  Hero: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z',
  Features: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  Testimonials: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
  Pricing: 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  CTA: 'M22 11.08V12a10 10 0 11-5.93-9.14',
  FAQ: 'M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01',
  Contact: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6',
  Footer: 'M3 18h18M3 12h18M3 6h18',
}

export default function ComponentBrowser({ initialComponents, registryUrl, initialError }: Props) {
  const [components, setComponents] = useState<ComponentMeta[]>(initialComponents)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [error, setError] = useState(initialError)
  const [loading, setLoading] = useState(false)
  const [addedId, setAddedId] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState(false)

  // Count-up animations for stats
  const totalCount = useCountUp(components.length, 600)
  const categoriesCount = useMemo(() => [...new Set(components.map(c => c.category))], [components])
  const categoriesCountUp = useCountUp(categoriesCount.length, 600)

  function normalizeComponents(list: ComponentMeta[]): ComponentMeta[] {
    return list.map(c => ({
      ...c,
      previewUrl: c.previewUrl || (c.previewPath ? c.previewPath : undefined),
    }))
  }

  useEffect(() => {
    if (initialComponents.length === 0 && !initialError) {
      setComponents(getFallbackRegistry())
    } else if (initialComponents.length > 0) {
      setComponents(normalizeComponents(initialComponents))
    }
  }, [initialComponents.length, initialError])

  function getFallbackRegistry(): ComponentMeta[] {
    const now = new Date().toISOString()
    return [
      {
        id: 'hero-split',
        name: 'Hero Split',
        category: 'Hero',
        description: 'Hero com imagem ao lado. Ideal para servicos com foto do profissional ou produto em destaque.',
        previewUrl: '/preview/hero-split',
        screenshotUrl: '',
        codeUrl: 'Hero/HeroSplit.astro',
        tags: ['hero', 'split', 'acima-da-dobra'],
        props: [{ name: 'title', type: 'string', required: true, previewValue: 'Título' }],
        bestFor: ['servicos'],
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'hero-centered',
        name: 'Hero Centered',
        category: 'Hero',
        description: 'Hero centralizado com call to action em destaque. Ideal para produtos e SaaS.',
        previewUrl: '/preview/hero-centered',
        screenshotUrl: '',
        codeUrl: 'Hero/HeroCentered.astro',
        tags: ['hero', 'acima-da-dobra'],
        props: [{ name: 'title', type: 'string', required: true, previewValue: 'Título' }],
        bestFor: ['saas', 'produtos'],
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'features-grid-3',
        name: 'Features Grid 3',
        category: 'Features',
        description: '3 diferenciais em grid. Cada card com icone, titulo e descricao.',
        previewUrl: '/preview/features-grid-3',
        screenshotUrl: '',
        codeUrl: 'Features/FeaturesGrid3.astro',
        tags: ['features', 'diferenciais'],
        props: [{ name: 'title', type: 'string', required: true, previewValue: 'Título' }],
        bestFor: ['qualquer'],
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'testimonials-cards',
        name: 'Testimonials Cards',
        category: 'Testimonials',
        description: 'Depoimentos em cards com foto, quote e informacoes de contato.',
        previewUrl: '/preview/testimonials-cards',
        screenshotUrl: '',
        codeUrl: 'Testimonials/TestimonialsCards.astro',
        tags: ['testimonials', 'depoimentos'],
        props: [{ name: 'title', type: 'string', required: true, previewValue: 'Título' }],
        bestFor: ['social'],
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'pricing-cards',
        name: 'Pricing Cards',
        category: 'Pricing',
        description: 'Tabela de precos em cards. Destaque para plano recomendado.',
        previewUrl: '/preview/pricing-cards',
        screenshotUrl: '',
        codeUrl: 'Pricing/PricingCards.astro',
        tags: ['pricing', 'precos'],
        props: [{ name: 'title', type: 'string', required: true, previewValue: 'Título' }],
        bestFor: ['precos'],
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'cta-banner',
        name: 'CTA Banner',
        category: 'CTA',
        description: 'Banner de call-to-action final com headline, subheadline e botao.',
        previewUrl: '/preview/cta-banner',
        screenshotUrl: '',
        codeUrl: 'CTA/CTABanner.astro',
        tags: ['cta', 'call-to-action'],
        props: [{ name: 'title', type: 'string', required: true, previewValue: 'Título' }],
        bestFor: ['todos'],
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'faq-accordion',
        name: 'FAQ Accordion',
        category: 'FAQ',
        description: 'Perguntas frequentes em accordion. Melhora SEO e converte objecoes.',
        previewUrl: '/preview/faq-accordion',
        screenshotUrl: '',
        codeUrl: 'FAQ/FAQAccordion.astro',
        tags: ['faq', 'perguntas'],
        props: [{ name: 'title', type: 'string', required: true, previewValue: 'Título' }],
        bestFor: ['todos'],
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'contact-section',
        name: 'Contact Section',
        category: 'Contact',
        description: 'Secao de contato com formulario e informacoes de contato.',
        previewUrl: '/preview/contact-section',
        screenshotUrl: '',
        codeUrl: 'Contact/ContactSection.astro',
        tags: ['contact', 'contato'],
        props: [{ name: 'title', type: 'string', required: true, previewValue: 'Título' }],
        bestFor: ['todos'],
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'footer-simples',
        name: 'Footer Simples',
        category: 'Footer',
        description: 'Rodape com logo, links rapidos, redes sociais e copyright.',
        previewUrl: '/preview/footer-simples',
        screenshotUrl: '',
        codeUrl: 'Footer/FooterSimples.astro',
        tags: ['footer', 'rodape'],
        props: [{ name: 'title', type: 'string', required: true, previewValue: 'Título' }],
        bestFor: ['todos'],
        createdAt: now,
        updatedAt: now
      },
    ]
  }

  const categories = useMemo(() => {
    const cats = new Set<string>()
    components.forEach(c => cats.add(c.category))
    return Array.from(cats).sort()
  }, [components])

  const filtered = useMemo(() => {
    return components.filter(c => {
      const matchSearch = search === '' ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase()) ||
        c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      const matchCategory = !activeCategory || c.category === activeCategory
      return matchSearch && matchCategory
    })
  }, [components, search, activeCategory])

  const selected = useMemo(() => {
    return components.find(c => c.id === selectedId) || null
  }, [components, selectedId])

  useEffect(() => {
    setPreviewError(false)
  }, [selected?.id])

  function addToBuilder(meta: ComponentMeta) {
    const raw = localStorage.getItem('acs-builder-components')
    const list: SelectedComponent[] = raw ? JSON.parse(raw) : []
    if (list.some(s => s.meta.id === meta.id)) return
    list.push({ meta, position: list.length + 1 })
    localStorage.setItem('acs-builder-components', JSON.stringify(list))
    setAddedId(meta.id)
    setTimeout(() => setAddedId(null), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight text-ink-primary">
            Biblioteca
          </h1>
          <p className="text-sm text-ink-secondary mt-1">
            Explore e adicione componentes ao seu projeto
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-6 px-5 py-2.5 rounded-xl border border-white/[0.06] bg-surface/60 backdrop-blur-xl">
            <div className="text-center">
              <div className="text-lg font-bold text-ink-primary leading-none">{totalCount}</div>
              <div className="text-[10px] text-ink-muted uppercase tracking-wider mt-0.5">Total</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className="text-lg font-bold text-accent leading-none">{categoriesCountUp}</div>
              <div className="text-[10px] text-ink-muted uppercase tracking-wider mt-0.5">Categorias</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className="text-lg font-bold text-ink-primary leading-none">{filtered.length}</div>
              <div className="text-[10px] text-ink-muted uppercase tracking-wider mt-0.5">Visíveis</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Search & Filters ── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input
            type="text"
            className="w-full rounded-xl border border-white/[0.06] bg-surface/60 backdrop-blur-xl pl-10 pr-4 py-2.5 text-sm text-ink-primary placeholder-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all"
            placeholder="Buscar por nome, tag ou descricao..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              !activeCategory
                ? 'bg-accent text-black shadow-[0_2px_8px_rgba(240,165,0,0.25)]'
                : 'text-ink-secondary hover:bg-raised hover:text-ink-primary'
            }`}
            onClick={() => setActiveCategory(null)}
          >
            Todos
          </button>
          {categories.map(cat => {
            const [c1] = getCategoryGradient(cat)
            return (
              <button
                key={cat}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeCategory === cat
                    ? 'bg-accent text-black shadow-[0_2px_8px_rgba(240,165,0,0.25)]'
                    : 'text-ink-secondary hover:bg-raised hover:text-ink-primary'
                }`}
                onClick={() => setActiveCategory(cat)}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: c1 }} />
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Loading / Error ── */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-ink-secondary">
          <svg className="animate-spin w-5 h-5 mr-3 text-accent" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" /><path d="M12 2a10 10 0 019.8 7.8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
          Carregando componentes...
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-fail/20 bg-fail/5 text-fail text-sm">
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
          {error}
        </div>
      )}

      {/* ── Main Content: Grid + Detail ── */}
      {!loading && !error && (
        <div className="grid grid-cols-[1fr_380px] gap-6 min-h-[calc(100vh-14rem)]">
          {/* Component Grid */}
          <div className="flex flex-col gap-3 overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-ink-muted">
                <svg className="w-12 h-12 mb-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                <p className="text-sm">Nenhum componente encontrado</p>
              </div>
            ) : (
              <div className="stagger grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
                {filtered.map(c => {
                  const [g1, g2] = getCategoryGradient(c.category)
                  const isSelected = selectedId === c.id
                  const iconPath = CATEGORY_ICONS[c.category] || CATEGORY_ICONS.Features
                  return (
                    <div
                      key={c.id}
                      className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 hover-lift ${
                        isSelected
                          ? 'border-accent shadow-[0_0_0_1px_rgba(240,165,0,0.5),0_0_20px_rgba(240,165,0,0.1)]'
                          : 'border-white/[0.06] hover:border-white/[0.12] hover:shadow-lg'
                      } bg-surface/60 backdrop-blur-xl`}
                      onClick={() => setSelectedId(c.id)}
                    >
                      {/* Thumbnail */}
                      <div className="h-32 relative overflow-hidden">
                        <div
                          className="absolute inset-0 opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-300"
                          style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-300 animate-float"
                            style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
                          >
                            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d={iconPath} />
                            </svg>
                          </div>
                        </div>
                        {/* Wireframe lines for visual texture */}
                        <div className="absolute inset-x-4 top-5 space-y-1.5 opacity-[0.06]">
                          <div className="h-2 rounded-full bg-white w-3/4" />
                          <div className="h-1.5 rounded-full bg-white w-full" />
                          <div className="h-1.5 rounded-full bg-white w-5/6" />
                          <div className="flex gap-1.5 mt-2">
                            <div className="h-8 rounded bg-white w-1/3" />
                            <div className="h-8 rounded bg-white w-1/3" />
                            <div className="h-8 rounded bg-white w-1/3" />
                          </div>
                        </div>
                        {/* Category dot indicator */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: g1 }} />
                          <span className="text-[10px] font-medium text-white/70">{c.category}</span>
                        </div>
                      </div>
                      {/* Card body */}
                      <div className="p-3.5">
                        <div className="font-semibold text-sm text-ink-primary mb-1 group-hover:text-white transition-colors">{c.name}</div>
                        <div className="text-xs text-ink-secondary line-clamp-2 leading-relaxed mb-2.5">{c.description}</div>
                        <div className="flex flex-wrap gap-1">
                          {c.tags.slice(0, 3).map(t => (
                            <span key={t} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-raised/80 text-ink-secondary border border-white/[0.04]">{t}</span>
                          ))}
                        </div>
                      </div>
                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute top-3 left-3 w-5 h-5 rounded-full bg-accent flex items-center justify-center shadow-lg">
                          <svg className="w-3 h-3 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Detail Panel ── */}
          <div className={`flex flex-col gap-4 overflow-y-auto ${selected ? 'animate-slide-right' : ''}`}>
            {!selected ? (
              <div className="flex flex-col items-center justify-center h-full rounded-xl border border-dashed border-white/[0.08] text-ink-muted">
                <svg className="w-10 h-10 mb-3 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>
                <p className="text-sm">Clique em um componente</p>
                <p className="text-xs text-ink-muted/60 mt-0.5">para ver detalhes e preview</p>
              </div>
            ) : (
              <>
                {/* Preview area */}
                <div className="rounded-xl border border-white/[0.06] bg-surface/60 backdrop-blur-xl overflow-hidden">
                  {selected.previewUrl && !previewError ? (
                    <div className="relative group">
                      <a
                        href={selected.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 hover:bg-black/80 text-white rounded-lg p-1.5"
                        title="Ver em tela cheia"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                      </a>
                      <iframe
                        src={selected.previewUrl}
                        title={`Preview de ${selected.name}`}
                        className="w-full h-[260px] border-0"
                        loading="lazy"
                        onError={() => setPreviewError(true)}
                      />
                    </div>
                  ) : selected.previewUrl && previewError ? (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '260px',
                      color: '#555',
                      gap: '0.5rem',
                    }}>
                      <span style={{ fontSize: '2rem' }}>🧩</span>
                      <p style={{ fontSize: '0.875rem' }}>Preview não disponível</p>
                      <p style={{ fontSize: '0.75rem', color: '#444' }}>
                        Rode <code>npm run previews</code> para gerar
                      </p>
                    </div>
                  ) : (
                    <div className="h-[200px] relative overflow-hidden">
                      {(() => {
                        const [g1, g2] = getCategoryGradient(selected.category)
                        return (
                          <>
                            <div className="absolute inset-0 opacity-10" style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${g1}33, ${g2}33)` }}>
                                <svg className="w-8 h-8" style={{ color: g1 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d={CATEGORY_ICONS[selected.category] || CATEGORY_ICONS.Features} />
                                </svg>
                              </div>
                              <span className="text-xs text-ink-muted">Preview em breve</span>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  )}
                </div>

                {/* Component info */}
                <div className="rounded-xl border border-white/[0.06] bg-surface/60 backdrop-blur-xl p-5 space-y-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {(() => {
                          const [g1] = getCategoryGradient(selected.category)
                          return <span className="w-2.5 h-2.5 rounded-full" style={{ background: g1 }} />
                        })()}
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">{selected.category}</span>
                      </div>
                      <h2 className="text-xl font-bold text-ink-primary font-heading tracking-tight">{selected.name}</h2>
                      <p className="text-sm text-ink-secondary mt-1 leading-relaxed">{selected.description}</p>
                    </div>
                  </div>

                  <button
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      addedId === selected.id
                        ? 'bg-ok text-black shadow-[0_2px_12px_rgba(34,197,94,0.3)]'
                        : 'bg-gradient-to-r from-accent to-[#d4920a] text-black shadow-[0_2px_12px_rgba(240,165,0,0.25)] hover:shadow-[0_4px_20px_rgba(240,165,0,0.35)]'
                    }`}
                    onClick={() => addToBuilder(selected)}
                  >
                    {addedId === selected.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                        Adicionado ao Builder!
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                        Adicionar ao Builder
                      </span>
                    )}
                  </button>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {selected.tags.map(t => (
                      <span key={t} className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-raised/80 text-ink-secondary border border-white/[0.04]">{t}</span>
                    ))}
                  </div>

                  {/* Best for */}
                  <div className="pt-3 border-t border-white/[0.06]">
                    <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider mb-2">Melhor para</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.bestFor.map(b => (
                        <span key={b} className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-accent/[0.06] text-accent border border-accent/10">{b}</span>
                      ))}
                    </div>
                  </div>

                  {/* Props */}
                  {selected.props.length > 0 && (
                    <div className="pt-3 border-t border-white/[0.06]">
                      <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider mb-3">Propriedades</p>
                      <div className="space-y-2">
                        {selected.props.map(p => (
                          <div key={p.name} className="flex items-center gap-2 p-2 rounded-lg bg-raised/50">
                            <code className="text-xs font-mono text-accent bg-accent/[0.06] px-2 py-0.5 rounded">{p.name}</code>
                            <code className="text-[10px] font-mono text-ink-muted">{p.type}</code>
                            {p.required && <span className="text-[9px] font-bold text-fail uppercase">req</span>}
                            {p.description && <span className="text-[11px] text-ink-secondary ml-auto truncate max-w-[120px]">{p.description}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Copy fields */}
                  {selected.copy && Object.keys(selected.copy).length > 0 && (
                    <div className="pt-3 border-t border-white/[0.06]">
                      <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider mb-3">Textos editaveis</p>
                      <div className="space-y-2">
                        {Object.entries(selected.copy).map(([k, v]) => (
                          <div key={k} className="p-2 rounded-lg bg-raised/50">
                            <code className="text-[10px] font-mono text-ink-muted">{k}</code>
                            <p className="text-xs text-ink-secondary mt-0.5">{v}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
