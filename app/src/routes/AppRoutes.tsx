import { Routes, Route, Navigate } from 'react-router-dom'
import { Site } from '../Site'
import { LegalPage } from '../components/LegalPage'
import { LoginPage } from '../features/auth/LoginPage'
import { ProtectedRoute } from '../features/admin/ProtectedRoute'
import { MessagesPage } from '../features/admin/MessagesPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Site />} />
      <Route path="/mentions-legales" element={<LegalPage />} />
      <Route path="/connexion" element={<LoginPage />} />
      <Route
        path="/admin/messages"
        element={
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
