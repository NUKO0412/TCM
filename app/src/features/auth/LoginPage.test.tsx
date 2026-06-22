import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { LoginPage } from './LoginPage'
import { useAuth } from './useAuth'

vi.mock('./useAuth', () => ({ useAuth: vi.fn() }))
const mockAuth = vi.mocked(useAuth)

const base = {
  session: null,
  role: null,
  roleResolved: true,
  loading: false,
  signIn: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn(),
  updatePassword: vi.fn(),
}

function renderLogin(entry: { pathname: string; state?: unknown } = { pathname: '/connexion' }) {
  const utils = render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/connexion" element={<LoginPage />} />
        <Route path="/" element={<div>ACCUEIL</div>} />
      </Routes>
    </MemoryRouter>,
  )
  // Les labels ne sont pas liés aux inputs (markup existant) : on cible par name.
  const field = (name: string) =>
    utils.container.querySelector<HTMLInputElement>(`input[name="${name}"]`)!
  return { ...utils, field }
}

beforeEach(() => {
  mockAuth.mockReset()
  base.signIn.mockReset()
  base.resetPassword.mockReset()
})

describe('LoginPage', () => {
  it('affiche un message sur de mauvais identifiants', async () => {
    base.signIn.mockResolvedValue({ error: 'Invalid login credentials' })
    mockAuth.mockReturnValue({ ...base })
    const { field } = renderLogin()

    fireEvent.change(field('email'), { target: { value: 'x@y.fr' } })
    fireEvent.change(field('password'), { target: { value: 'mauvais' } })
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }))

    expect(await screen.findByText('Identifiants incorrects.')).toBeInTheDocument()
  })

  it('redirige vers l’accueil sur connexion réussie', async () => {
    base.signIn.mockResolvedValue({ error: null })
    mockAuth.mockReturnValue({ ...base })
    const { field } = renderLogin()

    fireEvent.change(field('email'), { target: { value: 'super@tcm.fr' } })
    fireEvent.change(field('password'), { target: { value: 'bon-mdp' } })
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }))

    expect(await screen.findByText('ACCUEIL')).toBeInTheDocument()
    expect(base.signIn).toHaveBeenCalledWith('super@tcm.fr', 'bon-mdp')
  })

  it('bascule en mode oublié et envoie un email de réinitialisation', async () => {
    base.resetPassword.mockResolvedValue({ error: null })
    mockAuth.mockReturnValue({ ...base })
    const { field } = renderLogin()

    fireEvent.click(screen.getByRole('button', { name: 'Mot de passe oublié ?' }))
    fireEvent.change(field('email'), { target: { value: 'super@tcm.fr' } })
    fireEvent.click(screen.getByRole('button', { name: 'Envoyer le lien' }))

    await waitFor(() => expect(base.resetPassword).toHaveBeenCalledWith('super@tcm.fr'))
    expect(
      await screen.findByText(/lien de réinitialisation vient d’être envoyé/),
    ).toBeInTheDocument()
  })

  it('affiche la notice transmise après changement de mot de passe', () => {
    mockAuth.mockReturnValue({ ...base })
    renderLogin({ pathname: '/connexion', state: { notice: 'Mot de passe modifié.' } })
    expect(screen.getByText('Mot de passe modifié.')).toBeInTheDocument()
  })
})
