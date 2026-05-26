import { useState } from 'react'
import type { ComponentMeta, PropDefinition, PropDraft, AppSettings } from '../types'

const CATEGORIES = [
  'Hero',
  'Features',
  'Pricing',
  'Testimonials',
  'CTA',
  'Footer',
  'Navigation',
  'FAQ',
  'Gallery',
  'Contact',
  'About',
  'Stats',
  'Team',
  'Misc',
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
      tags: tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean),
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
        tags: tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
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
        body: JSON.stringify({
          settings,
          meta,
          astroCode,
          previewCode,
          indexCode,
        }),
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
      setFeedback({
        type: 'fail',
        message: e instanceof Error ? e.message : 'Erro desconhecido',
      })
    } finally {
      setSubmitting(false)
    }
  }

  function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div className="field">
        <label className="label">{label}</label>
        {children}
      </div>
    )
  }

  return (
    <>
      <style>{`
        .admin {
          max-width: 800px;
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .admin__title {
          font-size: var(--text-2xl);
          font-weight: 700;
        }

        .admin__row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
        }

        .admin__full {
          grid-column: 1 / -1;
        }

        .admin__props-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-2);
        }

        .admin__prop-item {
          display: grid;
          grid-template-columns: 1fr 100px 80px 1fr 1fr 40px;
          gap: var(--space-2);
          align-items: end;
          padding: var(--space-2) 0;
          border-bottom: 1px solid var(--border);
        }

        .admin__prop-item:last-child {
          border-bottom: none;
        }

        .admin__code-area {
          width: 100%;
          min-height: 300px;
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          resize: vertical;
        }

        .admin__generated {
          background: var(--surface-2);
          padding: var(--space-3);
          border-radius: var(--radius);
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          white-space: pre-wrap;
          max-height: 200px;
          overflow-y: auto;
        }

        .admin__id-preview {
          margin-top: var(--space-2);
        }
      `}</style>

      <form className="admin" onSubmit={handleSubmit}>
        <h1 className="admin__title">Adicionar Componente</h1>

        {feedback && (
          <div className={`badge ${feedback.type === 'ok' ? 'badge-ok' : 'badge-fail'}`}>
            {feedback.message}
          </div>
        )}

        <div className="card">
          <h2 className="section-title">Informacoes Basicas</h2>
          <div className="admin__row">
            <Field label="Nome (PascalCase)">
              <input
                className="input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="HeroSplit"
                required
              />
            </Field>
            <Field label="Categoria">
              <select
                className="input"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <div className="admin__full">
              <Field label="Descricao">
                <input
                  className="input"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Descricao curta do componente"
                  required
                />
              </Field>
            </div>
            <Field label="Tags (separadas por virgula)">
              <input
                className="input"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="hero, split, imagem"
              />
            </Field>
            <Field label="Melhor para">
              <input
                className="input"
                value={bestFor}
                onChange={e => setBestFor(e.target.value)}
                placeholder="Landing pages com imagem lateral"
              />
            </Field>
          </div>

          {name && (
            <div className="admin__id-preview">
              <span className="label">ID gerado: </span>
              <code>{generateId(name)}</code>
            </div>
          )}
        </div>

        <div className="card">
          <div className="admin__props-header">
            <h2 className="section-title">Props</h2>
            <button type="button" className="btn btn-outline btn-sm" onClick={addProp}>
              + Adicionar Prop
            </button>
          </div>

          {props.length === 0 && (
            <div className="empty-state">Nenhuma prop adicionada ainda.</div>
          )}

          {props.map((prop, i) => (
            <div key={i} className="admin__prop-item">
              <Field label="Nome">
                <input
                  className="input"
                  value={prop.name}
                  onChange={e => updateProp(i, 'name', e.target.value)}
                  placeholder="titulo"
                />
              </Field>
              <Field label="Tipo">
                <select
                  className="input"
                  value={prop.type}
                  onChange={e => updateProp(i, 'type', e.target.value)}
                >
                  <option value="string">string</option>
                  <option value="number">number</option>
                  <option value="boolean">boolean</option>
                  <option value="string[]">string[]</option>
                  <option value="Record<string, string>">Record</option>
                </select>
              </Field>
              <Field label="Obrig.">
                <input
                  type="checkbox"
                  checked={prop.required}
                  onChange={e => updateProp(i, 'required', e.target.checked)}
                />
              </Field>
              <Field label="Descricao">
                <input
                  className="input"
                  value={prop.description}
                  onChange={e => updateProp(i, 'description', e.target.value)}
                  placeholder="Descricao da prop"
                />
              </Field>
              <Field label="Preview Value">
                <input
                  className="input"
                  value={prop.previewValue}
                  onChange={e => updateProp(i, 'previewValue', e.target.value)}
                  placeholder="Valor no preview"
                />
              </Field>
              <div>
                <button
                  type="button"
                  className="btn btn-danger btn-sm btn-icon"
                  onClick={() => removeProp(i)}
                >
                  x
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="section-title">Codigo do Componente (.astro)</h2>
          <textarea
            className="input admin__code-area"
            value={astroCode}
            onChange={e => setAstroCode(e.target.value)}
            placeholder={'---\ninterface Props {\n  titulo: string\n}\nconst { titulo } = Astro.props\n---\n\n<section>\n  <h1>{titulo}</h1>\n</section>'}
            required
          />
        </div>

        {name && props.length > 0 && (
          <div className="card">
            <h2 className="section-title">Preview Gerado</h2>
            <div className="admin__generated">{generatePreviewCode()}</div>

            <h2 className="section-title">index.ts Gerado</h2>
            <div className="admin__generated">{generateIndexCode()}</div>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={submitting || !name || !astroCode}
        >
          {submitting ? 'Publicando...' : 'Publicar Componente'}
        </button>
      </form>
    </>
  )
}
