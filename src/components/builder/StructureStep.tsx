// src/components/builder/StructureStep.tsx

import { useState, useRef } from 'react'
import type { PageSection, Briefing, AppSettingsV2 } from '../../types'
import { getAvailableSections, prefillCopyFromBriefing } from '../../lib/section-defaults'
import {
  Check, X, Download, Upload, GripVertical, ChevronUp, ChevronDown, Star,
  MessageSquare, DollarSign, HelpCircle, MapPin, ArrowRight, User, Settings,
  Zap, LayoutGrid, ClipboardList, Camera,
} from 'lucide-react'

const SECTION_ICONS: Record<string, React.ReactNode> = {
  'header':        <LayoutGrid className="w-4 h-4" />,
  'hero':          <Zap className="w-4 h-4" />,
  'sobre':         <User className="w-4 h-4" />,
  'servicos':      <Settings className="w-4 h-4" />,
  'como-funciona': <ArrowRight className="w-4 h-4" />,
  'diferenciais':  <Star className="w-4 h-4" />,
  'depoimentos':   <MessageSquare className="w-4 h-4" />,
  'google-reviews':<Star className="w-4 h-4" />,
  'precos':        <DollarSign className="w-4 h-4" />,
  'faq':           <HelpCircle className="w-4 h-4" />,
  'instagram':     <Camera className="w-4 h-4" />,
  'localizacao':   <MapPin className="w-4 h-4" />,
  'cta':           <ArrowRight className="w-4 h-4" />,
  'footer':        <ClipboardList className="w-4 h-4" />,
}
import {
  generateStructureDocument,
  parseStructureOutput,
  applyParsedStructure,
} from '../../lib/structure-document'
import * as ui from '../../styles/ui'
import { cn } from '../../lib/utils'
import PromptBlock from './PromptBlock'

interface StructureStepProps {
  sections: PageSection[]
  briefing: Briefing
  onChange: (sections: PageSection[]) => void
  settings: AppSettingsV2
}

// ─── Modal de importação ──────────────────────────────────────────────────────

function ImportModal({ onImport, onClose }: { onImport: (text: string) => void; onClose: () => void }) {
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  function handleImport() {
    setError('')
    try {
      onImport(text)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Formato inválido')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={cn(ui.cardBase, 'w-full max-w-2xl p-6 space-y-4')}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink-primary">Importar Output da IA</h3>
          <button onClick={onClose} className="text-ink-muted hover:text-ink-primary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-ink-secondary leading-relaxed">
          Cole aqui o output completo do Claude Chat — incluindo os delimitadores{' '}
          <code className="bg-raised px-1 rounded text-accent">===INICIO-OUTPUT===</code> e{' '}
          <code className="bg-raised px-1 rounded text-accent">===FIM-OUTPUT===</code>
        </p>

        <textarea
          value={text}
          onChange={e => { setText(e.target.value); setError('') }}
          placeholder="Cole o output completo aqui..."
          rows={12}
          className={cn(ui.inputBase, 'resize-none font-mono text-xs')}
        />

        {error && (
          <p className="text-xs text-fail bg-fail/10 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className={cn(ui.btnGhost, 'text-xs')}>Cancelar</button>
          <button
            onClick={handleImport}
            disabled={!text.trim()}
            className={cn(ui.btnPrimary, 'text-xs')}
          >
            <Download className="w-3.5 h-3.5" />
            Importar e Aplicar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function StructureStep({ sections, briefing, onChange, settings }: StructureStepProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showImport, setShowImport] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const dragItem = useRef<string | null>(null)
  const available = getAvailableSections()

  const enabledSections = sections
    .filter(s => s.enabled)
    .sort((a, b) => a.position - b.position)

  // ── Download do documento ───────────────────────────────────────────────────

  function handleDownload() {
    const content = generateStructureDocument({ briefing, sections } as any, settings)
    const slug = (briefing.nomeCliente || 'projeto')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `estrutura-copy-${slug}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // ── Import do output da IA ──────────────────────────────────────────────────

  function handleImport(text: string) {
    const parsed = parseStructureOutput(text)
    const updated = applyParsedStructure(sections, parsed)
    onChange(updated)
    setShowImport(false)
    setImportSuccess(true)
    setTimeout(() => setImportSuccess(false), 4000)
  }

  // ── Toggle e edição ─────────────────────────────────────────────────────────

  function toggleSection(type: string) {
    const template = available.find(t => t.type === type)
    if (!template || template.required) return
    onChange(sections.map(s => s.type === type ? { ...s, enabled: !s.enabled } : s))
  }

  function moveSection(id: string, dir: 'up' | 'down') {
    const sorted = [...enabledSections]
    const idx = sorted.findIndex(s => s.id === id)
    if (dir === 'up' && idx === 0) return
    if (dir === 'down' && idx === sorted.length - 1) return
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    const a = sorted[idx]
    const b = sorted[swapIdx]
    sorted[swapIdx] = { ...a, position: b.position }
    sorted[idx] = { ...b, position: a.position }
    onChange(sections.map(s => {
      const found = sorted.find(ss => ss.id === s.id)
      return found ? found : s
    }))
  }

  function updateCopy(sectionId: string, field: string, value: string) {
    onChange(sections.map(s =>
      s.id === sectionId ? { ...s, copy: { ...s.copy, [field]: value } } : s
    ))
  }

  function prefill(section: PageSection) {
    const updated = prefillCopyFromBriefing(section, briefing)
    onChange(sections.map(s => s.id === section.id ? updated : s))
  }

  // ── Drag and drop ───────────────────────────────────────────────────────────

  function handleDragStart(id: string) {
    dragItem.current = id
  }

  function handleDragOver(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    setDragOverId(targetId)
  }

  function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    setDragOverId(null)
    if (!dragItem.current || dragItem.current === targetId) return

    const fromIdx = enabledSections.findIndex(s => s.id === dragItem.current)
    const toIdx = enabledSections.findIndex(s => s.id === targetId)
    if (fromIdx === -1 || toIdx === -1) return

    const reordered = [...enabledSections]
    const [moved] = reordered.splice(fromIdx, 1)
    reordered.splice(toIdx, 0, moved)
    const repositioned = reordered.map((s, i) => ({ ...s, position: i }))

    onChange(sections.map(s => {
      const found = repositioned.find(rs => rs.id === s.id)
      return found ? found : s
    }))
    dragItem.current = null
  }

  // ── Verifica se há copy preenchida pela IA ──────────────────────────────────
  function hasCopyFilled(section: PageSection): boolean {
    return Object.values(section.copy).some(v => v && v.trim().length > 0)
  }

  return (
    <>
      {showImport && (
        <ImportModal
          onImport={handleImport}
          onClose={() => setShowImport(false)}
        />
      )}

      <div className="flex flex-col gap-4 h-full">
        {/* Barra de ações */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-ink-secondary leading-relaxed">
              Baixe o documento para o Claude Chat criar a copy e estrutura. Cole o output de volta para preencher automaticamente.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleDownload}
              className={cn(ui.btnOutline, 'text-xs gap-1.5')}
            >
              <Download className="w-3.5 h-3.5" />
              Baixar para IA
            </button>
            <button
              onClick={() => setShowImport(true)}
              className={cn(ui.btnPrimary, 'text-xs gap-1.5')}
            >
              <Upload className="w-3.5 h-3.5" />
              Importar Output
            </button>
          </div>
        </div>

        <PromptBlock
          label="Comando para o Claude Chat"
          prompt={`Estou te enviando o documento de briefing de uma landing page. Leia o documento inteiro e siga as instruções na ordem:\n\n1. Execute o PASSO A (Análise de Intenção) — mapeie as 3 dores do público\n2. Execute o PASSO B (SEO) — crie title, meta description e keywords\n3. Execute o PASSO C (Estrutura e Copy) — crie a copy completa de cada seção\n\nRetorne TUDO no formato especificado no documento, entre os delimitadores ===INICIO-OUTPUT=== e ===FIM-OUTPUT===. Não invente depoimentos, avaliações ou dados que não estejam no briefing.`}
          hint="Copie este comando, cole no Claude Chat e envie junto com o documento baixado."
        />

        {importSuccess && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-ok/10 border border-ok/20">
            <Check className="w-4 h-4 text-ok flex-shrink-0" />
            <p className="text-xs text-ok">Output importado com sucesso. Seções e copy foram atualizadas.</p>
          </div>
        )}

        <div className="grid grid-cols-[1fr_380px] gap-5 flex-1 min-h-0">
          {/* Coluna esquerda: seções disponíveis */}
          <div className="flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-4">
              <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-widest">
                Seções Disponíveis
              </p>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>
            <div className="space-y-2 overflow-y-auto pr-1">
              {available.map(template => {
                const section = sections.find(s => s.type === template.type)
                const isEnabled = section?.enabled ?? false
                const conditionMet = template.condition ? template.condition(briefing) : true
                const hasCopy = section ? hasCopyFilled(section) : false

                return (
                  <div
                    key={template.type}
                    onClick={() => !template.required && toggleSection(template.type)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all',
                      'border-white/[0.06] bg-surface/60',
                      !template.required && 'cursor-pointer hover:border-white/[0.12] hover:bg-raised/60',
                      isEnabled && !template.required && 'border-accent/30 bg-accent/[0.04]',
                      !conditionMet && !template.required && 'opacity-40',
                    )}
                  >
                    <span className="flex-shrink-0 w-7 flex items-center justify-center text-ink-secondary">
                      {SECTION_ICONS[template.icon] ?? SECTION_ICONS['cta']}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm font-medium leading-tight',
                        isEnabled ? 'text-ink-primary' : 'text-ink-secondary',
                      )}>
                        {template.label}
                      </p>
                      {template.required && (
                        <span className="text-[10px] text-ink-muted">obrigatória</span>
                      )}
                      {template.hint && !conditionMet && !template.required && (
                        <p className="text-[10px] text-ink-muted mt-0.5 leading-tight">{template.hint}</p>
                      )}
                    </div>
                    {hasCopy && isEnabled && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-ok/15 text-ok font-medium flex-shrink-0">copy</span>
                    )}
                    {/* Toggle */}
                    <div
                      className={cn(
                        'relative w-9 h-[18px] rounded-full transition-colors flex-shrink-0',
                        isEnabled ? 'bg-accent' : 'bg-white/10',
                        template.required && 'opacity-50',
                      )}
                    >
                      <span className={cn(
                        'absolute top-[2px] w-[14px] h-[14px] bg-white rounded-full shadow transition-transform',
                        isEnabled ? 'translate-x-[18px]' : 'translate-x-[2px]',
                      )} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Coluna direita: estrutura da página */}
          <div className="flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-4">
              <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-widest">
                Estrutura da Página
              </p>
              {enabledSections.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-accent/15 text-accent text-[10px] font-bold">
                  {enabledSections.length}
                </span>
              )}
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            {enabledSections.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-ink-muted gap-2">
                <ClipboardList className="w-8 h-8 opacity-20" />
                <p className="text-xs">Ative seções à esquerda</p>
              </div>
            ) : (
              <div className="space-y-1.5 overflow-y-auto pr-1">
                {enabledSections.map((section, idx) => {
                  const isExpanded = expandedId === section.id
                  const copyEntries = Object.entries(section.copy)
                  const hasCopy = hasCopyFilled(section)
                  const isDragOver = dragOverId === section.id

                  return (
                    <div
                      key={section.id}
                      draggable
                      onDragStart={() => handleDragStart(section.id)}
                      onDragOver={e => handleDragOver(e, section.id)}
                      onDragLeave={() => setDragOverId(null)}
                      onDrop={e => handleDrop(e, section.id)}
                      className={cn(
                        'rounded-xl border overflow-hidden transition-all',
                        isExpanded
                          ? 'border-accent/30 bg-accent/[0.03]'
                          : 'border-white/[0.06] bg-surface/60',
                        isDragOver && 'border-accent/50 bg-accent/[0.06]',
                      )}
                    >
                      <div className="flex items-center gap-2.5 px-3 py-2.5">
                        {/* Drag handle */}
                        <GripVertical className="w-3 h-3 text-ink-muted opacity-40 cursor-grab flex-shrink-0" />
                        <span className="w-5 h-5 rounded-full bg-accent/20 text-accent text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-medium text-ink-primary flex-1 truncate">
                          {section.label}
                        </span>
                        {hasCopy && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-ok/15 text-ok font-medium flex-shrink-0">copy</span>
                        )}
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <button
                            onClick={() => moveSection(section.id, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded text-ink-muted hover:text-ink-primary disabled:opacity-20 transition-colors"
                          >
                            <ChevronUp width={12} height={12} />
                          </button>
                          <button
                            onClick={() => moveSection(section.id, 'down')}
                            disabled={idx === enabledSections.length - 1}
                            className="p-1 rounded text-ink-muted hover:text-ink-primary disabled:opacity-20 transition-colors"
                          >
                            <ChevronDown width={12} height={12} />
                          </button>
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : section.id)}
                            className={cn(
                              'p-1 rounded transition-colors',
                              isExpanded ? 'text-accent' : 'text-ink-muted hover:text-ink-primary',
                            )}
                          >
                            {isExpanded ? <ChevronUp width={12} height={12} /> : <ChevronDown width={12} height={12} />}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-white/[0.06] px-3 py-3 space-y-2.5">
                          <button
                            onClick={() => prefill(section)}
                            className={cn(ui.btnGhost, 'text-[11px] w-full py-1.5 gap-1.5')}
                          >
                            <Star className="w-3 h-3" />
                            Preencher com briefing
                          </button>
                          {copyEntries.map(([field, value]) => (
                            <div key={field}>
                              <label className="block text-[10px] text-ink-muted mb-1 uppercase tracking-widest">
                                {field}
                              </label>
                              {value && value.length > 80 ? (
                                <textarea
                                  value={value}
                                  onChange={e => updateCopy(section.id, field, e.target.value)}
                                  rows={3}
                                  className={cn(ui.inputBase, 'text-xs py-1.5 resize-none')}
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={value}
                                  onChange={e => updateCopy(section.id, field, e.target.value)}
                                  className={cn(ui.inputBase, 'text-xs py-1.5')}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
