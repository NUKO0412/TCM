import { useContent } from '../features/content/useContent'
import { EditableText } from '../features/edit/EditableText'
import { Logo } from './Logo'
import { Icon } from './IconDefs'

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
            <div className="social">
              <a
                href="https://www.instagram.com/tcm_agencements/?hl=fr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram TCM Agencement"
              >
                <Icon name="i-instagram" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61556346415173"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook TCM Agencement"
              >
                <Icon name="i-facebook" />
              </a>
            </div>
          </div>
          {footer.columns.map((col) => (
            <div className="foot-col" key={col.title}>
              <h4>{col.title}</h4>
              {col.links.map((l) => (
                <a href={l.href} key={l.label}>
                  {l.label}
                </a>
              ))}
            </div>
          ))}
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
