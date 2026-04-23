import { Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { BetaBanner } from '@/components/AppLayout/BetaBanner'
import { Header } from '@/components/AppLayout/Header'
import { WebSocketEventsListener } from '@/components/AppLayout/WebSocketEventsListener'
import { CongratulateModal } from '@/components/shared/CongratulateModal'
import { AuthProvider } from '@/contexts/AuthContext'
import { AvatarProvider } from '@/contexts/AvatarContext'
import { CongratulateProvider } from '@/contexts/CongratulateContext'
import { NavigationProvider } from '@/contexts/NavigationContext'
import { NotificationsProvider } from '@/contexts/NotificationsContext'
import { PageTitleProvider } from '@/contexts/PageTitleContext'
import { PluginProvider } from '@/contexts/PluginContext'
import { useThemeContext } from '@/contexts/ThemeContext'
import { VisibleLayersProvider } from '@/contexts/VisibleLayersContext'
import { WebSocketProvider } from '@/contexts/WebSocketContext'
import { IntlProvider } from '@/i18n'

export const AppLayout = () => {
  const { theme } = useThemeContext()

  return (
    <IntlProvider>
      <AuthProvider>
        <AvatarProvider>
          <PluginProvider>
            <WebSocketProvider>
              <NotificationsProvider>
                <NavigationProvider>
                  <PageTitleProvider>
                    <VisibleLayersProvider>
                      <CongratulateProvider>
                        <WebSocketEventsListener />
                        <main className="mx-auto flex h-screen max-h-[1440px] w-full max-w-[2560px] flex-col">
                          <BetaBanner />
                          <Header />
                          <div className="flex-1 overflow-hidden">
                            <Outlet />
                          </div>
                        </main>
                        <CongratulateModal />
                      </CongratulateProvider>
                    </VisibleLayersProvider>
                  </PageTitleProvider>
                </NavigationProvider>
                <Toaster theme={theme} />
              </NotificationsProvider>
            </WebSocketProvider>
          </PluginProvider>
        </AvatarProvider>
      </AuthProvider>
    </IntlProvider>
  )
}
