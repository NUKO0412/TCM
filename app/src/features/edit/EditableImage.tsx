import { useRef, useState, type CSSProperties } from 'react'
import { useEditMode } from './useEditMode'

type Props = {
  src: string
  alt: string
  className?: string
  style?: CSSProperties
  srcSet?: string
  sizes?: string
  fetchPriority?: 'high' | 'low' | 'auto'
  decoding?: 'async' | 'sync' | 'auto'
  onReplace: (url: string) => void
  // En lecture seule : clic sur l'image (ex. ouvrir un aperçu plein écran).
  onView?: () => void
  // Si fourni : la sélection/le glisser accepte PLUSIEURS fichiers, gérés par
  // l'appelant (ex. carrousel : ajoute jusqu'à 3 photos d'un coup).
  onFiles?: (files: FileList) => void
  // Perf : 'lazy' pour les images sous la ligne de flottaison (pas le hero).
  loading?: 'lazy' | 'eager'
}

// En lecture : <img> identique. En édition : overlay glisser-déposer / clic.
export function EditableImage({
  src,
  alt,
  className,
  style,
  srcSet,
  sizes,
  fetchPriority,
  decoding,
  onReplace,
  onView,
  onFiles,
  loading,
}: Props) {
  const { editing } = useEditMode()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [hover, setHover] = useState(false)

  // Traite les fichiers déposés/choisis : multiple si onFiles, sinon un seul.
  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length) return
    if (onFiles) {
      onFiles(files)
      return
    }
    setBusy(true)
    try {
      const { uploadImage } = await import('../../lib/storage')
      onReplace(await uploadImage(files[0]))
    } catch (e) {
      console.error('upload image', e)
      alert("Échec de l'upload de l'image : " + (e instanceof Error ? e.message : String(e)))
    } finally {
      setBusy(false)
    }
  }

  if (!editing) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        srcSet={srcSet}
        sizes={sizes}
        fetchPriority={fetchPriority}
        decoding={decoding}
        style={onView ? { ...style, cursor: 'zoom-in' } : style}
        onClick={onView}
        loading={loading}
      />
    )
  }

  const img = (
    <img
      src={src}
      alt={alt}
      className={className}
      srcSet={srcSet}
      sizes={sizes}
      fetchPriority={fetchPriority}
      decoding={decoding}
      style={style}
    />
  )

  return (
    <>
      {img}
      <div
        className="edit-img-overlay"
        data-hover={hover || busy ? '1' : undefined}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setHover(true)
        }}
        onDragLeave={() => setHover(false)}
        onDrop={(e) => {
          e.preventDefault()
          setHover(false)
          void handleFiles(e.dataTransfer.files)
        }}
      >
        <span>{busy ? 'Envoi…' : onFiles ? 'Glisser des photos ou cliquer' : 'Glisser une photo ou cliquer'}</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={!!onFiles}
        hidden
        onChange={(e) => {
          void handleFiles(e.target.files)
          e.target.value = ''
        }}
      />
    </>
  )
}
