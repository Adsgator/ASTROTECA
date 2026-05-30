// src/middleware.ts
// Protege todas as rotas com autenticação por PIN (cookie de sessão).

import { defineMiddleware } from 'astro:middleware'

const PUBLIC_PATHS = ['/login', '/api/auth']

export const onRequest = defineMiddleware(({ url, cookies, redirect }, next) => {
  const path = url.pathname

  // Rotas públicas passam direto
  if (PUBLIC_PATHS.some(p => path === p || path.startsWith(p + '/'))) {
    return next()
  }

  const session = cookies.get('astroteca_session')
  if (session?.value !== 'authenticated') {
    return redirect('/login')
  }

  return next()
})
