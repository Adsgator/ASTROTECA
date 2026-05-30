// src/components/builder/Dialog.tsx
// Substitui window.confirm() e window.alert() com design Astroteca

import { useEffect, useRef } from 'react'

interface DialogProps {
  open: boolean
  title: string
  message: string
  /** undefined = apenas botão OK (alert). string = confirm com Cancel + label */
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
  onConfirm: () => void
  onCancel?: () => void
}

export default function Dialog({
  open,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel = 'Cancelar',
  variant = 'default',
  onConfirm,
  onCancel,
}: DialogProps) {
  const isConfirm = !!onCancel
  const confirmRef = useRef<HTMLButtonElement>(null)

  // Foco automático no botão de confirmação após o DOM atualizar
  useEffect(() => {
    if (open) requestAnimationFrame(() => confirmRef.current?.focus())
  }, [open])

  // Fechar com Escape
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && onCancel) onCancel()
      if (e.key === 'Enter') onConfirm()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onConfirm, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={() => { if (onCancel) onCancel() }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className="relative z-10 w-full max-w-sm rounded-2xl border border-white/[0.08] bg-surface/95 backdrop-blur-xl shadow-2xl animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          {variant === 'danger' ? (
            <div className="w-9 h-9 rounded-xl bg-fail/10 border border-fail/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-fail" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
          )}
          <h3 className="font-semibold text-ink-primary text-sm">{title}</h3>
        </div>

        {/* Body */}
        <p className="px-5 pb-5 text-sm text-ink-secondary leading-relaxed">{message}</p>

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-5">
          {isConfirm && (
            <button
              onClick={onCancel}
              className="flex-1 py-2 rounded-xl text-sm font-medium border border-white/[0.08] bg-raised/60 text-ink-secondary hover:text-ink-primary hover:bg-raised transition-all"
            >
              {cancelLabel}
            </button>
          )}
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              variant === 'danger'
                ? 'bg-fail/10 text-fail border border-fail/30 hover:bg-fail/20'
                : 'bg-accent text-black shadow-[0_2px_8px_rgba(240,165,0,0.25)] hover:shadow-[0_4px_16px_rgba(240,165,0,0.35)] hover:brightness-110'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
