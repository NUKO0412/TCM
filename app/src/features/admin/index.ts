// Façade de la feature « admin » (back-office). Expose le garde de route ;
// les pages (MessagesPage, SeoPage) sont chargées à la demande par le routeur
// (import dynamique direct, pour le code-splitting), donc pas réexportées ici.
export { ProtectedRoute } from './ProtectedRoute'
