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
  const pswp = new PhotoSwipe({ dataSource, index, bgOpacity: 0.92 })
  pswp.init()
}
