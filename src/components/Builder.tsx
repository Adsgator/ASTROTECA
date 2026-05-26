import { useState, useEffect, useMemo } from 'react'
import type {
  ComponentMeta,
  ProjectConfig,
  ArtDirection,
  SelectedComponent,
  AppSettings,
} from '../types'
import { generateManifest } from '../lib/manifest'

/* --- Helper sub-components --- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div className="builder__pair">
      <span className="builder__pair-label">{label}</span>
      <span className="builder__pair-value">{value || '-'}</span>
    </div>
  )
}

function ColorSwatch({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      <div className="builder__color-row">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="builder__color-picker"
        />
        <input
          type="text"
          className="input"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="#000000"
        />
      </div>
    </div>
  )
}

/* --- Constants --- */

const STEPS = ['Configurar', 'Componentes', 'Revisar'] as const
type Step = (typeof STEPS)[number]

const EMPTY_PROJECT: ProjectConfig = {
  clientName: '',
  projectType: 'landing-page',
  niche: '',
  pageGoal: '',
  siteUrl: '',
  googleAnalyticsId: '',
}

const EMPTY_ART: ArtDirection = {
  colorPrimary: '#6366f1',
  colorSecondary: '#f59e0b',
  colorBackground: '#ffffff',
  colorText: '#111111',
  fontHeading: 'Inter',
  fontBody: 'Inter',
  mood: '',
  references: '',
  notes: '',
}

/* --- Main Component --- */

interface Props {
  availableComponents: ComponentMeta[]
}

export default function Builder({ availableComponents }: Props) {
  const [step, setStep] = useState<Step>('Configurar')
  const [project, setProject] = useState<ProjectConfig>(EMPTY_PROJECT)
  const [art, setArt] = useState<ArtDirection>(EMPTY_ART)
  const [selected, setSelected] = useState<SelectedComponent[]>([])
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [components, setComponents] = useState<ComponentMeta[]>(availableComponents)
  const [expandedCopy, setExpandedCopy] = useState<Record<string, boolean>>({})
  const [copyEdits, setCopyEdits] = useState<Record<string, Record<string, string>>>({})
  const [creating, setCreating] = useState(false)
  const [result, setResult] = useState<{ repoUrl: string; cloneUrl: string } | null>(null)
  const [error, setError] = useState('')

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('acs-settings')
    if (saved) {
      const settings: AppSettings = JSON.parse(saved)
      if (settings.defaultFontHeading) {
        setArt(prev => ({ ...prev, fontHeading: settings.defaultFontHeading || prev.fontHeading }))
      }
      if (settings.defaultFontBody) {
        setArt(prev => ({ ...prev, fontBody: settings.defaultFontBody || prev.fontBody }))
      }
      if (settings.defaultColorPrimary) {
        setArt(prev => ({ ...prev, colorPrimary: settings.defaultColorPrimary || prev.colorPrimary }))
      }
    }

    const builderComponents = localStorage.getItem('acs-builder-components')
    if (builderComponents) {
      const list: SelectedComponent[] = JSON.parse(builderComponents)
      setSelected(list)
      // Initialize copy edits from component defaults
      const edits: Record<string, Record<string, string>> = {}
      list.forEach(sc => {
        if (sc.meta.copy) {
          edits[sc.meta.id] = { ...sc.meta.copy }
        }
      })
      setCopyEdits(edits)
    }

    // Load components from settings if not provided
    if (availableComponents.length === 0) {
      const s = localStorage.getItem('acs-settings')
      if (s) {
        const settings: AppSettings = JSON.parse(s)
        if (settings.registryUrl) {
          fetch(settings.registryUrl)
            .then(r => r.json())
            .then((data: ComponentMeta[]) => setComponents(data))
            .catch(() => {})
        }
      }
    }
  }, [])

  // Persist selected to localStorage
  useEffect(() => {
    localStorage.setItem('acs-builder-components', JSON.stringify(selected))
  }, [selected])

  const categories = useMemo(() => {
    const cats = new Set<string>()
    components.forEach(c => cats.add(c.category))
    return Array.from(cats).sort()
  }, [components])

  const filteredComponents = useMemo(() => {
    return components.filter(c => {
      const matchSearch =
        search === '' ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
      const matchCat = !filterCategory || c.category === filterCategory
      return matchSearch && matchCat
    })
  }, [components, search, filterCategory])

  function updateProject<K extends keyof ProjectConfig>(key: K, value: ProjectConfig[K]) {
    setProject(prev => ({ ...prev, [key]: value }))
  }

  function updateArt<K extends keyof ArtDirection>(key: K, value: ArtDirection[K]) {
    setArt(prev => ({ ...prev, [key]: value }))
  }

  function toggleComponent(meta: ComponentMeta) {
    setSelected(prev => {
      const exists = prev.find(s => s.meta.id === meta.id)
      if (exists) {
        const filtered = prev.filter(s => s.meta.id !== meta.id)
        return filtered.map((s, i) => ({ ...s, position: i + 1 }))
      }
      const newList = [...prev, { meta, position: prev.length + 1 }]
      // Init copy edits
      if (meta.copy) {
        setCopyEdits(ce => ({ ...ce, [meta.id]: { ...meta.copy! } }))
      }
      return newList
    })
  }

  function moveComponent(index: number, direction: 'up' | 'down') {
    setSelected(prev => {
      const arr = [...prev]
      const target = direction === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= arr.length) return prev
      const temp = arr[index]
      arr[index] = arr[target]
      arr[target] = temp
      return arr.map((s, i) => ({ ...s, position: i + 1 }))
    })
  }

  function removeComponent(id: string) {
    setSelected(prev =>
      prev.filter(s => s.meta.id !== id).map((s, i) => ({ ...s, position: i + 1 }))
    )
  }

  function updateCopy(componentId: string, key: string, value: string) {
    setCopyEdits(prev => ({
      ...prev,
      [componentId]: { ...(prev[componentId] || {}), [key]: value },
    }))
  }

  function toggleCopyExpand(id: string) {
    setExpandedCopy(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function getSelectedWithCopy(): SelectedComponent[] {
    return selected.map(sc => ({
      ...sc,
      meta: {
        ...sc.meta,
        copy: copyEdits[sc.meta.id] || sc.meta.copy || {},
      },
    }))
  }

  function getManifest(): string {
    const raw = localStorage.getItem('acs-settings')
    const settings: AppSettings = raw ? JSON.parse(raw) : ({} as AppSettings)
    return generateManifest(project, art, getSelectedWithCopy(), settings)
  }

  function downloadManifest() {
    const text = getManifest()
    const blob = new Blob([text], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.clientName || 'projeto'}-manifest.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function createProject() {
    setCreating(true)
    setError('')
    try {
      const raw = localStorage.getItem('acs-settings')
      if (!raw) throw new Error('Configure o GitHub em Configuracoes primeiro.')
      const settings: AppSettings = JSON.parse(raw)
      const manifest = getManifest()

      const res = await fetch('/api/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings,
          clientName: project.clientName,
          manifest,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao criar projeto')
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setCreating(false)
    }
  }

  function isSelected(id: string) {
    return selected.some(s => s.meta.id === id)
  }

  function getPosition(id: string) {
    const s = selected.find(sc => sc.meta.id === id)
    return s ? s.position : null
  }

  /* --- Result screen --- */

  if (result) {
    return (
      <>
        <style>{`
          .builder__result {
            max-width: 600px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: var(--space-4);
            padding-top: var(--space-8);
          }
          .builder__result-title {
            font-size: var(--text-2xl);
            font-weight: 700;
            color: var(--accent);
          }
          .builder__result-links {
            display: flex;
            flex-direction: column;
            gap: var(--space-2);
          }
        `}</style>
        <div className="builder__result">
          <div className="builder__result-title">Projeto criado com sucesso!</div>
          <div className="card">
            <Pair label="Repositorio" value={result.repoUrl} />
            <div className="builder__result-links">
              <a href={result.repoUrl} target="_blank" rel="noopener" className="btn btn-primary">
                Abrir no GitHub
              </a>
              <a
                href={`vscode://vscode.git/clone?url=${encodeURIComponent(result.cloneUrl)}`}
                className="btn btn-outline"
              >
                Abrir no VS Code
              </a>
              <button className="btn btn-outline" onClick={downloadManifest}>
                Baixar Manifesto (.md)
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  /* --- Main render --- */

  return (
    <>
      <style>{`
        .builder {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: var(--space-6);
          min-height: calc(100vh - var(--space-6) * 2);
        }

        .builder__content {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .builder__aside {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .builder__form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
        }

        .builder__form-full {
          grid-column: 1 / -1;
        }

        .builder__color-row {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .builder__color-picker {
          width: 40px;
          height: 40px;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 2px;
          cursor: pointer;
          background: none;
        }

        .builder__comp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: var(--space-3);
        }

        .builder__comp-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-1);
        }

        .builder__comp-card-name {
          font-weight: 600;
          font-size: var(--text-sm);
        }

        .builder__comp-card-desc {
          font-size: var(--text-xs);
          color: var(--muted);
        }

        .builder__review-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3);
          border-bottom: 1px solid var(--border);
        }

        .builder__review-item:last-child {
          border-bottom: none;
        }

        .builder__review-position {
          font-weight: 700;
          color: var(--accent);
          min-width: 24px;
          text-align: center;
        }

        .builder__review-info {
          flex: 1;
        }

        .builder__review-actions {
          display: flex;
          gap: var(--space-1);
        }

        .builder__copy-section {
          padding: var(--space-3);
          border-top: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .builder__copy-toggle {
          cursor: pointer;
          color: var(--accent);
          font-size: var(--text-sm);
          font-weight: 500;
          background: none;
          border: none;
          text-align: left;
          padding: 0;
        }

        .builder__copy-field {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .builder__copy-field label {
          font-size: var(--text-xs);
          color: var(--muted);
          font-weight: 500;
        }

        .builder__copy-field textarea {
          min-height: 60px;
          resize: vertical;
        }

        .builder__pair {
          display: flex;
          justify-content: space-between;
          padding: var(--space-1) 0;
          font-size: var(--text-sm);
          border-bottom: 1px solid var(--border);
        }

        .builder__pair-label {
          color: var(--muted);
        }

        .builder__pair-value {
          font-weight: 500;
        }

        .builder__error {
          color: var(--danger);
          padding: var(--space-3);
          border: 1px solid var(--danger);
          border-radius: var(--radius);
          font-size: var(--text-sm);
        }

        .builder__aside-section {
          padding: var(--space-3);
        }

        .builder__aside-title {
          font-size: var(--text-sm);
          font-weight: 600;
          margin-bottom: var(--space-2);
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .builder__aside-component {
          font-size: var(--text-sm);
          padding: var(--space-1) 0;
          display: flex;
          gap: var(--space-2);
          align-items: center;
        }

        .builder__actions {
          display: flex;
          gap: var(--space-3);
          padding-top: var(--space-4);
          border-top: 1px solid var(--border);
        }

        .builder__comp-card-category {
          margin-top: var(--space-2);
        }

        .builder__aside-colors {
          display: flex;
          gap: var(--space-2);
          flex-wrap: wrap;
        }

        .builder__aside-swatch {
          width: 32px;
          height: 32px;
          border-radius: var(--radius);
          border: 1px solid var(--border);
        }
      `}</style>

      <div className="builder">
        <div className="builder__content">
          {/* Tab navigation */}
          <div className="tab-bar">
            {STEPS.map((s, i) => (
              <button
                key={s}
                className={`tab ${step === s ? 'active' : ''}`}
                onClick={() => setStep(s)}
              >
                {i + 1}. {s}
              </button>
            ))}
          </div>

          {/* --- Step 1: Configurar --- */}
          {step === 'Configurar' && (
            <div className="card">
              <h2 className="section-title">Dados do Projeto</h2>
              <div className="builder__form-grid">
                <Field label="Nome do cliente">
                  <input
                    className="input"
                    value={project.clientName}
                    onChange={e => updateProject('clientName', e.target.value)}
                    placeholder="acme-corp"
                  />
                </Field>
                <Field label="Tipo de projeto">
                  <select
                    className="input"
                    value={project.projectType}
                    onChange={e => updateProject('projectType', e.target.value)}
                  >
                    <option value="landing-page">Landing Page</option>
                    <option value="site-institucional">Site Institucional</option>
                    <option value="portfolio">Portfolio</option>
                    <option value="blog">Blog</option>
                    <option value="ecommerce">E-commerce</option>
                  </select>
                </Field>
                <Field label="Nicho">
                  <input
                    className="input"
                    value={project.niche}
                    onChange={e => updateProject('niche', e.target.value)}
                    placeholder="ex: saude, tech, educacao"
                  />
                </Field>
                <Field label="Objetivo da pagina">
                  <input
                    className="input"
                    value={project.pageGoal}
                    onChange={e => updateProject('pageGoal', e.target.value)}
                    placeholder="ex: captar leads, vender produto"
                  />
                </Field>
                <Field label="URL do site">
                  <input
                    className="input"
                    value={project.siteUrl}
                    onChange={e => updateProject('siteUrl', e.target.value)}
                    placeholder="https://..."
                  />
                </Field>
                <Field label="Google Analytics ID">
                  <input
                    className="input"
                    value={project.googleAnalyticsId}
                    onChange={e => updateProject('googleAnalyticsId', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                </Field>
              </div>

              <h2 className="section-title">Direcao de Arte</h2>
              <div className="builder__form-grid">
                <ColorSwatch
                  label="Cor Primaria"
                  value={art.colorPrimary}
                  onChange={v => updateArt('colorPrimary', v)}
                />
                <ColorSwatch
                  label="Cor Secundaria"
                  value={art.colorSecondary}
                  onChange={v => updateArt('colorSecondary', v)}
                />
                <ColorSwatch
                  label="Cor de Fundo"
                  value={art.colorBackground}
                  onChange={v => updateArt('colorBackground', v)}
                />
                <ColorSwatch
                  label="Cor do Texto"
                  value={art.colorText}
                  onChange={v => updateArt('colorText', v)}
                />
                <Field label="Fonte dos titulos">
                  <input
                    className="input"
                    value={art.fontHeading}
                    onChange={e => updateArt('fontHeading', e.target.value)}
                    placeholder="Inter"
                  />
                </Field>
                <Field label="Fonte do corpo">
                  <input
                    className="input"
                    value={art.fontBody}
                    onChange={e => updateArt('fontBody', e.target.value)}
                    placeholder="Inter"
                  />
                </Field>
                <div className="builder__form-full">
                  <Field label="Mood / Tom">
                    <input
                      className="input"
                      value={art.mood}
                      onChange={e => updateArt('mood', e.target.value)}
                      placeholder="ex: profissional, acolhedor, moderno"
                    />
                  </Field>
                </div>
                <div className="builder__form-full">
                  <Field label="Referencias visuais">
                    <textarea
                      className="input"
                      value={art.references}
                      onChange={e => updateArt('references', e.target.value)}
                      placeholder="Links ou descricao de referencias"
                      rows={3}
                    />
                  </Field>
                </div>
                <div className="builder__form-full">
                  <Field label="Observacoes">
                    <textarea
                      className="input"
                      value={art.notes}
                      onChange={e => updateArt('notes', e.target.value)}
                      placeholder="Qualquer nota adicional sobre o projeto"
                      rows={3}
                    />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* --- Step 2: Componentes --- */}
          {step === 'Componentes' && (
            <div>
              <div className="builder__form-grid">
                <input
                  className="input"
                  placeholder="Buscar componentes..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <div className="browser__categories">
                  <button
                    className={`btn btn-sm ${!filterCategory ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setFilterCategory(null)}
                  >
                    Todos
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      className={`btn btn-sm ${filterCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setFilterCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {filteredComponents.length === 0 ? (
                <div className="empty-state">Nenhum componente encontrado.</div>
              ) : (
                <div className="builder__comp-grid">
                  {filteredComponents.map(c => {
                    const sel = isSelected(c.id)
                    const pos = getPosition(c.id)
                    return (
                      <div
                        key={c.id}
                        className={`card card-interactive ${sel ? 'card-selected' : ''}`}
                        onClick={() => toggleComponent(c)}
                      >
                        <div className="builder__comp-card-header">
                          <span className="builder__comp-card-name">{c.name}</span>
                          {pos !== null && <span className="badge badge-accent">{pos}</span>}
                        </div>
                        <div className="builder__comp-card-desc">{c.description}</div>
                        <div className="builder__comp-card-category">
                          <span className="badge badge-default">{c.category}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* --- Step 3: Revisar --- */}
          {step === 'Revisar' && (
            <div>
              {/* Project summary */}
              <div className="card">
                <h2 className="section-title">Resumo do Projeto</h2>
                <div className="builder__form-grid">
                  <Pair label="Cliente" value={project.clientName} />
                  <Pair label="Tipo" value={project.projectType} />
                  <Pair label="Nicho" value={project.niche} />
                  <Pair label="Objetivo" value={project.pageGoal} />
                  <Pair label="URL" value={project.siteUrl} />
                  <Pair label="GA ID" value={project.googleAnalyticsId} />
                </div>
              </div>

              {/* Components list */}
              <div className="card">
                <h2 className="section-title">Componentes ({selected.length})</h2>
                {selected.length === 0 ? (
                  <div className="empty-state">Nenhum componente selecionado.</div>
                ) : (
                  selected.map((sc, index) => (
                    <div key={sc.meta.id}>
                      <div className="builder__review-item">
                        <span className="builder__review-position">{sc.position}</span>
                        <div className="builder__review-info">
                          <strong>{sc.meta.name}</strong>
                          <div className="builder__comp-card-desc">{sc.meta.description}</div>
                        </div>
                        <div className="builder__review-actions">
                          <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={() => moveComponent(index, 'up')}
                            disabled={index === 0}
                          >
                            ^
                          </button>
                          <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={() => moveComponent(index, 'down')}
                            disabled={index === selected.length - 1}
                          >
                            v
                          </button>
                          <button
                            className="btn btn-danger btn-sm btn-icon"
                            onClick={() => removeComponent(sc.meta.id)}
                          >
                            x
                          </button>
                        </div>
                      </div>

                      {/* Copy editing */}
                      {sc.meta.copy && Object.keys(sc.meta.copy).length > 0 && (
                        <div className="builder__copy-section">
                          <button
                            className="builder__copy-toggle"
                            onClick={() => toggleCopyExpand(sc.meta.id)}
                          >
                            {expandedCopy[sc.meta.id] ? 'v' : '>'} Editar textos (
                            {Object.keys(sc.meta.copy).length} campos)
                          </button>
                          {expandedCopy[sc.meta.id] && (
                            <div>
                              {Object.entries(copyEdits[sc.meta.id] || sc.meta.copy).map(
                                ([key, value]) => (
                                  <div key={key} className="builder__copy-field">
                                    <label>{key}</label>
                                    <textarea
                                      className="input"
                                      value={value}
                                      onChange={e => updateCopy(sc.meta.id, key, e.target.value)}
                                      rows={2}
                                    />
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Actions */}
              {error && <div className="builder__error">{error}</div>}

              <div className="builder__actions">
                <button className="btn btn-outline" onClick={downloadManifest}>
                  Baixar Manifesto (.md)
                </button>
                <button
                  className="btn btn-primary"
                  onClick={createProject}
                  disabled={creating || !project.clientName}
                >
                  {creating ? 'Criando...' : 'Criar Projeto no GitHub'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- Right Sidebar --- */}
        <div className="builder__aside">
          <div className="card">
            <div className="builder__aside-section">
              <div className="builder__aside-title">Cliente</div>
              <div>{project.clientName || '(nao definido)'}</div>
              <div className="builder__comp-card-desc">
                {project.projectType} - {project.niche || '-'}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="builder__aside-section">
              <div className="builder__aside-title">Estrutura da Pagina</div>
              {selected.length === 0 ? (
                <div className="builder__comp-card-desc">Nenhum componente adicionado</div>
              ) : (
                selected.map(sc => (
                  <div key={sc.meta.id} className="builder__aside-component">
                    <span className="badge badge-accent">{sc.position}</span>
                    <span>{sc.meta.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <div className="builder__aside-section">
              <div className="builder__aside-title">Cores</div>
              <div className="builder__aside-colors">
                <div className="builder__aside-swatch" style={{ background: art.colorPrimary }} title="Primaria" />
                <div className="builder__aside-swatch" style={{ background: art.colorSecondary }} title="Secundaria" />
                <div className="builder__aside-swatch" style={{ background: art.colorBackground }} title="Fundo" />
                <div className="builder__aside-swatch" style={{ background: art.colorText }} title="Texto" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="builder__aside-section">
              <div className="builder__aside-title">Tipografia</div>
              <Pair label="Titulos" value={art.fontHeading} />
              <Pair label="Corpo" value={art.fontBody} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
