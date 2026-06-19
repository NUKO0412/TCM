import { useContent } from '../features/content/useContent'
import { EditableText } from '../features/edit/EditableText'
import { EditableList } from '../features/edit/EditableList'
import { Icon } from './IconDefs'

const s = (v: unknown) => (typeof v === 'string' ? v : '')

export function Prestations() {
  const { eyebrow, heading, lead, cta } = useContent().prestations
  return (
    <section className="presta" id="presta">
      <div className="wrap">
        <span className="eyebrow reveal">
          <EditableText sectionKey="prestations" path="eyebrow" value={eyebrow} />
        </span>
        <h2 className="reveal">
          <EditableText sectionKey="prestations" path="heading" value={heading} />
        </h2>
        <p className="lead reveal">
          <EditableText sectionKey="prestations" path="lead" value={lead} multiline />
        </p>
        <div className="cards">
          <EditableList
            collection="presta_cards"
            addLabel="+ Prestation"
            newItem={() => ({ num: '00', icon: 'i-plank', title: 'Nouvelle prestation', text: 'Description.' })}
          >
            {(item) => (
              <div className="card reveal">
                <span className="num">{s(item.data.num)}</span>
                <div className="ic">
                  <Icon name={s(item.data.icon) || 'i-plank'} />
                </div>
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
        <div className="more reveal">
          <EditableList collection="chips" addLabel="+ Tag" compact newItem={() => ({ text: 'Nouveau' })}>
            {(item) => (
              <span className="chip">
                <EditableText itemId={item.id} field="text" value={s(item.data.text)} />
              </span>
            )}
          </EditableList>
          <a className="link-cta" href={cta.href} style={{ marginLeft: 'auto' }}>
            {cta.label} <Icon name="i-arrow" style={{ width: 15, height: 15 }} />
          </a>
        </div>
      </div>
    </section>
  )
}
