import type { SiteContent } from './types'

// SOURCE DE SEED (Lot 2) — depuis le Lot 2, les composants ne lisent plus ce
// fichier : ils chargent le contenu depuis Supabase via useContent().
// Ce fichier alimente la base au seed (supabase/seed/seed.ts) et sert de repli.
// Contenu de démo assumé (téléphone, photos Unsplash, adresses) — inchangé.

export const content: SiteContent = {
  header: {
    brand: { name: 'TCM Agencement', tagline: 'Menuiserie · Lorient' },
    nav: [
      { label: 'Accueil', href: '#' },
      { label: 'Prestations', href: '#presta' },
      { label: 'Réalisations', href: '#real' },
      { label: "Zone d'intervention", href: '#zone' },
      { label: 'Contact', href: '#contact' },
    ],
    loginLabel: 'Connexion',
  },

  hero: {
    bg: {
      src: 'https://images.unsplash.com/photo-1601058268499-e52658b8bb88?w=1900&q=82&auto=format&fit=crop',
      alt: "Menuisier au travail à l'atelier",
    },
    eyebrow: 'Menuiserie · Agencement — Lorient, Morbihan',
    title: { pre: 'Le bois travaillé ', em: 'sur mesure', post: ', posé avec précision.' },
    sub: 'Cuisines, dressings, parquets, portes, bibliothèques, escaliers, terrasses et agencements bois — pour les particuliers comme pour les professionnels, à Lorient et dans tout le Morbihan.',
    ctas: [
      { label: 'Demander un devis', href: '#contact', kind: 'primary' },
      { label: 'Voir les prestations', href: '#presta', kind: 'ghost' },
    ],
  },

  cred: [
    { n: '15+', t: 'années de métier', d: 'Un artisan, pas une enseigne.' },
    { n: '100%', t: 'sur mesure', d: 'Conçu et ajusté à votre lieu.' },
    { n: '3', t: 'départements', d: 'Morbihan, Finistère, selon projet.' },
    { n: 'A→Z', t: 'conception & pose', d: 'Du croquis aux finitions.' },
  ],

  about: {
    eyebrow: 'Le savoir-faire',
    heading: 'Un artisan local, basé à Lorient, qui fabrique et pose lui-même.',
    paragraph:
      "Chaque projet commence par une visite et un relevé précis. On dessine, on fabrique ou on prépare en atelier, puis on pose proprement chez vous — particulier ou professionnel. Pas de sous-traitance anonyme : le même artisan du premier échange aux finitions.",
    feats: [
      { k: '01', text: 'Travail entièrement sur mesure' },
      { k: '02', text: 'Pose soignée, finitions au millimètre' },
      { k: '03', text: 'Fabrication & agencement intérieur / extérieur' },
      { k: '04', text: 'Projets particuliers et professionnels' },
    ],
    figure: {
      img: {
        src: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1100&q=82&auto=format&fit=crop',
        alt: 'Relevé et plan technique',
      },
      tick: 'Relevé · plan · pose',
      tag: { title: 'Lorient · Morbihan', sub: 'Intervention Vannes & Finistère selon projet' },
    },
  },

  prestations: {
    eyebrow: 'Prestations',
    heading: "Ce que l'atelier réalise",
    lead: "De la pièce unique à l'agencement complet d'un intérieur, en bois massif comme en panneau.",
    cards: [
      { num: '01', icon: 'i-plank', title: 'Parquet flottant & massif', text: 'Pose nette, calepinage soigné, plinthes et seuils ajustés.' },
      { num: '02', icon: 'i-door', title: 'Portes sur mesure', text: 'Fabrication et pose adaptées à chaque ouverture et style.' },
      { num: '03', icon: 'i-kitchen', title: 'Cuisines & plans de travail', text: 'Pose de cuisines, plans sur mesure, finitions précises.' },
      { num: '04', icon: 'i-books', title: 'Bibliothèques', text: 'Rangements bois pensés et ajustés à la pièce.' },
      { num: '05', icon: 'i-dress', title: 'Dressings, placards, armoires', text: 'Chaque mètre optimisé, aménagements intérieurs nets.' },
      { num: '06', icon: 'i-deck', title: 'Terrasses & structures bois', text: 'Extérieur, habillages bois, contours de piscine.' },
    ],
    chips: ['Escaliers', 'Plans de travail', 'Agencement intérieur complet'],
    cta: { label: 'Parler de mon projet', href: '#contact' },
  },

  methode: {
    eyebrow: 'Méthode',
    heading: 'Du premier échange au chantier fini.',
    steps: [
      { k: 'ÉTAPE 01', title: 'Échange sur le besoin', text: "On cadre l'usage, le style et le budget." },
      { k: 'ÉTAPE 02', title: 'Prise de mesures', text: 'Relevé précis sur place.' },
      { k: 'ÉTAPE 03', title: 'Proposition technique', text: 'Plan, matériaux, devis clair.' },
      { k: 'ÉTAPE 04', title: 'Fabrication', text: 'Préparation en atelier.' },
      { k: 'ÉTAPE 05', title: 'Pose sur chantier', text: 'Installation soignée chez vous.' },
      { k: 'ÉTAPE 06', title: 'Finitions', text: 'Réglages, retouches, propreté.' },
    ],
  },

  realisations: {
    eyebrow: 'Réalisations',
    heading: 'Quelques chantiers',
    cta: { label: "Voir d'autres réalisations", href: '#contact' },
    shots: [
      { span: 's-a', images: [{ src: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1300&q=82&auto=format&fit=crop', alt: '' }], category: 'Cuisine', title: 'Cuisine sur mesure' },
      { span: 's-b', images: [{ src: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=900&q=82&auto=format&fit=crop', alt: '' }], category: 'Bibliothèque', title: 'Rangements bois' },
      { span: 's-c', images: [{ src: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=82&auto=format&fit=crop', alt: '' }], category: 'Dressing', title: 'Mobilier ajusté' },
      { span: 's-f', images: [{ src: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=900&q=82&auto=format&fit=crop', alt: '' }], category: 'Parquet', title: 'Intérieur & sols' },
      { span: 's-d', images: [{ src: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=82&auto=format&fit=crop', alt: '' }], category: 'Agencement', title: 'Séjour bois' },
      { span: 's-e', images: [{ src: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=82&auto=format&fit=crop', alt: '' }], category: 'Porte', title: 'Détail menuisé' },
    ],
  },

  zone: {
    eyebrow: "Zone d'intervention",
    heading: 'Lorient et tout le Morbihan.',
    paragraph:
      'TCM Agencement intervient principalement à Lorient, Lanester, Hennebont, Ploemeur, Guidel et Vannes, dans tout le Morbihan et, selon le projet, dans le Finistère.',
    villes: ['Lorient', 'Lanester', 'Hennebont', 'Ploemeur', 'Guidel', 'Vannes', 'Morbihan', 'Finistère'],
  },

  contact: {
    eyebrow: 'Contact',
    heading: 'Parlons de votre projet.',
    intro: 'Décrivez votre besoin en quelques lignes : on vous rappelle pour fixer une visite et un devis clair.',
    info: [
      { icon: 'i-pin', text: 'Lorient · Morbihan (56)' },
      { icon: 'i-phone', text: '02 97 00 00 00' },
      { icon: 'i-mail', text: 'contact@tcm-agencement.fr' },
    ],
    projectTypes: ['Cuisine', 'Dressing / placard', 'Parquet', 'Bibliothèque', 'Porte sur mesure', 'Terrasse', 'Agencement complet', 'Autre'],
    legal: 'Vos informations restent confidentielles et ne servent qu’à vous recontacter.',
    submitLabel: 'Envoyer ma demande',
  },

  footer: {
    brandDesc:
      'Menuiserie & agencement sur mesure. Fabrication, pose et finitions soignées à Lorient et dans tout le Morbihan.',
    columns: [
      {
        title: 'Navigation',
        links: [
          { label: 'Prestations', href: '#presta' },
          { label: 'Réalisations', href: '#real' },
          { label: "Zone d'intervention", href: '#zone' },
          { label: 'Contact', href: '#contact' },
        ],
      },
      {
        title: 'Accès',
        links: [
          { label: 'Connexion', href: '#' },
          { label: 'Espace administrateur', href: '#' },
          { label: 'Mentions légales', href: '#' },
        ],
      },
    ],
    bottom: {
      left: '© 2026 TCM Agencement — Lorient, Morbihan',
      right: 'Site créé et administré par le super administrateur',
    },
  },
}
