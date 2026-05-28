// scripts/utils.mjs
// Funções e constantes compartilhadas entre os scripts da Astroteca

export const toPascal = s => s.replace(/(^\w|-\w|_\w)/g, m => m.replace(/[-_]/, '').toUpperCase())

export const toKebab = s => s
  .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
  .replace(/([a-z])([A-Z])/g, '$1-$2')
  .replace(/([a-zA-Z])(\d)/g, '$1-$2')
  .replace(/[\s_]+/g, '-')
  .toLowerCase()

export const CATEGORIES = ['Hero', 'Features', 'Services', 'Testimonials', 'Process', 'Pricing', 'FAQ', 'CTA', 'Contact', 'Footer', 'Trust', 'UI', 'Other']

export const EXAMPLES = {
  headline:          'Transforme sua presença digital',
  title:             'Título de Exemplo',
  sectionTitle:      'Por que nos escolher',
  sectionLabel:      'Nossos Diferenciais',
  subheadline:       'Resultados reais para negócios que querem crescer.',
  subtitle:          'Uma descrição clara e objetiva do conteúdo.',
  description:       'Descrição do serviço ou produto com foco no benefício.',
  ctaLabel:          'Saiba mais',
  ctaHref:           '#',
  ctaSecondaryLabel: 'Como funciona',
  ctaSecondaryHref:  '#',
  imageSrc:          '/preview-assets/placeholder-hero.svg',
  imageAlt:          'Imagem de exemplo',
  badge:             '⭐ Mais de 200 projetos entregues',
  name:              'João Silva',
  email:             'joao@exemplo.com',
}
