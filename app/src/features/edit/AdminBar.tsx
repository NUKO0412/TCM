import { Link, useNavigate } from 'react-router-dom'
import { useEditMode } from './useEditMode'
import { useAuth } from '../auth'
import { ROUTES } from '../../config/routes'

// Les boutons Modifier / Messages / Déconnexion, placés juste sous le header,
// uniquement quand on est connecté en tant qu'éditeur.
export function AdminBar() {
  const { canEdit, editing, toggle } = useEditMode()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  if (!canEdit) return null

  async function onSignOut() {
    await signOut()
    navigate(ROUTES.home, { replace: true })
  }

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
      <button type="button" className="admin-dock-btn" onClick={onSignOut}>
        Déconnexion
      </button>
    </div>
  )
}
