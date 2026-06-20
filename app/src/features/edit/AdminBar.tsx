import { Link } from 'react-router-dom'
import { useEditMode } from './useEditMode'
import { ROUTES } from '../../config/routes'

// Les deux boutons Modifier / Messages, placés juste sous le header,
// uniquement quand on est connecté en tant qu'éditeur.
export function AdminBar() {
  const { canEdit, editing, toggle } = useEditMode()
  if (!canEdit) return null
  return (
    <div className="admin-dock">
      <button
        type="button"
        className="admin-dock-btn"
        data-active={editing ? '1' : undefined}
        onClick={toggle}
      >
        {editing ? 'Terminer' : 'Modifier'}
      </button>
      <Link className="admin-dock-btn" to={ROUTES.adminMessages}>
        Messages
      </Link>
    </div>
  )
}
