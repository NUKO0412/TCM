import { useEffect, useMemo, useState, useCallback, useRef, type ReactNode } from 'react'
import { supabase } from '../../lib/supabase'
import { assemble } from './assemble'
import { ContentContext } from './content-context'
import { ContentStoreContext, type StoreItem } from './store-context'
import type { SectionRow, ItemRow } from './rows'
import type { SiteContent } from '../../data/types'
import { useAuth } from '../auth'

// Deep-set immuable, compatible objets ET tableaux.
// setPath({a:{b:1}}, 'a.b', 2) -> {a:{b:2}} ; setPath({f:[{t:'x'}]}, 'f.0.t', 'y')
function setPath(target: unknown, path: string, value: unknown): unknown {
  const [head, ...rest] = path.split('.')
  const asArray = Array.isArray(target)
  const idx = Number(head)
  const useIndex = asArray && Number.isInteger(idx)

  const leaf = rest.length === 0
  const nextChild = leaf
    ? value
    : setPath((useIndex ? (target as unknown[])[idx] : (target as Record<string, unknown>)?.[head]) ?? {}, rest.join('.'), value)

  if (useIndex) {
    const copy = [...(target as unknown[])]
    copy[idx] = nextChild
    return copy
  }
  return { ...((target as Record<string, unknown>) ?? {}), [head]: nextChild }
}

const now = () => new Date().toISOString()

export function ContentProvider({ children }: { children: ReactNode }) {
  const { session, role } = useAuth()
  const canRefresh = Boolean(session && (role === 'admin' || role === 'super_admin'))

  // Photo des données figée au build (index.html) : permet d'afficher le contenu
  // dès le premier rendu, identique au HTML pré-rendu (hydratation sans flash).
  // Absente en dev ou si le pré-rendu a échoué → comportement d'origine (vide
  // jusqu'au fetch Supabase ci-dessous).
  const snapshot = globalThis.__TCM_CONTENT__
  const initialSections = (snapshot?.sections as SectionRow[] | undefined) ?? []
  const initialItems = (snapshot?.items as ItemRow[] | undefined) ?? []

  const [sections, setSections] = useState<SectionRow[]>(initialSections)
  const [items, setItems] = useState<ItemRow[]>(initialItems)
  const [ready, setReady] = useState(Boolean(snapshot))
  const [error, setError] = useState<string | null>(null)

  // Sources de vérité synchrones : la donnée à écrire est TOUJOURS lue ici,
  // jamais via l'effet de bord d'un setState (qui n'est pas garanti synchrone).
  const sectionsRef = useRef<SectionRow[]>(initialSections)
  const itemsRef = useRef<ItemRow[]>(initialItems)
  const commitSections = useCallback((next: SectionRow[]) => {
    sectionsRef.current = next
    setSections(next)
  }, [])
  const commitItems = useCallback((next: ItemRow[]) => {
    itemsRef.current = next
    setItems(next)
  }, [])

  useEffect(() => {
    let active = true
    let timer: ReturnType<typeof window.setTimeout> | undefined

    const load = async () => {
      const [s, i] = await Promise.all([
        supabase.from('content_sections').select('key,data'),
        supabase.from('content_items').select('id,collection,ord,data'),
      ])
      if (!active) return
      if (s.error || i.error) {
        setError(s.error?.message ?? i.error?.message ?? 'Erreur de chargement')
        return
      }
      commitSections(s.data as SectionRow[])
      commitItems(i.data as ItemRow[])
      setReady(true)
    }

    const startLoad = () => {
      if (snapshot && !canRefresh) return
      if (snapshot) {
        timer = window.setTimeout(() => {
          void load()
        }, 1600)
        return
      }
      void load()
    }

    if (snapshot && document.readyState !== 'complete') {
      window.addEventListener('load', startLoad, { once: true })
    } else {
      startLoad()
    }

    return () => {
      active = false
      window.removeEventListener('load', startLoad)
      if (timer) window.clearTimeout(timer)
    }
  }, [canRefresh, commitSections, commitItems, snapshot])

  const content = useMemo<SiteContent | null>(
    () => (ready ? assemble(sections, items) : null),
    [ready, sections, items],
  )

  // --- Mutateurs (optimiste local + persistance Supabase, fiables) ----------

  const updateSection = useCallback(
    async (key: string, path: string, value: unknown) => {
      const cur = sectionsRef.current.find((r) => r.key === key)
      if (!cur) return
      const nextData = setPath(cur.data, path, value) as Record<string, unknown>
      commitSections(sectionsRef.current.map((r) => (r.key === key ? { ...r, data: nextData } : r)))
      const { error } = await supabase
        .from('content_sections')
        .update({ data: nextData, updated_at: now() })
        .eq('key', key)
      if (error) console.error('updateSection', error.message)
    },
    [commitSections],
  )

  const updateItem = useCallback(
    async (id: string, field: string, value: unknown) => {
      const cur = itemsRef.current.find((r) => r.id === id)
      if (!cur) return
      const nextData = { ...cur.data, [field]: value }
      commitItems(itemsRef.current.map((r) => (r.id === id ? { ...r, data: nextData } : r)))
      const { error } = await supabase
        .from('content_items')
        .update({ data: nextData, updated_at: now() })
        .eq('id', id)
      if (error) console.error('updateItem', error.message)
    },
    [commitItems],
  )

  const addItem = useCallback(
    async (collection: string, data: Record<string, unknown>) => {
      const ord =
        itemsRef.current.filter((r) => r.collection === collection).reduce((m, r) => Math.max(m, r.ord), -1) + 1
      const { data: inserted, error } = await supabase
        .from('content_items')
        .insert({ collection, ord, data })
        .select('id,collection,ord,data')
        .single()
      if (error || !inserted) {
        console.error('addItem', error?.message)
        return
      }
      commitItems([...itemsRef.current, inserted as ItemRow])
    },
    [commitItems],
  )

  const removeItem = useCallback(
    async (id: string) => {
      commitItems(itemsRef.current.filter((r) => r.id !== id))
      const { error } = await supabase.from('content_items').delete().eq('id', id)
      if (error) console.error('removeItem', error.message)
    },
    [commitItems],
  )

  const reorderItems = useCallback(
    async (collection: string, orderedIds: string[]) => {
      commitItems(
        itemsRef.current.map((r) =>
          r.collection === collection && orderedIds.includes(r.id)
            ? { ...r, ord: orderedIds.indexOf(r.id) }
            : r,
        ),
      )
      const results = await Promise.all(
        orderedIds.map((id, ord) => supabase.from('content_items').update({ ord, updated_at: now() }).eq('id', id)),
      )
      const failed = results.find((r) => r.error)
      if (failed?.error) console.error('reorderItems', failed.error.message)
    },
    [commitItems],
  )

  const getItems = useCallback(
    (collection: string): StoreItem[] =>
      items
        .filter((r) => r.collection === collection)
        .sort((a, b) => a.ord - b.ord)
        .map((r) => ({ id: r.id, data: r.data })),
    [items],
  )

  const store = useMemo(
    () => ({ getItems, updateSection, updateItem, addItem, removeItem, reorderItems }),
    [getItems, updateSection, updateItem, addItem, removeItem, reorderItems],
  )

  if (error) {
    return (
      <div style={fullScreen}>
        <p style={{ fontFamily: 'var(--mono)', color: 'var(--muted)', fontSize: 13 }}>
          Contenu indisponible — {error}
        </p>
      </div>
    )
  }
  if (!content) return <div style={fullScreen} />

  return (
    <ContentContext.Provider value={content}>
      <ContentStoreContext.Provider value={store}>{children}</ContentStoreContext.Provider>
    </ContentContext.Provider>
  )
}

const fullScreen: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--ink)',
  display: 'grid',
  placeItems: 'center',
}
