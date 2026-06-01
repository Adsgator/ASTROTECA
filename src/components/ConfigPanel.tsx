import { useState, useEffect } from 'react'
import type { AppSettingsV2 } from '../types'
import { validateGithubToken } from '../lib/github'
import { callGemini } from '../lib/gemini'
import { getProjects, exportAllData, importAllData } from '../lib/projects'
import * as ui from '../styles/ui'
import Dialog from './builder/Dialog'
import SelectField from './builder/SelectField'

const DEFAULT_SETTINGS: AppSettingsV2 = {
  githubToken: '',
  githubOwner: '',
  componentsRepo: 'minha-lib-astro',
  baseProjectRepo: '_base-project',
  previewBaseUrl: '',
  registryUrl: '',
  studioName: 'Astroteca Studio',
  manifestTemplate: '',
  defaultFontHeading: 'Inter',
  defaultFontBody: 'Inter',
  defaultColorPrimary: '#6366f1',
  defaultCtaLabel: 'Saiba mais',
  npmNamespace: '@astroteca',
  userName: '',
  userEmail: '',
  geminiApiKey: '',
  geminiModel: 'gemini-2.5-flash',
}

export default function ConfigPanel() {
  const [settings, setSettings] = useState<AppSettingsV2>(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)
  const [validating, setValidating] = useState(false)
  const [tokenError, setTokenError] = useState('')
  const [tokenUser, setTokenUser] = useState<string | null>(null)
  const [testingGemini, setTestingGemini] = useState(false)
  const [geminiStatus, setGeminiStatus] = useState<{ ok: boolean; msg: string } | null>(null)
  const [importError, setImportError] = useState('')
  const [alertDialog, setAlertDialog] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('acs-settings')
    if (saved) {
      setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) })
    }
  }, [])

  function update<K extends keyof AppSettingsV2>(key: K, value: AppSettingsV2[K]) {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function handleSave() {
    localStorage.setItem('acs-settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleTestGemini() {
    setTestingGemini(true)
    setGeminiStatus(null)
    try {
      const result = await callGemini({
        apiKey: settings.geminiApiKey,
        model: settings.geminiModel,
        systemPrompt: 'You are a helpful assistant.',
        userPrompt: 'Respond with exactly: OK',
      })
      setGeminiStatus({ ok: true, msg: result.trim().slice(0, 80) })
    } catch (e) {
      setGeminiStatus({ ok: false, msg: e instanceof Error ? e.message : 'Erro desconhecido' })
    } finally {
      setTestingGemini(false)
    }
  }

  function handleExport() {
    const data = exportAllData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `astroteca-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const json = JSON.parse(ev.target?.result as string)
        importAllData(json)
        setImportError('')
        setAlertDialog('Backup importado com sucesso! Recarregue a página.')
      } catch {
        setImportError('Arquivo inválido ou corrompido')
      }
    }
    reader.readAsText(file)
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

  function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-ink-secondary uppercase tracking-wider">{label}</label>
        {children}
      </div>
    )
  }

  return (
    <div className="max-w-3xl flex flex-col gap-4 stagger">
      {alertDialog && (
        <Dialog
          open
          title="Backup importado"
          message={alertDialog}
          onConfirm={() => setAlertDialog(null)}
        />
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Configuracoes</h1>
        <button onClick={handleSave} className={`${saved ? ui.btnSuccess : ui.btnPrimary} ${saved ? 'animate-scale-in' : ''}`}>
          {saved ? 'Salvo!' : 'Salvar'}
        </button>
      </div>

      {(!settings.githubToken || !settings.githubOwner || !settings.registryUrl) && (
        <div className={`${ui.cardBase} p-4 bg-amber-50/10 border-l-2 border-amber-500`}>
          <div className="text-sm text-amber-700 font-medium flex items-center gap-1.5">
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Configuração incompleta
            </div>
          <div className="text-xs text-amber-600 mt-1">
            Você precisa configurar: {[
              !settings.githubToken && 'Token',
              !settings.githubOwner && 'Owner',
              !settings.registryUrl && 'URL do Registry'
            ].filter(Boolean).join(', ')}. Sem isso, os botões de publicar e criar projetos não funcionarão.
          </div>
        </div>
      )}

      <div className={`${ui.cardBase} p-5`}>
        <h2 className="text-lg font-semibold mb-1">GitHub</h2>
        <p className="text-xs text-ink-muted mb-4">Necessário para criar repositórios de clientes e sincronizar a biblioteca de componentes.</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Field label="Token de Acesso (Classic)">
              <input
                className={ui.inputBase}
                type="password"
                value={settings.githubToken}
                onChange={e => {
                  update('githubToken', e.target.value)
                  setTokenUser(null)
                  setTokenError('')
                }}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              />
            </Field>
            <div className="flex items-center gap-3 mt-1.5 mb-2">
              <a
                href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=Astroteca+Studio"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent hover:underline"
              >
                Criar token no GitHub →
              </a>
              <span className="text-[10px] text-ink-muted">Permissões necessárias: <code className="bg-raised px-1 rounded">repo</code> e <code className="bg-raised px-1 rounded">workflow</code></span>
            </div>
            <div className="flex gap-2">
              <button
                className={`${ui.btnOutline} py-1 px-3 text-xs`}
                onClick={handleValidateToken}
                disabled={validating || !settings.githubToken}
                title={!settings.githubToken ? 'Digite um token antes de validar' : 'Verificar se o token é válido'}
              >
                {validating ? 'Validando...' : 'Validar Token'}
              </button>
              {tokenUser && (
                <span className={`${ui.badgeBase} bg-ok/10 text-ok border border-ok/20 animate-scale-in flex items-center gap-1`}>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>{tokenUser}
                </span>
              )}
              {tokenError && (
                <span className={`${ui.badgeBase} bg-fail/10 text-fail border border-fail/20 animate-scale-in flex items-center gap-1`}>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>{tokenError}
                </span>
              )}
            </div>
          </div>
          <Field label="Owner (usuario ou org)">
            <input
              className={ui.inputBase}
              value={settings.githubOwner}
              onChange={e => update('githubOwner', e.target.value)}
              placeholder="seuusuario"
            />
          </Field>
          <div>
            <Field label="Repo de Componentes">
              <input
                className={ui.inputBase}
                value={settings.componentsRepo}
                onChange={e => update('componentsRepo', e.target.value)}
                placeholder="minha-lib-astro"
              />
            </Field>
            <p className="text-[10px] text-ink-muted mt-1">Biblioteca de componentes Astro (ex: minha-lib-astro). Os componentes são copiados daqui para o projeto do cliente.</p>
          </div>
          <div>
            <Field label="Repo Base (template)">
              <input
                className={ui.inputBase}
                value={settings.baseProjectRepo}
                onChange={e => update('baseProjectRepo', e.target.value)}
                placeholder="_base-project"
              />
            </Field>
            <p className="text-[10px] text-ink-muted mt-1">Template clonado a cada novo projeto de cliente (ex: _base-project). Contém BaseLayout, tokens, páginas legais.</p>
          </div>
          <div className="col-span-2">
            <Field label="URL do Registry">
              <input
                className={ui.inputBase}
                value={settings.registryUrl}
                onChange={e => update('registryUrl', e.target.value)}
                placeholder="https://raw.githubusercontent.com/owner/minha-lib-astro/main/registry.json"
              />
            </Field>
            <p className="text-[10px] text-ink-muted mt-1">
              URL raw do GitHub para o <code className="bg-raised px-0.5 rounded">registry.json</code> da biblioteca. Formato:{' '}
              <code className="bg-raised px-0.5 rounded">https://raw.githubusercontent.com/[owner]/[repo]/main/registry.json</code>
            </p>
          </div>
        </div>
      </div>

      <div className={`${ui.cardBase} p-5`}>
        <h2 className="text-lg font-semibold mb-4">Inteligência Artificial</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Field label="Chave da API Gemini">
              <input
                className={ui.inputBase}
                type="password"
                value={settings.geminiApiKey}
                onChange={e => update('geminiApiKey', e.target.value)}
                placeholder="AIza..."
              />
            </Field>
            <div className="flex items-center gap-2 mt-1">
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent hover:underline"
              >
                Obter chave no Google AI Studio →
              </a>
            </div>
          </div>
          <Field label="Modelo">
            <SelectField
              value={settings.geminiModel}
              onChange={v => update('geminiModel', v as AppSettingsV2['geminiModel'])}
              options={[
                { value: 'gemini-2.5-flash', label: 'Flash (recomendado)' },
                { value: 'gemini-2.5-flash-lite', label: 'Flash Lite (fallback)' },
                { value: 'gemini-2.5-pro', label: 'Pro (mais lento, mais preciso)' },
              ]}
            />
          </Field>
          <div className="flex flex-col justify-end">
            <button
              className={`${ui.btnOutline} py-1 px-3 text-xs`}
              onClick={handleTestGemini}
              disabled={testingGemini || !settings.geminiApiKey}
              title={!settings.geminiApiKey ? 'Digite a chave antes de testar' : 'Testar conexão com o Gemini'}
            >
              {testingGemini ? 'Testando...' : 'Testar conexão'}
            </button>
            {geminiStatus && (
              <span className={`mt-1 text-xs flex items-center gap-1 ${geminiStatus.ok ? 'text-ok' : 'text-fail'}`}>
                {geminiStatus.ok
                  ? <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  : <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                }
                {geminiStatus.msg}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={`${ui.cardBase} p-5`}>
        <h2 className="text-lg font-semibold mb-4">Padroes</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fonte dos Titulos">
            <input
              className={ui.inputBase}
              value={settings.defaultFontHeading}
              onChange={e => update('defaultFontHeading', e.target.value)}
              placeholder="Inter"
            />
          </Field>
          <Field label="Fonte do Corpo">
            <input
              className={ui.inputBase}
              value={settings.defaultFontBody}
              onChange={e => update('defaultFontBody', e.target.value)}
              placeholder="Inter"
            />
          </Field>
          <Field label="Cor Primaria Padrao">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.defaultColorPrimary}
                onChange={e => update('defaultColorPrimary', e.target.value)}
                className="w-10 h-10 rounded-lg border border-border bg-transparent cursor-pointer p-0.5 hover-scale"
              />
              <input
                type="text"
                className={ui.inputBase}
                value={settings.defaultColorPrimary}
                onChange={e => update('defaultColorPrimary', e.target.value)}
                placeholder="#6366f1"
              />
            </div>
          </Field>
        </div>
      </div>

      <div className={`${ui.cardBase} p-5`}>
        <h2 className="text-lg font-semibold mb-4">Studio</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nome do Studio">
            <input
              className={ui.inputBase}
              value={settings.studioName}
              onChange={e => update('studioName', e.target.value)}
              placeholder="Astroteca Studio"
            />
          </Field>
          <Field label="Namespace NPM">
            <input
              className={ui.inputBase}
              value={settings.npmNamespace}
              onChange={e => update('npmNamespace', e.target.value)}
              placeholder="@astroteca"
            />
          </Field>
        </div>
      </div>

      <div className={`${ui.cardBase} p-5`}>
        <h2 className="text-lg font-semibold mb-4">Usuario Git</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nome">
            <input
              className={ui.inputBase}
              value={settings.userName}
              onChange={e => update('userName', e.target.value)}
              placeholder="Seu Nome"
            />
          </Field>
          <Field label="Email">
            <input
              className={ui.inputBase}
              type="email"
              value={settings.userEmail}
              onChange={e => update('userEmail', e.target.value)}
              placeholder="seu@email.com"
            />
          </Field>
        </div>
      </div>

      <div className={`${ui.cardBase} p-5`}>
        <h2 className="text-lg font-semibold mb-4">Template do Manifesto</h2>
        <textarea
          className={`${ui.inputBase} min-h-[200px] font-mono text-sm resize-y`}
          value={settings.manifestTemplate}
          onChange={e => update('manifestTemplate', e.target.value)}
          placeholder="# {{PROJECT_NAME}}\n\n## Art Direction\n..."
          rows={10}
        />
      </div>
      <div className={`${ui.cardBase} p-5`}>
        <h2 className="text-lg font-semibold mb-4">Dados</h2>
        <p className="text-xs text-ink-secondary mb-3">
          {getProjects().length} projeto{getProjects().length !== 1 ? 's' : ''} salvos
        </p>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleExport} className={`${ui.btnOutline} text-xs flex items-center gap-1.5`}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Exportar Backup
          </button>
          <label className={`${ui.btnOutline} text-xs cursor-pointer flex items-center gap-1.5`}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Importar Backup
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
        </div>
        {importError && <p className="text-xs text-fail mt-2">{importError}</p>}
      </div>
    </div>
  )
}
