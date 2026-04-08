import { Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { BetaBanner } from '@/components/AppLayout/BetaBanner'
import { Header } from '@/components/AppLayout/Header'
import { AuthProvider } from '@/contexts/AuthContext'
import { AvatarProvider } from '@/contexts/AvatarContext'
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
      <AvatarProvider>
        <PluginProvider>
          <WebSocketProvider>
            <NotificationsProvider>
              <NavigationProvider>
                <PageTitleProvider>
                  <main className="mx-auto flex h-screen max-h-[1440px] w-full max-w-[2560px] flex-col">
                    <BetaBanner />
                    <Header />
                    <div className="flex-1 overflow-hidden">
                      <Outlet />
                    </div>
                  </main>
                </PageTitleProvider>
              </NavigationProvider>
              <Toaster theme={theme} />
            </NotificationsProvider>
          </WebSocketProvider>
        </PluginProvider>
      </AvatarProvider>
    </AuthProvider>
  )
}
