import { useEffect, useState, useCallback, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { ROUTES } from '../../config/routes'
import { AuthContext, type Role } from './auth-context'

// Gère la session Supabase et résout le rôle depuis la table profiles.
// admin et super_admin ont des droits identiques : le rôle est une étiquette.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [roleResolved, setRoleResolved] = useState(false)
  const [loading, setLoading] = useState(true)

  // Récupère le rôle du compte connecté (ou null). roleResolved distingue
  // « rôle pas encore récupéré » de « rôle récupéré = aucun » (non-admin).
  const loadRole = useCallback(async (s: Session | null) => {
    setRoleResolved(false)
    if (!s) {
      setRole(null)
      setRoleResolved(true)
      return
    }
    try {
      const { data } = await supabase.from('profiles').select('role').eq('id', s.user.id).maybeSingle()
      setRole((data?.role as Role | undefined) ?? null)
    } catch {
      setRole(null)
    } finally {
      setRoleResolved(true)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!mounted) return
        setSession(data.session)
        await loadRole(data.session)
      })
      .catch(async () => {
        if (!mounted) return
        setSession(null)
        await loadRole(null)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      void loadRole(s)
    })
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [loadRole])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  // « Mot de passe oublié » : Supabase envoie un email dont le lien ramène sur
  // /reinitialisation (page qui exploite la session de récupération créée au retour).
  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${ROUTES.resetPassword}`,
    })
    return { error: error?.message ?? null }
  }, [])

  // Définit le nouveau mot de passe du compte courant (session de récupération
  // ou session normale). Utilisé par la page /reinitialisation.
  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    return { error: error?.message ?? null }
  }, [])

  return (
    <AuthContext.Provider
      value={{ session, role, roleResolved, loading, signIn, signOut, resetPassword, updatePassword }}
    >
      {children}
    </AuthContext.Provider>
  )
}
