// Point de réception de la SEO envoyée par Hubelly.
// POST /api/seo-ingest — protégé par SEO_INGEST_KEY. Écrit dans public.seo (upsert sur page)
// avec la clé service Supabase. Tous les secrets viennent de l'environnement serveur, jamais du front.
export const config = { runtime: 'edge' }

type Incoming = {
  page?: unknown
  title?: unknown
  description?: unknown
  keywords?: unknown
  og?: unknown
}

function reply(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}

const isText = (v: unknown): v is string => typeof v === 'string' && v.trim() !== ''
const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return reply(405, { error: 'method_not_allowed' })

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

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  // la clé service est câblée selon le projet sous l'un ou l'autre nom
  const serviceKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) return reply(500, { error: 'server_misconfigured' })

  const data: Record<string, unknown> = { title: body.title, description: body.description }
  if (body.keywords !== undefined) data.keywords = body.keywords
  if (body.og !== undefined) data.og = body.og

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

  return reply(200, { ok: true, page: body.page })
}
