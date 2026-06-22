import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ResetPasswordPage } from './ResetPasswordPage'
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

function renderReset() {
  const utils = render(
    <MemoryRouter initialEntries={['/reinitialisation']}>
      <Routes>
        <Route path="/reinitialisation" element={<ResetPasswordPage />} />
        <Route path="/connexion" element={<div>PAGE CONNEXION</div>} />
      </Routes>
    </MemoryRouter>,
  )
  const field = (name: string) =>
    utils.container.querySelector<HTMLInputElement>(`input[name="${name}"]`)!
  return { ...utils, field }
}

beforeEach(() => {
  mockAuth.mockReset()
  base.updatePassword.mockReset()
  base.signOut.mockReset()
})

describe('ResetPasswordPage', () => {
  it('signale un lien invalide sans session de récupération', () => {
    mockAuth.mockReturnValue({ ...base, session: null })
    renderReset()
    expect(screen.getByText('Lien invalide ou expiré')).toBeInTheDocument()
  })

  it('refuse un mot de passe trop court', async () => {
    mockAuth.mockReturnValue({ ...base, session: {} as never })
    const { field } = renderReset()
    fireEvent.change(field('new-password'), { target: { value: 'court' } })
    fireEvent.change(field('confirm-password'), { target: { value: 'court' } })
    fireEvent.click(screen.getByRole('button', { name: 'Définir le mot de passe' }))
    expect(await screen.findByText(/au moins 12 caractères/)).toBeInTheDocument()
    expect(base.updatePassword).not.toHaveBeenCalled()
  })

  it('refuse deux mots de passe différents', async () => {
    mockAuth.mockReturnValue({ ...base, session: {} as never })
    const { field } = renderReset()
    fireEvent.change(field('new-password'), { target: { value: 'motdepasse-111' } })
    fireEvent.change(field('confirm-password'), { target: { value: 'motdepasse-222' } })
    fireEvent.click(screen.getByRole('button', { name: 'Définir le mot de passe' }))
    expect(await screen.findByText(/ne correspondent pas/)).toBeInTheDocument()
    expect(base.updatePassword).not.toHaveBeenCalled()
  })

  it('met à jour le mot de passe, déconnecte et redirige vers la connexion', async () => {
    base.updatePassword.mockResolvedValue({ error: null })
    base.signOut.mockResolvedValue(undefined)
    mockAuth.mockReturnValue({ ...base, session: {} as never })
    const { field } = renderReset()
    fireEvent.change(field('new-password'), { target: { value: 'nouveau-mdp-123' } })
    fireEvent.change(field('confirm-password'), { target: { value: 'nouveau-mdp-123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Définir le mot de passe' }))

    await waitFor(() => expect(base.updatePassword).toHaveBeenCalledWith('nouveau-mdp-123'))
    expect(base.signOut).toHaveBeenCalled()
    expect(await screen.findByText('PAGE CONNEXION')).toBeInTheDocument()
  })

  it('affiche une erreur si la mise à jour échoue', async () => {
    base.updatePassword.mockResolvedValue({ error: 'boom' })
    mockAuth.mockReturnValue({ ...base, session: {} as never })
    const { field } = renderReset()
    fireEvent.change(field('new-password'), { target: { value: 'nouveau-mdp-123' } })
    fireEvent.change(field('confirm-password'), { target: { value: 'nouveau-mdp-123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Définir le mot de passe' }))

    expect(await screen.findByText(/La mise à jour a échoué/)).toBeInTheDocument()
    expect(base.signOut).not.toHaveBeenCalled()
  })
})
