import { useContext } from 'react'
import { ContentContext } from './content-context'
import type { SiteContent } from '../../data/types'

// Accès au contenu du site. Garanti disponible : le ContentProvider gate
// le rendu jusqu'au chargement.
export function useContent(): SiteContent {
  const content = useContext(ContentContext)
  if (!content) throw new Error('useContent doit être utilisé dans <ContentProvider>')
  return content
}
