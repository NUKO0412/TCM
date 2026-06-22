import { content } from '../data/content'

// Faits stables de l'entreprise. Le SEO éditorial vient de public.seo
// (injection Hubelly). Ici on garde seulement l'identité + un repli minimal.

const SITE_URL = 'https://www.tcmagencement.fr'

const telephoneAffiche = content.contact.info.find((i) => i.icon === 'i-phone')?.text ?? '06 31 01 07 57'
const telephoneIntl = '+33631010757'
const email = content.contact.info.find((i) => i.icon === 'i-mail')?.text ?? 'theo.caheric@gmail.com'

const TITLE_FALLBACK = 'TCM Agencement'
const DESCRIPTION_FALLBACK = 'Menuiserie et agencement sur mesure à Lorient et dans le Morbihan.'

export const business = {
  name: content.header.brand.name,
  url: SITE_URL,
  telephone: telephoneAffiche,
  telephoneIntl,
  email,
  address: {
    streetAddress: '152 rue Édouard Branly',
    postalCode: '56600',
    addressLocality: 'Lanester',
    addressRegion: 'Morbihan',
    addressCountry: 'FR',
  },
  sameAs: ['https://www.instagram.com/tcm_agencements/', 'https://www.facebook.com/profile.php?id=61556346415173'],
}

export function buildJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    additionalType: 'https://schema.org/HomeAndConstructionBusiness',
    name: business.name,
    description: DESCRIPTION_FALLBACK,
    url: business.url,
    telephone: business.telephoneIntl,
    email: business.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.streetAddress,
      postalCode: business.address.postalCode,
      addressLocality: business.address.addressLocality,
      addressRegion: business.address.addressRegion,
      addressCountry: business.address.addressCountry,
    },
    sameAs: business.sameAs,
  }
}

export interface SeoData {
  title?: string
  description?: string
  h1?: string
  keywords?: string[]
  og?: { title?: string; description?: string; image?: string }
  structuredData?: Record<string, unknown>
  searchConsole?: {
    indexed?: boolean | null
    status?: string
    clicks?: number
    impressions?: number
    position?: number | null
    topQueries?: Array<{ query: string; clicks?: number; impressions?: number; position?: number | null }>
  }
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// Contenu du <head> livré aux robots. Le SEO éditorial vient de public.seo.
// Si public.seo est vide, on ne sert qu'un repli title/description minimal.
export function buildHead(seo: SeoData | null): { title: string; tags: string } {
  const title = seo?.title ?? TITLE_FALLBACK
  const description = seo?.description ?? DESCRIPTION_FALLBACK
  const jsonLd = seo?.structuredData ?? buildJsonLd()
  const tags = [
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${business.url}/" />`,
    ...(seo?.keywords?.length ? [`<meta name="keywords" content="${esc(seo.keywords.join(', '))}" />`] : []),
    ...(seo?.og
      ? [
          `<meta property="og:type" content="website" />`,
          `<meta property="og:site_name" content="${esc(business.name)}" />`,
          `<meta property="og:locale" content="fr_FR" />`,
          `<meta property="og:url" content="${business.url}/" />`,
          `<meta property="og:title" content="${esc(seo.og.title ?? title)}" />`,
          `<meta property="og:description" content="${esc(seo.og.description ?? description)}" />`,
          ...(seo.og.image ? [`<meta property="og:image" content="${esc(seo.og.image)}" />`] : []),
          `<meta name="twitter:card" content="summary_large_image" />`,
          `<meta name="twitter:title" content="${esc(seo.og.title ?? title)}" />`,
          `<meta name="twitter:description" content="${esc(seo.og.description ?? description)}" />`,
          ...(seo.og.image ? [`<meta name="twitter:image" content="${esc(seo.og.image)}" />`] : []),
        ]
      : []),
    `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
  ].join('\n    ')
  return { title, tags }
}
