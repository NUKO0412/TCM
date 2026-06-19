import { createContext } from 'react'

export interface StoreItem {
  id: string
  data: Record<string, unknown>
}

// API de mutation du contenu (utilisée par la couche d'édition, Lot 4).
export interface ContentStore {
  getItems: (collection: string) => StoreItem[]
  updateSection: (key: string, path: string, value: unknown) => Promise<void>
  updateItem: (id: string, field: string, value: unknown) => Promise<void>
  addItem: (collection: string, data: Record<string, unknown>) => Promise<void>
  removeItem: (id: string) => Promise<void>
  reorderItems: (collection: string, orderedIds: string[]) => Promise<void>
}

export const ContentStoreContext = createContext<ContentStore | undefined>(undefined)
