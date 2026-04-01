import { Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { BetaBanner } from '@/components/AppLayout/BetaBanner'
import { Header } from '@/components/AppLayout/Header'
import { PageTitleBar } from '@/components/AppLayout/PageTitleBar'
import { AuthProvider } from '@/contexts/AuthContext'
import { NavigationProvider } from '@/contexts/NavigationContext'
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
            <NavigationProvider>
              <PageTitleProvider>
                <main className="flex min-h-screen flex-col">
                  <BetaBanner />
                  <Header />
                  <PageTitleBar />
                  <div className="flex-1">
                    <Outlet />
                  </div>
                </main>
              </PageTitleProvider>
            </NavigationProvider>
            <Toaster theme={theme} />
          </PluginProvider>
        </NotificationsProvider>
      </WebSocketProvider>
    </AuthProvider>
  )
}
