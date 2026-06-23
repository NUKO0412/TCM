import { useEffect } from 'react'

// Sur mobile, le navigateur remonte le champ ciblé en haut de l'écran au focus
// (ouverture du clavier). L'en-tête fixe passe alors par-dessus et masque le
// champ. Tant qu'un champ est en saisie, on escamote l'en-tête (classe is-typing
// sur <html>) : le champ reste visible. Aucun effet sur ordinateur.
export function useHideHeaderOnInput() {
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 820px)')
    const isField = (el: EventTarget | null) =>
      el instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)
    const root = document.documentElement

    const onFocusIn = (e: FocusEvent) => {
      if (mq.matches && isField(e.target)) root.classList.add('is-typing')
    }
    // Au blur : on attend un cycle. Si on passe directement à un autre champ,
    // on reste en mode saisie (pas de clignotement de l'en-tête).
    const onFocusOut = () => {
      window.setTimeout(() => {
        if (!isField(document.activeElement)) root.classList.remove('is-typing')
      }, 80)
    }

    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    return () => {
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
      root.classList.remove('is-typing')
    }
  }, [])
}
