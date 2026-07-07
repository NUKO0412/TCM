import { getSupabaseServerEnv, reply } from './_shared'

export const config = { runtime: 'edge' }

type IncomingSeo = {
  page?: unknown
  title?: unknown
  description?: unknown
  h1?: unknown
  keywords?: unknown
  canonical?: unknown
  og?: unknown
  twitter?: unknown
  structuredData?: unknown
  geo?: unknown
}

const SEO_PAGE = '/'
const ROOT_FIELDS = new Set(['page', 'title', 'description', 'h1', 'keywords', 'og', 'twitter', 'geo'])
const OG_FIELDS = new Set(['title', 'description'])
const TWITTER_FIELDS = new Set(['title', 'description'])
const GEO_FIELDS = new Set(['areaServed', 'services'])

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

function textOrUndefined(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function cleanKeywords(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const keywords = value.filter((k): k is string => typeof k === 'string').map((k) => k.trim()).filter(Boolean)
  return keywords.length ? keywords : undefined
}

function mergeObject(existing: unknown, incoming: Record<string, unknown>): Record<string, unknown> {
  return { ...(isPlainObject(existing) ? existing : {}), ...incoming }
}

function forbiddenFields(body: IncomingSeo): string[] {
  const forbidden = new Set<string>()
  for (const key of Object.keys(body)) {
    if (!ROOT_FIELDS.has(key)) forbidden.add(key)
  }

  if (body.page !== undefined && textOrUndefined(body.page) !== SEO_PAGE) forbidden.add('page')
  if (body.canonical !== undefined) forbidden.add('canonical')
  if (body.structuredData !== undefined) forbidden.add('structuredData')

  if (isPlainObject(body.og)) {
    for (const key of Object.keys(body.og)) {
      if (!OG_FIELDS.has(key)) forbidden.add(`og.${key}`)
    }
  }
  if (isPlainObject(body.twitter)) {
    for (const key of Object.keys(body.twitter)) {
      if (!TWITTER_FIELDS.has(key)) forbidden.add(`twitter.${key}`)
    }
  }
  if (isPlainObject(body.geo)) {
    for (const key of Object.keys(body.geo)) {
      if (!GEO_FIELDS.has(key)) forbidden.add(`geo.${key}`)
    }
  }

  return [...forbidden]
}

function pickFields(source: Record<string, unknown>, allowed: Set<string>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(source).filter(([key]) => allowed.has(key)))
}

async function getUserId(supabaseUrl: string, anonKey: string, token: string): Promise<string | null> {
  const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: anonKey, authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  const user = (await res.json().catch(() => null)) as { id?: unknown } | null
  return typeof user?.id === 'string' ? user.id : null
}

async function isSuperAdmin(supabaseUrl: string, serviceKey: string, userId: string): Promise<boolean> {
  const res = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=role&limit=1`, {
    headers: { apikey: serviceKey, authorization: `Bearer ${serviceKey}` },
  })
  if (!res.ok) return false
  const rows = (await res.json().catch(() => [])) as { role?: unknown }[]
  return rows[0]?.role === 'super_admin'
}

async function readExistingSeo(supabaseUrl: string, serviceKey: string, page: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${supabaseUrl}/rest/v1/seo?page=eq.${encodeURIComponent(page)}&select=data&limit=1`, {
    headers: { apikey: serviceKey, authorization: `Bearer ${serviceKey}` },
  })
  if (!res.ok) return {}
  const rows = (await res.json().catch(() => [])) as { data?: Record<string, unknown> }[]
  return rows[0]?.data ?? {}
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'PUT') return reply(405, { error: 'method_not_allowed' })

  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim()
  if (!token) return reply(401, { error: 'missing_token' })

  const supabaseEnv = getSupabaseServerEnv()
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY
  if (!supabaseEnv || !anonKey) return reply(500, { error: 'server_misconfigured' })

  const userId = await getUserId(supabaseEnv.supabaseUrl, anonKey, token)
  if (!userId) return reply(401, { error: 'invalid_token' })

  const allowed = await isSuperAdmin(supabaseEnv.supabaseUrl, supabaseEnv.serviceKey, userId)
  if (!allowed) return reply(403, { error: 'super_admin_required' })

  let body: IncomingSeo
  try {
    body = (await request.json()) as IncomingSeo
  } catch {
    return reply(400, { error: 'invalid_json' })
  }

  const forbidden = forbiddenFields(body)
  if (forbidden.length) return reply(400, { error: 'forbidden_seo_fields', fields: forbidden })

  const title = textOrUndefined(body.title)
  const description = textOrUndefined(body.description)
  const h1 = textOrUndefined(body.h1)
  if (!title || !description || !h1) {
    return reply(400, { error: 'missing_required_fields', required: ['title', 'description', 'h1'] })
  }

  if (body.og !== undefined && !isPlainObject(body.og)) return reply(400, { error: 'og_must_be_object' })
  if (body.twitter !== undefined && !isPlainObject(body.twitter)) return reply(400, { error: 'twitter_must_be_object' })
  if (body.geo !== undefined && !isPlainObject(body.geo)) return reply(400, { error: 'geo_must_be_object' })

  const existing = await readExistingSeo(supabaseEnv.supabaseUrl, supabaseEnv.serviceKey, SEO_PAGE)
  const data: Record<string, unknown> = {
    ...existing,
    title,
    description,
    h1,
  }

  const keywords = cleanKeywords(body.keywords)
  if (keywords) data.keywords = keywords
  if (isPlainObject(body.og)) data.og = mergeObject(existing.og, pickFields(body.og, OG_FIELDS))
  if (isPlainObject(body.twitter)) data.twitter = mergeObject(existing.twitter, pickFields(body.twitter, TWITTER_FIELDS))
  if (isPlainObject(body.geo)) data.geo = mergeObject(existing.geo, pickFields(body.geo, GEO_FIELDS))

  const upsert = await fetch(`${supabaseEnv.supabaseUrl}/rest/v1/seo?on_conflict=page`, {
    method: 'POST',
    headers: {
      apikey: supabaseEnv.serviceKey,
      authorization: `Bearer ${supabaseEnv.serviceKey}`,
      'content-type': 'application/json',
      prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({ page: SEO_PAGE, data, updated_at: new Date().toISOString() }),
  })

  if (!upsert.ok) {
    return reply(502, { error: 'store_failed', status: upsert.status })
  }

  let rebuild: 'not_configured' | 'triggered' | 'failed' = 'not_configured'
  const rebuildHook = process.env.SEO_REBUILD_HOOK
  if (rebuildHook) {
    const res = await fetch(rebuildHook, { method: 'POST' }).catch(() => null)
    rebuild = res?.ok ? 'triggered' : 'failed'
  }

  return reply(200, { ok: true, page: SEO_PAGE, rebuild })
}
