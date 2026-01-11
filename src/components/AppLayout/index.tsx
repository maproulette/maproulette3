import { Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { Header } from '@/components/AppLayout/Header'
import { AuthProvider } from '@/contexts/AuthContext'
import { NotificationsProvider } from '@/contexts/NotificationsContext'
import { PluginProvider } from '@/contexts/PluginContext'
import { useThemeContext } from '@/contexts/ThemeContext'
import { WebSocketProvider } from '@/contexts/WebSocketContext'
import { Footer } from './Footer'

export const AppLayout = () => {
  const { theme } = useThemeContext()

  return (
    <AuthProvider>
      <WebSocketProvider>
        <NotificationsProvider>
          <PluginProvider>
            <main className="flex min-h-screen flex-col">
              <Header className="m-4" />
              <div className="flex-1 pb-4 sm:px-5">
                <Outlet />
              </div>
              <Footer />
            </main>
            <Toaster theme={theme} />
          </PluginProvider>
        </NotificationsProvider>
      </WebSocketProvider>
    </AuthProvider>
  )
}
