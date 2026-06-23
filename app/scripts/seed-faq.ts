/**
 * Seed CIBLÉ de la FAQ — n'écrit QUE la section "faq" et ses items.
 * Ne touche à AUCUNE autre collection : contrairement à `npm run seed` (qui
 * purge et réécrit tout le contenu depuis content.ts), ce script est sûr à
 * lancer en prod, il n'écrase pas les modifications de contenu existantes.
 *
 * Local uniquement. Lancer depuis app/ :  npx tsx scripts/seed-faq.ts
 * Pré-requis : supabase/.env avec SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 * Idempotent : la section est upsertée ; les items ne sont insérés que s'il n'y
 * en a pas déjà (ne dédouble pas, n'écrase pas une FAQ déjà éditée).
 */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { content } from '../src/data/content.ts'

const here = dirname(fileURLToPath(import.meta.url))

try {
  process.loadEnvFile(resolve(here, '../../supabase/.env'))
} catch {
  /* variables déjà dans l'environnement, ou fichier absent */
}

const URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!URL || !SERVICE_KEY) {
  console.error('✗ SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis (supabase/.env).')
  process.exit(1)
}

if (!content.faq) {
  console.error('✗ content.faq absent dans src/data/content.ts.')
  process.exit(1)
}

const db = createClient(URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

async function main() {
  const faq = content.faq!

  // 1) Section faq (eyebrow + heading) — upsert, ne touche pas les autres sections.
  const { error: secErr } = await db
    .from('content_sections')
    .upsert({ key: 'faq', data: { eyebrow: faq.eyebrow, heading: faq.heading }, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  if (secErr) throw secErr
  console.log('✓ section "faq" écrite')

  // 2) Items faq — seulement s'il n'y en a pas déjà (pas d'écrasement, pas de doublon).
  const { count, error: cntErr } = await db
    .from('content_items')
    .select('id', { count: 'exact', head: true })
    .eq('collection', 'faq')
  if (cntErr) throw cntErr

  if ((count ?? 0) > 0) {
    console.log(`• ${count} question(s) déjà présente(s) — items inchangés.`)
    return
  }

  const rows = faq.items.map((data, ord) => ({ collection: 'faq', ord, data }))
  const { error: insErr } = await db.from('content_items').insert(rows)
  if (insErr) throw insErr
  console.log(`✓ ${rows.length} questions insérées`)
}

main()
  .then(() => console.log('✓ Seed FAQ terminé.'))
  .catch((e) => {
    console.error('✗ Échec du seed FAQ :', e.message ?? e)
    process.exit(1)
  })
