import type { SupabaseClient } from '@supabase/supabase-js'

export type TcmSupabaseClient = SupabaseClient

let clientPromise: Promise<TcmSupabaseClient> | null = null

export function loadSupabase(): Promise<TcmSupabaseClient> {
  clientPromise ??= import('./supabase').then((module) => module.supabase)
  return clientPromise
}

export function hasStoredSupabaseSession(): boolean {
  if (typeof window === 'undefined') return false
  try {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i)
      if (!key) continue
      if ((key.startsWith('sb-') && key.endsWith('-auth-token')) || key === 'supabase.auth.token') {
        return true
      }
    }
  } catch {
    return false
  }
  return false
}

export function hasSupabaseRecoveryTokens(): boolean {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  return Boolean(params.get('access_token') && params.get('refresh_token'))
}
