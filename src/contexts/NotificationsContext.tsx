import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { createContext, useContext, useEffect } from 'react'
import { api } from '@/api'
import { useWebSocketContext } from '@/contexts/WebSocketContext'
import type { Notification } from '@/types/Notification'
import { useAuth } from './AuthContext'

interface NotificationsContextType {
  isLoading: boolean
  notifications: Notification[]
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { lastMessage } = useWebSocketContext()
  const { user } = useAuth()
  const { data: notifications = [], isLoading, refetch } = useQuery(api.user.notification(user?.id))

  useEffect(() => {
    if (lastMessage?.messageType === 'notification-new') {
      refetch()
    }
  }, [lastMessage, refetch])

  const value: NotificationsContextType = {
    isLoading,
    notifications,
  }

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export const useNotifications = () => {
  const context = useContext(NotificationsContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider')
  }
  return context
}
