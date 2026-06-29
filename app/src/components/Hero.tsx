import { useContent, useStore } from '../features/content'
import { EditableImage, EditableText } from '../features/edit'
import { Icon } from './IconDefs'

export function Hero() {
  const { bg, eyebrow, title, sub, ctas } = useContent().hero
  const { updateSection } = useStore()
  // Le H1 est du SEO : il vient de la valeur injectée par Hubelly (seo.h1),
  // embarquée au build. Repli sur l'étiquette éditable si Hubelly n'envoie rien.
  const seoH1 = globalThis.__TCM_SEO__?.h1
  return (
    <section className="hero">
      <div className="hero-bg" id="heroBg">
        <EditableImage
          src={bg.src}
          alt={bg.alt}
          onReplace={(url) => void updateSection('hero', 'bg.src', url)}
        />
      </div>
      <div className="grid-ov"></div>
      <span className="corner tl"></span>
      <span className="corner tr"></span>
      <div className="wrap hero-inner">
        {seoH1 ? (
          <h1 className="eyebrow reveal">{seoH1}</h1>
        ) : (
          <h1 className="eyebrow reveal">
            <EditableText sectionKey="hero" path="eyebrow" value={eyebrow} />
          </h1>
        )}
        <p className="hero-title reveal">
          <EditableText sectionKey="hero" path="title.pre" value={title.pre} />
          <i>
            <EditableText sectionKey="hero" path="title.em" value={title.em} />
          </i>
          <EditableText sectionKey="hero" path="title.post" value={title.post} />
        </p>
        <p className="sub reveal">
          <EditableText sectionKey="hero" path="sub" value={sub} multiline />
        </p>
        <div className="cta-row reveal">
          {ctas.map((c) =>
            c.kind === 'primary' ? (
              <a key={c.label} className="btn btn-primary" href={c.href}>
                {c.label}{' '}
                <span className="ic">
                  <Icon name="i-arrow" />
                </span>
              </a>
            ) : (
              <a key={c.label} className="btn btn-ghost" href={c.href}>
                {c.label} <Icon name="i-arrow" className="i ar" style={{ width: 18, height: 18 }} />
              </a>
            ),
          )}
        </div>
      </div>
      <div className="scroll-cue">Faire défiler</div>
    </section>
  )
}
