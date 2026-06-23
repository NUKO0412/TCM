import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from './useAuth'
import { ROUTES } from '../../config/routes'

const MIN_LENGTH = 12

// Page atterrissage du lien email « mot de passe oublié » (/reinitialisation).
// Supabase, au retour, ouvre une session de récupération (detectSessionInUrl) :
// l'utilisateur définit alors son nouveau mot de passe via updateUser({ password }).
export function ResetPasswordPage() {
  const { session, loading, updatePassword, signOut } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  // État initial calculé au rendu (les jetons sont dans l'URL dès l'arrivée) :
  // évite de fixer 'processing' dans l'effet (cascade de rendus).
  const [recoveryState, setRecoveryState] = useState<'idle' | 'processing' | 'failed'>(() => {
    const p = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    return p.get('access_token') && p.get('refresh_token') ? 'processing' : 'idle'
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if (!accessToken || !refreshToken) return

    let cancelled = false

    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (cancelled) return
        if (error) {
          setError('Le lien de réinitialisation est invalide, expiré ou déjà utilisé.')
          setRecoveryState('failed')
          return
        }
        window.history.replaceState(null, '', window.location.pathname)
        setRecoveryState('idle')
      })
      .catch(() => {
        if (cancelled) return
        setError('Impossible de préparer la réinitialisation. Demandez un nouveau lien.')
        setRecoveryState('failed')
      })

    return () => {
      cancelled = true
    }
  }, [])

  // Tant que la session de récupération n'est pas résolue, on patiente.
  if (loading || recoveryState === 'processing') {
    return (
      <main style={wrap}>
        <div className="form" style={card}>
          <h1 style={title}>Préparation du mot de passe</h1>
          <p style={muted}>Vérification du lien sécurisé…</p>
        </div>
      </main>
    )
  }

  // Pas de session = lien absent, déjà utilisé ou expiré.
  if (!session) {
    return (
      <main style={wrap}>
        <div className="form" style={card}>
          <h1 style={title}>Lien invalide ou expiré</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 18 }}>
            {error ??
              'Le lien de réinitialisation n’est plus valable. Demandez-en un nouveau depuis la page de connexion.'}
          </p>
          <Link className="btn btn-primary" to={ROUTES.login}>
            Aller à la connexion
          </Link>
        </div>
      </main>
    )
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < MIN_LENGTH) {
      setError(`Le mot de passe doit faire au moins ${MIN_LENGTH} caractères.`)
      return
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }
    setBusy(true)
    const { error } = await updatePassword(password)
    if (error) {
      setBusy(false)
      setError('La mise à jour a échoué. Réessayez ou redemandez un lien.')
      return
    }
    // On déconnecte la session de récupération : l'utilisateur se reconnecte
    // proprement avec son nouveau mot de passe.
    await signOut()
    navigate(ROUTES.login, {
      replace: true,
      state: { notice: 'Mot de passe modifié. Connectez-vous avec votre nouveau mot de passe.' },
    })
  }

  return (
    <main style={wrap}>
      <form className="form" style={card} onSubmit={onSubmit}>
        <span className="eyebrow" style={{ color: 'var(--oak-2)' }}>
          Espace administrateur
        </span>
        <h1 style={title}>Nouveau mot de passe</h1>
        <input
          type="email"
          name="username"
          autoComplete="username"
          value={session.user?.email ?? ''}
          readOnly
          hidden
        />
        <div className="field">
          <label>Nouveau mot de passe</label>
          <div style={passwordField}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="new-password"
              id="new-password"
              autoComplete="new-password"
              minLength={MIN_LENGTH}
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
        <div className="field">
          <label>Confirmer le mot de passe</label>
          <div style={passwordField}>
            <input
              type={showConfirm ? 'text' : 'password'}
              name="confirm-password"
              id="confirm-password"
              autoComplete="new-password"
              minLength={MIN_LENGTH}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              style={passwordInput}
              required
            />
            <button
              type="button"
              aria-label={showConfirm ? 'Masquer la confirmation' : 'Afficher la confirmation'}
              onClick={() => setShowConfirm((visible) => !visible)}
              style={eyeButton}
            >
              <EyeIcon crossed={showConfirm} />
            </button>
          </div>
        </div>
        <p style={hint}>
          Utilisez un mot de passe long. Firefox peut proposer et enregistrer un mot de passe fort sur
          ces champs.
        </p>
        {error && <p style={{ color: '#e0a070', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Enregistrement…' : 'Définir le mot de passe'}
        </button>
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

const card: React.CSSProperties = { width: 380, maxWidth: '100%' }

const title: React.CSSProperties = {
  fontFamily: 'var(--serif)',
  fontSize: 30,
  margin: '14px 0 24px',
}

const muted: React.CSSProperties = { color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 13 }

const hint: React.CSSProperties = {
  color: 'var(--muted)',
  fontSize: 13,
  lineHeight: 1.5,
  margin: '-4px 0 14px',
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
