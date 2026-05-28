// src/types/index.ts

// ─── Componentes ───────────────────────────────────────────────────────────

export type ComponentCategory =
  | 'Hero'
  | 'Header'
  | 'Navigation'
  | 'Features'
  | 'Pricing'
  | 'Testimonials'
  | 'CTA'
  | 'FAQ'
  | 'Stats'
  | 'Gallery'
  | 'Contact'
  | 'Footer'
  | 'About'
  | 'Team'
  | 'Misc'

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
  // Cores principais (tokens do tailwind.config.js)
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
