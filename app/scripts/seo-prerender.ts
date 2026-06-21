/**
 * Post-build : injecte la SEO dans dist/index.html pour que les robots la voient
 * dans le HTML livré (pas seulement ajoutée au runtime par le JS).
 * Lancé après `vite build` (voir le script `build` de package.json).
 *
 * Lit la ligne public.seo (page "/") en lecture publique (clé anon) et construit
 * les balises head + le JSON-LD LocalBusiness depuis src/config/business.ts.
 * Résilient : si la base est injoignable, on injecte le repli et le build ne casse pas.
 * Ne touche pas au noindex.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { buildHead, type SeoData } from '../src/config/business.ts'

const here = dirname(fileURLToPath(import.meta.url)) // app/scripts

// Variables disponibles en local ; sur Vercel elles sont déjà dans l'environnement.
try { process.loadEnvFile(resolve(here, '../.env.local')) } catch { /* déjà présent */ }
try { process.loadEnvFile(resolve(here, '../../supabase/.env')) } catch { /* absent */ }

const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
const anon = process.env.VITE_SUPABASE_ANON_KEY

const MARK_START = '<!-- seo:start -->'
const MARK_END = '<!-- seo:end -->'

async function fetchSeo(): Promise<SeoData | null> {
  if (!url || !anon) return null
  try {
    const res = await fetch(`${url}/rest/v1/seo?page=eq.${encodeURIComponent('/')}&select=data&limit=1`, {
      headers: { apikey: anon, authorization: `Bearer ${anon}` },
    })
    if (!res.ok) return null
    const rows = (await res.json()) as { data: SeoData }[]
    return rows[0]?.data ?? null
  } catch {
    return null
  }
}

async function main() {
  const seo = await fetchSeo()
  const { title, tags } = buildHead(seo)
  const safeTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;')

  const indexPath = resolve(here, '../dist/index.html')
  let html = readFileSync(indexPath, 'utf8')
  html = html.replace(new RegExp(`${MARK_START}[\\s\\S]*?${MARK_END}\\s*`), '') // idempotence
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${safeTitle}</title>`)
  html = html.replace('</head>', `  ${MARK_START}\n    ${tags}\n    ${MARK_END}\n  </head>`)
  writeFileSync(indexPath, html)

  console.log(`✓ SEO injectée dans dist/index.html ${seo ? '(données seo)' : '(repli, table vide)'}`)
}

main().catch((e) => {
  // On ne casse pas le déploiement pour la SEO : on prévient et on continue.
  console.warn('⚠ injection SEO ignorée :', e instanceof Error ? e.message : e)
})
