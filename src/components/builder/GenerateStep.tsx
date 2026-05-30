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
          <p className="text-[11px] text-ink-secondary mt-1 flex items-center gap-1">
            {art.defaultTheme === 'dark' ? (
              <><svg className="w-3 h-3 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>Escuro</>
            ) : (
              <><svg className="w-3 h-3 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>Claro</>
            )}
          </p>
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
              <svg className={cn('w-4 h-4 flex-shrink-0', check.ok ? 'text-ok' : 'text-fail')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                {check.ok ? <polyline points="20 6 9 17 4 12" /> : <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>}
              </svg>
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
          {
            path: 'library' as OutputPath,
            iconPath: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22',
            label: 'Criar no GitHub', desc: 'Repositório com template + manifesto',
          },
          {
            path: 'manual' as OutputPath,
            iconPath: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zm4 18H6V4h7v5h5zM9 13h6m-6 4h4',
            label: 'Baixar Documento', desc: 'Arquivo .md para usar com Claude',
          },
          {
            path: 'hybrid' as OutputPath,
            iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
            label: 'Copiar para Claude', desc: 'Copiar texto para colar no Claude.ai',
          },
        ]).map(opt => (
          <button
            key={opt.path}
            onClick={() => onOutputPathChange(opt.path)}
            className={cn(
              ui.cardBase,
              'p-3 text-left transition-all hover:border-white/10',
              state.outputPath === opt.path && 'border-accent bg-accent/5',
            )}
          >
            <svg className="w-5 h-5 text-ink-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d={opt.iconPath} />
            </svg>
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
            <span className="flex items-center justify-center gap-2">
              {creating ? (
                <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2"/><path d="M12 2a10 10 0 019.8 7.8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>Criando repositório...</>
              ) : (
                <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>Criar Projeto no GitHub</>
              )}
            </span>
          </button>
        )}
        {state.outputPath === 'manual' && (
          <button onClick={downloadDoc} className={cn(ui.btnPrimary, 'flex-1 py-3 text-sm')}>
            <span className="flex items-center justify-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Baixar Documento .md</span>
          </button>
        )}
        {state.outputPath === 'hybrid' && (
          <button onClick={copyDoc} className={cn(ui.btnPrimary, 'flex-1 py-3 text-sm')}>
            <span className="flex items-center justify-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copiar Documento</span>
          </button>
        )}
        <button onClick={downloadDoc} className={cn(ui.btnOutline, 'py-3 px-3 text-sm')} title="Baixar documento">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
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
          <p className="text-sm font-semibold text-ok mb-2 flex items-center gap-1.5"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>Projeto criado com sucesso!</p>
          <p className="text-xs text-ink-secondary mb-3 break-all">{result.repoUrl}</p>
          <div className="flex gap-2 flex-wrap">
            <a href={result.repoUrl} target="_blank" rel="noopener" className={cn(ui.btnOutline, 'text-xs flex items-center gap-1.5')}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>Ver no GitHub
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
