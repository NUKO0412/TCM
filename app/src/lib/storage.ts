import { supabase } from './supabase'

const BUCKET = 'site-media'

// Détecte une photo iPhone (HEIC/HEIF) par son type MIME ou son extension.
const isHeic = (file: File) =>
  /image\/hei[cf]/i.test(file.type) || /\.(heic|heif)$/i.test(file.name)

// Upload d'une image dans le bucket public, renvoie l'URL publique.
// Les photos iPhone (HEIC/HEIF) ne s'affichent pas dans les navigateurs : on les
// convertit en JPEG côté navigateur AVANT l'envoi. Le convertisseur est importé
// dynamiquement (chargé uniquement si une photo HEIC est déposée) pour ne pas
// alourdir le site pour tout le monde.
export async function uploadImage(file: File): Promise<string> {
  let data: Blob = file
  let ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  let contentType: string | undefined = file.type || undefined

  if (isHeic(file)) {
    const heic2any = (await import('heic2any')).default
    const out = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 })
    data = Array.isArray(out) ? out[0] : out
    ext = 'jpg'
    contentType = 'image/jpeg'
  }

  const name = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(name, data, {
    cacheControl: '31536000',
    contentType,
    upsert: false,
  })
  if (error) throw error
  return supabase.storage.from(BUCKET).getPublicUrl(name).data.publicUrl
}
