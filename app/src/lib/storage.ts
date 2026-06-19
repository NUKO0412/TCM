import { supabase } from './supabase'

const BUCKET = 'site-media'

// Upload d'une image dans le bucket public, renvoie l'URL publique.
export async function uploadImage(file: File): Promise<string> {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const name = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(name, file, {
    cacheControl: '3600',
    contentType: file.type || undefined,
    upsert: false,
  })
  if (error) throw error
  return supabase.storage.from(BUCKET).getPublicUrl(name).data.publicUrl
}
