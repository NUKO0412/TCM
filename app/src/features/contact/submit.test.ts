import { describe, it, expect, vi, beforeEach } from 'vitest'
import { submitContactRequest, type ContactPayload } from './submit'

// Mock du client Supabase : on contrôle le retour de insert().
const { insertMock, fromMock } = vi.hoisted(() => {
  const insertMock = vi.fn()
  const fromMock = vi.fn(() => ({ insert: insertMock }))
  return { insertMock, fromMock }
})
vi.mock('../../lib/supabase', () => ({ supabase: { from: fromMock } }))

const payload: ContactPayload = {
  nom: 'Le Gall', prenom: 'Yann', email: 'yann@exemple.fr',
  telephone: '0600000000', ville: 'Lorient', type_projet: 'Cuisine', message: 'Bonjour',
}

beforeEach(() => {
  insertMock.mockReset().mockResolvedValue({ error: null })
  fromMock.mockClear()
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
})

describe('submitContactRequest', () => {
  it('insère la demande avec un id généré puis appelle /api/contact avec ce même id', async () => {
    await submitContactRequest(payload)
    expect(fromMock).toHaveBeenCalledWith('contact_requests')
    const inserted = insertMock.mock.calls[0][0]
    expect(inserted).toMatchObject(payload)
    expect(inserted.id).toMatch(/^[0-9a-f-]{36}$/i)
    const fetchArg = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(fetchArg[0]).toBe('/api/contact')
    expect(JSON.parse(fetchArg[1].body).id).toBe(inserted.id)
  })

  it('lève si l’enregistrement échoue', async () => {
    insertMock.mockResolvedValue({ error: { message: 'rls' } })
    await expect(submitContactRequest(payload)).rejects.toBeTruthy()
  })

  it('n’échoue pas si l’e-mail (/api/contact) échoue — la demande est déjà enregistrée', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('réseau')))
    await expect(submitContactRequest(payload)).resolves.toBeUndefined()
    expect(insertMock).toHaveBeenCalledTimes(1)
  })
})
