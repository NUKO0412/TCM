import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SeoPage } from './SeoPage'
import { useAuth } from '../auth'
import { useSeo } from './useSeo'
import type { SeoData } from '../../config/business'

vi.mock('../auth', () => ({ useAuth: vi.fn() }))
vi.mock('./useSeo', () => ({ useSeo: vi.fn() }))

const mockAuth = vi.mocked(useAuth)
const mockUseSeo = vi.mocked(useSeo)
const fetchMock = vi.fn()

const seoData: SeoData = {
  title: 'Title test',
  h1: 'H1 test',
  description: 'Description test',
  keywords: ['kw1', 'kw2'],
  canonical: 'https://www.tcmagencement.fr/',
  og: {
    title: 'OG title test',
    description: 'OG description test',
    image: 'https://www.tcmagencement.fr/og.png',
  },
  twitter: {
    title: 'Twitter title test',
    description: 'Twitter description test',
    image: 'https://www.tcmagencement.fr/twitter.png',
  },
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    name: 'TCM Agencement',
  },
  geo: {
    areaServed: ['Lorient', 'Lanester'],
    services: ['menuiserie sur mesure', 'agencement intérieur'],
  },
  searchConsole: {
    indexed: true,
    clicks: 12,
    impressions: 340,
    ctr: 0.035,
    position: 4.2,
    queries: [{ query: 'tcm agencement', clicks: 3, impressions: 50, ctr: 0.06, position: 2.5 }],
    topQueries: [{ query: 'tcm agencement', clicks: 3, impressions: 50, position: 2.5 }],
    pages: [{ page: 'https://www.tcmagencement.fr/', clicks: 3, impressions: 50, ctr: 0.06, position: 2.5 }],
    source: 'google_search_console',
    fetchedAt: '2026-07-07T09:15:00.000Z',
    period: { startDate: '2026-06-07', endDate: '2026-07-04' },
  },
}

const baseAuth = {
  session: { access_token: 'token' } as never,
  roleResolved: true,
  loading: false,
  signIn: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn(),
  updatePassword: vi.fn(),
}

function renderSeo(role: 'admin' | 'super_admin', data: SeoData = seoData) {
  mockAuth.mockReturnValue({ ...baseAuth, role })
  mockUseSeo.mockReturnValue({
    row: { data, updated_at: '2026-07-07T10:00:00.000Z' },
    loading: false,
    error: null,
  })

  return render(
    <MemoryRouter>
      <SeoPage />
    </MemoryRouter>,
  )
}

function controlByValue(value: string | RegExp) {
  return screen.getByDisplayValue(value) as HTMLInputElement | HTMLTextAreaElement
}

function readonlyValue(value: string | RegExp) {
  return screen.getByText(value)
}

const editableValues = [
  'Title test',
  'H1 test',
  'Description test',
  'kw1, kw2',
  'OG title test',
  'OG description test',
  'Twitter title test',
  'Twitter description test',
  'menuiserie sur mesure, agencement intérieur',
]

const lockedValues = [
  '/',
  'https://www.tcmagencement.fr/',
  'https://www.tcmagencement.fr/og.png',
  'https://www.tcmagencement.fr/twitter.png',
  'Lorient, Lanester',
]

describe('SeoPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: true, rebuild: 'triggered' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )
  })

  it('affiche toutes les cartes SEO et les pastilles aide', () => {
    renderSeo('super_admin')

    for (const label of [
      'Source SEO TCM',
      'Page',
      'Title',
      'H1',
      'Meta description',
      'Keywords',
      'Canonical',
      'OG title',
      'OG description',
      'OG image',
      'Twitter title',
      'Twitter description',
      'Twitter image',
      'JSON-LD',
      'Zones GEO ciblées',
      'Services GEO principaux',
      'Google Search Console',
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }

    expect(screen.getAllByRole('button', { name: 'Aide' })).toHaveLength(18)
    fireEvent.focus(screen.getAllByRole('button', { name: 'Aide' })[0])
    expect(screen.getByText(/Indique d’où viennent les données SEO affichées ici/)).toBeInTheDocument()
    expect(screen.getByText('Dernière récupération')).toBeInTheDocument()
    expect(screen.getByText('Période analysée')).toBeInTheDocument()
    expect(screen.getByText('CTR')).toBeInTheDocument()
    expect(screen.getByText('3.50 %')).toBeInTheDocument()
    expect(screen.getByText('Top pages')).toBeInTheDocument()
    expect(screen.getByText('07/07/2026 11:15')).toBeInTheDocument()
    expect(screen.getByText('2026-06-07 → 2026-07-04')).toBeInTheDocument()
    expect(screen.queryByText('Intégration · SEO')).toBeNull()
    expect(screen.queryByText('/api/seo-ingest')).toBeNull()
    expect(screen.getByRole('button', { name: 'Sauvegarder la SEO' })).toBeEnabled()
  })

  it('laisse le super admin modifier uniquement les champs rédactionnels SEO/GEO non synchronisés', () => {
    renderSeo('super_admin')

    for (const value of editableValues) {
      expect(controlByValue(value).readOnly).toBe(false)
    }

    for (const value of lockedValues) {
      expect(screen.queryByDisplayValue(value)).toBeNull()
      expect(readonlyValue(value)).toHaveStyle({ cursor: 'default', outline: 'none' })
    }
    expect(readonlyValue(/"@type": "GeneralContractor"/)).toHaveStyle({ cursor: 'default', overflow: 'auto' })
  })

  it('garde un admin normal en lecture seule avec la même structure visible', () => {
    renderSeo('admin')

    for (const value of [...editableValues, ...lockedValues]) {
      expect(screen.queryByDisplayValue(value)).toBeNull()
      expect(readonlyValue(value)).toHaveStyle({ cursor: 'default', outline: 'none' })
    }
    expect(readonlyValue(/"@type": "GeneralContractor"/)).toHaveStyle({ cursor: 'default', overflow: 'auto' })
    expect(screen.getByText('Zones GEO ciblées')).toBeInTheDocument()
    expect(screen.getByText('Services GEO principaux')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Aide' })).toHaveLength(18)
    expect(screen.getByRole('button', { name: 'Sauvegarder la SEO' })).toBeDisabled()
  })

  it('remplit Zones GEO ciblées depuis les villes si la valeur SEO est vide', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true, areaServed: ['Lorient', 'Hennebont', 'Ploemeur'] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )

    renderSeo('admin', { ...seoData, geo: { ...seoData.geo, areaServed: [] } })

    await waitFor(() => expect(screen.getByText('Lorient, Hennebont, Ploemeur')).toBeInTheDocument())
    expect(fetchMock).toHaveBeenCalledWith('/api/seo-geo-sync', {
      method: 'POST',
      headers: { authorization: 'Bearer token' },
    })
  })

  it('sauvegarde uniquement les champs autorisés côté super admin', async () => {
    renderSeo('super_admin')

    fireEvent.click(screen.getByRole('button', { name: 'Sauvegarder la SEO' }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    const payload = JSON.parse(String(init.body)) as Record<string, unknown>

    expect(payload).toMatchObject({
      page: '/',
      title: 'Title test',
      h1: 'H1 test',
      description: 'Description test',
      keywords: ['kw1', 'kw2'],
      og: { title: 'OG title test', description: 'OG description test' },
      twitter: { title: 'Twitter title test', description: 'Twitter description test' },
      geo: {
        services: ['menuiserie sur mesure', 'agencement intérieur'],
      },
    })
    expect(payload).not.toHaveProperty('canonical')
    expect(payload).not.toHaveProperty('structuredData')
    expect(payload.og).not.toHaveProperty('image')
    expect(payload.twitter).not.toHaveProperty('image')
  })
})
