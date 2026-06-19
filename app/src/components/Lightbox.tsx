import { useEffect, useState } from 'react'

type Photo = { src: string; alt: string }

// Aperçu d'une photo, à sa taille (non rognée). Si la carte est un carrousel
// (plusieurs photos), on navigue avec les flèches gauche/droite (et ←/→ clavier).
// Clic sur la photo ou à côté = fermeture ; Échap aussi.
export function Lightbox({ images, index, onClose }: { images: Photo[]; index: number; onClose: () => void }) {
  const [i, setI] = useState(index)
  const cur = images[Math.min(i, images.length - 1)] ?? images[0]
  const many = images.length > 1
  const go = (d: number) => setI((p) => (p + d + images.length) % images.length)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (many && e.key === 'ArrowLeft') go(-1)
      else if (many && e.key === 'ArrowRight') go(1)
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [many, images.length])

  return (
    <div className="lightbox" onClick={onClose}>
      {many && (
        <button
          className="lightbox-arrow prev"
          aria-label="Précédent"
          onClick={(e) => {
            e.stopPropagation()
            go(-1)
          }}
        />
      )}
      <img className="lightbox-img" src={cur.src} alt={cur.alt} onClick={(e) => e.stopPropagation()} />
      {many && (
        <button
          className="lightbox-arrow next"
          aria-label="Suivant"
          onClick={(e) => {
            e.stopPropagation()
            go(1)
          }}
        />
      )}
      {many && (
        <div className="lightbox-dots">
          {images.map((_, k) => (
            <span
              key={k}
              className={k === i ? 'on' : ''}
              onClick={(e) => {
                e.stopPropagation()
                setI(k)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
