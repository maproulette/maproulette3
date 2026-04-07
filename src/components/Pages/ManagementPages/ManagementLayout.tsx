import { Outlet } from '@tanstack/react-router'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { AuthGuard } from '@/lib/AuthGuard'

export const ManagementLayout = () => (
  <AuthGuard>
    <div className="flex h-full flex-col">
      <SectionHeader
        accentClass="border-l-emerald-500"
        basePath="/manage"
        breadcrumbRoot="create & manage"
      />
      <div className="flex-1 overflow-auto p-4">
        <Outlet />
      </div>
    </div>
  </AuthGuard>
)
