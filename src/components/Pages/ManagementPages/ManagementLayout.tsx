import { Outlet } from '@tanstack/react-router'
import { AuthGuard } from '@/components/shared/AuthGuard'

export const ManagementLayout = () => (
  <AuthGuard>
    <Outlet />
  </AuthGuard>
)
