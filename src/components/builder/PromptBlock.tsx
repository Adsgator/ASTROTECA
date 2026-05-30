// src/components/builder/PromptBlock.tsx
// Bloco copiável com o prompt/comando para enviar ao Claude junto com o documento.

import { useState } from 'react'
import { cn } from '../../lib/utils'

interface PromptBlockProps {
  label: string
  prompt: string
  hint?: string
}

export default function PromptBlock({ label, prompt, hint }: PromptBlockProps) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-surface/60 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06] bg-raised/30">
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" y1="19" x2="20" y2="19" />
          </svg>
          <span className="text-[11px] font-semibold text-ink-secondary uppercase tracking-wider">{label}</span>
        </div>
        <button
          onClick={copy}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all',
            copied
              ? 'bg-ok/15 text-ok'
              : 'bg-accent/10 text-accent hover:bg-accent/20',
          )}
        >
          {copied ? (
            <>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
              Copiado
            </>
          ) : (
            <>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
              Copiar comando
            </>
          )}
        </button>
      </div>
      <pre className="px-3 py-2.5 text-xs text-ink-secondary leading-relaxed whitespace-pre-wrap font-mono select-all">{prompt}</pre>
      {hint && (
        <div className="px-3 pb-2.5">
          <p className="text-[10px] text-ink-muted leading-relaxed">{hint}</p>
        </div>
      )}
    </div>
  )
}
