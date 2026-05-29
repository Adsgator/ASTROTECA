import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const initial = stored
      || document.documentElement.dataset.defaultTheme
      || 'light'
    setTheme(initial as 'light' | 'dark')
  }, [])

  function toggle() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('theme', next)
    if (next === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
      title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '1.5rem',
        zIndex: 50,
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        background: 'rgba(128,128,128,0.15)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(128,128,128,0.2)',
        cursor: 'pointer',
        fontSize: '1.1rem',
        transition: 'background 0.2s, transform 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(128,128,128,0.25)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(128,128,128,0.15)')}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}
