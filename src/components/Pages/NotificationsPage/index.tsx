import { useSearch } from '@tanstack/react-router'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { PageHeader } from '@/components/Pages/NotificationsPage/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useNotificationsContext } from '@/contexts/NotificationsContext'
import { NotificationsPageProvider } from '@/contexts/NotificationsPageContext'
import { useNotificationFilters } from '@/hooks/useNotificationFilters'
import { useNotificationThreads } from '@/hooks/useNotificationThreads'
import { AuthGuard } from '@/lib/AuthGuard'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types/Notification'
import { getNotificationThreadKey } from '@/types/Notification'
import { NotificationFilters } from './NotificationFilters'
import { NotificationItem } from './NotificationItem'
import { NotificationThreadDialog } from './NotificationThreadDialog'

interface ThreadedNotification extends Notification {
  thread?: Notification[]
  threadCount?: number
}

export const NotificationsPage = () => {
  const {
    notifications,
    isLoading,
    markAllAsRead,
    markAllAsUnread,
    markingReadId,
    markingUnreadId,
  } = useNotificationsContext()
  const search = useSearch({ from: '/_app/notifications' })
  const notificationId = search.notificationId
  const notificationRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const [activeTab, setActiveTab] = useState<'unread' | 'all'>('unread')
  const [glowingNotificationId, setGlowingNotificationId] = useState<number | null>(null)
  const [selectedNotificationIds, setSelectedNotificationIds] = useState<Set<number>>(new Set())
  const [groupByTask, setGroupByTask] = useState(true)
  const [openNotificationThreadKey, setOpenNotificationThreadKey] = useState<
    number | string | null
  >(null)
  const selectAllCheckboxRef = useRef<HTMLButtonElement>(null)
  const selectAllCheckboxId = useId()
  const groupByTaskCheckboxId = useId()

  const filters = useNotificationFilters(notifications)
  const unreadNotifications = useMemo(() => notifications.filter((n) => !n.isRead), [notifications])

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
  const allThreads = useNotificationThreads(notifications)

  const openNotificationThread = useMemo(() => {
    if (!openNotificationThreadKey) return null

    if (
      typeof openNotificationThreadKey === 'string' &&
      openNotificationThreadKey.startsWith('single-')
    ) {
      const id = Number.parseInt(openNotificationThreadKey.replace('single-', ''), 10)
      const notification = notifications.find((n) => n.id === id)
      return notification ? [notification] : null
    }

    return allThreads[openNotificationThreadKey] || null
  }, [openNotificationThreadKey, allThreads, notifications])

  useEffect(() => {
    if (notificationId && notifications.length > 0 && !isLoading) {
      const targetNotification = notifications.find((n) => n.id === notificationId)
      if (targetNotification) {
        setActiveTab(targetNotification.isRead ? 'all' : 'unread')
      }
    }
  }, [notificationId, notifications, isLoading])

  const isMarkingSelected = markingReadId !== null || markingUnreadId !== null

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

  // Deep-link scroll effect
  useEffect(() => {
    if (notificationId && !isLoading && notifications.length > 0) {
      const targetNotification = notifications.find((n) => n.id === notificationId)
      if (!targetNotification) return
      const targetTab = targetNotification.isRead ? 'all' : 'unread'
      if (activeTab !== targetTab) return

      const isInDisplayList = displayNotifications.some((n) => {
        if (n.id === notificationId) return true
        return groupByTask && (n.thread?.some((notif) => notif.id === notificationId) ?? false)
      })

      if (isInDisplayList) {
        const timeoutId = setTimeout(() => {
          const element = notificationRefs.current.get(notificationId)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            element.focus()
            setGlowingNotificationId(notificationId)
            setTimeout(() => setGlowingNotificationId(null), 3000)
            window.history.replaceState({}, '', window.location.pathname)
          }
        }, 500)
        return () => clearTimeout(timeoutId)
      }
    }
  }, [notificationId, activeTab, notifications, isLoading, displayNotifications, groupByTask])

  const handleMarkSelectedAsRead = () => {
    const ids =
      selectedNotificationIds.size > 0
        ? Array.from(selectedNotificationIds)
        : filteredNotifications.map((n) => n.id)
    if (ids.length > 0) {
      markAllAsRead(ids)
      setSelectedNotificationIds(new Set())
    }
  }

  const handleMarkSelectedAsUnread = () => {
    const ids =
      selectedNotificationIds.size > 0
        ? Array.from(selectedNotificationIds)
        : filteredNotifications.map((n) => n.id)
    if (ids.length > 0) {
      markAllAsUnread(ids)
      setSelectedNotificationIds(new Set())
    }
  }

  const handleSelectChange = useCallback(
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

  const handleOpenThread = useCallback(
    (notification: Notification) => {
      const key = getNotificationThreadKey(notification)
      const fullThread = threads[key]
      setOpenNotificationThreadKey(
        fullThread && fullThread.length > 0 ? key : `single-${notification.id}`
      )
    },
    [threads]
  )

  const handleSelectAll = (checked: boolean) => {
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
  }

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

  const selectedNotifications = notifications.filter((n) => selectedNotificationIds.has(n.id))
  const allSelectedAreRead =
    selectedNotifications.length > 0 && selectedNotifications.every((n) => n.isRead)

  const pageContextValue = useMemo(
    () => ({
      selectedNotificationIds,
      onSelectChange: handleSelectChange,
      groupByTask,
      onOpenThread: handleOpenThread,
    }),
    [selectedNotificationIds, handleSelectChange, groupByTask, handleOpenThread]
  )

  return (
    <AuthGuard>
      <NotificationsPageProvider value={pageContextValue}>
        <div className="h-full overflow-auto">
          <div className="container mx-auto max-w-4xl px-4 py-6">
            <PageHeader title="Notifications" description="View and manage your notifications" />
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <Checkbox
                id={groupByTaskCheckboxId}
                checked={groupByTask}
                onCheckedChange={(checked) => setGroupByTask(checked === true)}
              />
              <label
                htmlFor={groupByTaskCheckboxId}
                className="cursor-pointer text-sm text-zinc-600 dark:text-zinc-400"
              >
                Group by Task
              </label>
              {groupByTask && (
                <span className="text-xs text-zinc-500 dark:text-zinc-500">
                  Notifications for the same task are grouped together
                </span>
              )}
            </div>
            <NotificationFilters filters={filters} />
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as 'unread' | 'all')}
              >
                <TabsList>
                  <TabsTrigger value="unread">Unread ({filteredUnreadCount})</TabsTrigger>
                  <TabsTrigger value="all">All ({filteredAllCount})</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex flex-wrap items-center gap-2">
                {allSelectedAreRead ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkSelectedAsUnread}
                    disabled={isMarkingSelected || filteredNotifications.length === 0}
                  >
                    {isMarkingSelected
                      ? 'Marking...'
                      : selectedNotificationIds.size > 0
                        ? `Mark ${selectedNotificationIds.size} as unread`
                        : 'Mark all as unread'}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkSelectedAsRead}
                    disabled={isMarkingSelected || filteredNotifications.length === 0}
                  >
                    {isMarkingSelected
                      ? 'Marking...'
                      : selectedNotificationIds.size > 0
                        ? `Mark ${selectedNotificationIds.size} as read`
                        : 'Mark all as read'}
                  </Button>
                )}
              </div>
            </div>

            {isLoading ? (
              <Card className="p-8">
                <div className="text-center text-zinc-500">Loading notifications...</div>
              </Card>
            ) : displayNotifications.length > 0 ? (
              <div className="space-y-2">
                <div className="mb-2 flex items-center gap-2 px-1">
                  <Checkbox
                    ref={selectAllCheckboxRef}
                    id={selectAllCheckboxId}
                    checked={allSelected}
                    indeterminate={someSelected && !allSelected}
                    onCheckedChange={(checked) => handleSelectAll(checked === true)}
                    aria-label="Select all notifications"
                  />
                  <label
                    htmlFor={selectAllCheckboxId}
                    className="text-sm text-zinc-600 dark:text-zinc-400"
                  >
                    {selectedNotificationIds.size > 0
                      ? (() => {
                          const total = groupByTask
                            ? displayNotifications.reduce(
                                (sum, n) => sum + (n.thread || [n]).length,
                                0
                              )
                            : displayNotifications.length
                          return `${selectedNotificationIds.size} of ${total} selected`
                        })()
                      : 'Select all'}
                  </label>
                </div>
                {displayNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    ref={(el) => {
                      if (el) {
                        notificationRefs.current.set(notification.id, el)
                      } else {
                        notificationRefs.current.delete(notification.id)
                      }
                    }}
                    tabIndex={-1}
                    className={cn(
                      'rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                      glowingNotificationId === notification.id &&
                        'animate-pulse shadow-blue-500/50 shadow-lg ring-4 ring-blue-400 ring-offset-2'
                    )}
                  >
                    <NotificationItem
                      notification={notification}
                      showDelete={true}
                      showCheckbox={true}
                      thread={notification.thread}
                      threadCount={notification.threadCount}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-8">
                <div className="space-y-2 text-center">
                  <p className="font-semibold text-lg">You're all up to date</p>
                  <p className="text-sm text-zinc-500">
                    {activeTab === 'unread'
                      ? 'You have no unread notifications at the moment.'
                      : 'You have no notifications.'}
                  </p>
                </div>
              </Card>
            )}

            <NotificationThreadDialog
              thread={openNotificationThread}
              onClose={() => setOpenNotificationThreadKey(null)}
            />
          </div>
        </div>
      </NotificationsPageProvider>
    </AuthGuard>
  )
}
