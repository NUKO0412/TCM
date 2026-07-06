import { useContent, useStore } from '../features/content'
import { EditableImage, EditableText } from '../features/edit'

const unsplashSrcSet = (src: string, widths: number[]) => {
  if (!src.includes('images.unsplash.com')) return undefined
  return widths
    .map((w) => `${src.replace(/([?&])w=\d+/i, `$1w=${w}`)} ${w}w`)
    .join(', ')
}

export function About() {
  const { eyebrow, heading, paragraph, feats, figure } = useContent().about
  const { updateSection } = useStore()
  return (
    <section className="wrap split about" id="savoir">
      <div>
        <span className="eyebrow reveal">
          <EditableText sectionKey="about" path="eyebrow" value={eyebrow} />
        </span>
        <h2 className="reveal">
          <EditableText sectionKey="about" path="heading" value={heading} />
        </h2>
        <p className="reveal">
          <EditableText sectionKey="about" path="paragraph" value={paragraph} multiline />
        </p>
        <div className="feats reveal">
          {feats.map((f, i) => (
            <div key={f.k}>
              <span className="k">{f.k}</span>{' '}
              <EditableText sectionKey="about" path={`feats.${i}.text`} value={f.text} />
            </div>
          ))}
        </div>
      </div>
      <div className="figure reveal">
        <EditableImage
          src={figure.img.src}
          alt={figure.img.alt}
          srcSet={unsplashSrcSet(figure.img.src, [480, 720, 960, 1100])}
          sizes="(max-width: 1024px) calc(100vw - 48px), 548px"
          onReplace={(url) => void updateSection('about', 'figure.img.src', url)}
          loading="lazy"
          decoding="async"
        />
        <span className="tick">
          <EditableText sectionKey="about" path="figure.tick" value={figure.tick} />
        </span>
        <div className="tag">
          <b>
            <EditableText sectionKey="about" path="figure.tag.title" value={figure.tag.title} />
          </b>
          <span>
            <EditableText sectionKey="about" path="figure.tag.sub" value={figure.tag.sub} />
          </span>
        </div>
      </div>
    </section>
  )
}
