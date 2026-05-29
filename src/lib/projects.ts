// src/lib/projects.ts

import type { ClientProject, BuilderState, ArtDirectionV2, Briefing } from '../types'
import { generateId, slugify } from './utils'

const PROJECTS_KEY = 'acs-projects'
const ACTIVE_KEY = 'acs-active-project'

// Guard: typeof window !== 'undefined' para evitar erro no SSR
function getStorage() {
  return typeof window !== 'undefined' ? window.localStorage : null
}

const DEFAULT_BRIEFING: Briefing = {
  briefingBruto: '',
  nomeCliente: '', nomeMarca: '', segmento: '',
  tipo: 'servico',
  propostaValor: '', dominio: '',
  anosExperiencia: '', formacao: '', certificacoes: '',
  whatsapp: '', email: '', horarios: '',
  gtmId: '', objetivoConversao: '', whatsappMensagem: '',
  instagram: '', tiktok: '', youtube: '', facebook: '',
  googleBusiness: '', googleNota: '', googleQtd: '',
  servicoPrincipal: '', servicosDescricao: '',
  comoFunciona: '', resultadoEsperado: '', prazoResultado: '',
  precoExibir: false,
  precoPlano1Nome: '', precoPlano1Valor: '', precoPlano1Descricao: '',
  precoPlano2Nome: '', precoPlano2Valor: '', precoPlano2Descricao: '',
  formaPagamento: '',
  publicoPrimario: '', publicoDor: '', publicoResultado: '',
  avatarNome: '', avatarIdade: '', avatarProfissao: '',
  objecoes: '',
  diferencial: '', fraseImpacto: '', historia: '',
  depoimento1Nome: '', depoimento1Texto: '', depoimento1Resultado: '',
  depoimento2Nome: '', depoimento2Texto: '', depoimento2Resultado: '',
  depoimento3Nome: '', depoimento3Texto: '', depoimento3Resultado: '',
  faq: '',
  estiloDesejado: '', sensacaoVisitante: '',
  tomComunicacao: '', restricoes: '',
  seoTitulo: '', seoDescricao: '', seoKeywords: '',
  schemaTipo: 'LocalBusiness',
}

const DEFAULT_ART: ArtDirectionV2 = {
  colorPrimary: '#2d6a4f',
  colorPrimaryDark: '#1b4332',
  colorSecondary: '#52b788',
  colorBackground: '#ffffff',
  colorSurface: '#f8fafb',
  colorSurfaceAlt: '#f0f4f8',
  colorDark: '#0a0a0a',
  colorText: '#1a1a2e',
  colorTextSoft: '#4a5568',
  colorTextMuted: '#a0aec0',
  colorBorder: '#e2e8f0',
  fontHeading: 'Inter',
  fontBody: 'Inter',
  mood: '',
  references: '',
  notes: '',
  defaultTheme: 'light',
  darkColorBackground: '#0f0f0f',
  darkColorSurface: '#1a1a1a',
  darkColorSurfaceAlt: '#242424',
  darkColorText: '#e8e8e8',
  darkColorTextSoft: '#b0b0b0',
  darkColorTextMuted: '#707070',
  darkColorBorder: '#2a2a2a',
}

export const DEFAULT_BUILDER_STATE: BuilderState = {
  step: 'briefing',
  briefingTab: 0,
  briefing: DEFAULT_BRIEFING,
  sections: [],
  art: DEFAULT_ART,
  selected: [],
  copyEdits: {},
  outputPath: 'library',
  intakeAnalyzed: false,
}

export function getProjects(): ClientProject[] {
  try {
    const storage = getStorage()
    if (!storage) return []
    return JSON.parse(storage.getItem(PROJECTS_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function getActiveProjectId(): string | null {
  const storage = getStorage()
  if (!storage) return null
  return storage.getItem(ACTIVE_KEY)
}

export function setActiveProjectId(id: string): void {
  const storage = getStorage()
  if (!storage) return
  storage.setItem(ACTIVE_KEY, id)
}

export function getProject(id: string): ClientProject | null {
  return getProjects().find(p => p.id === id) ?? null
}

export function saveProject(project: ClientProject): void {
  const storage = getStorage()
  if (!storage) return
  const projects = getProjects().filter(p => p.id !== project.id)
  projects.push({ ...project, updatedAt: new Date().toISOString() })
  storage.setItem(PROJECTS_KEY, JSON.stringify(projects))
}

export function deleteProject(id: string): void {
  const storage = getStorage()
  if (!storage) return
  const projects = getProjects().filter(p => p.id !== id)
  storage.setItem(PROJECTS_KEY, JSON.stringify(projects))
  if (getActiveProjectId() === id) {
    const next = projects[projects.length - 1]
    if (next) setActiveProjectId(next.id)
    else storage.removeItem(ACTIVE_KEY)
  }
}

export function createProject(name: string): ClientProject {
  const id = generateId()
  const project: ClientProject = {
    id,
    name,
    slug: slugify(name),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    builderState: { ...DEFAULT_BUILDER_STATE },
  }
  saveProject(project)
  setActiveProjectId(id)
  return project
}

export function exportAllData(): string {
  const storage = getStorage()
  return JSON.stringify({
    version: 2,
    exportedAt: new Date().toISOString(),
    projects: getProjects(),
    settings: storage?.getItem('acs-settings') ?? null,
  }, null, 2)
}

export function importAllData(json: string): { projects: number; settings: boolean } {
  const storage = getStorage()
  if (!storage) return { projects: 0, settings: false }
  const data = JSON.parse(json)
  const projects: ClientProject[] = data.projects ?? []
  storage.setItem(PROJECTS_KEY, JSON.stringify(projects))
  if (data.settings) {
    storage.setItem('acs-settings', data.settings)
  }
  return { projects: projects.length, settings: !!data.settings }
}
