import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'

export type Role = 'admin' | 'super_admin'

export interface AuthState {
  session: Session | null
  role: Role | null
  roleResolved: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  // Envoie l'email Supabase de récupération (lien vers /reinitialisation).
  resetPassword: (email: string) => Promise<{ error: string | null }>
  // Définit le nouveau mot de passe du compte connecté (session de récupération).
  updatePassword: (password: string) => Promise<{ error: string | null }>
}

export const AuthContext = createContext<AuthState | undefined>(undefined)
