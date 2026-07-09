import { content } from '../data/content'
import { SEO_CANONICAL, seoSnapshot } from './seoSnapshot'

// Faits stables de l'entreprise. La SEO éditoriale vient de public.seo,
// administrée dans TCM par le super admin. Le snapshot versionné évite qu'un
// build sans base repasse sur une ancienne valeur pauvre ou externe.

const SITE_URL = 'https://www.tcmagencement.fr'

const telephoneAffiche = content.contact.info.find((i) => i.icon === 'i-phone')?.text ?? '06 31 01 07 57'
const telephoneIntl = '+33631010757'
const email = content.contact.info.find((i) => i.icon === 'i-mail')?.text ?? 'theo.caheric@gmail.com'

const TITLE_FALLBACK = 'TCM Agencement'
const DESCRIPTION_FALLBACK = 'Menuiserie et agencement sur mesure à Lorient et dans le Morbihan.'
const DEFAULT_OG_IMAGE = `${SITE_URL}/og.png`

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
  canonical?: string
  og?: { title?: string; description?: string; image?: string }
  twitter?: { title?: string; description?: string; image?: string }
  structuredData?: Record<string, unknown>
  geo?: {
    areaServed?: string[]
    services?: string[]
  }
  searchConsole?: {
    indexed?: boolean | null
    status?: string
    clicks?: number
    impressions?: number
    ctr?: number
    position?: number | null
    queries?: Array<{ query: string; clicks?: number; impressions?: number; ctr?: number; position?: number | null }>
    topQueries?: Array<{ query: string; clicks?: number; impressions?: number; position?: number | null }>
    pages?: Array<{ page: string; clicks?: number; impressions?: number; ctr?: number; position?: number | null }>
    source?: string
    fetchedAt?: string
    period?: {
      startDate: string
      endDate: string
      label?: string
      days?: number
    }
  }
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function buildStructuredData(source: SeoData, description: string, image: string) {
  const base: Record<string, unknown> = isRecord(source.structuredData) ? source.structuredData : buildJsonLd()
  const areas = source.geo?.areaServed?.filter(Boolean)
  return {
    ...base,
    description: typeof base.description === 'string' ? base.description : description,
    image: typeof base.image === 'string' ? base.image : image,
    ...(areas?.length ? { areaServed: areas } : {}),
  }
}

// Contenu du <head> livré aux robots. Source principale : public.seo interne à
// TCM. Source secondaire : snapshot versionné validé.
export function buildHead(seo: SeoData | null): { title: string; tags: string } {
  const source: SeoData = seo
    ? {
        ...seoSnapshot,
        ...seo,
        og: { ...seoSnapshot.og, ...seo.og },
        twitter: { ...seoSnapshot.twitter, ...seo.twitter },
        geo: { ...seoSnapshot.geo, ...seo.geo },
      }
    : seoSnapshot
  const title = source.title ?? TITLE_FALLBACK
  const description = source.description ?? DESCRIPTION_FALLBACK
  const canonical = source.canonical ?? SEO_CANONICAL
  const ogTitle = source.og?.title ?? title
  const ogDescription = source.og?.description ?? description
  const ogImage = source.og?.image ?? DEFAULT_OG_IMAGE
  const twitterTitle = source.twitter?.title ?? ogTitle
  const twitterDescription = source.twitter?.description ?? ogDescription
  const twitterImage = source.twitter?.image ?? ogImage
  const jsonLd = buildStructuredData(source, description, ogImage)
  const tags = [
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${esc(canonical)}" />`,
    ...(source.keywords?.length ? [`<meta name="keywords" content="${esc(source.keywords.join(', '))}" />`] : []),
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(business.name)}" />`,
    `<meta property="og:locale" content="fr_FR" />`,
    `<meta property="og:url" content="${esc(canonical)}" />`,
    `<meta property="og:title" content="${esc(ogTitle)}" />`,
    `<meta property="og:description" content="${esc(ogDescription)}" />`,
    `<meta property="og:image" content="${esc(ogImage)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(twitterTitle)}" />`,
    `<meta name="twitter:description" content="${esc(twitterDescription)}" />`,
    `<meta name="twitter:image" content="${esc(twitterImage)}" />`,
    `<script type="application/ld+json">${safeJsonLd(jsonLd)}</script>`,
  ].join('\n    ')
  return { title, tags }
}
