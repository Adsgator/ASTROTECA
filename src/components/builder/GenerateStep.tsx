// src/components/builder/GenerateStep.tsx

import type { BuilderState, AppSettingsV2, CreateProjectResult, OutputPath } from '../../types'
import type { ComponentMeta } from '../../types'
import { generateDocument } from '../../lib/export-document'
import * as ui from '../../styles/ui'
import { cn } from '../../lib/utils'

interface GenerateStepProps {
  state: BuilderState
  settings: AppSettingsV2
  availableComponents: ComponentMeta[]
  onCreateProject: () => Promise<void>
  creating: boolean
  result: CreateProjectResult | null
  error: string
  onOutputPathChange: (path: OutputPath) => void
}

export default function GenerateStep({
  state,
  settings,
  availableComponents,
  onCreateProject,
  creating,
  result,
  error,
  onOutputPathChange,
}: GenerateStepProps) {
  const enabledSections = state.sections.filter(s => s.enabled)

  const checks = [
    {
      ok: !!state.briefing.nomeCliente,
      label: 'Nome do cliente preenchido',
      step: 'briefing' as const,
    },
    {
      ok: enabledSections.length > 0,
      label: 'Ao menos 1 seção habilitada',
      step: 'estrutura' as const,
    },
    {
      ok: !!state.art.colorPrimary,
      label: 'Cor primária definida',
      step: 'arte' as const,
    },
    {
      ok: !!settings.githubToken && !!settings.githubOwner,
      label: 'GitHub configurado (para criar repositório)',
      step: null,
      onlyPath: 'library' as OutputPath,
    },
  ]

  const visibleChecks = checks.filter(c => !c.onlyPath || c.onlyPath === state.outputPath)
  const canGenerate = visibleChecks.every(c => c.ok)

  function downloadDoc() {
    const content = generateDocument(state, settings)
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `manifesto-${state.briefing.nomeCliente || 'projeto'}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  function copyDoc() {
    const content = generateDocument(state, settings)
    navigator.clipboard.writeText(content)
  }

  const art = state.art

  return (
    <div className="space-y-5">
      {/* Resumo */}
      <div className="grid grid-cols-4 gap-3">
        <div className={ui.cardBase + ' p-3'}>
          <p className="text-[10px] text-ink-muted uppercase tracking-wider">Cliente</p>
          <p className="text-sm font-semibold text-ink-primary mt-1">
            {state.briefing.nomeCliente || '—'}
          </p>
          <p className="text-[11px] text-ink-secondary">{state.briefing.segmento || '—'}</p>
        </div>
        <div className={ui.cardBase + ' p-3'}>
          <p className="text-[10px] text-ink-muted uppercase tracking-wider">Estrutura</p>
          <p className="text-sm font-semibold text-ink-primary mt-1">{enabledSections.length}</p>
          <p className="text-[11px] text-ink-secondary">seções habilitadas</p>
        </div>
        <div className={ui.cardBase + ' p-3'}>
          <p className="text-[10px] text-ink-muted uppercase tracking-wider">Arte</p>
          <div className="flex gap-1 mt-1.5">
            {[art.colorPrimary, art.colorSecondary, art.colorBackground, art.colorText].map((c, i) => (
              <div key={i} className="w-4 h-4 rounded-full border border-white/10" style={{ background: c }} />
            ))}
          </div>
          <p className="text-[11px] text-ink-secondary mt-1">{art.defaultTheme === 'dark' ? '🌙 Escuro' : '☀️ Claro'}</p>
        </div>
        <div className={ui.cardBase + ' p-3'}>
          <p className="text-[10px] text-ink-muted uppercase tracking-wider">Componentes</p>
          <p className="text-sm font-semibold text-ink-primary mt-1">{state.selected.length}</p>
          <p className="text-[11px] text-ink-secondary">selecionados</p>
        </div>
      </div>

      {/* Checklist */}
      <div className={ui.cardBase + ' p-4'}>
        <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-3">Checklist</p>
        <div className="space-y-2">
          {visibleChecks.map((check, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span className={cn('text-sm', check.ok ? 'text-ok' : 'text-fail')}>
                {check.ok ? '✓' : '✗'}
              </span>
              <span className={cn('text-xs', check.ok ? 'text-ink-primary' : 'text-ink-secondary')}>
                {check.label}
              </span>
              {!check.ok && !check.step && (
                <a href="/config" className="text-[11px] text-accent hover:underline ml-auto">
                  Configurar →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Seletor de saída */}
      <div className="grid grid-cols-3 gap-2">
        {([
          { path: 'library', icon: '🐙', label: 'Criar no GitHub', desc: 'Repositório com template + manifesto' },
          { path: 'manual', icon: '📄', label: 'Baixar Documento', desc: 'Arquivo .md para usar com Claude' },
          { path: 'hybrid', icon: '📋', label: 'Copiar para Claude', desc: 'Copiar texto para colar no Claude.ai' },
        ] as { path: OutputPath; icon: string; label: string; desc: string }[]).map(opt => (
          <button
            key={opt.path}
            onClick={() => onOutputPathChange(opt.path)}
            className={cn(
              ui.cardBase,
              'p-3 text-left transition-all hover:border-white/10',
              state.outputPath === opt.path && 'border-accent bg-accent/5',
            )}
          >
            <span className="text-xl">{opt.icon}</span>
            <p className="text-xs font-semibold text-ink-primary mt-2">{opt.label}</p>
            <p className="text-[10px] text-ink-muted mt-0.5">{opt.desc}</p>
          </button>
        ))}
      </div>

      {/* Botão principal */}
      <div className="flex gap-2">
        {state.outputPath === 'library' && (
          <button
            onClick={onCreateProject}
            disabled={creating || !canGenerate}
            className={cn(ui.btnPrimary, 'flex-1 py-3 text-sm')}
          >
            {creating ? '⏳ Criando repositório...' : '🚀 Criar Projeto no GitHub'}
          </button>
        )}
        {state.outputPath === 'manual' && (
          <button onClick={downloadDoc} className={cn(ui.btnPrimary, 'flex-1 py-3 text-sm')}>
            📥 Baixar Documento .md
          </button>
        )}
        {state.outputPath === 'hybrid' && (
          <button onClick={copyDoc} className={cn(ui.btnPrimary, 'flex-1 py-3 text-sm')}>
            📋 Copiar Documento
          </button>
        )}
        <button onClick={downloadDoc} className={cn(ui.btnOutline, 'py-3 text-sm')} title="Baixar documento">
          ↓
        </button>
      </div>

      {/* Loading */}
      {creating && (
        <div className={cn(ui.cardBase, 'p-6 text-center')}>
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-ink-primary">Criando repositório no GitHub...</p>
          <p className="text-xs text-ink-secondary mt-1">Copiando template, componentes e MANIFESTO.md</p>
        </div>
      )}

      {/* Resultado */}
      {result && result.success && (
        <div className={cn(ui.cardBase, 'p-4 border-ok/30 bg-ok/5')}>
          <p className="text-sm font-semibold text-ok mb-2">✓ Projeto criado com sucesso!</p>
          <p className="text-xs text-ink-secondary mb-3 break-all">{result.repoUrl}</p>
          <div className="flex gap-2 flex-wrap">
            <a href={result.repoUrl} target="_blank" rel="noopener" className={cn(ui.btnOutline, 'text-xs')}>
              ↗ Ver no GitHub
            </a>
            {result.vscodeUrl && (
              <a href={result.vscodeUrl} className={cn(ui.btnGhost, 'text-xs')}>
                Abrir no VS Code
              </a>
            )}
          </div>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="rounded-xl border border-fail/30 bg-fail/5 px-4 py-3">
          <p className="text-xs text-fail">{error}</p>
        </div>
      )}
    </div>
  )
}
