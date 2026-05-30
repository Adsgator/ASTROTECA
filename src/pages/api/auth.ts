// src/pages/api/auth.ts
// Valida o PIN e emite cookie de sessão.

import type { APIRoute } from 'astro'

// Rate limiting em memória: IP → { count, firstAttemptAt }
const loginAttempts = new Map<string, { count: number; firstAttemptAt: number }>()
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutos

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = loginAttempts.get(ip)

  if (!entry || now - entry.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAttemptAt: now })
    return true
  }

  if (entry.count >= RATE_LIMIT_MAX) return false

  entry.count++
  return true
}

function clearStaleEntries() {
  const now = Date.now()
  for (const [ip, entry] of loginAttempts) {
    if (now - entry.firstAttemptAt > RATE_LIMIT_WINDOW_MS) loginAttempts.delete(ip)
  }
}

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  clearStaleEntries()

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
    ?? request.headers.get('cf-connecting-ip')
    ?? 'unknown'

  if (!checkRateLimit(ip)) {
    return new Response('Muitas tentativas. Aguarde 15 minutos.', { status: 429 })
  }

  const form = await request.formData()
  const pin = form.get('pin')?.toString().trim() ?? ''

  const correctPin = import.meta.env.AUTH_PIN
  if (!correctPin) {
    return new Response('AUTH_PIN não configurado', { status: 500 })
  }

  if (pin !== correctPin) {
    return redirect('/login?error=1')
  }

  cookies.set('astroteca_session', 'authenticated', {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  })

  return redirect('/')
}

export const DELETE: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete('astroteca_session', { path: '/' })
  return redirect('/login')
}
