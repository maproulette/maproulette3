import type { ReactNode } from 'react'
import { createContext, useContext } from 'react'
import type { Notification } from '@/types/Notification'

interface NotificationsPageContextType {
  selectedNotificationIds: Set<number>
  onSelectChange: (notificationId: number, checked: boolean, thread?: Notification[]) => void
  groupByTask: boolean
  onOpenThread: (notification: Notification) => void
}

const NotificationsPageContext = createContext<NotificationsPageContextType | undefined>(undefined)

export const NotificationsPageProvider = ({
  children,
  value,
}: {
  children: ReactNode
  value: NotificationsPageContextType
}) => {
  return (
    <NotificationsPageContext.Provider value={value}>{children}</NotificationsPageContext.Provider>
  )
}

export const useNotificationsPageContext = () => {
  return useContext(NotificationsPageContext)
}
