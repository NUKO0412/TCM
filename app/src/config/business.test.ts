import { describe, it, expect } from 'vitest'
import { buildHead } from './business'

describe('buildHead (SEO injectée pour les robots)', () => {
  it('utilise le repli quand aucune donnée SEO (table vide)', () => {
    const { title, tags } = buildHead(null)
    expect(title).toMatch(/TCM Agencement/)
    expect(tags).toContain('<meta name="description"')
    expect(tags).toContain('<meta property="og:image" content="https://www.tcmagencement.fr/og.png"')
    expect(tags).toContain('application/ld+json')
  })

  it('utilise les données reçues quand elles existent', () => {
    const { title, tags } = buildHead({
      title: 'Titre Hubelly',
      description: 'Desc Hubelly',
      keywords: ['menuiserie', 'lorient'],
      og: { title: 'OG Titre', image: 'https://www.tcmagencement.fr/custom.png' },
    })
    expect(title).toBe('Titre Hubelly')
    expect(tags).toContain('<meta property="og:title" content="OG Titre"')
    expect(tags).toContain('content="https://www.tcmagencement.fr/custom.png"')
  })

  it('échappe les caractères dangereux', () => {
    const { tags } = buildHead({ description: 'a & <b> "c"' })
    expect(tags).toContain('&amp;')
    expect(tags).not.toContain('<b>')
  })
})
