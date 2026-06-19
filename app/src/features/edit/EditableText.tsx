import { useEffect, useRef } from 'react'
import { useEditMode } from './useEditMode'
import { useStore } from '../content/useStore'

type Bind =
  | { sectionKey: string; path: string }
  | { itemId: string; field: string }

type Props = Bind & {
  value: string
  className?: string
  multiline?: boolean
}

// En lecture : rend la chaîne brute (DOM identique au site public).
// En édition : élément contentEditable, commit au blur.
export function EditableText(props: Props) {
  const { value, className, multiline } = props
  const { editing } = useEditMode()
  const { updateSection, updateItem } = useStore()
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (editing && ref.current) ref.current.textContent = value
    // seed une seule fois à l'entrée en édition / changement de valeur externe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing])

  if (!editing) return <>{value}</>

  const commit = (text: string) => {
    if (text === value) return
    if ('sectionKey' in props) void updateSection(props.sectionKey, props.path, text)
    else void updateItem(props.itemId, props.field, text)
  }

  return (
    <span
      ref={ref}
      className={`editable${className ? ' ' + className : ''}`}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => commit(e.currentTarget.textContent ?? '')}
      onKeyDown={(e) => {
        if (!multiline && e.key === 'Enter') {
          e.preventDefault()
          e.currentTarget.blur()
        }
      }}
    />
  )
}
