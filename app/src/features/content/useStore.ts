import { useContext } from 'react'
import { ContentStoreContext } from './store-context'

export function useStore() {
  const store = useContext(ContentStoreContext)
  if (!store) throw new Error('useStore doit être utilisé dans <ContentProvider>')
  return store
}
