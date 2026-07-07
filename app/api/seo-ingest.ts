// Ancien point de réception SEO externe. Conservé temporairement pour rollback,
// mais désactivé par défaut : la SEO/GEO se gère dans TCM via /api/seo-admin.
import { getSupabaseServerEnv, isText, reply } from './_shared'

export const config = { runtime: 'edge' }

type Incoming = {
  page?: unknown
  title?: unknown
  description?: unknown
  h1?: unknown
  keywords?: unknown
  og?: unknown
  structuredData?: unknown
  searchConsole?: unknown
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return reply(405, { error: 'method_not_allowed' })

  if (process.env.ALLOW_EXTERNAL_SEO_INGEST !== 'true') {
    return reply(410, { error: 'external_seo_ingest_disabled', message: 'TCM SEO is administered internally.' })
  }

  const ingestKey = process.env.SEO_INGEST_KEY
  const auth = request.headers.get('authorization') ?? ''
  if (!ingestKey || auth !== `Bearer ${ingestKey}`) return reply(401, { error: 'unauthorized' })

  let body: Incoming
  try {
    body = (await request.json()) as Incoming
  } catch {
    return reply(400, { error: 'invalid_json' })
  }

  if (!isText(body.page) || !isText(body.title) || !isText(body.description)) {
    return reply(400, { error: 'missing_required_fields', required: ['page', 'title', 'description'] })
  }
  if (body.keywords !== undefined && !Array.isArray(body.keywords)) {
    return reply(400, { error: 'keywords_must_be_array' })
  }
  if (body.og !== undefined && !isPlainObject(body.og)) {
    return reply(400, { error: 'og_must_be_object' })
  }
  if (body.h1 !== undefined && !isText(body.h1)) {
    return reply(400, { error: 'h1_must_be_text' })
  }
  if (body.structuredData !== undefined && !isPlainObject(body.structuredData)) {
    return reply(400, { error: 'structuredData_must_be_object' })
  }
  if (body.searchConsole !== undefined && !isPlainObject(body.searchConsole)) {
    return reply(400, { error: 'searchConsole_must_be_object' })
  }

  const supabaseEnv = getSupabaseServerEnv()
  if (!supabaseEnv) return reply(500, { error: 'server_misconfigured' })
  const { supabaseUrl, serviceKey } = supabaseEnv

  // Fusion avec l'existant : un envoi partiel ne doit pas effacer les champs
  // absents. Ex. un envoi title/description/h1 sans searchConsole conserve le
  // bloc Google Search Console déjà stocké (idem og, structuredData…). On lit
  // la ligne actuelle, puis on n'écrase que les champs réellement fournis.
  let existing: Record<string, unknown> = {}
  try {
    const cur = await fetch(
      `${supabaseUrl}/rest/v1/seo?page=eq.${encodeURIComponent(body.page)}&select=data&limit=1`,
      { headers: { apikey: serviceKey, authorization: `Bearer ${serviceKey}` } },
    )
    if (cur.ok) {
      const rows = (await cur.json()) as { data?: Record<string, unknown> }[]
      existing = rows[0]?.data ?? {}
    }
  } catch {
    /* lecture impossible : on repart de l'existant vide, sans bloquer l'envoi */
  }

  const data: Record<string, unknown> = { ...existing, title: body.title, description: body.description }
  if (body.h1 !== undefined) data.h1 = body.h1
  if (body.keywords !== undefined) data.keywords = body.keywords
  if (body.og !== undefined) data.og = body.og
  if (body.structuredData !== undefined) data.structuredData = body.structuredData
  if (body.searchConsole !== undefined) data.searchConsole = body.searchConsole

  const upsert = await fetch(`${supabaseUrl}/rest/v1/seo?on_conflict=page`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      'content-type': 'application/json',
      prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({ page: body.page, data, updated_at: new Date().toISOString() }),
  })

  if (!upsert.ok) {
    const detail = await upsert.text().catch(() => '')
    return reply(502, { error: 'store_failed', status: upsert.status, detail: detail.slice(0, 300) })
  }

  // Rebuild auto : après un envoi SEO réussi, on déclenche un redéploiement Vercel
  // pour que la page d'accueil pré-rendue reflète les nouvelles métas / le H1.
  // Optionnel et non bloquant : si SEO_REBUILD_HOOK n'est pas configuré ou échoue,
  // la SEO reste enregistrée et l'envoi répond quand même 200.
  const rebuildHook = process.env.SEO_REBUILD_HOOK
  if (rebuildHook) {
    try {
      await fetch(rebuildHook, { method: 'POST' })
    } catch {
      /* échec silencieux : la SEO est déjà enregistrée en base */
    }
  }

  return reply(200, { ok: true, page: body.page })
}
