import { Outlet } from '@tanstack/react-router'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { SuperAdminGuard } from '@/lib/SuperAdminGuard'

export const SuperAdminLayout = () => (
  <SuperAdminGuard>
    <SectionHeader
      colorClass="bg-purple-600"
      basePath="/super-admin"
      breadcrumbRoot="super admin"
    />
    <Outlet />
  </SuperAdminGuard>
)
