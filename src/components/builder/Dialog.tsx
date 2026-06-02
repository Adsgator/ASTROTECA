// src/components/builder/Dialog.tsx
// Substitui window.confirm() e window.alert() com design Astroteca

import { useEffect, useRef } from 'react'
import { AlertTriangle, Info } from 'lucide-react'

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
              <AlertTriangle className="w-5 h-5 text-fail" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-accent" />
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
