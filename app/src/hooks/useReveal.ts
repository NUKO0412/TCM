import { useEffect } from 'react'

// Effet d'apparition au scroll :
// - décalage = (index parmi les voisins .reveal % 6) × 70 ms
// - rootMargin bas négatif : l'anim part quand l'élément est entré d'~20 % dans
//   l'écran (pas au ras du bas), pour qu'on ait le temps de la voir
// - repli au chargement : seulement pour ce qui est franchement visible (< 80 % h)
export function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement
            el.style.transitionDelay = (el.dataset.d || '0') + 'ms'
            el.classList.add('in')
            io.unobserve(el)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -20% 0px' },
    )

    document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
      const sibs = [...(el.parentElement?.children ?? [])].filter((c) =>
        c.classList.contains('reveal'),
      )
      el.dataset.d = String((sibs.indexOf(el) % 6) * 70)
      io.observe(el)
    })

    const t = setTimeout(() => {
      document.querySelectorAll<HTMLElement>('.reveal:not(.in)').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.top < innerHeight * 0.8) el.classList.add('in')
      })
    }, 300)

    return () => {
      io.disconnect()
      clearTimeout(t)
    }
  }, [])
}
