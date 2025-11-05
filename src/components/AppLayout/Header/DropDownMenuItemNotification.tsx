import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { DropdownMenuItem } from '@/components/ui/DropdownMenu'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types/User'

export const DropDownMenuItemNotification = ({
  notification,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuItem> & {
  notification: Notification
}) => {
  return (
    <DropdownMenuItem className={cn('flex items-start gap-3 p-3', className)} {...props}>
      <Avatar className="size-8 shrink-0">
        <AvatarImage />
        <AvatarFallback>UN</AvatarFallback>
      </Avatar>
      <div className="grid grow gap-2">
        <p>
          <button type="button" className="link font-semibold">
            {notification.fromUsername}
          </button>{' '}
          commented on{' '}
          <button type="button" className="link">
            {notification.challengeName}
          </button>
        </p>
        <time dateTime="2025-10-15T12:00:00Z" className="text-xs text-zinc-500">
          2 hours ago
        </time>
      </div>
      {!notification.isRead && (
        <span
          aria-live="polite"
          className="size-2 shrink-0 rounded-full bg-red-400 motion-safe:animate-pulse"
        >
          <span className="sr-only">Unread notification</span>
        </span>
      )}
    </DropdownMenuItem>
  )
}
