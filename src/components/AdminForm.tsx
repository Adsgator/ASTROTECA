import { useState } from 'react'
import * as ui from '../styles/ui'
import SelectField from './builder/SelectField'
import { Check, Loader2, Info } from 'lucide-react'

const CATEGORIES = [
  'Hero', 'Header', 'Navigation', 'Features', 'Services', 'Pricing',
  'Testimonials', 'Process', 'CTA', 'FAQ', 'Stats', 'Gallery',
  'Contact', 'Footer', 'About', 'Team', 'Trust', 'UI', 'Misc', 'Other',
]

interface DetectedProp {
  name: string
  type: string
  required: boolean
  previewValue?: string
}

type Phase = 'idle' | 'analyzing' | 'ready' | 'publishing' | 'done' | 'error'

function guessCategory(code: string): string {
  const m = code.match(/\/\/\s*(\w+)\/(\w+)\.astro/)
  if (m) {
    const cat = m[1]
    if (CATEGORIES.includes(cat)) return cat
  }
  return 'Other'
}

function guessName(code: string): string {
  const m = code.match(/\/\/\s*(?:\w+\/)?(\w+)\.astro/)
  if (m) return m[1]
  const im = code.match(/interface Props/)
  if (im) return 'MeuComponente'
  return 'MeuComponente'
}

export default function AdminForm() {
  const [astroCode, setAstroCode] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [error, setError] = useState('')

  // Dados analisados
  const [detectedName, setDetectedName] = useState('')
  const [detectedProps, setDetectedProps] = useState<DetectedProp[]>([])

  // Form
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Other')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [bestFor, setBestFor] = useState('')

  // Resultado
  const [result, setResult] = useState<{ name: string; id: string; category: string } | null>(null)

  function handleCodeChange(code: string) {
    setAstroCode(code)
    if (phase !== 'idle') reset()
    // Auto-detecta nome e categoria do comentário no topo
    if (code.trim()) {
      const n = guessName(code)
      const c = guessCategory(code)
      setName(n)
      setCategory(c)
    }
  }

  async function analyze() {
    if (!astroCode.trim()) return
    setError('')
    setPhase('analyzing')
    try {
      const res = await fetch('/api/publish-component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: 'analyze', astroCode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDetectedName(data.name)
      setDetectedProps(data.props)
      if (data.name && !name) setName(data.name)
      setPhase('ready')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao analisar')
      setPhase('error')
    }
  }

  async function publish() {
    setError('')
    setPhase('publishing')
    try {
      const res = await fetch('/api/publish-component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase: 'publish',
          astroCode,
          name: name.trim() || detectedName,
          category,
          description,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          bestFor: bestFor.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
      setPhase('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao publicar')
      setPhase('error')
    }
  }

  function reset() {
    setPhase('idle'); setError(''); setDetectedName(''); setDetectedProps([])
    setResult(null); setDescription(''); setTags(''); setBestFor('')
  }

  const busy = phase === 'analyzing' || phase === 'publishing'

  return (
    <div className="max-w-3xl flex flex-col gap-5 stagger">
      <div>
        <h1 className="text-2xl font-bold mb-1">Adicionar Componente</h1>
        <p className="text-sm text-ink-muted">
          Cole o código <code className="bg-raised px-1 rounded">.astro</code> gerado pelo Claude.
          O sistema detecta as props, sanitiza e publica direto no GitHub.
        </p>
      </div>

      {/* Resultado */}
      {phase === 'done' && result && (
        <div className={`${ui.cardBase} p-5 border-ok/20 bg-ok/5`}>
          <div className="flex items-center gap-2 text-ok mb-3">
            <Check className="w-5 h-5" />
            <span className="font-semibold">Componente publicado com sucesso!</span>
          </div>
          <div className="space-y-1 text-sm text-ink-secondary">
            <p><span className="text-ink-muted">Nome:</span> <code className="bg-raised px-1 rounded text-xs">{result.name}</code></p>
            <p><span className="text-ink-muted">ID:</span> <code className="bg-raised px-1 rounded text-xs">{result.id}</code></p>
            <p><span className="text-ink-muted">Pasta:</span> <code className="bg-raised px-1 rounded text-xs">{result.category}/</code></p>
          </div>
          <div className="flex gap-2 mt-4">
            <a href={`/preview/${result.id}`} target="_blank" rel="noopener noreferrer" className={`${ui.btnOutline} text-sm`}>Ver Preview</a>
            <button onClick={() => { reset(); setAstroCode(''); setName(''); setCategory('Other') }} className={`${ui.btnGhost} text-sm`}>Adicionar outro</button>
          </div>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className={`${ui.badgeBase} bg-fail/10 text-fail border border-fail/20 px-3 py-2.5 text-sm`}>
          {error}
        </div>
      )}

      {phase !== 'done' && (
        <>
          {/* Passo 1: Código */}
          <div className={`${ui.cardBase} p-5`}>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted mb-3">1. Código do Componente</h2>
            <textarea
              className={`${ui.inputBase} min-h-[260px] font-mono text-sm resize-y`}
              value={astroCode}
              onChange={e => handleCodeChange(e.target.value)}
              placeholder={`---\n// Hero/HeroSplit.astro\ninterface Props {\n  headline: string\n  subheadline?: string\n}\nconst { headline, subheadline = 'Subtítulo' } = Astro.props\n---\n\n<section class="section-py bg-background">\n  <div class="container-wide">\n    <h1 class="font-serif text-display-xl">{headline}</h1>\n  </div>\n</section>`}
              disabled={busy}
            />
            {astroCode.trim() && phase === 'idle' && (
              <div className="mt-3 flex items-center gap-3">
                {name && (
                  <span className="text-xs text-ink-muted">
                    Detectado: <code className="bg-raised px-1 rounded">{name}</code> → <code className="bg-raised px-1 rounded">{category}/</code>
                  </span>
                )}
                <button
                  className={`${ui.btnPrimary} ml-auto`}
                  onClick={analyze}
                  disabled={busy}
                >
                  Analisar props
                </button>
              </div>
            )}
            {phase === 'analyzing' && (
              <div className="mt-3 flex items-center gap-2 text-ink-muted text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analisando...
              </div>
            )}
            {(phase === 'ready' || phase === 'publishing') && (
              <div className="mt-3 flex items-center gap-2 text-ok text-sm">
                <Check className="w-4 h-4" />
                <span><strong>{detectedProps.length}</strong> prop(s) detectada(s)</span>
              </div>
            )}
          </div>

          {/* Passo 2: Props detectadas */}
          {(phase === 'ready' || phase === 'publishing') && detectedProps.length > 0 && (
            <div className={`${ui.cardBase} p-5`}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted mb-3">2. Props Detectadas</h2>
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

          {/* Passo 3: Metadados */}
          {(phase === 'ready' || phase === 'publishing') && (
            <div className={`${ui.cardBase} p-5`}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted mb-4">
                {detectedProps.length > 0 ? '3.' : '2.'} Metadados
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-ink-secondary uppercase tracking-wider">Nome (PascalCase)</label>
                  <input
                    className={ui.inputBase}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="HeroSplit"
                    disabled={phase === 'publishing'}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-ink-secondary uppercase tracking-wider">Categoria</label>
                  <SelectField
                    value={category}
                    onChange={v => setCategory(v)}
                    options={CATEGORIES.map(c => ({ value: c, label: c }))}
                    disabled={phase === 'publishing'}
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="block text-xs font-medium text-ink-secondary uppercase tracking-wider">Descrição</label>
                  <input
                    className={ui.inputBase}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Hero com imagem lateral e dois CTAs"
                    disabled={phase === 'publishing'}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-ink-secondary uppercase tracking-wider">Tags</label>
                  <input
                    className={ui.inputBase}
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    placeholder="hero, split, imagem"
                    disabled={phase === 'publishing'}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-ink-secondary uppercase tracking-wider">Ideal para</label>
                  <input
                    className={ui.inputBase}
                    value={bestFor}
                    onChange={e => setBestFor(e.target.value)}
                    placeholder="landing pages, serviços"
                    disabled={phase === 'publishing'}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Botão publicar */}
          {(phase === 'ready' || phase === 'publishing') && (
            <div className="space-y-3">
              <div className="rounded-xl border border-white/[0.06] bg-raised/30 px-4 py-3 text-xs text-ink-muted flex items-start gap-2">
                <Info className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <span>
                  O componente será sanitizado (assets removidos, dados sensíveis limpos), gravado em{' '}
                  <code className="bg-raised px-1 rounded">{category}/{name || detectedName}.astro</code>,
                  registrado e publicado no GitHub. A preview é gerada automaticamente.
                </span>
              </div>
              <button
                className={`${ui.btnPrimary} w-full py-3 text-base`}
                onClick={publish}
                disabled={phase === 'publishing' || !description.trim()}
                title={!description.trim() ? 'Descrição é obrigatória' : ''}
              >
                {phase === 'publishing' ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publicando...
                  </span>
                ) : 'Publicar no GitHub'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
