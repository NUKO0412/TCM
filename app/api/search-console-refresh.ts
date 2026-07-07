import { getSupabaseServerEnv, reply } from './_shared'

export const config = { runtime: 'edge' }

const SEO_PAGE = '/'
const DEFAULT_SITE_URL = 'https://www.tcmagencement.fr/'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'

type SearchAnalyticsRow = {
  keys?: string[]
  clicks?: number
  impressions?: number
  ctr?: number
  position?: number
}

type SearchConsoleData = {
  status: string
  indexed?: boolean | null
  clicks: number
  impressions: number
  ctr?: number
  position: number | null
  queries: Array<{ query: string; clicks: number; impressions: number; ctr?: number; position: number | null }>
  topQueries: Array<{ query: string; clicks: number; impressions: number; ctr?: number; position: number | null }>
  pages: Array<{ page: string; clicks: number; impressions: number; ctr?: number; position: number | null }>
  source: 'google_search_console'
  fetchedAt: string
  period: { startDate: string; endDate: string }
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

function base64Url(input: string | ArrayBuffer): string {
  const bytes =
    typeof input === 'string'
      ? new TextEncoder().encode(input)
      : new Uint8Array(input)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function normalizePrivateKey(key: string): string {
  return key.replace(/\\n/g, '\n')
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = normalizePrivateKey(pem)
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s+/g, '')
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

async function createServiceAccountJwt(email: string, privateKey: string, now = Math.floor(Date.now() / 1000)) {
  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: email,
    scope: GSC_SCOPE,
    aud: TOKEN_URL,
    exp: now + 3600,
    iat: now,
  }
  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(payload))}`
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(privateKey),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned))
  return `${unsigned}.${base64Url(signature)}`
}

async function fetchAccessToken(email: string, privateKey: string): Promise<string> {
  const assertion = await createServiceAccountJwt(email, privateKey)
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  })
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  })
  const data = (await res.json().catch(() => null)) as { access_token?: unknown; error?: unknown } | null
  if (!res.ok || typeof data?.access_token !== 'string') {
    throw new Error(`google_token_failed:${res.status}`)
  }
  return data.access_token
}

function isoDate(daysAgo: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - daysAgo)
  return date.toISOString().slice(0, 10)
}

function defaultPeriod() {
  const endDate = isoDate(3)
  const start = new Date(`${endDate}T00:00:00.000Z`)
  start.setUTCDate(start.getUTCDate() - 27)
  return { startDate: start.toISOString().slice(0, 10), endDate }
}

async function querySearchAnalytics(
  siteUrl: string,
  token: string,
  period: { startDate: string; endDate: string },
  dimensions: string[],
  rowLimit: number,
): Promise<SearchAnalyticsRow[]> {
  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        startDate: period.startDate,
        endDate: period.endDate,
        dimensions,
        rowLimit,
        searchType: 'web',
      }),
    },
  )
  const data = (await res.json().catch(() => null)) as { rows?: SearchAnalyticsRow[] } | null
  if (!res.ok) throw new Error(`google_search_analytics_failed:${res.status}`)
  return data?.rows ?? []
}

async function inspectIndex(siteUrl: string, token: string): Promise<{ indexed?: boolean | null; status?: string }> {
  const res = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      inspectionUrl: siteUrl,
      siteUrl,
    }),
  })
  if (!res.ok) return {}
  const data = (await res.json().catch(() => null)) as {
    inspectionResult?: { indexStatusResult?: { coverageState?: unknown; verdict?: unknown } }
  } | null
  const result = data?.inspectionResult?.indexStatusResult
  const status = typeof result?.coverageState === 'string' ? result.coverageState : undefined
  const verdict = typeof result?.verdict === 'string' ? result.verdict : undefined
  return { indexed: verdict ? verdict === 'PASS' : undefined, status }
}

function numberOrZero(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function positionOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function normalizeQueries(rows: SearchAnalyticsRow[]) {
  return rows.map((row) => ({
    query: row.keys?.[0] ?? '',
    clicks: numberOrZero(row.clicks),
    impressions: numberOrZero(row.impressions),
    ctr: typeof row.ctr === 'number' ? row.ctr : undefined,
    position: positionOrNull(row.position),
  })).filter((row) => row.query)
}

function normalizePages(rows: SearchAnalyticsRow[]) {
  return rows.map((row) => ({
    page: row.keys?.[0] ?? '',
    clicks: numberOrZero(row.clicks),
    impressions: numberOrZero(row.impressions),
    ctr: typeof row.ctr === 'number' ? row.ctr : undefined,
    position: positionOrNull(row.position),
  })).filter((row) => row.page)
}

async function readExistingSeo(supabaseUrl: string, serviceKey: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${supabaseUrl}/rest/v1/seo?page=eq.%2F&select=data&limit=1`, {
    headers: { apikey: serviceKey, authorization: `Bearer ${serviceKey}` },
  })
  if (!res.ok) return {}
  const rows = (await res.json().catch(() => [])) as { data?: unknown }[]
  return isPlainObject(rows[0]?.data) ? rows[0].data : {}
}

async function storeSearchConsole(supabaseUrl: string, serviceKey: string, searchConsole: SearchConsoleData) {
  const existing = await readExistingSeo(supabaseUrl, serviceKey)
  const data = { ...existing, searchConsole }
  const res = await fetch(`${supabaseUrl}/rest/v1/seo?page=eq.%2F`, {
    method: 'PATCH',
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      'content-type': 'application/json',
      prefer: 'return=minimal',
    },
    body: JSON.stringify({ data }),
  })
  if (!res.ok) throw new Error(`supabase_store_failed:${res.status}`)
}

function hasValidSecret(request: Request): boolean {
  const expected = [process.env.GSC_REFRESH_SECRET, process.env.CRON_SECRET].filter(
    (secret): secret is string => typeof secret === 'string' && secret.length > 0,
  )
  if (!expected.length) return false
  const auth = request.headers.get('authorization') ?? ''
  const headerSecret = request.headers.get('x-refresh-secret') ?? ''
  return expected.some((secret) => auth === `Bearer ${secret}` || headerSecret === secret)
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'POST') return reply(405, { error: 'method_not_allowed' })
  if (!hasValidSecret(request)) return reply(401, { error: 'unauthorized' })

  const supabaseEnv = getSupabaseServerEnv()
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL ?? DEFAULT_SITE_URL
  if (!supabaseEnv || !email || !privateKey) {
    return reply(500, { error: 'server_misconfigured' })
  }

  try {
    const period = defaultPeriod()
    const token = await fetchAccessToken(email, privateKey)
    const [totalRows, queryRows, pageRows, inspection] = await Promise.all([
      querySearchAnalytics(siteUrl, token, period, [], 1),
      querySearchAnalytics(siteUrl, token, period, ['query'], 10),
      querySearchAnalytics(siteUrl, token, period, ['page'], 10),
      inspectIndex(siteUrl, token),
    ])
    const total = totalRows[0] ?? {}
    const queries = normalizeQueries(queryRows)
    const pages = normalizePages(pageRows)
    const searchConsole: SearchConsoleData = {
      status: inspection.status ?? 'Données récupérées',
      indexed: inspection.indexed,
      clicks: numberOrZero(total.clicks),
      impressions: numberOrZero(total.impressions),
      ctr: typeof total.ctr === 'number' ? total.ctr : undefined,
      position: positionOrNull(total.position),
      queries,
      topQueries: queries,
      pages,
      source: 'google_search_console',
      fetchedAt: new Date().toISOString(),
      period,
    }
    await storeSearchConsole(supabaseEnv.supabaseUrl, supabaseEnv.serviceKey, searchConsole)
    return reply(200, {
      ok: true,
      page: SEO_PAGE,
      source: searchConsole.source,
      fetchedAt: searchConsole.fetchedAt,
      period,
      clicks: searchConsole.clicks,
      impressions: searchConsole.impressions,
      queries: searchConsole.queries.length,
      pages: searchConsole.pages.length,
    })
  } catch (error) {
    return reply(502, {
      error: 'search_console_refresh_failed',
      message: error instanceof Error ? error.message : 'unknown_error',
    })
  }
}
