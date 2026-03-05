import { Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { Header } from '@/components/AppLayout/Header'
import { PageTitleBar } from '@/components/AppLayout/PageTitleBar'
import { AuthProvider } from '@/contexts/AuthContext'
import { NotificationsProvider } from '@/contexts/NotificationsContext'
import { PageTitleProvider } from '@/contexts/PageTitleContext'
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
            <PageTitleProvider>
              <main className="flex min-h-screen flex-col">
                <Header />
                <PageTitleBar />
                <div className="flex-1">
                  <Outlet />
                </div>
                {/* <Footer /> */}
              </main>
            </PageTitleProvider>
            <Toaster theme={theme} />
          </PluginProvider>
        </NotificationsProvider>
      </WebSocketProvider>
    </AuthProvider>
  )
}
