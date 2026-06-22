import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { ROUTES } from '../../config/routes'
import { useSeo } from './useSeo'

// Onglet SEO en lecture seule : Théo (admin) voit la SEO reçue de Hubelly
// (métas, mots-clés, OG, date) sans pouvoir la modifier. Le bloc « Intégration »
// (URL du point de réception) n'est visible qu'au super-admin ; la clé reste
// un secret serveur et n'est jamais affichée.
export function SeoPage() {
  const { role, signOut } = useAuth()
  const { row, loading, error } = useSeo('/')
  const seo = row?.data ?? null
  const received = Boolean(row)
  const date = row
    ? new Date(row.updated_at).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <main style={page}>
      <div style={bar}>
        <div>
          <span className="eyebrow" style={{ color: 'var(--oak-2)' }}>
            Back-office
          </span>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 28, marginTop: 8 }}>SEO · lecture seule</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link className="btn-login" to={ROUTES.adminMessages}>
            Messages
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

      {!loading && !error && (
        <>
          <div style={{ ...card, padding: 16, marginBottom: 16, borderColor: received ? 'var(--oak)' : 'var(--line-d)' }}>
            <div style={label}>État de la connexion</div>
            <p style={{ marginTop: 6, color: '#E5DCC9', fontSize: 15, lineHeight: 1.5 }}>
              {received
                ? `Données reçues — dernière mise à jour le ${date}.`
                : "Aucune donnée reçue pour l'instant : le site affiche le SEO de repli. Cette page se remplira à la première réception de Hubelly."}
            </p>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            <FieldBlock label="Titre" value={seo?.title} />
            <FieldBlock label="H1" value={seo?.h1} />
            <FieldBlock label="Description" value={seo?.description} />
            <KeywordsBlock keywords={seo?.keywords} />
            <FieldBlock label="OG · titre" value={seo?.og?.title} />
            <FieldBlock label="OG · description" value={seo?.og?.description} />
            <FieldBlock label="OG · image" value={seo?.og?.image} mono />
            <FieldBlock label="Données structurées" value={seo?.structuredData ? 'reçues par injection' : undefined} />
            <SearchConsoleBlock data={seo?.searchConsole} />
          </div>

          {role === 'super_admin' && (
            <div style={{ ...card, padding: 16, marginTop: 20 }}>
              <div style={label}>Intégration · super-admin</div>
              <div style={{ marginTop: 12, display: 'grid', gap: 14 }}>
                <FieldBlock label="Point de réception" value="https://www.tcmagencement.fr/api/seo-ingest" mono flat />
                <FieldBlock label="Méthode" value="POST · en-tête Authorization: Bearer <clé>" mono flat />
                <div>
                  <div style={label}>Clé API</div>
                  <div style={{ fontSize: 14, color: '#E5DCC9', marginTop: 4, lineHeight: 1.5 }}>
                    Stockée comme secret Vercel <code style={code}>SEO_INGEST_KEY</code> — jamais affichée ici.
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  )
}

function SearchConsoleBlock({ data }: { data?: NonNullable<import('../../config/business').SeoData['searchConsole']> }) {
  const indexed =
    data?.indexed === true ? 'Indexée' : data?.indexed === false ? 'Non indexée / en attente' : data?.status
  return (
    <div style={{ ...card, padding: 16 }}>
      <div style={label}>Google Search Console</div>
      <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
        <FieldBlock label="Statut" value={indexed} flat />
        <FieldBlock label="Clics" value={data?.clicks === undefined ? undefined : String(data.clicks)} flat />
        <FieldBlock label="Impressions" value={data?.impressions === undefined ? undefined : String(data.impressions)} flat />
        <FieldBlock label="Position moyenne" value={data?.position == null ? undefined : String(data.position)} flat />
        {data?.topQueries?.length ? (
          <div>
            <div style={label}>Top requêtes</div>
            <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
              {data.topQueries.map((q) => (
                <div key={q.query} style={{ fontSize: 13, color: '#E5DCC9', fontFamily: 'var(--mono)' }}>
                  {q.query} · {q.clicks ?? 0} clic(s) · {q.impressions ?? 0} impression(s)
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function FieldBlock({ label: l, value, mono, flat }: { label: string; value?: string | null; mono?: boolean; flat?: boolean }) {
  return (
    <div style={flat ? undefined : { ...card, padding: 16 }}>
      <div style={label}>{l}</div>
      <div
        style={{
          fontSize: 15,
          color: value ? '#E5DCC9' : 'var(--muted)',
          marginTop: 4,
          lineHeight: 1.5,
          fontFamily: mono ? 'var(--mono)' : 'inherit',
          wordBreak: mono ? 'break-all' : 'normal',
        }}
      >
        {value || '—'}
      </div>
    </div>
  )
}

function KeywordsBlock({ keywords }: { keywords?: string[] }) {
  return (
    <div style={{ ...card, padding: 16 }}>
      <div style={label}>Mots-clés</div>
      {keywords && keywords.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {keywords.map((k) => (
            <span key={k} style={chip}>
              {k}
            </span>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 15, color: 'var(--muted)', marginTop: 4 }}>—</div>
      )}
    </div>
  )
}

const page: React.CSSProperties = { minHeight: '100vh', background: 'var(--ink)', color: 'var(--cream)', maxWidth: 880, margin: '0 auto', padding: '40px 24px 80px' }
const bar: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 28 }
const muted: React.CSSProperties = { fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }
const card: React.CSSProperties = { background: 'var(--ink-2)', border: '1px solid var(--line-d)', borderRadius: 12 }
const label: React.CSSProperties = { fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)' }
const chip: React.CSSProperties = { fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--cream)', background: 'rgba(255,255,255,.04)', border: '1px solid var(--line-d)', borderRadius: 20, padding: '4px 12px' }
const code: React.CSSProperties = { fontFamily: 'var(--mono)', fontSize: 13, background: 'rgba(255,255,255,.06)', borderRadius: 5, padding: '1px 6px' }
const ghostBtn: React.CSSProperties = { background: 'transparent', color: 'var(--cream)', cursor: 'pointer' }
