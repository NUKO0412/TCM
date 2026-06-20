import { Link } from 'react-router-dom'
import { useContent } from '../features/content'
import { EditableText } from '../features/edit'
import { Logo } from './Logo'
import { ROUTES } from '../config/routes'
import { LEGAL_IDS } from '../config/ids'

// Liens « Accès » historiquement en placeholder `#` → vraies routes de l'app.
const ROUTE_FOR_LABEL: Record<string, string> = {
  Connexion: ROUTES.login,
  'Espace administrateur': ROUTES.adminMessages,
  'Mentions légales': ROUTES.legal,
}
const resolveHref = (l: { label: string; href: string }) =>
  l.href && l.href !== '#' ? l.href : (ROUTE_FOR_LABEL[l.label] ?? l.href)

// Liens déjà couverts par la colonne dédiée « Informations légales » : on évite
// le doublon dans les colonnes issues du contenu (ex. « Mentions légales »).
const OWNED_BY_LEGAL_COL = new Set(['Mentions légales'])

export function Footer() {
  const { header, footer } = useContent()
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <div className="brand">
              <Logo />
              <div>
                <b>{header.brand.name}</b>
                <span>{header.brand.tagline}</span>
              </div>
            </div>
            <p>
              <EditableText sectionKey="footer" path="brandDesc" value={footer.brandDesc} multiline />
            </p>
          </div>
          {footer.columns.map((col) => (
            <div className="foot-col" key={col.title}>
              <h4>{col.title}</h4>
              {col.links.filter((l) => !OWNED_BY_LEGAL_COL.has(l.label)).map((l) => {
                const href = resolveHref(l)
                return href.startsWith('/') ? (
                  <Link to={href} key={l.label}>
                    {l.label}
                  </Link>
                ) : (
                  <a href={href} key={l.label}>
                    {l.label}
                  </a>
                )
              })}
            </div>
          ))}
          <div className="foot-col">
            <h4>Informations légales</h4>
            <Link to={ROUTES.legal}>Mentions légales</Link>
            <Link to={`${ROUTES.legal}#${LEGAL_IDS.confidentialite}`}>Politique de confidentialité</Link>
            <Link to={`${ROUTES.legal}#${LEGAL_IDS.cookies}`}>Politique de cookies</Link>
          </div>
        </div>
        <div className="foot-bottom">
          <span>
            <EditableText sectionKey="footer" path="bottom.left" value={footer.bottom.left} />
          </span>
          <span>
            <EditableText sectionKey="footer" path="bottom.right" value={footer.bottom.right} />
          </span>
        </div>
      </div>
    </footer>
  )
}
