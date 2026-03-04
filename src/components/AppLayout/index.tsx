import { Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { Header } from '@/components/AppLayout/Header'
import { AuthProvider } from '@/contexts/AuthContext'
import { NotificationsProvider } from '@/contexts/NotificationsContext'
import { PluginProvider } from '@/contexts/PluginContext'
import { useThemeContext } from '@/contexts/ThemeContext'
import { WebSocketProvider } from '@/contexts/WebSocketContext'

export const AppLayout = () => {
  const { theme } = useThemeContext()

  return (
    <AuthProvider>
      <WebSocketProvider>
        <NotificationsProvider>
          <PluginProvider>
            <main className="flex min-h-screen flex-col">
              <Header />
              <div className="flex-1">
                <Outlet />
              </div>
              {/* <Footer /> */}
            </main>
            <Toaster theme={theme} />
          </PluginProvider>
        </NotificationsProvider>
      </WebSocketProvider>
    </AuthProvider>
  )
}
