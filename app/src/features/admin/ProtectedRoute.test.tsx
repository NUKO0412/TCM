import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { useAuth } from '../auth'

// Filet anti-régression de la garde admin (couvre FIX #006 : un non-admin
// résolu doit être redirigé, pas bloqué sur l'écran d'attente).
vi.mock('../auth', () => ({ useAuth: vi.fn() }))
const mockAuth = vi.mocked(useAuth)

function renderGuard() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <div>CONTENU ADMIN</div>
            </ProtectedRoute>
          }
        />
        <Route path="/connexion" element={<div>PAGE CONNEXION</div>} />
        <Route path="/" element={<div>ACCUEIL</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

const base = { signIn: vi.fn(), signOut: vi.fn() }

beforeEach(() => mockAuth.mockReset())

describe('ProtectedRoute', () => {
  it('attend pendant le chargement de la session', () => {
    mockAuth.mockReturnValue({ session: null, role: null, roleResolved: false, loading: true, ...base })
    renderGuard()
    expect(screen.queryByText('CONTENU ADMIN')).toBeNull()
    expect(screen.queryByText('PAGE CONNEXION')).toBeNull()
  })

  it('redirige vers /connexion sans session', () => {
    mockAuth.mockReturnValue({ session: null, role: null, roleResolved: true, loading: false, ...base })
    renderGuard()
    expect(screen.getByText('PAGE CONNEXION')).toBeInTheDocument()
  })

  it('attend tant que le rôle n’est pas résolu', () => {
    mockAuth.mockReturnValue({ session: {} as never, role: null, roleResolved: false, loading: false, ...base })
    renderGuard()
    expect(screen.queryByText('CONTENU ADMIN')).toBeNull()
    expect(screen.queryByText('ACCUEIL')).toBeNull()
  })

  it('redirige un non-admin résolu vers / (FIX #006)', () => {
    mockAuth.mockReturnValue({ session: {} as never, role: null, roleResolved: true, loading: false, ...base })
    renderGuard()
    expect(screen.getByText('ACCUEIL')).toBeInTheDocument()
    expect(screen.queryByText('CONTENU ADMIN')).toBeNull()
  })

  it('laisse passer un admin', () => {
    mockAuth.mockReturnValue({ session: {} as never, role: 'admin', roleResolved: true, loading: false, ...base })
    renderGuard()
    expect(screen.getByText('CONTENU ADMIN')).toBeInTheDocument()
  })

  it('laisse passer un super_admin', () => {
    mockAuth.mockReturnValue({ session: {} as never, role: 'super_admin', roleResolved: true, loading: false, ...base })
    renderGuard()
    expect(screen.getByText('CONTENU ADMIN')).toBeInTheDocument()
  })
})
