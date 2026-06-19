import { createContext } from 'react'
import type { SiteContent } from '../../data/types'

// Le contenu est garanti non-null pour les enfants : le provider n'affiche
// le site qu'une fois le contenu chargé.
export const ContentContext = createContext<SiteContent | undefined>(undefined)
