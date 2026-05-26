import { useState } from 'react'
import type { ComponentMeta, PropDefinition, PropDraft, AppSettings } from '../types'

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

/* --- Tailwind classes --- */
const inputBase = 'w-full rounded-lg border border-border bg-raised px-3 py-2 text-sm text-ink-primary placeholder-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent'
const btnBase = 'px-4 py-2 rounded-lg text-sm font-medium transition-colors'
const btnPrimary = `${btnBase} bg-accent text-bg hover:bg-accent-hover disabled:opacity-50`
const btnOutline = `${btnBase} border border-border bg-transparent text-ink-primary hover:bg-raised`
const btnDanger = `${btnBase} bg-fail text-white hover:opacity-90 px-2 py-1`
const cardBase = 'rounded-xl border border-border bg-surface p-5'
const badgeBase = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium'

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
        <label className="block text-xs font-medium text-ink-secondary">{label}</label>
        {children}
      </div>
    )
  }

  return (
    <form className="max-w-3xl flex flex-col gap-4" onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold">Adicionar Componente</h1>

      {feedback && (
        <div className={`${badgeBase} ${feedback.type === 'ok' ? 'bg-ok/20 text-ok' : 'bg-fail/20 text-fail'} px-3 py-2`}>
          {feedback.message}
        </div>
      )}

      <div className={cardBase}>
        <h2 className="text-lg font-semibold mb-4">Informacoes Basicas</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nome (PascalCase)">
            <input
              className={inputBase}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="HeroSplit"
              required
            />
          </Field>
          <Field label="Categoria">
            <select className={inputBase} value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <div className="col-span-2">
            <Field label="Descricao">
              <input
                className={inputBase}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Descricao curta do componente"
                required
              />
            </Field>
          </div>
          <Field label="Tags (separadas por virgula)">
            <input
              className={inputBase}
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="hero, split, imagem"
            />
          </Field>
          <Field label="Melhor para">
            <input
              className={inputBase}
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

      <div className={cardBase}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Props</h2>
          <button type="button" className={`${btnOutline} py-1 px-3 text-xs`} onClick={addProp}>
            + Adicionar Prop
          </button>
        </div>

        {props.length === 0 && (
          <div className="text-ink-secondary py-4 text-center">Nenhuma prop adicionada ainda.</div>
        )}

        {props.map((prop, i) => (
          <div key={i} className="grid grid-cols-[1fr_100px_60px_1fr_1fr_auto] gap-2 items-end py-2 border-b border-border-subtle last:border-0">
            <Field label="Nome">
              <input className={inputBase} value={prop.name} onChange={e => updateProp(i, 'name', e.target.value)} placeholder="titulo" />
            </Field>
            <Field label="Tipo">
              <select className={inputBase} value={prop.type} onChange={e => updateProp(i, 'type', e.target.value)}>
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
              <input className={inputBase} value={prop.description} onChange={e => updateProp(i, 'description', e.target.value)} placeholder="Descricao" />
            </Field>
            <Field label="Preview">
              <input className={inputBase} value={prop.previewValue} onChange={e => updateProp(i, 'previewValue', e.target.value)} placeholder="Valor" />
            </Field>
            <button type="button" className={btnDanger} onClick={() => removeProp(i)}>×</button>
          </div>
        ))}
      </div>

      <div className={cardBase}>
        <h2 className="text-lg font-semibold mb-4">Codigo do Componente (.astro)</h2>
        <textarea
          className={`${inputBase} min-h-[300px] font-mono text-sm resize-y`}
          value={astroCode}
          onChange={e => setAstroCode(e.target.value)}
          placeholder={'---\ninterface Props {\n  titulo: string\n}\nconst { titulo } = Astro.props\n---\n\n<section>\n  <h1>{titulo}</h1>\n</section>'}
          required
        />
      </div>

      {name && props.length > 0 && (
        <div className={cardBase}>
          <h2 className="text-lg font-semibold mb-2">Preview Gerado</h2>
          <pre className="bg-raised p-3 rounded-lg text-xs font-mono overflow-x-auto mb-4">{generatePreviewCode()}</pre>

          <h2 className="text-lg font-semibold mb-2">index.ts Gerado</h2>
          <pre className="bg-raised p-3 rounded-lg text-xs font-mono overflow-x-auto">{generateIndexCode()}</pre>
        </div>
      )}

      <button type="submit" className={`${btnPrimary} py-3 text-base`} disabled={submitting || !name || !astroCode}>
        {submitting ? 'Publicando...' : 'Publicar Componente'}
      </button>
    </form>
  )
}
