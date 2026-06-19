// Types des lignes telles que stockées dans Supabase.
export interface SectionRow {
  key: string
  data: unknown
}

export interface ItemRow {
  id: string
  collection: string
  ord: number
  data: Record<string, unknown>
}
