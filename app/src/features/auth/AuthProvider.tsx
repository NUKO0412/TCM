import { useEffect, useState, useCallback, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
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
    const { data } = await supabase.from('profiles').select('role').eq('id', s.user.id).maybeSingle()
    setRole((data?.role as Role | undefined) ?? null)
    setRoleResolved(true)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      await loadRole(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      void loadRole(s)
    })
    return () => sub.subscription.unsubscribe()
  }, [loadRole])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider value={{ session, role, roleResolved, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
