// scripts/utils.mjs
// Funções e constantes compartilhadas entre os scripts da Astroteca.
// Helpers de nome e categorias vêm do núcleo único (component-core.mjs) — não
// duplicar aqui para não divergir do motor das APIs.

export { toPascal, toKebab, COMPONENT_CATEGORIES as CATEGORIES } from './component-core.mjs'

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
