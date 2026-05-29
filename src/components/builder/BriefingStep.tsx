// src/components/builder/BriefingStep.tsx

import { useState } from 'react'
import type { Briefing, AppSettingsV2 } from '../../types'
import { callGemini } from '../../lib/gemini'
import { buildIntakePrompt, applyIntakeResult } from '../../lib/intake-prompt'
import * as ui from '../../styles/ui'
import { cn } from '../../lib/utils'

interface BriefingStepProps {
  briefing: Briefing
  onChange: (briefing: Briefing) => void
  settings: AppSettingsV2
  filledByAI: string[]
  onFilledByAI: (fields: string[]) => void
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="block text-xs font-medium text-ink-secondary uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

function Input({ field, briefing, onChange, filledByAI, placeholder, type = 'text' }: {
  field: keyof Briefing
  briefing: Briefing
  onChange: (b: Briefing) => void
  filledByAI: string[]
  placeholder?: string
  type?: string
}) {
  const isAI = filledByAI.includes(field as string)
  return (
    <input
      type={type}
      value={String(briefing[field] ?? '')}
      onChange={e => onChange({ ...briefing, [field]: e.target.value })}
      placeholder={placeholder}
      className={cn(ui.inputBase, isAI && 'border-accent/50')}
    />
  )
}

function Textarea({ field, briefing, onChange, filledByAI, placeholder, rows = 3 }: {
  field: keyof Briefing
  briefing: Briefing
  onChange: (b: Briefing) => void
  filledByAI: string[]
  placeholder?: string
  rows?: number
}) {
  const isAI = filledByAI.includes(field as string)
  return (
    <textarea
      value={String(briefing[field] ?? '')}
      onChange={e => onChange({ ...briefing, [field]: e.target.value })}
      placeholder={placeholder}
      rows={rows}
      className={cn(ui.inputBase, 'resize-none', isAI && 'border-accent/50')}
    />
  )
}

const TABS = ['Identidade & Contato', 'Serviço & Público', 'Autoridade & Prova', 'Visual & SEO'] as const

const BRIEFING_TEMPLATES = [
  {
    label: 'Médico', icon: '🩺',
    data: {
      nomeCliente: 'Dr. João Silva', nomeMarca: 'Dr. João Silva', segmento: 'Saúde',
      tipo: 'servico' as const, servicoPrincipal: 'Clínica Médica Geral',
      propostaValor: 'Atendimento humanizado com diagnóstico preciso e cuidado personalizado',
      publicoPrimario: 'Adultos entre 30-60 anos que buscam médico de confiança',
      publicoDor: 'Dificuldade em encontrar médico que realmente ouça e explique o diagnóstico',
      schemaTipo: 'MedicalBusiness',
    },
  },
  {
    label: 'Advogado', icon: '⚖️',
    data: {
      nomeCliente: 'Dr. Carlos Mendes', nomeMarca: 'Mendes Advocacia', segmento: 'Jurídico',
      tipo: 'servico' as const, servicoPrincipal: 'Advocacia Cível e Trabalhista',
      propostaValor: 'Defesa eficaz dos seus direitos com atendimento personalizado e transparente',
      schemaTipo: 'LegalService',
    },
  },
  {
    label: 'Dentista', icon: '🦷',
    data: {
      nomeCliente: 'Dra. Ana Costa', nomeMarca: 'Clínica Odonto Costa', segmento: 'Odontologia',
      tipo: 'servico' as const, servicoPrincipal: 'Odontologia Estética e Geral',
      propostaValor: 'Sorrisos bonitos e saúde bucal completa em ambiente acolhedor',
      schemaTipo: 'MedicalBusiness',
    },
  },
  {
    label: 'Estética', icon: '✨',
    data: {
      nomeCliente: 'Fernanda Lima', nomeMarca: 'Studio Bella', segmento: 'Beleza e Estética',
      tipo: 'servico' as const, servicoPrincipal: 'Estética Avançada e Tratamentos Corporais',
      propostaValor: 'Realce sua beleza natural com tratamentos exclusivos e resultados visíveis',
      schemaTipo: 'HealthAndBeautyBusiness',
    },
  },
  {
    label: 'Consultoria', icon: '📊',
    data: {
      nomeCliente: 'Ricardo Souza', nomeMarca: 'Souza Consultoria', segmento: 'Negócios',
      tipo: 'consultoria' as const, servicoPrincipal: 'Consultoria Empresarial e Estratégica',
      propostaValor: 'Transformamos dados em estratégias que geram resultado real',
      schemaTipo: 'ProfessionalService',
    },
  },
  {
    label: 'Restaurante', icon: '🍽️',
    data: {
      nomeCliente: 'Família Rossi', nomeMarca: 'Trattoria Rossi', segmento: 'Alimentação',
      tipo: 'servico' as const, servicoPrincipal: 'Culinária Italiana Artesanal',
      propostaValor: 'A autêntica cozinha italiana da nonna no coração da cidade',
      schemaTipo: 'FoodEstablishment',
    },
  },
]

export default function BriefingStep({ briefing, onChange, settings, filledByAI, onFilledByAI }: BriefingStepProps) {
  const [tab, setTab] = useState(0)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')

  async function handleAnalyze() {
    if (!settings.geminiApiKey || !briefing.briefingBruto.trim()) return
    setAnalyzing(true)
    setError('')
    try {
      const { system, user } = buildIntakePrompt(briefing.briefingBruto)
      const response = await callGemini({
        apiKey: settings.geminiApiKey,
        model: settings.geminiModel ?? 'gemini-2.5-flash',
        systemPrompt: system,
        userPrompt: user,
      })
      const { briefing: updated, filledFields } = applyIntakeResult(briefing, response)
      onChange(updated)
      onFilledByAI(filledFields)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao analisar briefing')
    } finally {
      setAnalyzing(false)
    }
  }

  function applyTemplate(data: Partial<Briefing>) {
    if (Object.values(briefing).some(v => v && v !== false && v !== 'servico' && v !== 'LocalBusiness')) {
      if (!confirm('Substituir dados atuais pelo template?')) return
    }
    onChange({ ...briefing, ...data })
  }

  const p = { briefing, onChange, filledByAI }

  return (
    <div className="space-y-4">
      {/* Área de briefing bruto */}
      <div className={ui.cardBase + ' p-4 space-y-3'}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-1.5">
              Briefing Bruto
            </label>
            <textarea
              value={briefing.briefingBruto}
              onChange={e => onChange({ ...briefing, briefingBruto: e.target.value })}
              placeholder="Cole aqui o briefing do cliente — texto livre, e-mail, WhatsApp, PDF transcrito, qualquer formato. A IA vai extrair as informações automaticamente."
              rows={5}
              className={cn(ui.inputBase, 'resize-none')}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {settings.geminiApiKey ? (
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !briefing.briefingBruto.trim()}
              className={ui.btnPrimary + ' text-xs'}
            >
              {analyzing ? '⏳ Analisando...' : '✨ Analisar com Gemini'}
            </button>
          ) : (
            <p className="text-xs text-ink-secondary">
              Configure a chave Gemini em{' '}
              <a href="/config" className="text-accent hover:underline">Configurações →</a>
            </p>
          )}

          {filledByAI.length > 0 && (
            <span className="text-xs text-ok">
              ✓ {filledByAI.length} campos preenchidos pela IA
            </span>
          )}
        </div>

        {analyzing && (
          <div className="space-y-2 animate-pulse">
            <div className="h-2.5 bg-raised rounded w-3/4" />
            <div className="h-2.5 bg-raised rounded w-1/2" />
            <div className="h-2.5 bg-raised rounded w-2/3" />
            <p className="text-xs text-ink-secondary mt-1">
              Analisando com {settings.geminiModel ?? 'gemini-2.5-flash'}...
            </p>
          </div>
        )}

        {error && (
          <p className="text-xs text-fail bg-fail/10 rounded-lg px-3 py-2">{error}</p>
        )}
      </div>

      {/* Templates de nicho */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
        {BRIEFING_TEMPLATES.map(t => (
          <button
            key={t.label}
            onClick={() => applyTemplate(t.data)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-ink-secondary bg-raised hover:text-ink-primary hover:bg-surface transition-colors border border-transparent hover:border-white/10"
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
        <button
          onClick={() => { if (confirm('Limpar todos os dados?')) onChange({ ...briefing, briefingBruto: '' } as Briefing) }}
          className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs text-ink-muted hover:text-fail transition-colors"
        >
          Limpar
        </button>
      </div>

      {/* Abas */}
      <div className="flex gap-1 bg-raised/50 rounded-lg p-1 border border-white/5">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={cn(
              'flex-1 px-2 py-1.5 rounded-md text-xs font-semibold transition-all',
              tab === i ? ui.tabActive : ui.tabInactive
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab 1: Identidade & Contato */}
      {tab === 0 && (
        <div className={ui.cardBase + ' p-4'}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nome do Cliente">
              <Input field="nomeCliente" placeholder="Dr. João Silva" {...p} />
            </Field>
            <Field label="Nome da Marca">
              <Input field="nomeMarca" placeholder="Clínica Saúde Plena" {...p} />
            </Field>
            <Field label="Segmento">
              <Input field="segmento" placeholder="Saúde, Beleza, Advocacia..." {...p} />
            </Field>
            <Field label="Tipo de Negócio">
              <select
                value={briefing.tipo}
                onChange={e => onChange({ ...briefing, tipo: e.target.value as Briefing['tipo'] })}
                className={ui.selectBase}
              >
                <option value="servico">Serviço</option>
                <option value="mentoria">Mentoria</option>
                <option value="consultoria">Consultoria</option>
                <option value="produto">Produto</option>
                <option value="saas">SaaS</option>
                <option value="curso">Curso</option>
              </select>
            </Field>
            <Field label="Proposta de Valor" className="col-span-2">
              <Textarea field="propostaValor" placeholder="O que você faz e para quem, em 1-2 frases" {...p} rows={2} />
            </Field>
            <Field label="Domínio">
              <Input field="dominio" placeholder="clinica.com.br" {...p} />
            </Field>
            <Field label="WhatsApp">
              <Input field="whatsapp" placeholder="5511999999999" {...p} />
            </Field>
            <Field label="Email">
              <Input field="email" type="email" placeholder="contato@clinica.com.br" {...p} />
            </Field>
            <Field label="Horários de Atendimento">
              <Input field="horarios" placeholder="Seg-Sex 8h-18h" {...p} />
            </Field>
            <Field label="Mensagem WhatsApp" className="col-span-2">
              <Input field="whatsappMensagem" placeholder="Olá! Vim pelo site..." {...p} />
            </Field>
            <Field label="Objetivo de Conversão">
              <Input field="objetivoConversao" placeholder="Agendar consulta" {...p} />
            </Field>
            <Field label="GTM ID">
              <Input field="gtmId" placeholder="GTM-XXXXXXX" {...p} />
            </Field>
            <Field label="Instagram">
              <Input field="instagram" placeholder="@handle" {...p} />
            </Field>
            <Field label="TikTok">
              <Input field="tiktok" placeholder="@handle" {...p} />
            </Field>
            <Field label="YouTube">
              <Input field="youtube" placeholder="URL do canal" {...p} />
            </Field>
            <Field label="Facebook">
              <Input field="facebook" placeholder="URL da página" {...p} />
            </Field>
            <Field label="Google Business (URL)">
              <Input field="googleBusiness" placeholder="URL do perfil Google" {...p} />
            </Field>
            <Field label="Nota Google">
              <Input field="googleNota" placeholder="4.9" {...p} />
            </Field>
            <Field label="Qtd. Avaliações Google">
              <Input field="googleQtd" placeholder="127" {...p} />
            </Field>
            <Field label="Anos de Experiência">
              <Input field="anosExperiencia" placeholder="15" {...p} />
            </Field>
            <Field label="Formação">
              <Input field="formacao" placeholder="Medicina pela USP" {...p} />
            </Field>
            <Field label="Certificações" className="col-span-2">
              <Input field="certificacoes" placeholder="CRM 123456, pós em cardiologia..." {...p} />
            </Field>
          </div>
        </div>
      )}

      {/* Tab 2: Serviço & Público */}
      {tab === 1 && (
        <div className={ui.cardBase + ' p-4'}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Serviço Principal" className="col-span-2">
              <Input field="servicoPrincipal" placeholder="Consulta médica, tratamento de pele..." {...p} />
            </Field>
            <Field label="Descrição dos Serviços" className="col-span-2">
              <Textarea field="servicosDescricao" placeholder="Liste todos os serviços oferecidos" {...p} rows={4} />
            </Field>
            <Field label="Como Funciona" className="col-span-2">
              <Textarea field="comoFunciona" placeholder="Passo a passo do processo/atendimento" {...p} rows={3} />
            </Field>
            <Field label="Resultado Esperado">
              <Input field="resultadoEsperado" placeholder="Qual o resultado que o cliente obtém?" {...p} />
            </Field>
            <Field label="Prazo para o Resultado">
              <Input field="prazoResultado" placeholder="Em quanto tempo?" {...p} />
            </Field>

            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={briefing.precoExibir}
                  onChange={e => onChange({ ...briefing, precoExibir: e.target.checked })}
                  className="w-4 h-4 accent-accent"
                />
                <span className="text-sm text-ink-primary">Exibir preços na landing page</span>
              </label>
            </div>

            {briefing.precoExibir && (
              <>
                <Field label="Plano 1 — Nome">
                  <Input field="precoPlano1Nome" placeholder="Básico" {...p} />
                </Field>
                <Field label="Plano 1 — Valor">
                  <Input field="precoPlano1Valor" placeholder="R$ 297/mês" {...p} />
                </Field>
                <Field label="Plano 1 — Descrição" className="col-span-2">
                  <Textarea field="precoPlano1Descricao" placeholder="O que está incluso" {...p} rows={2} />
                </Field>
                <Field label="Plano 2 — Nome">
                  <Input field="precoPlano2Nome" placeholder="Premium" {...p} />
                </Field>
                <Field label="Plano 2 — Valor">
                  <Input field="precoPlano2Valor" placeholder="R$ 597/mês" {...p} />
                </Field>
                <Field label="Plano 2 — Descrição" className="col-span-2">
                  <Textarea field="precoPlano2Descricao" placeholder="O que está incluso" {...p} rows={2} />
                </Field>
                <Field label="Formas de Pagamento" className="col-span-2">
                  <Input field="formaPagamento" placeholder="PIX, cartão, boleto" {...p} />
                </Field>
              </>
            )}

            <Field label="Público Primário" className="col-span-2">
              <Input field="publicoPrimario" placeholder="Quem é o cliente ideal?" {...p} />
            </Field>
            <Field label="Dor do Público" className="col-span-2">
              <Textarea field="publicoDor" placeholder="Qual problema principal o público enfrenta?" {...p} rows={2} />
            </Field>
            <Field label="Resultado que o Público Quer" className="col-span-2">
              <Textarea field="publicoResultado" placeholder="O que o público deseja alcançar?" {...p} rows={2} />
            </Field>
            <Field label="Avatar — Nome">
              <Input field="avatarNome" placeholder="Maria, 38 anos" {...p} />
            </Field>
            <Field label="Avatar — Idade">
              <Input field="avatarIdade" placeholder="38" {...p} />
            </Field>
            <Field label="Avatar — Profissão">
              <Input field="avatarProfissao" placeholder="Professora" {...p} />
            </Field>
            <div />
            <Field label="Objeções Principais" className="col-span-2">
              <Textarea field="objecoes" placeholder="É caro demais / Não tenho tempo / Já tentei de tudo..." {...p} rows={3} />
            </Field>
          </div>
        </div>
      )}

      {/* Tab 3: Autoridade & Prova */}
      {tab === 2 && (
        <div className={ui.cardBase + ' p-4'}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Diferencial" className="col-span-2">
              <Textarea field="diferencial" placeholder="O que te diferencia da concorrência?" {...p} rows={3} />
            </Field>
            <Field label="Frase de Impacto" className="col-span-2">
              <Input field="fraseImpacto" placeholder="Uma frase poderosa que resume teu posicionamento" {...p} />
            </Field>
            <Field label="História / Sobre" className="col-span-2">
              <Textarea field="historia" placeholder="Trajetória, motivação, por que faz o que faz..." {...p} rows={5} />
            </Field>

            <div className="col-span-2 border-t border-white/[0.06] pt-3 mt-1">
              <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-3">Depoimentos</p>
              <div className="space-y-4">
                {[1, 2, 3].map(n => (
                  <div key={n} className="grid grid-cols-2 gap-2 p-3 bg-raised/30 rounded-lg">
                    <Field label={`Depoimento ${n} — Nome`}>
                      <Input field={`depoimento${n}Nome` as keyof Briefing} placeholder="Nome do cliente" {...p} />
                    </Field>
                    <Field label="Resultado alcançado">
                      <Input field={`depoimento${n}Resultado` as keyof Briefing} placeholder="Perdeu 8kg em 2 meses" {...p} />
                    </Field>
                    <Field label="Texto do depoimento" className="col-span-2">
                      <Textarea field={`depoimento${n}Texto` as keyof Briefing} placeholder="O que o cliente disse..." {...p} rows={2} />
                    </Field>
                  </div>
                ))}
              </div>
            </div>

            <Field label="FAQ" className="col-span-2">
              <Textarea
                field="faq"
                placeholder="Liste as perguntas frequentes. Ex:&#10;P: Qual o prazo de retorno?&#10;R: Normalmente 2-3 dias úteis."
                {...p}
                rows={6}
              />
            </Field>
          </div>
        </div>
      )}

      {/* Tab 4: Visual & SEO */}
      {tab === 3 && (
        <div className={ui.cardBase + ' p-4'}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Estilo Visual Desejado" className="col-span-2">
              <Textarea field="estiloDesejado" placeholder="Minimalista, clean, moderno / Luxuoso, premium / Jovem, vibrante..." {...p} rows={2} />
            </Field>
            <Field label="Sensação do Visitante" className="col-span-2">
              <Textarea field="sensacaoVisitante" placeholder="Como o visitante deve se sentir ao acessar o site?" {...p} rows={2} />
            </Field>
            <Field label="Tom de Comunicação">
              <Input field="tomComunicacao" placeholder="Formal, técnico / Próximo, amigável" {...p} />
            </Field>
            <Field label="Restrições / O que Evitar">
              <Input field="restricoes" placeholder="Sem roxo, sem Comic Sans..." {...p} />
            </Field>
            <Field label="SEO — Título" className="col-span-2">
              <Input field="seoTitulo" placeholder="Clínica Médica em São Paulo | Dr. João Silva" {...p} />
            </Field>
            <Field label="SEO — Descrição" className="col-span-2">
              <Textarea field="seoDescricao" placeholder="Meta description de até 160 caracteres" {...p} rows={2} />
            </Field>
            <Field label="SEO — Keywords" className="col-span-2">
              <Input field="seoKeywords" placeholder="médico, consulta, clínica, são paulo" {...p} />
            </Field>
            <Field label="Schema.org — Tipo">
              <select
                value={briefing.schemaTipo}
                onChange={e => onChange({ ...briefing, schemaTipo: e.target.value })}
                className={ui.selectBase}
              >
                <option value="LocalBusiness">LocalBusiness (padrão)</option>
                <option value="MedicalBusiness">MedicalBusiness</option>
                <option value="LegalService">LegalService</option>
                <option value="HealthAndBeautyBusiness">HealthAndBeautyBusiness</option>
                <option value="FoodEstablishment">FoodEstablishment</option>
                <option value="ProfessionalService">ProfessionalService</option>
              </select>
            </Field>
          </div>
        </div>
      )}
    </div>
  )
}
