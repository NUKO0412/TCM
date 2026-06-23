// Façade de la feature « auth » — seule porte d'entrée externe.
// LoginPage et ResetPasswordPage ne sont PAS réexportées ici : elles sont
// chargées en lazy directement depuis leur fichier par AppRoutes. Les sortir du
// baril évite que ce baril (importé en statique pour AuthProvider/useAuth) ne
// les tire dans le bundle initial et n'annule leur découpage (warning Rollup).
export { AuthProvider } from './AuthProvider'
export { useAuth } from './useAuth'
