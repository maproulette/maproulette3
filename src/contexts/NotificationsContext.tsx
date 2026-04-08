import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import type { Notification } from '@/types/Notification'
import { useAuthContext } from './AuthContext'
import { useWebSocketContext } from './WebSocketContext'

interface NotificationsContextType {
  isLoading: boolean
  notifications: Notification[]
  refetch: () => Promise<unknown>
  markAsRead: (notificationId: number, thread?: Notification[]) => void
  markAsUnread: (notificationId: number, thread?: Notification[]) => void
  deleteNotification: (notificationId: number, thread?: Notification[]) => void
  markAllAsRead: (notificationIds: number[]) => void
  markAllAsUnread: (notificationIds: number[]) => void
  markingReadId: number | null
  markingUnreadId: number | null
  deletingId: number | null
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { lastMessage } = useWebSocketContext()
  const { user } = useAuthContext()
  const { data: notifications = [], isLoading, refetch } = api.user.notification(user?.id)

  const [markingReadId, setMarkingReadId] = useState<number | null>(null)
  const [markingUnreadId, setMarkingUnreadId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const markAsReadMutation = api.user.useMarkNotificationsAsRead()
  const markAsUnreadMutation = api.user.useMarkNotificationsAsUnread()
  const deleteNotificationMutation = api.user.useDeleteNotifications()

  useEffect(() => {
    if (lastMessage?.messageType === 'notification-new') {
      refetch()
    }
  }, [lastMessage, refetch])

  const executeMutation = useCallback(
    (
      mutation: {
        mutate: (
          params: { userId: number; notificationIds: number[] },
          options: { onSuccess: () => void; onError: (error: Error) => void }
        ) => void
      },
      notificationIds: number[],
      action: string,
      setLoadingId?: (id: number | null) => void,
      loadingId?: number | null
    ) => {
      if (!user?.id || notificationIds.length === 0) return
      setLoadingId?.(loadingId ?? null)
      mutation.mutate(
        { userId: user.id, notificationIds },
        {
          onSuccess: () => {
            refetch()
            const count = notificationIds.length
            toast.success(`${count} notification${count === 1 ? '' : 's'} ${action}`)
            setLoadingId?.(null)
          },
          onError: (error: Error) => {
            toast.error(
              `Failed to ${action.replace(/ed$/, '').replace(/d$/, '')} notification: ${error.message}`
            )
            setLoadingId?.(null)
          },
        }
      )
    },
    [user?.id, refetch]
  )

  const markAsRead = useCallback(
    (notificationId: number, thread?: Notification[]) => {
      const ids = thread && thread.length > 1 ? thread.map((n) => n.id) : [notificationId]
      executeMutation(markAsReadMutation, ids, 'marked as read', setMarkingReadId, notificationId)
    },
    [executeMutation, markAsReadMutation]
  )

  const markAsUnread = useCallback(
    (notificationId: number, thread?: Notification[]) => {
      const ids = thread && thread.length > 1 ? thread.map((n) => n.id) : [notificationId]
      executeMutation(
        markAsUnreadMutation,
        ids,
        'marked as unread',
        setMarkingUnreadId,
        notificationId
      )
    },
    [executeMutation, markAsUnreadMutation]
  )

  const deleteNotification = useCallback(
    (notificationId: number, thread?: Notification[]) => {
      const ids = thread && thread.length > 1 ? thread.map((n) => n.id) : [notificationId]
      executeMutation(deleteNotificationMutation, ids, 'deleted', setDeletingId, notificationId)
    },
    [executeMutation, deleteNotificationMutation]
  )

  const markAllAsRead = useCallback(
    (notificationIds: number[]) => {
      executeMutation(markAsReadMutation, notificationIds, 'marked as read')
    },
    [executeMutation, markAsReadMutation]
  )

  const markAllAsUnread = useCallback(
    (notificationIds: number[]) => {
      executeMutation(markAsUnreadMutation, notificationIds, 'marked as unread')
    },
    [executeMutation, markAsUnreadMutation]
  )

  const value = useMemo<NotificationsContextType>(
    () => ({
      isLoading,
      notifications,
      refetch,
      markAsRead,
      markAsUnread,
      deleteNotification,
      markAllAsRead,
      markAllAsUnread,
      markingReadId,
      markingUnreadId,
      deletingId,
    }),
    [
      isLoading,
      notifications,
      refetch,
      markAsRead,
      markAsUnread,
      deleteNotification,
      markAllAsRead,
      markAllAsUnread,
      markingReadId,
      markingUnreadId,
      deletingId,
    ]
  )

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider')
  }
  return context
}
