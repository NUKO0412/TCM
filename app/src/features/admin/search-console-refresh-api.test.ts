import { beforeEach, describe, expect, it, vi } from 'vitest'
import handler from '../../../api/search-console-refresh'

const existingSeo = {
  title: 'Title stable',
  h1: 'H1 stable',
  description: 'Description stable',
  keywords: ['menuiserie'],
  canonical: 'https://www.tcmagencement.fr/',
  og: { title: 'OG stable', description: 'OG description', image: 'https://www.tcmagencement.fr/og.png' },
  twitter: { title: 'Twitter stable', description: 'Twitter description', image: 'https://www.tcmagencement.fr/og.png' },
  structuredData: { '@context': 'https://schema.org', '@type': 'GeneralContractor' },
  geo: { areaServed: ['Lorient'], services: ['Menuiserie sur mesure'] },
  searchConsole: { clicks: 1, impressions: 2, source: 'old_snapshot' },
}

let patches: Array<Record<string, unknown>>
let googleShouldFail: boolean

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

async function makePrivateKeyPem() {
  const pair = await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify'],
  )
  const pkcs8 = await crypto.subtle.exportKey('pkcs8', pair.privateKey)
  const base64 = btoa(String.fromCharCode(...new Uint8Array(pkcs8)))
  return `-----BEGIN PRIVATE KEY-----\n${base64}\n-----END PRIVATE KEY-----`
}

function refreshRequest(secret?: string, method = 'POST') {
  return new Request('https://www.tcmagencement.fr/api/search-console-refresh', {
    method,
    headers: secret ? { authorization: `Bearer ${secret}` } : undefined,
  })
}

async function bodyOf(response: Response) {
  return (await response.json()) as Record<string, unknown>
}

function dimensionsOf(init?: RequestInit) {
  const body = JSON.parse(String(init?.body)) as { dimensions?: string[] }
  return body.dimensions ?? []
}

describe('search-console-refresh API', () => {
  beforeEach(async () => {
    patches = []
    googleShouldFail = false
    process.env.SUPABASE_URL = 'https://supabase.test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key'
    process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL = 'https://www.tcmagencement.fr/'
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'search-console@test.iam.gserviceaccount.com'
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = await makePrivateKeyPem()
    process.env.GSC_REFRESH_SECRET = 'refresh-secret'
    delete process.env.CRON_SECRET

    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
        const href = typeof url === 'string' ? url : url instanceof URL ? url.href : url.url
        if (href === 'https://oauth2.googleapis.com/token') return json({ access_token: 'google-token' })
        if (href.includes('/searchAnalytics/query')) {
          if (googleShouldFail) return json({ error: 'quota' }, 429)
          const dimensions = dimensionsOf(init)
          if (dimensions[0] === 'query') {
            return json({
              rows: [
                { keys: ['tcm agencement'], clicks: 4, impressions: 71, ctr: 0.056, position: 2.7 },
                { keys: ['agenceur lorient'], clicks: 0, impressions: 2, ctr: 0, position: 23.5 },
              ],
            })
          }
          if (dimensions[0] === 'page') {
            return json({
              rows: [{ keys: ['https://www.tcmagencement.fr/'], clicks: 4, impressions: 77, ctr: 0.052, position: 16.7 }],
            })
          }
          return json({ rows: [{ clicks: 4, impressions: 77, ctr: 0.052, position: 16.7 }] })
        }
        if (href === 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect') {
          return json({ inspectionResult: { indexStatusResult: { verdict: 'PASS', coverageState: 'Submitted and indexed' } } })
        }
        if (href.includes('/rest/v1/seo?page=eq.%2F&select=data&limit=1')) return json([{ data: existingSeo }])
        if (href.includes('/rest/v1/seo?page=eq.%2F')) {
          patches.push(JSON.parse(String(init?.body)) as Record<string, unknown>)
          return new Response(null, { status: 204 })
        }
        throw new Error(`Unexpected fetch: ${href}`)
      }),
    )
  })

  it('refuse sans secret', async () => {
    const response = await handler(refreshRequest())

    expect(response.status).toBe(401)
    expect(await bodyOf(response)).toMatchObject({ error: 'unauthorized' })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('refuse un secret invalide sans appeler Google ni Supabase', async () => {
    const response = await handler(refreshRequest('bad-secret'))

    expect(response.status).toBe(401)
    expect(await bodyOf(response)).toMatchObject({ error: 'unauthorized' })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('accepte GET avec le secret Vercel Cron', async () => {
    process.env.CRON_SECRET = 'cron-secret'

    const response = await handler(refreshRequest('cron-secret', 'GET'))

    expect(response.status).toBe(200)
    expect(patches).toHaveLength(1)
  })

  it('récupère Google Search Console et ne remplace que searchConsole en base', async () => {
    const response = await handler(refreshRequest('refresh-secret'))

    expect(response.status).toBe(200)
    expect(await bodyOf(response)).toMatchObject({
      ok: true,
      page: '/',
      source: 'google_search_console',
      clicks: 4,
      impressions: 77,
      queries: 2,
      pages: 1,
    })
    expect(patches).toHaveLength(1)
    const data = patches[0].data as typeof existingSeo
    expect(data.title).toBe(existingSeo.title)
    expect(data.h1).toBe(existingSeo.h1)
    expect(data.description).toBe(existingSeo.description)
    expect(data.structuredData).toEqual(existingSeo.structuredData)
    expect(data.searchConsole).toMatchObject({
      source: 'google_search_console',
      clicks: 4,
      impressions: 77,
      ctr: 0.052,
      position: 16.7,
      status: 'Submitted and indexed',
      indexed: true,
    })
    expect(data.searchConsole.queries).toEqual(
      expect.arrayContaining([{ query: 'tcm agencement', clicks: 4, impressions: 71, ctr: 0.056, position: 2.7 }]),
    )
    expect(data.searchConsole.pages).toEqual(
      expect.arrayContaining([
        { page: 'https://www.tcmagencement.fr/', clicks: 4, impressions: 77, ctr: 0.052, position: 16.7 },
      ]),
    )
  })

  it('accepte aussi le secret Vercel Cron si configuré séparément', async () => {
    process.env.CRON_SECRET = 'cron-secret'

    const response = await handler(refreshRequest('cron-secret'))

    expect(response.status).toBe(200)
    expect(patches).toHaveLength(1)
  })

  it('gère une erreur Google sans écrire dans Supabase', async () => {
    googleShouldFail = true

    const response = await handler(refreshRequest('refresh-secret'))

    expect(response.status).toBe(502)
    expect(await bodyOf(response)).toMatchObject({ error: 'search_console_refresh_failed' })
    expect(patches).toHaveLength(0)
  })

  it('refuse si la configuration serveur Google est absente', async () => {
    delete process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY

    const response = await handler(refreshRequest('refresh-secret'))

    expect(response.status).toBe(500)
    expect(await bodyOf(response)).toMatchObject({ error: 'server_misconfigured' })
    expect(fetch).not.toHaveBeenCalled()
  })
})
