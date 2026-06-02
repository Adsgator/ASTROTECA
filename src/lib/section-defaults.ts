// src/lib/section-defaults.ts

import type { Briefing, PageSection } from '../types'
import { slugify, generateId } from './utils'

export interface SectionTemplate {
  type: string
  label: string
  icon: string
  copyFields: string[]
  required: boolean
  condition?: (briefing: Briefing) => boolean
  hint?: string
}

export const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    type: 'header',
    label: 'Header',
    icon: 'header',
    copyFields: ['logoAlt', 'ctaTexto', 'ctaUrl'],
    required: true,
  },
  {
    type: 'hero',
    label: 'Hero',
    icon: 'hero',
    copyFields: ['titulo', 'subtitulo', 'ctaTexto', 'ctaUrl', 'ctaSecundarioTexto'],
    required: true,
  },
  {
    type: 'sobre',
    label: 'Sobre',
    icon: 'sobre',
    copyFields: ['titulo', 'texto', 'credenciais'],
    required: false,
  },
  {
    type: 'servicos',
    label: 'Serviços',
    icon: 'servicos',
    copyFields: ['titulo', 'subtitulo', 'servico1Titulo', 'servico1Texto', 'servico2Titulo', 'servico2Texto', 'servico3Titulo', 'servico3Texto'],
    required: false,
  },
  {
    type: 'como-funciona',
    label: 'Como Funciona',
    icon: 'como-funciona',
    copyFields: ['titulo', 'subtitulo', 'passo1', 'passo2', 'passo3'],
    required: false,
    condition: (b) => b.comoFunciona.trim().length > 0,
    hint: 'Habilitado quando "Como funciona" está preenchido no briefing',
  },
  {
    type: 'diferenciais',
    label: 'Diferenciais',
    icon: 'diferenciais',
    copyFields: ['titulo', 'subtitulo', 'diferencial1', 'diferencial2', 'diferencial3'],
    required: false,
    condition: (b) => b.diferencial.trim().length > 0,
    hint: 'Habilitado quando "Diferencial" está preenchido no briefing',
  },
  {
    type: 'depoimentos',
    label: 'Depoimentos',
    icon: 'depoimentos',
    copyFields: ['titulo', 'subtitulo'],
    required: false,
    condition: (b) => b.depoimento1Nome.trim().length > 0 && b.depoimento2Nome.trim().length > 0,
    hint: 'Habilitado quando ao menos 2 depoimentos estão preenchidos',
  },
  {
    type: 'google-reviews',
    label: 'Avaliações Google',
    icon: 'google-reviews',
    copyFields: ['titulo'],
    required: false,
    condition: (b) => b.googleNota.trim().length > 0,
    hint: 'Habilitado quando nota do Google está preenchida',
  },
  {
    type: 'precos',
    label: 'Preços',
    icon: 'precos',
    copyFields: ['titulo', 'subtitulo', 'ctaTexto'],
    required: false,
    condition: (b) => b.precoExibir === true,
    hint: 'Habilitado quando "Exibir preços" está marcado no briefing',
  },
  {
    type: 'faq',
    label: 'FAQ',
    icon: 'faq',
    copyFields: ['titulo', 'subtitulo'],
    required: false,
    condition: (b) => b.faq.trim().length > 0,
    hint: 'Habilitado quando FAQ está preenchido no briefing',
  },
  {
    type: 'instagram',
    label: 'Instagram Feed',
    icon: 'instagram',
    copyFields: ['titulo', 'ctaTexto'],
    required: false,
    condition: (b) => b.instagram.trim().length > 0,
    hint: 'Habilitado quando Instagram está preenchido no briefing',
  },
  {
    type: 'localizacao',
    label: 'Localização',
    icon: 'localizacao',
    copyFields: ['titulo', 'endereco'],
    required: false,
    condition: (b) => {
      return b.googleBusiness.trim().length > 0
    },
    hint: 'Habilitado quando Google Business está preenchido',
  },
  {
    type: 'cta',
    label: 'CTA Final',
    icon: 'cta',
    copyFields: ['titulo', 'subtitulo', 'ctaTexto', 'ctaUrl'],
    required: true,
  },
  {
    type: 'footer',
    label: 'Footer',
    icon: 'footer',
    copyFields: ['copyright', 'politicaUrl'],
    required: true,
  },
]

export function getAvailableSections(): SectionTemplate[] {
  return SECTION_TEMPLATES
}

export function createSectionFromTemplate(template: SectionTemplate, position: number): PageSection {
  return {
    id: `${template.type}-${generateId()}`,
    type: template.type,
    label: template.label,
    enabled: template.required,
    position,
    copy: Object.fromEntries(template.copyFields.map(f => [f, ''])),
    fromLibrary: false,
  }
}

export function prefillCopyFromBriefing(section: PageSection, briefing: Briefing): PageSection {
  const copy = { ...section.copy }

  switch (section.type) {
    case 'header':
      copy.logoAlt = briefing.nomeMarca || briefing.nomeCliente
      copy.ctaTexto = copy.ctaTexto || 'Fale Comigo'
      copy.ctaUrl = copy.ctaUrl || (briefing.whatsapp ? `https://wa.me/${briefing.whatsapp}` : '#contato')
      break

    case 'hero':
      copy.titulo = copy.titulo || briefing.fraseImpacto || briefing.propostaValor
      copy.subtitulo = copy.subtitulo || briefing.propostaValor
      copy.ctaTexto = copy.ctaTexto || briefing.objetivoConversao || 'Fale Comigo'
      copy.ctaUrl = copy.ctaUrl || (briefing.whatsapp ? `https://wa.me/${briefing.whatsapp}` : '#contato')
      break

    case 'sobre':
      copy.titulo = copy.titulo || `Sobre ${briefing.nomeMarca || briefing.nomeCliente}`
      copy.texto = copy.texto || briefing.historia
      copy.credenciais = copy.credenciais || [briefing.formacao, briefing.certificacoes].filter(Boolean).join(' | ')
      break

    case 'servicos':
      copy.titulo = copy.titulo || briefing.servicoPrincipal || 'Nossos Serviços'
      copy.subtitulo = copy.subtitulo || briefing.servicosDescricao
      copy.servico1Titulo = copy.servico1Titulo || briefing.servico1Titulo
      copy.servico1Texto = copy.servico1Texto || briefing.servico1Descricao
      copy.servico2Titulo = copy.servico2Titulo || briefing.servico2Titulo
      copy.servico2Texto = copy.servico2Texto || briefing.servico2Descricao
      copy.servico3Titulo = copy.servico3Titulo || briefing.servico3Titulo
      copy.servico3Texto = copy.servico3Texto || briefing.servico3Descricao
      break

    case 'como-funciona':
      copy.titulo = copy.titulo || 'Como Funciona'
      copy.subtitulo = copy.subtitulo || briefing.comoFunciona
      copy.passo1 = copy.passo1 || briefing.passo1Titulo
      copy.passo2 = copy.passo2 || briefing.passo2Titulo
      copy.passo3 = copy.passo3 || briefing.passo3Titulo
      break

    case 'diferenciais':
      copy.titulo = copy.titulo || 'Por que nos escolher'
      copy.subtitulo = copy.subtitulo || briefing.diferencial
      copy.diferencial1 = copy.diferencial1 || briefing.diferencial1Titulo
      copy.diferencial2 = copy.diferencial2 || briefing.diferencial2Titulo
      copy.diferencial3 = copy.diferencial3 || briefing.diferencial3Titulo
      break

    case 'depoimentos':
      copy.titulo = copy.titulo || 'O que dizem nossos clientes'
      break

    case 'faq':
      copy.titulo = copy.titulo || 'Perguntas Frequentes'
      copy.subtitulo = copy.subtitulo || briefing.faq
      break

    case 'cta':
      copy.titulo = copy.titulo || briefing.fraseImpacto || 'Pronto para começar?'
      copy.subtitulo = copy.subtitulo || briefing.publicoResultado
      copy.ctaTexto = copy.ctaTexto || briefing.objetivoConversao || 'Fale Comigo Agora'
      copy.ctaUrl = copy.ctaUrl || (briefing.whatsapp ? `https://wa.me/${briefing.whatsapp}` : '#contato')
      break

    case 'instagram':
      copy.titulo = copy.titulo || 'Nos siga no Instagram'
      copy.ctaTexto = copy.ctaTexto || `@${briefing.instagram.replace(/^@/, '').replace('https://instagram.com/', '').replace('https://www.instagram.com/', '')}`
      break

    case 'localizacao':
      copy.titulo = copy.titulo || 'Onde Estamos'
      copy.endereco = copy.endereco || briefing.googleBusiness
      break

    case 'footer':
      copy.copyright = copy.copyright || `© ${new Date().getFullYear()} ${briefing.nomeMarca || briefing.nomeCliente}. Todos os direitos reservados.`
      copy.politicaUrl = copy.politicaUrl || '/politica-de-privacidade'
      break
  }

  return { ...section, copy }
}

export function buildDefaultSections(briefing: Briefing): PageSection[] {
  return SECTION_TEMPLATES.map((t, i) => createSectionFromTemplate(t, i))
}
