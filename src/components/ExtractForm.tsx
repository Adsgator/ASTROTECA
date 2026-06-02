import { useState, useRef } from 'react'
import * as ui from '../styles/ui'
import SelectField from './builder/SelectField'
import { Check, Upload, Loader2, Info, AlertTriangle } from 'lucide-react'

const CATEGORIES = [
  'Hero', 'Header', 'Navigation', 'Features', 'Services', 'Pricing',
  'Testimonials', 'Process', 'CTA', 'FAQ', 'Stats', 'Gallery',
  'Contact', 'Footer', 'About', 'Team', 'Trust', 'UI', 'Misc', 'Other',
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

/** Tenta inferir categoria pelo nome do arquivo */
function guessCategory(fileName: string): string {
  const n = fileName.toLowerCase().replace(/\.\w+$/, '').replace(/\d{4}$/, '')
  if (n.includes('hero'))        return 'Hero'
  if (n.includes('header'))      return 'Header'
  if (n.includes('nav'))         return 'Navigation'
  if (n.includes('footer'))      return 'Footer'
  if (n.includes('feature'))     return 'Features'
  if (n.includes('service'))     return 'Services'
  if (n.includes('testimonial')) return 'Testimonials'
  if (n.includes('pric'))        return 'Pricing'
  if (n.includes('faq'))         return 'FAQ'
  if (n.includes('cta'))         return 'CTA'
  if (n.includes('contact'))     return 'Contact'
  if (n.includes('stat'))        return 'Stats'
  if (n.includes('trust'))       return 'Trust'
  if (n.includes('about'))       return 'About'
  if (n.includes('team'))        return 'Team'
  return 'Other'
}

export default function ExtractForm() {
  // Modo: 'file' = caminho no disco | 'upload' = arquivo arrastado/selecionado
  const [mode, setMode] = useState<'file' | 'upload'>('upload')
  const [filePath, setFilePath] = useState('')
  const [uploadedCode, setUploadedCode] = useState('')
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [dragging, setDragging] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    name: string; id: string; category: string; previewPath: string
    children: { childName: string; childCategory: string }[]
    gitWarnings?: string[]
  } | null>(null)

  function readFile(file: File) {
    if (!file.name.endsWith('.astro')) {
      setError('Somente arquivos .astro são suportados')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const code = e.target?.result as string
      setUploadedCode(code)
      setUploadedFileName(file.name)
      setMode('upload')
      setCategory(guessCategory(file.name))
      if (phase !== 'idle') reset()
    }
    reader.readAsText(file)
  }

  function buildRequestBody(extraPhase: 'analyze' | 'extract') {
    const base = mode === 'upload'
      ? { astroCode: uploadedCode, fileName: uploadedFileName }
      : { filePath: filePath.trim() }
    return {
      ...base,
      phase: extraPhase,
      category,
      description,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      bestFor: bestFor.split(',').map(t => t.trim()).filter(Boolean),
      chosenChildren,
    }
  }

  async function analyze() {
    setError('')
    setPhase('analyzing')
    try {
      const res = await fetch('/api/extract-component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildRequestBody('analyze')),
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
        body: JSON.stringify(buildRequestBody('extract')),
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
    setPhase('idle'); setError(''); setFileName('')
    setDetectedProps([]); setChildren([]); setChosenChildren([])
    setDescription(''); setTags(''); setBestFor(''); setResult(null)
  }

  function fullReset() {
    reset()
    setFilePath(''); setUploadedCode(''); setUploadedFileName(''); setMode('upload')
  }

  function toggleChild(importName: string) {
    setChosenChildren(prev =>
      prev.includes(importName) ? prev.filter(c => c !== importName) : [...prev, importName]
    )
  }

  const hasSource = mode === 'upload' ? !!uploadedCode : !!filePath.trim()
  const busy = phase === 'analyzing' || phase === 'extracting'

  return (
    <div className="max-w-2xl flex flex-col gap-5 stagger">
      <div>
        <h1 className="text-2xl font-bold mb-1">Extrair Componente</h1>
        <p className="text-sm text-ink-muted">
          Arraste um <code className="bg-raised px-1 rounded">.astro</code> de qualquer projeto local,
          selecione um arquivo, ou cole o caminho abaixo.
          O sistema analisa, sanitiza e publica direto no GitHub.
        </p>
      </div>

      {/* ── Passo 1: Arquivo ── */}
      <div className={`${ui.cardBase} p-5`}>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted mb-3">1. Arquivo</h2>

        {/* Zona de drag & drop / upload */}
        <div
          className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors p-6 mb-3 cursor-default ${
            dragging
              ? 'border-accent bg-accent/10 text-accent'
              : uploadedCode
              ? 'border-ok/40 bg-ok/5 text-ok'
              : 'border-white/10 bg-raised/30 text-ink-muted hover:border-white/20'
          }`}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault()
            setDragging(false)
            const file = e.dataTransfer.files[0]
            if (file) readFile(file)
          }}
          onClick={() => fileInputRef.current?.click()}
          style={{ cursor: 'pointer' }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".astro"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f) }}
          />
          {uploadedCode ? (
            <>
              <Check className="w-7 h-7" />
              <p className="text-sm font-medium">{uploadedFileName}</p>
              <p className="text-xs opacity-60">Clique para trocar o arquivo</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 opacity-40" />
              <p className="text-sm">{dragging ? 'Solte aqui' : 'Arraste o .astro aqui ou clique para selecionar'}</p>
            </>
          )}
        </div>

        {/* Alternativa: caminho no disco */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-xs text-ink-muted">ou cole o caminho</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>
        <div className="flex gap-2">
          <input
            className={ui.inputBase}
            placeholder="C:/PROJETOS/meu-projeto/src/components/Footer.astro"
            value={filePath}
            onChange={e => {
              const v = e.target.value.replace(/^["']|["']$/g, '')
              setFilePath(v)
              if (v) { setMode('file'); setUploadedCode(''); setUploadedFileName('') }
              if (phase !== 'idle') reset()
            }}
            disabled={busy}
          />
        </div>
        <p className="text-xs text-ink-muted/60 mt-1.5">
          Dica Windows: Shift + botão direito no arquivo → "Copiar como caminho"
        </p>

        {/* Botão analisar */}
        {hasSource && phase === 'idle' && (
          <button
            className={`${ui.btnPrimary} mt-3 w-full`}
            onClick={analyze}
            disabled={busy}
          >
            Analisar
          </button>
        )}
        {phase === 'analyzing' && (
          <div className="mt-3 flex items-center gap-2 text-ink-muted text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Analisando...
          </div>
        )}
        {(phase === 'ready' || phase === 'extracting' || phase === 'done') && (
          <div className="mt-3 flex items-center gap-2 text-ok text-sm">
            <Check className="w-4 h-4" />
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
              <SelectField
                value={category}
                onChange={v => setCategory(v)}
                options={CATEGORIES.map(c => ({ value: c, label: c }))}
                disabled={phase === 'extracting' || phase === 'done'}
              />
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
            <Check className="w-5 h-5" />
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
          {result.gitWarnings && result.gitWarnings.length > 0 && (
            <div className="mt-3 p-2.5 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 inline mr-1" />
              {result.gitWarnings.join(' | ')}
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <a href={result.previewPath} target="_blank" rel="noopener noreferrer" className={`${ui.btnOutline} text-sm`}>Ver Preview</a>
            <a href="/" className={`${ui.btnOutline} text-sm`}>Ver na Biblioteca</a>
            <button onClick={fullReset} className={`${ui.btnGhost} text-sm`}>Extrair outro</button>
          </div>
        </div>
      )}

      {/* ── Botão extrair ── */}
      {(phase === 'ready' || phase === 'extracting') && (
        <div className="space-y-3">
          <div className="rounded-xl border border-white/[0.06] bg-raised/30 px-4 py-3 text-xs text-ink-muted flex items-start gap-2">
            <Info className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
            <span>
              O componente será sanitizado (tokens limpos, assets removidos), gravado em{' '}
              <code className="bg-raised px-1 rounded">{category}/</code> e publicado no GitHub.
              Preview gerado automaticamente.
            </span>
          </div>
          <button
            className={`${ui.btnPrimary} w-full py-3 text-base`}
            onClick={extract}
            disabled={phase === 'extracting' || !description.trim()}
            title={!description.trim() ? 'Descrição é obrigatória' : ''}
          >
            {phase === 'extracting' ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Extraindo e publicando...
              </span>
            ) : 'Extrair e publicar no GitHub'}
          </button>
        </div>
      )}
    </div>
  )
}
