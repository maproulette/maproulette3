import { Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { Header } from '@/components/AppLayout/Header'
import { AuthProvider } from '@/contexts/AuthContext'
import { NotificationsProvider } from '@/contexts/NotificationsContext'
import { useTheme } from '@/contexts/ThemeContext'
import { WebSocketProvider } from '@/contexts/WebSocketContext'

export const AppLayout = () => {
  const { theme } = useTheme()

  return (
    <AuthProvider>
      <WebSocketProvider>
        <NotificationsProvider>
          <Header className="fixed inset-x-0 top-0 z-50 m-4" />
          <main className="pt-25 sm:px-5">
            <Outlet />
          </main>
          {/*<footer className="p-5 bg-white dark:bg-zinc-950">Footer...</footer>*/}
          <Toaster theme={theme} />
        </NotificationsProvider>
      </WebSocketProvider>
    </AuthProvider>
  )
}
