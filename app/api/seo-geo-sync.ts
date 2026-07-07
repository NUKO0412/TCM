import { getSupabaseServerEnv, reply } from './_shared'

export const config = { runtime: 'edge' }

const SEO_PAGE = '/'
const ALLOWED_ROLES = new Set(['admin', 'super_admin'])

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

function normalizeArea(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const normalized = value.replace(/\s+/g, ' ').trim()
  return normalized || null
}

function dedupeAreas(values: unknown[]): string[] {
  const seen = new Set<string>()
  const areas: string[] = []

  for (const value of values) {
    const area = normalizeArea(value)
    if (!area) continue
    const key = area
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLocaleLowerCase('fr-FR')
    if (seen.has(key)) continue
    seen.add(key)
    areas.push(area)
  }

  return areas
}

async function getUserId(supabaseUrl: string, anonKey: string, token: string): Promise<string | null> {
  const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: anonKey, authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  const user = (await res.json().catch(() => null)) as { id?: unknown } | null
  return typeof user?.id === 'string' ? user.id : null
}

async function getRole(supabaseUrl: string, serviceKey: string, userId: string): Promise<string | null> {
  const res = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=role&limit=1`, {
    headers: { apikey: serviceKey, authorization: `Bearer ${serviceKey}` },
  })
  if (!res.ok) return null
  const rows = (await res.json().catch(() => [])) as { role?: unknown }[]
  return typeof rows[0]?.role === 'string' ? rows[0].role : null
}

async function readExistingSeo(supabaseUrl: string, serviceKey: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${supabaseUrl}/rest/v1/seo?page=eq.${encodeURIComponent(SEO_PAGE)}&select=data&limit=1`, {
    headers: { apikey: serviceKey, authorization: `Bearer ${serviceKey}` },
  })
  if (!res.ok) return {}
  const rows = (await res.json().catch(() => [])) as { data?: unknown }[]
  return isPlainObject(rows[0]?.data) ? rows[0].data : {}
}

async function readVilles(supabaseUrl: string, serviceKey: string): Promise<string[]> {
  const res = await fetch(`${supabaseUrl}/rest/v1/content_items?collection=eq.villes&select=data,ord&order=ord.asc`, {
    headers: { apikey: serviceKey, authorization: `Bearer ${serviceKey}` },
  })
  if (!res.ok) throw new Error(`content_items_${res.status}`)
  const rows = (await res.json().catch(() => [])) as { data?: unknown }[]
  return dedupeAreas(rows.map((row) => (isPlainObject(row.data) ? row.data.name : null)))
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return reply(405, { error: 'method_not_allowed' })

  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim()
  if (!token) return reply(401, { error: 'missing_token' })

  const supabaseEnv = getSupabaseServerEnv()
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY
  if (!supabaseEnv || !anonKey) return reply(500, { error: 'server_misconfigured' })

  const userId = await getUserId(supabaseEnv.supabaseUrl, anonKey, token)
  if (!userId) return reply(401, { error: 'invalid_token' })

  const role = await getRole(supabaseEnv.supabaseUrl, supabaseEnv.serviceKey, userId)
  if (!role || !ALLOWED_ROLES.has(role)) return reply(403, { error: 'admin_required' })

  let areaServed: string[]
  try {
    areaServed = await readVilles(supabaseEnv.supabaseUrl, supabaseEnv.serviceKey)
  } catch {
    return reply(502, { error: 'source_villes_failed' })
  }

  const existing = await readExistingSeo(supabaseEnv.supabaseUrl, supabaseEnv.serviceKey)
  const existingGeo = isPlainObject(existing.geo) ? existing.geo : {}
  const data = {
    ...existing,
    geo: {
      ...existingGeo,
      areaServed,
    },
  }

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

  if (!upsert.ok) return reply(502, { error: 'store_failed', status: upsert.status })

  let rebuild: 'not_configured' | 'triggered' | 'failed' = 'not_configured'
  const rebuildHook = process.env.SEO_REBUILD_HOOK
  if (rebuildHook) {
    const res = await fetch(rebuildHook, { method: 'POST' }).catch(() => null)
    rebuild = res?.ok ? 'triggered' : 'failed'
  }

  return reply(200, { ok: true, page: SEO_PAGE, areaServed, count: areaServed.length, rebuild })
}
