export const SEO_PAGE = '/'
export const SEO_CANONICAL = 'https://www.tcmagencement.fr/'

export const seoSnapshot = {
  title: 'TCM Agencement — menuiserie & agencement sur mesure à Lorient (Morbihan)',
  description:
    'TCM Agencement conçoit et pose vos agencements sur mesure à Lorient, Lanester et dans le Morbihan : cuisines, dressings, portes, parquet, terrasses bois et escaliers.',
  h1: 'Menuisier agenceur sur mesure à Lorient',
  keywords: [
    'menuiserie Lorient',
    'agencement sur mesure Morbihan',
    'cuisine sur mesure Lorient',
    'dressing sur mesure',
    'portes sur mesure',
    'parquet Lorient',
    'terrasse bois Morbihan',
    'escalier bois',
    'menuisier Lanester',
    'TCM Agencement',
  ],
  canonical: SEO_CANONICAL,
  og: {
    title: 'TCM Agencement — menuiserie, agencement et pose sur mesure à Lorient',
    description:
      'Cuisines, dressings, portes, parquet, terrasses bois et escaliers sur mesure à Lorient, Lanester et dans le Morbihan.',
    image: 'https://www.tcmagencement.fr/og.png',
  },
  twitter: {
    title: 'TCM Agencement — menuiserie, agencement et pose sur mesure à Lorient',
    description:
      'Cuisines, dressings, portes, parquet, terrasses bois et escaliers sur mesure à Lorient, Lanester et dans le Morbihan.',
    image: 'https://www.tcmagencement.fr/og.png',
  },
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    additionalType: 'https://schema.org/HomeAndConstructionBusiness',
    name: 'TCM Agencement',
    url: 'https://www.tcmagencement.fr',
    telephone: '+33631010757',
    email: 'theo.caheric@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '152 rue Édouard Branly',
      postalCode: '56600',
      addressLocality: 'Lanester',
      addressRegion: 'Morbihan',
      addressCountry: 'FR',
    },
    sameAs: ['https://www.instagram.com/tcm_agencements/', 'https://www.facebook.com/profile.php?id=61556346415173'],
  },
  geo: {
    areaServed: ['Lorient', 'Lanester', 'Hennebont', 'Ploemeur', 'Guidel', 'Vannes', 'Morbihan', 'Finistère'],
    services: [
      'Menuiserie sur mesure',
      'Agencement intérieur',
      'Cuisines',
      'Dressings',
      'Portes sur mesure',
      'Parquet',
      'Terrasses bois',
      'Escaliers',
    ],
  },
}
