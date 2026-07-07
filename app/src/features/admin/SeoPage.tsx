import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { ROUTES } from '../../config/routes'
import { SEO_PAGE } from '../../config/seoSnapshot'
import { useSeo, type SeoRow } from './useSeo'
import { InputBlock, SearchConsoleBlock } from './SeoFormFields'
import { toSeoForm, splitSeoList, type SeoFormState } from './seoForm'
import { bar, card, ghostBtn, label, muted, page } from './seoPageStyles'

export function SeoPage() {
  const { row, loading, error } = useSeo(SEO_PAGE)
  const formKey = loading ? 'loading' : row?.updated_at ?? 'snapshot'
  return <SeoPageContent key={formKey} row={row} loading={loading} error={error} />
}

function SeoPageContent({
  row,
  loading,
  error,
}: {
  row: SeoRow | null
  loading: boolean
  error: string | null
}) {
  const { signOut, session, role } = useAuth()
  const seo = row?.data ?? null
  const isSuperAdmin = role === 'super_admin'
  const [form, setForm] = useState<SeoFormState>(() => toSeoForm(seo))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

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

  const update = (field: keyof SeoFormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const save = async () => {
    if (!isSuperAdmin || saving) return
    setSaving(true)
    setMessage(null)
    setSaveError(null)
    try {
      let structuredData: Record<string, unknown>
      try {
        structuredData = JSON.parse(form.structuredData) as Record<string, unknown>
      } catch {
        setSaveError('Le JSON-LD est invalide.')
        return
      }

      const res = await fetch('/api/seo-admin', {
        method: 'PUT',
        headers: {
          authorization: `Bearer ${session?.access_token ?? ''}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          page: form.page || SEO_PAGE,
          title: form.title,
          h1: form.h1,
          description: form.description,
          keywords: splitSeoList(form.keywords),
          canonical: form.canonical,
          og: { title: form.ogTitle, description: form.ogDescription, image: form.ogImage },
          twitter: {
            title: form.twitterTitle,
            description: form.twitterDescription,
            image: form.twitterImage,
          },
          structuredData,
          geo: {
            areaServed: splitSeoList(form.geoAreaServed),
            services: splitSeoList(form.geoServices),
          },
        }),
      })
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; rebuild?: string } | null
      if (!res.ok || !data?.ok) {
        setSaveError(data?.error ?? `Sauvegarde refusée (HTTP ${res.status}).`)
        return
      }
      if (data.rebuild === 'triggered') {
        setMessage('SEO sauvegardée. Rebuild TCM déclenché.')
      } else if (data.rebuild === 'failed') {
        setSaveError('SEO sauvegardée, mais le rebuild TCM a échoué : le HTML public peut rester sur les anciennes valeurs.')
      } else {
        setMessage('SEO sauvegardée. Rebuild non configuré : lancer un déploiement contrôlé pour publier le HTML.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <main style={page}>
      <div style={bar}>
        <div>
          <span className="eyebrow" style={{ color: 'var(--oak-2)' }}>
            Back-office
          </span>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 28, marginTop: 8 }}>
            SEO · {isSuperAdmin ? 'super admin' : 'lecture seule'}
          </h1>
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
            <div style={label}>Source SEO TCM</div>
            <p style={{ marginTop: 6, color: '#E5DCC9', fontSize: 15, lineHeight: 1.5 }}>
              {received
                ? `Données internes TCM chargées — dernière mise à jour le ${date}.`
                : 'Aucune ligne SEO en base : le snapshot versionné validé sert de repli.'}
            </p>
            {!isSuperAdmin && (
              <p style={{ marginTop: 8, color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>
                Votre rôle peut consulter ces valeurs, mais seule une session super admin peut les modifier.
              </p>
            )}
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            <InputBlock label="Page" value={form.page} onChange={update('page')} readOnly />
            <InputBlock label="Title" value={form.title} onChange={update('title')} readOnly={!isSuperAdmin} />
            <InputBlock label="H1" value={form.h1} onChange={update('h1')} readOnly={!isSuperAdmin} />
            <InputBlock
              label="Meta description"
              value={form.description}
              onChange={update('description')}
              readOnly={!isSuperAdmin}
              multiline
            />
            <InputBlock label="Keywords" value={form.keywords} onChange={update('keywords')} readOnly={!isSuperAdmin} />
            <InputBlock label="Canonical" value={form.canonical} onChange={update('canonical')} readOnly={!isSuperAdmin} />
            <InputBlock label="OG title" value={form.ogTitle} onChange={update('ogTitle')} readOnly={!isSuperAdmin} />
            <InputBlock
              label="OG description"
              value={form.ogDescription}
              onChange={update('ogDescription')}
              readOnly={!isSuperAdmin}
              multiline
            />
            <InputBlock label="OG image" value={form.ogImage} onChange={update('ogImage')} readOnly={!isSuperAdmin} mono />
            <InputBlock
              label="Twitter title"
              value={form.twitterTitle}
              onChange={update('twitterTitle')}
              readOnly={!isSuperAdmin}
            />
            <InputBlock
              label="Twitter description"
              value={form.twitterDescription}
              onChange={update('twitterDescription')}
              readOnly={!isSuperAdmin}
              multiline
            />
            <InputBlock
              label="Twitter image"
              value={form.twitterImage}
              onChange={update('twitterImage')}
              readOnly={!isSuperAdmin}
              mono
            />
            <InputBlock
              label="JSON-LD"
              value={form.structuredData}
              onChange={update('structuredData')}
              readOnly={!isSuperAdmin}
              multiline
              mono
              rows={12}
            />
            <InputBlock
              label="Zones GEO ciblées"
              value={form.geoAreaServed}
              onChange={update('geoAreaServed')}
              readOnly={!isSuperAdmin}
            />
            <InputBlock
              label="Services GEO principaux"
              value={form.geoServices}
              onChange={update('geoServices')}
              readOnly={!isSuperAdmin}
            />
          </div>

          {isSuperAdmin && (
            <div style={{ ...card, padding: 16, marginTop: 18 }}>
              <button
                type="button"
                className="btn-login"
                onClick={() => void save()}
                disabled={saving || !form.title.trim() || !form.description.trim() || !form.h1.trim()}
                style={{ cursor: saving ? 'wait' : 'pointer' }}
              >
                {saving ? 'Sauvegarde…' : 'Sauvegarder la SEO'}
              </button>
              {message && <p style={{ ...muted, marginTop: 12, color: '#9fd5aa' }}>{message}</p>}
              {saveError && <p style={{ ...muted, marginTop: 12, color: '#e0a070' }}>{saveError}</p>}
            </div>
          )}

          <SearchConsoleBlock data={seo?.searchConsole} />
        </>
      )}
    </main>
  )
}
