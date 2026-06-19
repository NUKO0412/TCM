import { useEffect } from 'react'

// Réplique du script d'origine : ajoute/retire la classe .scrolled sur le
// <header id="hd"> dès que le défilement dépasse 40 px.
export function useScrolledHeader() {
  useEffect(() => {
    const hd = document.getElementById('hd')
    if (!hd) return
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        hd.classList.toggle('scrolled', window.scrollY > 40)
        ticking = false
      })
    }
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    return () => removeEventListener('scroll', onScroll)
  }, [])
}
