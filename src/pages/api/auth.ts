// src/pages/api/auth.ts
// Valida o PIN e emite cookie de sessão.

import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
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
