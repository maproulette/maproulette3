import { useSearch } from '@tanstack/react-router'
import { useEffect, useId, useRef, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { useNotificationsContext } from '@/contexts/NotificationsContext'
import { useNotificationsPageContext } from '@/contexts/NotificationsPageContext'
import { cn } from '@/lib/utils'
import { NotificationFilters } from './NotificationFilters'
import { NotificationItem } from './NotificationItem'
import { NotificationSelectAll } from './NotificationSelectAll'
import { NotificationThreadDialog } from './NotificationThreadDialog'
import { NotificationToolbar } from './NotificationToolbar'
import { PageHeader } from './PageHeader'

export const NotificationsPageContent = () => {
  const { notifications, isLoading } = useNotificationsContext()
  const { activeTab, setActiveTab, groupByTask, setGroupByTask, displayNotifications } =
    useNotificationsPageContext()

  const search = useSearch({ from: '/_app/notifications' })
  const notificationId = search.notificationId
  const notificationRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const [glowingNotificationId, setGlowingNotificationId] = useState<number | null>(null)
  const groupByTaskCheckboxId = useId()

  // Deep-link: switch to correct tab
  useEffect(() => {
    if (notificationId && notifications.length > 0 && !isLoading) {
      const target = notifications.find((n) => n.id === notificationId)
      if (target) {
        setActiveTab(target.isRead ? 'all' : 'unread')
      }
    }
  }, [notificationId, notifications, isLoading, setActiveTab])

  // Deep-link: scroll to notification
  useEffect(() => {
    if (notificationId && !isLoading && notifications.length > 0) {
      const target = notifications.find((n) => n.id === notificationId)
      if (!target) return
      const targetTab = target.isRead ? 'all' : 'unread'
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

  return (
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
            className="cursor-pointer text-sm text-zinc-600 dark:text-slate-400"
          >
            Group by Task
          </label>
          {groupByTask && (
            <span className="text-xs text-zinc-500 dark:text-slate-500">
              Notifications for the same task are grouped together
            </span>
          )}
        </div>
        <NotificationFilters />
        <NotificationToolbar />

        {isLoading ? (
          <Card className="p-6">
            <div className="text-center text-zinc-500 dark:text-slate-500">
              Loading notifications...
            </div>
          </Card>
        ) : displayNotifications.length > 0 ? (
          <div className="space-y-2">
            <NotificationSelectAll />
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
          <Card className="p-6">
            <div className="space-y-2 text-center">
              <p className="font-semibold text-base">You're all up to date</p>
              <p className="text-sm text-zinc-500 dark:text-slate-500">
                {activeTab === 'unread'
                  ? 'You have no unread notifications at the moment.'
                  : 'You have no notifications.'}
              </p>
            </div>
          </Card>
        )}

        <NotificationThreadDialog />
      </div>
    </div>
  )
}
