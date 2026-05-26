import { useState, useEffect, useMemo } from 'react'
import type {
  ComponentMeta,
  ProjectConfig,
  ArtDirection,
  SelectedComponent,
  AppSettings,
} from '../types'
import { generateManifest } from '../lib/manifest'

/* --- Tailwind classes (dark theme) --- */
const inputBase = 'w-full rounded-lg border border-border bg-raised px-3 py-2 text-sm text-ink-primary placeholder-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent'
const btnBase = 'px-4 py-2 rounded-lg text-sm font-medium transition-colors'
const btnPrimary = `${btnBase} bg-accent text-black hover:bg-accent-hover disabled:opacity-50`
const btnOutline = `${btnBase} border border-border bg-transparent text-ink-primary hover:bg-raised`
const btnGhost = `${btnBase} bg-transparent text-ink-secondary hover:bg-raised hover:text-ink-primary`
const btnDanger = `${btnBase} bg-fail/10 text-fail border border-fail/20 hover:bg-fail/20`
const cardBase = 'rounded-xl border border-border bg-surface overflow-hidden'
const cardInteractive = `${cardBase} cursor-pointer transition-all hover:border-accent/30 hover:shadow-lg`
const badgeBase = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium'

/* --- Helper sub-components --- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-ink-secondary uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1 text-sm border-b border-border last:border-0">
      <span className="text-ink-secondary">{label}</span>
      <span className="font-medium text-ink-primary">{value || '-'}</span>
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
    <div className="space-y-1.5 min-w-0">
      <label className="block text-xs font-medium text-ink-secondary truncate">{label}</label>
      <div className="flex items-center gap-2 min-w-0">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-border bg-transparent cursor-pointer p-0.5 flex-shrink-0"
        />
        <input
          type="text"
          className={`${inputBase} min-w-0`}
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
      const edits: Record<string, Record<string, string>> = {}
      list.forEach(sc => {
        if (sc.meta.copy) {
          edits[sc.meta.id] = { ...sc.meta.copy }
        }
      })
      setCopyEdits(edits)
    }

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
      <div className="max-w-xl mx-auto flex flex-col gap-4 pt-12">
        <h1 className="text-2xl font-bold text-accent">Projeto criado com sucesso!</h1>
        <div className={`${cardBase} p-5 space-y-4`}>
          <Pair label="Repositorio" value={result.repoUrl} />
          <div className="flex flex-col gap-2 pt-2">
            <a href={result.repoUrl} target="_blank" rel="noopener" className={btnPrimary}>
              Abrir no GitHub
            </a>
            <a
              href={`vscode://vscode.git/clone?url=${encodeURIComponent(result.cloneUrl)}`}
              className={btnOutline}
            >
              Abrir no VS Code
            </a>
            <button className={btnOutline} onClick={downloadManifest}>
              Baixar Manifesto (.md)
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* --- Main render --- */

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_280px] gap-6 min-h-[calc(100vh-4rem)] max-w-[1400px]">
      <div className="flex flex-col gap-4 min-w-0 overflow-x-hidden">
        {/* Tab navigation */}
        <div className="flex gap-2 border-b border-border pb-2">
          {STEPS.map((s, i) => (
            <button
              key={s}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                step === s
                  ? 'bg-accent text-black'
                  : 'text-ink-secondary hover:bg-raised hover:text-ink-primary'
              }`}
              onClick={() => setStep(s)}
            >
              {i + 1}. {s}
            </button>
          ))}
        </div>

        {/* --- Step 1: Configurar --- */}
        {step === 'Configurar' && (
          <div className={cardBase}>
            <div className="p-5 space-y-6">
              <h2 className="text-lg font-semibold">Dados do Projeto</h2>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nome do cliente">
                  <input
                    className={inputBase}
                    value={project.clientName}
                    onChange={e => updateProject('clientName', e.target.value)}
                    placeholder="acme-corp"
                  />
                </Field>
                <Field label="Tipo de projeto">
                  <select
                    className={inputBase}
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
                    className={inputBase}
                    value={project.niche}
                    onChange={e => updateProject('niche', e.target.value)}
                    placeholder="ex: saude, tech, educacao"
                  />
                </Field>
                <Field label="Objetivo da pagina">
                  <input
                    className={inputBase}
                    value={project.pageGoal}
                    onChange={e => updateProject('pageGoal', e.target.value)}
                    placeholder="ex: captar leads, vender produto"
                  />
                </Field>
                <Field label="URL do site">
                  <input
                    className={inputBase}
                    value={project.siteUrl}
                    onChange={e => updateProject('siteUrl', e.target.value)}
                    placeholder="https://..."
                  />
                </Field>
                <Field label="Google Analytics ID">
                  <input
                    className={inputBase}
                    value={project.googleAnalyticsId}
                    onChange={e => updateProject('googleAnalyticsId', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                </Field>
              </div>

              <h2 className="text-lg font-semibold pt-4 border-t border-border">Direcao de Arte</h2>
              <div className="grid grid-cols-2 gap-3">
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
                    className={inputBase}
                    value={art.fontHeading}
                    onChange={e => updateArt('fontHeading', e.target.value)}
                    placeholder="Inter"
                  />
                </Field>
                <Field label="Fonte do corpo">
                  <input
                    className={inputBase}
                    value={art.fontBody}
                    onChange={e => updateArt('fontBody', e.target.value)}
                    placeholder="Inter"
                  />
                </Field>
                <div className="col-span-2">
                  <Field label="Mood / Tom">
                    <input
                      className={inputBase}
                      value={art.mood}
                      onChange={e => updateArt('mood', e.target.value)}
                      placeholder="ex: profissional, acolhedor, moderno"
                    />
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label="Referencias visuais">
                    <textarea
                      className={`${inputBase} min-h-[80px] resize-y`}
                      value={art.references}
                      onChange={e => updateArt('references', e.target.value)}
                      placeholder="Links ou descricao de referencias"
                      rows={3}
                    />
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label="Observacoes">
                    <textarea
                      className={`${inputBase} min-h-[80px] resize-y`}
                      value={art.notes}
                      onChange={e => updateArt('notes', e.target.value)}
                      placeholder="Qualquer nota adicional sobre o projeto"
                      rows={3}
                    />
                  </Field>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Step 2: Componentes --- */}
        {step === 'Componentes' && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                className={`${inputBase} max-w-xs`}
                placeholder="Buscar componentes..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div className="flex gap-2 flex-wrap">
                <button
                  className={!filterCategory ? btnPrimary : btnGhost}
                  onClick={() => setFilterCategory(null)}
                >
                  Todos
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={filterCategory === cat ? btnPrimary : btnGhost}
                    onClick={() => setFilterCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredComponents.length === 0 ? (
              <div className="text-ink-secondary py-8 text-center">Nenhum componente encontrado.</div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
                {filteredComponents.map(c => {
                  const sel = isSelected(c.id)
                  const pos = getPosition(c.id)
                  return (
                    <div
                      key={c.id}
                      className={`${cardInteractive} ${sel ? 'ring-2 ring-accent' : ''} p-4`}
                      onClick={() => toggleComponent(c)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-sm">{c.name}</span>
                        {pos !== null && <span className={`${badgeBase} bg-accent/10 text-accent`}>{pos}</span>}
                      </div>
                      <div className="text-xs text-ink-secondary line-clamp-2">{c.description}</div>
                      <div className="mt-2">
                        <span className={`${badgeBase} bg-raised text-ink-secondary`}>{c.category}</span>
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
          <div className="space-y-4">
            {/* Project summary */}
            <div className={cardBase}>
              <div className="p-5">
                <h2 className="text-lg font-semibold mb-4">Resumo do Projeto</h2>
                <div className="grid grid-cols-2 gap-x-4">
                  <Pair label="Cliente" value={project.clientName} />
                  <Pair label="Tipo" value={project.projectType} />
                  <Pair label="Nicho" value={project.niche} />
                  <Pair label="Objetivo" value={project.pageGoal} />
                  <Pair label="URL" value={project.siteUrl} />
                  <Pair label="GA ID" value={project.googleAnalyticsId} />
                </div>
              </div>
            </div>

            {/* Components list */}
            <div className={cardBase}>
              <div className="p-5">
                <h2 className="text-lg font-semibold mb-4">Componentes ({selected.length})</h2>
                {selected.length === 0 ? (
                  <div className="text-ink-secondary py-4 text-center">Nenhum componente selecionado.</div>
                ) : (
                  <div className="space-y-4">
                    {selected.map((sc, index) => (
                      <div key={sc.meta.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">{sc.position}</span>
                          <div className="flex-1">
                            <strong className="block">{sc.meta.name}</strong>
                            <div className="text-sm text-ink-secondary">{sc.meta.description}</div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              className={`${btnGhost} px-2 py-1`}
                              onClick={() => moveComponent(index, 'up')}
                              disabled={index === 0}
                            >
                              ↑
                            </button>
                            <button
                              className={`${btnGhost} px-2 py-1`}
                              onClick={() => moveComponent(index, 'down')}
                              disabled={index === selected.length - 1}
                            >
                              ↓
                            </button>
                            <button
                              className={`${btnDanger} px-2 py-1`}
                              onClick={() => removeComponent(sc.meta.id)}
                            >
                              ×
                            </button>
                          </div>
                        </div>

                        {/* Copy editing */}
                        {sc.meta.copy && Object.keys(sc.meta.copy).length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border pl-9">
                            <button
                              className="text-accent text-sm font-medium hover:underline"
                              onClick={() => toggleCopyExpand(sc.meta.id)}
                            >
                              {expandedCopy[sc.meta.id] ? '▼' : '▶'} Editar textos ({Object.keys(sc.meta.copy).length} campos)
                            </button>
                            {expandedCopy[sc.meta.id] && (
                              <div className="mt-2 space-y-3">
                                {Object.entries(copyEdits[sc.meta.id] || sc.meta.copy).map(
                                  ([key, value]) => (
                                    <div key={key}>
                                      <label className="block text-xs font-medium text-ink-muted mb-1">{key}</label>
                                      <textarea
                                        className={`${inputBase} min-h-[60px] resize-y`}
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
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {error && (
              <div className="p-4 border border-fail rounded-lg text-fail text-sm">{error}</div>
            )}

            <div className="flex gap-3 pt-4 border-t border-border">
              <button className={btnOutline} onClick={downloadManifest}>
                Baixar Manifesto (.md)
              </button>
              <button
                className={btnPrimary}
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
      <div className="flex flex-col gap-4">
        <div className={cardBase}>
          <div className="p-4">
            <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">Cliente</div>
            <div className="font-medium">{project.clientName || '(nao definido)'}</div>
            <div className="text-sm text-ink-secondary">
              {project.projectType} - {project.niche || '-'}
            </div>
          </div>
        </div>

        <div className={cardBase}>
          <div className="p-4">
            <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">Estrutura da Pagina</div>
            {selected.length === 0 ? (
              <div className="text-sm text-ink-secondary">Nenhum componente adicionado</div>
            ) : (
              <div className="space-y-1">
                {selected.map(sc => (
                  <div key={sc.meta.id} className="flex items-center gap-2 text-sm">
                    <span className={`${badgeBase} bg-accent/10 text-accent`}>{sc.position}</span>
                    <span>{sc.meta.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={cardBase}>
          <div className="p-4">
            <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">Cores</div>
            <div className="flex gap-2 flex-wrap">
              <div className="w-8 h-8 rounded-lg border border-border" style={{ background: art.colorPrimary }} title="Primaria" />
              <div className="w-8 h-8 rounded-lg border border-border" style={{ background: art.colorSecondary }} title="Secundaria" />
              <div className="w-8 h-8 rounded-lg border border-border" style={{ background: art.colorBackground }} title="Fundo" />
              <div className="w-8 h-8 rounded-lg border border-border" style={{ background: art.colorText }} title="Texto" />
            </div>
          </div>
        </div>

        <div className={cardBase}>
          <div className="p-4">
            <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">Tipografia</div>
            <Pair label="Titulos" value={art.fontHeading} />
            <Pair label="Corpo" value={art.fontBody} />
          </div>
        </div>
      </div>
    </div>
  )
}
