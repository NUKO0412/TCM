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

const tree = (
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)

// La page d'accueil est pré-rendue dans index.html (data-prerendered) : on hydrate
// pour ne pas re-créer le DOM. Sur une route non-home (lien profond servi par la
// même index.html via la réécriture SPA), le HTML pré-rendu est celui de l'accueil
// alors que le client va afficher une autre page : on vide le root et on monte à
// neuf — comportement identique à aujourd'hui, sans mismatch d'hydratation.
if (rootEl.dataset.prerendered && window.location.pathname === ROUTES.home) {
  hydrateRoot(rootEl, tree)
} else {
  if (rootEl.dataset.prerendered) rootEl.innerHTML = ''
  createRoot(rootEl).render(tree)
}
