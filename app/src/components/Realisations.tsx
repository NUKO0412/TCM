import { useEffect, useRef, useState } from 'react'
import { useContent } from '../features/content/useContent'
import { useStore } from '../features/content/useStore'
import { useEditMode } from '../features/edit/useEditMode'
import { EditableText } from '../features/edit/EditableText'
import { EditableImage } from '../features/edit/EditableImage'
import { EditableList } from '../features/edit/EditableList'
import type { StoreItem } from '../features/content/store-context'
import { uploadImage } from '../lib/storage'
import { Lightbox } from './Lightbox'
import { Icon } from './IconDefs'

const s = (v: unknown) => (typeof v === 'string' ? v : '')

type Photo = { src: string; alt: string }
const MAX = 3

// Formats de carte : Petite = s-b (2×1), Moyenne = s-f (2×2), Grande = s-a (4×2).
const sizeLabel = (sp: string) => (sp === 's-a' ? 'Grande' : sp === 's-f' ? 'Moyenne' : 'Petite')
const nextSpan = (sp: string) => (sp === 's-a' ? 's-b' : sp === 's-f' ? 's-a' : 's-f')

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
        alt={cur.alt ?? ''}
        onReplace={replace}
        onFiles={(files) => void addMany(files)}
        onView={
          !editing && cur.src
            ? () => {
                const photos = images.filter((p) => p.src)
                onView({ images: photos, index: Math.max(0, photos.indexOf(cur)) })
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
            <div className={`shot ${s(item.data.span) || 's-b'} reveal`}>
              <Carousel item={item} onView={setPreview} />
              <div className="cap">
                <span>
                  <EditableText itemId={item.id} field="category" value={s(item.data.category)} />
                </span>
                <b>
                  <EditableText itemId={item.id} field="title" value={s(item.data.title)} />
                </b>
              </div>
            </div>
          )}
        </EditableList>
      </div>
      {preview && (
        <Lightbox images={preview.images} index={preview.index} onClose={() => setPreview(null)} />
      )}
    </section>
  )
}
