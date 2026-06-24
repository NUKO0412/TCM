import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './features/auth'
import { ROUTES } from './config/routes'

// Rendu serveur de la page d'accueil pour le pré-rendu au build.
// Même arbre que main.tsx, à un détail près : MemoryRouter (qui n'émet aucun DOM)
// au lieu de BrowserRouter. Aucun import de CSS ici : renderToString n'en a pas
// besoin et on garde le graphe serveur léger. Le contenu est lu par ContentProvider
// depuis globalThis.__TCM_CONTENT__, posé par scripts/prerender-home.ts avant l'appel.
export function render(): string {
  return renderToString(
    <StrictMode>
      <MemoryRouter initialEntries={[ROUTES.home]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    </StrictMode>,
  )
}
