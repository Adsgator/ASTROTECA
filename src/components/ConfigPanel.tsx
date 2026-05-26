import { useState, useEffect } from 'react'
import type { AppSettings } from '../types'
import { validateGithubToken } from '../lib/github'
import { DEFAULT_TEMPLATE } from '../lib/manifest'

type Section = 'github' | 'defaults' | 'template' | 'about'

const SECTIONS: { key: Section; label: string }[] = [
  { key: 'github', label: 'GitHub' },
  { key: 'defaults', label: 'Padroes' },
  { key: 'template', label: 'Template do Manifesto' },
  { key: 'about', label: 'Sobre' },
]

const EMPTY_SETTINGS: AppSettings = {
  githubToken: '',
  githubOwner: '',
  componentsRepo: 'astro-components',
  baseProjectRepo: '_base-project',
  registryUrl: '',
  previewBaseUrl: '',
  defaultFontHeading: 'Inter',
  defaultFontBody: 'Inter',
  defaultColorPrimary: '#6366f1',
  defaultCtaLabel: 'Comecar agora',
  manifestTemplate: DEFAULT_TEMPLATE,
  yourName: '',
  studioName: '',
  npmNamespace: '',
}

export default function ConfigPanel() {
  const [section, setSection] = useState<Section>('github')
  const [settings, setSettings] = useState<AppSettings>(EMPTY_SETTINGS)
  const [showToken, setShowToken] = useState(false)
  const [validating, setValidating] = useState(false)
  const [tokenUser, setTokenUser] = useState<string | null>(null)
  const [tokenError, setTokenError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem('acs-settings')
    if (raw) {
      const parsed = JSON.parse(raw)
      setSettings({ ...EMPTY_SETTINGS, ...parsed })
    }
  }, [])

  function update<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setSettings(prev => {
      const next = { ...prev, [key]: value }
      localStorage.setItem('acs-settings', JSON.stringify(next))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      return next
    })
  }

  async function handleValidateToken() {
    setValidating(true)
    setTokenError('')
    setTokenUser(null)
    try {
      const result = await validateGithubToken(settings.githubToken)
      if (result.valid) {
        setTokenUser(result.login || 'Autenticado')
      } else {
        setTokenError(result.error || 'Token invalido')
      }
    } catch (e) {
      setTokenError(e instanceof Error ? e.message : 'Erro ao validar')
    } finally {
      setValidating(false)
    }
  }

  function resetTemplate() {
    update('manifestTemplate', DEFAULT_TEMPLATE)
  }

  function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div className="field">
        <label className="label">{label}</label>
        {children}
      </div>
    )
  }

  return (
    <>
      <style>{`
        .config {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: var(--space-6);
          max-width: 900px;
        }

        .config__nav {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .config__content {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .config__title {
          font-size: var(--text-xl);
          font-weight: 700;
          margin-bottom: var(--space-2);
        }

        .config__row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
        }

        .config__full {
          grid-column: 1 / -1;
        }

        .config__token-row {
          display: flex;
          gap: var(--space-2);
          align-items: end;
        }

        .config__token-input {
          flex: 1;
        }

        .config__token-result {
          font-size: var(--text-sm);
          margin-top: var(--space-2);
        }

        .config__template-area {
          width: 100%;
          min-height: 400px;
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          resize: vertical;
        }

        .config__template-actions {
          display: flex;
          justify-content: flex-end;
        }

        .config__saved {
          font-size: var(--text-sm);
          color: var(--accent);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .config__saved--visible {
          opacity: 1;
        }

        .config__color-row {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .config__color-picker {
          width: 40px;
          height: 40px;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 2px;
          cursor: pointer;
          background: none;
        }

        .config__template-help {
          font-size: var(--text-xs);
          color: var(--muted);
          margin-bottom: var(--space-3);
        }
      `}</style>

      <div className="config">
        <nav className="config__nav">
          {SECTIONS.map(s => (
            <button
              key={s.key}
              className={`sidebar-link ${section === s.key ? 'active' : ''}`}
              onClick={() => setSection(s.key)}
            >
              {s.label}
            </button>
          ))}
          <div className={`config__saved ${saved ? 'config__saved--visible' : ''}`}>
            Salvo!
          </div>
        </nav>

        <div className="config__content">
          {/* --- GitHub --- */}
          {section === 'github' && (
            <div className="card">
              <h2 className="config__title">GitHub</h2>
              <div className="config__row">
                <div className="config__full">
                  <Field label="Token de acesso">
                    <div className="config__token-row">
                      <div className="config__token-input">
                        <input
                          className="input"
                          type={showToken ? 'text' : 'password'}
                          value={settings.githubToken}
                          onChange={e => update('githubToken', e.target.value)}
                          placeholder="ghp_..."
                        />
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setShowToken(!showToken)}
                      >
                        {showToken ? 'Ocultar' : 'Mostrar'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={handleValidateToken}
                        disabled={validating || !settings.githubToken}
                      >
                        {validating ? 'Validando...' : 'Validar'}
                      </button>
                    </div>
                    {tokenUser && (
                      <div className="config__token-result">
                        <span className="badge badge-ok">Conectado como {tokenUser}</span>
                      </div>
                    )}
                    {tokenError && (
                      <div className="config__token-result">
                        <span className="badge badge-fail">{tokenError}</span>
                      </div>
                    )}
                  </Field>
                </div>

                <Field label="Owner (usuario ou org)">
                  <input
                    className="input"
                    value={settings.githubOwner}
                    onChange={e => update('githubOwner', e.target.value)}
                    placeholder="seu-usuario"
                  />
                </Field>
                <Field label="Repo de componentes">
                  <input
                    className="input"
                    value={settings.componentsRepo}
                    onChange={e => update('componentsRepo', e.target.value)}
                    placeholder="astro-components"
                  />
                </Field>
                <Field label="Repo base do projeto">
                  <input
                    className="input"
                    value={settings.baseProjectRepo}
                    onChange={e => update('baseProjectRepo', e.target.value)}
                    placeholder="_base-project"
                  />
                </Field>
                <div className="config__full">
                  <Field label="URL do registry.json">
                    <input
                      className="input"
                      value={settings.registryUrl}
                      onChange={e => update('registryUrl', e.target.value)}
                      placeholder="https://raw.githubusercontent.com/..."
                    />
                  </Field>
                </div>
                <div className="config__full">
                  <Field label="Base URL dos previews">
                    <input
                      className="input"
                      value={settings.previewBaseUrl}
                      onChange={e => update('previewBaseUrl', e.target.value)}
                      placeholder="https://seu-usuario.github.io/astro-components"
                    />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* --- Padroes --- */}
          {section === 'defaults' && (
            <div className="card">
              <h2 className="config__title">Padroes</h2>
              <div className="config__row">
                <Field label="Fonte padrao (titulos)">
                  <input
                    className="input"
                    value={settings.defaultFontHeading}
                    onChange={e => update('defaultFontHeading', e.target.value)}
                    placeholder="Inter"
                  />
                </Field>
                <Field label="Fonte padrao (corpo)">
                  <input
                    className="input"
                    value={settings.defaultFontBody}
                    onChange={e => update('defaultFontBody', e.target.value)}
                    placeholder="Inter"
                  />
                </Field>
                <Field label="Cor primaria padrao">
                  <div className="config__color-row">
                    <input
                      type="color"
                      value={settings.defaultColorPrimary}
                      onChange={e => update('defaultColorPrimary', e.target.value)}
                      className="config__color-picker"
                    />
                    <input
                      className="input"
                      value={settings.defaultColorPrimary}
                      onChange={e => update('defaultColorPrimary', e.target.value)}
                      placeholder="#6366f1"
                    />
                  </div>
                </Field>
                <Field label="Label padrao do CTA">
                  <input
                    className="input"
                    value={settings.defaultCtaLabel}
                    onChange={e => update('defaultCtaLabel', e.target.value)}
                    placeholder="Comecar agora"
                  />
                </Field>
              </div>
            </div>
          )}

          {/* --- Template --- */}
          {section === 'template' && (
            <div className="card">
              <h2 className="config__title">Template do Manifesto</h2>
              <p className="config__template-help">
                Use {'{{variavel}}'} para interpolar valores. Variaveis disponiveis: clientName, date,
                projectType, niche, pageGoal, googleAnalyticsId, siteUrl, npmNamespace, repoName,
                colorPrimary, colorSecondary, colorBackground, colorText, fontHeading, fontBody,
                mood, references, notes, components, studioName.
              </p>
              <textarea
                className="input config__template-area"
                value={settings.manifestTemplate}
                onChange={e => update('manifestTemplate', e.target.value)}
              />
              <div className="config__template-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={resetTemplate}>
                  Restaurar Padrao
                </button>
              </div>
            </div>
          )}

          {/* --- Sobre --- */}
          {section === 'about' && (
            <div className="card">
              <h2 className="config__title">Sobre Voce</h2>
              <div className="config__row">
                <Field label="Seu nome">
                  <input
                    className="input"
                    value={settings.yourName}
                    onChange={e => update('yourName', e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </Field>
                <Field label="Nome do estudio">
                  <input
                    className="input"
                    value={settings.studioName}
                    onChange={e => update('studioName', e.target.value)}
                    placeholder="Meu Estudio"
                  />
                </Field>
                <Field label="Namespace npm">
                  <input
                    className="input"
                    value={settings.npmNamespace}
                    onChange={e => update('npmNamespace', e.target.value)}
                    placeholder="@meu-estudio"
                  />
                </Field>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
