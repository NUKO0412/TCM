import { EditableList } from '../features/edit/EditableList'
import { EditableText } from '../features/edit/EditableText'

const s = (v: unknown) => (typeof v === 'string' ? v : '')

export function Credibility() {
  return (
    <section className="cred">
      <div className="wrap">
        <EditableList
          collection="cred"
          addLabel="+ Chiffre"
          newItem={() => ({ n: '00', t: 'intitulé', d: 'description' })}
        >
          {(item) => (
            <div className="cred-cell reveal">
              <div className="n">
                <EditableText itemId={item.id} field="n" value={s(item.data.n)} />
              </div>
              <div className="t">
                <EditableText itemId={item.id} field="t" value={s(item.data.t)} />
              </div>
              <div className="d">
                <EditableText itemId={item.id} field="d" value={s(item.data.d)} />
              </div>
            </div>
          )}
        </EditableList>
      </div>
    </section>
  )
}
