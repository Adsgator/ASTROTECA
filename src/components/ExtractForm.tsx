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
