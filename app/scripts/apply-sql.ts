/**
 * Applique un fichier SQL au projet Supabase via une connexion Postgres directe.
 * Local uniquement. Lancer depuis app/ :
 *   npm run db:apply -- ../supabase/migrations/0001_init.sql
 *
 * Lit le mot de passe base dans supabase/.db-password (ou PGPASSWORD),
 * et l'URL projet dans supabase/.env (SUPABASE_URL) pour en déduire le hôte.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { Client } from 'pg'

const here = dirname(fileURLToPath(import.meta.url))
try {
  process.loadEnvFile(resolve(here, '../../supabase/.env'))
} catch {
  /* absent */
}

const sqlPath = process.argv[2]
if (!sqlPath) {
  console.error('✗ Usage : npm run db:apply -- <chemin.sql>')
  process.exit(1)
}

const projectUrl = process.env.SUPABASE_URL
if (!projectUrl) {
  console.error('✗ SUPABASE_URL manquant (supabase/.env).')
  process.exit(1)
}
const ref = new URL(projectUrl).host.split('.')[0]

let password = process.env.PGPASSWORD ?? process.env.SUPABASE_DB_PASSWORD
try {
  if (!password) password = readFileSync(resolve(here, '../../supabase/.db-password'), 'utf8').trim()
} catch {
  /* absent */
}
if (!password) {
  console.error('✗ Mot de passe base introuvable (supabase/.db-password ou PGPASSWORD).')
  process.exit(1)
}

const sql = readFileSync(resolve(process.cwd(), sqlPath), 'utf8')

// Hôtes candidats : pooler Supavisor (IPv4) puis connexion directe.
const region = process.env.SUPABASE_DB_REGION // ex. eu-west-3 (optionnel)
const candidates: { label: string; host: string; port: number; user: string }[] = []
if (region) {
  candidates.push({
    label: `pooler ${region}`,
    host: `aws-0-${region}.pooler.supabase.com`,
    port: 5432,
    user: `postgres.${ref}`,
  })
}
candidates.push({ label: 'direct', host: `db.${ref}.supabase.co`, port: 5432, user: 'postgres' })

async function tryHost(c: (typeof candidates)[number]) {
  const client = new Client({
    host: c.host,
    port: c.port,
    user: c.user,
    password,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 12000,
  })
  await client.connect()
  await client.query(sql)
  await client.end()
}

for (const c of candidates) {
  try {
    process.stdout.write(`→ tentative ${c.label} (${c.host}:${c.port})… `)
    await tryHost(c)
    console.log('OK')
    console.log('✓ SQL appliqué.')
    process.exit(0)
  } catch (e) {
    console.log('échec :', e instanceof Error ? e.message : e)
  }
}

console.error('✗ Aucune connexion Postgres n’a abouti. Repli : coller le SQL dans le SQL Editor.')
process.exit(1)
