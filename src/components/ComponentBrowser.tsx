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
    if (initialComponents.length === 0 && !initialError) {
      const saved = localStorage.getItem('acs-settings')
      if (saved) {
        const settings = JSON.parse(saved)
        if (settings.registryUrl) {
          setLoading(true)
          fetch(settings.registryUrl)
            .then(r => r.json())
            .then((data: ComponentMeta[]) => {
              setComponents(data)
              setLoading(false)
            })
            .catch(e => {
              setError(e instanceof Error ? e.message : 'Erro ao carregar')
              setLoading(false)
            })
        }
      }
    }
  }, [])

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
  const btnPrimary = `${btnBase} bg-accent text-bg hover:bg-accent-hover`
  const btnGhost = `${btnBase} bg-transparent text-ink-secondary hover:bg-raised hover:text-ink-primary`
  const cardBase = 'rounded-xl border border-border bg-surface overflow-hidden cursor-pointer transition-all hover:border-accent/50'
  const badgeBase = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium'

  return (
    <div className="grid grid-cols-2 gap-6 h-[calc(100vh-4rem)]">
      {/* Left Column */}
      <div className="flex flex-col gap-4 overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col gap-3">
          <input
            type="text"
            className="w-full rounded-lg border border-border bg-raised px-4 py-2 text-sm text-ink-primary placeholder-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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
          <div className="flex flex-1 items-center justify-center text-ink-secondary">
            Carregando componentes...
          </div>
        )}
        {error && (
          <div className="flex flex-1 items-center justify-center text-fail">{error}</div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-1 items-center justify-center text-ink-secondary">
            Nenhum componente encontrado.
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 overflow-y-auto pr-2">
          {filtered.map(c => (
            <div
              key={c.id}
              className={`${cardBase} ${selectedId === c.id ? 'ring-2 ring-accent' : ''}`}
              onClick={() => setSelectedId(c.id)}
            >
              {c.screenshotUrl && (
                <img
                  src={c.screenshotUrl}
                  alt={c.name}
                  className="h-28 w-full object-cover"
                />
              )}
              <div className="p-3">
                <div className="mb-1 font-semibold text-sm">{c.name}</div>
                <div className="mb-2 text-xs text-ink-secondary line-clamp-2">{c.description}</div>
                <div className="flex flex-wrap gap-1">
                  <span className={`${badgeBase} bg-raised text-ink-secondary`}>{c.category}</span>
                  {c.tags.slice(0, 2).map(t => (
                    <span key={t} className={`${badgeBase} bg-border-subtle text-ink-muted`}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column */}
      <div className="flex flex-col gap-4 overflow-y-auto">
        {!selected ? (
          <div className="flex h-full items-center justify-center text-ink-secondary">
            Selecione um componente para ver detalhes.
          </div>
        ) : (
          <>
            {/* Preview */}
            <div className="rounded-xl border border-border bg-surface overflow-hidden min-h-[200px]">
              {selected.screenshotUrl ? (
                <img
                  src={selected.screenshotUrl}
                  alt={selected.name}
                  className="w-full h-auto max-h-[300px] object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-ink-secondary p-8">
                  Sem preview disponivel
                </div>
              )}
            </div>

            {/* Details */}
            <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold mb-1">{selected.name}</h2>
                  <p className="text-sm text-ink-secondary">{selected.description}</p>
                </div>
                <button
                  className={`${btnPrimary} ${addedId === selected.id ? 'bg-ok' : ''}`}
                  onClick={() => addToBuilder(selected)}
                >
                  {addedId === selected.id ? 'Adicionado!' : 'Adicionar ao Builder'}
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={`${badgeBase} bg-accent-dim text-accent`}>{selected.category}</span>
                {selected.tags.map(t => (
                  <span key={t} className={`${badgeBase} bg-raised text-ink-secondary`}>{t}</span>
                ))}
              </div>

              <div>
                <p className="text-xs font-medium text-ink-muted uppercase mb-1">Melhor para</p>
                <p className="text-sm">{selected.bestFor.join(', ')}</p>
              </div>

              {selected.props.length > 0 && (
                <>
                  <p className="text-xs font-medium text-ink-muted uppercase">Props</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 text-xs font-medium text-ink-muted uppercase">Nome</th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-ink-muted uppercase">Tipo</th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-ink-muted uppercase">Obrig.</th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-ink-muted uppercase">Descricao</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.props.map(p => (
                          <tr key={p.name} className="border-b border-border-subtle last:border-0">
                            <td className="py-2 px-3"><code className="text-xs bg-raised px-1.5 py-0.5 rounded">{p.name}</code></td>
                            <td className="py-2 px-3"><code className="text-xs bg-raised px-1.5 py-0.5 rounded">{p.type}</code></td>
                            <td className="py-2 px-3">{p.required ? 'Sim' : 'Nao'}</td>
                            <td className="py-2 px-3 text-ink-secondary">{p.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {selected.copy && Object.keys(selected.copy).length > 0 && (
                <>
                  <p className="text-xs font-medium text-ink-muted uppercase">Copy editavel</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 text-xs font-medium text-ink-muted uppercase">Chave</th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-ink-muted uppercase">Valor padrao</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(selected.copy).map(([k, v]) => (
                          <tr key={k} className="border-b border-border-subtle last:border-0">
                            <td className="py-2 px-3"><code className="text-xs bg-raised px-1.5 py-0.5 rounded">{k}</code></td>
                            <td className="py-2 px-3 text-ink-secondary">{v}</td>
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
