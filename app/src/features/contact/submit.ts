import { loadSupabase } from '../../lib/loadSupabase'

export interface ContactPayload {
  nom: string
  prenom: string
  email: string
  telephone: string
  ville: string
  type_projet: string
  message: string
}

// Enregistre une demande de contact (insert public autorisé par la RLS), puis
// déclenche l'envoi des e-mails côté serveur (/api/contact).
// L'id est généré ici : la RLS interdit le SELECT anon, donc on ne peut pas le
// récupérer via un RETURNING — on le crée et on le passe à la fonction serveur.
// L'envoi e-mail est best-effort : s'il échoue, la demande est déjà enregistrée
// (notified reste false, visible dans le back-office, ré-essayable).
export async function submitContactRequest(payload: ContactPayload) {
  const id = crypto.randomUUID()
  const supabase = await loadSupabase()
  const { error } = await supabase.from('contact_requests').insert({ ...payload, id })
  if (error) throw error

  try {
    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id }),
    })
  } catch (e) {
    console.error('contact notify', e)
  }
}
