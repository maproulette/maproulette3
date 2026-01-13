import { Outlet } from '@tanstack/react-router'
import { SuperAdminGuard } from '../shared/SuperAdminGuard'

export const SuperAdminLayout = () => {
  return (
    <SuperAdminGuard>
      <Outlet />
    </SuperAdminGuard>
  )
}
