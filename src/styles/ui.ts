/* Centralized Tailwind classes for consistent UI styling */

export const inputBase =
  'w-full rounded-lg border border-white/5 bg-raised/70 backdrop-blur-sm px-3 py-2 text-sm text-ink-primary placeholder-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors'

export const btnBase = 'px-4 py-2 rounded-lg text-sm font-medium transition-colors'

export const btnPrimary = `${btnBase} bg-accent text-black hover:bg-accent-hover disabled:opacity-50`

export const btnOutline = `${btnBase} border border-border bg-transparent text-ink-primary hover:bg-raised`

export const btnGhost = `${btnBase} bg-transparent text-ink-secondary hover:bg-raised hover:text-ink-primary`

export const btnDanger = `${btnBase} bg-fail/10 text-fail border border-fail/20 hover:bg-fail/20`

export const btnSuccess = `${btnBase} bg-ok text-black hover:bg-ok/80`

export const cardBase = 'rounded-xl border border-white/[0.06] bg-surface/60 backdrop-blur-xl overflow-hidden shadow-sm'

export const cardInteractive = `${cardBase} cursor-pointer transition-all hover:border-accent/30 hover:shadow-lg hover:bg-surface/80`

export const badgeBase = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium'

export const tabActive = 'bg-accent text-black shadow-[0_2px_8px_rgba(240,165,0,0.25)] rounded-lg px-3.5 py-2 text-xs font-semibold transition-all'
export const tabInactive = 'text-ink-secondary hover:bg-raised hover:text-ink-primary rounded-lg px-3.5 py-2 text-xs font-semibold transition-all'
export const selectBase = 'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm backdrop-blur-sm focus:border-accent focus:ring-1 focus:ring-accent/50 outline-none transition-all'
