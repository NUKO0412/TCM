import type { CSSProperties } from 'react'

export const page: CSSProperties = {
  minHeight: '100vh',
  background: 'var(--ink)',
  color: 'var(--cream)',
  maxWidth: 920,
  margin: '0 auto',
  padding: '40px 24px 80px',
}

export const bar: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  flexWrap: 'wrap',
  gap: 16,
  marginBottom: 28,
}

export const muted: CSSProperties = { fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }
export const card: CSSProperties = { background: 'var(--ink-2)', border: '1px solid var(--line-d)', borderRadius: 12 }
export const label: CSSProperties = {
  fontFamily: 'var(--mono)',
  fontSize: 10,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: 'var(--muted)',
}
export const ghostBtn: CSSProperties = { background: 'transparent', color: 'var(--cream)', cursor: 'pointer' }
