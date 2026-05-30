// src/components/builder/StepNav.tsx

import type { BuilderStep } from '../../types'

interface StepNavProps {
  steps: { key: BuilderStep; label: string; iconPath?: string }[]
  current: BuilderStep
  validation: Record<BuilderStep, boolean>
  onStep: (step: BuilderStep) => void
}

export default function StepNav({ steps, current, validation, onStep }: StepNavProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-0.5">
      {steps.map((step, i) => {
        const isActive = step.key === current
        const isDone = validation[step.key]

        return (
          <div key={step.key} className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onStep(step.key)}
              className={[
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all',
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
              {isDone && !isActive && (
                <svg className="w-3 h-3 text-ok flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
            {i < steps.length - 1 && (
              <span className="text-white/10 text-xs flex-shrink-0">›</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
