import { useState } from 'react'
import AdminForm from './AdminForm'
import ExtractForm from './ExtractForm'
import RemoveForm from './RemoveForm'

type Tab = 'adicionar' | 'extrair' | 'remover'

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'adicionar',
    label: 'Adicionar',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v8M8 12h8"/>
      </svg>
    ),
  },
  {
    id: 'extrair',
    label: 'Extrair',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/>
        <path d="M15 3h6v6"/>
        <path d="M10 14L21 3"/>
      </svg>
    ),
  },
  {
    id: 'remover',
    label: 'Remover',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
        <path d="M10 11v6M14 11v6"/>
      </svg>
    ),
  },
]

interface Props {
  initialTab?: Tab
}

export default function AdminPanel({ initialTab = 'adicionar' }: Props) {
  const [active, setActive] = useState<Tab>(initialTab)

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-raised/50 border border-white/[0.05] w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              active === tab.id
                ? 'bg-surface text-ink-primary shadow-sm border border-white/[0.08]'
                : 'text-ink-muted hover:text-ink-secondary'
            } ${tab.id === 'remover' && active === tab.id ? 'text-fail' : ''}`}
          >
            <span className={active === tab.id && tab.id === 'remover' ? 'text-fail' : ''}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="animate-scale-in" key={active}>
        {active === 'adicionar' && <AdminForm />}
        {active === 'extrair'   && <ExtractForm />}
        {active === 'remover'   && <RemoveForm />}
      </div>
    </div>
  )
}
