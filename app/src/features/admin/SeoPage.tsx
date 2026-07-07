import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { ROUTES } from '../../config/routes'
import { SEO_PAGE } from '../../config/seoSnapshot'
import { useSeo, type SeoRow } from './useSeo'
import { HelpTip, InputBlock, SearchConsoleBlock } from './SeoFormFields'
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
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)

  const effectiveUpdatedAt = lastSavedAt ?? row?.updated_at ?? null
  const received = Boolean(row || lastSavedAt)
  const date = effectiveUpdatedAt
    ? new Date(effectiveUpdatedAt).toLocaleString('fr-FR', {
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

  useEffect(() => {
    if (loading || error || form.geoAreaServed.trim()) return
    if (role !== 'admin' && role !== 'super_admin') return
    const token = session?.access_token
    if (!token) return

    let active = true
    void (async () => {
      try {
        const res = await fetch('/api/seo-geo-sync', {
          method: 'POST',
          headers: { authorization: `Bearer ${token}` },
        })
        const data = (await res.json().catch(() => null)) as { ok?: boolean; areaServed?: unknown; error?: string } | null
        if (!active || !res.ok || !data?.ok || !Array.isArray(data.areaServed)) return
        const geoAreaServed = data.areaServed.filter((area): area is string => typeof area === 'string').join(', ')
        setForm((current) => ({ ...current, geoAreaServed }))
        setLastSavedAt(new Date().toISOString())
      } catch {
        // La carte reste lisible ; la prochaine modification des villes relancera la synchronisation.
      }
    })()

    return () => {
      active = false
    }
  }, [error, form.geoAreaServed, loading, role, session?.access_token])

  const save = async () => {
    if (!isSuperAdmin || saving) return
    setSaving(true)
    setMessage(null)
    setSaveError(null)
    try {
      const res = await fetch('/api/seo-admin', {
        method: 'PUT',
        headers: {
          authorization: `Bearer ${session?.access_token ?? ''}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          page: SEO_PAGE,
          title: form.title,
          h1: form.h1,
          description: form.description,
          keywords: splitSeoList(form.keywords),
          og: { title: form.ogTitle, description: form.ogDescription },
          twitter: {
            title: form.twitterTitle,
            description: form.twitterDescription,
          },
          geo: {
            services: splitSeoList(form.geoServices),
          },
        }),
      })
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; rebuild?: string } | null
      if (!res.ok || !data?.ok) {
        setSaveError(data?.error ?? `Sauvegarde refusée (HTTP ${res.status}).`)
        return
      }
      setLastSavedAt(new Date().toISOString())
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
              <span style={label}>Source SEO TCM</span>
              <HelpTip text={HELP.source} />
            </div>
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
            <InputBlock label="Page" help={HELP.page} value={form.page} onChange={update('page')} readOnly />
            <InputBlock label="Title" help={HELP.title} value={form.title} onChange={update('title')} readOnly={!isSuperAdmin} />
            <InputBlock label="H1" help={HELP.h1} value={form.h1} onChange={update('h1')} readOnly={!isSuperAdmin} />
            <InputBlock
              label="Meta description"
              help={HELP.description}
              value={form.description}
              onChange={update('description')}
              readOnly={!isSuperAdmin}
              multiline
            />
            <InputBlock
              label="Keywords"
              help={HELP.keywords}
              value={form.keywords}
              onChange={update('keywords')}
              readOnly={!isSuperAdmin}
            />
            <InputBlock label="Canonical" help={HELP.canonical} value={form.canonical} onChange={update('canonical')} readOnly />
            <InputBlock label="OG title" help={HELP.ogTitle} value={form.ogTitle} onChange={update('ogTitle')} readOnly={!isSuperAdmin} />
            <InputBlock
              label="OG description"
              help={HELP.ogDescription}
              value={form.ogDescription}
              onChange={update('ogDescription')}
              readOnly={!isSuperAdmin}
              multiline
            />
            <InputBlock label="OG image" help={HELP.ogImage} value={form.ogImage} onChange={update('ogImage')} readOnly mono />
            <InputBlock
              label="Twitter title"
              help={HELP.twitterTitle}
              value={form.twitterTitle}
              onChange={update('twitterTitle')}
              readOnly={!isSuperAdmin}
            />
            <InputBlock
              label="Twitter description"
              help={HELP.twitterDescription}
              value={form.twitterDescription}
              onChange={update('twitterDescription')}
              readOnly={!isSuperAdmin}
              multiline
            />
            <InputBlock
              label="Twitter image"
              help={HELP.twitterImage}
              value={form.twitterImage}
              onChange={update('twitterImage')}
              readOnly
              mono
            />
            <InputBlock
              label="JSON-LD"
              help={HELP.structuredData}
              value={form.structuredData}
              onChange={update('structuredData')}
              readOnly
              multiline
              mono
              rows={12}
            />
            <InputBlock
              label="Zones GEO ciblées"
              help={HELP.geoAreaServed}
              value={form.geoAreaServed}
              onChange={update('geoAreaServed')}
              readOnly
            />
            <InputBlock
              label="Services GEO principaux"
              help={HELP.geoServices}
              value={form.geoServices}
              onChange={update('geoServices')}
              readOnly={!isSuperAdmin}
            />
          </div>

          <div style={{ ...card, padding: 16, marginTop: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', position: 'relative' }}>
              <button
                type="button"
                className="btn-login"
                onClick={() => void save()}
                disabled={!isSuperAdmin || saving || !form.title.trim() || !form.description.trim() || !form.h1.trim()}
                style={{ cursor: isSuperAdmin && !saving ? 'pointer' : 'not-allowed' }}
              >
                {saving ? 'Sauvegarde…' : 'Sauvegarder la SEO'}
              </button>
              <HelpTip text={HELP.save} />
            </div>
            {!isSuperAdmin && (
              <p style={{ ...muted, marginTop: 12 }}>
                Sauvegarde réservée à une session super admin. Les valeurs restent consultables en lecture seule.
              </p>
            )}
            {message && <p style={{ ...muted, marginTop: 12, color: '#9fd5aa' }}>{message}</p>}
            {saveError && <p style={{ ...muted, marginTop: 12, color: '#e0a070' }}>{saveError}</p>}
          </div>

          <SearchConsoleBlock data={seo?.searchConsole} help={HELP.searchConsole} />
        </>
      )}
    </main>
  )
}

const HELP = {
  source:
    "Indique d’où viennent les données SEO affichées ici et la date de dernière mise à jour. Cette carte sert à vérifier que les données chargées sont bien celles du site TCM. Elle se met à jour automatiquement après une sauvegarde réussie. Ce champ ne se modifie pas à la main.",
  page:
    "Indique la page concernée par ces réglages SEO. Ici `/` correspond à la page d’accueil du site. Cette valeur sert au système pour savoir quelle page doit recevoir ces titres, descriptions et données SEO. Elle ne doit pas être modifiée à la main, sinon les données pourraient être enregistrées au mauvais endroit.",
  title:
    "Titre SEO principal de la page. C’est souvent le texte affiché en bleu dans les résultats Google. Il doit décrire clairement l’entreprise, le métier et la zone ciblée. C’est un champ important pour aider Google, Bing et les moteurs IA à comprendre le sujet principal de la page.",
  h1:
    "Grand titre principal visible sur la page. Il indique aux visiteurs et aux moteurs le sujet principal de la page. Il doit être clair, naturel et cohérent avec le métier de TCM. Sur une page importante, le H1 doit être précis et ne pas changer sans raison.",
  description:
    "Résumé SEO de la page. Google peut l’utiliser comme extrait dans les résultats de recherche, sous le titre du site. Elle doit donner envie de cliquer et expliquer rapidement ce que propose TCM : métier, services, zone d’intervention. Elle ne garantit pas à elle seule le référencement, mais elle aide à rendre le résultat plus clair et plus attractif.",
  keywords:
    "Liste de mots-clés importants pour organiser la stratégie SEO/GEO du site. Google utilise peu la balise keywords classique, mais ces mots peuvent servir au système interne, au suivi SEO, au GEO et à la cohérence des contenus. Ils doivent rester liés au métier, aux services et aux villes réellement ciblées.",
  canonical:
    "URL officielle de la page. Elle indique à Google, Bing et aux autres moteurs quelle est la bonne adresse à prendre en compte si plusieurs adresses peuvent afficher le même contenu. Ici, l’adresse officielle doit rester celle du site TCM en `www`. Une erreur dans ce champ peut créer un problème d’indexation ou de doublon SEO, donc il est verrouillé.",
  ogTitle:
    "Titre utilisé dans l’aperçu du site quand la page est partagée sur certaines plateformes, comme Facebook, LinkedIn, des messageries ou des outils qui génèrent une carte de prévisualisation. Il peut ressembler au Title SEO, mais il sert surtout à rendre le partage du site clair et attractif.",
  ogDescription:
    "Description utilisée dans l’aperçu du site quand la page est partagée sur des plateformes qui lisent Open Graph. C’est le petit texte qui peut apparaître sous le titre et l’image dans une carte de partage. Il doit expliquer simplement ce que fait TCM et où l’entreprise intervient.",
  ogImage:
    "Image utilisée quand le site est partagé sur des plateformes qui lisent les balises Open Graph, par exemple Facebook, LinkedIn, certaines messageries ou des outils qui affichent un aperçu enrichi du lien. C’est l’image qui peut apparaître avec le titre et la description du site dans une carte de partage. C’est une URL technique, donc elle est verrouillée pour éviter qu’une faute de saisie casse l’aperçu du site.",
  twitterTitle:
    "Titre utilisé pour l’aperçu du site sur X/Twitter et certains outils compatibles avec les cartes Twitter. Il sert à afficher un titre propre quand quelqu’un partage le lien du site. Il peut être identique à l’OG Title si aucune variante spécifique n’est nécessaire.",
  twitterDescription:
    "Description utilisée pour l’aperçu du site sur X/Twitter et certains outils compatibles avec les cartes Twitter. Elle sert à expliquer rapidement le contenu du site quand le lien est partagé. Elle peut être identique à l’OG Description.",
  twitterImage:
    "Image utilisée pour l’aperçu du site quand la page est partagée sur X/Twitter ou sur des outils qui lisent les cartes Twitter. Elle peut être identique à l’image Open Graph. C’est une URL technique vers l’image de partage, donc elle est verrouillée pour éviter qu’une erreur de saisie casse l’image affichée avec le lien.",
  structuredData:
    "Données structurées lues par Google, Bing et certains moteurs IA pour mieux comprendre l’entreprise : nom, métier, adresse, zone d’intervention, réseaux sociaux, type d’activité, services, FAQ, etc. Ce bloc est très sensible : une virgule, une accolade ou une faute de syntaxe peut casser les données structurées. Il reste visible pour contrôle, mais il ne se modifie pas directement ici.",
  geoAreaServed:
    "Champ lié à la stratégie SEO/GEO du site. Il reprend automatiquement les villes et zones indiquées dans la section Zone d’intervention du site vitrine. Quand un administrateur ajoute, retire ou corrige une ville sur le site, cette liste se synchronise pour garder la SEO locale cohérente avec les zones réellement affichées.",
  geoServices:
    "Champ lié à la stratégie SEO/GEO du site. Il sert à indiquer les services principaux que TCM veut associer à sa visibilité locale. Par exemple : menuiserie sur mesure, agencement intérieur, cuisine, dressing, parquet, portes, escaliers, terrasse bois. Ces informations aident les moteurs à relier l’entreprise aux bons services et aux bonnes recherches locales.",
  searchConsole:
    "Données récupérées depuis Google Search Console. Elles montrent comment Google voit le site : clics, impressions, position moyenne et requêtes qui affichent TCM. Ces informations servent à suivre la visibilité du site dans Google. Elles viennent de Google et ne se modifient pas dans cette interface.",
  save:
    "Bouton de sauvegarde des champs SEO/GEO autorisés. Il enregistre uniquement les champs rédactionnels modifiables par le super admin, puis déclenche le rebuild TCM quand il est configuré. Les champs techniques verrouillés restent protégés et ne sont pas écrasés par cette action.",
}
