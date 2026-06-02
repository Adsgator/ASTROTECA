// src/components/builder/StepNav.tsx

import type { BuilderStep } from '../../types'
import { Check, Zap } from 'lucide-react'

interface StepNavProps {
  steps: { key: BuilderStep; label: string; iconPath?: string }[]
  current: BuilderStep
  validation: Record<BuilderStep, boolean>
  onStep: (step: BuilderStep) => void
  intakeAnalyzed?: boolean
}

const AI_FILLED_STEPS: BuilderStep[] = ['briefing', 'estrutura', 'arte']

export default function StepNav({ steps, current, validation, onStep, intakeAnalyzed }: StepNavProps) {
  const currentIndex = steps.findIndex(s => s.key === current)

  return (
    <div className="flex flex-col gap-1.5">
      {/* Barra de progresso */}
      <div className="h-0.5 bg-raised/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent/60 rounded-full transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
        {steps.map((step, i) => {
          const isActive = step.key === current
          const isDone = validation[step.key]
          const isAIFilled = intakeAnalyzed && AI_FILLED_STEPS.includes(step.key)

          return (
            <div key={step.key} className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => onStep(step.key)}
                className={[
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all relative',
                  isActive
                    ? 'bg-accent text-black shadow-[0_2px_8px_rgba(240,165,0,0.25)]'
                    : 'text-ink-secondary hover:bg-raised hover:text-ink-primary',
                ].join(' ')}
              >
                {step.iconPath && (
                  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={step.iconPath} />
                  </svg>
                )}
                <span>{step.label}</span>
                {isDone && !isActive && <Check className="w-3 h-3 text-ok flex-shrink-0" />}
                {isAIFilled && !isActive && <Zap className="w-3 h-3 text-accent/70 flex-shrink-0" />}
              </button>
              {i < steps.length - 1 && (
                <span className="text-white/10 text-xs flex-shrink-0">›</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
