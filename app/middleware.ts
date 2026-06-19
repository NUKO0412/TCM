import { next } from '@vercel/edge'

// Protection par mot de passe du site de test (Vercel Edge Middleware).
// Le mot de passe vient UNIQUEMENT de la variable d'env SITE_PASSWORD.
export const config = { matcher: '/(.*)' }

const COOKIE_NAME = 'tcm_access'
const COOKIE_TTL = 60 * 60 * 24 * 7

function pageLogin(error = '') {
  const html = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>TCM — accès restreint</title>
    <style>
      *{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#151319;color:#f7f2ec;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.box{width:340px;max-width:calc(100vw - 32px);border:1px solid #38313a;background:#211d24;padding:28px;border-radius:10px}h1{font-size:20px;margin:0 0 8px}p{margin:0 0 18px;color:#c9bfb5;font-size:14px;line-height:1.4}input{width:100%;padding:12px;border-radius:8px;border:1px solid #4a414a;background:#151319;color:#fff;font-size:16px}button{width:100%;margin-top:14px;padding:12px;border:0;border-radius:8px;background:#d7b46a;color:#17120b;font-weight:700;font-size:15px;cursor:pointer}.error{margin-top:12px;color:#ff9b9b;font-size:13px}
    </style>
  </head>
  <body>
    <form class="box" method="POST" action="/__tcm_access">
      <h1>TCM</h1>
      <p>Site en cours de validation. Entrez le mot de passe d'accès.</p>
      <input name="password" type="password" autocomplete="current-password" placeholder="Mot de passe" autofocus required />
      <button type="submit">Entrer</button>
      ${error ? `<div class="error">${error}</div>` : ''}
    </form>
  </body>
</html>`
  return new Response(html, {
    status: error ? 401 : 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}

function readCookie(request: Request, name: string) {
  const cookies = request.headers.get('cookie') ?? ''
  for (const part of cookies.split(';')) {
    const [key, ...value] = part.trim().split('=')
    if (key === name) return value.join('=')
  }
  return ''
}

export async function middleware(request: Request) {
  const expected = process.env.SITE_PASSWORD
  if (!expected) return next() // pas de protection tant que SITE_PASSWORD non défini

  const url = new URL(request.url)
  if (url.pathname === '/__tcm_access' && request.method === 'POST') {
    const data = await request.formData()
    if (String(data.get('password') ?? '') === expected) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: '/',
          'Set-Cookie': `${COOKIE_NAME}=ok; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${COOKIE_TTL}`,
        },
      })
    }
    return pageLogin('Mot de passe incorrect.')
  }

  if (readCookie(request, COOKIE_NAME) === 'ok') return next()
  return pageLogin()
}
