import { loadSupabase } from '../../lib/loadSupabase'
import type { ItemRow, SectionRow } from './rows'

const now = () => new Date().toISOString()

export async function loadContentRows(): Promise<{
  sections: SectionRow[]
  items: ItemRow[]
  error: string | null
}> {
  const supabase = await loadSupabase()
  const [sections, items] = await Promise.all([
    supabase.from('content_sections').select('key,data'),
    supabase.from('content_items').select('id,collection,ord,data'),
  ])
  if (sections.error || items.error) {
    return {
      sections: [],
      items: [],
      error: sections.error?.message ?? items.error?.message ?? 'Erreur de chargement',
    }
  }
  return { sections: sections.data as SectionRow[], items: items.data as ItemRow[], error: null }
}

export async function persistSection(key: string, data: Record<string, unknown>) {
  const supabase = await loadSupabase()
  return supabase.from('content_sections').update({ data, updated_at: now() }).eq('key', key)
}

export async function persistItem(id: string, data: Record<string, unknown>) {
  const supabase = await loadSupabase()
  return supabase.from('content_items').update({ data, updated_at: now() }).eq('id', id)
}

export async function insertItem(collection: string, ord: number, data: Record<string, unknown>) {
  const supabase = await loadSupabase()
  return supabase
    .from('content_items')
    .insert({ collection, ord, data })
    .select('id,collection,ord,data')
    .single()
}

export async function deleteItem(id: string) {
  const supabase = await loadSupabase()
  return supabase.from('content_items').delete().eq('id', id)
}

export async function persistItemOrder(orderedIds: string[]) {
  const supabase = await loadSupabase()
  return Promise.all(
    orderedIds.map((id, ord) =>
      supabase.from('content_items').update({ ord, updated_at: now() }).eq('id', id),
    ),
  )
}

export async function syncSeoGeoAreasFromVilles(): Promise<{ ok: boolean; error?: string }> {
  const supabase = await loadSupabase()
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) return { ok: false, error: 'missing_token' }

  try {
    const res = await fetch('/api/seo-geo-sync', {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
    })
    const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null
    if (!res.ok || !body?.ok) return { ok: false, error: body?.error ?? `HTTP ${res.status}` }
    return { ok: true }
  } catch {
    return { ok: false, error: 'request_failed' }
  }
}
