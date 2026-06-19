import { useEffect } from 'react'

// Réplique fidèle du script reveal d'origine :
// - décalage = (index parmi les voisins .reveal % 6) × 70 ms
// - IntersectionObserver seuil 0.12, ajoute .in puis arrête d'observer
// - repli à 300 ms pour les éléments déjà visibles au chargement
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
      { threshold: 0.12 },
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
        if (r.top < innerHeight) el.classList.add('in')
      })
    }, 300)

    return () => {
      io.disconnect()
      clearTimeout(t)
    }
  }, [])
}
