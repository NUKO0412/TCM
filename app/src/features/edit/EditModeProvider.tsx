import { useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '../auth'
import { EditContext } from './edit-context'

// canEdit = connecté avec un rôle éditeur (admin/super_admin, droits identiques).
// `editing` est dérivé avec `canEdit` : perdre le droit (déconnexion) éteint
// automatiquement le mode édition, sans effet de bord.
export function EditModeProvider({ children }: { children: ReactNode }) {
  const { session, role } = useAuth()
  const canEdit = Boolean(session && (role === 'admin' || role === 'super_admin'))
  const [editing, setEditing] = useState(false)

  const value = useMemo(
    () => ({
      canEdit,
      editing: editing && canEdit,
      toggle: () => setEditing((v) => !v),
      setEditing,
    }),
    [canEdit, editing],
  )

  return <EditContext.Provider value={value}>{children}</EditContext.Provider>
}
