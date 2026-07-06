import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { hasStoredSupabaseSession, hasSupabaseRecoveryTokens } from '../../lib/loadSupabase'
import { AuthContext, type Role } from './auth-context'

// Gère la session Supabase et résout le rôle depuis la table profiles.
// admin et super_admin ont des droits identiques : le rôle est une étiquette.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [shouldLoadAuthOnStart] = useState(() => hasStoredSupabaseSession() || hasSupabaseRecoveryTokens())
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [roleResolved, setRoleResolved] = useState(!shouldLoadAuthOnStart)
  const [loading, setLoading] = useState(shouldLoadAuthOnStart)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    let mounted = true
    if (!shouldLoadAuthOnStart) {
      return () => {
        mounted = false
      }
    }

    void import('./authApi').then(async (api) => {
      if (!mounted) return
      try {
        const state = await api.getCurrentAuthState()
        if (!mounted) return
        setSession(state.session)
        setRole(state.role)
        setRoleResolved(true)
      } catch {
        if (!mounted) return
        setSession(null)
        setRole(null)
        setRoleResolved(true)
      } finally {
        if (mounted) setLoading(false)
      }
      unsubscribeRef.current = await api.subscribeAuthState((nextSession, nextRole) => {
        if (!mounted) return
        setSession(nextSession)
        setRole(nextRole)
        setRoleResolved(true)
      })
    })
    return () => {
      mounted = false
      unsubscribeRef.current?.()
      unsubscribeRef.current = null
    }
  }, [shouldLoadAuthOnStart])

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await import('./authApi').then((api) => api.login(email, password))
    if (!result.error) {
      setSession(result.session)
      setRole(result.role)
      setRoleResolved(true)
    }
    return { error: result.error }
  }, [])

  const signOut = useCallback(async () => {
    await import('./authApi').then((api) => api.signOutSession())
    setSession(null)
    setRole(null)
    setRoleResolved(true)
  }, [])

  // « Mot de passe oublié » : Supabase envoie un email dont le lien ramène sur
  // /reinitialisation (page qui exploite la session de récupération créée au retour).
  const resetPassword = useCallback(async (email: string) => {
    return import('./authApi').then((api) => api.sendPasswordReset(email))
  }, [])

  // Définit le nouveau mot de passe du compte courant (session de récupération
  // ou session normale). Utilisé par la page /reinitialisation.
  const updatePassword = useCallback(async (password: string) => {
    return import('./authApi').then((api) => api.updateCurrentPassword(password))
  }, [])

  return (
    <AuthContext.Provider
      value={{ session, role, roleResolved, loading, signIn, signOut, resetPassword, updatePassword }}
    >
      {children}
    </AuthContext.Provider>
  )
}
