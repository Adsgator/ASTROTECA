import { useState, useMemo, useEffect } from 'react'
import type { ComponentMeta, SelectedComponent } from '../types'

interface Props {
  initialComponents: ComponentMeta[]
  registryUrl: string
  initialError: string
}

export default function ComponentBrowser({ initialComponents, registryUrl, initialError }: Props) {
  const [components, setComponents] = useState<ComponentMeta[]>(initialComponents)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [error, setError] = useState(initialError)
  const [loading, setLoading] = useState(false)
  const [addedId, setAddedId] = useState<string | null>(null)

  useEffect(() => {
    // Se não tem componentes iniciais, usa dados embutidos para dev
    if (initialComponents.length === 0 && !initialError) {
      setComponents(getFallbackRegistry())
    }
  }, [initialComponents.length, initialError])
  
  // Dados de fallback para desenvolvimento
  function getFallbackRegistry(): ComponentMeta[] {
    const now = new Date().toISOString()
    return [
      {
        id: 'hero-split',
        name: 'Hero Split',
        category: 'Hero',
        description: 'Hero com imagem ao lado. Ideal para servicos.',
        previewUrl: '/preview/hero-split',
        screenshotUrl: '',
        codeUrl: 'Hero/HeroSplit.astro',
        tags: ['hero', 'split'],
        props: [{ name: 'title', type: 'string', required: true, previewValue: 'Título' }],
        bestFor: ['servicos'],
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'features-grid-3',
        name: 'Features Grid 3',
        category: 'Features',
        description: '3 diferenciais em grid.',
        previewUrl: '/preview/features-grid-3',
        screenshotUrl: '',
        codeUrl: 'Features/FeaturesGrid3.astro',
        tags: ['features', 'grid'],
        props: [{ name: 'title', type: 'string', required: true, previewValue: 'Título' }],
        bestFor: ['qualquer'],
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'testimonials-cards',
        name: 'Testimonials Cards',
        category: 'Testimonials',
        description: 'Depoimentos em cards.',
        previewUrl: '/preview/testimonials-cards',
        screenshotUrl: '',
        codeUrl: 'Testimonials/TestimonialsCards.astro',
        tags: ['testimonials', 'cards'],
        props: [{ name: 'title', type: 'string', required: true, previewValue: 'Título' }],
        bestFor: ['social'],
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'pricing-cards',
        name: 'Pricing Cards',
        category: 'Pricing',
        description: 'Tabela de precos em cards.',
        previewUrl: '/preview/pricing-cards',
        screenshotUrl: '',
        codeUrl: 'Pricing/PricingCards.astro',
        tags: ['pricing', 'cards'],
        props: [{ name: 'title', type: 'string', required: true, previewValue: 'Título' }],
        bestFor: ['precos'],
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'cta-banner',
        name: 'CTA Banner',
        category: 'CTA',
        description: 'Banner de call-to-action.',
        previewUrl: '/preview/cta-banner',
        screenshotUrl: '',
        codeUrl: 'CTA/CTABanner.astro',
        tags: ['cta', 'banner'],
        props: [{ name: 'title', type: 'string', required: true, previewValue: 'Título' }],
        bestFor: ['todos'],
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'faq-accordion',
        name: 'FAQ Accordion',
        category: 'FAQ',
        description: 'Perguntas frequentes.',
        previewUrl: '/preview/faq-accordion',
        screenshotUrl: '',
        codeUrl: 'FAQ/FAQAccordion.astro',
        tags: ['faq', 'accordion'],
        props: [{ name: 'title', type: 'string', required: true, previewValue: 'Título' }],
        bestFor: ['todos'],
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'contact-section',
        name: 'Contact Section',
        category: 'Contact',
        description: 'Secao de contato com formulario.',
        previewUrl: '/preview/contact-section',
        screenshotUrl: '',
        codeUrl: 'Contact/ContactSection.astro',
        tags: ['contact', 'formulario'],
        props: [{ name: 'title', type: 'string', required: true, previewValue: 'Título' }],
        bestFor: ['todos'],
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'footer-simples',
        name: 'Footer Simples',
        category: 'Footer',
        description: 'Rodape com links e social.',
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

  function addToBuilder(meta: ComponentMeta) {
    const raw = localStorage.getItem('acs-builder-components')
    const list: SelectedComponent[] = raw ? JSON.parse(raw) : []
    if (list.some(s => s.meta.id === meta.id)) return
    list.push({ meta, position: list.length + 1 })
    localStorage.setItem('acs-builder-components', JSON.stringify(list))
    setAddedId(meta.id)
    setTimeout(() => setAddedId(null), 2000)
  }

  const btnBase = 'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors'
  const btnPrimary = `${btnBase} bg-blue-600 text-white hover:bg-blue-700`
  const btnGhost = `${btnBase} bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900`
  const cardBase = 'rounded-xl border border-gray-200 bg-white overflow-hidden cursor-pointer transition-all hover:border-blue-300 hover:shadow-sm'
  const badgeBase = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium'

  return (
    <div className="grid grid-cols-2 gap-6 h-[calc(100vh-4rem)] bg-gray-50">
      {/* Left Column */}
      <div className="flex flex-col gap-4 overflow-hidden p-4">
        {/* Filters */}
        <div className="flex flex-col gap-3">
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Buscar componentes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <button
              className={!activeCategory ? btnPrimary : btnGhost}
              onClick={() => setActiveCategory(null)}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                className={activeCategory === cat ? btnPrimary : btnGhost}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Error / Empty */}
        {loading && (
          <div className="flex flex-1 items-center justify-center text-gray-500">
            Carregando componentes...
          </div>
        )}
        {error && (
          <div className="flex flex-1 items-center justify-center text-red-600">{error}</div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-1 items-center justify-center text-gray-500">
            Nenhum componente encontrado.
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 overflow-y-auto pr-2">
          {filtered.map(c => (
            <div
              key={c.id}
              className={`${cardBase} ${selectedId === c.id ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedId(c.id)}
            >
              <div className="h-28 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                {c.id}
              </div>
              <div className="p-3">
                <div className="mb-1 font-semibold text-sm text-gray-900">{c.name}</div>
                <div className="mb-2 text-xs text-gray-500 line-clamp-2">{c.description}</div>
                <div className="flex flex-wrap gap-1">
                  <span className={`${badgeBase} bg-blue-100 text-blue-700`}>{c.category}</span>
                  {c.tags.slice(0, 2).map(t => (
                    <span key={t} className={`${badgeBase} bg-gray-100 text-gray-600`}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column */}
      <div className="flex flex-col gap-4 overflow-y-auto p-4 bg-white">
        {!selected ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            Selecione um componente para ver detalhes.
          </div>
        ) : (
          <>
            {/* Preview */}
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden min-h-[300px]">
              {selected.previewUrl ? (
                <iframe
                  src={selected.previewUrl}
                  title={`Preview de ${selected.name}`}
                  className="w-full h-[300px] border-0"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-[300px] items-center justify-center text-gray-500 p-8">
                  Sem preview disponivel
                </div>
              )}
            </div>

            {/* Details */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold mb-1 text-gray-900">{selected.name}</h2>
                  <p className="text-sm text-gray-600">{selected.description}</p>
                </div>
                <button
                  className={`${btnPrimary} ${addedId === selected.id ? 'bg-ok' : ''}`}
                  onClick={() => addToBuilder(selected)}
                >
                  {addedId === selected.id ? 'Adicionado!' : 'Adicionar ao Builder'}
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={`${badgeBase} bg-blue-100 text-blue-700`}>{selected.category}</span>
                {selected.tags.map(t => (
                  <span key={t} className={`${badgeBase} bg-gray-100 text-gray-600`}>{t}</span>
                ))}
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase mb-1">Melhor para</p>
                <p className="text-sm text-gray-700">{selected.bestFor.join(', ')}</p>
              </div>

              {selected.props.length > 0 && (
                <>
                  <p className="text-xs font-medium text-gray-400 uppercase">Props</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Nome</th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Tipo</th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Obrig.</th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Descricao</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.props.map(p => (
                          <tr key={p.name} className="border-b border-gray-100 last:border-0">
                            <td className="py-2 px-3"><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{p.name}</code></td>
                            <td className="py-2 px-3"><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{p.type}</code></td>
                            <td className="py-2 px-3">{p.required ? 'Sim' : 'Nao'}</td>
                            <td className="py-2 px-3 text-gray-600">{p.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {selected.copy && Object.keys(selected.copy).length > 0 && (
                <>
                  <p className="text-xs font-medium text-gray-400 uppercase">Copy editavel</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Chave</th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Valor padrao</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(selected.copy).map(([k, v]) => (
                          <tr key={k} className="border-b border-gray-100 last:border-0">
                            <td className="py-2 px-3"><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{k}</code></td>
                            <td className="py-2 px-3 text-gray-600">{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
