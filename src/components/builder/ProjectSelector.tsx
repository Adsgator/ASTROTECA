// src/components/builder/ProjectSelector.tsx

import { useState, useRef, useEffect } from 'react'
import type { ClientProject } from '../../types'
import { formatDate } from '../../lib/utils'
import * as ui from '../../styles/ui'

interface ProjectSelectorProps {
  activeProject: ClientProject | null
  onSwitch: (project: ClientProject) => void
  onCreate: (name: string) => void
  onDelete: (id: string) => void
  projects: ClientProject[]
}

export default function ProjectSelector({
  activeProject,
  onSwitch,
  onCreate,
  onDelete,
  projects,
}: ProjectSelectorProps) {
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setConfirmDeleteId(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleCreate() {
    const name = newName.trim()
    if (!name) return
    onCreate(name)
    setNewName('')
    setOpen(false)
  }

  function handleDelete(id: string) {
    onDelete(id)
    setConfirmDeleteId(null)
    if (projects.length <= 1) setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className={`${ui.btnOutline} flex items-center gap-2 max-w-[200px]`}
      >
        <span className="text-xs truncate">
          {activeProject?.name ?? 'Nenhum projeto'}
        </span>
        <span className="text-ink-muted text-xs flex-shrink-0">▾</span>
      </button>

      {open && (
        <div className={`${ui.cardBase} absolute top-full left-0 mt-1 w-72 z-50 overflow-hidden`}>
          <div className="p-2 space-y-0.5 max-h-64 overflow-y-auto">
            {projects.length === 0 && (
              <p className="text-xs text-ink-muted px-2 py-3 text-center">Nenhum projeto ainda</p>
            )}
            {projects.map(project => (
              <div
                key={project.id}
                className={[
                  'flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors',
                  project.id === activeProject?.id
                    ? 'bg-accent/10 border border-accent/20'
                    : 'hover:bg-raised',
                ].join(' ')}
              >
                <div
                  className="flex-1 min-w-0"
                  onClick={() => { onSwitch(project); setOpen(false) }}
                >
                  <p className="text-xs font-medium text-ink-primary truncate">{project.name}</p>
                  <p className="text-[10px] text-ink-muted">{formatDate(project.updatedAt)}</p>
                </div>

                {confirmDeleteId === project.id ? (
                  <div className="flex items-center gap-1.5 animate-scale-in flex-shrink-0">
                    <span className="text-[10px] text-fail">Deletar?</span>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-[10px] text-fail font-bold hover:underline"
                    >Sim</button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-[10px] text-ink-secondary hover:underline"
                    >Não</button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(project.id) }}
                    className="text-ink-muted hover:text-fail transition-colors flex-shrink-0 p-0.5"
                    title="Deletar projeto"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M6 2h4v1H6V2zm-2 2h8v1H4V4zm1 2h6v8H5V6zm1 1v6h1V7H6zm2 0v6h1V7H8zm2 0v6h1V7h-1z"/>
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-white/[0.06] p-2">
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="Nome do novo projeto..."
                className={`${ui.inputBase} text-xs py-1.5`}
              />
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className={`${ui.btnPrimary} text-xs px-2.5 flex-shrink-0`}
              >+</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
