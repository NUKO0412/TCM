import { Link } from 'react-router-dom'
import { useContent } from '../features/content/useContent'
import { EditableText } from '../features/edit/EditableText'
import { Logo } from './Logo'

// Liens « Accès » historiquement en placeholder `#` → vraies routes de l'app.
const ROUTE_FOR_LABEL: Record<string, string> = {
  Connexion: '/connexion',
  'Espace administrateur': '/admin/messages',
  'Mentions légales': '/mentions-legales',
}
const resolveHref = (l: { label: string; href: string }) =>
  l.href && l.href !== '#' ? l.href : (ROUTE_FOR_LABEL[l.label] ?? l.href)

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
              {col.links.map((l) => {
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
            <Link to="/mentions-legales">Mentions légales</Link>
            <Link to="/mentions-legales#confidentialite">Politique de confidentialité</Link>
            <Link to="/mentions-legales#cookies">Politique de cookies</Link>
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
