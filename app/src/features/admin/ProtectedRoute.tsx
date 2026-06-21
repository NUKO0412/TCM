import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../auth'
import { ROUTES } from '../../config/routes'

const screen: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--ink)',
  display: 'grid',
  placeItems: 'center',
  color: 'var(--muted)',
  fontFamily: 'var(--mono)',
  fontSize: 13,
}

// Route réservée aux éditeurs (admin/super_admin). Sinon → /connexion.
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, role, roleResolved, loading } = useAuth()
  if (loading) return <div style={screen}>…</div>
  if (!session) return <Navigate to={ROUTES.login} replace />
  if (!roleResolved) return <div style={screen}>…</div> // rôle en cours de résolution
  if (role !== 'admin' && role !== 'super_admin') return <Navigate to="/" replace />
  return <>{children}</>
}
