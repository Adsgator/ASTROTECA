// src/lib/utils.ts

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function toBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
}

export function wait(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}
