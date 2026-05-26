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
    alert(`"${meta.name}" adicionado ao Builder!`)
  }

  return (
    <>
      <style>{`
        .browser {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-6);
          height: calc(100vh - var(--space-6) * 2);
        }

        .browser__left {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          overflow: hidden;
        }

        .browser__filters {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .browser__categories {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-1);
        }

        .browser__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: var(--space-3);
          overflow-y: auto;
          flex: 1;
          padding-right: var(--space-2);
        }

        .browser__card-title {
          font-weight: 600;
          font-size: var(--text-sm);
          margin-bottom: var(--space-1);
        }

        .browser__card-desc {
          font-size: var(--text-xs);
          color: var(--muted);
          margin-bottom: var(--space-2);
        }

        .browser__card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-1);
        }

        .browser__right {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          overflow-y: auto;
        }

        .browser__preview {
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          background: var(--surface-2);
          min-height: 300px;
        }

        .browser__preview iframe {
          width: 100%;
          height: 300px;
          border: none;
        }

        .browser__detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--space-3);
        }

        .browser__detail-title {
          font-size: var(--text-xl);
          font-weight: 700;
        }

        .browser__props-table {
          width: 100%;
          border-collapse: collapse;
          font-size: var(--text-sm);
        }

        .browser__props-table th,
        .browser__props-table td {
          text-align: left;
          padding: var(--space-2) var(--space-3);
          border-bottom: 1px solid var(--border);
        }

        .browser__props-table th {
          color: var(--muted);
          font-weight: 500;
          text-transform: uppercase;
          font-size: var(--text-xs);
        }

        .browser__screenshot {
          width: 100%;
          height: 120px;
          object-fit: cover;
          border-radius: var(--radius) var(--radius) 0 0;
        }

        .browser__card-inner {
          padding: var(--space-3);
        }
      `}</style>

      <div className="browser">
        <div className="browser__left">
          <div className="browser__filters">
            <input
              type="text"
              className="input"
              placeholder="Buscar componentes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="browser__categories">
              <button
                className={`btn btn-sm ${!activeCategory ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveCategory(null)}
              >
                Todos
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="empty-state">Carregando componentes...</div>
          )}

          {error && (
            <div className="empty-state">{error}</div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="empty-state">
              Nenhum componente encontrado.
            </div>
          )}

          <div className="browser__grid">
            {filtered.map(c => (
              <div
                key={c.id}
                className={`card card-interactive ${selectedId === c.id ? 'card-selected' : ''}`}
                onClick={() => setSelectedId(c.id)}
              >
                {c.screenshotUrl && (
                  <img
                    src={c.screenshotUrl}
                    alt={c.name}
                    className="browser__screenshot"
                  />
                )}
                <div className="browser__card-inner">
                  <div className="browser__card-title">{c.name}</div>
                  <div className="browser__card-desc">{c.description}</div>
                  <div className="browser__card-tags">
                    <span className="badge badge-default">{c.category}</span>
                    {c.tags.slice(0, 2).map(t => (
                      <span key={t} className="badge">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="browser__right">
          {!selected ? (
            <div className="empty-state">
              Selecione um componente para ver detalhes.
            </div>
          ) : (
            <>
              <div className="browser__preview">
                {selected.screenshotUrl ? (
                  <img
                    src={selected.screenshotUrl}
                    alt={selected.name}
                    className="browser__screenshot"
                    style={{ height: 'auto', maxHeight: '300px' }}
                  />
                ) : (
                  <div className="empty-state">Sem preview disponivel</div>
                )}
              </div>

              <div className="card">
                <div className="browser__detail-header">
                  <div>
                    <div className="browser__detail-title">{selected.name}</div>
                    <p className="browser__card-desc">{selected.description}</p>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => addToBuilder(selected)}
                  >
                    Adicionar ao Builder
                  </button>
                </div>

                <div className="browser__card-tags">
                  <span className="badge badge-accent">{selected.category}</span>
                  {selected.tags.map(t => (
                    <span key={t} className="badge badge-default">{t}</span>
                  ))}
                </div>

                <p className="label">Melhor para</p>
                <p>{selected.bestFor.join(', ')}</p>

                {selected.props.length > 0 && (
                  <>
                    <p className="label">Props</p>
                    <table className="browser__props-table">
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>Tipo</th>
                          <th>Obrigatoria</th>
                          <th>Descricao</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.props.map(p => (
                          <tr key={p.name}>
                            <td><code>{p.name}</code></td>
                            <td><code>{p.type}</code></td>
                            <td>{p.required ? 'Sim' : 'Nao'}</td>
                            <td>{p.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}

                {selected.copy && Object.keys(selected.copy).length > 0 && (
                  <>
                    <p className="label">Copy editavel</p>
                    <table className="browser__props-table">
                      <thead>
                        <tr>
                          <th>Chave</th>
                          <th>Valor padrao</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(selected.copy).map(([k, v]) => (
                          <tr key={k}>
                            <td><code>{k}</code></td>
                            <td>{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
