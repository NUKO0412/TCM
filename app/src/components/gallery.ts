import PhotoSwipe from 'photoswipe'
import 'photoswipe/style.css'

type Photo = { src: string; alt: string }

// Ouvre une galerie plein écran PhotoSwipe : zoom au pincement, glissé entre les
// photos, fermeture au geste, gestes natifs façon application. PhotoSwipe a besoin
// des dimensions de chaque image : on les lit en préchargeant (max 3 par carte).
export async function openGallery(photos: Photo[], index: number) {
  if (!photos.length) return
  const dataSource = await Promise.all(
    photos.map(
      (p) =>
        new Promise<{ src: string; width: number; height: number; alt: string }>((resolve) => {
          const img = new Image()
          img.onload = () =>
            resolve({
              src: p.src,
              width: img.naturalWidth || 1600,
              height: img.naturalHeight || 1200,
              alt: p.alt,
            })
          // Repli si l'image ne charge pas : dimensions par défaut (4:3).
          img.onerror = () => resolve({ src: p.src, width: 1600, height: 1200, alt: p.alt })
          img.src = p.src
        }),
    ),
  )
  // loop laissé au comportement par défaut de PhotoSwipe : il boucle à partir de 3
  // photos et NE boucle pas à 2 (forcer le bouclage à 2 affiche des slides vides,
  // la librairie n'ayant que 3 emplacements). À 2 photos on revient en arrière.
  const pswp = new PhotoSwipe({ dataSource, index, bgOpacity: 0.92 })
  pswp.init()
}
