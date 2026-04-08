import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNotificationFilters } from '@/hooks/useNotificationFilters'
import { useNotificationThreads } from '@/hooks/useNotificationThreads'
import type { Notification } from '@/types/Notification'
import { getNotificationThreadKey } from '@/types/Notification'
import { useNotificationsContext } from './NotificationsContext'

interface ThreadedNotification extends Notification {
  thread?: Notification[]
  threadCount?: number
}

interface NotificationsPageContextType {
  // Tab state
  activeTab: 'unread' | 'all'
  setActiveTab: (tab: 'unread' | 'all') => void

  // Grouping
  groupByTask: boolean
  setGroupByTask: (value: boolean) => void

  // Filters
  filters: ReturnType<typeof useNotificationFilters>
  filteredUnreadCount: number
  filteredAllCount: number

  // Selection
  selectedNotificationIds: Set<number>
  onSelectChange: (notificationId: number, checked: boolean, thread?: Notification[]) => void
  handleSelectAll: (checked: boolean) => void
  allSelected: boolean
  someSelected: boolean
  allSelectedAreRead: boolean

  // Bulk actions
  handleMarkSelectedAsRead: () => void
  handleMarkSelectedAsUnread: () => void
  isMarkingSelected: boolean

  // Display data
  filteredNotifications: Notification[]
  displayNotifications: ThreadedNotification[]
}

const NotificationsPageContext = createContext<NotificationsPageContextType | undefined>(undefined)

export const NotificationsPageProvider = ({ children }: { children: ReactNode }) => {
  const { notifications, markAllAsRead, markAllAsUnread, markingReadId, markingUnreadId } =
    useNotificationsContext()

  const [activeTab, setActiveTab] = useState<'unread' | 'all'>('unread')
  const [groupByTask, setGroupByTask] = useState(true)
  const [selectedNotificationIds, setSelectedNotificationIds] = useState<Set<number>>(new Set())

  const filters = useNotificationFilters(notifications)
  const unreadNotifications = useMemo(() => notifications.filter((n) => !n.isRead), [notifications])

  // Clear selection when tab changes
  useEffect(() => {
    setSelectedNotificationIds(new Set())
  }, [activeTab])

  const filteredUnreadCount = useMemo(
    () => filters.applyFilters(unreadNotifications).length,
    [filters.applyFilters, unreadNotifications]
  )
  const filteredAllCount = useMemo(
    () => filters.applyFilters(notifications).length,
    [filters.applyFilters, notifications]
  )

  const filteredNotifications = useMemo(() => {
    const source = activeTab === 'unread' ? unreadNotifications : notifications
    return filters.applyFilters(source)
  }, [activeTab, unreadNotifications, notifications, filters.applyFilters])

  const threads = useNotificationThreads(filteredNotifications)

  // Display notifications (with threading)
  const displayNotifications = useMemo((): ThreadedNotification[] => {
    if (!groupByTask) return filteredNotifications

    const sorted = [...filteredNotifications].sort(
      (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
    )
    const threadedNotifications: ThreadedNotification[] = []
    const seen = new Set<number | string>()

    for (const notification of sorted) {
      const key = getNotificationThreadKey(notification)
      if (!seen.has(key)) {
        seen.add(key)
        const thread = threads[key] || [notification]
        threadedNotifications.push({ ...notification, thread, threadCount: thread.length })
      }
    }

    return threadedNotifications
  }, [filteredNotifications, groupByTask, threads])

  // Selection
  const isMarkingSelected = markingReadId !== null || markingUnreadId !== null

  const onSelectChange = useCallback(
    (notificationId: number, checked: boolean, thread?: Notification[]) => {
      setSelectedNotificationIds((prev) => {
        const newSet = new Set(prev)
        const targets = groupByTask && thread ? thread : [{ id: notificationId } as Notification]
        for (const n of targets) {
          checked ? newSet.add(n.id) : newSet.delete(n.id)
        }
        return newSet
      })
    },
    [groupByTask]
  )

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (!checked) {
        setSelectedNotificationIds(new Set())
        return
      }
      if (groupByTask) {
        const allIds = new Set<number>()
        for (const n of displayNotifications) {
          for (const notif of n.thread || [n]) allIds.add(notif.id)
        }
        setSelectedNotificationIds(allIds)
      } else {
        setSelectedNotificationIds(new Set(displayNotifications.map((n) => n.id)))
      }
    },
    [groupByTask, displayNotifications]
  )

  const allSelected = useMemo(() => {
    if (displayNotifications.length === 0) return false
    if (!groupByTask) return displayNotifications.every((n) => selectedNotificationIds.has(n.id))
    return displayNotifications.every((n) =>
      (n.thread || [n]).every((notif) => selectedNotificationIds.has(notif.id))
    )
  }, [displayNotifications, selectedNotificationIds, groupByTask])

  const someSelected = useMemo(() => {
    if (!groupByTask) return displayNotifications.some((n) => selectedNotificationIds.has(n.id))
    return displayNotifications.some((n) =>
      (n.thread || [n]).some((notif) => selectedNotificationIds.has(notif.id))
    )
  }, [displayNotifications, selectedNotificationIds, groupByTask])

  const selectedNotifications = useMemo(
    () => notifications.filter((n) => selectedNotificationIds.has(n.id)),
    [notifications, selectedNotificationIds]
  )
  const allSelectedAreRead =
    selectedNotifications.length > 0 && selectedNotifications.every((n) => n.isRead)

  // Bulk actions
  const handleMarkSelectedAsRead = useCallback(() => {
    const ids =
      selectedNotificationIds.size > 0
        ? Array.from(selectedNotificationIds)
        : filteredNotifications.map((n) => n.id)
    if (ids.length > 0) {
      markAllAsRead(ids)
      setSelectedNotificationIds(new Set())
    }
  }, [selectedNotificationIds, filteredNotifications, markAllAsRead])

  const handleMarkSelectedAsUnread = useCallback(() => {
    const ids =
      selectedNotificationIds.size > 0
        ? Array.from(selectedNotificationIds)
        : filteredNotifications.map((n) => n.id)
    if (ids.length > 0) {
      markAllAsUnread(ids)
      setSelectedNotificationIds(new Set())
    }
  }, [selectedNotificationIds, filteredNotifications, markAllAsUnread])

  const value = useMemo<NotificationsPageContextType>(
    () => ({
      activeTab,
      setActiveTab,
      groupByTask,
      setGroupByTask,
      filters,
      filteredUnreadCount,
      filteredAllCount,
      selectedNotificationIds,
      onSelectChange,
      handleSelectAll,
      allSelected,
      someSelected,
      allSelectedAreRead,
      handleMarkSelectedAsRead,
      handleMarkSelectedAsUnread,
      isMarkingSelected,
      filteredNotifications,
      displayNotifications,
    }),
    [
      activeTab,
      groupByTask,
      filters,
      filteredUnreadCount,
      filteredAllCount,
      selectedNotificationIds,
      onSelectChange,
      handleSelectAll,
      allSelected,
      someSelected,
      allSelectedAreRead,
      handleMarkSelectedAsRead,
      handleMarkSelectedAsUnread,
      isMarkingSelected,
      filteredNotifications,
      displayNotifications,
    ]
  )

  return (
    <NotificationsPageContext.Provider value={value}>{children}</NotificationsPageContext.Provider>
  )
}

export const useNotificationsPageContext = () => {
  return useContext(NotificationsPageContext)
}
