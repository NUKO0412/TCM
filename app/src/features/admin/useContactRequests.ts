import { useCallback, useEffect, useState } from 'react'
import { loadSupabase } from '../../lib/loadSupabase'

export interface ContactRequest {
  id: string
  nom: string | null
  prenom: string | null
  email: string | null
  telephone: string | null
  ville: string | null
  type_projet: string | null
  message: string | null
  is_read: boolean
  created_at: string
}

export function useContactRequests() {
  const [list, setList] = useState<ContactRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const supabase = await loadSupabase()
    const { data, error } = await supabase
      .from('contact_requests')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setList(data as ContactRequest[])
    setLoading(false)
  }, [])

  useEffect(() => {
    void (async () => {
      await load()
    })()
  }, [load])

  const markRead = useCallback(async (id: string, is_read: boolean) => {
    setList((l) => l.map((r) => (r.id === id ? { ...r, is_read } : r)))
    const supabase = await loadSupabase()
    const { error } = await supabase.from('contact_requests').update({ is_read }).eq('id', id)
    if (error) console.error('markRead', error.message)
  }, [])

  const remove = useCallback(async (id: string) => {
    setList((l) => l.filter((r) => r.id !== id))
    const supabase = await loadSupabase()
    const { error } = await supabase.from('contact_requests').delete().eq('id', id)
    if (error) console.error('remove', error.message)
  }, [])

  return { list, loading, error, markRead, remove, reload: load }
}
