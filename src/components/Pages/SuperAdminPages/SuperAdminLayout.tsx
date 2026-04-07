import { Outlet } from '@tanstack/react-router'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { SuperAdminGuard } from '@/lib/SuperAdminGuard'

export const SuperAdminLayout = () => (
  <SuperAdminGuard>
    <div className="flex h-full flex-col">
      <SectionHeader
        accentClass="border-l-purple-500"
        basePath="/super-admin"
        breadcrumbRoot="super admin"
      />
      <div className="flex-1 overflow-auto p-4">
        <Outlet />
      </div>
    </div>
  </SuperAdminGuard>
)
