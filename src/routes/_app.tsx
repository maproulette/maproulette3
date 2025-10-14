import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { Header } from '@/components/Header'
import { AuthProvider } from '@/contexts/AuthContext'
import { NotificationsProvider } from '@/contexts/NotificationsContext'
import { useTheme } from '@/contexts/ThemeContext'
import { WebSocketProvider } from '@/contexts/WebSocketContext'

export const Route = createFileRoute('/_app')({
  component: RouteComponent,
})

function RouteComponent() {
  const { theme } = useTheme()

  return (
    <AuthProvider>
      <WebSocketProvider>
        <NotificationsProvider>
          <Header className="fixed inset-x-0 m-4" />
          <main>
            <Outlet />
          </main>
          {/*<footer className="p-5 bg-white dark:bg-zinc-950">Footer...</footer>*/}
          <Toaster theme={theme} />
        </NotificationsProvider>
      </WebSocketProvider>
    </AuthProvider>
  )
}
