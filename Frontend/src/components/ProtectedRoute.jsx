import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function ProtectedRoute() {
  const { isAuthenticated, loading, token } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>
  }

  return isAuthenticated && token ? <Outlet /> : <Navigate to="/create-account" replace />
}
