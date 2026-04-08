import { Link, useNavigate } from '@tanstack/react-router'
import { Bell } from 'lucide-react'
import { useMemo, useState } from 'react'
import { NotificationThreadDialog } from '@/components/Pages/NotificationsPage/NotificationThreadDialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useNotificationsContext } from '@/contexts/NotificationsContext'
import { useNotificationThreads } from '@/hooks/useNotificationThreads'
import { getNotificationThreadKey, type Notification } from '@/types/Notification'
import type { User } from '@/types/User'
import { DropDownMenuItemNotification } from './DropDownMenuItemNotification'

export const DropdownMenuNotifications = ({ user }: { user: User }) => {
  const { notifications, isLoading, markAllAsRead } = useNotificationsContext()
  const [openNotificationId, setOpenNotificationId] = useState<number | null>(null)
  const navigate = useNavigate()

  const unreadNotifications = useMemo(() => notifications.filter((n) => !n.isRead), [notifications])
  const threads = useNotificationThreads(notifications)

  const openNotificationThread = useMemo(() => {
    if (!openNotificationId) return null
    const notification = notifications.find((n) => n.id === openNotificationId)
    if (!notification) return null

    const key = getNotificationThreadKey(notification)
    const thread = threads[key] || [notification]

    return [...thread].sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
  }, [openNotificationId, notifications, threads])

  const handleMarkAllAsRead = () => {
    if (unreadNotifications.length > 0) {
      markAllAsRead(unreadNotifications.map((n) => n.id))
    }
  }

  const handleOpenNotification = (notification: Notification) => {
    setOpenNotificationId(notification.id)
  }

  const handleViewAllNotifications = () => {
    if (openNotificationId) {
      navigate({ to: '/notifications', search: { notificationId: openNotificationId } })
    } else {
      navigate({ to: '/notifications' })
    }
    setOpenNotificationId(null)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Notifications for ${user.osmProfile.displayName}`}
        className="relative flex cursor-pointer"
      >
        <Bell className="size-5" aria-hidden="true" />
        {unreadNotifications.length > 0 && (
          <span
            aria-live="polite"
            className="-right-0.75 -top-0.75 absolute size-1.25 rounded-full bg-red-400 motion-safe:animate-pulse"
          >
            <span className="sr-only">You have unread notifications</span>
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={'w-sm max-w-full'}
        sideOffset={10}
        alignOffset={-10}
        align="end"
      >
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <Tabs defaultValue="unread">
            <DropdownMenuLabel className="flex items-center justify-between gap-2">
              <TabsList className="text-xs">
                <TabsTrigger value="unread">Unread</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="link text-xs"
                  onClick={handleMarkAllAsRead}
                  disabled={unreadNotifications.length === 0}
                >
                  Mark all as read
                </button>
              </div>
            </DropdownMenuLabel>
            <TabsContent value="unread">
              {unreadNotifications.length > 0 ? (
                <DropdownMenuGroup>
                  {unreadNotifications.map((notification) => (
                    <DropDownMenuItemNotification
                      key={notification.id}
                      notification={notification}
                      onOpenModal={handleOpenNotification}
                    />
                  ))}
                </DropdownMenuGroup>
              ) : (
                <div className="space-y-1 p-4 text-center">
                  <p className="font-semibold text-sm">You're all up to date</p>
                  <p className="text-xs text-zinc-500">
                    There are no new notifications at the moment.
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="all">
              {notifications.length > 0 ? (
                <DropdownMenuGroup>
                  {notifications.map((notification) => (
                    <DropDownMenuItemNotification
                      key={notification.id}
                      notification={notification}
                      onOpenModal={handleOpenNotification}
                    />
                  ))}
                </DropdownMenuGroup>
              ) : (
                <p className="px-4 py-7 text-center text-xs text-zinc-500">
                  You have no notifications.
                </p>
              )}
            </TabsContent>
          </Tabs>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to="/notifications" className="flex items-center justify-center">
              View All Notifications
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>

      <NotificationThreadDialog
        thread={openNotificationThread}
        onClose={() => setOpenNotificationId(null)}
        onViewAll={handleViewAllNotifications}
      />
    </DropdownMenu>
  )
}
