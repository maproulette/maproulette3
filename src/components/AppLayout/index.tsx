import { Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { BetaBanner } from '@/components/AppLayout/BetaBanner'
import { Header } from '@/components/AppLayout/Header'
import { PageTitleBar } from '@/components/AppLayout/PageTitleBar'
import { AuthProvider } from '../AuthContext'
import { NavigationProvider } from '../NavigationContext'
import { NotificationsProvider } from '../NotificationsContext'
import { PageTitleProvider } from '../PageTitleContext'
import { PluginProvider } from '../PluginContext'
import { useThemeContext } from '../ThemeContext'
import { WebSocketProvider } from '../WebSocketContext'

export const AppLayout = () => {
  const { theme } = useThemeContext()

  return (
    <AuthProvider>
      <PluginProvider>
        <WebSocketProvider>
          <NotificationsProvider>
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
          </NotificationsProvider>
        </WebSocketProvider>
      </PluginProvider>
    </AuthProvider>
  )
}
