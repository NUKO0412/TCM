import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'
import { ROUTES } from '../../config/routes'

// Page unique de connexion (/connexion).
// - mode « login » : signInWithPassword → retour au site.
// - mode « forgot » : resetPasswordForEmail → email de récupération.
export function LoginPage() {
  const { session, signIn, resetPassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // Notice transmise après un changement de mot de passe (depuis /reinitialisation).
  const notice = (location.state as { notice?: string } | null)?.notice ?? null
  const [mode, setMode] = useState<'login' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (session) return <Navigate to={ROUTES.home} replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setInfo(null)
    const { error } = await signIn(email.trim(), password)
    setBusy(false)
    if (error) {
      setError('Identifiants incorrects.')
      return
    }
    navigate(ROUTES.home, { replace: true })
  }

  async function onForgot(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setInfo(null)
    const { error } = await resetPassword(email.trim())
    setBusy(false)
    if (error) {
      setError("Impossible d'envoyer l'email pour le moment. Réessayez.")
      return
    }
    // Message neutre (on ne révèle pas si l'email existe).
    setInfo('Si un compte correspond à cet email, un lien de réinitialisation vient d’être envoyé.')
  }

  function switchMode(next: 'login' | 'forgot') {
    setMode(next)
    setError(null)
    setInfo(null)
  }

  return (
    <main style={wrap}>
      <form
        className="form"
        style={{ width: 380, maxWidth: '100%' }}
        onSubmit={mode === 'login' ? onSubmit : onForgot}
      >
        <span className="eyebrow" style={{ color: 'var(--oak-2)' }}>
          Espace administrateur
        </span>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 30, margin: '14px 0 24px' }}>
          {mode === 'login' ? 'Connexion' : 'Mot de passe oublié'}
        </h1>

        {notice && mode === 'login' && (
          <p style={{ color: 'var(--oak-2)', fontSize: 13, marginBottom: 12 }}>{notice}</p>
        )}

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

        {mode === 'login' && (
          <div className="field">
            <label>Mot de passe</label>
            <div style={passwordField}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={passwordInput}
                required
              />
              <button
                type="button"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                onClick={() => setShowPassword((visible) => !visible)}
                style={eyeButton}
              >
                <EyeIcon crossed={showPassword} />
              </button>
            </div>
          </div>
        )}

        {error && <p style={{ color: '#e0a070', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        {info && <p style={{ color: 'var(--oak-2)', fontSize: 13, marginBottom: 12 }}>{info}</p>}

        <button className="btn btn-primary" type="submit" disabled={busy}>
          {mode === 'login'
            ? busy
              ? 'Connexion…'
              : 'Se connecter'
            : busy
              ? 'Envoi…'
              : 'Envoyer le lien'}
        </button>

        <div className="legal" style={{ marginTop: 18, display: 'grid', gap: 8 }}>
          {mode === 'login' ? (
            <button
              type="button"
              onClick={() => switchMode('forgot')}
              style={linkBtn}
            >
              Mot de passe oublié ?
            </button>
          ) : (
            <button
              type="button"
              onClick={() => switchMode('login')}
              style={linkBtn}
            >
              ← Retour à la connexion
            </button>
          )}
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

// Lien stylé comme du texte (pas de fond bouton) pour les bascules de mode.
const linkBtn: React.CSSProperties = {
  background: 'none',
  border: 0,
  padding: 0,
  textAlign: 'left',
  color: 'var(--muted)',
  cursor: 'pointer',
  font: 'inherit',
}

const passwordField: React.CSSProperties = {
  position: 'relative',
}

const passwordInput: React.CSSProperties = {
  paddingRight: 48,
}

const eyeButton: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  right: 8,
  transform: 'translateY(-50%)',
  width: 34,
  height: 34,
  display: 'grid',
  placeItems: 'center',
  border: 0,
  borderRadius: 6,
  background: 'transparent',
  color: 'var(--muted)',
  cursor: 'pointer',
  padding: 0,
}

function EyeIcon({ crossed }: { crossed: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path
        d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {crossed && (
        <path
          d="M4 4l16 16"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}
