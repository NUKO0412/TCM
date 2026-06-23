import { useEffect } from 'react'

// Mobile : quand le clavier s'ouvre, la zone réellement visible rétrécit
// (window.visualViewport). Par défaut le champ actif peut se retrouver caché
// derrière le clavier. Ce hook mesure la zone visible et remonte juste ce qu'il
// faut pour que le champ en cours de saisie reste visible au-dessus du clavier.
export function useKeyboardInView() {
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const isField = (el: Element | null): el is HTMLElement =>
      !!el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)

    const ensureVisible = () => {
      const el = document.activeElement
      if (!isField(el)) return
      const rect = el.getBoundingClientRect()
      const visibleBottom = vv.offsetTop + vv.height
      const visibleTop = vv.offsetTop
      const margin = 16
      if (rect.bottom > visibleBottom - margin) {
        window.scrollBy({ top: rect.bottom - (visibleBottom - margin), behavior: 'smooth' })
      } else if (rect.top < visibleTop + margin) {
        window.scrollBy({ top: rect.top - (visibleTop + margin), behavior: 'smooth' })
      }
    }

    const onFocusIn = (e: FocusEvent) => {
      if (!isField(e.target as Element)) return
      // laisser le clavier finir de s'ouvrir avant de mesurer
      setTimeout(ensureVisible, 300)
    }

    document.addEventListener('focusin', onFocusIn)
    vv.addEventListener('resize', ensureVisible)
    return () => {
      document.removeEventListener('focusin', onFocusIn)
      vv.removeEventListener('resize', ensureVisible)
    }
  }, [])
}
