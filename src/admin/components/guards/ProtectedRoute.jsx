import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import useAdminStore from '../../store/adminStore'
import AdminLayout from '../layout/AdminLayout'
import LoadingScreen from '../ui/LoadingScreen'

export default function ProtectedRoute() {
  const isAuthenticated = useAdminStore(s => s.isAuthenticated)
  const isLoading = useAdminStore(s => s.isLoading)
  const initialize = useAdminStore(s => s.initialize)

  // The store guards against running twice, so a remount no longer refetches
  // the profile on every navigation.
  useEffect(() => { initialize() }, [initialize])

  if (isLoading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}
