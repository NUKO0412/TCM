import { useContext } from 'react'
import { EditContext } from './edit-context'

export function useEditMode() {
  const ctx = useContext(EditContext)
  if (!ctx) throw new Error('useEditMode doit être utilisé dans <EditModeProvider>')
  return ctx
}
