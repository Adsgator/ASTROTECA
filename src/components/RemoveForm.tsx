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
