import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'

export type Role = 'admin' | 'super_admin'

export interface AuthState {
  session: Session | null
  role: Role | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthState | undefined>(undefined)
