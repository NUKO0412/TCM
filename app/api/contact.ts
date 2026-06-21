// Envoi des e-mails d'une demande de contact via Resend.
// POST /api/contact { id } — lit la ligne contact_requests par id avec la clé service,
// envoie 2 e-mails (vers Théo + accusé prospect), puis passe notified=true.
// N'ENVOIE QUE si notified=false (garde anti-rejeu, idempotent).
// Tous les secrets viennent de l'environnement serveur, jamais du front.
export const config = { runtime: 'edge' }

const TO_THEO = 'theo.caheric@gmail.com' // destinataire fixe (décision projet)
const RESEND_ENDPOINT = 'https://api.resend.com/emails'

interface ContactRow {
  id: string
  nom: string | null
  prenom: string | null
  email: string | null
  telephone: string | null
  ville: string | null
  type_projet: string | null
  message: string | null
  notified: boolean
  created_at: string
}

function reply(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}

// Garde d'origine : l'endpoint n'est appelé que par le formulaire du site.
// On refuse tout appel dont l'Origin/Referer n'est pas le domaine TCM.
const ALLOWED_HOST = 'tcmagencement.fr'
const hostOf = (v: string): string => { try { return new URL(v).host } catch { return '' } }
const allowedHost = (h: string): boolean => h === ALLOWED_HOST || h.endsWith('.' + ALLOWED_HOST)

const isText = (v: unknown): v is string => typeof v === 'string' && v.trim() !== ''
const isEmail = (v: unknown): v is string => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

async function sendEmail(
  key: string,
  msg: { from: string; to: string[]; reply_to?: string; subject: string; html: string; text: string },
): Promise<{ ok: boolean; status: number; detail?: string }> {
  const res = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify(msg),
  })
  if (res.ok) return { ok: true, status: res.status }
  const detail = await res.text().catch(() => '')
  return { ok: false, status: res.status, detail: detail.slice(0, 300) }
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return reply(405, { error: 'method_not_allowed' })

  // Refuse les appels d'une origine étrangère (anti-déclenchement cross-site).
  // Si Origin est présent il fait foi ; sinon on retombe sur Referer ; si aucun
  // des deux n'est présent, on laisse passer (anti-rejeu + UUID protègent déjà).
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  if (origin && !allowedHost(hostOf(origin))) return reply(403, { error: 'forbidden_origin' })
  if (!origin && referer && !allowedHost(hostOf(referer))) return reply(403, { error: 'forbidden_origin' })

  let body: { id?: unknown }
  try {
    body = (await request.json()) as { id?: unknown }
  } catch {
    return reply(400, { error: 'invalid_json' })
  }
  if (!isText(body.id)) return reply(400, { error: 'missing_id' })

  const resendKey = process.env.RESEND_API_KEY
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!resendKey || !supabaseUrl || !serviceKey) return reply(500, { error: 'server_misconfigured' })

  // Lecture authentique de la ligne (clé service, contourne la RLS).
  const read = await fetch(
    `${supabaseUrl}/rest/v1/contact_requests?id=eq.${encodeURIComponent(body.id)}&select=*&limit=1`,
    { headers: { apikey: serviceKey, authorization: `Bearer ${serviceKey}` } },
  )
  if (!read.ok) return reply(502, { error: 'read_failed', status: read.status })
  const rows = (await read.json()) as ContactRow[]
  const row = rows[0]
  if (!row) return reply(404, { error: 'not_found' })

  // Garde anti-rejeu : déjà notifiée → on ne renvoie rien.
  if (row.notified) return reply(200, { ok: true, already_notified: true })

  const fromAddr = process.env.CONTACT_FROM ?? 'onboarding@resend.dev'
  const from = fromAddr.includes('<') ? fromAddr : `TCM Agencement <${fromAddr}>`
  const fullName = [row.prenom, row.nom].filter(Boolean).join(' ') || 'Sans nom'
  const date = new Date(row.created_at).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  })

  // E-mail 1 — vers Théo (Reply-To = prospect pour répondre direct depuis Gmail).
  const lines: [string, string | null][] = [
    ['Nom', fullName],
    ['Email', row.email],
    ['Téléphone', row.telephone],
    ['Ville', row.ville],
    ['Type de projet', row.type_projet],
    ['Date', date],
  ]
  const theoText =
    `Nouvelle demande de contact — TCM Agencement\n\n` +
    lines.map(([k, v]) => `${k} : ${v || '—'}`).join('\n') +
    `\n\nMessage :\n${row.message || '—'}`
  const theoHtml =
    `<h2 style="font-family:Georgia,serif">Nouvelle demande de contact</h2>` +
    `<table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">` +
    lines.map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#777">${k}</td><td style="padding:4px 0"><b>${esc(v || '—')}</b></td></tr>`).join('') +
    `</table>` +
    `<p style="font-family:Arial,sans-serif;font-size:14px;white-space:pre-wrap;margin-top:16px">${esc(row.message || '—')}</p>`

  const theoMsg = {
    from,
    to: [TO_THEO],
    subject: `Nouvelle demande — ${fullName} · ${row.type_projet || 'projet'}`,
    html: theoHtml,
    text: theoText,
    ...(isEmail(row.email) ? { reply_to: row.email } : {}),
  }
  const theoSend = await sendEmail(resendKey, theoMsg)

  // E-mail 2 — accusé de réception au prospect (best-effort ; Reply-To = Gmail de Théo).
  let ackSend: { ok: boolean; status: number; detail?: string } | null = null
  if (isEmail(row.email)) {
    const ackText =
      `Bonjour ${row.prenom || ''},\n\n` +
      `Nous avons bien reçu votre demande et nous vous recontactons rapidement.\n\n` +
      `Rappel de votre message :\n${row.message || '—'}\n\n` +
      `À très vite,\nTCM Agencement — menuiserie & agencement, Lorient`
    const ackHtml =
      `<p style="font-family:Arial,sans-serif;font-size:14px">Bonjour ${esc(row.prenom || '')},</p>` +
      `<p style="font-family:Arial,sans-serif;font-size:14px">Nous avons bien reçu votre demande et nous vous recontactons rapidement.</p>` +
      `<p style="font-family:Arial,sans-serif;font-size:14px;color:#555">Rappel de votre message :<br><span style="white-space:pre-wrap">${esc(row.message || '—')}</span></p>` +
      `<p style="font-family:Arial,sans-serif;font-size:14px">À très vite,<br><b>TCM Agencement</b> — menuiserie &amp; agencement, Lorient</p>`
    ackSend = await sendEmail(resendKey, {
      from,
      to: [row.email],
      reply_to: TO_THEO,
      subject: 'Votre demande a bien été reçue — TCM Agencement',
      html: ackHtml,
      text: ackText,
    })
  }

  // notified=true dès que l'e-mail principal (vers Théo) est parti.
  let notified = false
  if (theoSend.ok) {
    const patch = await fetch(`${supabaseUrl}/rest/v1/contact_requests?id=eq.${encodeURIComponent(body.id)}`, {
      method: 'PATCH',
      headers: {
        apikey: serviceKey,
        authorization: `Bearer ${serviceKey}`,
        'content-type': 'application/json',
        prefer: 'return=minimal',
      },
      body: JSON.stringify({ notified: true }),
    })
    notified = patch.ok
  }

  return reply(theoSend.ok ? 200 : 502, {
    ok: theoSend.ok,
    notified,
    theo: theoSend,
    ack: ackSend,
  })
}
