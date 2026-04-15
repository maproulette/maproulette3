import { Link, useNavigate } from '@tanstack/react-router'
import { Bell } from 'lucide-react'
import { useState } from 'react'
import { NotificationItem } from '@/components/Pages/NotificationsPage/NotificationItem'
import { NotificationThreadDialog } from '@/components/Pages/NotificationsPage/NotificationThreadDialog'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useNotificationsContext } from '@/contexts/NotificationsContext'
import type { User } from '@/types/User'

export const DropdownMenuNotifications = ({ user }: { user: User }) => {
  const { notifications, isLoading, markAllAsRead, closeThread } = useNotificationsContext()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const unreadNotifications = notifications.filter((n) => !n.isRead)
  const unreadCount = unreadNotifications.length

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllAsRead(unreadNotifications.map((n) => n.id))
    }
  }

  const handleViewAllNotifications = () => {
    closeThread()
    setOpen(false)
    navigate({ to: '/notifications' })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={`Notifications for ${user.osmProfile.displayName}`}
        className="relative flex"
      >
        <Bell className="size-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            aria-live="polite"
            className="-right-0.75 -top-0.75 absolute size-1.25 rounded-full bg-red-400 motion-safe:animate-pulse"
          >
            <span className="sr-only">You have unread notifications</span>
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="flex w-96 max-w-[calc(100vw-2rem)] flex-col p-4"
      >
        <Tabs defaultValue="unread" className="flex min-h-0 flex-1 flex-col">
          <div className="mb-4 flex items-center justify-between gap-2">
            <TabsList>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
              <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
            </TabsList>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </Button>
          </div>

          {isLoading ? (
            <Card className="p-6">
              <div className="text-center text-sm text-zinc-500 dark:text-slate-500">
                Loading notifications...
              </div>
            </Card>
          ) : (
            <>
              <TabsContent
                value="unread"
                className="-mx-1 mt-0 max-h-[60vh] min-h-0 flex-1 overflow-y-auto px-1"
              >
                <NotificationList
                  notifications={unreadNotifications}
                  emptyTitle="You're all up to date"
                  emptyDescription="You have no unread notifications at the moment."
                />
              </TabsContent>
              <TabsContent
                value="all"
                className="-mx-1 mt-0 max-h-[60vh] min-h-0 flex-1 overflow-y-auto px-1"
              >
                <NotificationList
                  notifications={notifications}
                  emptyTitle="You're all up to date"
                  emptyDescription="You have no notifications."
                />
              </TabsContent>
            </>
          )}
        </Tabs>

        <div className="mt-4 border-zinc-200 border-t pt-3 dark:border-slate-800">
          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="link block text-center font-medium text-sm"
          >
            View all notifications
          </Link>
        </div>
      </PopoverContent>

      <NotificationThreadDialog onViewAll={handleViewAllNotifications} />
    </Popover>
  )
}

const NotificationList = ({
  notifications,
  emptyTitle,
  emptyDescription,
}: {
  notifications: ReturnType<typeof useNotificationsContext>['notifications']
  emptyTitle: string
  emptyDescription: string
}) => {
  if (notifications.length === 0) {
    return (
      <Card className="p-6">
        <div className="space-y-2 text-center">
          <p className="font-semibold text-sm">{emptyTitle}</p>
          <p className="text-xs text-zinc-500 dark:text-slate-500">{emptyDescription}</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} alwaysShowActions />
      ))}
    </div>
  )
}
