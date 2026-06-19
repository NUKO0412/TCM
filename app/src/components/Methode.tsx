import { useContent } from '../features/content/useContent'
import { EditableText } from '../features/edit/EditableText'
import { EditableList } from '../features/edit/EditableList'

const s = (v: unknown) => (typeof v === 'string' ? v : '')

export function Methode() {
  const { eyebrow, heading } = useContent().methode
  return (
    <section className="methode wrap" id="methode">
      <span className="eyebrow reveal">
        <EditableText sectionKey="methode" path="eyebrow" value={eyebrow} />
      </span>
      <h2 className="reveal">
        <EditableText sectionKey="methode" path="heading" value={heading} />
      </h2>
      <div className="steps">
        <EditableList
          collection="methode_steps"
          addLabel="+ Étape"
          newItem={() => ({ k: 'ÉTAPE 00', title: 'Nouvelle étape', text: 'Description.' })}
        >
          {(item) => (
            <div className="step reveal">
              <div className="k">{s(item.data.k)}</div>
              <h3>
                <EditableText itemId={item.id} field="title" value={s(item.data.title)} />
              </h3>
              <p>
                <EditableText itemId={item.id} field="text" value={s(item.data.text)} multiline />
              </p>
            </div>
          )}
        </EditableList>
      </div>
    </section>
  )
}
