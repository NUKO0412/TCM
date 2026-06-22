import { content } from '../data/content'

// Faits stables de l'entreprise — source unique pour le <head> SEO et le JSON-LD.
// On réutilise data/content.ts quand le fait y figure déjà ; on n'ajoute ici que
// ce qui n'y est pas (url, adresse complète, géo, réseaux, image OG, mots-clés).

const SITE_URL = 'https://www.tcmagencement.fr'

const telephoneAffiche = content.contact.info.find((i) => i.icon === 'i-phone')?.text ?? '06 31 01 07 57'
const telephoneIntl = '+33631010757'
const email = content.contact.info.find((i) => i.icon === 'i-mail')?.text ?? 'theo.caheric@gmail.com'
const services = [...content.prestations.cards.map((c) => c.title), ...content.prestations.chips]

// Title + description de référence (repli quand public.seo est vide).
const TITLE = 'TCM Agencement — menuiserie & agencement sur mesure à Lorient (Morbihan)'
const DESCRIPTION =
  'Menuiserie & agencement sur mesure à Lorient et dans tout le Morbihan : cuisines, dressings, parquet, portes, bibliothèques, escaliers, terrasses bois. Fabrication et pose soignées par un artisan local.'

export const business = {
  name: content.header.brand.name, // « TCM Agencement »
  url: SITE_URL,
  telephone: telephoneAffiche,
  telephoneIntl,
  email,
  areaServed: content.zone.villes, // Lorient, Lanester, Hennebont, Ploemeur, Guidel, Vannes, Morbihan, Finistère
  services,
  address: {
    streetAddress: '152 rue Édouard Branly',
    postalCode: '56600',
    addressLocality: 'Lanester',
    addressRegion: 'Morbihan',
    addressCountry: 'FR',
  },
  // Coordonnées approximatives du centre de Lanester (à affiner si la position
  // exacte de l'atelier est connue).
  geo: { latitude: 47.7689, longitude: -3.3408 },
  sameAs: ['https://www.instagram.com/tcm_agencements/', 'https://www.facebook.com/profile.php?id=61556346415173'],
  ogImage: `${SITE_URL}/og.png`,
  logo: `${SITE_URL}/favicon.png`,
  themeColor: '#16140F',
  keywords: [
    'menuiserie Lorient',
    'agencement sur mesure Morbihan',
    'cuisine sur mesure Lorient',
    'dressing sur mesure',
    'parquet Lorient',
    'terrasse bois Morbihan',
    'menuisier Lanester',
    'TCM Agencement',
  ],
}

export function buildJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    additionalType: 'https://schema.org/HomeAndConstructionBusiness',
    name: business.name,
    description: DESCRIPTION,
    url: business.url,
    image: business.ogImage,
    logo: business.logo,
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
    geo: { '@type': 'GeoCoordinates', latitude: business.geo.latitude, longitude: business.geo.longitude },
    areaServed: business.areaServed,
    sameAs: business.sameAs,
    makesOffer: business.services.map((name) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } })),
  }
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

// Contenu du <head> à injecter dans le HTML servi (métas + Open Graph + Twitter
// + géo + JSON-LD). Le <title> est renvoyé à part (remplacé par le prerender).
// `seo` (depuis public.seo) surcharge title/description/keywords/og si présent.
export function buildHead(seo: SeoData | null): { title: string; tags: string } {
  const title = seo?.title ?? TITLE
  const description = seo?.description ?? DESCRIPTION
  const keywords = (seo?.keywords?.length ? seo.keywords : business.keywords).join(', ')
  const ogTitle = seo?.og?.title ?? title
  const ogDescription = seo?.og?.description ?? description
  const ogImage = seo?.og?.image ?? business.ogImage
  const tags = [
    `<meta name="description" content="${esc(description)}" />`,
    `<meta name="keywords" content="${esc(keywords)}" />`,
    `<meta name="author" content="${esc(business.name)}" />`,
    `<meta name="theme-color" content="${business.themeColor}" />`,
    `<link rel="canonical" href="${business.url}/" />`,
    // Géolocalisation
    `<meta name="geo.region" content="FR-56" />`,
    `<meta name="geo.placename" content="Lanester, Lorient, Morbihan" />`,
    `<meta name="geo.position" content="${business.geo.latitude};${business.geo.longitude}" />`,
    `<meta name="ICBM" content="${business.geo.latitude}, ${business.geo.longitude}" />`,
    // Open Graph
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(business.name)}" />`,
    `<meta property="og:locale" content="fr_FR" />`,
    `<meta property="og:url" content="${business.url}/" />`,
    `<meta property="og:title" content="${esc(ogTitle)}" />`,
    `<meta property="og:description" content="${esc(ogDescription)}" />`,
    `<meta property="og:image" content="${esc(ogImage)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:type" content="image/png" />`,
    `<meta property="og:image:alt" content="${esc(business.name)} — menuiserie & agencement sur mesure" />`,
    // Twitter
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(ogTitle)}" />`,
    `<meta name="twitter:description" content="${esc(ogDescription)}" />`,
    `<meta name="twitter:image" content="${esc(ogImage)}" />`,
    // Données structurées
    `<script type="application/ld+json">${JSON.stringify(buildJsonLd())}</script>`,
  ].join('\n    ')
  return { title, tags }
}
