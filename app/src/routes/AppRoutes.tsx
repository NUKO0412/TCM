import { Routes, Route, Navigate } from 'react-router-dom'
import { Site } from '../Site'
import { LegalPage } from '../components/LegalPage'
import { LoginPage } from '../features/auth'
import { MessagesPage, ProtectedRoute } from '../features/admin'
import { ROUTES } from '../config/routes'

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.home} element={<Site />} />
      <Route path={ROUTES.legal} element={<LegalPage />} />
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route
        path={ROUTES.adminMessages}
        element={
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  )
}
