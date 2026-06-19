import { supabase } from '../../lib/supabase'

export interface ContactPayload {
  nom: string
  prenom: string
  email: string
  telephone: string
  ville: string
  type_projet: string
  message: string
}

// Enregistre une demande de contact (insert public autorisé par la RLS).
// L'email réel vers Théo sera câblé au déploiement (drapeau notified=false).
export async function submitContactRequest(payload: ContactPayload) {
  const { error } = await supabase.from('contact_requests').insert(payload)
  if (error) throw error
}
