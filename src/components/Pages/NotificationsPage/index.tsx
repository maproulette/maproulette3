import { useSearch } from '@tanstack/react-router'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import { PageHeader } from '@/components/Pages/NotificationsPage/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useAuthContext } from '@/contexts/AuthContext'
import { useNotificationsContext } from '@/contexts/NotificationsContext'
import { AuthGuard } from '@/lib/AuthGuard'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types/Notification'
import { NOTIFICATION_TYPE_NAMES } from '@/types/Notification'
import { NotificationItem } from './NotificationItem'

export const NotificationsPage = () => {
  const { notifications, isLoading, refetch } = useNotificationsContext()
  const { user } = useAuthContext()
  const search = useSearch({ from: '/_app/notifications' })
  const notificationId = search.notificationId
  const notificationRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const [unreadNotifications, setUnreadNotifications] = useState(
    notifications.filter((notification) => !notification.isRead)
  )

  const [activeTab, setActiveTab] = useState<'unread' | 'all'>('unread')
  const [markingUnreadId, setMarkingUnreadId] = useState<number | null>(null)
  const [markingReadId, setMarkingReadId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [glowingNotificationId, setGlowingNotificationId] = useState<number | null>(null)
  const [selectedNotificationIds, setSelectedNotificationIds] = useState<Set<number>>(new Set())
  const [groupByTask, setGroupByTask] = useState(true)
  const [openNotificationThreadKey, setOpenNotificationThreadKey] = useState<
    number | string | null
  >(null)
  const [filterTask, setFilterTask] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterFrom, setFilterFrom] = useState<string>('all')
  const [filterChallenge, setFilterChallenge] = useState<string>('all')
  const selectAllCheckboxRef = useRef<HTMLButtonElement>(null)
  const selectAllCheckboxId = useId()
  const groupByTaskCheckboxId = useId()

  useEffect(() => {
    if (notifications) {
      setUnreadNotifications(notifications.filter((notification) => !notification.isRead))
    }
  }, [notifications])

  useEffect(() => {
    setSelectedNotificationIds(new Set())
  }, [activeTab])

  const filterOptions = useMemo(() => {
    const tasks = new Set<number>()
    const types = new Set<number>()
    const fromUsers = new Set<string>()
    const challenges = new Set<string>()

    notifications.forEach((n) => {
      if (n.taskId) tasks.add(n.taskId)
      if (n.notificationType !== undefined) types.add(n.notificationType)
      if (n.fromUsername) fromUsers.add(n.fromUsername)
      if (n.challengeName) challenges.add(n.challengeName)
    })

    return {
      tasks: Array.from(tasks).sort((a, b) => a - b),
      types: Array.from(types).sort((a, b) => a - b),
      fromUsers: Array.from(fromUsers).sort(),
      challenges: Array.from(challenges).sort(),
    }
  }, [notifications])

  const applyFilters = useCallback(
    (notificationsToFilter: Notification[]) => {
      let filtered = [...notificationsToFilter]

      if (filterTask !== 'all') {
        const taskId = parseInt(filterTask, 10)
        filtered = filtered.filter((n) => n.taskId === taskId)
      }

      if (filterType !== 'all') {
        const typeId = parseInt(filterType, 10)
        filtered = filtered.filter((n) => n.notificationType === typeId)
      }

      if (filterFrom !== 'all') {
        filtered = filtered.filter((n) => n.fromUsername === filterFrom)
      }

      if (filterChallenge !== 'all') {
        filtered = filtered.filter((n) => n.challengeName === filterChallenge)
      }

      return filtered
    },
    [filterTask, filterType, filterFrom, filterChallenge]
  )

  const filteredUnreadCount = useMemo(
    () => applyFilters(unreadNotifications).length,
    [applyFilters, unreadNotifications]
  )
  const filteredAllCount = useMemo(
    () => applyFilters(notifications).length,
    [applyFilters, notifications]
  )

  const filteredNotifications = useMemo(() => {
    let source: Notification[]
    if (activeTab === 'unread') {
      source = unreadNotifications
    } else {
      source = notifications
    }
    return applyFilters(source)
  }, [activeTab, unreadNotifications, notifications, applyFilters])

  const threads = useMemo(() => {
    if (!groupByTask) return {}
    const grouped: Record<number | string, Notification[]> = {}
    for (const notification of filteredNotifications) {
      const key = notification.taskId || notification.challengeName || 'no-task'
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(notification)
    }
    return grouped
  }, [filteredNotifications, groupByTask])

  const allThreads = useMemo(() => {
    const grouped: Record<number | string, Notification[]> = {}
    for (const notification of notifications) {
      const key = notification.taskId || notification.challengeName || 'no-task'
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(notification)
    }
    return grouped
  }, [notifications])

  const openNotificationThread = useMemo(() => {
    if (!openNotificationThreadKey) return null

    if (
      typeof openNotificationThreadKey === 'string' &&
      openNotificationThreadKey.startsWith('single-')
    ) {
      const notificationId = Number.parseInt(openNotificationThreadKey.replace('single-', ''), 10)
      const notification = notifications.find((n) => n.id === notificationId)
      return notification ? [notification] : null
    }

    return allThreads[openNotificationThreadKey] || null
  }, [openNotificationThreadKey, allThreads, notifications])

  useEffect(() => {
    if (notificationId && notifications.length > 0 && !isLoading) {
      const targetNotification = notifications.find((n) => n.id === notificationId)
      if (targetNotification) {
        const targetTab = targetNotification.isRead ? 'all' : 'unread'
        setActiveTab(targetTab)
      }
    }
  }, [notificationId, notifications, isLoading])

  const markAsUnreadMutation = api.user.useMarkNotificationsAsUnread()
  const markAsReadMutation = api.user.useMarkNotificationsAsRead()
  const deleteNotificationMutation = api.user.useDeleteNotifications()

  const handleMarkAsUnread = (notificationId: number, thread?: Notification[]) => {
    if (!user?.id) return
    const notificationIds =
      groupByTask && thread && thread.length > 1 ? thread.map((n) => n.id) : [notificationId]

    setMarkingUnreadId(notificationId)
    markAsUnreadMutation.mutate(
      { userId: user.id, notificationIds },
      {
        onSuccess: () => {
          refetch()
          const count = notificationIds.length
          toast.success(`${count} notification${count === 1 ? '' : 's'} marked as unread`)
          setMarkingUnreadId(null)
        },
        onError: (error) => {
          toast.error(`Failed to mark notification as unread: ${error.message}`)
          setMarkingUnreadId(null)
        },
      }
    )
  }

  const handleMarkAsRead = (notificationId: number, thread?: Notification[]) => {
    if (!user?.id) return
    const notificationIds =
      groupByTask && thread && thread.length > 1 ? thread.map((n) => n.id) : [notificationId]

    setMarkingReadId(notificationId)
    markAsReadMutation.mutate(
      { userId: user.id, notificationIds },
      {
        onSuccess: () => {
          refetch()
          const count = notificationIds.length
          toast.success(`${count} notification${count === 1 ? '' : 's'} marked as read`)
          setMarkingReadId(null)
        },
        onError: (error) => {
          toast.error(`Failed to mark notification as read: ${error.message}`)
          setMarkingReadId(null)
        },
      }
    )
  }

  const handleDelete = (notificationId: number, thread?: Notification[]) => {
    if (!user?.id) return
    const notificationIds =
      groupByTask && thread && thread.length > 1 ? thread.map((n) => n.id) : [notificationId]

    setDeletingId(notificationId)
    deleteNotificationMutation.mutate(
      { userId: user.id, notificationIds },
      {
        onSuccess: () => {
          refetch()
          const count = notificationIds.length
          toast.success(`${count} notification${count === 1 ? '' : 's'} deleted`)
          setDeletingId(null)
        },
        onError: (error) => {
          toast.error(`Failed to delete notification: ${error.message}`)
          setDeletingId(null)
        },
      }
    )
  }

  const displayNotifications = useMemo(() => {
    const source = filteredNotifications

    if (!groupByTask) {
      return source
    }

    const workingNotifications = [...source]
    const threadedNotifications: (Notification & {
      thread?: Notification[]
      threadCount?: number
    })[] = []
    const seen = new Set<number | string>()

    workingNotifications.sort((a, b) => {
      const dateA = new Date(a.created).getTime()
      const dateB = new Date(b.created).getTime()
      return dateB - dateA
    })

    for (const notification of workingNotifications) {
      const key = notification.taskId || notification.challengeName || 'no-task'
      if (!seen.has(key)) {
        seen.add(key)
        const thread = threads[key] || [notification]
        threadedNotifications.push({
          ...notification,
          thread,
          threadCount: thread.length,
        })
      }
    }

    return threadedNotifications
  }, [filteredNotifications, groupByTask, threads])

  useEffect(() => {
    if (notificationId && !isLoading && notifications.length > 0) {
      const targetNotification = notifications.find((n) => n.id === notificationId)
      if (targetNotification) {
        const targetTab = targetNotification.isRead ? 'all' : 'unread'

        if (activeTab === targetTab) {
          const isInDisplayList = displayNotifications.some((n) => {
            if (n.id === notificationId) return true
            if (groupByTask) {
              const thread = (n as Notification & { thread?: Notification[] }).thread
              return thread?.some((notif) => notif.id === notificationId) ?? false
            }
            return false
          })

          if (isInDisplayList) {
            const timeoutId = setTimeout(() => {
              const element = notificationRefs.current.get(notificationId)
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                element.focus()
                setGlowingNotificationId(notificationId)
                setTimeout(() => {
                  setGlowingNotificationId(null)
                }, 3000)
                window.history.replaceState({}, '', window.location.pathname)
              }
            }, 500)

            return () => clearTimeout(timeoutId)
          }
        }
      }
    }
  }, [notificationId, activeTab, notifications, isLoading, displayNotifications, groupByTask])

  const handleMarkSelectedAsRead = () => {
    if (!user?.id) return
    const notificationIds =
      selectedNotificationIds.size > 0
        ? Array.from(selectedNotificationIds)
        : filteredNotifications.map((n) => n.id)

    if (notificationIds.length > 0) {
      markAsReadMutation.mutate(
        { userId: user.id, notificationIds },
        {
          onSuccess: () => {
            refetch()
            const count = notificationIds.length
            setSelectedNotificationIds(new Set())
            toast.success(`${count} notification${count === 1 ? '' : 's'} marked as read`)
          },
          onError: (error) => {
            toast.error(`Failed to mark notifications as read: ${error.message}`)
          },
        }
      )
    }
  }

  const handleMarkSelectedAsUnread = () => {
    if (!user?.id) return
    const notificationIds =
      selectedNotificationIds.size > 0
        ? Array.from(selectedNotificationIds)
        : filteredNotifications.map((n) => n.id)

    if (notificationIds.length > 0) {
      markAsUnreadMutation.mutate(
        { userId: user.id, notificationIds },
        {
          onSuccess: () => {
            refetch()
            const count = notificationIds.length
            setSelectedNotificationIds(new Set())
            toast.success(`${count} notification${count === 1 ? '' : 's'} marked as unread`)
          },
          onError: (error) => {
            toast.error(`Failed to mark notifications as unread: ${error.message}`)
          },
        }
      )
    }
  }

  const handleSelectChange = (
    notificationId: number,
    checked: boolean,
    thread?: Notification[]
  ) => {
    setSelectedNotificationIds((prev) => {
      const newSet = new Set(prev)
      const targetNotifications =
        groupByTask && thread ? thread : [{ id: notificationId } as Notification]

      if (checked) {
        for (const notification of targetNotifications) {
          newSet.add(notification.id)
        }
      } else {
        for (const notification of targetNotifications) {
          newSet.delete(notification.id)
        }
      }
      return newSet
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      if (groupByTask) {
        const allIds = new Set<number>()
        for (const notification of displayNotifications) {
          const thread = (notification as Notification & { thread?: Notification[] }).thread || [
            notification,
          ]
          for (const notif of thread) {
            allIds.add(notif.id)
          }
        }
        setSelectedNotificationIds(allIds)
      } else {
        setSelectedNotificationIds(new Set(displayNotifications.map((n) => n.id)))
      }
    } else {
      setSelectedNotificationIds(new Set())
    }
  }

  const allSelected = useMemo(() => {
    if (displayNotifications.length === 0) return false
    if (!groupByTask) {
      return displayNotifications.every((n) => selectedNotificationIds.has(n.id))
    }
    return displayNotifications.every((n) => {
      const thread = (n as Notification & { thread?: Notification[] }).thread || [n]
      return thread.every((notif) => selectedNotificationIds.has(notif.id))
    })
  }, [displayNotifications, selectedNotificationIds, groupByTask])

  const someSelected = useMemo(() => {
    if (!groupByTask) {
      return displayNotifications.some((n) => selectedNotificationIds.has(n.id))
    }
    return displayNotifications.some((n) => {
      const thread = (n as Notification & { thread?: Notification[] }).thread || [n]
      return thread.some((notif) => selectedNotificationIds.has(notif.id))
    })
  }, [displayNotifications, selectedNotificationIds, groupByTask])

  const selectedNotifications = notifications.filter((n) => selectedNotificationIds.has(n.id))
  const allSelectedAreRead =
    selectedNotifications.length > 0 && selectedNotifications.every((n) => n.isRead)
  const isMarkingSelected = markAsReadMutation.isPending || markAsUnreadMutation.isPending

  return (
    <AuthGuard>
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
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Select value={filterTask} onValueChange={setFilterTask}>
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue placeholder="Task" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                {filterOptions.tasks.map((taskId: number) => (
                  <SelectItem key={taskId} value={taskId.toString()}>
                    Task #{taskId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {filterOptions.types.map((typeId: number) => (
                  <SelectItem key={typeId} value={typeId.toString()}>
                    {NOTIFICATION_TYPE_NAMES[typeId] || `Type ${typeId}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterFrom} onValueChange={setFilterFrom}>
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue placeholder="From" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Senders</SelectItem>
                {filterOptions.fromUsers.map((username: string) => (
                  <SelectItem key={username} value={username}>
                    {username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterChallenge} onValueChange={setFilterChallenge}>
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="Challenge" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Challenges</SelectItem>
                {filterOptions.challenges.map((challengeName: string) => (
                  <SelectItem key={challengeName} value={challengeName}>
                    {challengeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(filterTask !== 'all' ||
              filterType !== 'all' ||
              filterFrom !== 'all' ||
              filterChallenge !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-950/20 dark:hover:text-red-300"
                onClick={() => {
                  setFilterTask('all')
                  setFilterType('all')
                  setFilterFrom('all')
                  setFilterChallenge('all')
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
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
              {
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
                          const totalNotifications = groupByTask
                            ? displayNotifications.reduce((sum, n) => {
                                const thread = (n as Notification & { thread?: Notification[] })
                                  .thread || [n]
                                return sum + thread.length
                              }, 0)
                            : displayNotifications.length
                          return `${selectedNotificationIds.size} of ${totalNotifications} selected`
                        })()
                      : 'Select all'}
                  </label>
                </div>
              }
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
                      'animate-pulse ring-4 ring-blue-400 ring-offset-2 shadow-lg shadow-blue-500/50'
                  )}
                >
                  <NotificationItem
                    notification={notification}
                    onMarkAsUnread={handleMarkAsUnread}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                    isMarkingUnread={
                      groupByTask &&
                      (notification as Notification & { thread?: Notification[] }).thread
                        ? ((
                            notification as Notification & { thread?: Notification[] }
                          ).thread?.some((n) => markingUnreadId === n.id) ?? false)
                        : markingUnreadId === notification.id
                    }
                    isMarkingRead={
                      groupByTask &&
                      (notification as Notification & { thread?: Notification[] }).thread
                        ? ((
                            notification as Notification & { thread?: Notification[] }
                          ).thread?.some((n) => markingReadId === n.id) ?? false)
                        : markingReadId === notification.id
                    }
                    isDeleting={
                      groupByTask &&
                      (notification as Notification & { thread?: Notification[] }).thread
                        ? ((
                            notification as Notification & { thread?: Notification[] }
                          ).thread?.some((n) => deletingId === n.id) ?? false)
                        : deletingId === notification.id
                    }
                    isSelected={
                      groupByTask &&
                      (notification as Notification & { thread?: Notification[] }).thread
                        ? ((
                            notification as Notification & { thread?: Notification[] }
                          ).thread?.some((n) => selectedNotificationIds.has(n.id)) ?? false)
                        : selectedNotificationIds.has(notification.id)
                    }
                    isIndeterminate={
                      groupByTask &&
                      (notification as Notification & { thread?: Notification[] }).thread &&
                      (notification as Notification & { thread?: Notification[] }).thread?.some(
                        (n) => selectedNotificationIds.has(n.id)
                      ) &&
                      !(notification as Notification & { thread?: Notification[] }).thread?.every(
                        (n) => selectedNotificationIds.has(n.id)
                      )
                    }
                    onSelectChange={(checked) =>
                      handleSelectChange(
                        notification.id,
                        checked,
                        (notification as Notification & { thread?: Notification[] }).thread
                      )
                    }
                    showCheckbox={true}
                    groupByTask={groupByTask}
                    threadCount={
                      (notification as Notification & { threadCount?: number }).threadCount
                    }
                    thread={(notification as Notification & { thread?: Notification[] }).thread}
                    onOpenThread={() => {
                      const key = notification.taskId || notification.challengeName || 'no-task'
                      const fullThread = threads[key]
                      if (fullThread && fullThread.length > 0) {
                        setOpenNotificationThreadKey(key)
                      } else {
                        setOpenNotificationThreadKey(`single-${notification.id}`)
                      }
                    }}
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

          <Dialog
            open={openNotificationThreadKey !== null}
            onOpenChange={(open) => !open && setOpenNotificationThreadKey(null)}
          >
            <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {openNotificationThread && openNotificationThread.length > 0
                    ? `Notifications for Task #${openNotificationThread[0].taskId || openNotificationThread[0].challengeName || 'Unknown'}`
                    : 'Notification Thread'}
                </DialogTitle>
                <DialogDescription>
                  {openNotificationThread && openNotificationThread.length > 1
                    ? `${openNotificationThread.length} notifications grouped together`
                    : 'View all notifications for this task'}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-2">
                {openNotificationThread?.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsUnread={handleMarkAsUnread}
                    onMarkAsRead={handleMarkAsRead}
                    isMarkingUnread={markingUnreadId === notification.id}
                    isMarkingRead={markingReadId === notification.id}
                    showCheckbox={false}
                    alwaysShowActions={true}
                  />
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AuthGuard>
  )
}
