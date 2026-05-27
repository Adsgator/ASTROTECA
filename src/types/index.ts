// src/types/index.ts

// ─── Componentes ───────────────────────────────────────────────────────────

export type ComponentCategory =
  | 'Hero'
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
  colorPrimary: string
  colorSecondary: string
  colorBackground: string
  colorText: string
  fontHeading: string
  fontBody: string
  mood: string
  references: string
  notes: string
}

export interface ProjectConfig {
  clientName: string
  projectType: string
  niche: string
  pageGoal: string
  googleAnalyticsId: string
  siteUrl: string
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
