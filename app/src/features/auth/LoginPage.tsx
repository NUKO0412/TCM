import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { ROUTES } from '../../config/routes'

// Page unique de connexion (/connexion). signInWithPassword → retour au site.
export function LoginPage() {
  const { session, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (session) return <Navigate to={ROUTES.home} replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await signIn(email.trim(), password)
    setBusy(false)
    if (error) {
      setError('Identifiants incorrects.')
      return
    }
    navigate(ROUTES.home, { replace: true })
  }

  return (
    <main style={wrap}>
      <form className="form" style={{ width: 380, maxWidth: '100%' }} onSubmit={onSubmit}>
        <span className="eyebrow" style={{ color: 'var(--oak-2)' }}>
          Espace administrateur
        </span>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 30, margin: '14px 0 24px' }}>Connexion</h1>
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            name="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label>Mot de passe</label>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && (
          <p style={{ color: '#e0a070', fontSize: 13, marginBottom: 12 }}>{error}</p>
        )}
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Connexion…' : 'Se connecter'}
        </button>
        <div className="legal" style={{ marginTop: 18 }}>
          <Link to="/" style={{ color: 'var(--muted)' }}>
            ← Retour au site
          </Link>
        </div>
      </form>
    </main>
  )
}

const wrap: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--ink)',
  display: 'grid',
  placeItems: 'center',
  padding: '40px 18px',
}
