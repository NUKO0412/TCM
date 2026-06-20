import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Logo } from './Logo'
import { ROUTES } from '../config/routes'
import { LEGAL_IDS } from '../config/ids'
import { MentionsSection } from './legal/MentionsSection'
import { ConfidentialiteSection } from './legal/ConfidentialiteSection'
import { CookiesSection } from './legal/CookiesSection'

// Page légale : coquille (en-tête + barre de sections) ; le contenu de chaque
// bloc vit dans son sous-composant (components/legal/) — 1 mission par fichier.
export function LegalPage() {
  const { hash } = useLocation()
  useEffect(() => {
    const id = hash.slice(1)
    const el = id ? document.getElementById(id) : null
    if (el) el.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [hash])

  return (
    <main className="legal-page">
      <header className="legal-top">
        <div className="wrap legal-top-inner">
          <Link className="brand" to={ROUTES.home} aria-label="Retour à l'accueil">
            <Logo />
            <div>
              <b>TCM Agencement</b>
              <span>Menuiserie · Lorient</span>
            </div>
          </Link>
          <Link className="legal-back" to={ROUTES.home}>
            ← Retour au site
          </Link>
        </div>
      </header>

      <div className="wrap legal-doc">
        <p className="legal-updated">Dernière mise à jour : 20 juin 2026</p>
        <h1>Mentions légales · Politique de confidentialité (RGPD) · Politique de cookies</h1>

        <nav className="legal-nav">
          <a href={`#${LEGAL_IDS.mentions}`}>Mentions légales</a>
          <a href={`#${LEGAL_IDS.confidentialite}`}>Confidentialité (RGPD)</a>
          <a href={`#${LEGAL_IDS.cookies}`}>Cookies</a>
        </nav>

        <MentionsSection />
        <ConfidentialiteSection />
        <CookiesSection />
      </div>
    </main>
  )
}
