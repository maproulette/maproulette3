import { Outlet } from '@tanstack/react-router'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { BreadcrumbProvider } from '@/contexts/BreadcrumbContext'
import { HeaderActionsProvider } from '@/contexts/HeaderActionsContext'
import { useIntl } from '@/i18n'
import { AuthGuard } from '@/lib/AuthGuard'

export const ManagementLayout = () => {
  const { t } = useIntl()

  return (
    <AuthGuard>
      <HeaderActionsProvider>
        <BreadcrumbProvider>
          <div className="flex min-h-0 flex-1 flex-col">
            <SectionHeader
              accentClass="border-l-emerald-500"
              basePath="/manage"
              breadcrumbRoot={t('common.createManage', undefined, 'create & manage')}
            />
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
              <Outlet />
            </div>
          </div>
        </BreadcrumbProvider>
      </HeaderActionsProvider>
    </AuthGuard>
  )
}
