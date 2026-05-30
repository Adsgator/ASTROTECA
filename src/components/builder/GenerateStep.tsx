// src/components/builder/GenerateStep.tsx

import { useState } from 'react'
import type { BuilderState, AppSettingsV2, CreateProjectResult, OutputPath } from '../../types'
import type { ComponentMeta } from '../../types'
import { generateDocument } from '../../lib/export-document'
import * as ui from '../../styles/ui'
import { cn } from '../../lib/utils'
import PromptBlock from './PromptBlock'

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

const OUTPUT_PATHS = [
  {
    path: 'library' as OutputPath,
    icon: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22',
    label: 'Path A — Biblioteca + GitHub',
    desc: 'Cria repositório com componentes da biblioteca + MANIFESTO.md',
    badge: 'Recomendado',
    badgeColor: 'bg-accent/20 text-accent',
    needs: 'GitHub configurado',
  },
  {
    path: 'manual' as OutputPath,
    icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zm4 18H6V4h7v5h5zM9 13h6m-6 4h4',
    label: 'Path B — Documento + GitHub',
    desc: 'Cria repositório base + MANIFESTO.md (Claude Chat adapta tudo)',
    badge: 'Sem biblioteca',
    badgeColor: 'bg-raised text-ink-muted',
    needs: 'GitHub configurado',
  },
  {
    path: 'hybrid' as OutputPath,
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    label: 'Híbrido — Documento local',
    desc: 'Baixa o documento .md sem criar repositório',
    badge: 'Offline',
    badgeColor: 'bg-raised text-ink-muted',
    needs: null,
  },
]

// Etapas de progresso para feedback ao criar
const CREATE_STEPS = [
  'Criando repositório no GitHub...',
  'Aguardando inicialização do repositório...',
  'Copiando componentes da biblioteca...',
  'Commitando MANIFESTO.md...',
  'Finalizando...',
]

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
  const [createStep, setCreateStep] = useState(0)
  const [copied, setCopied] = useState(false)
  const [docCopied, setDocCopied] = useState(false)

  const enabledSections = state.sections.filter(s => s.enabled)
  const art = state.art

  const checks = [
    {
      ok: !!state.briefing.nomeCliente,
      label: 'Nome do cliente preenchido',
      configLink: null,
    },
    {
      ok: enabledSections.length > 0,
      label: 'Ao menos 1 seção habilitada',
      configLink: null,
    },
    {
      ok: !!state.art.colorPrimary,
      label: 'Cor primária definida',
      configLink: null,
    },
    {
      ok: !!settings.githubToken && !!settings.githubOwner,
      label: 'GitHub configurado',
      configLink: '/config',
      onlyPath: ['library', 'manual'] as OutputPath[],
    },
  ]

  const visibleChecks = checks.filter(c => !c.onlyPath || c.onlyPath.includes(state.outputPath))
  const canGenerate = visibleChecks.every(c => c.ok)

  // Simula progresso visual durante criação
  async function handleCreate() {
    setCreateStep(0)
    const interval = setInterval(() => {
      setCreateStep(prev => {
        if (prev >= CREATE_STEPS.length - 2) { clearInterval(interval); return prev }
        return prev + 1
      })
    }, 1800)
    await onCreateProject()
    clearInterval(interval)
    setCreateStep(CREATE_STEPS.length - 1)
  }

  function downloadDoc() {
    const content = generateDocument(state, settings)
    const slug = (state.briefing.nomeCliente || 'projeto')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `manifesto-${slug}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  function copyDoc() {
    const content = generateDocument(state, settings)
    navigator.clipboard.writeText(content).then(() => {
      setDocCopied(true)
      setTimeout(() => setDocCopied(false), 2500)
    })
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="space-y-5">
      {/* Resumo do projeto */}
      <div className="grid grid-cols-4 gap-3">
        <div className={cn(ui.cardBase, 'p-3')}>
          <p className="text-[10px] text-ink-muted uppercase tracking-wider">Cliente</p>
          <p className="text-sm font-semibold text-ink-primary mt-1 truncate">
            {state.briefing.nomeCliente || '—'}
          </p>
          <p className="text-[11px] text-ink-secondary truncate">{state.briefing.segmento || '—'}</p>
        </div>
        <div className={cn(ui.cardBase, 'p-3')}>
          <p className="text-[10px] text-ink-muted uppercase tracking-wider">Seções</p>
          <p className="text-sm font-semibold text-ink-primary mt-1">{enabledSections.length}</p>
          <p className="text-[11px] text-ink-secondary">
            {enabledSections.filter(s => Object.values(s.copy).some(v => v)).length} com copy
          </p>
        </div>
        <div className={cn(ui.cardBase, 'p-3')}>
          <p className="text-[10px] text-ink-muted uppercase tracking-wider">Arte</p>
          <div className="flex gap-1 mt-1.5">
            {[art.colorPrimary, art.colorSecondary, art.colorBackground, art.colorText].map((c, i) => (
              <div key={i} className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ background: c }} />
            ))}
          </div>
          <p className="text-[11px] text-ink-secondary mt-1">
            {art.fontHeading ? art.fontHeading.split(' ')[0] : '—'} / {art.defaultTheme === 'dark' ? 'Dark' : 'Light'}
          </p>
        </div>
        <div className={cn(ui.cardBase, 'p-3')}>
          <p className="text-[10px] text-ink-muted uppercase tracking-wider">Componentes</p>
          <p className="text-sm font-semibold text-ink-primary mt-1">{state.selected.length}</p>
          <p className="text-[11px] text-ink-secondary">da biblioteca</p>
        </div>
      </div>

      {/* Seletor de path */}
      <div>
        <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-3">Tipo de Saída</p>
        <div className="grid grid-cols-3 gap-3">
          {OUTPUT_PATHS.map(opt => (
            <button
              key={opt.path}
              onClick={() => onOutputPathChange(opt.path)}
              className={cn(
                ui.cardBase,
                'p-4 text-left transition-all hover:border-white/10 flex flex-col gap-2',
                state.outputPath === opt.path && 'border-accent bg-accent/5',
              )}
            >
              <div className="flex items-start justify-between gap-1">
                <svg className="w-5 h-5 text-ink-secondary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={opt.icon} />
                </svg>
                <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-md', opt.badgeColor)}>
                  {opt.badge}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-ink-primary">{opt.label}</p>
                <p className="text-[11px] text-ink-muted mt-0.5 leading-relaxed">{opt.desc}</p>
              </div>
              {opt.needs && (
                <p className="text-[10px] text-ink-muted flex items-center gap-1">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Requer: {opt.needs}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Checklist de validação */}
      <div className={cn(ui.cardBase, 'p-4')}>
        <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-3">Checklist</p>
        <div className="space-y-2">
          {visibleChecks.map((check, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <svg className={cn('w-4 h-4 flex-shrink-0', check.ok ? 'text-ok' : 'text-fail')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                {check.ok ? (
                  <polyline points="20 6 9 17 4 12" />
                ) : (
                  <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                )}
              </svg>
              <span className={cn('text-xs flex-1', check.ok ? 'text-ink-primary' : 'text-ink-secondary')}>
                {check.label}
              </span>
              {!check.ok && check.configLink && (
                <a href={check.configLink} className="text-[11px] text-accent hover:underline flex-shrink-0">
                  Configurar →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Comando para o Claude */}
      {state.outputPath === 'library' && (
        <PromptBlock
          label="Comando para o Claude Code (IDE)"
          prompt={`Estou te enviando o MANIFESTO.md deste projeto. Siga o documento passo a passo:\n\n1. Atualize tailwind.config.js com as cores da seção "Direção de Arte"\n2. Atualize src/styles/global.css com as fontes indicadas\n3. Atualize src/layouts/Layout.astro com SEO (title, meta description, keywords), GTM e Schema.org\n4. Para cada seção habilitada, substitua os textos placeholder pela copy do documento\n5. Configure o tema padrão: ${state.art.defaultTheme === 'dark' ? 'escuro (classe "dark" no <html>)' : 'claro'}\n6. Não altere estrutura HTML, classes Tailwind ou lógica JavaScript — apenas dados e configurações do cliente\n7. Rode npm run build ao final para validar`}
          hint="Copie este comando e cole no Claude Code junto com o MANIFESTO.md. Os componentes da biblioteca já estão no repositório."
        />
      )}
      {state.outputPath === 'manual' && (
        <PromptBlock
          label="Comando para o Claude Chat ou Claude Code"
          prompt={`Estou te enviando o MANIFESTO.md de um projeto de landing page Astro. O repositório contém apenas o template base (sem componentes prontos).\n\nSiga o documento para construir o site completo:\n\n1. Atualize tailwind.config.js com as cores da "Direção de Arte"\n2. Atualize global.css com as fontes\n3. Atualize Layout.astro com SEO, GTM e Schema.org\n4. Crie cada seção habilitada como componente Astro em src/components/, usando a copy do documento\n5. Use os tokens Tailwind do design system (bg-primary, text-text-main, font-serif, etc.) — nunca valores literais\n6. Configure tema padrão: ${state.art.defaultTheme === 'dark' ? 'escuro' : 'claro'}\n7. Garanta responsividade mobile (375px) e tablet (768px)\n8. Rode npm run build ao final`}
          hint="Copie este comando e cole no Claude junto com o MANIFESTO.md. O Claude vai criar os componentes do zero seguindo o briefing."
        />
      )}
      {state.outputPath === 'hybrid' && (
        <PromptBlock
          label="Comando para o Claude Chat ou Claude Code"
          prompt={`Estou te enviando o MANIFESTO.md de um projeto de landing page. Siga o documento para adaptar um projeto Astro:\n\n1. Atualize tailwind.config.js com as cores da "Direção de Arte"\n2. Atualize global.css com as fontes indicadas\n3. Atualize Layout.astro com SEO (title, meta description, keywords), GTM e Schema.org\n4. Crie ou adapte cada seção habilitada usando a copy do documento\n5. Use tokens Tailwind do design system — nunca valores literais de cor ou fonte\n6. Configure tema padrão: ${state.art.defaultTheme === 'dark' ? 'escuro (classe "dark" no <html>)' : 'claro'}\n7. Teste responsividade e rode npm run build`}
          hint="Copie este comando, cole no Claude e envie junto com o arquivo MANIFESTO.md baixado."
        />
      )}

      {/* Botões de ação */}
      <div className="flex gap-2">
        {state.outputPath === 'library' && (
          <button
            onClick={handleCreate}
            disabled={creating || !canGenerate}
            className={cn(ui.btnPrimary, 'flex-1 py-3 text-sm')}
          >
            <span className="flex items-center justify-center gap-2">
              {creating ? (
                <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2"/><path d="M12 2a10 10 0 019.8 7.8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>Criando...</>
              ) : (
                <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>Criar Projeto no GitHub</>
              )}
            </span>
          </button>
        )}
        {state.outputPath === 'manual' && (
          <button
            onClick={handleCreate}
            disabled={creating || !canGenerate}
            className={cn(ui.btnPrimary, 'flex-1 py-3 text-sm')}
          >
            <span className="flex items-center justify-center gap-2">
              {creating ? (
                <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2"/><path d="M12 2a10 10 0 019.8 7.8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>Criando...</>
              ) : (
                <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>Criar no GitHub (só manifesto)</>
              )}
            </span>
          </button>
        )}
        {state.outputPath === 'hybrid' && (
          <button
            onClick={downloadDoc}
            className={cn(ui.btnPrimary, 'flex-1 py-3 text-sm')}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Baixar MANIFESTO.md
            </span>
          </button>
        )}

        {/* Ações secundárias */}
        <button
          onClick={downloadDoc}
          className={cn(ui.btnOutline, 'py-3 px-3')}
          title="Baixar documento .md"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
        <button
          onClick={copyDoc}
          className={cn(ui.btnOutline, 'py-3 px-3', docCopied && 'text-ok border-ok/30')}
          title="Copiar documento"
        >
          {docCopied ? (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          )}
        </button>
      </div>

      {/* Progresso de criação */}
      {creating && (
        <div className={cn(ui.cardBase, 'p-5')}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <p className="text-sm font-medium text-ink-primary">{CREATE_STEPS[createStep]}</p>
          </div>
          {/* Barra de progresso */}
          <div className="h-1.5 bg-raised rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-700"
              style={{ width: `${((createStep + 1) / CREATE_STEPS.length) * 100}%` }}
            />
          </div>
          <div className="mt-3 space-y-1.5">
            {CREATE_STEPS.map((step, i) => (
              <div key={i} className={cn('flex items-center gap-2 text-xs transition-colors', i <= createStep ? 'text-ink-primary' : 'text-ink-muted')}>
                <svg className={cn('w-3.5 h-3.5 flex-shrink-0', i < createStep ? 'text-ok' : i === createStep ? 'text-accent' : 'text-ink-muted')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  {i < createStep ? (
                    <polyline points="20 6 9 17 4 12" />
                  ) : i === createStep ? (
                    <circle cx="12" cy="12" r="9" />
                  ) : (
                    <circle cx="12" cy="12" r="9" strokeOpacity="0.3" />
                  )}
                </svg>
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resultado de sucesso */}
      {result && result.success && (
        <div className={cn(ui.cardBase, 'p-5 border-ok/30 bg-ok/5')}>
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            <p className="text-sm font-semibold text-ok">Projeto criado com sucesso!</p>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 bg-raised/50 rounded-lg px-3 py-2">
              <span className="text-[11px] text-ink-muted flex-shrink-0">URL</span>
              <span className="text-xs text-ink-secondary flex-1 truncate font-mono">{result.repoUrl}</span>
              <button
                onClick={() => copyUrl(result.repoUrl)}
                className={cn('p-1 rounded text-ink-muted hover:text-ink-primary transition-colors flex-shrink-0', copied && 'text-ok')}
              >
                {copied ? (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <a
              href={result.repoUrl}
              target="_blank"
              rel="noopener"
              className={cn(ui.btnOutline, 'text-xs flex items-center gap-1.5')}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Ver no GitHub
            </a>
            {result.vscodeUrl && (
              <a href={result.vscodeUrl} className={cn(ui.btnGhost, 'text-xs flex items-center gap-1.5')}>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                Abrir no VS Code
              </a>
            )}
          </div>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="rounded-xl border border-fail/30 bg-fail/5 px-4 py-3 flex items-start gap-2">
          <svg className="w-4 h-4 text-fail flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <p className="text-xs text-fail">{error}</p>
        </div>
      )}
    </div>
  )
}
