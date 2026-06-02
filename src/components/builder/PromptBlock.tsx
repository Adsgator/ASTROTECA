// src/components/builder/PromptBlock.tsx
// Bloco copiável com o prompt/comando para enviar ao Claude junto com o documento.

import { useState } from 'react'
import { cn } from '../../lib/utils'
import { Check, Copy, Terminal } from 'lucide-react'

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
          <Terminal className="w-3.5 h-3.5 text-accent" />
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
            <><Check className="w-3 h-3" />Copiado</>
          ) : (
            <><Copy className="w-3 h-3" />Copiar comando</>
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
