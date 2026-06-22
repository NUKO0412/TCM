import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ProtectedRoute } from '../features/admin'
import { ROUTES } from '../config/routes'

// Chargement à la demande : chaque page est un chunk séparé (allège le bundle initial).
// Import depuis le fichier direct (pas le baril features/admin) pour ne pas tout regrouper.
const Site = lazy(() => import('../Site').then((m) => ({ default: m.Site })))
const LegalPage = lazy(() => import('../components/LegalPage').then((m) => ({ default: m.LegalPage })))
const LoginPage = lazy(() => import('../features/auth/LoginPage').then((m) => ({ default: m.LoginPage })))
const ResetPasswordPage = lazy(() =>
  import('../features/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
)
const MessagesPage = lazy(() => import('../features/admin/MessagesPage').then((m) => ({ default: m.MessagesPage })))
const SeoPage = lazy(() => import('../features/admin/SeoPage').then((m) => ({ default: m.SeoPage })))

// Repli neutre pendant le chargement d'un chunk (fond carte, pas de flash blanc).
const Fallback = () => <div style={{ minHeight: '100vh', background: 'var(--ink)' }} />

export function AppRoutes() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route path={ROUTES.home} element={<Site />} />
        <Route path={ROUTES.legal} element={<LegalPage />} />
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.resetPassword} element={<ResetPasswordPage />} />
        <Route
          path={ROUTES.adminMessages}
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.adminSeo}
          element={
            <ProtectedRoute>
              <SeoPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
    </Suspense>
  )
}
