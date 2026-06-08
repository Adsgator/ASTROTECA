// src/components/builder/GenerateStep.tsx

import { useState } from 'react'
import type { BuilderState, AppSettingsV2, CreateProjectResult, OutputPath } from '../../types'
import type { ComponentMeta } from '../../types'
import { generateDocument } from '../../lib/export-document'
import * as ui from '../../styles/ui'
import { cn } from '../../lib/utils'
import PromptBlock from './PromptBlock'
import {
  Check, X, Copy, Download, ExternalLink, Code2, GitBranch, FileText,
  Info, Loader2, Zap, XCircle,
} from 'lucide-react'

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
  {
    path: 'create' as OutputPath,
    icon: 'M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5zM15 5l3 3',
    label: 'Path C — Biblioteca + Criar componentes',
    desc: 'Cria repo, copia da biblioteca e gera instruções para o Claude Code criar as seções restantes com COMPONENT-BLUEPRINT.md',
    badge: 'Claude Code',
    badgeColor: 'bg-accent/20 text-accent',
    needs: 'GitHub configurado',
  },
]

// Etapas falsas removidas — apenas spinner genérico durante criação

export default function GenerateStep({
  state,
  settings,
  availableComponents: _availableComponents,
  onCreateProject,
  creating,
  result,
  error,
  onOutputPathChange,
}: GenerateStepProps) {
  const [copied, setCopied] = useState(false)
  const [docCopied, setDocCopied] = useState(false)
  const [manifestOpen, setManifestOpen] = useState(false)
  const [manifestCopied, setManifestCopied] = useState(false)
  const [fetchingManifest, setFetchingManifest] = useState(false)

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
      onlyPath: ['library', 'manual', 'create'] as OutputPath[],
    },
  ]

  const visibleChecks = checks.filter(c => !c.onlyPath || c.onlyPath.includes(state.outputPath))
  const canGenerate = visibleChecks.every(c => c.ok)

  async function handleCreate() {
    await onCreateProject()
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

  async function copyManifestFromGitHub(repoUrl: string) {
    setFetchingManifest(true)
    try {
      // repoUrl: https://github.com/owner/repo
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
      if (!match) throw new Error('URL inválida')
      const [, owner, repo] = match
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/MANIFESTO.md`
      const headers: Record<string, string> = { Accept: 'application/vnd.github.v3.raw' }
      if (settings.githubToken) headers['Authorization'] = `token ${settings.githubToken}`
      const res = await fetch(apiUrl, { headers })
      if (!res.ok) throw new Error(`GitHub retornou ${res.status}`)
      const text = await res.text()
      await navigator.clipboard.writeText(text)
      setManifestCopied(true)
      setTimeout(() => setManifestCopied(false), 3000)
    } catch (e) {
      // fallback: copia o gerado localmente
      copyDoc()
    } finally {
      setFetchingManifest(false)
    }
  }

  const manifestContent = generateDocument(state, settings)

  return (
    <div className="space-y-5">
      {/* Modal de preview do manifesto */}
      {manifestOpen && (
        <div className="fixed inset-0 z-[500] flex items-stretch justify-end" onClick={() => setManifestOpen(false)}>
          <div
            className="w-full max-w-2xl bg-[#111] border-l border-white/10 flex flex-col shadow-2xl animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
              <div>
                <p className="text-sm font-semibold text-ink-primary">MANIFESTO.md</p>
                <p className="text-[11px] text-ink-muted mt-0.5">Revise antes de criar o projeto</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyDoc}
                  className={cn(ui.btnOutline, 'text-xs flex items-center gap-1.5', docCopied && 'text-ok border-ok/30')}
                >
                  {docCopied ? (
                    <><Check className="w-3.5 h-3.5" />Copiado!</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" />Copiar</>
                  )}
                </button>
                <button onClick={() => setManifestOpen(false)} className="p-1.5 rounded text-ink-muted hover:text-ink-primary">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <pre className="flex-1 overflow-y-auto p-5 text-[11px] text-ink-secondary font-mono leading-relaxed whitespace-pre-wrap break-words">
              {manifestContent}
            </pre>
          </div>
        </div>
      )}
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

      {/* Aviso: Componentes selecionados */}
      {state.selected.length > 0 && (
        <div className={cn(ui.cardBase, 'p-4 border-l-4', 'border-accent/50 bg-accent/5')}>
          <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">Componentes selecionados</p>
          <div className="flex flex-wrap gap-2">
            {state.selected.map(s => (
              <span key={s.meta.id} className="text-[11px] px-2 py-1 bg-accent/10 text-accent rounded">
                {s.meta.category} → {s.meta.name}
              </span>
            ))}
          </div>
        </div>
      )}

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
                  <Info className="w-3 h-3" />
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
              {check.ok
                ? <Check className="w-4 h-4 text-ok flex-shrink-0" />
                : <X className="w-4 h-4 text-fail flex-shrink-0" />
              }
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
          label="Comando para o Claude Code (cole na IDE junto com o MANIFESTO.md)"
          prompt={`Você está implementando o site do cliente a partir do MANIFESTO.md anexo. Leia o manifesto do início ao fim antes de começar.\n\nContexto do projeto:\n- Stack: Astro 5 + Tailwind v4 (CSS-first, sem tailwind.config.js)\n- Tokens em src/styles/tokens.css — NUNCA hardcode cor ou fonte, sempre var(--t-*) ou classes Tailwind\n- Componentes da biblioteca já copiados em src/components/sections/\n- Dark mode: classe .dark no <html> — tokens redefinidos em .dark{} no tokens.css\n- Tema padrão: ${state.art.defaultTheme === 'dark' ? 'dark (adicione classe "dark" no <html> do BaseLayout.astro)' : 'light'}\n\nSiga o manifesto passo a passo:\n1. Preencha src/styles/tokens.css com as cores e fontes da seção 3\n2. Atualize o <link> de fonte no BaseLayout.astro (seção 4)\n3. Monte src/pages/index.astro com os imports e ordem dos componentes (seção 8)\n4. Para cada componente, substitua o copy placeholder pelos textos da seção 8\n5. Preencha .env com PUBLIC_WA_NUMBER (só dígitos, ex: 5511999999999), PUBLIC_WA_MESSAGE, PUBLIC_GTM_ID e PUBLIC_SITE_URL (seção 6) — nunca coloque esses valores no código\n6. Preencha defaultSchema no BaseLayout.astro (seção 7)\n7. Preencha TODOs em politica-de-privacidade.astro e termos-de-uso.astro\n8. Garanta: Hero id="hero-section", Footer id="footer", main id="main-content"\n9. Rode npm run build — corrija qualquer erro`}
          hint="Os componentes já estão em src/components/sections/. Cole este prompt no Claude Code junto com o MANIFESTO.md."
        />
      )}
      {state.outputPath === 'manual' && (
        <PromptBlock
          label="Comando para o Claude Code (cole na IDE junto com o MANIFESTO.md)"
          prompt={`Você está construindo um site do zero a partir do MANIFESTO.md anexo. Leia o manifesto do início ao fim antes de começar.\n\nContexto do projeto:\n- Stack: Astro 5 + Tailwind v4 (CSS-first, sem tailwind.config.js)\n- Tokens em src/styles/tokens.css — NUNCA hardcode cor ou fonte, sempre var(--t-*) ou classes Tailwind\n- Dark mode: classe .dark no <html> — tokens redefinidos em .dark{} no tokens.css\n- Tema padrão: ${state.art.defaultTheme === 'dark' ? 'dark (adicione classe "dark" no <html> do BaseLayout.astro)' : 'light'}\n\nEstruturas obrigatórias dos componentes:\n- Cada seção: <section id="nome-secao" class="section-py"><div class="container-wide">...</div></section>\n- Tokens de layout: section-py, container-wide, container-content\n- Tipografia: font-serif (títulos), font-sans (corpo), text-display-md, text-body-lg, text-text-main, text-text-soft\n- Nunca <img> nativo — sempre <Image /> de astro:assets\n\nSiga o manifesto passo a passo:\n1. Preencha src/styles/tokens.css com as cores e fontes da seção 3\n2. Atualize o <link> de fonte no BaseLayout.astro (seção 4)\n3. Crie cada seção como componente .astro em src/components/sections/\n4. Monte src/pages/index.astro com todos os componentes\n5. Preencha .env com PUBLIC_WA_NUMBER (só dígitos, ex: 5511999999999), PUBLIC_WA_MESSAGE, PUBLIC_GTM_ID e PUBLIC_SITE_URL (seção 6) — nunca coloque esses valores no código\n6. Preencha defaultSchema no BaseLayout.astro (seção 7)\n7. Preencha TODOs em politica-de-privacidade.astro e termos-de-uso.astro\n8. Garanta: Hero id="hero-section", Footer id="footer", main id="main-content"\n9. Rode npm run build — corrija qualquer erro`}
          hint="O repositório tem apenas o template base. Cole este prompt no Claude Code junto com o MANIFESTO.md para que o Claude crie todos os componentes."
        />
      )}
      {state.outputPath === 'hybrid' && (
        <PromptBlock
          label="Comando para o Claude Code (cole junto com o MANIFESTO.md baixado)"
          prompt={`Você está adaptando um projeto Astro a partir do MANIFESTO.md anexo. Leia do início ao fim antes de começar.\n\nContexto:\n- Stack: Astro 5 + Tailwind v4 (CSS-first, sem tailwind.config.js)\n- Tokens em src/styles/tokens.css — NUNCA hardcode cor ou fonte, sempre var(--t-*) ou classes Tailwind\n- Dark mode: classe .dark no <html>, tokens redefinidos em .dark{} no tokens.css\n- Tema padrão: ${state.art.defaultTheme === 'dark' ? 'dark (adicione classe "dark" no <html> do BaseLayout.astro)' : 'light'}\n\nSiga o manifesto passo a passo:\n1. Preencha src/styles/tokens.css com as cores e fontes da seção 3\n2. Atualize o <link> de fonte no BaseLayout.astro (seção 4)\n3. Crie ou adapte cada seção em src/components/sections/\n4. Monte src/pages/index.astro com todos os componentes na ordem correta\n5. Preencha .env com PUBLIC_WA_NUMBER (só dígitos, ex: 5511999999999), PUBLIC_WA_MESSAGE, PUBLIC_GTM_ID e PUBLIC_SITE_URL (seção 6) — nunca coloque esses valores no código\n6. Preencha defaultSchema no BaseLayout.astro (seção 7)\n7. Garanta: Hero id="hero-section", Footer id="footer", main id="main-content"\n8. Rode npm run build — corrija qualquer erro`}
          hint="Baixe o MANIFESTO.md, clone o repositório base e cole este prompt no Claude Code com o arquivo anexado."
        />
      )}

      {/* Botões de ação */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setManifestOpen(true)}
          className={cn(ui.btnOutline, 'flex items-center gap-1.5 text-sm')}
        >
          <FileText className="w-4 h-4" />
          Revisar manifesto
        </button>
      </div>
      <div className="flex gap-2">
        {state.outputPath === 'library' && (
          <button
            onClick={handleCreate}
            disabled={creating || !canGenerate}
            className={cn(ui.btnPrimary, 'flex-1 py-3 text-sm')}
          >
            <span className="flex items-center justify-center gap-2">
              {creating ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Criando...</>
              ) : (
                <><Zap className="w-4 h-4" />Criar Projeto no GitHub</>
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
                <><Loader2 className="w-4 h-4 animate-spin" />Criando...</>
              ) : (
                <><GitBranch className="w-4 h-4" />Criar no GitHub (só manifesto)</>
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
              <Download className="w-4 h-4" />
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
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={copyDoc}
          className={cn(ui.btnOutline, 'py-3 px-3', docCopied && 'text-ok border-ok/30')}
          title="Copiar documento"
        >
          {docCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Progresso de criação */}
      {creating && (
        <div className={cn(ui.cardBase, 'p-5 flex items-center gap-3')}>
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <p className="text-sm text-ink-primary">Criando projeto no GitHub...</p>
        </div>
      )}

      {/* Resultado de sucesso */}
      {result && result.success && (
        <div className="space-y-3">
          <div className={cn(ui.cardBase, 'p-5 border-ok/30 bg-ok/5')}>
            <div className="flex items-center gap-2 mb-3">
              <Check className="w-5 h-5 text-ok flex-shrink-0" />
              <p className="text-sm font-semibold text-ok">Projeto criado no GitHub!</p>
            </div>

            <div className="flex items-center gap-2 bg-raised/50 rounded-lg px-3 py-2 mb-4">
              <span className="text-[11px] text-ink-muted flex-shrink-0">URL</span>
              <span className="text-xs text-ink-secondary flex-1 truncate font-mono">{result.repoUrl}</span>
              <button
                onClick={() => copyUrl(result.repoUrl)}
                className={cn('p-1 rounded text-ink-muted hover:text-ink-primary transition-colors flex-shrink-0', copied && 'text-ok')}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex gap-2 flex-wrap">
              <a
                href={`${result.repoUrl}/archive/refs/heads/main.zip`}
                className={cn(ui.btnPrimary, 'text-xs flex items-center gap-1.5')}
              >
                <Download className="w-3.5 h-3.5" />
                Baixar ZIP
              </a>
              <a
                href={result.repoUrl}
                target="_blank"
                rel="noopener"
                className={cn(ui.btnOutline, 'text-xs flex items-center gap-1.5')}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Ver no GitHub
              </a>
              {result.vscodeUrl && (
                <a href={result.vscodeUrl} className={cn(ui.btnGhost, 'text-xs flex items-center gap-1.5')}>
                  <Code2 className="w-3.5 h-3.5" />
                  Abrir no VS Code <span className="text-ink-muted">(opcional)</span>
                </a>
              )}
            </div>
          </div>

          {/* Próximos passos */}
          <div className={cn(ui.cardBase, 'p-4')}>
            <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-3">Próximos passos</p>
            <ol className="space-y-3">
              <li className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-accent/20 text-accent font-semibold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <div className="flex-1">
                  <p className="text-xs text-ink-secondary mb-1.5">Copie o MANIFESTO.md do repositório</p>
                  <button
                    onClick={() => copyManifestFromGitHub(result.repoUrl)}
                    disabled={fetchingManifest}
                    className={cn(ui.btnOutline, 'text-xs flex items-center gap-1.5', manifestCopied && 'text-ok border-ok/30')}
                  >
                    {fetchingManifest ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" />Buscando...</>
                    ) : manifestCopied ? (
                      <><Check className="w-3.5 h-3.5" />Copiado!</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" />Copiar MANIFESTO.md</>
                    )}
                  </button>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-accent/20 text-accent font-semibold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <p className="text-xs text-ink-secondary">Baixe o ZIP acima e extraia na sua pasta de projetos</p>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-accent/20 text-accent font-semibold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <p className="text-xs text-ink-secondary">Abra a pasta no Claude Code (<code className="bg-raised px-1 rounded text-[11px]">claude</code>) e cole o MANIFESTO.md junto com o comando acima</p>
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="rounded-xl border border-fail/30 bg-fail/5 px-4 py-3 flex items-start gap-2">
          <XCircle className="w-4 h-4 text-fail flex-shrink-0 mt-0.5" />
          <p className="text-xs text-fail">{error}</p>
        </div>
      )}
    </div>
  )
}
