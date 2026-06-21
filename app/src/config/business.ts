import { content } from '../data/content'

// Faits stables de l'entreprise — source unique pour le JSON-LD et le repli SEO.
// Règle : on réutilise data/content.ts quand le fait y figure déjà ; on n'ajoute
// ici que ce qui n'y est pas (url, adresse postale complète, réseaux, image OG).

const SITE_URL = 'https://www.tcmagencement.fr'

const telephone = content.contact.info.find((i) => i.icon === 'i-phone')?.text ?? ''
const email = content.contact.info.find((i) => i.icon === 'i-mail')?.text ?? ''
const services = [...content.prestations.cards.map((c) => c.title), ...content.prestations.chips]

export const business = {
  name: content.header.brand.name, // « TCM Agencement »
  url: SITE_URL,
  telephone, // depuis content.ts
  email, // depuis content.ts
  areaServed: content.zone.villes, // depuis content.ts
  services, // depuis content.ts (cartes prestations + chips)
  address: {
    streetAddress: '152 rue Édouard Branly',
    postalCode: '56600',
    addressLocality: 'Lanester',
    addressCountry: 'FR',
  },
  sameAs: [
    'https://www.instagram.com/tcm_agencements/',
    'https://www.facebook.com/profile.php?id=61556346415173',
  ],
  ogImage: `${SITE_URL}/og.png`, // bannière TCM (repli ; PNG produit ensuite)
}

export function buildJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    url: business.url,
    telephone: business.telephone,
    email: business.email,
    address: { '@type': 'PostalAddress', ...business.address },
    areaServed: business.areaServed,
    makesOffer: business.services.map((name) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name },
    })),
    sameAs: business.sameAs,
  }
}

// Repli quand public.seo est vide (avant la première réception Hubelly).
const FALLBACK = {
  title: 'TCM Agencement — menuiserie & agencement sur mesure à Lorient (Morbihan)',
  description: content.footer.brandDesc,
}

export interface SeoData {
  title?: string
  description?: string
  keywords?: string[]
  og?: { title?: string; description?: string; image?: string }
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// Contenu du <head> à injecter dans le HTML servi (title + métas + JSON-LD).
export function buildHead(seo: SeoData | null): { title: string; tags: string } {
  const title = seo?.title ?? FALLBACK.title
  const description = seo?.description ?? FALLBACK.description
  const ogTitle = seo?.og?.title ?? title
  const ogDescription = seo?.og?.description ?? description
  const ogImage = seo?.og?.image ?? business.ogImage
  const tags = [
    `<meta name="description" content="${esc(description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${business.url}/" />`,
    `<meta property="og:title" content="${esc(ogTitle)}" />`,
    `<meta property="og:description" content="${esc(ogDescription)}" />`,
    `<meta property="og:image" content="${esc(ogImage)}" />`,
    `<script type="application/ld+json">${JSON.stringify(buildJsonLd())}</script>`,
  ].join('\n    ')
  return { title, tags }
}
