import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

try {
  process.loadEnvFile(resolve(here, '../.env.local'))
} catch {
  // Vercel fournit les variables via process.env.
}

const url = process.env.VITE_SUPABASE_URL
const anon = process.env.VITE_SUPABASE_ANON_KEY

if (!url || !anon) {
  throw new Error('VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY manquant pour reinitialisation.html.')
}

const htmlPath = resolve(here, '../dist/reinitialisation.html')
let html = readFileSync(htmlPath, 'utf8')

html = html.replaceAll('__SUPABASE_URL__', url)
html = html.replaceAll('__SUPABASE_ANON_KEY__', anon)

writeFileSync(htmlPath, html)

console.log('✓ Configuration Supabase injectée dans dist/reinitialisation.html')
