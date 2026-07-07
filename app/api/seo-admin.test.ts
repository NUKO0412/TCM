import { beforeEach, describe, expect, it, vi } from 'vitest'
import handler from './seo-admin'

const existingSeo = {
  title: 'Old title',
  h1: 'Old h1',
  description: 'Old description',
  keywords: ['old'],
  canonical: 'https://www.tcmagencement.fr/',
  og: {
    title: 'Old OG title',
    description: 'Old OG description',
    image: 'https://www.tcmagencement.fr/og.png',
  },
  twitter: {
    title: 'Old Twitter title',
    description: 'Old Twitter description',
    image: 'https://www.tcmagencement.fr/og.png',
  },
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    name: 'TCM Agencement',
  },
  geo: {
    areaServed: ['Lorient'],
    services: ['Menuiserie sur mesure'],
  },
}

const allowedPayload = {
  page: '/',
  title: 'New title',
  h1: 'New h1',
  description: 'New description',
  keywords: ['menuiserie', 'lorient'],
  og: { title: 'New OG title', description: 'New OG description' },
  twitter: { title: 'New Twitter title', description: 'New Twitter description' },
  geo: {
    areaServed: ['Lorient', 'Lanester'],
    services: ['Agencement intérieur', 'Cuisine'],
  },
}

let role: 'admin' | 'super_admin'
let upserts: Array<Record<string, unknown>>
let rebuildCalls: number

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function seoRequest(body: unknown, token = 'token') {
  return new Request('https://www.tcmagencement.fr/api/seo-admin', {
    method: 'PUT',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

async function bodyOf(response: Response) {
  return (await response.json()) as Record<string, unknown>
}

describe('seo-admin API', () => {
  beforeEach(() => {
    role = 'super_admin'
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

  it('refuse une requête sans token', async () => {
    const response = await handler(new Request('https://www.tcmagencement.fr/api/seo-admin', { method: 'PUT' }))

    expect(response.status).toBe(401)
    expect(await bodyOf(response)).toMatchObject({ error: 'missing_token' })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('refuse un admin normal', async () => {
    role = 'admin'

    const response = await handler(seoRequest(allowedPayload))

    expect(response.status).toBe(403)
    expect(await bodyOf(response)).toMatchObject({ error: 'super_admin_required' })
    expect(upserts).toHaveLength(0)
  })

  it('autorise un super_admin à écrire uniquement les champs rédactionnels SEO/GEO', async () => {
    const response = await handler(seoRequest(allowedPayload))

    expect(response.status).toBe(200)
    expect(await bodyOf(response)).toMatchObject({ ok: true, page: '/', rebuild: 'triggered' })
    expect(rebuildCalls).toBe(1)
    expect(upserts).toHaveLength(1)
    expect(upserts[0].page).toBe('/')
    const data = upserts[0].data as typeof existingSeo
    expect(data).toMatchObject({
      title: 'New title',
      h1: 'New h1',
      description: 'New description',
      keywords: ['menuiserie', 'lorient'],
      og: { title: 'New OG title', description: 'New OG description' },
      twitter: { title: 'New Twitter title', description: 'New Twitter description' },
      geo: {
        areaServed: ['Lorient', 'Lanester'],
        services: ['Agencement intérieur', 'Cuisine'],
      },
    })
    expect(data.canonical).toBe(existingSeo.canonical)
    expect(data.og.image).toBe(existingSeo.og.image)
    expect(data.twitter.image).toBe(existingSeo.twitter.image)
    expect(data.structuredData).toEqual(existingSeo.structuredData)
  })

  it('refuse les champs techniques verrouillés même pour un super_admin', async () => {
    const response = await handler(
      seoRequest({
        ...allowedPayload,
        page: '/autre-page',
        canonical: 'https://example.com/',
        structuredData: { '@type': 'Thing' },
        og: { ...allowedPayload.og, image: 'https://example.com/og.png' },
        twitter: { ...allowedPayload.twitter, image: 'https://example.com/twitter.png' },
        unknownField: 'nope',
      }),
    )

    expect(response.status).toBe(400)
    const body = await bodyOf(response)
    expect(body.error).toBe('forbidden_seo_fields')
    expect(body.fields).toEqual(
      expect.arrayContaining(['unknownField', 'page', 'canonical', 'structuredData', 'og.image', 'twitter.image']),
    )
    expect(upserts).toHaveLength(0)
    expect(rebuildCalls).toBe(0)
  })
})
