import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { ROUTES } from '../../config/routes'
import { useContactRequests, type ContactRequest } from './useContactRequests'

export function MessagesPage() {
  const { signOut } = useAuth()
  const { list, loading, error, markRead, remove } = useContactRequests()
  const [openId, setOpenId] = useState<string | null>(null)
  const unread = list.filter((r) => !r.is_read).length

  return (
    <main style={page}>
      <div style={bar}>
        <div>
          <span className="eyebrow" style={{ color: 'var(--oak-2)' }}>
            Back-office
          </span>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 28, marginTop: 8 }}>
            Boîte de réception{' '}
            {unread > 0 && <span style={badge}>{unread} non lu{unread > 1 ? 's' : ''}</span>}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link className="btn-login" to={ROUTES.adminSeo}>
            SEO
          </Link>
          <Link className="btn-login" to="/">
            ← Site
          </Link>
          <button type="button" className="btn-login" onClick={() => void signOut()} style={ghostBtn}>
            Déconnexion
          </button>
        </div>
      </div>

      {loading && <p style={muted}>Chargement…</p>}
      {error && <p style={{ ...muted, color: '#e0a070' }}>Erreur : {error}</p>}
      {!loading && !error && list.length === 0 && <p style={muted}>Aucune demande pour l'instant.</p>}

      <div style={{ display: 'grid', gap: 10 }}>
        {list.map((r) => (
          <Row
            key={r.id}
            r={r}
            open={openId === r.id}
            onToggle={() => {
              setOpenId((id) => (id === r.id ? null : r.id))
              if (!r.is_read) void markRead(r.id, true)
            }}
            onRead={(v) => void markRead(r.id, v)}
            onDelete={() => {
              if (confirm('Supprimer cette demande ?')) void remove(r.id)
            }}
          />
        ))}
      </div>
    </main>
  )
}

function Row({
  r,
  open,
  onToggle,
  onRead,
  onDelete,
}: {
  r: ContactRequest
  open: boolean
  onToggle: () => void
  onRead: (v: boolean) => void
  onDelete: () => void
}) {
  const date = new Date(r.created_at).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  return (
    <div style={{ ...card, borderColor: r.is_read ? 'var(--line-d)' : 'var(--oak)' }}>
      <button type="button" onClick={onToggle} style={rowHead}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!r.is_read && <span style={dot} />}
          <b style={{ fontFamily: 'var(--serif)', fontSize: 17 }}>
            {[r.prenom, r.nom].filter(Boolean).join(' ') || 'Sans nom'}
          </b>
          <span style={muted}>· {r.type_projet || '—'}</span>
        </span>
        <span style={muted}>{date}</span>
      </button>
      {open && (
        <div style={{ padding: '4px 16px 16px' }}>
          <div style={grid}>
            <Field label="Email" value={r.email} />
            <Field label="Téléphone" value={r.telephone} />
            <Field label="Ville" value={r.ville} />
            <Field label="Type de projet" value={r.type_projet} />
          </div>
          {r.message && (
            <p style={{ marginTop: 12, color: '#E5DCC9', fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {r.message}
            </p>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button type="button" className="btn-login" style={ghostBtn} onClick={() => onRead(!r.is_read)}>
              Marquer {r.is_read ? 'non lu' : 'lu'}
            </button>
            <button type="button" className="btn-login" style={delBtn} onClick={onDelete}>
              Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
        {label}
      </div>
      <div style={{ fontSize: 15, color: '#E5DCC9', marginTop: 3 }}>{value || '—'}</div>
    </div>
  )
}

const page: React.CSSProperties = { minHeight: '100vh', background: 'var(--ink)', color: 'var(--cream)', maxWidth: 880, margin: '0 auto', padding: '40px 24px 80px' }
const bar: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 28 }
const muted: React.CSSProperties = { fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }
const badge: React.CSSProperties = { fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.06em', color: 'var(--ink)', background: 'var(--oak-2)', borderRadius: 20, padding: '3px 10px', verticalAlign: 'middle', marginLeft: 8 }
const card: React.CSSProperties = { background: 'var(--ink-2)', border: '1px solid var(--line-d)', borderRadius: 12 }
const rowHead: React.CSSProperties = { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: 16, background: 'transparent', border: 'none', color: 'var(--cream)', cursor: 'pointer', textAlign: 'left', flexWrap: 'wrap' }
const dot: React.CSSProperties = { width: 9, height: 9, borderRadius: '50%', background: 'var(--oak)', flex: '0 0 auto' }
const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, borderTop: '1px solid var(--line-d)', paddingTop: 14 }
const ghostBtn: React.CSSProperties = { background: 'transparent', color: 'var(--cream)', cursor: 'pointer' }
const delBtn: React.CSSProperties = { background: 'transparent', color: '#e0a070', borderColor: 'rgba(224,160,112,.4)', cursor: 'pointer' }
