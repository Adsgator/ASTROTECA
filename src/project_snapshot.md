# Project Snapshot

**Projeto:** `src`  
**Gerado em:** 2026-05-27 00:57:09  
**Total de arquivos:** 39  
**Raiz:** `C:\PROJETOS\ADSGATOR\ASTROTECA\src`  

---

## 📁 Estrutura de Arquivos

```
src/
├── 📁 components/
│   ├── 📄 AdminForm.tsx (11.6KB)
│   ├── 📄 AdminPanel.tsx
│   ├── 📄 Builder.tsx (29.4KB)
│   ├── 📄 ComponentBrowser.tsx (29.8KB)
│   ├── 📄 ConfigPanel.tsx
│   ├── 📄 ExtractForm.tsx (15.7KB)
│   └── 📄 RemoveForm.tsx
├── 📁 layouts/
│   ├── 📄 AppLayout.astro
│   └── 📄 PreviewLayout.astro
├── 📁 lib/
│   ├── 📄 github.ts
│   ├── 📄 manifest.ts
│   └── 📄 utils.ts
├── 📁 pages/
│   ├── 📁 admin/
│   │   ├── 📄 extract.astro
│   │   └── 📄 remove.astro
│   ├── 📁 api/
│   │   ├── 📄 create-project.ts
│   │   ├── 📄 extract-component.ts (15.3KB)
│   │   ├── 📄 publish-component.ts
│   │   └── 📄 remove-component.ts
│   ├── 📁 preview/
│   │   ├── 📄 [...slug].astro
│   │   ├── 📄 avaliacoes-google-4249.astro
│   │   ├── 📄 button-3165.astro
│   │   ├── 📄 contact-section.astro
│   │   ├── 📄 cta-banner.astro
│   │   ├── 📄 faq-accordion.astro
│   │   ├── 📄 features-grid-3.astro
│   │   ├── 📄 footer-simples.astro
│   │   ├── 📄 hero-centered.astro
│   │   ├── 📄 hero-simples.astro
│   │   ├── 📄 hero-split.astro
│   │   ├── 📄 pricing-cards.astro
│   │   └── 📄 testimonials-cards.astro
│   ├── 📄 admin.astro
│   ├── 📄 builder.astro
│   ├── 📄 config.astro
│   └── 📄 index.astro
├── 📁 styles/
│   ├── 📄 app.css (20.7KB)
│   └── 📄 ui.ts
├── 📁 types/
│   └── 📄 index.ts
└── 📄 env.d.ts
```

---

## 📄 Conteúdo dos Arquivos

### `env.d.ts`

```typescript
/// <reference path="../.astro/types.d.ts" />
```

### `components\AdminForm.tsx`

```tsx
import { useState } from 'react'
import type { ComponentMeta, PropDefinition, PropDraft, AppSettings } from '../types'
import * as ui from '../styles/ui'

const CATEGORIES = [
  'Hero', 'Features', 'Pricing', 'Testimonials', 'CTA', 'Footer',
  'Navigation', 'FAQ', 'Gallery', 'Contact', 'About', 'Stats', 'Team', 'Misc',
]

const EMPTY_PROP: PropDraft = {
  name: '',
  type: 'string',
  required: false,
  description: '',
  previewValue: '',
}

export default function AdminForm() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Hero')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [bestFor, setBestFor] = useState('')
  const [props, setProps] = useState<PropDraft[]>([])
  const [astroCode, setAstroCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'fail'; message: string } | null>(null)

  function generateId(n: string): string {
    return n
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  function addProp() {
    setProps(prev => [...prev, { ...EMPTY_PROP }])
  }

  function removeProp(index: number) {
    setProps(prev => prev.filter((_, i) => i !== index))
  }

  function updateProp<K extends keyof PropDraft>(index: number, key: K, value: PropDraft[K]) {
    setProps(prev => {
      const arr = [...prev]
      arr[index] = { ...arr[index], [key]: value }
      return arr
    })
  }

  function generatePreviewCode(): string {
    const propsStr = props
      .map(p => {
        if (p.type === 'boolean') return `  ${p.name}={${p.previewValue || 'true'}}`
        if (p.type === 'number') return `  ${p.name}={${p.previewValue || '0'}}`
        if (p.type.includes('[]') || p.type.includes('Array'))
          return `  ${p.name}={${p.previewValue || '[]'}}`
        return `  ${p.name}="${p.previewValue || ''}"`
      })
      .join('\n')

    return `---\nimport ${name} from './${name}.astro'\n---\n\n<${name}\n${propsStr}\n/>`
  }

  function generateIndexCode(): string {
    const propsMeta: PropDefinition[] = props.map(p => ({
      name: p.name,
      type: p.type as PropDefinition['type'],
      required: p.required,
      description: p.description,
      previewValue: p.previewValue || '',
    }))

    const copy: Record<string, string> = {}
    props.forEach(p => {
      if (p.type === 'string' && p.previewValue) {
        copy[p.name] = p.previewValue
      }
    })

    const meta: ComponentMeta = {
      id: generateId(name),
      name,
      category: category as ComponentMeta['category'],
      description,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      bestFor: bestFor.split(',').map(t => t.trim()).filter(Boolean),
      props: propsMeta,
      copy: Object.keys(copy).length > 0 ? copy : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return `export const meta = ${JSON.stringify(meta, null, 2)} as const`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFeedback(null)
    setSubmitting(true)

    try {
      const raw = localStorage.getItem('acs-settings')
      if (!raw) throw new Error('Configure o GitHub em Configuracoes primeiro.')
      const settings: AppSettings = JSON.parse(raw)

      // Validar campos obrigatórios
      if (!settings.githubToken) throw new Error('GitHub token não configurado. Vá para Configuracoes.')
      if (!settings.githubOwner) throw new Error('GitHub owner não configurado. Vá para Configuracoes.')
      if (!settings.componentsRepo) throw new Error('Repo de componentes não configurado. Vá para Configuracoes.')
      if (!settings.registryUrl) throw new Error('URL do registry não configurada. Vá para Configuracoes.')

      const propsMeta: PropDefinition[] = props.map(p => ({
        name: p.name,
        type: p.type as PropDefinition['type'],
        required: p.required,
        description: p.description,
        previewValue: p.previewValue || '',
      }))

      const copy: Record<string, string> = {}
      props.forEach(p => {
        if (p.type === 'string' && p.previewValue) {
          copy[p.name] = p.previewValue
        }
      })

      const meta: ComponentMeta = {
        id: generateId(name),
        name,
        category: category as ComponentMeta['category'],
        description,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        bestFor: bestFor.split(',').map(t => t.trim()).filter(Boolean),
        props: propsMeta,
        copy: Object.keys(copy).length > 0 ? copy : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const previewCode = generatePreviewCode()
      const indexCode = generateIndexCode()

      const res = await fetch('/api/publish-component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings, meta, astroCode, previewCode, indexCode }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao publicar')

      setFeedback({ type: 'ok', message: `Componente "${name}" publicado com sucesso!` })
      setName('')
      setDescription('')
      setTags('')
      setBestFor('')
      setProps([])
      setAstroCode('')
    } catch (e) {
      setFeedback({ type: 'fail', message: e instanceof Error ? e.message : 'Erro desconhecido' })
    } finally {
      setSubmitting(false)
    }
  }

  function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-ink-secondary uppercase tracking-wider">{label}</label>
        {children}
      </div>
    )
  }

  return (
    <form className="max-w-3xl flex flex-col gap-4 stagger" onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold">Adicionar Componente</h1>

      {feedback && (
        <div className={`${ui.badgeBase} ${feedback.type === 'ok' ? 'bg-ok/10 text-ok border border-ok/20' : 'bg-fail/10 text-fail border border-fail/20'} px-3 py-2 animate-slide-down`}>
          {feedback.message}
        </div>
      )}

      <div className={`${ui.cardBase} p-5`}>
        <h2 className="text-lg font-semibold mb-4">Informacoes Basicas</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nome (PascalCase)">
            <input
              className={ui.inputBase}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="HeroSplit"
              required
            />
          </Field>
          <Field label="Categoria">
            <select className={ui.inputBase} value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <div className="col-span-2">
            <Field label="Descricao">
              <input
                className={ui.inputBase}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Descricao curta do componente"
                required
              />
            </Field>
          </div>
          <Field label="Tags (separadas por virgula)">
            <input
              className={ui.inputBase}
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="hero, split, imagem"
            />
          </Field>
          <Field label="Melhor para">
            <input
              className={ui.inputBase}
              value={bestFor}
              onChange={e => setBestFor(e.target.value)}
              placeholder="Landing pages com imagem lateral"
            />
          </Field>
        </div>

        {name && (
          <div className="mt-3 text-sm">
            <span className="text-ink-muted">ID gerado: </span>
            <code className="bg-raised px-1.5 py-0.5 rounded text-xs">{generateId(name)}</code>
          </div>
        )}
      </div>

      <div className={`${ui.cardBase} p-5`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Props</h2>
          <button type="button" className={`${ui.btnOutline} py-1 px-3 text-xs`} onClick={addProp}>
            + Adicionar Prop
          </button>
        </div>

        {props.length === 0 && (
          <div className="text-ink-secondary py-4 text-center">Nenhuma prop adicionada ainda.</div>
        )}

        {props.map((prop, i) => (
          <div key={i} className="grid grid-cols-[1fr_100px_60px_1fr_1fr_auto] gap-2 items-end py-2 border-b border-border last:border-0 animate-slide-down">
            <Field label="Nome">
              <input className={ui.inputBase} value={prop.name} onChange={e => updateProp(i, 'name', e.target.value)} placeholder="titulo" />
            </Field>
            <Field label="Tipo">
              <select className={ui.inputBase} value={prop.type} onChange={e => updateProp(i, 'type', e.target.value)}>
                <option value="string">string</option>
                <option value="number">number</option>
                <option value="boolean">boolean</option>
                <option value="string[]">string[]</option>
                <option value="Record<string, string>">Record</option>
              </select>
            </Field>
            <Field label="Obrig.">
              <input type="checkbox" checked={prop.required} onChange={e => updateProp(i, 'required', e.target.checked)} />
            </Field>
            <Field label="Descricao">
              <input className={ui.inputBase} value={prop.description} onChange={e => updateProp(i, 'description', e.target.value)} placeholder="Descricao" />
            </Field>
            <Field label="Preview">
              <input className={ui.inputBase} value={prop.previewValue} onChange={e => updateProp(i, 'previewValue', e.target.value)} placeholder="Valor" />
            </Field>
            <button type="button" className={`${ui.btnDanger} hover-scale`} onClick={() => removeProp(i)}>×</button>
          </div>
        ))}
      </div>

      <div className={`${ui.cardBase} p-5`}>
        <h2 className="text-lg font-semibold mb-4">Codigo do Componente (.astro)</h2>
        <textarea
          className={`${ui.inputBase} min-h-[300px] font-mono text-sm resize-y`}
          value={astroCode}
          onChange={e => setAstroCode(e.target.value)}
          placeholder={'---\ninterface Props {\n  titulo: string\n}\nconst { titulo } = Astro.props\n---\n\n<section>\n  <h1>{titulo}</h1>\n</section>'}
          required
        />
      </div>

      {name && props.length > 0 && (
        <div className={`${ui.cardBase} p-5`}>
          <h2 className="text-lg font-semibold mb-2">Preview Gerado</h2>
          <pre className="bg-raised p-3 rounded-lg text-xs font-mono overflow-x-auto mb-4">{generatePreviewCode()}</pre>

          <h2 className="text-lg font-semibold mb-2">index.ts Gerado</h2>
          <pre className="bg-raised p-3 rounded-lg text-xs font-mono overflow-x-auto">{generateIndexCode()}</pre>
        </div>
      )}

      <button
        type="submit"
        className={`${ui.btnPrimary} py-3 text-base`}
        disabled={submitting || !name || !astroCode}
        title={!name ? 'Nome do componente é obrigatório' : !astroCode ? 'Código Astro é obrigatório' : 'Publicar componente'}
      >
        {submitting ? 'Publicando...' : 'Publicar Componente'}
      </button>
    </form>
  )
}
```

### `components\AdminPanel.tsx`

```tsx
import { useState } from 'react'
import AdminForm from './AdminForm'
import ExtractForm from './ExtractForm'
import RemoveForm from './RemoveForm'

type Tab = 'adicionar' | 'extrair' | 'remover'

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'adicionar',
    label: 'Adicionar',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v8M8 12h8"/>
      </svg>
    ),
  },
  {
    id: 'extrair',
    label: 'Extrair',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/>
        <path d="M15 3h6v6"/>
        <path d="M10 14L21 3"/>
      </svg>
    ),
  },
  {
    id: 'remover',
    label: 'Remover',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
        <path d="M10 11v6M14 11v6"/>
      </svg>
    ),
  },
]

interface Props {
  initialTab?: Tab
}

export default function AdminPanel({ initialTab = 'adicionar' }: Props) {
  const [active, setActive] = useState<Tab>(initialTab)

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-raised/50 border border-white/[0.05] w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              active === tab.id
                ? 'bg-surface text-ink-primary shadow-sm border border-white/[0.08]'
                : 'text-ink-muted hover:text-ink-secondary'
            } ${tab.id === 'remover' && active === tab.id ? 'text-fail' : ''}`}
          >
            <span className={active === tab.id && tab.id === 'remover' ? 'text-fail' : ''}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="animate-scale-in" key={active}>
        {active === 'adicionar' && <AdminForm />}
        {active === 'extrair'   && <ExtractForm />}
        {active === 'remover'   && <RemoveForm />}
      </div>
    </div>
  )
}
```

### `components\Builder.tsx`

```tsx
import { useState, useEffect, useMemo } from 'react'
import type {
  ComponentMeta,
  ProjectConfig,
  ArtDirection,
  SelectedComponent,
  AppSettings,
} from '../types'
import { generateManifest } from '../lib/manifest'
import * as ui from '../styles/ui'

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
          className="w-10 h-10 rounded-lg border border-border bg-transparent cursor-pointer p-0.5 flex-shrink-0 hover-scale"
        />
        <input
          type="text"
          className={`${ui.inputBase} min-w-0`}
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

      // Validar campos obrigatórios
      if (!settings.githubToken) throw new Error('GitHub token não configurado. Vá para Configuracoes.')
      if (!settings.githubOwner) throw new Error('GitHub owner não configurado. Vá para Configuracoes.')
      if (!settings.baseProjectRepo) throw new Error('Repo base não configurado. Vá para Configuracoes.')
      if (!project.clientName) throw new Error('Nome do cliente é obrigatório.')
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
        <div className={`${ui.cardBase} p-5 space-y-4`}>
          <Pair label="Repositorio" value={result.repoUrl} />
          <div className="flex flex-col gap-2 pt-2">
            <a href={result.repoUrl} target="_blank" rel="noopener" className={ui.btnPrimary}>
              Abrir no GitHub
            </a>
            <a
              href={`vscode://vscode.git/clone?url=${encodeURIComponent(result.cloneUrl)}`}
              className={ui.btnOutline}
            >
              Abrir no VS Code
            </a>
            <button className={ui.btnOutline} onClick={downloadManifest}>
              Baixar Manifesto (.md)
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* --- Main render --- */

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight text-ink-primary">Builder</h1>
          <p className="text-sm text-ink-secondary mt-1">Monte seu projeto escolhendo componentes e configuracoes</p>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-6 min-h-[calc(100vh-14rem)]">
      <div className="flex flex-col gap-5 min-w-0 overflow-x-hidden">
        {/* Step navigation */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-surface/60 border border-white/[0.06] backdrop-blur-xl w-fit">
          {STEPS.map((s, i) => {
            const isActive = step === s
            const stepIdx = STEPS.indexOf(step)
            const isPast = i < stepIdx
            return (
              <button
                key={s}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-accent text-black shadow-[0_2px_8px_rgba(240,165,0,0.25)]'
                    : isPast
                    ? 'text-accent hover:bg-raised'
                    : 'text-ink-secondary hover:bg-raised hover:text-ink-primary'
                }`}
                onClick={() => setStep(s)}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isActive ? 'bg-black/20 text-black animate-glow' : isPast ? 'bg-accent/10 text-accent' : 'bg-raised text-ink-muted'
                }`}>
                  {isPast ? '✓' : i + 1}
                </span>
                {s}
              </button>
            )
          })}
        </div>

        {/* --- Step 1: Configurar --- */}
        {step === 'Configurar' && (
          <div className={`${ui.cardBase} animate-scale-in`}>
            <div className="p-5 space-y-6">
              <h2 className="text-lg font-semibold">Dados do Projeto</h2>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nome do cliente">
                  <input
                    className={ui.inputBase}
                    value={project.clientName}
                    onChange={e => updateProject('clientName', e.target.value)}
                    placeholder="acme-corp"
                  />
                </Field>
                <Field label="Tipo de projeto">
                  <select
                    className={ui.inputBase}
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
                    className={ui.inputBase}
                    value={project.niche}
                    onChange={e => updateProject('niche', e.target.value)}
                    placeholder="ex: saude, tech, educacao"
                  />
                </Field>
                <Field label="Objetivo da pagina">
                  <input
                    className={ui.inputBase}
                    value={project.pageGoal}
                    onChange={e => updateProject('pageGoal', e.target.value)}
                    placeholder="ex: captar leads, vender produto"
                  />
                </Field>
                <Field label="URL do site">
                  <input
                    className={ui.inputBase}
                    value={project.siteUrl}
                    onChange={e => updateProject('siteUrl', e.target.value)}
                    placeholder="https://..."
                  />
                </Field>
                <Field label="Google Analytics ID">
                  <input
                    className={ui.inputBase}
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
                    className={ui.inputBase}
                    value={art.fontHeading}
                    onChange={e => updateArt('fontHeading', e.target.value)}
                    placeholder="Inter"
                  />
                </Field>
                <Field label="Fonte do corpo">
                  <input
                    className={ui.inputBase}
                    value={art.fontBody}
                    onChange={e => updateArt('fontBody', e.target.value)}
                    placeholder="Inter"
                  />
                </Field>
                <div className="col-span-2">
                  <Field label="Mood / Tom">
                    <input
                      className={ui.inputBase}
                      value={art.mood}
                      onChange={e => updateArt('mood', e.target.value)}
                      placeholder="ex: profissional, acolhedor, moderno"
                    />
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label="Referencias visuais">
                    <textarea
                      className={`${ui.inputBase} min-h-[80px] resize-y`}
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
                      className={`${ui.inputBase} min-h-[80px] resize-y`}
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

        {/* --- Step 2: Componentes — preview da página montada --- */}
        {step === 'Componentes' && (
          <div className="space-y-3 animate-scale-in">
            {selected.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-white/[0.08] text-ink-muted gap-3">
                <svg className="w-10 h-10 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                <p className="text-sm">Nenhum componente adicionado ainda.</p>
                <p className="text-xs text-ink-muted/60">Vá até a Biblioteca e adicione componentes ao Builder.</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-ink-muted pb-1">
                  {selected.length} componente{selected.length !== 1 ? 's' : ''} — reordene na aba Revisar
                </p>
                {selected.map((sc) => (
                  <div key={sc.meta.id} className="rounded-xl border border-white/[0.06] bg-surface/40 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05]">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded bg-accent/10 text-accent flex items-center justify-center text-xs font-bold">{sc.position}</span>
                        <span className="text-sm font-semibold text-ink-primary">{sc.meta.name}</span>
                        <span className="text-[10px] text-ink-muted bg-raised px-2 py-0.5 rounded-full">{sc.meta.category}</span>
                      </div>
                      <button
                        className="text-ink-muted hover:text-fail transition-colors"
                        title="Remover"
                        onClick={() => toggleComponent(sc.meta)}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                    {sc.meta.previewUrl ? (
                      <iframe
                        src={sc.meta.previewUrl}
                        title={sc.meta.name}
                        className="w-full border-0"
                        style={{ height: '320px' }}
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-24 text-ink-muted text-sm">
                        Preview não disponível
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* --- Step 3: Revisar --- */}
        {step === 'Revisar' && (
          <div className="space-y-4 animate-scale-in">
            {/* Project summary */}
            <div className={ui.cardBase}>
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
            <div className={ui.cardBase}>
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
                              className={`${ui.btnGhost} px-2 py-1`}
                              onClick={() => moveComponent(index, 'up')}
                              disabled={index === 0}
                            >
                              ↑
                            </button>
                            <button
                              className={`${ui.btnGhost} px-2 py-1`}
                              onClick={() => moveComponent(index, 'down')}
                              disabled={index === selected.length - 1}
                            >
                              ↓
                            </button>
                            <button
                              className={`${ui.btnDanger} px-2 py-1`}
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
                                        className={`${ui.inputBase} min-h-[60px] resize-y`}
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
              <button className={ui.btnOutline} onClick={downloadManifest} title={selected.length === 0 ? 'Adicione componentes antes de baixar' : 'Baixar manifesto como arquivo Markdown'}>
                Baixar Manifesto (.md)
              </button>
              <button
                className={ui.btnPrimary}
                onClick={createProject}
                disabled={creating || !project.clientName}
                title={
                  !project.clientName
                    ? 'Nome do cliente é obrigatório'
                    : selected.length === 0
                    ? 'Adicione pelo menos um componente'
                    : 'Criar projeto no GitHub (requer configuração do GitHub em Configuracoes)'
                }
              >
                {creating ? 'Criando...' : 'Criar Projeto no GitHub'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- Right Sidebar --- */}
      <div className="flex flex-col gap-3 animate-slide-right stagger">
        <div className="rounded-xl border border-white/[0.06] bg-surface/60 backdrop-blur-xl overflow-hidden">
          <div className="p-4">
            <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Cliente
            </div>
            <div className="font-medium">{project.clientName || '(nao definido)'}</div>
            <div className="text-sm text-ink-secondary">
              {project.projectType} - {project.niche || '-'}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-surface/60 backdrop-blur-xl overflow-hidden">
          <div className="p-4">
            <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Estrutura da Pagina
            </div>
            {selected.length === 0 ? (
              <div className="text-sm text-ink-secondary">Nenhum componente adicionado</div>
            ) : (
              <div className="space-y-1">
                {selected.map(sc => (
                  <div key={sc.meta.id} className="flex items-center gap-2 text-sm">
                    <span className={`${ui.badgeBase} bg-accent/10 text-accent`}>{sc.position}</span>
                    <span>{sc.meta.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-surface/60 backdrop-blur-xl overflow-hidden">
          <div className="p-4">
            <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              Cores
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="w-8 h-8 rounded-lg border border-border" style={{ background: art.colorPrimary }} title="Primaria" />
              <div className="w-8 h-8 rounded-lg border border-border" style={{ background: art.colorSecondary }} title="Secundaria" />
              <div className="w-8 h-8 rounded-lg border border-border" style={{ background: art.colorBackground }} title="Fundo" />
              <div className="w-8 h-8 rounded-lg border border-border" style={{ background: art.colorText }} title="Texto" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-surface/60 backdrop-blur-xl overflow-hidden">
          <div className="p-4">
            <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Tipografia
            </div>
            <Pair label="Titulos" value={art.fontHeading} />
            <Pair label="Corpo" value={art.fontBody} />
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
```

### `components\ComponentBrowser.tsx`

```tsx
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
  const [toast, setToast] = useState<string | null>(null)
  const [builderIds, setBuilderIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    try {
      const raw = localStorage.getItem('acs-builder-components')
      const list: SelectedComponent[] = raw ? JSON.parse(raw) : []
      return new Set(list.map(s => s.meta.id))
    } catch { return new Set() }
  })

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
    if (list.some(s => s.meta.id === meta.id)) {
      setToast(`${meta.name} já está no Builder`)
      setTimeout(() => setToast(null), 3000)
      return
    }
    list.push({ meta, position: list.length + 1 })
    localStorage.setItem('acs-builder-components', JSON.stringify(list))
    setBuilderIds(prev => new Set([...prev, meta.id]))
    setAddedId(meta.id)
    setToast(`${meta.name} adicionado ao Builder!`)
    setTimeout(() => setAddedId(null), 2000)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-surface border border-white/[0.08] shadow-2xl text-sm text-ink-primary animate-fade-in">
          <svg className="w-4 h-4 text-ok shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
          {toast}
        </div>
      )}
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
                      builderIds.has(selected.id)
                        ? 'bg-ok/20 text-ok border border-ok/30 cursor-default'
                        : addedId === selected.id
                          ? 'bg-ok text-black shadow-[0_2px_12px_rgba(34,197,94,0.3)]'
                          : 'bg-gradient-to-r from-accent to-[#d4920a] text-black shadow-[0_2px_12px_rgba(240,165,0,0.25)] hover:shadow-[0_4px_20px_rgba(240,165,0,0.35)]'
                    }`}
                    onClick={() => addToBuilder(selected)}
                  >
                    {builderIds.has(selected.id) ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                        Já no Builder
                      </span>
                    ) : addedId === selected.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                        Adicionado!
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
```

### `components\ConfigPanel.tsx`

```tsx
import { useState, useEffect } from 'react'
import type { AppSettings } from '../types'
import { validateGithubToken } from '../lib/github'
import * as ui from '../styles/ui'

const DEFAULT_SETTINGS: AppSettings = {
  githubToken: '',
  githubOwner: '',
  componentsRepo: 'minha-lib-astro',
  baseProjectRepo: '_base-project',
  previewBaseUrl: '',
  registryUrl: '',
  studioName: 'Astroteca Studio',
  manifestTemplate: '',
  defaultFontHeading: 'Inter',
  defaultFontBody: 'Inter',
  defaultColorPrimary: '#6366f1',
  defaultCtaLabel: 'Saiba mais',
  npmNamespace: '@astroteca',
  userName: '',
  userEmail: '',
}

export default function ConfigPanel() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)
  const [validating, setValidating] = useState(false)
  const [tokenError, setTokenError] = useState('')
  const [tokenUser, setTokenUser] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('acs-settings')
    if (saved) {
      setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) })
    }
  }, [])

  function update<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function handleSave() {
    localStorage.setItem('acs-settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleValidateToken() {
    setValidating(true)
    setTokenError('')
    setTokenUser(null)
    try {
      const result = await validateGithubToken(settings.githubToken)
      if (result.valid) {
        setTokenUser(result.login || 'Autenticado')
      } else {
        setTokenError(result.error || 'Token invalido')
      }
    } catch (e) {
      setTokenError(e instanceof Error ? e.message : 'Erro ao validar')
    } finally {
      setValidating(false)
    }
  }

  function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-ink-secondary uppercase tracking-wider">{label}</label>
        {children}
      </div>
    )
  }

  return (
    <div className="max-w-3xl flex flex-col gap-4 stagger">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Configuracoes</h1>
        <button onClick={handleSave} className={`${saved ? ui.btnSuccess : ui.btnPrimary} ${saved ? 'animate-scale-in' : ''}`}>
          {saved ? 'Salvo!' : 'Salvar'}
        </button>
      </div>

      {(!settings.githubToken || !settings.githubOwner || !settings.registryUrl) && (
        <div className={`${ui.cardBase} p-4 bg-amber-50/10 border-l-2 border-amber-500`}>
          <div className="text-sm text-amber-700 font-medium">⚠️ Configuração incompleta</div>
          <div className="text-xs text-amber-600 mt-1">
            Você precisa configurar: {[
              !settings.githubToken && 'Token',
              !settings.githubOwner && 'Owner',
              !settings.registryUrl && 'URL do Registry'
            ].filter(Boolean).join(', ')}. Sem isso, os botões de publicar e criar projetos não funcionarão.
          </div>
        </div>
      )}

      <div className={`${ui.cardBase} p-5`}>
        <h2 className="text-lg font-semibold mb-4">GitHub</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Field label="Token de Acesso">
              <input
                className={ui.inputBase}
                type="password"
                value={settings.githubToken}
                onChange={e => {
                  update('githubToken', e.target.value)
                  setTokenUser(null)
                  setTokenError('')
                }}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              />
            </Field>
            <div className="flex gap-2 mt-2">
              <button
                className={`${ui.btnOutline} py-1 px-3 text-xs`}
                onClick={handleValidateToken}
                disabled={validating || !settings.githubToken}
                title={!settings.githubToken ? 'Digite um token antes de validar' : 'Verificar se o token é válido'}
              >
                {validating ? 'Validando...' : 'Validar Token'}
              </button>
              {tokenUser && <span className={`${ui.badgeBase} bg-ok/10 text-ok border border-ok/20 animate-scale-in`}>✓ {tokenUser}</span>}
              {tokenError && <span className={`${ui.badgeBase} bg-fail/10 text-fail border border-fail/20 animate-scale-in`}>✗ {tokenError}</span>}
            </div>
          </div>
          <Field label="Owner (usuario ou org)">
            <input
              className={ui.inputBase}
              value={settings.githubOwner}
              onChange={e => update('githubOwner', e.target.value)}
              placeholder="seuusuario"
            />
          </Field>
          <Field label="Repo de Componentes">
            <input
              className={ui.inputBase}
              value={settings.componentsRepo}
              onChange={e => update('componentsRepo', e.target.value)}
              placeholder="minha-lib-astro"
            />
          </Field>
          <Field label="Repo Base (template)">
            <input
              className={ui.inputBase}
              value={settings.baseProjectRepo}
              onChange={e => update('baseProjectRepo', e.target.value)}
              placeholder="_base-project"
            />
          </Field>
          <div className="col-span-2">
            <Field label="URL do Registry">
              <input
                className={ui.inputBase}
                value={settings.registryUrl}
                onChange={e => update('registryUrl', e.target.value)}
                placeholder="https://raw.githubusercontent.com/.../registry.json"
              />
            </Field>
          </div>
        </div>
      </div>

      <div className={`${ui.cardBase} p-5`}>
        <h2 className="text-lg font-semibold mb-4">Padroes</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fonte dos Titulos">
            <input
              className={ui.inputBase}
              value={settings.defaultFontHeading}
              onChange={e => update('defaultFontHeading', e.target.value)}
              placeholder="Inter"
            />
          </Field>
          <Field label="Fonte do Corpo">
            <input
              className={ui.inputBase}
              value={settings.defaultFontBody}
              onChange={e => update('defaultFontBody', e.target.value)}
              placeholder="Inter"
            />
          </Field>
          <Field label="Cor Primaria Padrao">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.defaultColorPrimary}
                onChange={e => update('defaultColorPrimary', e.target.value)}
                className="w-10 h-10 rounded-lg border border-border bg-transparent cursor-pointer p-0.5 hover-scale"
              />
              <input
                type="text"
                className={ui.inputBase}
                value={settings.defaultColorPrimary}
                onChange={e => update('defaultColorPrimary', e.target.value)}
                placeholder="#6366f1"
              />
            </div>
          </Field>
        </div>
      </div>

      <div className={`${ui.cardBase} p-5`}>
        <h2 className="text-lg font-semibold mb-4">Studio</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nome do Studio">
            <input
              className={ui.inputBase}
              value={settings.studioName}
              onChange={e => update('studioName', e.target.value)}
              placeholder="Astroteca Studio"
            />
          </Field>
          <Field label="Namespace NPM">
            <input
              className={ui.inputBase}
              value={settings.npmNamespace}
              onChange={e => update('npmNamespace', e.target.value)}
              placeholder="@astroteca"
            />
          </Field>
        </div>
      </div>

      <div className={`${ui.cardBase} p-5`}>
        <h2 className="text-lg font-semibold mb-4">Usuario Git</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nome">
            <input
              className={ui.inputBase}
              value={settings.userName}
              onChange={e => update('userName', e.target.value)}
              placeholder="Seu Nome"
            />
          </Field>
          <Field label="Email">
            <input
              className={ui.inputBase}
              type="email"
              value={settings.userEmail}
              onChange={e => update('userEmail', e.target.value)}
              placeholder="seu@email.com"
            />
          </Field>
        </div>
      </div>

      <div className={`${ui.cardBase} p-5`}>
        <h2 className="text-lg font-semibold mb-4">Template do Manifesto</h2>
        <textarea
          className={`${ui.inputBase} min-h-[200px] font-mono text-sm resize-y`}
          value={settings.manifestTemplate}
          onChange={e => update('manifestTemplate', e.target.value)}
          placeholder="# {{PROJECT_NAME}}\n\n## Art Direction\n..."
          rows={10}
        />
      </div>
    </div>
  )
}
```

### `components\ExtractForm.tsx`

```tsx
import { useState } from 'react'
import * as ui from '../styles/ui'

const CATEGORIES = [
  'Hero', 'Features', 'Services', 'Testimonials', 'Process',
  'Pricing', 'FAQ', 'CTA', 'Contact', 'Footer', 'Trust', 'UI', 'Other',
]

interface ChildInfo {
  importName: string
  fileName: string
  suggestedCategory: string
}

interface PropInfo {
  name: string
  type: string
  required: boolean
}

type Phase = 'idle' | 'analyzing' | 'ready' | 'extracting' | 'done' | 'error'

export default function ExtractForm() {
  const [filePath, setFilePath] = useState('')
  const [dragging, setDragging] = useState(false)
  const [dropHint, setDropHint] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [error, setError] = useState('')

  // Dados analisados
  const [fileName, setFileName] = useState('')
  const [detectedProps, setDetectedProps] = useState<PropInfo[]>([])
  const [children, setChildren] = useState<ChildInfo[]>([])

  // Form
  const [category, setCategory] = useState('Other')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [bestFor, setBestFor] = useState('')
  const [chosenChildren, setChosenChildren] = useState<string[]>([])

  // Resultado
  const [result, setResult] = useState<{
    name: string; id: string; category: string
    children: { childName: string; childCategory: string }[]
    gitWarning?: string
  } | null>(null)

  async function analyze() {
    setError('')
    setPhase('analyzing')
    try {
      const res = await fetch('/api/extract-component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: filePath.trim(), phase: 'analyze' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setFileName(data.fileName)
      setDetectedProps(data.props)
      setChildren(data.children)
      setChosenChildren(data.children.map((c: ChildInfo) => c.importName))
      setCategory(guessCategory(data.fileName))
      setPhase('ready')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao analisar')
      setPhase('error')
    }
  }

  async function extract() {
    setError('')
    setPhase('extracting')
    try {
      const res = await fetch('/api/extract-component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath: filePath.trim(),
          phase: 'extract',
          category,
          description,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          bestFor: bestFor.split(',').map(t => t.trim()).filter(Boolean),
          chosenChildren,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
      setPhase('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao extrair')
      setPhase('error')
    }
  }

  function reset() {
    setFilePath(''); setPhase('idle'); setError(''); setFileName('')
    setDetectedProps([]); setChildren([]); setChosenChildren([])
    setDescription(''); setTags(''); setBestFor(''); setResult(null)
  }

  function toggleChild(importName: string) {
    setChosenChildren(prev =>
      prev.includes(importName) ? prev.filter(c => c !== importName) : [...prev, importName]
    )
  }

  return (
    <div className="max-w-2xl flex flex-col gap-5 stagger">
      <div>
        <h1 className="text-2xl font-bold mb-1">Extrair Componente</h1>
        <p className="text-sm text-ink-muted">
          Aponte para um <code className="bg-raised px-1 rounded">.astro</code> em qualquer projeto local.
          O sistema analisa, sanitiza e publica direto no GitHub.
        </p>
      </div>

      {/* ── Passo 1: Caminho ── */}
      <div className={`${ui.cardBase} p-5`}>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted mb-3">1. Arquivo</h2>

        {/* Zona de drag & drop */}
        <div
          className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors p-6 mb-3 cursor-default ${
            dragging
              ? 'border-accent bg-accent/10 text-accent'
              : 'border-white/10 bg-raised/30 text-ink-muted hover:border-white/20'
          }`}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault()
            setDragging(false)
            const file = e.dataTransfer.files[0]
            if (file) {
              // file.path só existe em Electron — no browser só temos o nome
              // Tenta pegar o path completo via item.getAsString (não suportado)
              // Fallback: sugerir o nome e deixar o usuário completar o caminho
              const fullPath = (file as any).path
              if (fullPath) {
                setFilePath(fullPath)
                setDropHint('')
                if (phase !== 'idle') reset()
              } else {
                setDropHint(`Arquivo detectado: "${file.name}". Complete o caminho no campo abaixo.`)
              }
            }
          }}
        >
          <svg className="w-8 h-8 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <p className="text-sm">{dragging ? 'Solte aqui' : 'Arraste o arquivo .astro aqui'}</p>
          <p className="text-xs opacity-50">ou cole o caminho abaixo</p>
        </div>

        <div className="flex gap-2">
          <input
            className={ui.inputBase}
            placeholder="C:/PROJETOS/meu-projeto/src/components/Footer.astro"
            value={filePath}
            onChange={e => { setFilePath(e.target.value.replace(/^["']|["']$/g, '')); if (phase !== 'idle') reset() }}
            disabled={phase === 'analyzing' || phase === 'extracting'}
          />
          <button
            className={`${ui.btnPrimary} whitespace-nowrap`}
            onClick={analyze}
            disabled={!filePath.trim() || phase === 'analyzing' || phase === 'extracting'}
          >
            {phase === 'analyzing' ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25"/><path d="M21 12a9 9 0 00-9-9"/></svg>
                Analisando...
              </span>
            ) : 'Analisar'}
          </button>
        </div>

        {dropHint && (
          <div className="mt-2 flex items-start gap-2 text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-2">
            <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>{dropHint} <strong>Dica:</strong> Shift + botão direito no arquivo → "Copiar como caminho"</span>
          </div>
        )}

        {phase === 'ready' && (
          <div className="mt-3 flex items-center gap-2 text-ok text-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span><strong>{fileName}</strong> — {detectedProps.length} prop(s) detectada(s)</span>
          </div>
        )}
      </div>

      {/* ── Passo 2: Componentes filhos ── */}
      {(phase === 'ready' || phase === 'extracting' || phase === 'done') && children.length > 0 && (
        <div className={`${ui.cardBase} p-5`}>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted mb-3">
            2. Componentes Filhos Detectados
          </h2>
          <p className="text-xs text-ink-muted mb-3">Selecione quais quer importar para a biblioteca:</p>
          <div className="flex flex-col gap-2">
            {children.map(c => (
              <label
                key={c.importName}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  chosenChildren.includes(c.importName)
                    ? 'border-accent/40 bg-accent/5'
                    : 'border-white/[0.05] bg-raised/40'
                }`}
              >
                <input
                  type="checkbox"
                  checked={chosenChildren.includes(c.importName)}
                  onChange={() => toggleChild(c.importName)}
                  className="accent-accent"
                  disabled={phase === 'extracting' || phase === 'done'}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-ink-primary">{c.importName}</span>
                  <span className="text-xs text-ink-muted ml-2">{c.fileName}</span>
                </div>
                <span className={`${ui.badgeBase} bg-raised text-ink-muted text-[10px]`}>
                  → {c.suggestedCategory}/
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ── Passo 3: Metadados ── */}
      {(phase === 'ready' || phase === 'extracting' || phase === 'done') && (
        <div className={`${ui.cardBase} p-5`}>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted mb-4">
            {children.length > 0 ? '3.' : '2.'} Metadados
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <label className="block text-xs font-medium text-ink-secondary uppercase tracking-wider">Categoria</label>
              <select
                className={ui.inputBase}
                value={category}
                onChange={e => setCategory(e.target.value)}
                disabled={phase === 'extracting' || phase === 'done'}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="block text-xs font-medium text-ink-secondary uppercase tracking-wider">Descrição</label>
              <input
                className={ui.inputBase}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Rodapé com redes sociais e contato"
                disabled={phase === 'extracting' || phase === 'done'}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-ink-secondary uppercase tracking-wider">Tags</label>
              <input
                className={ui.inputBase}
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="footer, rodape, social"
                disabled={phase === 'extracting' || phase === 'done'}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-ink-secondary uppercase tracking-wider">Ideal para</label>
              <input
                className={ui.inputBase}
                value={bestFor}
                onChange={e => setBestFor(e.target.value)}
                placeholder="toda landing page"
                disabled={phase === 'extracting' || phase === 'done'}
              />
            </div>
          </div>

          {detectedProps.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-raised/50 border border-white/[0.04]">
              <p className="text-xs text-ink-muted mb-2 font-medium">Props detectadas automaticamente:</p>
              <div className="flex flex-wrap gap-1.5">
                {detectedProps.map(p => (
                  <span key={p.name} className={`${ui.badgeBase} bg-surface text-ink-secondary`}>
                    {p.name}
                    <span className="opacity-50 ml-1">{p.type}</span>
                    {p.required && <span className="ml-1 text-accent">*</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Erro ── */}
      {error && (
        <div className={`${ui.badgeBase} bg-fail/10 text-fail border border-fail/20 px-3 py-2.5 text-sm`}>
          {error}
        </div>
      )}

      {/* ── Resultado ── */}
      {phase === 'done' && result && (
        <div className={`${ui.cardBase} p-5 border-ok/20 bg-ok/5`}>
          <div className="flex items-center gap-2 text-ok mb-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span className="font-semibold">Componente extraído e publicado!</span>
          </div>
          <div className="space-y-1 text-sm text-ink-secondary">
            <p><span className="text-ink-muted">Nome:</span> <code className="bg-raised px-1 rounded text-xs">{result.name}</code></p>
            <p><span className="text-ink-muted">ID:</span> <code className="bg-raised px-1 rounded text-xs">{result.id}</code></p>
            <p><span className="text-ink-muted">Pasta:</span> <code className="bg-raised px-1 rounded text-xs">{result.category}/</code></p>
            {result.children.length > 0 && (
              <p><span className="text-ink-muted">Filhos:</span> {result.children.map(c => (
                <code key={c.childName} className="bg-raised px-1 rounded text-xs mr-1">{c.childCategory}/{c.childName}</code>
              ))}</p>
            )}
          </div>
          {result.gitWarning && (
            <div className="mt-3 p-2.5 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs">
              ⚠️ {result.gitWarning}
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <a href="/" className={`${ui.btnOutline} text-sm`}>Ver na Biblioteca</a>
            <button onClick={reset} className={`${ui.btnGhost} text-sm`}>Extrair outro</button>
          </div>
        </div>
      )}

      {/* ── Botão extrair ── */}
      {(phase === 'ready' || phase === 'extracting') && (
        <button
          className={`${ui.btnPrimary} py-3 text-base`}
          onClick={extract}
          disabled={phase === 'extracting' || !description.trim()}
          title={!description.trim() ? 'Descrição é obrigatória' : ''}
        >
          {phase === 'extracting' ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25"/><path d="M21 12a9 9 0 00-9-9"/></svg>
              Extraindo e publicando...
            </span>
          ) : 'Extrair e publicar no GitHub'}
        </button>
      )}
    </div>
  )
}

function guessCategory(fileName: string): string {
  const n = fileName.toLowerCase().replace(/\.\w+$/, '')
  if (n.includes('hero'))        return 'Hero'
  if (n.includes('footer'))      return 'Footer'
  if (n.includes('feature'))     return 'Features'
  if (n.includes('service'))     return 'Services'
  if (n.includes('testimonial')) return 'Testimonials'
  if (n.includes('pric'))        return 'Pricing'
  if (n.includes('faq'))         return 'FAQ'
  if (n.includes('cta'))         return 'CTA'
  if (n.includes('contact'))     return 'Contact'
  if (n.includes('trust'))       return 'Trust'
  return 'Other'
}
```

### `components\RemoveForm.tsx`

```tsx
import { useState, useEffect } from 'react'
import * as ui from '../styles/ui'

interface ComponentEntry {
  id: string
  name: string
  category: string
  description: string
  componentFile: string
}

export default function RemoveForm() {
  const [components, setComponents] = useState<ComponentEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<ComponentEntry | null>(null)
  const [removing, setRemoving] = useState(false)
  const [result, setResult] = useState<{ name: string; removed: string[] } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/remove-component')
      .then(r => r.json())
      .then(data => { setComponents(data); setLoading(false) })
      .catch(() => { setError('Erro ao carregar componentes.'); setLoading(false) })
  }, [result]) // recarrega após remoção

  const filtered = components.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase()) ||
    c.id.includes(search.toLowerCase())
  )

  async function handleRemove() {
    if (!selected) return
    setError('')
    setRemoving(true)
    try {
      const res = await fetch('/api/remove-component', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult({ name: data.name, removed: data.removed })
      setSelected(null)
      setSearch('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao remover')
    } finally {
      setRemoving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-ink-muted py-10">
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25"/><path d="M21 12a9 9 0 00-9-9"/></svg>
        Carregando componentes...
      </div>
    )
  }

  return (
    <div className="max-w-2xl flex flex-col gap-5 stagger">
      <div>
        <h1 className="text-2xl font-bold mb-1">Remover Componente</h1>
        <p className="text-sm text-ink-muted">
          Remove da biblioteca local e do repositório no GitHub.
        </p>
      </div>

      {result && (
        <div className={`${ui.cardBase} p-4 border-ok/20 bg-ok/5`}>
          <div className="flex items-center gap-2 text-ok mb-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span className="font-semibold">"{result.name}" removido com sucesso!</span>
          </div>
          <div className="text-xs text-ink-muted space-y-0.5">
            {result.removed.map(f => <p key={f}>✓ {f}</p>)}
          </div>
          <button onClick={() => setResult(null)} className={`${ui.btnGhost} text-xs mt-3`}>
            Remover outro
          </button>
        </div>
      )}

      {error && (
        <div className={`${ui.badgeBase} bg-fail/10 text-fail border border-fail/20 px-3 py-2.5 text-sm`}>
          {error}
        </div>
      )}

      {/* Lista de componentes */}
      <div className={`${ui.cardBase} p-5`}>
        <div className="mb-4">
          <input
            className={ui.inputBase}
            placeholder="Buscar por nome, categoria ou ID..."
            value={search}
            onChange={e => { setSearch(e.target.value); setSelected(null) }}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-ink-muted text-sm text-center py-6">Nenhum componente encontrado.</p>
        ) : (
          <div className="flex flex-col gap-1.5 max-h-[420px] overflow-y-auto pr-1">
            {filtered.map(c => (
              <button
                key={c.id}
                onClick={() => setSelected(selected?.id === c.id ? null : c)}
                className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors w-full ${
                  selected?.id === c.id
                    ? 'border-fail/40 bg-fail/5'
                    : 'border-white/[0.05] bg-raised/40 hover:border-white/10'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ink-primary">{c.name}</span>
                    <span className={`${ui.badgeBase} bg-raised text-ink-muted text-[10px]`}>{c.category}</span>
                  </div>
                  <p className="text-xs text-ink-muted truncate mt-0.5">{c.description || c.id}</p>
                </div>
                {selected?.id === c.id && (
                  <svg className="w-4 h-4 text-fail shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Confirmação */}
      {selected && (
        <div className={`${ui.cardBase} p-5 border-fail/20 bg-fail/5`}>
          <p className="text-sm text-ink-secondary mb-1">
            Remover <strong className="text-ink-primary">{selected.name}</strong>?
          </p>
          <p className="text-xs text-ink-muted mb-4">
            Isso apaga <code className="bg-raised px-1 rounded">{selected.componentFile}</code>,
            o preview e a entrada no registry — local e no GitHub.
          </p>
          <div className="flex gap-2">
            <button
              className={`${ui.btnDanger} flex items-center gap-2`}
              onClick={handleRemove}
              disabled={removing}
            >
              {removing ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25"/><path d="M21 12a9 9 0 00-9-9"/></svg>
                  Removendo...
                </>
              ) : 'Confirmar remoção'}
            </button>
            <button className={ui.btnGhost} onClick={() => setSelected(null)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}
```

### `layouts\AppLayout.astro`

```text
---
import '../styles/app.css'

interface Props {
  title?: string
  description?: string
}

const { title = 'Astroteca', description = 'Biblioteca de componentes Astro para criacao rapida de projetos web premium.' } = Astro.props
const currentPath = Astro.url.pathname

const navItems = [
  { href: '/', label: 'Biblioteca', icon: 'grid' },
  { href: '/builder', label: 'Builder', icon: 'layers' },
  { href: '/admin', label: 'Gerenciar', icon: 'manage' },
  { href: '/config', label: 'Configuracoes', icon: 'settings' },
]

const icons: Record<string, string> = {
  grid: '<path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  layers: '<path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M2 17l10 5 10-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M2 12l10 5 10-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  plus: '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/>',
  manage: '<rect x="3" y="3" width="7" height="5" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="3" y="11" width="7" height="10" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="14" y="3" width="7" height="10" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="14" y="16" width="7" height="5" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/>',
}
---

<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content={description} />
  <meta name="theme-color" content="#06060e" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content="website" />
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23f0a500'/%3E%3Ctext x='16' y='23' text-anchor='middle' font-size='20' font-weight='bold' fill='%23000'%3EA%3C/text%3E%3C/svg%3E" />
  <title>{title}</title>
</head>
<body>
  <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Menu">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
  </button>
  <div class="mobile-overlay" id="mobile-overlay"></div>

  <div class="app-shell">
    <aside class="app-sidebar" id="app-sidebar">
      <div class="p-5 border-b border-border">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0 animate-float">
            <span class="text-black font-bold text-sm font-heading">A</span>
          </div>
          <div class="min-w-0">
            <span class="font-heading text-base font-bold text-ink-primary tracking-tight block leading-none">Astroteca</span>
            <span class="text-[10px] text-ink-muted font-medium tracking-wider uppercase">Component Studio</span>
          </div>
        </div>
      </div>

      <nav class="flex-1 p-3 flex flex-col gap-0.5">
        <div class="section-title mt-2 mb-2">Menu</div>
        {navItems.map((item) => {
          const isActive = currentPath === item.href || (item.href !== '/' && item.href !== '/admin' && currentPath.startsWith(item.href))
          return (
            <a
              href={item.href}
              class={isActive ? 'sidebar-link active' : 'sidebar-link'}
            >
              <svg class="sidebar-icon" width="18" height="18" viewBox="0 0 24 24" set:html={icons[item.icon]} />
              {item.label}
            </a>
          )
        })}
      </nav>

      <div class="p-4 border-t border-border">
        <div class="flex items-center justify-between">
          <span class="text-[11px] text-ink-muted">Astroteca Studio</span>
          <span class="badge badge-default text-[10px]">v2.0</span>
        </div>
      </div>
    </aside>

    <main class="app-main overflow-x-hidden">
      <div class="page-enter">
        <slot />
      </div>
    </main>
  </div>

  <script is:inline>
    const btn = document.getElementById('mobile-menu-btn')
    const sidebar = document.getElementById('app-sidebar')
    const overlay = document.getElementById('mobile-overlay')
    if (btn && sidebar && overlay) {
      function toggleMenu() {
        sidebar.classList.toggle('open')
        overlay.classList.toggle('open')
      }
      btn.addEventListener('click', toggleMenu)
      overlay.addEventListener('click', toggleMenu)
    }
  </script>
</body>
</html>
```

### `layouts\PreviewLayout.astro`

```text
---
import '../styles/app.css'

interface Props {
  fontsUrl?: string
  cssTokens?: string
}

const { fontsUrl, cssTokens } = Astro.props
---
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  {fontsUrl
    ? <link rel="stylesheet" href={fontsUrl} />
    : <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  }
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--font-sans, var(--font-body, 'Inter', sans-serif)); background: #fff; -webkit-font-smoothing: antialiased; }
  </style>
  {cssTokens && <style set:html={cssTokens} />}
</head>
<body>
  <slot />
</body>
</html>
```

### `lib\github.ts`

```typescript
// src/lib/github.ts

import type { ComponentMeta, AppSettings, CreateProjectResult } from '../types'
import { toBase64, slugify, wait } from './utils'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

function apiUrl(path: string) {
  return `https://api.github.com${path}`
}

// ─── Registry ────────────────────────────────────────────────────────────────

/**
 * Busca o registry.json diretamente da URL raw do GitHub
 * (não precisa de token se o repo for público)
 */
export async function fetchRegistry(registryUrl: string): Promise<ComponentMeta[]> {
  const res = await fetch(`${registryUrl}?t=${Date.now()}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Erro ao buscar registry: ${res.status}`)
  return res.json()
}

/**
 * Atualiza o registry.json no GitHub
 */
export async function updateRegistry(
  settings: AppSettings,
  components: ComponentMeta[]
): Promise<void> {
  const { githubToken, githubOwner, componentsRepo } = settings
  const path = `/repos/${githubOwner}/${componentsRepo}/contents/registry.json`

  // Busca o SHA atual do arquivo (necessário para atualizar)
  let sha: string | undefined
  try {
    const existing = await fetch(apiUrl(path), { headers: headers(githubToken) })
    if (existing.ok) {
      const data = await existing.json()
      sha = data.sha
    }
  } catch {}

  const content = toBase64(JSON.stringify(components, null, 2))

  const res = await fetch(apiUrl(path), {
    method: 'PUT',
    headers: headers(githubToken),
    body: JSON.stringify({
      message: `chore: update registry.json [${new Date().toISOString()}]`,
      content,
      ...(sha ? { sha } : {}),
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Erro ao atualizar registry')
  }
}

// ─── Publicar Componente ──────────────────────────────────────────────────────

interface PublishComponentPayload {
  meta: ComponentMeta
  astroCode: string
  previewCode: string
  indexCode: string
  currentRegistry: ComponentMeta[]
}

export async function publishComponent(
  settings: AppSettings,
  payload: PublishComponentPayload
): Promise<void> {
  const { githubToken, githubOwner, componentsRepo } = settings
  const { meta, astroCode, previewCode, indexCode, currentRegistry } = payload
  const basePath = `/repos/${githubOwner}/${componentsRepo}/contents/src/components/${meta.name}`

  async function upsertFile(path: string, content: string, message: string) {
    let sha: string | undefined
    try {
      const existing = await fetch(apiUrl(path), { headers: headers(githubToken) })
      if (existing.ok) {
        const data = await existing.json()
        sha = data.sha
      }
    } catch {}

    const res = await fetch(apiUrl(path), {
      method: 'PUT',
      headers: headers(githubToken),
      body: JSON.stringify({ message, content: toBase64(content), ...(sha ? { sha } : {}) }),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || `Erro ao criar ${path}`)
    }
  }

  // 1. Cria os 3 arquivos do componente
  await upsertFile(`${basePath}/${meta.name}.astro`, astroCode, `feat: add ${meta.name} component`)
  await upsertFile(`${basePath}/${meta.name}.preview.astro`, previewCode, `feat: add ${meta.name} preview`)
  await upsertFile(`${basePath}/index.ts`, indexCode, `feat: add ${meta.name} index`)

  // 2. Atualiza o registry
  const exists = currentRegistry.findIndex(c => c.id === meta.id)
  const updated =
    exists >= 0
      ? currentRegistry.map(c => (c.id === meta.id ? { ...meta, updatedAt: new Date().toISOString() } : c))
      : [...currentRegistry, { ...meta, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]

  await updateRegistry(settings, updated)
}

// ─── Criar Projeto ─────────────────────────────────────────────────────────────

export async function createProjectFromTemplate(
  settings: AppSettings,
  clientName: string,
  manifestContent: string
): Promise<CreateProjectResult> {
  const { githubToken, githubOwner, baseProjectRepo } = settings
  const repoName = slugify(clientName)

  try {
    // 1. Cria o repo a partir do template
    const createRes = await fetch(
      apiUrl(`/repos/${githubOwner}/${baseProjectRepo}/generate`),
      {
        method: 'POST',
        headers: headers(githubToken),
        body: JSON.stringify({
          owner: githubOwner,
          name: repoName,
          private: true,
          description: `Landing page — ${clientName}`,
          include_all_branches: false,
        }),
      }
    )

    if (!createRes.ok) {
      const err = await createRes.json()
      throw new Error(err.message || 'Erro ao criar repositório')
    }

    const repo = await createRes.json()

    // 2. Aguarda o GitHub terminar de inicializar o repo
    await wait(3500)

    // 3. Commita o MANIFESTO.md no novo repo
    await fetch(
      apiUrl(`/repos/${githubOwner}/${repoName}/contents/MANIFESTO.md`),
      {
        method: 'PUT',
        headers: headers(githubToken),
        body: JSON.stringify({
          message: 'init: manifesto do projeto',
          content: toBase64(manifestContent),
        }),
      }
    )

    return {
      repoUrl: repo.html_url,
      cloneUrl: repo.clone_url,
      sshUrl: repo.ssh_url,
      vscodeUrl: `vscode://vscode.git/clone?url=${encodeURIComponent(repo.clone_url)}`,
      success: true,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return { repoUrl: '', cloneUrl: '', sshUrl: '', vscodeUrl: '', success: false, error: message }
  }
}

// ─── Validar Token ────────────────────────────────────────────────────────────

export async function validateGithubToken(token: string): Promise<{ valid: boolean; login?: string; error?: string }> {
  try {
    const res = await fetch(apiUrl('/user'), { headers: headers(token) })
    if (!res.ok) return { valid: false, error: `HTTP ${res.status}` }
    const data = await res.json()
    return { valid: true, login: data.login }
  } catch (e) {
    return { valid: false, error: e instanceof Error ? e.message : 'Erro desconhecido' }
  }
}
```

### `lib\manifest.ts`

```typescript
// src/lib/manifest.ts

import type { ProjectConfig, ArtDirection, SelectedComponent, AppSettings } from '../types'

export const DEFAULT_TEMPLATE = `# Projeto: {{clientName}}
**Gerado em:** {{date}}
**Tipo:** {{projectType}}
**Nicho:** {{niche}}
**Objetivo da pagina:** {{pageGoal}}
**URL do site:** {{siteUrl}}
**Google Analytics:** {{googleAnalyticsId}}
**Namespace npm:** {{npmNamespace}}

---

## Direcao de Arte

| Item | Valor |
|------|-------|
| Primary | {{colorPrimary}} |
| Secondary | {{colorSecondary}} |
| Background | {{colorBackground}} |
| Texto | {{colorText}} |
| Heading font | {{fontHeading}} |
| Body font | {{fontBody}} |
| Mood | {{mood}} |
| Referencias | {{references}} |

{{#notes}}
### Notas
{{notes}}
{{/notes}}

---

## Componentes Selecionados

{{components}}

---

## Instrucoes para o Claude Code

1. Duplicar a pasta base e renomear para \`{{repoName}}\`
2. Rodar \`npm install\`
3. Criar \`src/styles/theme.css\` com as variaveis CSS abaixo:
\`\`\`css
:root {
  --color-primary: {{colorPrimary}};
  --color-secondary: {{colorSecondary}};
  --color-bg: {{colorBackground}};
  --color-text: {{colorText}};
  --font-heading: '{{fontHeading}}', serif;
  --font-body: '{{fontBody}}', sans-serif;
}
\`\`\`
4. Implementar os componentes na ordem listada acima
5. Preencher cada componente com o copy correspondente
6. Colocar imagens na pasta \`/public/\` com os nomes referenciados
7. Rodar \`npm run dev\` e validar responsividade em mobile e desktop
8. Fazer build com \`npm run build\` e confirmar zero erros

---

**Gerado por:** {{studioName}}
`

function renderTemplate(template: string, vars: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
  }
  // Remove blocos condicionais vazios: {{#notes}}...{{/notes}}
  result = result.replace(/\{\{#\w+\}\}[\s\S]*?\{\{\/\w+\}\}/g, match => {
    const keyMatch = match.match(/\{\{#(\w+)\}\}/)
    if (!keyMatch) return ''
    const key = keyMatch[1]
    const value = vars[key]
    if (!value || value.trim() === '') return ''
    return match.replace(/\{\{#\w+\}\}/, '').replace(/\{\{\/\w+\}\}/, '')
  })
  return result
}

function buildComponentsSection(components: SelectedComponent[]): string {
  if (components.length === 0) return '_Nenhum componente selecionado_'

  return components
    .map((comp, i) => {
      const copy = comp.copy || {}
      const copyLines = Object.entries(copy)
        .filter(([, v]) => v.trim() !== '')
        .map(([k, v]) => `  - **${k}:** ${v}`)
        .join('\n')

      return `### Secao ${i + 1} — \`${comp.meta.id}\`
**Componente:** ${comp.meta.name}
${copyLines ? `\n**Copy / Props:**\n${copyLines}` : ''}`
    })
    .join('\n\n')
}

export function generateManifest(
  project: ProjectConfig,
  artDirection: ArtDirection,
  components: SelectedComponent[],
  settings: AppSettings
): string {
  const { manifestTemplate, studioName, npmNamespace } = settings

  const template = manifestTemplate?.trim() ? manifestTemplate : DEFAULT_TEMPLATE

  const repoName = project.clientName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const vars: Record<string, string> = {
    clientName:        project.clientName,
    date:              new Intl.DateTimeFormat('pt-BR').format(new Date()),
    projectType:       project.projectType,
    niche:             project.niche,
    pageGoal:          project.pageGoal,
    googleAnalyticsId: project.googleAnalyticsId || '—',
    siteUrl:           project.siteUrl || '—',
    npmNamespace:      npmNamespace || '—',
    repoName,
    colorPrimary:      artDirection.colorPrimary,
    colorSecondary:    artDirection.colorSecondary,
    colorBackground:   artDirection.colorBackground,
    colorText:         artDirection.colorText,
    fontHeading:       artDirection.fontHeading,
    fontBody:          artDirection.fontBody,
    mood:              artDirection.mood,
    references:        artDirection.references || '—',
    notes:             artDirection.notes || '',
    components:        buildComponentsSection(components),
    studioName:        studioName || 'Astro Component Studio',
  }

  return renderTemplate(template, vars)
}
```

### `lib\utils.ts`

```typescript
// src/lib/utils.ts

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Utilitário padrão para combinar classes Tailwind de forma segura */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function toBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
}

export function wait(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}
```

### `pages\admin.astro`

```text
---
import AppLayout from '../layouts/AppLayout.astro'
import AdminPanel from '../components/AdminPanel'

const tab = (Astro.url.searchParams.get('tab') ?? 'adicionar') as 'adicionar' | 'extrair' | 'remover'
---

<AppLayout title="Gerenciar Componentes - Astroteca">
  <AdminPanel client:load initialTab={tab} />
</AppLayout>
```

### `pages\builder.astro`

```text
---
import AppLayout from '../layouts/AppLayout.astro'
import Builder from '../components/Builder'
import { fetchRegistry } from '../lib/github'

let components: import('../types').ComponentMeta[] = []

const registryUrl = import.meta.env.PUBLIC_REGISTRY_URL || ''

if (registryUrl) {
  try {
    components = await fetchRegistry(registryUrl)
  } catch {
    // sera carregado client-side
  }
}
---

<AppLayout title="Builder - Astroteca">
  <Builder client:load availableComponents={components} />
</AppLayout>
```

### `pages\config.astro`

```text
---
import AppLayout from '../layouts/AppLayout.astro'
import ConfigPanel from '../components/ConfigPanel'
---

<AppLayout title="Configuracoes - Astroteca">
  <ConfigPanel client:load />
</AppLayout>
```

### `pages\index.astro`

```text
---
import AppLayout from '../layouts/AppLayout.astro'
import ComponentBrowser from '../components/ComponentBrowser'
import { fetchRegistry } from '../lib/github'

let components: import('../types').ComponentMeta[] = []
let error = ''

const registryUrl = import.meta.env.PUBLIC_REGISTRY_URL || ''

// Carrega do GitHub se tiver URL, senão fica vazio e o client carrega local
if (registryUrl) {
  try {
    components = await fetchRegistry(registryUrl)
  } catch (e) {
    error = e instanceof Error ? e.message : 'Erro ao carregar registro'
  }
}
---

<AppLayout title="Biblioteca - Astroteca">
  <ComponentBrowser
    client:load
    initialComponents={components}
    registryUrl={registryUrl}
    initialError={error}
  />
</AppLayout>
```

### `pages\admin\extract.astro`

```text
---
return Astro.redirect('/admin?tab=extrair')
---
```

### `pages\admin\remove.astro`

```text
---
return Astro.redirect('/admin?tab=remover')
---
```

### `pages\api\create-project.ts`

```typescript
import type { APIRoute } from 'astro'
import type { AppSettings } from '../../types'
import { createProjectFromTemplate } from '../../lib/github'

export const POST: APIRoute = async ({ request }) => {
  const { settings, clientName, manifest } = await request.json() as {
    settings: AppSettings
    clientName: string
    manifest: string
  }

  const result = await createProjectFromTemplate(settings, clientName, manifest)

  if (!result.success) {
    return new Response(JSON.stringify({ error: result.error }), { status: 400 })
  }

  return new Response(JSON.stringify(result), { status: 200 })
}
```

### `pages\api\extract-component.ts`

```typescript
import type { APIRoute } from 'astro'
import {
  existsSync, readFileSync, writeFileSync, mkdirSync,
} from 'node:fs'
import { resolve, join, basename, dirname } from 'node:path'
import { toBase64 } from '../../lib/utils'

const ROOT = resolve(process.cwd())

// ── helpers (espelho do script CLI) ──────────────────────────────────────────

const toPascal = (s: string) =>
  s.replace(/(^\w|-\w|_\w)/g, m => m.replace(/[-_]/, '').toUpperCase())

const toKebab = (s: string) =>
  s.replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
   .replace(/([a-z])([A-Z])/g, '$1-$2')
   .replace(/([a-zA-Z])(\d)/g, '$1-$2')
   .replace(/[\s_]+/g, '-')
   .toLowerCase()

const randomId = () => String(Math.floor(1000 + Math.random() * 9000))

const UI_COMPONENTS = /^(button|btn|icon|badge|tag|chip|card|modal|dialog|tooltip|popover|dropdown|input|textarea|select|checkbox|radio|toggle|switch|form|label|avatar|spinner|loader|alert|toast|banner|divider|separator|breadcrumb|pagination|tab|accordion|collapse|drawer|sidebar|nav|navbar|menu|link|image|img|picture|video|embed)s?(\d+)?$/i

function inferCategory(name: string): string {
  const n = name.toLowerCase().replace(/\d+$/, '')
  if (UI_COMPONENTS.test(n))        return 'UI'
  if (/^hero/.test(n))              return 'Hero'
  if (/^feature/.test(n))           return 'Features'
  if (/^service/.test(n))           return 'Services'
  if (/^testimonial/.test(n))       return 'Testimonials'
  if (/^process|^step/.test(n))     return 'Process'
  if (/^pric/.test(n))              return 'Pricing'
  if (/^faq/.test(n))               return 'FAQ'
  if (/^cta/.test(n))               return 'CTA'
  if (/^contact/.test(n))           return 'Contact'
  if (/^footer/.test(n))            return 'Footer'
  if (/^trust|^award/.test(n))      return 'Trust'
  return 'Other'
}

function sanitize(code: string): string {
  code = code.replace(/^import\s+\w+\s+from\s+['"](?:\.{1,2}\/)*(?:@\/)?assets\/[^'"]+['"];?\s*$/gm, '')
  code = code.replace(/<Image\s[^/]*src=\{[^}]+\}[^/]*\/>/gs, '<img src="/preview-assets/placeholder-hero.svg" alt="imagem" />')
  code = code.replace(/https:\/\/wa\.me\/[^\s'"]+/g, 'https://wa.me/5500000000000')
  code = code.replace(/\(\d{2}\)\s?9?\d{4}[-\s]?\d{4}/g, '(00) 00000-0000')
  code = code.replace(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g, '00.000.000/0000-00')
  code = code.replace(/href="https:\/\/(www\.)?(instagram|tiktok|facebook|youtube|linkedin)\.com\/[^"]+"/g, 'href="#"')
  return code
}

function detectChildren(code: string, sourceDir: string) {
  const re = /^import\s+(\w+)\s+from\s+['"](\.{1,2}\/[^'"]+\.astro)['"]/gm
  const found: { importName: string; relativePath: string; absolutePath: string }[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(code)) !== null) {
    const abs = resolve(sourceDir, m[2])
    if (existsSync(abs)) found.push({ importName: m[1], relativePath: m[2], absolutePath: abs })
  }
  return found
}

function findTailwindConfig(startDir: string): string | null {
  let dir = startDir
  for (let i = 0; i < 6; i++) {
    for (const name of ['tailwind.config.js', 'tailwind.config.ts', 'tailwind.config.mjs']) {
      const p = join(dir, name)
      if (existsSync(p)) return p
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

function extractTailwindTokens(configPath: string): string {
  try {
    const raw = readFileSync(configPath, 'utf8')
    const colorsMatch = raw.match(/colors\s*:\s*\{([^}]+)\}/s)
    const fontFamilyMatch = raw.match(/fontFamily\s*:\s*\{([^}]+)\}/s)

    const rootLines: string[] = []
    const utilityLines: string[] = []

    if (colorsMatch) {
      const re = /['"]?([\w-]+)['"]?\s*:\s*['"]([^'"]+)['"]/g
      let m: RegExpExecArray | null
      while ((m = re.exec(colorsMatch[1])) !== null) {
        const key = m[1]
        const val = m[2]
        rootLines.push(`  --color-${key}: ${val};`)
        // Gera classes Tailwind reais para o preview
        utilityLines.push(`.bg-${key} { background-color: ${val} !important; }`)
        utilityLines.push(`.bg-${key}\\/10 { background-color: ${val}1a !important; }`)
        utilityLines.push(`.bg-${key}\\/20 { background-color: ${val}33 !important; }`)
        utilityLines.push(`.bg-${key}\\/90 { background-color: ${val}e6 !important; }`)
        utilityLines.push(`.text-${key} { color: ${val} !important; }`)
        utilityLines.push(`.border-${key} { border-color: ${val} !important; }`)
        utilityLines.push(`.hover\\:bg-${key}:hover { background-color: ${val} !important; }`)
        utilityLines.push(`.hover\\:bg-${key}\\/90:hover { background-color: ${val}e6 !important; }`)
        utilityLines.push(`.outline-${key} { outline-color: ${val} !important; }`)
      }
    }

    if (fontFamilyMatch) {
      const re = /['"]?(\w+)['"]?\s*:\s*\[([^\]]+)\]/g
      let m: RegExpExecArray | null
      while ((m = re.exec(fontFamilyMatch[1])) !== null) {
        const firstFont = m[2].match(/['"]([^'"]+)['"]/) ?.[1] ?? ''
        if (firstFont) {
          rootLines.push(`  --font-${m[1]}: '${firstFont}', sans-serif;`)
          utilityLines.push(`.font-${m[1]} { font-family: '${firstFont}', sans-serif !important; }`)
        }
      }
    }

    if (rootLines.length === 0) return ''
    return `:root {\n${rootLines.join('\n')}\n}\n${utilityLines.join('\n')}`
  } catch {
    return ''
  }
}

function detectGoogleFonts(configPath: string): string[] {
  try {
    const raw = readFileSync(configPath, 'utf8')
    const fonts: string[] = []
    const re = /['"]([A-Z][a-zA-Z\s]+)['"]\s*,/g
    let m: RegExpExecArray | null
    while ((m = re.exec(raw)) !== null) {
      const name = m[1].trim()
      if (name.includes(' ') || name.match(/^[A-Z]/)) fonts.push(name)
    }
    return [...new Set(fonts)].slice(0, 4)
  } catch {
    return []
  }
}

function detectProps(code: string) {
  const match = code.match(/interface\s+Props\s*\{([^}]+)\}/s)
  if (!match) return []
  const re = /(\w+)(\?)?:\s*(string|boolean|number|string\[\]|\w+)/g
  const props: { name: string; type: string; required: boolean }[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(match[1])) !== null) {
    const type = m[3].includes('[]') ? 'array' : m[3]
    props.push({ name: m[1], type, required: !m[2] })
  }
  return props
}

// ── endpoint ─────────────────────────────────────────────────────────────────

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json() as {
      filePath: string
      category: string
      description: string
      tags: string[]
      bestFor: string[]
      chosenChildren: string[]   // importNames escolhidos
      phase: 'analyze' | 'extract'
    }

    const { filePath, phase } = body
    // "Copiar como caminho" no Windows adiciona aspas — remove
    const cleanPath = filePath.trim().replace(/^["']|["']$/g, '')
    const resolvedPath = resolve(cleanPath)

    if (!existsSync(resolvedPath)) {
      return json({ error: `Arquivo não encontrado: ${resolvedPath}` }, 400)
    }

    const rawCode = readFileSync(resolvedPath, 'utf8')
    const sourceDir = dirname(resolvedPath)
    const children = detectChildren(rawCode, sourceDir)
    const props = detectProps(rawCode)

    // Fase 1: só analisar — retorna props e filhos detectados sem gravar nada
    if (phase === 'analyze') {
      return json({
        fileName: basename(resolvedPath),
        props,
        children: children.map(c => ({
          importName: c.importName,
          fileName: basename(c.absolutePath),
          suggestedCategory: inferCategory(c.importName),
        })),
      })
    }

    // Fase 2: extrair de verdade
    const { category, description, tags, bestFor, chosenChildren } = body
    const baseName = toPascal(basename(resolvedPath, '.astro'))
    const uid = randomId()
    const name = `${baseName}${uid}`
    const id = toKebab(name)

    const LIB_DIR   = join(ROOT, 'minha-lib-astro', 'src', 'components', category)
    const COMP_FILE = join(LIB_DIR, `${name}.astro`)
    const PREV_FILE = join(LIB_DIR, `${name}.preview.astro`)
    const INDEX_FILE = join(LIB_DIR, 'index.ts')
    const LIB_INDEX = join(ROOT, 'minha-lib-astro', 'src', 'index.ts')
    const REGISTRY  = join(ROOT, 'minha-lib-astro', 'registry.json')

    if (!existsSync(LIB_DIR)) mkdirSync(LIB_DIR, { recursive: true })

    // Copia filhos escolhidos
    const chosen = children.filter(c => chosenChildren.includes(c.importName))
    const rewrites: { importName: string; original: string; newPath: string; childName: string; childCategory: string }[] = []

    for (const child of chosen) {
      const childBase = toPascal(basename(child.absolutePath, '.astro'))
      const childName = `${childBase}${randomId()}`
      const childCat  = inferCategory(child.importName)
      const childDir  = join(ROOT, 'minha-lib-astro', 'src', 'components', childCat)
      if (!existsSync(childDir)) mkdirSync(childDir, { recursive: true })
      const destPath = join(childDir, `${childName}.astro`)
      writeFileSync(destPath, sanitize(readFileSync(child.absolutePath, 'utf8')))
      const relToParent = join(childDir, `${childName}.astro`)
        .replace(LIB_DIR, '.')
        .replace(/\\/g, '/')
      rewrites.push({
        importName: child.importName,
        original: child.relativePath,
        newPath: relToParent,
        childName,
        childCategory: childCat,
      })
    }

    // Sanitiza e reescreve imports
    let code = sanitize(rawCode)
    for (const rw of rewrites) {
      code = code.replace(
        new RegExp(`import\\s+${rw.importName}\\s+from\\s+['"]${rw.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`),
        `import ${rw.importName} from '${rw.newPath}'`
      )
    }
    const rejected = children.filter(c => !chosenChildren.includes(c.importName))
    for (const rj of rejected) {
      code = code.replace(
        new RegExp(`^import\\s+${rj.importName}\\s+from\\s+['"][^'"]+['"];?\\s*$`, 'gm'),
        `// import ${rj.importName} removido`
      )
    }

    writeFileSync(COMP_FILE, code)

    // Preview
    const propsStr = props
      .filter(p => p.type === 'string')
      .map(p => `  ${p.name}="Exemplo de ${p.name}"`)
      .join('\n')
    const previewCode = `---\nimport ${name} from './${name}.astro'\n---\n\n<${name}\n${propsStr}\n/>`
    writeFileSync(PREV_FILE, previewCode)

    // index.ts da categoria
    let idx = existsSync(INDEX_FILE) ? readFileSync(INDEX_FILE, 'utf8') : ''
    const exportLine = `export { default as ${name} } from './${name}.astro'`
    if (!idx.includes(exportLine)) writeFileSync(INDEX_FILE, idx.trimEnd() + (idx ? '\n' : '') + exportLine + '\n')

    // src/index.ts principal
    let libIdx = existsSync(LIB_INDEX) ? readFileSync(LIB_INDEX, 'utf8') : ''
    const libLine = `export * from './components/${category}/index'`
    if (!libIdx.includes(libLine)) writeFileSync(LIB_INDEX, libIdx.trimEnd() + (libIdx ? '\n' : '') + libLine + '\n')

    // registry.json local
    let registry: any[] = []
    try { registry = JSON.parse(readFileSync(REGISTRY, 'utf8')) } catch {}
    registry = registry.filter((r: any) => r.id !== id)
    const newEntry = {
      id, name, category, description,
      previewPath: `/preview/${id}`,
      screenshot: '',
      componentFile: `${category}/${name}.astro`,
      tags, bestFor,
      props: props.map(p => ({ name: p.name, type: p.type, required: p.required })),
      order: registry.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    registry.push(newEntry)
    writeFileSync(REGISTRY, JSON.stringify(registry, null, 2) + '\n')

    // Lê tokens do tailwind.config do projeto de origem
    const twConfigPath = findTailwindConfig(sourceDir)
    const cssTokens = twConfigPath ? extractTailwindTokens(twConfigPath) : ''
    const googleFonts = twConfigPath ? detectGoogleFonts(twConfigPath) : []
    const fontsUrl = googleFonts.length > 0
      ? `https://fonts.googleapis.com/css2?${googleFonts.map(f => `family=${f.replace(/ /g, '+')}:wght@300;400;500;600;700`).join('&')}&display=swap`
      : ''

    // Gera preview page no Astroteca
    const PREVIEW_DIR = join(ROOT, 'src', 'pages', 'preview')
    if (!existsSync(PREVIEW_DIR)) mkdirSync(PREVIEW_DIR, { recursive: true })
    const previewPageContent = [
      '---',
      `import ${name} from '../../../minha-lib-astro/src/components/${category}/${name}.astro'`,
      `import PreviewLayout from '../../layouts/PreviewLayout.astro'`,
      '---',
      '',
      `<PreviewLayout fontsUrl="${fontsUrl}" cssTokens={\`${cssTokens}\`}>`,
      `  <${name}`,
      propsStr,
      `  />`,
      `</PreviewLayout>`,
      '',
    ].join('\n')
    writeFileSync(join(PREVIEW_DIR, `${id}.astro`), previewPageContent)

    // ── Publica no repo da lib via GitHub API ────────────────────────────────
    const token  = import.meta.env.GITHUB_TOKEN
    const owner  = import.meta.env.GITHUB_OWNER
    const repo   = import.meta.env.COMPONENTS_REPO

    if (!token || !owner || !repo) {
      return json({ error: 'GitHub não configurado (.env: GITHUB_TOKEN, GITHUB_OWNER, COMPONENTS_REPO)' }, 500)
    }

    const ghHeaders = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    }

    async function ghUpsert(path: string, content: string, message: string) {
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
      let sha: string | undefined
      try {
        const existing = await fetch(url, { headers: ghHeaders })
        if (existing.ok) sha = (await existing.json()).sha
      } catch {}
      const res = await fetch(url, {
        method: 'PUT',
        headers: ghHeaders,
        body: JSON.stringify({ message, content: toBase64(content), ...(sha ? { sha } : {}) }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || `Erro ao publicar ${path}`)
      }
    }

    // Componente principal
    await ghUpsert(`src/components/${category}/${name}.astro`, code, `feat: extract ${name}`)
    await ghUpsert(`src/components/${category}/${name}.preview.astro`, previewCode, `feat: extract ${name} preview`)

    // Index da categoria
    await ghUpsert(`src/components/${category}/index.ts`, readFileSync(INDEX_FILE, 'utf8'), `chore: update ${category}/index.ts`)

    // Filhos
    for (const rw of rewrites) {
      const childFile = join(ROOT, 'minha-lib-astro', 'src', 'components', rw.childCategory, `${rw.childName}.astro`)
      await ghUpsert(`src/components/${rw.childCategory}/${rw.childName}.astro`, readFileSync(childFile, 'utf8'), `feat: extract child ${rw.childName}`)
    }

    // Registry
    await ghUpsert('registry.json', JSON.stringify(registry, null, 2) + '\n', `chore: registry — add ${name}`)

    return json({
      success: true,
      name, id, category,
      children: rewrites.map(r => ({ childName: r.childName, childCategory: r.childCategory })),
    })

  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro desconhecido'
    return json({ error: msg }, 500)
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
```

### `pages\api\publish-component.ts`

```typescript
import type { APIRoute } from 'astro'
import type { AppSettings, ComponentMeta } from '../../types'
import { publishComponent, fetchRegistry } from '../../lib/github'

export const POST: APIRoute = async ({ request }) => {
  const { settings, meta, astroCode, previewCode, indexCode } = await request.json() as {
    settings: AppSettings
    meta: ComponentMeta
    astroCode: string
    previewCode: string
    indexCode: string
  }

  try {
    const currentRegistry = await fetchRegistry(settings.registryUrl)
    await publishComponent(settings, { meta, astroCode, previewCode, indexCode, currentRegistry })
    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return new Response(JSON.stringify({ error: message }), { status: 500 })
  }
}
```

### `pages\api\remove-component.ts`

```typescript
import type { APIRoute } from 'astro'
import { existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { toBase64 } from '../../lib/utils'

const ROOT       = resolve(process.cwd())
const REGISTRY   = join(ROOT, 'minha-lib-astro', 'registry.json')
const LIB_COMPS  = join(ROOT, 'minha-lib-astro', 'src', 'components')
const PREVIEW_DIR = join(ROOT, 'src', 'pages', 'preview')

export const GET: APIRoute = async () => {
  if (!existsSync(REGISTRY)) return json({ error: 'registry.json não encontrado' }, 404)
  try {
    const registry = JSON.parse(readFileSync(REGISTRY, 'utf8'))
    return json(registry)
  } catch {
    return json({ error: 'Erro ao ler registry.json' }, 500)
  }
}

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { id } = await request.json() as { id: string }
    if (!id) return json({ error: 'ID obrigatório' }, 400)

    const registry: any[] = JSON.parse(readFileSync(REGISTRY, 'utf8'))
    const component = registry.find(r => r.id === id)
    if (!component) return json({ error: `Componente "${id}" não encontrado` }, 404)

    const removed: string[] = []

    // 1. Arquivo .astro
    const compFile = join(LIB_COMPS, component.componentFile)
    if (existsSync(compFile)) { rmSync(compFile); removed.push(component.componentFile) }

    // 2. .preview.astro
    const previewSrc = join(LIB_COMPS, component.componentFile.replace('.astro', '.preview.astro'))
    if (existsSync(previewSrc)) { rmSync(previewSrc); removed.push(previewSrc.replace(ROOT + '\\', '').replace(ROOT + '/', '')) }

    // 3. Preview page
    const previewPage = join(PREVIEW_DIR, `${component.id}.astro`)
    if (existsSync(previewPage)) { rmSync(previewPage); removed.push(`src/pages/preview/${component.id}.astro`) }

    // 4. Registry local
    const newRegistry = registry.filter(r => r.id !== id)
    writeFileSync(REGISTRY, JSON.stringify(newRegistry, null, 2) + '\n')

    // 5. GitHub API — remove do repo da lib
    const token = import.meta.env.GITHUB_TOKEN
    const owner = import.meta.env.GITHUB_OWNER
    const repo  = import.meta.env.COMPONENTS_REPO

    if (token && owner && repo) {
      const ghHeaders = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      }

      async function ghDelete(path: string) {
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
        const existing = await fetch(url, { headers: ghHeaders })
        if (!existing.ok) return
        const { sha } = await existing.json()
        await fetch(url, {
          method: 'DELETE',
          headers: ghHeaders,
          body: JSON.stringify({ message: `chore: remove ${id}`, sha }),
        })
      }

      async function ghUpsert(path: string, content: string, message: string) {
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
        let sha: string | undefined
        try {
          const existing = await fetch(url, { headers: ghHeaders })
          if (existing.ok) sha = (await existing.json()).sha
        } catch {}
        await fetch(url, {
          method: 'PUT',
          headers: ghHeaders,
          body: JSON.stringify({ message, content: toBase64(content), ...(sha ? { sha } : {}) }),
        })
      }

      await ghDelete(`src/components/${component.componentFile}`)
      await ghDelete(`src/components/${component.componentFile.replace('.astro', '.preview.astro')}`)
      await ghUpsert('registry.json', JSON.stringify(newRegistry, null, 2) + '\n', `chore: remove ${id} from registry`)
    }

    return json({ success: true, name: component.name, removed })
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Erro desconhecido' }, 500)
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
```

### `pages\preview\[...slug].astro`

```text
---
// src/pages/preview/[...slug].astro
// Renderiza o preview de um componente da biblioteca

import HeroSplitPreview from '../../../minha-lib-astro/src/components/Hero/HeroSplit.preview.astro'
import HeroCenteredPreview from '../../../minha-lib-astro/src/components/Hero/HeroCentered.preview.astro'
import FeaturesGrid3Preview from '../../../minha-lib-astro/src/components/Features/FeaturesGrid3.preview.astro'
import TestimonialsCardsPreview from '../../../minha-lib-astro/src/components/Testimonials/TestimonialsCards.preview.astro'
import PricingCardsPreview from '../../../minha-lib-astro/src/components/Pricing/PricingCards.preview.astro'
import CTABannerPreview from '../../../minha-lib-astro/src/components/CTA/CTABanner.preview.astro'
import FAQAccordionPreview from '../../../minha-lib-astro/src/components/FAQ/FAQAccordion.preview.astro'
import ContactSectionPreview from '../../../minha-lib-astro/src/components/Contact/ContactSection.preview.astro'
import FooterSimplesPreview from '../../../minha-lib-astro/src/components/Footer/FooterSimples.preview.astro'

const { slug } = Astro.params

// Mapeia slugs para componentes preview
const previewMap: Record<string, any> = {
  'hero-split': HeroSplitPreview,
  'hero-centered': HeroCenteredPreview,
  'features-grid-3': FeaturesGrid3Preview,
  'testimonials-cards': TestimonialsCardsPreview,
  'pricing-cards': PricingCardsPreview,
  'cta-banner': CTABannerPreview,
  'faq-accordion': FAQAccordionPreview,
  'contact-section': ContactSectionPreview,
  'footer-simples': FooterSimplesPreview,
}

const PreviewComponent = slug ? previewMap[slug] : null

if (!PreviewComponent) {
  return Astro.redirect('/')
}
---

<div class="preview-container">
  <PreviewComponent />
</div>

<style>
  .preview-container {
    min-height: 100vh;
    background: white;
  }
</style>
```

### `pages\preview\avaliacoes-google-4249.astro`

```text
---
import AvaliacoesGoogle4249 from '../../../minha-lib-astro/src/components/Testimonials/AvaliacoesGoogle4249.astro'
import PreviewLayout from '../../layouts/PreviewLayout.astro'
---

<PreviewLayout fontsUrl="https://fonts.googleapis.com/css2?family=Georgia:wght@300;400;500;600;700&display=swap" cssTokens={`:root {
  --color-primary: #436f3e;
  --color-primary-dark: #2f5129;
  --color-secondary: #d59740;
  --color-complement: #f9f395;
  --color-background: #ffffff;
  --color-surface: #f7f4f0;
  --color-surface-alt: #f0ebe3;
  --color-dark: #1d1d1c;
  --color-text-main: #1d1d1c;
  --color-text-soft: #535353;
  --color-text-muted: #8a8a8a;
  --color-border: #e5dfd6;
  --color-wa: #25D366;
  --font-serif: 'Cormorant Garamond', sans-serif;
  --font-sans: 'DM Sans', sans-serif;
}
.bg-primary { background-color: #436f3e !important; }
.bg-primary\/10 { background-color: #436f3e1a !important; }
.bg-primary\/20 { background-color: #436f3e33 !important; }
.bg-primary\/90 { background-color: #436f3ee6 !important; }
.text-primary { color: #436f3e !important; }
.border-primary { border-color: #436f3e !important; }
.hover\:bg-primary:hover { background-color: #436f3e !important; }
.hover\:bg-primary\/90:hover { background-color: #436f3ee6 !important; }
.outline-primary { outline-color: #436f3e !important; }
.bg-primary-dark { background-color: #2f5129 !important; }
.bg-primary-dark\/10 { background-color: #2f51291a !important; }
.bg-primary-dark\/20 { background-color: #2f512933 !important; }
.bg-primary-dark\/90 { background-color: #2f5129e6 !important; }
.text-primary-dark { color: #2f5129 !important; }
.border-primary-dark { border-color: #2f5129 !important; }
.hover\:bg-primary-dark:hover { background-color: #2f5129 !important; }
.hover\:bg-primary-dark\/90:hover { background-color: #2f5129e6 !important; }
.outline-primary-dark { outline-color: #2f5129 !important; }
.bg-secondary { background-color: #d59740 !important; }
.bg-secondary\/10 { background-color: #d597401a !important; }
.bg-secondary\/20 { background-color: #d5974033 !important; }
.bg-secondary\/90 { background-color: #d59740e6 !important; }
.text-secondary { color: #d59740 !important; }
.border-secondary { border-color: #d59740 !important; }
.hover\:bg-secondary:hover { background-color: #d59740 !important; }
.hover\:bg-secondary\/90:hover { background-color: #d59740e6 !important; }
.outline-secondary { outline-color: #d59740 !important; }
.bg-complement { background-color: #f9f395 !important; }
.bg-complement\/10 { background-color: #f9f3951a !important; }
.bg-complement\/20 { background-color: #f9f39533 !important; }
.bg-complement\/90 { background-color: #f9f395e6 !important; }
.text-complement { color: #f9f395 !important; }
.border-complement { border-color: #f9f395 !important; }
.hover\:bg-complement:hover { background-color: #f9f395 !important; }
.hover\:bg-complement\/90:hover { background-color: #f9f395e6 !important; }
.outline-complement { outline-color: #f9f395 !important; }
.bg-background { background-color: #ffffff !important; }
.bg-background\/10 { background-color: #ffffff1a !important; }
.bg-background\/20 { background-color: #ffffff33 !important; }
.bg-background\/90 { background-color: #ffffffe6 !important; }
.text-background { color: #ffffff !important; }
.border-background { border-color: #ffffff !important; }
.hover\:bg-background:hover { background-color: #ffffff !important; }
.hover\:bg-background\/90:hover { background-color: #ffffffe6 !important; }
.outline-background { outline-color: #ffffff !important; }
.bg-surface { background-color: #f7f4f0 !important; }
.bg-surface\/10 { background-color: #f7f4f01a !important; }
.bg-surface\/20 { background-color: #f7f4f033 !important; }
.bg-surface\/90 { background-color: #f7f4f0e6 !important; }
.text-surface { color: #f7f4f0 !important; }
.border-surface { border-color: #f7f4f0 !important; }
.hover\:bg-surface:hover { background-color: #f7f4f0 !important; }
.hover\:bg-surface\/90:hover { background-color: #f7f4f0e6 !important; }
.outline-surface { outline-color: #f7f4f0 !important; }
.bg-surface-alt { background-color: #f0ebe3 !important; }
.bg-surface-alt\/10 { background-color: #f0ebe31a !important; }
.bg-surface-alt\/20 { background-color: #f0ebe333 !important; }
.bg-surface-alt\/90 { background-color: #f0ebe3e6 !important; }
.text-surface-alt { color: #f0ebe3 !important; }
.border-surface-alt { border-color: #f0ebe3 !important; }
.hover\:bg-surface-alt:hover { background-color: #f0ebe3 !important; }
.hover\:bg-surface-alt\/90:hover { background-color: #f0ebe3e6 !important; }
.outline-surface-alt { outline-color: #f0ebe3 !important; }
.bg-dark { background-color: #1d1d1c !important; }
.bg-dark\/10 { background-color: #1d1d1c1a !important; }
.bg-dark\/20 { background-color: #1d1d1c33 !important; }
.bg-dark\/90 { background-color: #1d1d1ce6 !important; }
.text-dark { color: #1d1d1c !important; }
.border-dark { border-color: #1d1d1c !important; }
.hover\:bg-dark:hover { background-color: #1d1d1c !important; }
.hover\:bg-dark\/90:hover { background-color: #1d1d1ce6 !important; }
.outline-dark { outline-color: #1d1d1c !important; }
.bg-text-main { background-color: #1d1d1c !important; }
.bg-text-main\/10 { background-color: #1d1d1c1a !important; }
.bg-text-main\/20 { background-color: #1d1d1c33 !important; }
.bg-text-main\/90 { background-color: #1d1d1ce6 !important; }
.text-text-main { color: #1d1d1c !important; }
.border-text-main { border-color: #1d1d1c !important; }
.hover\:bg-text-main:hover { background-color: #1d1d1c !important; }
.hover\:bg-text-main\/90:hover { background-color: #1d1d1ce6 !important; }
.outline-text-main { outline-color: #1d1d1c !important; }
.bg-text-soft { background-color: #535353 !important; }
.bg-text-soft\/10 { background-color: #5353531a !important; }
.bg-text-soft\/20 { background-color: #53535333 !important; }
.bg-text-soft\/90 { background-color: #535353e6 !important; }
.text-text-soft { color: #535353 !important; }
.border-text-soft { border-color: #535353 !important; }
.hover\:bg-text-soft:hover { background-color: #535353 !important; }
.hover\:bg-text-soft\/90:hover { background-color: #535353e6 !important; }
.outline-text-soft { outline-color: #535353 !important; }
.bg-text-muted { background-color: #8a8a8a !important; }
.bg-text-muted\/10 { background-color: #8a8a8a1a !important; }
.bg-text-muted\/20 { background-color: #8a8a8a33 !important; }
.bg-text-muted\/90 { background-color: #8a8a8ae6 !important; }
.text-text-muted { color: #8a8a8a !important; }
.border-text-muted { border-color: #8a8a8a !important; }
.hover\:bg-text-muted:hover { background-color: #8a8a8a !important; }
.hover\:bg-text-muted\/90:hover { background-color: #8a8a8ae6 !important; }
.outline-text-muted { outline-color: #8a8a8a !important; }
.bg-border { background-color: #e5dfd6 !important; }
.bg-border\/10 { background-color: #e5dfd61a !important; }
.bg-border\/20 { background-color: #e5dfd633 !important; }
.bg-border\/90 { background-color: #e5dfd6e6 !important; }
.text-border { color: #e5dfd6 !important; }
.border-border { border-color: #e5dfd6 !important; }
.hover\:bg-border:hover { background-color: #e5dfd6 !important; }
.hover\:bg-border\/90:hover { background-color: #e5dfd6e6 !important; }
.outline-border { outline-color: #e5dfd6 !important; }
.bg-wa { background-color: #25D366 !important; }
.bg-wa\/10 { background-color: #25D3661a !important; }
.bg-wa\/20 { background-color: #25D36633 !important; }
.bg-wa\/90 { background-color: #25D366e6 !important; }
.text-wa { color: #25D366 !important; }
.border-wa { border-color: #25D366 !important; }
.hover\:bg-wa:hover { background-color: #25D366 !important; }
.hover\:bg-wa\/90:hover { background-color: #25D366e6 !important; }
.outline-wa { outline-color: #25D366 !important; }
.font-serif { font-family: 'Cormorant Garamond', sans-serif !important; }
.font-sans { font-family: 'DM Sans', sans-serif !important; }`}>
  <AvaliacoesGoogle4249

  />
</PreviewLayout>
```

### `pages\preview\button-3165.astro`

```text
---
import Button3165 from '../../../minha-lib-astro/src/components/UI/Button3165.astro'
import PreviewLayout from '../../layouts/PreviewLayout.astro'
---

<PreviewLayout fontsUrl="https://fonts.googleapis.com/css2?family=Georgia:wght@300;400;500;600;700&display=swap" cssTokens={`:root {
  --color-primary: #436f3e;
  --color-primary-dark: #2f5129;
  --color-secondary: #d59740;
  --color-complement: #f9f395;
  --color-background: #ffffff;
  --color-surface: #f7f4f0;
  --color-surface-alt: #f0ebe3;
  --color-dark: #1d1d1c;
  --color-text-main: #1d1d1c;
  --color-text-soft: #535353;
  --color-text-muted: #8a8a8a;
  --color-border: #e5dfd6;
  --color-wa: #25D366;
  --font-serif: 'Cormorant Garamond', sans-serif;
  --font-sans: 'DM Sans', sans-serif;
}
.bg-primary { background-color: #436f3e !important; }
.bg-primary\/10 { background-color: #436f3e1a !important; }
.bg-primary\/20 { background-color: #436f3e33 !important; }
.bg-primary\/90 { background-color: #436f3ee6 !important; }
.text-primary { color: #436f3e !important; }
.border-primary { border-color: #436f3e !important; }
.hover\:bg-primary:hover { background-color: #436f3e !important; }
.hover\:bg-primary\/90:hover { background-color: #436f3ee6 !important; }
.outline-primary { outline-color: #436f3e !important; }
.bg-primary-dark { background-color: #2f5129 !important; }
.bg-primary-dark\/10 { background-color: #2f51291a !important; }
.bg-primary-dark\/20 { background-color: #2f512933 !important; }
.bg-primary-dark\/90 { background-color: #2f5129e6 !important; }
.text-primary-dark { color: #2f5129 !important; }
.border-primary-dark { border-color: #2f5129 !important; }
.hover\:bg-primary-dark:hover { background-color: #2f5129 !important; }
.hover\:bg-primary-dark\/90:hover { background-color: #2f5129e6 !important; }
.outline-primary-dark { outline-color: #2f5129 !important; }
.bg-secondary { background-color: #d59740 !important; }
.bg-secondary\/10 { background-color: #d597401a !important; }
.bg-secondary\/20 { background-color: #d5974033 !important; }
.bg-secondary\/90 { background-color: #d59740e6 !important; }
.text-secondary { color: #d59740 !important; }
.border-secondary { border-color: #d59740 !important; }
.hover\:bg-secondary:hover { background-color: #d59740 !important; }
.hover\:bg-secondary\/90:hover { background-color: #d59740e6 !important; }
.outline-secondary { outline-color: #d59740 !important; }
.bg-complement { background-color: #f9f395 !important; }
.bg-complement\/10 { background-color: #f9f3951a !important; }
.bg-complement\/20 { background-color: #f9f39533 !important; }
.bg-complement\/90 { background-color: #f9f395e6 !important; }
.text-complement { color: #f9f395 !important; }
.border-complement { border-color: #f9f395 !important; }
.hover\:bg-complement:hover { background-color: #f9f395 !important; }
.hover\:bg-complement\/90:hover { background-color: #f9f395e6 !important; }
.outline-complement { outline-color: #f9f395 !important; }
.bg-background { background-color: #ffffff !important; }
.bg-background\/10 { background-color: #ffffff1a !important; }
.bg-background\/20 { background-color: #ffffff33 !important; }
.bg-background\/90 { background-color: #ffffffe6 !important; }
.text-background { color: #ffffff !important; }
.border-background { border-color: #ffffff !important; }
.hover\:bg-background:hover { background-color: #ffffff !important; }
.hover\:bg-background\/90:hover { background-color: #ffffffe6 !important; }
.outline-background { outline-color: #ffffff !important; }
.bg-surface { background-color: #f7f4f0 !important; }
.bg-surface\/10 { background-color: #f7f4f01a !important; }
.bg-surface\/20 { background-color: #f7f4f033 !important; }
.bg-surface\/90 { background-color: #f7f4f0e6 !important; }
.text-surface { color: #f7f4f0 !important; }
.border-surface { border-color: #f7f4f0 !important; }
.hover\:bg-surface:hover { background-color: #f7f4f0 !important; }
.hover\:bg-surface\/90:hover { background-color: #f7f4f0e6 !important; }
.outline-surface { outline-color: #f7f4f0 !important; }
.bg-surface-alt { background-color: #f0ebe3 !important; }
.bg-surface-alt\/10 { background-color: #f0ebe31a !important; }
.bg-surface-alt\/20 { background-color: #f0ebe333 !important; }
.bg-surface-alt\/90 { background-color: #f0ebe3e6 !important; }
.text-surface-alt { color: #f0ebe3 !important; }
.border-surface-alt { border-color: #f0ebe3 !important; }
.hover\:bg-surface-alt:hover { background-color: #f0ebe3 !important; }
.hover\:bg-surface-alt\/90:hover { background-color: #f0ebe3e6 !important; }
.outline-surface-alt { outline-color: #f0ebe3 !important; }
.bg-dark { background-color: #1d1d1c !important; }
.bg-dark\/10 { background-color: #1d1d1c1a !important; }
.bg-dark\/20 { background-color: #1d1d1c33 !important; }
.bg-dark\/90 { background-color: #1d1d1ce6 !important; }
.text-dark { color: #1d1d1c !important; }
.border-dark { border-color: #1d1d1c !important; }
.hover\:bg-dark:hover { background-color: #1d1d1c !important; }
.hover\:bg-dark\/90:hover { background-color: #1d1d1ce6 !important; }
.outline-dark { outline-color: #1d1d1c !important; }
.bg-text-main { background-color: #1d1d1c !important; }
.bg-text-main\/10 { background-color: #1d1d1c1a !important; }
.bg-text-main\/20 { background-color: #1d1d1c33 !important; }
.bg-text-main\/90 { background-color: #1d1d1ce6 !important; }
.text-text-main { color: #1d1d1c !important; }
.border-text-main { border-color: #1d1d1c !important; }
.hover\:bg-text-main:hover { background-color: #1d1d1c !important; }
.hover\:bg-text-main\/90:hover { background-color: #1d1d1ce6 !important; }
.outline-text-main { outline-color: #1d1d1c !important; }
.bg-text-soft { background-color: #535353 !important; }
.bg-text-soft\/10 { background-color: #5353531a !important; }
.bg-text-soft\/20 { background-color: #53535333 !important; }
.bg-text-soft\/90 { background-color: #535353e6 !important; }
.text-text-soft { color: #535353 !important; }
.border-text-soft { border-color: #535353 !important; }
.hover\:bg-text-soft:hover { background-color: #535353 !important; }
.hover\:bg-text-soft\/90:hover { background-color: #535353e6 !important; }
.outline-text-soft { outline-color: #535353 !important; }
.bg-text-muted { background-color: #8a8a8a !important; }
.bg-text-muted\/10 { background-color: #8a8a8a1a !important; }
.bg-text-muted\/20 { background-color: #8a8a8a33 !important; }
.bg-text-muted\/90 { background-color: #8a8a8ae6 !important; }
.text-text-muted { color: #8a8a8a !important; }
.border-text-muted { border-color: #8a8a8a !important; }
.hover\:bg-text-muted:hover { background-color: #8a8a8a !important; }
.hover\:bg-text-muted\/90:hover { background-color: #8a8a8ae6 !important; }
.outline-text-muted { outline-color: #8a8a8a !important; }
.bg-border { background-color: #e5dfd6 !important; }
.bg-border\/10 { background-color: #e5dfd61a !important; }
.bg-border\/20 { background-color: #e5dfd633 !important; }
.bg-border\/90 { background-color: #e5dfd6e6 !important; }
.text-border { color: #e5dfd6 !important; }
.border-border { border-color: #e5dfd6 !important; }
.hover\:bg-border:hover { background-color: #e5dfd6 !important; }
.hover\:bg-border\/90:hover { background-color: #e5dfd6e6 !important; }
.outline-border { outline-color: #e5dfd6 !important; }
.bg-wa { background-color: #25D366 !important; }
.bg-wa\/10 { background-color: #25D3661a !important; }
.bg-wa\/20 { background-color: #25D36633 !important; }
.bg-wa\/90 { background-color: #25D366e6 !important; }
.text-wa { color: #25D366 !important; }
.border-wa { border-color: #25D366 !important; }
.hover\:bg-wa:hover { background-color: #25D366 !important; }
.hover\:bg-wa\/90:hover { background-color: #25D366e6 !important; }
.outline-wa { outline-color: #25D366 !important; }
.font-serif { font-family: 'Cormorant Garamond', sans-serif !important; }
.font-sans { font-family: 'DM Sans', sans-serif !important; }`}>
  <Button3165
  label="Exemplo de label"
  href="Exemplo de href"
  trackingId="Exemplo de trackingId"
  trackingAction="Exemplo de trackingAction"
  trackingSection="Exemplo de trackingSection"
  />
</PreviewLayout>
```

### `pages\preview\contact-section.astro`

```text
---
import ContactSection from '../../../minha-lib-astro/src/components/Contact/ContactSection.astro'
import PreviewLayout from '../../layouts/PreviewLayout.astro'
---

<PreviewLayout>
  <ContactSection
    email="contato@exemplo.com"
    phone="(31) 99999-9999"
    whatsapp="5531999999999"
    address="Rua Exemplo, 123 - Belo Horizonte, MG"
  />
</PreviewLayout>
```

### `pages\preview\cta-banner.astro`

```text
---
import CTABanner from '../../../minha-lib-astro/src/components/CTA/CTABanner.astro'
import PreviewLayout from '../../layouts/PreviewLayout.astro'
---

<PreviewLayout>
  <CTABanner
    headline="Pronto para transformar sua presenca digital?"
    subheadline="Entre em contato hoje e receba um orcamento personalizado para seu projeto."
    ctaLabel="Quero comecar agora"
    ctaHref="#contato"
  />
</PreviewLayout>
```

### `pages\preview\faq-accordion.astro`

```text
---
import FAQAccordion from '../../../minha-lib-astro/src/components/FAQ/FAQAccordion.astro'
import PreviewLayout from '../../layouts/PreviewLayout.astro'
---

<PreviewLayout>
  <FAQAccordion
    items={[
    {
      question: "Quanto tempo leva para criar uma landing page?",
      answer: "O praco medio e de 7 a 14 dias, dependendo da complexidade do projeto. Paginas mais simples podem ser entregues em menos tempo, enquanto projetos com integracoes especiais podem levar um pouco mais."
    },
    {
      question: "Voces oferecem suporte apos a entrega?",
      answer: "Sim! Todos os nossos planos incluem um periodo de suporte. O plano Basico inclui 7 dias, o Profissional 30 dias, e o Premium 60 dias de suporte completo."
    },
    {
      question: "Posso alterar o conteudo depois de pronto?",
      answer: "Com certeza! Entregamos o projeto com instrucoes claras de como editar o conteudo. Para alteracoes maiores, oferecemos pacotes de manutencao mensal."
    },
    {
      question: "Como funciona o processo de criacao?",
      answer: "Nosso processo e dividido em 4 etapas: (1) Briefing e entendimento do negocio, (2) Proposta de layout e copywriting, (3) Desenvolvimento e implementacao, (4) Revisoes e ajustes finais."
    }
  ]}
  />
</PreviewLayout>
```

### `pages\preview\features-grid-3.astro`

```text
---
import FeaturesGrid3 from '../../../minha-lib-astro/src/components/Features/FeaturesGrid3.astro'
import PreviewLayout from '../../layouts/PreviewLayout.astro'
---

<PreviewLayout>
  <FeaturesGrid3
    sectionTitle="Por que nos escolher?"
    items={[
    {
      icon: "⚡",
      title: "Rapidez",
      description: "Entregamos seu projeto em tempo recorde sem comprometer a qualidade."
    },
    {
      icon: "🎯",
      title: "Foco em Resultados",
      description: "Design estrategico que converte visitantes em clientes."
    },
    {
      icon: "💎",
      title: "Qualidade Premium",
      description: "Acabamento profissional que eleva a percepcao da sua marca."
    }
  ]}
  />
</PreviewLayout>
```

### `pages\preview\footer-simples.astro`

```text
---
import FooterSimples from '../../../minha-lib-astro/src/components/Footer/FooterSimples.astro'
import PreviewLayout from '../../layouts/PreviewLayout.astro'
---

<PreviewLayout>
  <FooterSimples
    brandName="Joao Silva Design"
    tagline="Landing pages que convertem. Feitas com cuidado, entregues com prazo."
    links={[
    { label: "Inicio", href: "#inicio" },
    { label: "Servicos", href: "#servicos" },
    { label: "Portfolio", href: "#portfolio" },
    { label: "Contato", href: "#contato" },
  ]}
    socialLinks={[
    { platform: "Instagram", href: "https://instagram.com/seuusuario", icon: "📸" },
    { platform: "LinkedIn", href: "https://linkedin.com/in/seuusuario", icon: "💼" },
    { platform: "WhatsApp", href: "https://wa.me/5531999999999", icon: "💬" },
  ]}
    bottomLinks={[
    { label: "Politica de Privacidade", href: "/privacidade" },
    { label: "Termos de Uso", href: "/termos" },
  ]}
  />
</PreviewLayout>
```

### `pages\preview\hero-centered.astro`

```text
---
import HeroCentered from '../../../minha-lib-astro/src/components/Hero/HeroCentered.astro'
import PreviewLayout from '../../layouts/PreviewLayout.astro'
---

<PreviewLayout>
  <HeroCentered
    headline="Crie landing pages profissionais em minutos"
    subheadline="Componentes prontos, design consistente, resultado garantido."
    ctaLabel="Comecar gratuitamente"
    ctaHref="#"
  />
</PreviewLayout>
```

### `pages\preview\hero-simples.astro`

```text
---
import HeroSimples from '../../../minha-lib-astro/src/components/Hero/HeroSimples.astro'
import PreviewLayout from '../../layouts/PreviewLayout.astro'
---

<PreviewLayout>
  <HeroSimples
    badge="⭐ Mais de 200 projetos entregues"
    headline="Transforme sua <em>presença digital</em>"
    subheadline="Landing pages que convertem de verdade. Do briefing ao ar em até 14 dias."
    ctaLabel="Ver portfólio"
    ctaHref="#"
  />
</PreviewLayout>
```

### `pages\preview\hero-split.astro`

```text
---
import HeroSplit from '../../../minha-lib-astro/src/components/Hero/HeroSplit.astro'
import PreviewLayout from '../../layouts/PreviewLayout.astro'
---

<PreviewLayout>
  <HeroSplit
    headline="Transforme sua presenca digital"
    subheadline="Resultados reais para negocios que querem crescer. Sem enrolacao."
    ctaLabel="Quero saber mais"
    ctaHref="#"
    imageSrc="/preview-assets/placeholder-hero.svg"
  />
</PreviewLayout>
```

### `pages\preview\pricing-cards.astro`

```text
---
import PricingCards from '../../../minha-lib-astro/src/components/Pricing/PricingCards.astro'
import PreviewLayout from '../../layouts/PreviewLayout.astro'
---

<PreviewLayout>
  <PricingCards
    plans={[
    {
      name: "Basico",
      price: "R$ 997",
      period: "unico",
      features: [
        "Landing page one-page",
        "Design responsivo",
        "SEO basico",
        "1 revisao"
      ],
      ctaLabel: "Escolher Basico",
      ctaHref: "#contato"
    },
    {
      name: "Profissional",
      price: "R$ 1.997",
      period: "unico",
      features: [
        "Landing page completa",
        "Copywriting persuasivo",
        "Integracao com email",
        "Analytics avancado",
        "3 revisoes"
      ],
      ctaLabel: "Escolher Profissional",
      ctaHref: "#contato",
      highlighted: true
    },
    {
      name: "Premium",
      price: "R$ 3.997",
      period: "unico",
      features: [
        "Tudo do Profissional",
        "Site multi-paginas",
        "Blog integrado",
        "Suporte 30 dias",
        "Revisoes ilimitadas"
      ],
      ctaLabel: "Escolher Premium",
      ctaHref: "#contato"
    }
  ]}
  />
</PreviewLayout>
```

### `pages\preview\testimonials-cards.astro`

```text
---
import TestimonialsCards from '../../../minha-lib-astro/src/components/Testimonials/TestimonialsCards.astro'
import PreviewLayout from '../../layouts/PreviewLayout.astro'
---

<PreviewLayout>
  <TestimonialsCards
    testimonials={[
    {
      quote: "A landing page superou todas as minhas expectativas. Em uma semana ja tinha 15 novos leads qualificados.",
      author: "Maria Silva",
      role: "Nutricionista",
      avatar: "/images/testimonial-1.jpg"
    },
    {
      quote: "Profissionalismo impecavel. O processo foi rapido e o resultado ficou incredivel.",
      author: "Joao Pedro",
      role: "Consultor Financeiro",
      avatar: "/images/testimonial-2.jpg"
    },
    {
      quote: "Investimento que se pagou em menos de um mes. Recomendo para todos os meus colegas.",
      author: "Ana Costa",
      role: "Personal Trainer",
      avatar: "/images/testimonial-3.jpg"
    }
  ]}
  />
</PreviewLayout>
```

### `styles\app.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ─── Design Tokens ──────────────────────────────────────────────────────── */
:root {
  --bg:            #06060e;
  --surface:       #0c0c1a;
  --raised:        #131325;
  --hover:         #1a1a30;
  --border:        #1e1e38;
  --border-subtle: #141428;

  --ink-primary:   #ededf5;
  --ink-secondary: #7a7a95;
  --ink-muted:     #3a3a52;

  --accent:        #f0a500;
  --accent-dim:    rgba(240,165,0,0.08);
  --accent-hover:  #fbbf24;
  --accent-glow:   rgba(240,165,0,0.15);

  --ok:   #22c55e;
  --fail: #ef4444;
  --warn: #f59e0b;

  --sidebar-w: 240px;
  --radius:    12px;
  --radius-sm: 8px;
  --radius-lg: 16px;

  --shadow-sm: 0 1px 2px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.15);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.2);
  --shadow-lg: 0 8px 30px rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.3);
  --shadow-glow: 0 0 20px var(--accent-glow), 0 0 40px rgba(240,165,0,0.05);
}

/* ─── Reset & Base ───────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background: var(--bg);
  color: var(--ink-primary);
  font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
  min-height: 100vh;
  line-height: 1.6;
  /* Ambient light blobs for glass effect + grain */
  background-image:
    radial-gradient(ellipse 600px 400px at 15% 5%, rgba(240,165,0,0.06) 0%, transparent 70%),
    radial-gradient(ellipse 500px 500px at 85% 90%, rgba(99,102,241,0.04) 0%, transparent 70%),
    radial-gradient(ellipse 400px 300px at 50% 50%, rgba(240,165,0,0.02) 0%, transparent 70%),
    url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.02'/%3E%3C/svg%3E");
  background-attachment: fixed;
}

::selection {
  background: rgba(240,165,0,0.25);
  color: #fff;
}

/* ─── Scrollbar ──────────────────────────────────────────────────────────── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 99px;
  transition: background 0.2s;
}
::-webkit-scrollbar-thumb:hover { background: var(--ink-muted); }

/* ─── Typography ─────────────────────────────────────────────────────────── */
h1, h2, h3, h4, h5, h6 {
  font-family: 'Syne', system-ui, sans-serif;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.025em;
  color: var(--ink-primary);
}

code, kbd, pre, .mono {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85em;
}

/* ─── Layout Shell ───────────────────────────────────────────────────────── */
.app-shell {
  display: grid;
  grid-template-columns: var(--sidebar-w) 1fr;
  min-height: 100vh;
}

.app-sidebar {
  background: rgba(12,12,26,0.75);
  border-right: 1px solid rgba(255,255,255,0.04);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  z-index: 40;
}

.app-main {
  overflow-y: auto;
  padding: 28px 32px;
  min-height: 100vh;
}

/* ─── Mobile responsive ──────────────────────────────────────────────────── */
.mobile-menu-btn {
  display: none;
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 50;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: rgba(12,12,26,0.7);
  border: 1px solid rgba(255,255,255,0.06);
  color: var(--ink-primary);
  cursor: pointer;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.2s;
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
.mobile-menu-btn:hover { background: var(--raised); border-color: var(--accent); }

@media (max-width: 768px) {
  .app-shell { grid-template-columns: 1fr; }
  .app-sidebar {
    position: fixed;
    left: -260px;
    width: var(--sidebar-w);
    transition: left 0.3s cubic-bezier(0.4,0,0.2,1);
    box-shadow: var(--shadow-lg);
  }
  .app-sidebar.open { left: 0; }
  .mobile-menu-btn { display: flex; }
  .app-main { padding: 20px 16px; padding-top: 60px; }
  .mobile-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(4px);
    z-index: 35;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
  }
  .mobile-overlay.open { opacity: 1; pointer-events: all; }
}

/* ─── Component Classes ──────────────────────────────────────────────────── */
.card {
  background: rgba(12,12,26,0.6);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm), inset 0 1px 0 rgba(255,255,255,0.03);
  backdrop-filter: blur(16px) saturate(1.2);
  -webkit-backdrop-filter: blur(16px) saturate(1.2);
  transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
}

.card-interactive {
  cursor: pointer;
}
.card-interactive:hover {
  border-color: rgba(240,165,0,0.3);
  box-shadow: var(--shadow-md), 0 0 0 1px rgba(240,165,0,0.1);
  transform: translateY(-2px);
}

.card-selected {
  border-color: var(--accent) !important;
  box-shadow: 0 0 0 1px var(--accent), var(--shadow-glow) !important;
}

/* ─── Buttons ────────────────────────────────────────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 18px;
  border-radius: var(--radius-sm);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
  white-space: nowrap;
  text-decoration: none;
  letter-spacing: 0.01em;
}

.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn:active:not(:disabled) { transform: scale(0.97); }

.btn-primary {
  background: linear-gradient(135deg, var(--accent) 0%, #d4920a 100%);
  color: #000;
  box-shadow: 0 2px 8px rgba(240,165,0,0.25);
}
.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--accent-hover) 0%, var(--accent) 100%);
  box-shadow: 0 4px 16px rgba(240,165,0,0.35);
}

.btn-outline {
  background: transparent;
  color: var(--ink-primary);
  border: 1px solid var(--border);
}
.btn-outline:hover:not(:disabled) {
  background: var(--raised);
  border-color: var(--ink-muted);
}

.btn-ghost {
  background: transparent;
  color: var(--ink-secondary);
}
.btn-ghost:hover:not(:disabled) {
  background: var(--raised);
  color: var(--ink-primary);
}

.btn-danger {
  background: rgba(239,68,68,0.08);
  color: var(--fail);
  border: 1px solid rgba(239,68,68,0.15);
}
.btn-danger:hover:not(:disabled) { background: rgba(239,68,68,0.15); }

.btn-sm { padding: 5px 12px; font-size: 12px; }
.btn-lg { padding: 12px 24px; font-size: 15px; }
.btn-icon { padding: 8px; aspect-ratio: 1; }

/* ─── Form Controls ──────────────────────────────────────────────────────── */
.input {
  background: rgba(19,19,37,0.7);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: var(--radius-sm);
  color: var(--ink-primary);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  padding: 9px 14px;
  width: 100%;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.input::placeholder { color: var(--ink-muted); }
.input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-dim), 0 0 12px rgba(240,165,0,0.08);
}
.input:disabled { opacity: 0.5; cursor: not-allowed; }

.label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-secondary);
  margin-bottom: 6px;
}

.field { display: flex; flex-direction: column; gap: 4px; }

/* ─── Badge ──────────────────────────────────────────────────────────── */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  font-family: 'DM Sans', sans-serif;
}

.badge-default { background: var(--raised); color: var(--ink-secondary); border: 1px solid var(--border); }
.badge-accent  { background: var(--accent-dim); color: var(--accent); border: 1px solid rgba(240,165,0,0.15); }
.badge-ok      { background: rgba(34,197,94,0.08); color: var(--ok); border: 1px solid rgba(34,197,94,0.15); }
.badge-fail    { background: rgba(239,68,68,0.08); color: var(--fail); border: 1px solid rgba(239,68,68,0.15); }

/* ─── Sidebar ────────────────────────────────────────────────────────────── */
.sidebar-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  color: var(--ink-secondary);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  border: 1px solid transparent;
  background: none;
  width: 100%;
  position: relative;
}
.sidebar-link:hover {
  background: var(--raised);
  color: var(--ink-primary);
}
.sidebar-link.active {
  background: var(--accent-dim);
  color: var(--accent);
  border-color: rgba(240,165,0,0.12);
  font-weight: 600;
}
.sidebar-link.active::before {
  content: '';
  position: absolute;
  left: -1px;
  top: 6px;
  bottom: 6px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--accent);
  animation: glow-pulse 2s ease-in-out infinite;
}

.sidebar-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  opacity: 0.7;
}
.sidebar-link.active .sidebar-icon { opacity: 1; }

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--surface) 0%,
    var(--raised) 50%,
    var(--surface) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.8s infinite linear;
  border-radius: var(--radius-sm);
}

/* ─── Stagger Animation ─────────────────────────────────────────────────── */
.stagger > * {
  opacity: 0;
  animation: fade-up 0.5s cubic-bezier(0.4,0,0.2,1) forwards;
}
.stagger > *:nth-child(1) { animation-delay: 0.04s; }
.stagger > *:nth-child(2) { animation-delay: 0.08s; }
.stagger > *:nth-child(3) { animation-delay: 0.12s; }
.stagger > *:nth-child(4) { animation-delay: 0.16s; }
.stagger > *:nth-child(5) { animation-delay: 0.20s; }
.stagger > *:nth-child(6) { animation-delay: 0.24s; }
.stagger > *:nth-child(7) { animation-delay: 0.28s; }
.stagger > *:nth-child(8) { animation-delay: 0.32s; }
.stagger > *:nth-child(n+9) { animation-delay: 0.36s; }

/* Page enter animation */
.page-enter {
  animation: fade-up 0.4s cubic-bezier(0.4,0,0.2,1) forwards;
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position:  200% 0; }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 12px var(--accent-glow); }
  50%      { box-shadow: 0 0 24px var(--accent-glow), 0 0 40px rgba(240,165,0,0.05); }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(16px); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes slide-in-left {
  from { opacity: 0; transform: translateX(-16px); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes slide-down {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-4px); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25%      { transform: translateX(-2px); }
  75%      { transform: translateX(2px); }
}

/* ─── Animation Classes ────────────────────────────────────────────────────── */
.animate-scale-in { animation: scale-in 0.3s cubic-bezier(0.4,0,0.2,1) forwards; }
.animate-slide-right { animation: slide-in-right 0.35s cubic-bezier(0.4,0,0.2,1) forwards; }
.animate-slide-left { animation: slide-in-left 0.3s cubic-bezier(0.4,0,0.2,1) forwards; }
.animate-slide-down { animation: slide-down 0.25s ease-out forwards; }
.animate-float { animation: float 3s ease-in-out infinite; }
.animate-glow { animation: glow-pulse 2s ease-in-out infinite; }
.animate-shake { animation: shake 0.4s ease-in-out; }

/* ─── Hover Transforms ─────────────────────────────────────────────────────── */
.hover-lift {
  transition: transform 0.2s, box-shadow 0.2s;
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.3);
}

.hover-scale {
  transition: transform 0.15s;
}
.hover-scale:hover {
  transform: scale(1.03);
}
.hover-scale:active {
  transform: scale(0.98);
}

/* ─── Content Transition ───────────────────────────────────────────────────── */
.transition-content {
  transition: opacity 0.2s, transform 0.2s;
}

/* ─── Sidebar Link Hover ───────────────────────────────────────────────────── */
.sidebar-link {
  transition: all 0.2s, padding-left 0.2s;
}
.sidebar-link:hover {
  padding-left: 4px;
}

/* ─── Input Focus Glow ─────────────────────────────────────────────────────── */
input:focus,
select:focus,
textarea:focus {
  box-shadow: 0 0 0 3px rgba(240,165,0,0.08);
}

/* ─── Code Preview ───────────────────────────────────────────────────────── */
.code-block {
  background: #040408;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius);
  padding: 18px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  line-height: 1.7;
  color: #9d9dbf;
  overflow-x: auto;
  white-space: pre;
}

/* ─── Drag handle ────────────────────────────────────────────────────────── */
.drag-handle {
  cursor: grab;
  color: var(--ink-muted);
  transition: color 0.15s;
}
.drag-handle:hover { color: var(--ink-secondary); }
.drag-handle:active { cursor: grabbing; }

/* ─── Divider ────────────────────────────────────────────────────────────── */
.divider {
  height: 1px;
  background: var(--border);
  margin: 0;
}

/* ─── Tabs ───────────────────────────────────────────────────────────────── */
.tab-bar {
  display: flex;
  gap: 2px;
  padding: 3px;
  background: rgba(19,19,37,0.5);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255,255,255,0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.tab {
  flex: 1;
  padding: 7px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: transparent;
  color: var(--ink-secondary);
  transition: all 0.2s;
  font-family: 'DM Sans', sans-serif;
}
.tab:hover { color: var(--ink-primary); }
.tab.active {
  background: var(--surface);
  color: var(--ink-primary);
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
}

/* ─── Empty state ────────────────────────────────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 24px;
  color: var(--ink-muted);
  text-align: center;
}
.empty-state svg { opacity: 0.3; }
.empty-state p { font-size: 13px; max-width: 240px; line-height: 1.6; }

/* ─── Color Swatch ───────────────────────────────────────────────────────── */
.color-swatch {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 2px solid rgba(255,255,255,0.08);
  cursor: pointer;
  flex-shrink: 0;
  transition: border-color 0.2s, transform 0.2s;
}
.color-swatch:hover { border-color: rgba(255,255,255,0.2); transform: scale(1.1); }

/* ─── Section header ─────────────────────────────────────────────────────── */
.section-title {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-muted);
  padding: 0 14px;
  margin-bottom: 4px;
}

/* ─── Glass card effect ──────────────────────────────────────────────────── */
.glass {
  background: rgba(12,12,26,0.55);
  backdrop-filter: blur(20px) saturate(1.3);
  -webkit-backdrop-filter: blur(20px) saturate(1.3);
  border: 1px solid rgba(255,255,255,0.06);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
}

.glass-subtle {
  background: rgba(12,12,26,0.35);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.04);
}

/* ─── Accent border glow ─────────────────────────────────────────────────── */
.glow-border {
  position: relative;
}
.glow-border::after {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(240,165,0,0.2), transparent 50%, rgba(240,165,0,0.1));
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s;
}
.glow-border:hover::after { opacity: 1; }

/* ─── Toast (Sonner override) ────────────────────────────────────────────── */
[data-sonner-toast] {
  background: var(--surface) !important;
  border: 1px solid var(--border) !important;
  color: var(--ink-primary) !important;
  font-family: 'DM Sans', sans-serif !important;
}

/* ─── Focus ring utility ─────────────────────────────────────────────────── */
.focus-ring:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--accent);
}
```

### `styles\ui.ts`

```typescript
/* Centralized Tailwind classes for consistent UI styling */

export const inputBase =
  'w-full rounded-lg border border-white/5 bg-raised/70 backdrop-blur-sm px-3 py-2 text-sm text-ink-primary placeholder-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors'

export const btnBase = 'px-4 py-2 rounded-lg text-sm font-medium transition-colors'

export const btnPrimary = `${btnBase} bg-accent text-black hover:bg-accent-hover disabled:opacity-50`

export const btnOutline = `${btnBase} border border-border bg-transparent text-ink-primary hover:bg-raised`

export const btnGhost = `${btnBase} bg-transparent text-ink-secondary hover:bg-raised hover:text-ink-primary`

export const btnDanger = `${btnBase} bg-fail/10 text-fail border border-fail/20 hover:bg-fail/20`

export const btnSuccess = `${btnBase} bg-ok text-black hover:bg-ok/80`

export const cardBase = 'rounded-xl border border-white/[0.06] bg-surface/60 backdrop-blur-xl overflow-hidden shadow-sm'

export const cardInteractive = `${cardBase} cursor-pointer transition-all hover:border-accent/30 hover:shadow-lg hover:bg-surface/80`

export const badgeBase = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium'
```

### `types\index.ts`

```typescript
// src/types/index.ts

// ─── Componentes ───────────────────────────────────────────────────────────

export type ComponentCategory =
  | 'Hero'
  | 'Navigation'
  | 'Features'
  | 'Pricing'
  | 'Testimonials'
  | 'CTA'
  | 'FAQ'
  | 'Stats'
  | 'Gallery'
  | 'Contact'
  | 'Footer'
  | 'Misc'

export interface PropDefinition {
  name: string
  type: 'string' | 'boolean' | 'number' | 'string[]' | 'Record<string, string>' | 'array'
  required: boolean
  description?: string
  default?: string
  previewValue: string
}

export interface ComponentMeta {
  id: string
  name: string
  category: ComponentCategory
  description: string
  previewUrl?: string
  previewPath?: string
  screenshotUrl?: string
  codeUrl?: string
  componentFile?: string
  props: PropDefinition[]
  tags: string[]
  bestFor: string[]
  copy?: Record<string, string>
  order?: number
  createdAt: string
  updatedAt: string
}

// ─── Builder ────────────────────────────────────────────────────────────────

export interface SelectedComponent {
  meta: ComponentMeta
  position: number
  copy?: Record<string, string>
}

export interface ArtDirection {
  colorPrimary: string
  colorSecondary: string
  colorBackground: string
  colorText: string
  fontHeading: string
  fontBody: string
  mood: string
  references: string
  notes: string
}

export interface ProjectConfig {
  clientName: string
  projectType: string
  niche: string
  pageGoal: string
  googleAnalyticsId: string
  siteUrl: string
}

// ─── Configurações ──────────────────────────────────────────────────────────

export interface AppSettings {
  githubToken: string
  githubOwner: string
  componentsRepo: string
  baseProjectRepo: string
  previewBaseUrl: string
  registryUrl: string
  studioName: string
  manifestTemplate: string
  defaultFontHeading: string
  defaultFontBody: string
  defaultColorPrimary: string
  defaultCtaLabel: string
  npmNamespace: string
  userName: string
  userEmail: string
}

// ─── GitHub API ─────────────────────────────────────────────────────────────

export interface GitHubFile {
  name: string
  path: string
  sha: string
  content?: string
  encoding?: string
}

export interface CreateProjectResult {
  repoUrl: string
  cloneUrl: string
  sshUrl: string
  vscodeUrl: string
  success: boolean
  error?: string
}

// ─── Admin ─────────────────────────────────────────────────────────────────

export interface PropDraft {
  name: string
  type: string
  required: boolean
  description: string
  previewValue: string
}

export interface PropMeta {
  name: string
  type: string
  required: boolean
  description: string
}
```

