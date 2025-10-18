import { Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useNotificationsContext } from '@/contexts/NotificationsContext'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types/Notification'
import type { User } from '@/types/User'
import { DropDownMenuItemNotification } from './DropDownMenuItemNotification'

export const DropdownMenuNotifications = ({
  user,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent> & {
  user: User
}) => {
  const { notifications, isLoading } = useNotificationsContext()
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([])

  // Update unread notifications when data changes
  useEffect(() => {
    if (notifications) {
      setUnreadNotifications(notifications.filter((notification) => !notification.isRead))
    }
  }, [notifications])

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
        className={cn('w-sm max-w-full', className)}
        sideOffset={10}
        alignOffset={-10}
        {...props}
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
              <button type="button" className="link text-xs">
                Mark all as read
              </button>
            </DropdownMenuLabel>
            <TabsContent value="unread">
              {unreadNotifications.length > 0 ? (
                <DropdownMenuGroup>
                  {unreadNotifications.map((notification) => (
                    <DropDownMenuItemNotification
                      key={notification.id}
                      notification={notification}
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
              {unreadNotifications.length > 0 ? (
                <DropdownMenuGroup>
                  {notifications.map((notification) => (
                    <DropDownMenuItemNotification
                      key={notification.id}
                      notification={notification}
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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
