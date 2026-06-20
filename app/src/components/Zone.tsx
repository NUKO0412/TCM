import { useContent } from '../features/content'
import { EditableList, EditableText } from '../features/edit'

const s = (v: unknown) => (typeof v === 'string' ? v : '')

export function Zone() {
  const { eyebrow, heading, paragraph } = useContent().zone
  return (
    <section className="zone" id="zone">
      <div className="wrap zone-grid">
        <div>
          <span className="eyebrow reveal">
            <EditableText sectionKey="zone" path="eyebrow" value={eyebrow} />
          </span>
          <h2 className="reveal">
            <EditableText sectionKey="zone" path="heading" value={heading} />
          </h2>
          <p className="reveal">
            <EditableText sectionKey="zone" path="paragraph" value={paragraph} multiline />
          </p>
        </div>
        <div className="villes reveal">
          <EditableList collection="villes" addLabel="+ Ville" compact newItem={() => ({ name: 'Ville' })}>
            {(item) => (
              <span className="ville">
                <i>↳</i> <EditableText itemId={item.id} field="name" value={s(item.data.name)} />
              </span>
            )}
          </EditableList>
        </div>
      </div>
    </section>
  )
}
