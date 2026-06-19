import { Children, cloneElement, Fragment, useState, type ReactElement } from 'react'
import { useEditMode } from './useEditMode'
import { useStore } from '../content/useStore'
import type { StoreItem } from '../content/store-context'

type Props = {
  collection: string
  newItem: () => Record<string, unknown>
  addLabel?: string
  // compact = petites pastilles (villes, chips) : poignées en badges hors du texte.
  compact?: boolean
  children: (item: StoreItem, index: number) => ReactElement
}

// En lecture : mappe les items (DOM identique). En édition : glisser-déposer
// (poignée), suppression par item, bouton d'ajout. Pas de wrapper ajouté :
// les contrôles sont injectés dans l'élément existant de chaque item.
export function EditableList({ collection, newItem, addLabel, compact, children }: Props) {
  const { editing } = useEditMode()
  const { getItems, addItem, removeItem, reorderItems } = useStore()
  const items = getItems(collection)
  const [dragFrom, setDragFrom] = useState<number | null>(null)

  if (!editing) {
    return (
      <>
        {items.map((it, i) => (
          <Fragment key={it.id}>{children(it, i)}</Fragment>
        ))}
      </>
    )
  }

  const drop = (to: number) => {
    const from = dragFrom
    setDragFrom(null)
    if (from === null || from === to) return
    const ids = items.map((it) => it.id)
    const [moved] = ids.splice(from, 1)
    ids.splice(to, 0, moved)
    void reorderItems(collection, ids)
  }

  return (
    <>
      {items.map((it, i) => {
        const node = children(it, i)
        const prevStyle = (node.props as { style?: React.CSSProperties }).style ?? {}
        const prevChildren = Children.toArray(
          (node.props as { children?: React.ReactNode }).children,
        )
        return cloneElement(
          node,
          {
            key: it.id,
            style: { ...prevStyle, position: 'relative' },
            onDragOver: (e: React.DragEvent) => e.preventDefault(),
            onDrop: () => drop(i),
          } as Partial<typeof node.props>,
          ...prevChildren,
          <span
            key="__grip"
            className={compact ? 'edit-grip edit-grip-compact' : 'edit-grip'}
            title="Glisser pour réordonner"
            draggable
            onDragStart={() => setDragFrom(i)}
          >
            ⠿
          </span>,
          <button
            key="__rm"
            type="button"
            className={compact ? 'edit-remove edit-remove-compact' : 'edit-remove'}
            title="Supprimer"
            onClick={(e) => {
              e.stopPropagation()
              void removeItem(it.id)
            }}
          >
            ×
          </button>,
        )
      })}
      <button type="button" className="edit-add" onClick={() => void addItem(collection, newItem())}>
        {addLabel ?? '+ Ajouter'}
      </button>
    </>
  )
}
