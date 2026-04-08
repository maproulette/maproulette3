import { NotificationsPageProvider } from '@/contexts/NotificationsPageContext'
import { AuthGuard } from '@/lib/AuthGuard'
import { NotificationsPageContent } from './NotificationsPageContent'

export const NotificationsPage = () => {
  return (
    <AuthGuard>
      <NotificationsPageProvider>
        <NotificationsPageContent />
      </NotificationsPageProvider>
    </AuthGuard>
  )
}
