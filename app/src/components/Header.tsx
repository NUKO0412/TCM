import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../features/content'
import { useAuth } from '../features/auth'
import { Logo } from './Logo'
import { Icon } from './IconDefs'
import { ROUTES } from '../config/routes'

const roleLabel = (role: string | null) =>
  role === 'super_admin' ? 'Super Admin' : role === 'admin' ? 'Admin' : ''

export function Header() {
  const { brand, nav, loginLabel } = useContent().header
  const { session, role, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const goHome = () => {
    setOpen(false)
    if (window.location.pathname !== ROUTES.home) return
    window.history.replaceState(null, '', ROUTES.home)
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }
  return (
    <header id="hd">
      <div className="wrap nav">
        <Link className="brand" to={ROUTES.home} aria-label="Retour à l’accueil TCM Agencement" onClick={goHome}>
          <Logo />
          <div>
            <b>{brand.name}</b>
            <span>{brand.tagline}</span>
          </div>
        </Link>
        <nav className="menu">
          {nav.map((l) => (
            <a key={l.label} className="lnk" href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        {/* Zone d'authentification à largeur réservée : le bouton et le libellé de
            rôle gardent une position fixe, connecté ou non, donc les liens (centrés)
            ne bougent plus entre les deux états. */}
        <div className="nav-auth">
          {session ? (
            <button
              type="button"
              className="btn-login"
              onClick={() => void signOut()}
              style={{ background: 'transparent', color: 'var(--cream)', cursor: 'pointer' }}
            >
              <Icon name="i-lock" style={{ width: 15, height: 15 }} /> Déconnexion
            </button>
          ) : (
            <Link className="btn-login" to={ROUTES.login}>
              <Icon name="i-lock" style={{ width: 15, height: 15 }} /> {loginLabel}
            </Link>
          )}
          <span className="role-tag">{session && role ? roleLabel(role) : ''}</span>
        </div>
        <button
          type="button"
          className="burger"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name="i-menu" />
        </button>
      </div>
      {open && (
        <div className="mobnav" onClick={() => setOpen(false)}>
          <nav className="mobnav-panel" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="mobnav-close"
              aria-label="Fermer le menu"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
            {nav.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
            {session ? (
              <button
                type="button"
                className="mobnav-login"
                onClick={() => {
                  setOpen(false)
                  void signOut()
                }}
              >
                <Icon name="i-lock" style={{ width: 15, height: 15 }} /> Déconnexion
              </button>
            ) : (
              <Link className="mobnav-login" to={ROUTES.login} onClick={() => setOpen(false)}>
                <Icon name="i-lock" style={{ width: 15, height: 15 }} /> {loginLabel}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
