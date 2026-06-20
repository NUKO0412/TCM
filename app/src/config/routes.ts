// Table centrale des chemins de l'app — source unique de vérité (anti-lien-mort).
// Tout composant/route qui navigue importe d'ici ; zéro chemin en dur dispersé.
export const ROUTES = {
  home: '/',
  legal: '/mentions-legales',
  login: '/connexion',
  adminMessages: '/admin/messages',
} as const
