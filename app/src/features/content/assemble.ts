import type {
  SiteContent,
  CredCell,
  PrestaCard,
  Step,
  Shot,
  FaqItem,
} from '../../data/types'
import type { SectionRow, ItemRow } from './rows'

// Reconstruit l'objet SiteContent (forme identique à data/types.ts) à partir
// des lignes Supabase : singletons (content_sections) + listes (content_items).
export function assemble(sectionRows: SectionRow[], itemRows: ItemRow[]): SiteContent {
  const sections = new Map(sectionRows.map((r) => [r.key, r.data as Record<string, unknown>]))
  const items = (collection: string): unknown[] =>
    itemRows
      .filter((r) => r.collection === collection)
      .sort((a, b) => a.ord - b.ord)
      .map((r) => r.data)

  const section = <T>(key: string): T => {
    const data = sections.get(key)
    if (!data) throw new Error(`Section de contenu manquante : "${key}"`)
    return data as T
  }

  const prestaMeta = section<Omit<SiteContent['prestations'], 'cards' | 'chips'>>('prestations')
  const methodeMeta = section<Omit<SiteContent['methode'], 'steps'>>('methode')
  const realMeta = section<Omit<SiteContent['realisations'], 'shots'>>('realisations')
  const zoneMeta = section<Omit<SiteContent['zone'], 'villes'>>('zone')
  const contactMeta = section<Omit<SiteContent['contact'], 'projectTypes'>>('contact')

  // FAQ tolérante : la section peut être absente (base pas encore alimentée).
  const faqMeta = sections.get('faq') as { eyebrow: string; heading: string } | undefined
  const faq = faqMeta ? { ...faqMeta, items: items('faq') as FaqItem[] } : undefined

  return {
    header: section('header'),
    hero: section('hero'),
    cred: items('cred') as CredCell[],
    about: section('about'),
    prestations: {
      ...prestaMeta,
      cards: items('presta_cards') as PrestaCard[],
      chips: (items('chips') as { text: string }[]).map((c) => c.text),
    },
    methode: {
      ...methodeMeta,
      steps: items('methode_steps') as Step[],
    },
    realisations: {
      ...realMeta,
      shots: items('realisations') as Shot[],
    },
    zone: {
      ...zoneMeta,
      villes: (items('villes') as { name: string }[]).map((v) => v.name),
    },
    ...(faq ? { faq } : {}),
    contact: {
      ...contactMeta,
      projectTypes: (items('project_types') as { value: string }[]).map((p) => p.value),
    },
    footer: section('footer'),
  }
}
