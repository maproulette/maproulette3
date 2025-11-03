import { Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { Header } from '@/components/AppLayout/Header'
import { AuthProvider } from '@/contexts/AuthContext'
import { NotificationsProvider } from '@/contexts/NotificationsContext'
import { useThemeContext } from '@/contexts/ThemeContext'
import { WebSocketProvider } from '@/contexts/WebSocketContext'
import { Footer } from './Footer'

export const AppLayout = () => {
  const { theme } = useThemeContext()

  return (
    <AuthProvider>
      <WebSocketProvider>
        <NotificationsProvider>
          <main className="min-h-[calc(100vh-7rem)]">
            <Header className="fixed inset-x-0 top-0 z-50 m-4" />
            <div className="pt-23 pb-4 sm:px-5 md:pt-25">
              <Outlet />
            </div>
            <Footer />
          </main>
          <Toaster theme={theme} />
        </NotificationsProvider>
      </WebSocketProvider>
    </AuthProvider>
  )
}
