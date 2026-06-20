// Façade de la feature « content » — seule porte d'entrée pour le reste de l'app.
// Le code externe importe d'ici, jamais les fichiers internes (loi M3.3/M5.2).
export { ContentProvider } from './ContentProvider'
export { useContent } from './useContent'
export { useStore } from './useStore'
export type { StoreItem } from './store-context'
