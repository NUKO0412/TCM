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
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [recoveryState, setRecoveryState] = useState<'idle' | 'processing' | 'failed'>('idle')

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if (!accessToken || !refreshToken) return

    let cancelled = false
    setRecoveryState('processing')

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
          <input
            type="password"
            name="new-password"
            id="new-password"
            autoComplete="new-password"
            minLength={MIN_LENGTH}
            placeholder="Créer un mot de passe fort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label>Confirmer le mot de passe</label>
          <input
            type="password"
            name="confirm-password"
            id="confirm-password"
            autoComplete="new-password"
            minLength={MIN_LENGTH}
            placeholder="Confirmer le mot de passe"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
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
