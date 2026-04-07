import { Outlet } from '@tanstack/react-router'
import { AuthGuard } from '@/lib/AuthGuard'

export const ManagementLayout = () => (
  <AuthGuard>
    <Outlet />
  </AuthGuard>
)
