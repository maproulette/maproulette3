import { Outlet } from '@tanstack/react-router'
import { AuthGuard } from '@/components/AuthGuard'

export const ManagementLayout = () => (
  <AuthGuard>
    <Outlet />
  </AuthGuard>
)
