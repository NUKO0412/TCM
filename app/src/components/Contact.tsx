import { useState, type FormEvent } from 'react'
import { useContent } from '../features/content'
import { EditableText, useEditMode } from '../features/edit'
import { submitContactRequest } from '../features/contact'
import { Icon } from './IconDefs'

// Téléphone -> lien d'appel, email -> lien mail (cliquables hors édition).
const linkFor = (icon: string, text: string) =>
  icon === 'i-phone'
    ? `tel:${text.replace(/[^\d+]/g, '')}`
    : icon === 'i-mail'
      ? `mailto:${text.trim()}`
      : null

const empty = { nom: '', prenom: '', email: '', telephone: '', ville: '', type_projet: '', message: '' }

export function Contact() {
  const { eyebrow, heading, intro, info, projectTypes, submitLabel } = useContent().contact
  const { editing } = useEditMode()
  const [form, setForm] = useState({ ...empty, type_projet: projectTypes[0] ?? '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.email.trim()) return
    setStatus('sending')
    try {
      await submitContactRequest(form)
      setStatus('sent')
    } catch (err) {
      console.error('contact submit', err)
      setStatus('error')
    }
  }

  return (
    <section className="contact wrap" id="contact">
      <div className="contact-grid">
        <div>
          <span className="eyebrow reveal">
            <EditableText sectionKey="contact" path="eyebrow" value={eyebrow} />
          </span>
          <h2 className="reveal">
            <EditableText sectionKey="contact" path="heading" value={heading} />
          </h2>
          <p className="intro reveal">
            <EditableText sectionKey="contact" path="intro" value={intro} multiline />
          </p>
          <div className="cinfo reveal">
            {info.map((item, idx) => {
              const inner = (
                <>
                  <span className="ci">
                    <Icon name={item.icon} />
                  </span>{' '}
                  <EditableText sectionKey="contact" path={`info.${idx}.text`} value={item.text} />
                </>
              )
              const href = linkFor(item.icon, item.text)
              return !editing && href ? (
                <a key={item.icon} href={href}>
                  {inner}
                </a>
              ) : (
                <div key={item.icon}>{inner}</div>
              )
            })}
            <a
              href="https://www.instagram.com/tcm_agencements/?hl=fr"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="ci">
                <Icon name="i-instagram" />
              </span>{' '}
              Instagram
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61556346415173"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="ci">
                <Icon name="i-facebook" />
              </span>{' '}
              Facebook
            </a>
          </div>
        </div>

        {status === 'sent' ? (
          <div className="form reveal" role="status">
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: 24, marginBottom: 10 }}>Demande envoyée.</h3>
            <p style={{ color: '#D8CFBC', fontSize: 15 }}>
              Merci, votre demande a bien été enregistrée. On vous recontacte rapidement.
            </p>
          </div>
        ) : (
          <form className="form reveal" onSubmit={onSubmit}>
            <div className="row">
              <div className="field">
                <label>Nom</label>
                <input
                  name="lastName"
                  autoComplete="family-name"
                  placeholder="Le Gall"
                  value={form.nom}
                  onChange={set('nom')}
                />
              </div>
              <div className="field">
                <label>Prénom</label>
                <input
                  name="firstName"
                  autoComplete="given-name"
                  placeholder="Yann"
                  value={form.prenom}
                  onChange={set('prenom')}
                />
              </div>
            </div>
            <div className="row">
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="vous@email.fr"
                  value={form.email}
                  onChange={set('email')}
                />
              </div>
              <div className="field">
                <label>Téléphone</label>
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="06 .. .. .. .."
                  value={form.telephone}
                  onChange={set('telephone')}
                />
              </div>
            </div>
            <div className="row">
              <div className="field">
                <label>Ville</label>
                <input
                  name="city"
                  autoComplete="address-level2"
                  placeholder="Lorient"
                  value={form.ville}
                  onChange={set('ville')}
                />
              </div>
              <div className="field">
                <label>Type de projet</label>
                <select name="projectType" value={form.type_projet} onChange={set('type_projet')}>
                  {projectTypes.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field">
              <label>Votre message</label>
              <textarea
                name="message"
                placeholder="Décrivez votre projet, la pièce, les dimensions approximatives…"
                value={form.message}
                onChange={set('message')}
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Envoi…' : submitLabel}{' '}
              <span className="ic">
                <Icon name="i-send" className="" />
              </span>
            </button>
            {status === 'error' && (
              <div className="legal">
                <span style={{ color: '#e0a070' }}>Échec de l'envoi, réessayez.</span>
              </div>
            )}
          </form>
        )}
      </div>
    </section>
  )
}
