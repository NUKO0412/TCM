// Photo des données de contenu figée au build et embarquée dans index.html
// (script inline). Lue synchroniquement par ContentProvider pour que le premier
// rendu client soit identique au HTML pré-rendu côté serveur → hydratation propre.
interface TcmContentSnapshot {
  sections: { key: string; data: unknown }[]
  items: { id: string; collection: string; ord: number; data: Record<string, unknown> }[]
}

declare global {
  interface Window {
    __TCM_CONTENT__?: TcmContentSnapshot
  }
  var __TCM_CONTENT__: TcmContentSnapshot | undefined
}

export {}
