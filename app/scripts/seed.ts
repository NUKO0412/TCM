/**
 * Seed TCM — migre le contenu local (app/src/data/content.ts) vers Supabase
 * et assigne les rôles aux 2 comptes existants.
 *
 * Local uniquement. Lancer depuis app/ :
 *   npm run seed
 *
 * Pré-requis : remplir supabase/.env (voir supabase/.env.example) avec
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, THEO_EMAIL, SUPER_ADMIN_EMAIL.
 * La clé service contourne la RLS — ce script ne tourne que sur ta machine.
 */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { content } from '../src/data/content.ts'

const here = dirname(fileURLToPath(import.meta.url)) // app/scripts

// Charge supabase/.env si présent (Node ≥ 22).
try {
  process.loadEnvFile(resolve(here, '../../supabase/.env'))
} catch {
  // variables déjà dans l'environnement, ou fichier absent
}

const URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const THEO_EMAIL = process.env.THEO_EMAIL
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL

if (!URL || !SERVICE_KEY) {
  console.error('✗ SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis (supabase/.env).')
  process.exit(1)
}

const db = createClient(URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

// --- 1) Découpage du contenu en singletons + listes -------------------------

const sections: { key: string; data: unknown }[] = [
  { key: 'header', data: content.header },
  { key: 'hero', data: content.hero },
  { key: 'about', data: content.about },
  { key: 'footer', data: content.footer },
  {
    key: 'prestations',
    data: {
      eyebrow: content.prestations.eyebrow,
      heading: content.prestations.heading,
      lead: content.prestations.lead,
      cta: content.prestations.cta,
    },
  },
  { key: 'methode', data: { eyebrow: content.methode.eyebrow, heading: content.methode.heading } },
  {
    key: 'realisations',
    data: {
      eyebrow: content.realisations.eyebrow,
      heading: content.realisations.heading,
      cta: content.realisations.cta,
    },
  },
  {
    key: 'zone',
    data: { eyebrow: content.zone.eyebrow, heading: content.zone.heading, paragraph: content.zone.paragraph },
  },
  {
    key: 'contact',
    data: {
      eyebrow: content.contact.eyebrow,
      heading: content.contact.heading,
      intro: content.contact.intro,
      info: content.contact.info,
      legal: content.contact.legal,
      submitLabel: content.contact.submitLabel,
    },
  },
]

const collections: Record<string, unknown[]> = {
  cred: content.cred,
  presta_cards: content.prestations.cards,
  chips: content.prestations.chips.map((text) => ({ text })),
  methode_steps: content.methode.steps,
  realisations: content.realisations.shots,
  villes: content.zone.villes.map((name) => ({ name })),
  project_types: content.contact.projectTypes.map((value) => ({ value })),
}

// --- 2) Écriture du contenu -------------------------------------------------

async function seedContent() {
  const { error: secErr } = await db
    .from('content_sections')
    .upsert(
      sections.map((s) => ({ key: s.key, data: s.data, updated_at: new Date().toISOString() })),
      { onConflict: 'key' },
    )
  if (secErr) throw secErr
  console.log(`✓ ${sections.length} sections écrites`)

  let total = 0
  for (const [collection, list] of Object.entries(collections)) {
    // purge + réinsertion : garantit l'ordre exact et l'idempotence
    const { error: delErr } = await db.from('content_items').delete().eq('collection', collection)
    if (delErr) throw delErr
    const rows = list.map((data, ord) => ({ collection, ord, data }))
    const { error: insErr } = await db.from('content_items').insert(rows)
    if (insErr) throw insErr
    total += rows.length
  }
  console.log(`✓ ${total} items écrits sur ${Object.keys(collections).length} collections`)
}

// --- 3) Assignation des rôles ----------------------------------------------

async function findUserId(email: string): Promise<string | null> {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const match = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    if (match) return match.id
    if (data.users.length < 200) break
  }
  return null
}

async function assignRole(email: string | undefined, role: 'admin' | 'super_admin') {
  if (!email) {
    console.warn(`• ${role} : email non fourni, rôle non assigné.`)
    return
  }
  const id = await findUserId(email)
  if (!id) {
    console.warn(`• ${role} : aucun compte trouvé pour ${email} — crée-le dans le dashboard d'abord.`)
    return
  }
  const { error } = await db
    .from('profiles')
    .upsert({ id, role, display_name: email }, { onConflict: 'id' })
  if (error) throw error
  console.log(`✓ ${email} → ${role}`)
}

// --- main -------------------------------------------------------------------

async function main() {
  await seedContent()
  await assignRole(THEO_EMAIL, 'admin')
  await assignRole(SUPER_ADMIN_EMAIL, 'super_admin')
  console.log('✓ Seed terminé.')
}

main().catch((e) => {
  console.error('✗ Échec du seed :', e.message ?? e)
  process.exit(1)
})
