import { beforeEach, describe, expect, it, vi } from 'vitest'
import handler from '../../../api/seo-geo-sync'

const existingSeo = {
  title: 'Title',
  h1: 'H1',
  description: 'Description',
  geo: {
    areaServed: ['Ancienne zone'],
    services: ['Menuiserie sur mesure'],
  },
  searchConsole: {
    clicks: 6,
    impressions: 148,
  },
}

let role: 'admin' | 'super_admin' | 'viewer'
let upserts: Array<Record<string, unknown>>
let rebuildCalls: number

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function syncRequest(token = 'token') {
  return new Request('https://www.tcmagencement.fr/api/seo-geo-sync', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
  })
}

async function bodyOf(response: Response) {
  return (await response.json()) as Record<string, unknown>
}

describe('seo-geo-sync API', () => {
  beforeEach(() => {
    role = 'admin'
    upserts = []
    rebuildCalls = 0
    process.env.SUPABASE_URL = 'https://supabase.test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key'
    process.env.VITE_SUPABASE_ANON_KEY = 'anon-key'
    process.env.SEO_REBUILD_HOOK = 'https://rebuild.test/hook'
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
        const href = typeof url === 'string' ? url : url instanceof URL ? url.href : url.url
        if (href.includes('/auth/v1/user')) return json({ id: 'user-1' })
        if (href.includes('/rest/v1/profiles')) return json([{ role }])
        if (href.includes('/rest/v1/content_items?collection=eq.villes')) {
          return json([
            { data: { name: ' Lorient ' } },
            { data: { name: 'Hennebont' } },
            { data: { name: 'Guidel' } },
            { data: { name: 'guidel' } },
            { data: { name: '' } },
            { data: { name: 'Inzinzac-Lochrist' } },
          ])
        }
        if (href.includes('/rest/v1/seo?page=eq.%2F&select=data&limit=1')) return json([{ data: existingSeo }])
        if (href.includes('/rest/v1/seo?on_conflict=page')) {
          upserts.push(JSON.parse(String(init?.body)) as Record<string, unknown>)
          return new Response(null, { status: 201 })
        }
        if (href === 'https://rebuild.test/hook') {
          rebuildCalls += 1
          return json({ ok: true })
        }
        throw new Error(`Unexpected fetch: ${href}`)
      }),
    )
  })

  it('synchronise les villes administrables vers Zones GEO ciblées pour un admin', async () => {
    const response = await handler(syncRequest())

    expect(response.status).toBe(200)
    expect(await bodyOf(response)).toMatchObject({
      ok: true,
      page: '/',
      areaServed: ['Lorient', 'Hennebont', 'Guidel', 'Inzinzac-Lochrist'],
      count: 4,
      rebuild: 'triggered',
    })
    expect(rebuildCalls).toBe(1)
    expect(upserts).toHaveLength(1)
    const data = upserts[0].data as typeof existingSeo
    expect(data.geo.areaServed).toEqual(['Lorient', 'Hennebont', 'Guidel', 'Inzinzac-Lochrist'])
    expect(data.geo.services).toEqual(existingSeo.geo.services)
    expect(data.searchConsole).toEqual(existingSeo.searchConsole)
  })

  it('autorise aussi un super_admin', async () => {
    role = 'super_admin'

    const response = await handler(syncRequest())

    expect(response.status).toBe(200)
    expect(upserts).toHaveLength(1)
  })

  it('refuse un rôle non administrateur', async () => {
    role = 'viewer'

    const response = await handler(syncRequest())

    expect(response.status).toBe(403)
    expect(await bodyOf(response)).toMatchObject({ error: 'admin_required' })
    expect(upserts).toHaveLength(0)
  })
})
