import { next } from '@vercel/edge'

// Protection par mot de passe du site de test (Vercel Edge Middleware).
// Le mot de passe vient UNIQUEMENT de la variable d'env SITE_PASSWORD
// (jamais en dur). Si elle n'est pas définie, le site reste accessible.
export const config = { matcher: '/(.*)' }

export default function middleware(request: Request) {
  const expected = process.env.SITE_PASSWORD
  if (!expected) return next() // pas de protection tant que SITE_PASSWORD non défini

  const header = request.headers.get('authorization') ?? ''
  const [scheme, encoded] = header.split(' ')
  if (scheme === 'Basic' && encoded) {
    const decoded = atob(encoded)
    const password = decoded.slice(decoded.indexOf(':') + 1) // accepte n'importe quel identifiant
    if (password === expected) return next()
  }

  return new Response('Accès restreint — TCM Agencement', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="TCM — accès restreint"' },
  })
}
