/**
 * Post-build : injecte la SEO dans dist/index.html pour que les robots la voient
 * dans le HTML livré (pas seulement ajoutée au runtime par le JS).
 * Lancé après `vite build` (voir le script `build` de package.json).
 *
 * Lit la ligne public.seo (page "/") en lecture publique (clé anon) et construit
 * les balises head + le JSON-LD depuis src/config/business.ts.
 * Résilient : si la base est injoignable, on injecte le snapshot SEO versionné
 * validé côté TCM et le build ne casse pas.
 * Ne touche pas au noindex.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { buildHead, type SeoData } from '../src/config/business.ts'
import { SEO_PAGE } from '../src/config/seoSnapshot.ts'

const here = dirname(fileURLToPath(import.meta.url)) // app/scripts

// Variables disponibles en local ; sur Vercel elles sont déjà dans l'environnement.
try { process.loadEnvFile(resolve(here, '../.env.local')) } catch { /* déjà présent */ }
try { process.loadEnvFile(resolve(here, '../../supabase/.env')) } catch { /* absent */ }

const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
const anon = process.env.VITE_SUPABASE_ANON_KEY

const MARK_START = '<!-- seo:start -->'
const MARK_END = '<!-- seo:end -->'
const FAQ_START = '<!-- faq:start -->'
const FAQ_END = '<!-- faq:end -->'

async function fetchSeo(): Promise<SeoData | null> {
  if (!url || !anon) return null
  try {
    const res = await fetch(`${url}/rest/v1/seo?page=eq.${encodeURIComponent(SEO_PAGE)}&select=data&limit=1`, {
      headers: { apikey: anon, authorization: `Bearer ${anon}` },
    })
    if (!res.ok) return null
    const rows = (await res.json()) as { data: SeoData }[]
    return rows[0]?.data ?? null
  } catch {
    return null
  }
}

// FAQ réellement publiée (collection content_items "faq") : schema FAQPage qui
// correspond EXACTEMENT aux questions affichées. Invisible, n'altère pas la page.
async function fetchFaq(): Promise<{ q: string; a: string }[]> {
  if (!url || !anon) return []
  try {
    const res = await fetch(`${url}/rest/v1/content_items?collection=eq.faq&select=data,ord&order=ord`, {
      headers: { apikey: anon, authorization: `Bearer ${anon}` },
    })
    if (!res.ok) return []
    const rows = (await res.json()) as { data: { q?: string; a?: string } }[]
    return rows.map((r) => ({ q: r.data?.q ?? '', a: r.data?.a ?? '' })).filter((x) => x.q && x.a)
  } catch {
    return []
  }
}

function buildFaqJsonLd(faq: { q: string; a: string }[]): string {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`
}

async function main() {
  const [seo, faq] = await Promise.all([fetchSeo(), fetchFaq()])
  const { title, tags } = buildHead(seo)
  const safeTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;')

  const indexPath = resolve(here, '../dist/index.html')
  let html = readFileSync(indexPath, 'utf8')
  html = html.replace(new RegExp(`${MARK_START}[\\s\\S]*?${MARK_END}\\s*`), '') // idempotence
  html = html.replace(new RegExp(`${FAQ_START}[\\s\\S]*?${FAQ_END}\\s*`), '') // idempotence
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${safeTitle}</title>`)
  html = html.replace('</head>', `  ${MARK_START}\n    ${tags}\n    ${MARK_END}\n  </head>`)
  if (faq.length) {
    html = html.replace('</head>', `  ${FAQ_START}\n    ${buildFaqJsonLd(faq)}\n    ${FAQ_END}\n  </head>`)
  }
  writeFileSync(indexPath, html)

  console.log(
    `✓ SEO injectée dans dist/index.html ${seo ? '(données seo)' : '(repli, table vide)'} · FAQ ${faq.length} Q`,
  )
}

main().catch((e) => {
  // On ne casse pas le déploiement pour la SEO : on prévient et on continue.
  console.warn('⚠ injection SEO ignorée :', e instanceof Error ? e.message : e)
})
