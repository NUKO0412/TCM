import { lazy, Suspense, useEffect, useRef } from 'react'
import { useScrolledHeader } from './hooks/useScrolledHeader'
import { useReveal } from './hooks/useReveal'
import { useHideHeaderOnInput } from './hooks/useHideHeaderOnInput'
import { useAuth } from './features/auth'
import { ContentProvider } from './features/content'
import { EditModeProvider, useEditMode } from './features/edit'
import { IconDefs } from './components/IconDefs'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Credibility } from './components/Credibility'
import { About } from './components/About'
import { Prestations } from './components/Prestations'
import { Methode } from './components/Methode'
import { Realisations } from './components/Realisations'
import { Zone } from './components/Zone'
import { Faq } from './components/Faq'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'

const AdminBar = lazy(() => import('./features/edit/AdminBar').then((m) => ({ default: m.AdminBar })))

// Le contenu vient de Supabase ; le rendu reste identique au pixel pour le
// visiteur. EditModeProvider n'expose le mode édition qu'aux éditeurs connectés.
export function Site() {
  return (
    <ContentProvider>
      <EditModeProvider>
        <SiteInner />
      </EditModeProvider>
    </ContentProvider>
  )
}

function SiteInner() {
  const { editing } = useEditMode()
  const wasEditing = useRef(false)
  useScrolledHeader()
  useReveal()
  useHideHeaderOnInput()

  // En édition : tout est visible (pas d'attente du scroll pour éditer).
  // En SORTANT de l'édition : on garde toutes les cartes visibles (les éléments
  // re-générés pendant l'édition n'ont jamais reçu .in et disparaîtraient sinon).
  // On ne le fait pas au montage initial pour préserver l'animation publique.
  useEffect(() => {
    document.documentElement.classList.toggle('is-editing', editing)
    if (editing) {
      wasEditing.current = true
    } else if (wasEditing.current) {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'))
      wasEditing.current = false
    }
    return () => document.documentElement.classList.remove('is-editing')
  }, [editing])

  return (
    <>
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>
      <Header />
      <AdminBarGate />
      <main id="contenu" tabIndex={-1}>
        <Hero />
        <Credibility />
        <About />
        <Prestations />
        <Methode />
        <Realisations />
        <Zone />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <IconDefs />
    </>
  )
}

function AdminBarGate() {
  const { session, role } = useAuth()
  if (!(session && (role === 'admin' || role === 'super_admin'))) return null
  return (
    <Suspense fallback={null}>
      <AdminBar />
    </Suspense>
  )
}
