import type { ChangeEvent, CSSProperties } from 'react'
import type { SeoData } from '../../config/business'
import { card, label } from './seoPageStyles'

export function SearchConsoleBlock({ data }: { data?: NonNullable<SeoData['searchConsole']> }) {
  const indexed =
    data?.indexed === true ? 'Indexée' : data?.indexed === false ? 'Non indexée / en attente' : data?.status
  return (
    <div style={{ ...card, padding: 16, marginTop: 18 }}>
      <div style={label}>Google Search Console</div>
      <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
        <FieldLine label="Statut" value={indexed} />
        <FieldLine label="Clics" value={data?.clicks === undefined ? undefined : String(data.clicks)} />
        <FieldLine label="Impressions" value={data?.impressions === undefined ? undefined : String(data.impressions)} />
        <FieldLine label="Position moyenne" value={data?.position == null ? undefined : String(data.position)} />
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

function FieldLine({ label: l, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div style={label}>{l}</div>
      <div style={{ fontSize: 15, color: value ? '#E5DCC9' : 'var(--muted)', marginTop: 4 }}>{value || '—'}</div>
    </div>
  )
}

export function InputBlock({
  label: l,
  value,
  onChange,
  readOnly,
  multiline,
  mono,
  rows = 3,
}: {
  label: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  readOnly?: boolean
  multiline?: boolean
  mono?: boolean
  rows?: number
}) {
  const fieldStyle: CSSProperties = {
    width: '100%',
    marginTop: 6,
    borderRadius: 10,
    border: '1px solid var(--line-d)',
    background: readOnly ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.06)',
    color: readOnly ? 'var(--muted)' : 'var(--cream)',
    padding: '10px 12px',
    font: mono ? '13px var(--mono)' : '15px var(--font)',
    lineHeight: 1.5,
  }
  return (
    <label style={{ ...card, display: 'block', padding: 16 }}>
      <span style={label}>{l}</span>
      {multiline ? (
        <textarea value={value} onChange={onChange} readOnly={readOnly} rows={rows} style={fieldStyle} />
      ) : (
        <input value={value} onChange={onChange} readOnly={readOnly} style={fieldStyle} />
      )}
    </label>
  )
}
