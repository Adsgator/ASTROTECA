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
import { createProjectFromTemplate } from '../../lib/github'
import { generateDocument } from '../../lib/export-document'
import { wait } from '../../lib/utils'
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
    default:
      return state
  }
}

// ─── Steps config ──────────────────────────────────────────────────────────────

const STEPS: { key: BuilderStep; label: string; icon: string }[] = [
  { key: 'briefing', label: 'Briefing', icon: '📋' },
  { key: 'estrutura', label: 'Estrutura', icon: '🏗️' },
  { key: 'arte', label: 'Arte', icon: '🎨' },
  { key: 'componentes', label: 'Componentes', icon: '🧩' },
  { key: 'preview', label: 'Preview', icon: '👁️' },
  { key: 'gerar', label: 'Gerar', icon: '🚀' },
]

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
      const manifestContent = generateDocument(state, settings)
      const componentMetas = state.selected.map(s => s.meta)
      const res = await createProjectFromTemplate(settings, state.briefing.nomeCliente, manifestContent, componentMetas)
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

  // Mobile gate
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg font-semibold text-ink-primary">📱 Abra no desktop</p>
        <p className="text-sm text-ink-secondary mt-2">O Builder funciona melhor em telas maiores (768px+).</p>
      </div>
    )
  }

  return (
    <div className="flex h-full gap-4">
      {/* Coluna principal */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        {/* Header: ProjectSelector + StepNav */}
        <div className="flex items-center gap-3 flex-wrap">
          <ProjectSelector
            activeProject={activeProject}
            projects={projects}
            onSwitch={handleSwitchProject}
            onCreate={handleCreateProject}
            onDelete={handleDeleteProject}
          />
          <div className="flex-1 min-w-0">
            <StepNav
              steps={STEPS}
              current={displayStep}
              validation={validation}
              onStep={goToStep}
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
          {displayStep === 'briefing' && (
            <BriefingStep
              briefing={state.briefing}
              onChange={briefing => dispatch({ type: 'UPDATE_BRIEFING', briefing })}
              settings={settings}
              filledByAI={filledByAI}
              onFilledByAI={setFilledByAI}
            />
          )}
          {displayStep === 'estrutura' && (
            <StructureStep
              sections={state.sections}
              briefing={state.briefing}
              onChange={sections => dispatch({ type: 'SET_SECTIONS', sections })}
            />
          )}
          {displayStep === 'arte' && (
            <ArtStep
              art={state.art}
              onChange={art => dispatch({ type: 'UPDATE_ART', art })}
              nomeCliente={state.briefing.nomeCliente}
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
      <div className={cn(ui.cardBase, 'w-64 flex-shrink-0 overflow-hidden')}>
        <BuilderSidebar
          tab={sidebarTab}
          onTabChange={t => setSidebarTab(t as typeof sidebarTab)}
          state={state}
          settings={settings}
          onRemoveComponent={handleRemoveComponent}
          onMoveComponent={handleMoveComponent}
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
