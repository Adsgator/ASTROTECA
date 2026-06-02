// src/components/builder/BuilderShell.tsx

import { useReducer, useState, useEffect, useCallback } from 'react'
import type {
  ComponentMeta, BuilderStep, BuilderState, OutputPath,
  Briefing, PageSection, ArtDirectionV2, SelectedComponent,
  ClientProject, AppSettingsV2,
} from '../../types'
import {
  getProjects, getActiveProjectId, setActiveProjectId,
  getProject, saveProject, deleteProject, createProject,
  DEFAULT_BUILDER_STATE,
} from '../../lib/projects'
import { buildDefaultSections } from '../../lib/section-defaults'
import { buildSectionsFromSuggestions } from '../../lib/intake-prompt'
import { createProjectFromTemplate } from '../../lib/github'
import { generateDocument } from '../../lib/export-document'
import { generateCreateManifest } from '../../lib/manifest'
import { wait } from '../../lib/utils'
import type { IntakeResult } from '../../lib/intake-prompt'
import StepNav from './StepNav'
import ProjectSelector from './ProjectSelector'
import BriefingStep from './BriefingStep'
import StructureStep from './StructureStep'
import ArtStep from './ArtStep'
import ComponentsStep from './ComponentsStep'
import PreviewStep from './PreviewStep'
import GenerateStep from './GenerateStep'
import BuilderSidebar from './BuilderSidebar'
import { ToastProvider, useToast } from './Toast'
import * as ui from '../../styles/ui'
import { cn } from '../../lib/utils'
import type { CreateProjectResult } from '../../types'

// ─── Reducer ──────────────────────────────────────────────────────────────────

type BuilderAction =
  | { type: 'SET_STEP'; step: BuilderStep }
  | { type: 'UPDATE_BRIEFING'; briefing: Partial<Briefing> }
  | { type: 'SET_SECTIONS'; sections: PageSection[] }
  | { type: 'UPDATE_ART'; art: Partial<ArtDirectionV2> }
  | { type: 'SET_SELECTED'; selected: SelectedComponent[] }
  | { type: 'UPDATE_COPY'; componentId: string; copy: Record<string, string> }
  | { type: 'SET_OUTPUT_PATH'; path: OutputPath }
  | { type: 'LOAD_STATE'; state: BuilderState }
  | { type: 'APPLY_INTAKE'; result: IntakeResult; sections: PageSection[] }

function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step }
    case 'UPDATE_BRIEFING':
      return { ...state, briefing: { ...state.briefing, ...action.briefing } }
    case 'SET_SECTIONS':
      return { ...state, sections: action.sections }
    case 'UPDATE_ART':
      return { ...state, art: { ...state.art, ...action.art } }
    case 'SET_SELECTED':
      return { ...state, selected: action.selected }
    case 'UPDATE_COPY':
      return {
        ...state,
        copyEdits: { ...state.copyEdits, [action.componentId]: action.copy },
      }
    case 'SET_OUTPUT_PATH':
      return { ...state, outputPath: action.path }
    case 'LOAD_STATE':
      return action.state
    case 'APPLY_INTAKE':
      return {
        ...state,
        briefing: action.result.briefing,
        art: Object.keys(action.result.art).length > 0
          ? { ...state.art, ...action.result.art }
          : state.art,
        sections: action.sections,
        intakeAnalyzed: true,
      }
    default:
      return state
  }
}

// ─── Steps config ──────────────────────────────────────────────────────────────

// SVG paths for step icons
const STEP_ICONS: Record<string, string> = {
  briefing: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  estrutura: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  arte: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
  componentes: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z',
  preview: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  gerar: 'M13 10V3L4 14h7v7l9-11h-7z',
}

const STEPS: { key: BuilderStep; label: string }[] = [
  { key: 'briefing', label: 'Briefing' },
  { key: 'estrutura', label: 'Estrutura' },
  { key: 'arte', label: 'Arte' },
  { key: 'componentes', label: 'Componentes' },
  { key: 'preview', label: 'Preview' },
  { key: 'gerar', label: 'Gerar' },
]

const STEP_HINTS: Record<BuilderStep, string> = {
  briefing:    'Descreva o cliente em texto livre e clique em "Analisar com Gemini" — os campos serão preenchidos automaticamente.',
  estrutura:   'Ative as seções que o site vai ter e arraste para reordenar. O copy de cada seção pode ser ajustado depois.',
  arte:        'Escolha um preset de cores ou defina manualmente. O preview à direita atualiza ao vivo.',
  componentes: 'Selecione os componentes da biblioteca para cada seção. Seções sem componente serão criadas pelo Claude Code.',
  preview:     'Visualize como os componentes ficam juntos com as cores e fontes escolhidas.',
  gerar:       'Copie o comando abaixo e cole no Claude Code junto com o MANIFESTO.md após criar o projeto.',
}

// ─── Settings helper ───────────────────────────────────────────────────────────

function loadSettings(): AppSettingsV2 {
  try {
    const raw = JSON.parse(localStorage.getItem('acs-settings') ?? '{}')
    return {
      githubToken: '',
      githubOwner: '',
      componentsRepo: '',
      baseProjectRepo: '',
      previewBaseUrl: '',
      registryUrl: '',
      studioName: 'Astroteca',
      manifestTemplate: '',
      defaultFontHeading: 'Cormorant Garamond',
      defaultFontBody: 'DM Sans',
      defaultColorPrimary: '#6366f1',
      defaultCtaLabel: 'Fale Comigo',
      npmNamespace: '',
      userName: '',
      userEmail: '',
      geminiApiKey: '',
      geminiModel: 'gemini-2.5-flash',
      ...raw,
    }
  } catch {
    return {
      githubToken: '', githubOwner: '', componentsRepo: '', baseProjectRepo: '',
      previewBaseUrl: '', registryUrl: '', studioName: 'Astroteca', manifestTemplate: '',
      defaultFontHeading: 'Cormorant Garamond', defaultFontBody: 'DM Sans',
      defaultColorPrimary: '#6366f1', defaultCtaLabel: 'Fale Comigo',
      npmNamespace: '', userName: '', userEmail: '',
      geminiApiKey: '', geminiModel: 'gemini-2.5-flash',
    }
  }
}

// ─── Inner component (has access to toast) ────────────────────────────────────

function BuilderShellInner({ availableComponents }: { availableComponents: ComponentMeta[] }) {
  const { toast } = useToast()

  const [projects, setProjects] = useState<ClientProject[]>(() => getProjects())
  const [activeProject, setActiveProject] = useState<ClientProject | null>(() => {
    const id = getActiveProjectId()
    return id ? getProject(id) : null
  })
  const [settings] = useState<AppSettingsV2>(loadSettings)
  const [state, dispatch] = useReducer(builderReducer, activeProject?.builderState ?? DEFAULT_BUILDER_STATE)
  const [sidebarTab, setSidebarTab] = useState<'resumo' | 'componentes' | 'documento'>('resumo')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [creating, setCreating] = useState(false)
  const [result, setResult] = useState<CreateProjectResult | null>(null)
  const [error, setError] = useState('')
  const [filledByAI, setFilledByAI] = useState<string[]>([])
  const [transitioning, setTransitioning] = useState(false)
  const [displayStep, setDisplayStep] = useState<BuilderStep>(state.step)

  // Inicializa seções se vazio
  useEffect(() => {
    if (state.sections.length === 0) {
      dispatch({ type: 'SET_SECTIONS', sections: buildDefaultSections(state.briefing) })
    }
  }, [])

  // Auto-save com debounce
  useEffect(() => {
    if (!activeProject) return
    const timer = setTimeout(() => {
      const updated = { ...activeProject, builderState: state }
      saveProject(updated)
      setActiveProject(updated)
    }, 500)
    return () => clearTimeout(timer)
  }, [state])

  // Ctrl+S
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (activeProject) {
          saveProject({ ...activeProject, builderState: state })
          toast('Projeto salvo', 'success')
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [activeProject, state])

  function goToStep(step: BuilderStep) {
    setTransitioning(true)
    setTimeout(() => {
      dispatch({ type: 'SET_STEP', step })
      setDisplayStep(step)
      setTransitioning(false)
    }, 150)
  }

  function handleSwitchProject(project: ClientProject) {
    setActiveProjectId(project.id)
    setActiveProject(project)
    dispatch({ type: 'LOAD_STATE', state: project.builderState })
    setDisplayStep(project.builderState.step)
    setResult(null)
    setError('')
  }

  function handleCreateProject(name: string) {
    const project = createProject(name)
    setProjects(getProjects())
    setActiveProject(project)
    dispatch({ type: 'LOAD_STATE', state: project.builderState })
    setDisplayStep('briefing')
    // Inicializa seções para novo projeto
    const sections = buildDefaultSections(project.builderState.briefing)
    dispatch({ type: 'SET_SECTIONS', sections })
    toast(`Projeto "${name}" criado`, 'success')
  }

  function handleDeleteProject(id: string) {
    deleteProject(id)
    const remaining = getProjects()
    setProjects(remaining)
    if (activeProject?.id === id) {
      const next = remaining[remaining.length - 1] ?? null
      setActiveProject(next)
      if (next) {
        setActiveProjectId(next.id)
        dispatch({ type: 'LOAD_STATE', state: next.builderState })
      } else {
        dispatch({ type: 'LOAD_STATE', state: DEFAULT_BUILDER_STATE })
      }
    }
    toast('Projeto deletado', 'info')
  }

  function handleRemoveComponent(id: string) {
    const updated = state.selected
      .filter(s => s.meta.id !== id)
      .map((s, i) => ({ ...s, position: i }))
    dispatch({ type: 'SET_SELECTED', selected: updated })
  }

  function handleMoveComponent(index: number, dir: 'up' | 'down') {
    const sorted = [...state.selected].sort((a, b) => a.position - b.position)
    const swapIdx = dir === 'up' ? index - 1 : index + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    const a = sorted[index]
    const b = sorted[swapIdx]
    sorted[index] = { ...a, position: b.position }
    sorted[swapIdx] = { ...b, position: a.position }
    dispatch({ type: 'SET_SELECTED', selected: sorted })
  }

  async function handleGenerateProject() {
    setCreating(true)
    setError('')
    setResult(null)
    try {
      let manifestContent: string
      if (state.outputPath === 'create') {
        manifestContent = generateCreateManifest({
          project: {
            clientName: state.briefing.nomeCliente,
            projectType: state.briefing.tipo,
            niche: state.briefing.segmento,
            pageGoal: state.briefing.objetivoConversao,
            siteUrl: state.briefing.dominio,
            email: state.briefing.email,
            whatsapp: state.briefing.whatsapp,
            whatsappMessage: state.briefing.whatsappMensagem,
            address: '',
            hours: state.briefing.horarios,
            instagram: state.briefing.instagram,
            facebook: state.briefing.facebook,
            gtmId: state.briefing.gtmId,
            schemaType: state.briefing.schemaTipo,
            seoTitle: state.briefing.seoTitulo,
            seoDescription: state.briefing.seoDescricao,
            seoKeywords: state.briefing.seoKeywords,
          },
          artDirection: state.art,
          sections: state.sections,
          libraryComponents: state.selected,
          settings,
        })
      } else {
        manifestContent = generateDocument(state, settings)
      }

      const componentMetas = state.selected.map(s => s.meta)
      const isCreate = state.outputPath === 'create'

      // Path C chama o endpoint server-side para que ele leia o blueprint do disco
      if (isCreate) {
        const apiRes = await fetch('/api/create-project', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            settings,
            clientName: state.briefing.nomeCliente,
            manifest: manifestContent,
            components: componentMetas,
            includeBlueprint: true,
          }),
        })
        const res: CreateProjectResult = await apiRes.json()
        setResult(res)
        if (res.success) toast('Projeto criado no GitHub!', 'success')
        else setError((res as { error?: string }).error ?? 'Erro ao criar projeto')
        return
      }

      const res = await createProjectFromTemplate(
        settings,
        state.briefing.nomeCliente,
        manifestContent,
        componentMetas,
      )
      setResult(res)
      if (res.success) toast('Projeto criado no GitHub!', 'success')
      else setError(res.error ?? 'Erro ao criar projeto')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro desconhecido'
      setError(msg)
      toast(msg, 'error')
    } finally {
      setCreating(false)
    }
  }

  const validation: Record<BuilderStep, boolean> = {
    briefing: !!state.briefing.nomeCliente,
    estrutura: state.sections.some(s => s.enabled),
    arte: true,
    componentes: true,
    preview: true,
    gerar: !!state.briefing.nomeCliente && state.sections.some(s => s.enabled),
  }

  return (
    <div className="flex flex-col xl:flex-row h-full gap-4">
      {/* Coluna principal */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        {/* Header: ProjectSelector + StepNav */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
          <ProjectSelector
            activeProject={activeProject}
            projects={projects}
            onSwitch={handleSwitchProject}
            onCreate={handleCreateProject}
            onDelete={handleDeleteProject}
          />
          <div className="flex-1 min-w-0">
            <StepNav
              steps={STEPS.map(s => ({ ...s, iconPath: STEP_ICONS[s.key] }))}
              current={displayStep}
              validation={validation}
              onStep={goToStep}
              intakeAnalyzed={state.intakeAnalyzed}
            />
          </div>
        </div>

        {/* Step content */}
        <div
          className={cn(
            'step-content flex-1 overflow-y-auto',
            transitioning && 'transitioning',
          )}
        >
          {/* Dica contextual do step */}
          <p className="text-xs text-ink-muted mb-3 leading-relaxed">{STEP_HINTS[displayStep]}</p>

          {displayStep === 'briefing' && (
            <BriefingStep
              briefing={state.briefing}
              onChange={briefing => dispatch({ type: 'UPDATE_BRIEFING', briefing })}
              settings={settings}
              filledByAI={filledByAI}
              onFilledByAI={setFilledByAI}
              onIntakeResult={result => {
                const sections = buildSectionsFromSuggestions(result.suggestedSectionTypes, result.briefing)
                dispatch({ type: 'APPLY_INTAKE', result, sections })
                setFilledByAI(result.filledFields)
              }}
            />
          )}
          {displayStep === 'estrutura' && (
            <StructureStep
              sections={state.sections}
              briefing={state.briefing}
              onChange={sections => dispatch({ type: 'SET_SECTIONS', sections })}
              settings={settings}
            />
          )}
          {displayStep === 'arte' && (
            <ArtStep
              art={state.art}
              onChange={art => dispatch({ type: 'UPDATE_ART', art })}
              nomeCliente={state.briefing.nomeCliente}
              niche={state.briefing.segmento}
              settings={settings}
            />
          )}
          {displayStep === 'componentes' && (
            <ComponentsStep
              availableComponents={availableComponents}
              selected={state.selected}
              onChange={selected => dispatch({ type: 'SET_SELECTED', selected })}
              sections={state.sections}
              onSectionsChange={sections => dispatch({ type: 'SET_SECTIONS', sections })}
            />
          )}
          {displayStep === 'preview' && (
            <PreviewStep
              selected={state.selected}
              art={state.art}
              sections={state.sections}
            />
          )}
          {displayStep === 'gerar' && (
            <GenerateStep
              state={state}
              settings={settings}
              availableComponents={availableComponents}
              onCreateProject={handleGenerateProject}
              creating={creating}
              result={result}
              error={error}
              onOutputPathChange={path => dispatch({ type: 'SET_OUTPUT_PATH', path })}
            />
          )}
        </div>

        {/* Nav buttons */}
        <div className="flex justify-between pt-1 flex-shrink-0">
          {STEPS.findIndex(s => s.key === displayStep) > 0 ? (
            <button
              onClick={() => goToStep(STEPS[STEPS.findIndex(s => s.key === displayStep) - 1].key)}
              className={ui.btnGhost + ' text-xs'}
            >
              ← Anterior
            </button>
          ) : <div />}
          {STEPS.findIndex(s => s.key === displayStep) < STEPS.length - 1 ? (
            <button
              onClick={() => goToStep(STEPS[STEPS.findIndex(s => s.key === displayStep) + 1].key)}
              className={ui.btnPrimary + ' text-xs'}
            >
              Próximo →
            </button>
          ) : <div />}
        </div>
      </div>

      {/* Sidebar direita */}
      <div className={cn(
        ui.cardBase,
        'flex-shrink-0 overflow-hidden transition-all duration-300',
        sidebarCollapsed ? 'xl:w-14 w-14' : 'xl:w-[440px] w-full',
      )}>
        <BuilderSidebar
          tab={sidebarTab}
          onTabChange={t => setSidebarTab(t as typeof sidebarTab)}
          state={state}
          settings={settings}
          onRemoveComponent={handleRemoveComponent}
          onMoveComponent={handleMoveComponent}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(c => !c)}
        />
      </div>
    </div>
  )
}

// ─── Wrapper com ToastProvider ────────────────────────────────────────────────

export default function BuilderShell({ availableComponents }: { availableComponents: ComponentMeta[] }) {
  return (
    <ToastProvider>
      <BuilderShellInner availableComponents={availableComponents} />
    </ToastProvider>
  )
}
