import { useState } from 'react'
import type { ChangeEvent, CSSProperties } from 'react'
import type { SeoData } from '../../config/business'
import { card, label } from './seoPageStyles'

export function HelpTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  return (
    <span style={helpWrap}>
      <span
        role="button"
        tabIndex={0}
        aria-label="Aide"
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(event) => {
          event.preventDefault()
          setOpen((visible) => !visible)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setOpen((visible) => !visible)
          }
        }}
        style={helpDot}
      >
        i
      </span>
      {open && <span style={helpBubble}>{text}</span>}
    </span>
  )
}

export function SearchConsoleBlock({ data, help }: { data?: NonNullable<SeoData['searchConsole']>; help: string }) {
  const indexed =
    data?.indexed === true ? 'Indexée' : data?.indexed === false ? 'Non indexée / en attente' : data?.status
  return (
    <div style={{ ...card, padding: 16, marginTop: 18 }}>
      <div style={labelRow}>
        <span style={label}>Google Search Console</span>
        <HelpTip text={help} />
      </div>
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
  help,
  value,
  onChange,
  readOnly,
  multiline,
  mono,
  rows = 3,
}: {
  label: string
  help: string
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
  const readOnlyDisplayStyle: CSSProperties = {
    ...fieldStyle,
    cursor: 'default',
    outline: 'none',
    whiteSpace: multiline ? 'pre-wrap' : 'nowrap',
    overflow: multiline ? 'auto' : 'hidden',
    textOverflow: multiline ? undefined : 'ellipsis',
    minHeight: multiline ? rows * 20 + 22 : undefined,
    maxHeight: multiline ? rows * 20 + 22 : undefined,
  }
  return (
    <label style={{ ...card, display: 'block', padding: 16 }}>
      <span style={labelRow}>
        <span style={label}>{l}</span>
        <HelpTip text={help} />
      </span>
      {readOnly ? (
        <div data-readonly-field={l} style={readOnlyDisplayStyle}>
          {value || '—'}
        </div>
      ) : multiline ? (
        <textarea value={value} onChange={onChange} readOnly={readOnly} rows={rows} style={fieldStyle} />
      ) : (
        <input value={value} onChange={onChange} readOnly={readOnly} style={fieldStyle} />
      )}
    </label>
  )
}

const labelRow: CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }
const helpWrap: CSSProperties = { position: 'relative', display: 'inline-flex', alignItems: 'center' }
const helpDot: CSSProperties = {
  width: 18,
  height: 18,
  display: 'inline-grid',
  placeItems: 'center',
  borderRadius: '50%',
  border: '1px solid var(--line-d)',
  color: 'var(--oak-2)',
  fontFamily: 'var(--mono)',
  fontSize: 11,
  lineHeight: 1,
  cursor: 'help',
  background: 'rgba(255,255,255,.04)',
}
const helpBubble: CSSProperties = {
  position: 'absolute',
  zIndex: 20,
  top: 24,
  left: 0,
  width: 320,
  maxWidth: 'min(78vw, 320px)',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid var(--line-d)',
  background: 'var(--ink)',
  color: '#E5DCC9',
  boxShadow: '0 18px 40px rgba(0,0,0,.28)',
  fontFamily: 'var(--font)',
  fontSize: 13,
  lineHeight: 1.5,
  letterSpacing: 0,
  textTransform: 'none',
}
