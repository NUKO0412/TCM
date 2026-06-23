import { useEffect } from 'react'
import { useContent } from '../features/content'
import { EditableList, EditableText } from '../features/edit'
import { openGallery } from './gallery'
import { Carousel, SwipeShot } from './RealisationCarousel'
import { Icon } from './IconDefs'

const s = (v: unknown) => (typeof v === 'string' ? v : '')

export function Realisations() {
  const { eyebrow, heading, cta } = useContent().realisations

  // Touches ←/→ : naviguent le carrousel de la carte SURVOLÉE (public + édition),
  // en réutilisant ses flèches. Le plein écran (PhotoSwipe) gère son propre clavier.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      if (document.querySelector('.pswp')) return
      // Pendant la saisie d'un texte, ←/→ servent à se déplacer dans le texte.
      const ae = document.activeElement as HTMLElement | null
      if (ae && (ae.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName))) return
      const card = document.querySelector('.gal .shot:hover')
      const btn = card?.querySelector<HTMLButtonElement>(
        e.key === 'ArrowLeft' ? '.carousel-arrow.prev' : '.carousel-arrow.next',
      )
      if (btn) {
        e.preventDefault()
        btn.click()
      }
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [])

  return (
    <section className="real wrap" id="real">
      <div className="real-head">
        <div>
          <span className="eyebrow reveal">
            <EditableText sectionKey="realisations" path="eyebrow" value={eyebrow} />
          </span>
          <h2 className="reveal">
            <EditableText sectionKey="realisations" path="heading" value={heading} />
          </h2>
        </div>
        <a className="link-cta reveal" href={cta.href}>
          {cta.label} <Icon name="i-arrow" style={{ width: 15, height: 15 }} />
        </a>
      </div>
      <div className="gal">
        <EditableList
          collection="realisations"
          addLabel="+ Réalisation"
          newItem={() => ({ span: 's-b', images: [{ src: '', alt: '' }], category: 'Catégorie', title: 'Nouveau' })}
        >
          {(item) => (
            <SwipeShot className={`shot ${s(item.data.span) || 's-b'} reveal`}>
              <Carousel item={item} onView={(p) => void openGallery(p.images, p.index)} />
              <div className="cap">
                <span>
                  <EditableText itemId={item.id} field="category" value={s(item.data.category)} />
                </span>
                <b>
                  <EditableText itemId={item.id} field="title" value={s(item.data.title)} />
                </b>
              </div>
            </SwipeShot>
          )}
        </EditableList>
      </div>
    </section>
  )
}
