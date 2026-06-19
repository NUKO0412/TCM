import { createContext } from 'react'

export interface EditState {
  canEdit: boolean // connecté avec un rôle éditeur
  editing: boolean // mode édition actif
  toggle: () => void
  setEditing: (v: boolean) => void
}

export const EditContext = createContext<EditState | undefined>(undefined)
