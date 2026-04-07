import { Outlet } from '@tanstack/react-router'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { AuthGuard } from '@/lib/AuthGuard'

export const ManagementLayout = () => (
  <AuthGuard>
    <SectionHeader
      colorClass="bg-emerald-600"
      basePath="/manage"
      breadcrumbRoot="create & manage"
    />
    <Outlet />
  </AuthGuard>
)
