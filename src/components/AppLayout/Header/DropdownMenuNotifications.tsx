import { Link, useNavigate } from '@tanstack/react-router'
import { Bell } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { api } from '@/api'
import { useNotificationsContext } from '@/components/NotificationsContext'
import { NotificationItem } from '@/components/NotificationsPage/NotificationItem'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
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
import type { Notification } from '@/types/Notification'
import type { User } from '@/types/User'
import { DropDownMenuItemNotification } from './DropDownMenuItemNotification'

export const DropdownMenuNotifications = ({ user }: { user: User }) => {
  const { notifications, isLoading, refetch } = useNotificationsContext()
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([])
  const [openNotificationId, setOpenNotificationId] = useState<number | null>(null)
  const [markingUnreadId, setMarkingUnreadId] = useState<number | null>(null)
  const [markingReadId, setMarkingReadId] = useState<number | null>(null)
  const navigate = useNavigate()

  const markAsReadMutation = api.user.useMarkNotificationsAsRead()
  const markAsUnreadMutation = api.user.useMarkNotificationsAsUnread()

  // Update unread notifications when data changes
  useEffect(() => {
    if (notifications) {
      setUnreadNotifications(notifications.filter((notification) => !notification.isRead))
    }
  }, [notifications])

  const handleMarkAllAsRead = () => {
    if (unreadNotifications.length > 0 && user.id) {
      const unreadIds = unreadNotifications.map((n) => n.id)
      markAsReadMutation.mutate(
        { userId: user.id, notificationIds: unreadIds },
        { onSuccess: () => refetch() }
      )
    }
  }

  const threads = useMemo(() => {
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
    if (!openNotificationId) return null
    const notification = notifications.find((n) => n.id === openNotificationId)
    if (!notification) return null

    const key = notification.taskId || notification.challengeName || 'no-task'
    const thread = threads[key] || [notification]

    return thread.sort((a: Notification, b: Notification) => {
      const dateA = new Date(a.created).getTime()
      const dateB = new Date(b.created).getTime()
      return dateB - dateA
    })
  }, [openNotificationId, notifications, threads])

  const handleMarkAsUnread = (notificationId: number) => {
    if (!user?.id) return
    setMarkingUnreadId(notificationId)
    markAsUnreadMutation.mutate(
      { userId: user.id, notificationIds: [notificationId] },
      {
        onSuccess: () => {
          refetch()
          setMarkingUnreadId(null)
        },
        onError: (error) => {
          console.error('Failed to mark notification as unread:', error)
          setMarkingUnreadId(null)
        },
      }
    )
  }

  const handleMarkAsRead = (notificationId: number) => {
    if (!user?.id) return
    setMarkingReadId(notificationId)
    markAsReadMutation.mutate(
      { userId: user.id, notificationIds: [notificationId] },
      {
        onSuccess: () => {
          refetch()
          setMarkingReadId(null)
        },
        onError: (error) => {
          console.error('Failed to mark notification as read:', error)
          setMarkingReadId(null)
        },
      }
    )
  }

  const handleOpenNotification = (notification: Notification) => {
    setOpenNotificationId(notification.id)
  }

  const handleViewAllNotifications = () => {
    if (openNotificationId) {
      navigate({
        to: '/notifications',
        search: { notificationId: openNotificationId },
      })
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
                  disabled={unreadNotifications.length === 0 || markAsReadMutation.isPending}
                >
                  {markAsReadMutation.isPending ? 'Marking...' : 'Mark all as read'}
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
                      onMarkAsRead={handleMarkAsRead}
                      onMarkAsUnread={handleMarkAsUnread}
                      isMarkingRead={markingReadId === notification.id}
                      isMarkingUnread={markingUnreadId === notification.id}
                    />
                  ))}
                </DropdownMenuGroup>
              ) : (
                <div className="space-y-1 p-4 text-center">
                  <p className="font-semibold text-sm">You’re all up to date</p>
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
                      onMarkAsRead={handleMarkAsRead}
                      onMarkAsUnread={handleMarkAsUnread}
                      isMarkingRead={markingReadId === notification.id}
                      isMarkingUnread={markingUnreadId === notification.id}
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

      <Dialog
        open={openNotificationId !== null}
        onOpenChange={(open: boolean) => !open && setOpenNotificationId(null)}
      >
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {openNotificationThread && openNotificationThread.length > 0
                ? openNotificationThread.length > 1
                  ? `Notifications for Task #${openNotificationThread[0].taskId || openNotificationThread[0].challengeName || 'Unknown'}`
                  : 'Notification'
                : 'Notification'}
            </DialogTitle>
            <DialogDescription>
              {openNotificationThread && openNotificationThread.length > 1
                ? `${openNotificationThread.length} notifications grouped together`
                : 'View notification details'}
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
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={handleViewAllNotifications}>
              View All Notifications
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  )
}
