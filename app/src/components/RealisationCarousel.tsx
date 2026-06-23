import { useEffect, useRef, useState, type ReactNode } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { useStore, type StoreItem } from '../features/content'
import { EditableImage, useEditMode } from '../features/edit'
import { uploadImage } from '../lib/storage'

const s = (v: unknown) => (typeof v === 'string' ? v : '')

type Photo = { src: string; alt: string }
const MAX = 3

// Formats de carte : Petite = s-b (2×1), Moyenne = s-f (2×2), Grande = s-a (4×2).
const sizeLabel = (sp: string) => (sp === 's-a' ? 'Grande' : sp === 's-f' ? 'Moyenne' : 'Petite')
const nextSpan = (sp: string) => (sp === 's-a' ? 's-b' : sp === 's-f' ? 's-a' : 's-f')

// Texte alternatif : alt de la photo si renseigné, sinon dérivé du titre/catégorie.
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

type CarouselProps = {
  item: StoreItem
  onView: (p: { images: Photo[]; index: number }) => void
}

// Aiguillage : lecture publique → carrousel Embla ; édition → administration inchangée.
export function Carousel(props: CarouselProps) {
  const { editing } = useEditMode()
  return editing ? <EditCarousel {...props} /> : <PublicCarousel {...props} />
}

// Carrousel public (lecture seule) : piste Embla, glissé + flèches + points + tap
// plein écran. Rendu identique aux cartes existantes (mêmes classes, même CSS).
function PublicCarousel({ item, onView }: CarouselProps) {
  const photos = readImages(item.data)
    .filter((p) => p.src)
    .map((p) => ({ src: p.src, alt: altFor(item.data, p.alt ?? '') }))
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: photos.length > 1 })
  const [sel, setSel] = useState(0)
  const dragged = useRef(false)
  const down = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSel(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    onSelect()
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  if (!photos.length) return null
  if (photos.length === 1) {
    return (
      <img
        src={photos[0].src}
        alt={photos[0].alt}
        style={{ cursor: 'zoom-in' }}
        onClick={() => onView({ images: photos, index: 0 })}
        loading="lazy"
      />
    )
  }

  return (
    <>
      <div
        className="embla-viewport"
        ref={emblaRef}
        onPointerDownCapture={(e) => {
          down.current = { x: e.clientX, y: e.clientY }
          dragged.current = false
        }}
        onPointerMoveCapture={(e) => {
          const d = down.current
          if (d && Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 8) dragged.current = true
        }}
      >
        <div className="embla-container">
          {photos.map((p, k) => (
            <div className="embla-slide" key={k}>
              <img
                src={p.src}
                alt={p.alt}
                style={{ cursor: 'zoom-in' }}
                onClick={() => {
                  if (dragged.current) return
                  onView({ images: photos, index: k })
                }}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
      <button
        className="carousel-arrow prev"
        aria-label="Précédent"
        onClick={(e) => {
          e.stopPropagation()
          emblaApi?.scrollPrev()
        }}
      />
      <button
        className="carousel-arrow next"
        aria-label="Suivant"
        onClick={(e) => {
          e.stopPropagation()
          emblaApi?.scrollNext()
        }}
      />
      <div className="carousel-dots">
        {photos.map((_, k) => (
          <span
            key={k}
            className={k === sel ? 'on' : ''}
            onClick={(e) => {
              e.stopPropagation()
              emblaApi?.scrollTo(k)
            }}
          />
        ))}
      </div>
    </>
  )
}

// Carrousel en mode édition : INCHANGÉ (1 photo affichée, remplacement, ajout/retrait, taille).
function EditCarousel({ item, onView }: CarouselProps) {
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
      alert("Échec de l'upload d'une photo : " + (e instanceof Error ? e.message : String(e)))
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

// Glissement tactile (swipe) en édition : réutilise les flèches ; un vrai glissé annule l'aperçu.
export function SwipeShot({ className, children }: { className: string; children: ReactNode }) {
  const { editing } = useEditMode()
  const ref = useRef<HTMLDivElement>(null)
  const start = useRef<{ x: number; y: number } | null>(null)
  const swiped = useRef(false)

  // En lecture publique, Embla gère le glissé : aucune couche tactile ici (sinon double nav).
  if (!editing) return <div className={className}>{children}</div>

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
