// src/components/builder/Toast.tsx

import { createContext, useContext, useState, useCallback } from 'react'
import { cn } from '../../lib/utils'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration: number
}

interface ToastContextValue {
  toast: (message: string, type?: Toast['type'], duration?: number) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: Toast['type'] = 'info', duration = 3000) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev.slice(-2), { id, message, type, duration }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto animate-slide-right',
              'bg-surface/95 backdrop-blur-lg border rounded-xl px-4 py-3 shadow-float',
              'flex items-center gap-2.5 text-sm',
              t.type === 'success' && 'border-ok/40 text-ok',
              t.type === 'error' && 'border-fail/40 text-fail',
              t.type === 'info' && 'border-accent/40 text-accent',
            )}
          >
            {t.type === 'success' && (
              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            )}
            {t.type === 'error' && (
              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            )}
            {t.type === 'info' && (
              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            )}
            <span className="text-ink-primary text-xs">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
