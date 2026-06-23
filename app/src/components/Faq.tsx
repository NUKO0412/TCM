import { useContent } from '../features/content'
import { EditableList, EditableText, useEditMode } from '../features/edit'

const s = (v: unknown) => (typeof v === 'string' ? v : '')

// FAQ en bas de page, auto-administrable (bouton Modifier) sur le même modèle que
// les prestations : Théo ajoute, modifie, supprime les questions. Tout le texte
// reste administrable. Le schema FAQPage est régénéré au build depuis ces items.
// Ne s'affiche pas si la section est absente, ni si elle est vide hors édition.
export function Faq() {
  const faq = useContent().faq
  const { editing } = useEditMode()
  if (!faq) return null
  if (!editing && faq.items.length === 0) return null
  return (
    <section className="faq wrap" id="faq">
      <span className="eyebrow reveal">
        <EditableText sectionKey="faq" path="eyebrow" value={faq.eyebrow} />
      </span>
      <h2 className="reveal">
        <EditableText sectionKey="faq" path="heading" value={faq.heading} />
      </h2>
      <div className="faq-list">
        <EditableList
          collection="faq"
          addLabel="+ Question"
          newItem={() => ({ q: 'Nouvelle question ?', a: 'Réponse.' })}
        >
          {(item) => (
            <div className="faq-item reveal">
              <h3 className="faq-q">
                <EditableText itemId={item.id} field="q" value={s(item.data.q)} />
              </h3>
              <p className="faq-a">
                <EditableText itemId={item.id} field="a" value={s(item.data.a)} multiline />
              </p>
            </div>
          )}
        </EditableList>
      </div>
    </section>
  )
}
