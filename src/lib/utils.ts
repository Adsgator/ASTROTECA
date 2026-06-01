// src/lib/utils.ts

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Utilitário padrão para combinar classes Tailwind de forma segura */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(date))
}

export function toBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
}

export function wait(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

export function toPascal(s: string): string {
  return s.replace(/(^\w|-\w|_\w)/g, m => m.replace(/[-_]/, '').toUpperCase())
}

export function toKebab(s: string): string {
  return s.replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
           .replace(/([a-z])([A-Z])/g, '$1-$2')
           .replace(/([a-zA-Z])(\d)/g, '$1-$2')
           .replace(/[\s_]+/g, '-')
           .toLowerCase()
}
