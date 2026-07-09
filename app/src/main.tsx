import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ROUTES } from './config/routes'
// Polices auto-hébergées (Fontsource) — plus de dépendance à Google Fonts.
// Fraunces : axes opsz + poids, roman et italique ; Inter : poids ; Space Mono : 400/700.
import '@fontsource-variable/fraunces/opsz.css'
import '@fontsource-variable/fraunces/opsz-italic.css'
import '@fontsource-variable/inter/wght.css'
import '@fontsource/space-mono/400.css'
import '@fontsource/space-mono/700.css'
import './styles/site.css'
import App from './App.tsx'
import { AuthProvider } from './features/auth'

const rootEl = document.getElementById('root')!

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

if (window.location.pathname === ROUTES.home) {
  if (window.location.hash) {
    window.history.replaceState(null, '', ROUTES.home)
  }
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }))
}

const tree = (
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)

// Les routes pré-rendues en HTML statique sont hydratées ; les routes admin/auth
// servies par l'index SPA restent montées à neuf.
const prerenderedRoutes = [ROUTES.home, ROUTES.legal] as string[]
const canHydratePrerendered = prerenderedRoutes.includes(window.location.pathname)

if (rootEl.dataset.prerendered && canHydratePrerendered) {
  hydrateRoot(rootEl, tree)
} else {
  if (rootEl.dataset.prerendered) rootEl.innerHTML = ''
  createRoot(rootEl).render(tree)
}
