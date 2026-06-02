// src/components/builder/SelectField.tsx
// Dropdown customizado no design Astroteca — substitui <select> nativo

import { useState, useRef, useEffect, type CSSProperties } from 'react'
import { cn } from '../../lib/utils'
import { Check, ChevronDown } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface SelectFieldProps {
  value: string
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  className?: string
  disabled?: boolean
}

export default function SelectField({
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  className,
  disabled,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({})
  const ref = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const selected = options.find(o => o.value === value)

  useEffect(() => {
    if (!open) return
    const btn = buttonRef.current
    if (btn) {
      const rect = btn.getBoundingClientRect()
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      })
    }
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(v => !v)}
        className={cn(
          'w-full flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-raised/70 backdrop-blur-sm px-3 py-2 text-sm transition-colors text-left',
          open ? 'border-accent ring-1 ring-accent/50' : 'hover:border-white/10',
          !selected ? 'text-ink-muted' : 'text-ink-primary',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown className={cn('w-4 h-4 text-ink-muted flex-shrink-0 transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="z-[9999] rounded-xl border border-white/[0.08] bg-surface/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-scale-in" style={dropdownStyle}>
          <div className="max-h-56 overflow-y-auto py-1">
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors',
                  opt.value === value
                    ? 'text-accent bg-accent/[0.06]'
                    : 'text-ink-secondary hover:text-ink-primary hover:bg-raised/60',
                )}
              >
                {opt.value === value && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                <span className={opt.value === value ? '' : 'ml-5'}>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
