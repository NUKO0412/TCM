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
  return (
    <header id="hd">
      <div className="wrap nav">
        <div className="brand">
          <Logo />
          <div>
            <b>{brand.name}</b>
            <span>{brand.tagline}</span>
          </div>
        </div>
        <nav className="menu">
          {nav.map((l) => (
            <a key={l.label} className="lnk" href={l.href}>
              {l.label}
            </a>
          ))}
          {session ? (
            <>
              <button
                type="button"
                className="btn-login"
                onClick={() => void signOut()}
                style={{ background: 'transparent', color: 'var(--cream)', cursor: 'pointer' }}
              >
                <Icon name="i-lock" style={{ width: 15, height: 15 }} /> Déconnexion
              </button>
              {role && <span className="role-tag">{roleLabel(role)}</span>}
            </>
          ) : (
            <Link className="btn-login" to={ROUTES.login}>
              <Icon name="i-lock" style={{ width: 15, height: 15 }} /> {loginLabel}
            </Link>
          )}
        </nav>
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
