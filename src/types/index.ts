// src/types/index.ts

// ─── Componentes ───────────────────────────────────────────────────────────

export type ComponentCategory =
  | 'Hero'
  | 'Header'
  | 'Navigation'
  | 'Features'
  | 'Services'
  | 'Pricing'
  | 'Testimonials'
  | 'Process'
  | 'CTA'
  | 'FAQ'
  | 'Stats'
  | 'Gallery'
  | 'Contact'
  | 'Footer'
  | 'About'
  | 'Team'
  | 'Trust'
  | 'UI'
  | 'Misc'
  | 'Other'

export interface PropDefinition {
  name: string
  type: 'string' | 'boolean' | 'number' | 'array' | 'Record<string, string>'
  required: boolean
  description?: string
  default?: string
  previewValue: string
}

export interface ComponentMeta {
  id: string
  name: string
  category: ComponentCategory
  description: string
  previewUrl?: string
  previewPath?: string
  screenshotUrl?: string
  codeUrl?: string
  componentFile?: string
  props: PropDefinition[]
  tags: string[]
  bestFor: string[]
  copy?: Record<string, string>
  order?: number
  createdAt: string
  updatedAt: string
}

// ─── Builder ────────────────────────────────────────────────────────────────

export interface SelectedComponent {
  meta: ComponentMeta
  position: number
  copy?: Record<string, string>
}

export interface ArtDirection {
  // Cores principais (tokens CSS em tokens.css, prefixo --t-)
  colorPrimary: string
  colorPrimaryDark: string
  colorSecondary: string
  colorBackground: string
  colorSurface: string
  colorSurfaceAlt: string
  colorDark: string
  colorText: string
  colorTextSoft: string
  colorTextMuted: string
  colorBorder: string
  // Tipografia
  fontHeading: string
  fontBody: string
  // Direção artística
  mood: string
  references: string
  notes: string
}

export interface ProjectConfig {
  clientName: string
  projectType: string
  niche: string
  pageGoal: string
  siteUrl: string
  // Técnico
  gtmId: string
  whatsapp: string
  whatsappMessage: string
  email: string
  address: string
  hours: string
  instagram: string
  facebook: string
  schemaType: string
  // SEO
  seoTitle: string
  seoDescription: string
  seoKeywords: string
}

// ─── Configurações ──────────────────────────────────────────────────────────

export interface AppSettings {
  githubToken: string
  githubOwner: string
  componentsRepo: string
  baseProjectRepo: string
  previewBaseUrl: string
  registryUrl: string
  studioName: string
  manifestTemplate: string
  defaultFontHeading: string
  defaultFontBody: string
  defaultColorPrimary: string
  defaultCtaLabel: string
  npmNamespace: string
  userName: string
  userEmail: string
}

// ─── GitHub API ─────────────────────────────────────────────────────────────

export interface GitHubFile {
  name: string
  path: string
  sha: string
  content?: string
  encoding?: string
}

export interface CreateProjectResult {
  repoUrl: string
  cloneUrl: string
  sshUrl: string
  vscodeUrl: string
  success: boolean
  error?: string
  /** IDs dos componentes efetivamente copiados — usado para registrar analytics no endpoint */
  usedComponentIds?: string[]
}

// ─── Admin ─────────────────────────────────────────────────────────────────

export interface PropDraft {
  name: string
  type: string
  required: boolean
  description: string
  previewValue: string
}

export interface PropMeta {
  name: string
  type: string
  required: boolean
  description: string
}

// ─── Gemini AI ──────────────────────────────────────────────────────────────

export type GeminiModel = 'gemini-2.5-flash' | 'gemini-2.5-flash-lite' | 'gemini-2.5-pro'

// ─── Builder v2 ─────────────────────────────────────────────────────────────

export type BuilderStep = 'briefing' | 'estrutura' | 'arte' | 'componentes' | 'preview' | 'gerar'
export type OutputPath = 'library' | 'manual' | 'hybrid' | 'create'

export interface Briefing {
  briefingBruto: string
  // Tab 1: Identidade & Contato
  nomeCliente: string; nomeMarca: string; segmento: string
  tipo: 'servico' | 'mentoria' | 'consultoria' | 'produto' | 'saas' | 'curso'
  propostaValor: string; dominio: string
  anosExperiencia: string; formacao: string; certificacoes: string
  whatsapp: string; email: string; horarios: string
  gtmId: string; objetivoConversao: string; whatsappMensagem: string
  instagram: string; tiktok: string; youtube: string; facebook: string
  googleBusiness: string; googleNota: string; googleQtd: string
  // Tab 2: Serviço & Público
  servicoPrincipal: string; servicosDescricao: string
  servico1Titulo: string; servico1Descricao: string
  servico2Titulo: string; servico2Descricao: string
  servico3Titulo: string; servico3Descricao: string
  comoFunciona: string; resultadoEsperado: string; prazoResultado: string
  passo1Titulo: string; passo1Descricao: string
  passo2Titulo: string; passo2Descricao: string
  passo3Titulo: string; passo3Descricao: string
  precoExibir: boolean
  precoPlano1Nome: string; precoPlano1Valor: string; precoPlano1Descricao: string
  precoPlano2Nome: string; precoPlano2Valor: string; precoPlano2Descricao: string
  formaPagamento: string
  publicoPrimario: string; publicoDor: string; publicoResultado: string
  avatarNome: string; avatarIdade: string; avatarProfissao: string
  objecoes: string
  // Tab 3: Autoridade & Prova
  diferencial: string; fraseImpacto: string; historia: string
  diferencial1Titulo: string; diferencial1Descricao: string
  diferencial2Titulo: string; diferencial2Descricao: string
  diferencial3Titulo: string; diferencial3Descricao: string
  depoimento1Nome: string; depoimento1Texto: string; depoimento1Resultado: string
  depoimento2Nome: string; depoimento2Texto: string; depoimento2Resultado: string
  depoimento3Nome: string; depoimento3Texto: string; depoimento3Resultado: string
  faq: string
  // Tab 4: Visual & SEO
  estiloDesejado: string; sensacaoVisitante: string
  tomComunicacao: string; restricoes: string
  seoTitulo: string; seoDescricao: string; seoKeywords: string
  schemaTipo: string
}

export interface PageSection {
  id: string
  type: string
  label: string
  enabled: boolean
  position: number
  copy: Record<string, string>
  fromLibrary: boolean
  componentId?: string
}

export interface ArtDirectionV2 extends ArtDirection {
  defaultTheme: 'light' | 'dark'
  darkColorBackground: string
  darkColorSurface: string
  darkColorSurfaceAlt: string
  darkColorText: string
  darkColorTextSoft: string
  darkColorTextMuted: string
  darkColorBorder: string
  palettePreset?: string
}

export interface BuilderState {
  step: BuilderStep
  briefingTab: number
  briefing: Briefing
  sections: PageSection[]
  art: ArtDirectionV2
  selected: SelectedComponent[]
  copyEdits: Record<string, Record<string, string>>
  outputPath: OutputPath
  intakeAnalyzed: boolean
}

export interface ClientProject {
  id: string
  name: string
  slug: string
  createdAt: string
  updatedAt: string
  builderState: BuilderState
}

// Estende AppSettings com campos Gemini
export interface AppSettingsV2 extends AppSettings {
  geminiApiKey: string
  geminiModel: GeminiModel
}
