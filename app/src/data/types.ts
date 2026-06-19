// Modèle de contenu du site — calqué sur les futures tables Supabase.
// Couche de données locales : aucune dépendance externe à ce stade.

export interface Img {
  src: string
  alt: string
}

export interface NavLink {
  label: string
  href: string
}

export interface Header {
  brand: { name: string; tagline: string }
  nav: NavLink[]
  loginLabel: string
}

export interface Cta {
  label: string
  href: string
  kind: 'primary' | 'ghost'
}

export interface Hero {
  bg: Img
  eyebrow: string
  // Titre découpé pour rendre l'emphase italique sans HTML brut.
  title: { pre: string; em: string; post: string }
  sub: string
  ctas: Cta[]
}

export interface CredCell {
  n: string
  t: string
  d: string
}

export interface About {
  eyebrow: string
  heading: string
  paragraph: string
  feats: { k: string; text: string }[]
  figure: {
    img: Img
    tick: string
    tag: { title: string; sub: string }
  }
}

export interface PrestaCard {
  num: string
  icon: string // clé d'icône, ex. "i-plank"
  title: string
  text: string
}

export interface Prestations {
  eyebrow: string
  heading: string
  lead: string
  cards: PrestaCard[]
  chips: string[]
  cta: NavLink
}

export interface Step {
  k: string
  title: string
  text: string
}

export interface Methode {
  eyebrow: string
  heading: string
  steps: Step[]
}

export interface Shot {
  span: string // classe de span, ex. "s-a"
  images: Img[] // 1 à 3 photos (carrousel)
  category: string
  title: string
}

export interface Realisations {
  eyebrow: string
  heading: string
  cta: NavLink
  shots: Shot[]
}

export interface Zone {
  eyebrow: string
  heading: string
  paragraph: string
  villes: string[]
}

export interface ContactInfo {
  icon: string
  text: string
}

export interface Contact {
  eyebrow: string
  heading: string
  intro: string
  info: ContactInfo[]
  projectTypes: string[]
  legal: string
  submitLabel: string
}

export interface FooterCol {
  title: string
  links: NavLink[]
}

export interface Footer {
  brandDesc: string
  columns: FooterCol[]
  bottom: { left: string; right: string }
}

export interface SiteContent {
  header: Header
  hero: Hero
  cred: CredCell[]
  about: About
  prestations: Prestations
  methode: Methode
  realisations: Realisations
  zone: Zone
  contact: Contact
  footer: Footer
}
