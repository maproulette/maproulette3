import { Outlet } from '@tanstack/react-router'
import { SuperAdminGuard } from '@/lib/SuperAdminGuard'

export const SuperAdminLayout = () => {
  return (
    <SuperAdminGuard>
      <Outlet />
    </SuperAdminGuard>
  )
}
