// Photo des données de contenu figée au build et embarquée dans index.html
// (script inline). Lue synchroniquement par ContentProvider pour que le premier
// rendu client soit identique au HTML pré-rendu côté serveur → hydratation propre.
interface TcmContentSnapshot {
  sections: { key: string; data: unknown }[]
  items: { id: string; collection: string; ord: number; data: Record<string, unknown> }[]
}

// SEO administré dans TCM, figé au build et embarqué dans la page : pilote le H1
// rendu. Seul le super admin TCM peut modifier la source persistée.
interface TcmSeoSnapshot {
  h1?: string
}

declare global {
  interface Window {
    __TCM_CONTENT__?: TcmContentSnapshot
    __TCM_SEO__?: TcmSeoSnapshot
  }
  var __TCM_CONTENT__: TcmContentSnapshot | undefined
  var __TCM_SEO__: TcmSeoSnapshot | undefined
}

export {}
