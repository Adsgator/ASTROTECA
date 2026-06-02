import { useState, type ReactNode } from 'react'
import AdminForm from './AdminForm'
import ExtractForm from './ExtractForm'
import RemoveForm from './RemoveForm'
import { PlusCircle, ExternalLink, Trash2 } from 'lucide-react'

type Tab = 'adicionar' | 'extrair' | 'remover'

const tabs: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: 'adicionar', label: 'Adicionar', icon: <PlusCircle className="w-4 h-4" /> },
  { id: 'extrair',  label: 'Extrair',   icon: <ExternalLink className="w-4 h-4" /> },
  { id: 'remover',  label: 'Remover',   icon: <Trash2 className="w-4 h-4" /> },
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
