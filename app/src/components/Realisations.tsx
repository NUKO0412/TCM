import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useContent, useStore, type StoreItem } from '../features/content'
import { EditableImage, EditableList, EditableText, useEditMode } from '../features/edit'
import { uploadImage } from '../lib/storage'
import { Lightbox } from './Lightbox'
import { Icon } from './IconDefs'

const s = (v: unknown) => (typeof v === 'string' ? v : '')

type Photo = { src: string; alt: string }
const MAX = 3

// Formats de carte : Petite = s-b (2×1), Moyenne = s-f (2×2), Grande = s-a (4×2).
const sizeLabel = (sp: string) => (sp === 's-a' ? 'Grande' : sp === 's-f' ? 'Moyenne' : 'Petite')
const nextSpan = (sp: string) => (sp === 's-a' ? 's-b' : sp === 's-f' ? 's-a' : 's-f')

// Texte alternatif utile : alt propre de la photo si renseigné, sinon dérivé
// du titre/catégorie de la réalisation (fallback générique en dernier recours).
function altFor(data: Record<string, unknown>, photoAlt: string): string {
  if (photoAlt && photoAlt.trim()) return photoAlt.trim()
  const parts = [s(data.title).trim(), s(data.category).trim()].filter(Boolean)
  return parts.length ? `Réalisation TCM Agencement — ${parts.join(', ')}` : 'Réalisation TCM Agencement'
}

// Lit les photos d'une réalisation (tableau `images`, ou ancien champ `img`).
function readImages(data: Record<string, unknown>): Photo[] {
  if (Array.isArray(data.images) && data.images.length) return data.images as Photo[]
  if (data.img) return [data.img as Photo]
  return [{ src: '', alt: '' }]
}

// Carrousel d'une carte : jusqu'à 3 photos. Flèches au survol dès 2 photos.
function Carousel({
  item,
  onView,
}: {
  item: StoreItem
  onView: (p: { images: Photo[]; index: number }) => void
}) {
  const { editing } = useEditMode()
  const { updateItem } = useStore()
  const images = readImages(item.data)
  const filled = images.filter((p) => p.src) // photos réelles
  const [idx, setIdx] = useState(0)
  const [busy, setBusy] = useState(false)
  const multiRef = useRef<HTMLInputElement>(null)
  const i = Math.min(idx, images.length - 1)
  const cur = images[i] ?? { src: '', alt: '' }

  const save = (arr: Photo[]) => void updateItem(item.id, 'images', arr.length ? arr : [{ src: '', alt: '' }])
  const replace = (url: string) => {
    const a = [...images]
    a[i] = { src: url, alt: cur.alt ?? '' }
    save(a)
  }
  // Retire la photo affichée (et seulement elle).
  const removePhoto = () => {
    const next = images.filter((_, k) => k !== i)
    save(next)
    setIdx(Math.max(0, i - 1))
  }
  // Ajoute une ou plusieurs photos. Au-delà de 3, on écrase la plus ancienne (FIFO).
  const addMany = async (files: FileList | null) => {
    if (!files || !files.length) return
    setBusy(true)
    try {
      const uploaded: Photo[] = []
      for (const f of Array.from(files).slice(0, MAX)) {
        uploaded.push({ src: await uploadImage(f), alt: '' })
      }
      const combined = [...filled, ...uploaded]
      const next = combined.slice(Math.max(0, combined.length - MAX))
      save(next)
      setIdx(next.length - 1)
    } catch (e) {
      console.error('upload', e)
      alert("Échec de l'upload d'une photo.")
    } finally {
      setBusy(false)
    }
  }
  const go = (d: number) => setIdx((i + d + images.length) % images.length)

  return (
    <>
      <EditableImage
        src={cur.src}
        alt={altFor(item.data, cur.alt ?? '')}
        onReplace={replace}
        onFiles={(files) => void addMany(files)}
        onView={
          !editing && cur.src
            ? () => {
                const photos = images.filter((p) => p.src)
                const index = Math.max(0, photos.indexOf(cur))
                onView({
                  images: photos.map((p) => ({ src: p.src, alt: altFor(item.data, p.alt ?? '') })),
                  index,
                })
              }
            : undefined
        }
      />

      {images.length > 1 && (
        <>
          <button className="carousel-arrow prev" aria-label="Précédent" onClick={(e) => { e.stopPropagation(); go(-1) }} />
          <button className="carousel-arrow next" aria-label="Suivant" onClick={(e) => { e.stopPropagation(); go(1) }} />
          <div className="carousel-dots">
            {images.map((_, k) => (
              <span key={k} className={k === i ? 'on' : ''} onClick={(e) => { e.stopPropagation(); setIdx(k) }} />
            ))}
          </div>
        </>
      )}

      {editing && (
        <div className="carousel-edit">
          <button
            onClick={(e) => { e.stopPropagation(); void updateItem(item.id, 'span', nextSpan(s(item.data.span))) }}
            title="Changer la taille de la carte"
          >
            Taille : {sizeLabel(s(item.data.span))}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); multiRef.current?.click() }}
            title="Ajouter une ou plusieurs photos (max 3, écrase la plus ancienne)"
          >
            {busy ? 'Envoi…' : `＋ Photo (${filled.length}/${MAX})`}
          </button>
          {filled.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); removePhoto() }}
              title="Retirer la photo affichée"
            >
              ✕ Retirer
            </button>
          )}
          <input
            ref={multiRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => { void addMany(e.target.files); e.target.value = '' }}
          />
        </div>
      )}
    </>
  )
}

// Glissement tactile (swipe) pour changer de photo sur mobile : on réutilise les
// flèches existantes de la carte. Un vrai glissement annule l'ouverture de l'aperçu.
function SwipeShot({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const start = useRef<{ x: number; y: number } | null>(null)
  const swiped = useRef(false)
  return (
    <div
      ref={ref}
      className={className}
      onTouchStart={(e) => {
        const t = e.touches[0]
        start.current = { x: t.clientX, y: t.clientY }
        swiped.current = false
      }}
      onTouchEnd={(e) => {
        const s0 = start.current
        if (!s0) return
        const t = e.changedTouches[0]
        const dx = t.clientX - s0.x
        const dy = t.clientY - s0.y
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          swiped.current = true
          ref.current
            ?.querySelector<HTMLButtonElement>(dx < 0 ? '.carousel-arrow.next' : '.carousel-arrow.prev')
            ?.click()
        }
        start.current = null
      }}
      onClickCapture={(e) => {
        // Après un swipe, on annule le clic qui ouvrirait l'aperçu — MAIS on laisse
        // passer le clic qu'on envoie nous-mêmes sur la flèche (sinon le swipe s'annule).
        if (swiped.current && !(e.target as HTMLElement).closest?.('.carousel-arrow')) {
          e.preventDefault()
          e.stopPropagation()
          swiped.current = false
        }
      }}
    >
      {children}
    </div>
  )
}

export function Realisations() {
  const { eyebrow, heading, cta } = useContent().realisations
  const [preview, setPreview] = useState<{ images: Photo[]; index: number } | null>(null)

  // Touches ←/→ : naviguent le carrousel de la carte SURVOLÉE (public + édition),
  // en réutilisant ses flèches. L'aperçu plein écran gère déjà son propre clavier.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      if (document.querySelector('.lightbox')) return
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
              <Carousel item={item} onView={setPreview} />
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
      {preview && (
        <Lightbox images={preview.images} index={preview.index} onClose={() => setPreview(null)} />
      )}
    </section>
  )
}
