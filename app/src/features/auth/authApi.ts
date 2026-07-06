import type { Session } from '@supabase/supabase-js'
import { loadSupabase } from '../../lib/loadSupabase'
import { ROUTES } from '../../config/routes'
import type { Role } from './auth-context'

async function resolveRole(session: Session | null): Promise<Role | null> {
  if (!session) return null
  try {
    const supabase = await loadSupabase()
    const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle()
    return (data?.role as Role | undefined) ?? null
  } catch {
    return null
  }
}

export async function getCurrentAuthState(): Promise<{ session: Session | null; role: Role | null }> {
  const supabase = await loadSupabase()
  const { data } = await supabase.auth.getSession()
  return { session: data.session, role: await resolveRole(data.session) }
}

export async function subscribeAuthState(
  onChange: (session: Session | null, role: Role | null) => void,
): Promise<() => void> {
  const supabase = await loadSupabase()
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    void resolveRole(session).then((role) => onChange(session, role))
  })
  return () => data.subscription.unsubscribe()
}

export async function login(email: string, password: string) {
  const supabase = await loadSupabase()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message, session: null, role: null }
  const state = await getCurrentAuthState()
  return { error: null, ...state }
}

export async function signOutSession(): Promise<void> {
  const supabase = await loadSupabase()
  await supabase.auth.signOut()
}

export async function sendPasswordReset(email: string): Promise<{ error: string | null }> {
  const supabase = await loadSupabase()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}${ROUTES.resetPassword}`,
  })
  return { error: error?.message ?? null }
}

export async function updateCurrentPassword(password: string): Promise<{ error: string | null }> {
  const supabase = await loadSupabase()
  const { error } = await supabase.auth.updateUser({ password })
  return { error: error?.message ?? null }
}
