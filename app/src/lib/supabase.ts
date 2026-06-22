import { createClient } from '@supabase/supabase-js'

// Client front : clé ANON uniquement (publique, soumise à la RLS).
// Les valeurs viennent de app/.env.local (voir app/.env.example).
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured) {
  // Message clair en dev tant que les clés ne sont pas fournies.
  console.warn(
    "Supabase non configuré : renseigne VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans app/.env.local",
  )
}

// Valeurs factices (mais bien formées) si non configuré : évite que createClient
// ne lève une exception au chargement. Les appels échoueront alors proprement,
// gérés par ContentProvider / AuthProvider (pas d'écran blanc).
export const supabase = createClient(
  url ?? 'https://placeholder.supabase.co',
  anonKey ?? 'placeholder-anon-key',
  {
    // Session conservée en localStorage + rafraîchie automatiquement : l'éditeur
    // reste connecté entre les visites (sur la même URL) sans re-saisir.
    // detectSessionInUrl : traite le jeton de récupération du lien email
    // « mot de passe oublié » (événement PASSWORD_RECOVERY) sur /reinitialisation.
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  },
)
