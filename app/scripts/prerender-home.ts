/**
 * Post-build : pré-rend le <body> de la page d'accueil dans dist/index.html.
 * Aujourd'hui le corps servi est un <div id="root"></div> vide (rendu par le JS
 * au runtime) : les robots d'IA et les outils sans JS voient un site « vide ».
 * Ici on rend la home en HTML au build, avec une photo des données Supabase, et
 * on l'injecte dans le root + une copie de la photo en script inline (pour que le
 * premier rendu client soit identique → hydratation sans flash, géré par main.tsx).
 *
 * Lancé après `vite build` et le build SSR (dist-ssr/entry-server.js), AVANT
 * scripts/seo-prerender.ts (qui s'occupe du <head>, indépendant du <body>).
 *
 * Résilient : toute erreur (Supabase injoignable, données incomplètes, rendu qui
 * échoue) → on ne touche pas index.html. Le site retombe sur son comportement
 * actuel (root vide rempli par le JS). Le déploiement ne casse jamais pour ça.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url)) // app/scripts

try { process.loadEnvFile(resolve(here, '../.env.local')) } catch { /* déjà présent */ }
try { process.loadEnvFile(resolve(here, '../../supabase/.env')) } catch { /* absent */ }

const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
const anon = process.env.VITE_SUPABASE_ANON_KEY

type SectionRow = { key: string; data: unknown }
type ItemRow = { id: string; collection: string; ord: number; data: Record<string, unknown> }
type Snapshot = { sections: SectionRow[]; items: ItemRow[] }

async function fetchRows<T>(path: string): Promise<T[]> {
  if (!url || !anon) return []
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: anon, authorization: `Bearer ${anon}` },
  })
  if (!res.ok) throw new Error(`Supabase ${path} → HTTP ${res.status}`)
  return (await res.json()) as T[]
}

async function fetchSnapshot(): Promise<Snapshot | null> {
  const [sections, items] = await Promise.all([
    fetchRows<SectionRow>('content_sections?select=key,data'),
    fetchRows<ItemRow>('content_items?select=id,collection,ord,data'),
  ])
  // Sans sections, assemble() lèverait : on n'a pas de quoi pré-rendre la page.
  if (!sections.length) return null
  return { sections, items }
}

// Échappe le JSON pour l'inclure sans danger dans un <script> (coupe </script>).
function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

async function main() {
  const snapshot = await fetchSnapshot()
  if (!snapshot) {
    console.warn('⚠ pré-rendu home ignoré : aucune donnée Supabase (root laissé vide)')
    return
  }

  // ContentProvider lit cette photo au rendu (serveur et client).
  globalThis.__TCM_CONTENT__ = snapshot

  const { render } = (await import(
    pathToFileURL(resolve(here, '../dist-ssr/entry-server.js')).href
  )) as { render: () => string }

  const body = render()
  if (!body || !body.trim()) {
    console.warn('⚠ pré-rendu home ignoré : rendu vide (root laissé vide)')
    return
  }

  const indexPath = resolve(here, '../dist/index.html')
  let html = readFileSync(indexPath, 'utf8')

  // 1) injecte le corps rendu dans le root + marque data-prerendered (main.tsx
  //    hydrate au lieu de recréer le DOM uniquement si ce marqueur est présent).
  html = html.replace('<div id="root"></div>', `<div id="root" data-prerendered="1">${body}</div>`)

  // 2) embarque la photo des données : lue par ContentProvider dès le 1er rendu
  //    client, pour qu'il soit identique au HTML pré-rendu (hydratation propre).
  const seed = `<script>window.__TCM_CONTENT__=${safeJson(snapshot)}</script>`
  html = html.replace('</head>', `  ${seed}\n  </head>`)

  writeFileSync(indexPath, html)
  console.log(
    `✓ Home pré-rendue dans dist/index.html · ${snapshot.sections.length} sections, ${snapshot.items.length} items`,
  )
}

main().catch((e) => {
  // On ne casse jamais le déploiement pour le pré-rendu : on prévient et on continue.
  console.warn('⚠ pré-rendu home ignoré :', e instanceof Error ? e.message : e)
})
