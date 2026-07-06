import { useEffect, useState } from 'react'
import { loadSupabase } from '../../lib/loadSupabase'
import type { SeoData } from '../../config/business'

// Lecture seule de la ligne SEO d'une page (par défaut « / »).
// La table seo est lisible en anon (policy seo_read) ; aucune écriture ici.
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
