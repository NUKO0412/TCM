import { useEffect, useState } from 'react'
import { loadSupabase } from '../../lib/loadSupabase'
import type { SeoData } from '../../config/business'

// Lecture de la ligne SEO d'une page (par défaut « / »).
// La table seo est lisible en anon ; l'écriture passe par /api/seo-admin
// avec vérification serveur du rôle super_admin.
export interface SeoRow {
  data: SeoData
  updated_at: string
}

export function useSeo(page = '/') {
  const [row, setRow] = useState<SeoRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void (async () => {
      const supabase = await loadSupabase()
      const { data, error } = await supabase
        .from('seo')
        .select('data, updated_at')
        .eq('page', page)
        .maybeSingle()
      if (!active) return
      if (error) setError(error.message)
      else setRow((data as SeoRow) ?? null)
      setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [page])

  return { row, loading, error }
}
