import { Link } from '@tanstack/react-router'
import { Check, RotateCcw } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { DropdownMenuItem } from '@/components/ui/DropdownMenu'
import { useNotificationsContext } from '@/contexts/NotificationsContext'
import { cn, formatTimeAgo, initials } from '@/lib/utils'
import { getNotificationPreview, type Notification } from '@/types/Notification'

export const DropDownMenuItemNotification = ({
  notification,
  className,
  onOpenModal,
  ...props
}: React.ComponentProps<typeof DropdownMenuItem> & {
  notification: Notification
  onOpenModal?: (notification: Notification) => void
}) => {
  const { markAsRead, markAsUnread, markingReadId, markingUnreadId } = useNotificationsContext()

  const isMarkingRead = markingReadId === notification.id
  const isMarkingUnread = markingUnreadId === notification.id

  const preview = getNotificationPreview(notification)
  const createdDate = new Date(notification.created)
  const timeAgo = formatTimeAgo(createdDate.getTime())

  const handleClick = () => {
    if (onOpenModal) {
      onOpenModal(notification)
    }
  }

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
  }

  const handleMarkAsUnread = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (notification.isRead) {
      markAsUnread(notification.id)
    }
  }

  return (
    <DropdownMenuItem
      className={cn('flex items-start gap-3 p-3', className)}
      onClick={handleClick}
      {...props}
    >
      <Avatar className="size-8 shrink-0">
        <AvatarImage src={undefined} />
        <AvatarFallback>
          {notification.fromUsername ? initials(notification.fromUsername).slice(0, 2) : 'N'}
        </AvatarFallback>
      </Avatar>
      <div className="grid grow gap-2">
        <p className="text-sm text-zinc-900 dark:text-zinc-100">{preview}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <time dateTime={createdDate.toISOString()}>{timeAgo}</time>
          {notification.taskId && (
            <>
              <span>•</span>
              <Link
                to="/tasks/$taskId"
                params={{ taskId: String(notification.taskId) }}
                onClick={(e) => e.stopPropagation()}
                className="link hover:text-blue-600 dark:hover:text-blue-400"
              >
                Task #{notification.taskId}
              </Link>
            </>
          )}
          {notification.challengeId && (
            <>
              <span>•</span>
              <Link
                to="/challenge/$challengeId"
                params={{ challengeId: String(notification.challengeId) }}
                onClick={(e) => e.stopPropagation()}
                className="link hover:text-blue-600 dark:hover:text-blue-400"
              >
                Challenge #{notification.challengeId}
              </Link>
            </>
          )}
          {notification.projectId && (
            <>
              <span>•</span>
              <Link
                to="/manage/project/$projectId"
                params={{ projectId: String(notification.projectId) }}
                onClick={(e) => e.stopPropagation()}
                className="link hover:text-blue-600 dark:hover:text-blue-400"
              >
                Project #{notification.projectId}
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {!notification.isRead && (
          <span
            aria-live="polite"
            className="size-2 rounded-full bg-red-400 motion-safe:animate-pulse"
          >
            <span className="sr-only">Unread notification</span>
          </span>
        )}
        {notification.isRead && (
          <button
            type="button"
            onClick={handleMarkAsUnread}
            disabled={isMarkingUnread}
            className="flex size-6 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-50 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            aria-label="Mark as unread"
            title="Mark as unread"
          >
            <RotateCcw className="size-3.5" />
          </button>
        )}
        {!notification.isRead && (
          <button
            type="button"
            onClick={handleMarkAsRead}
            disabled={isMarkingRead}
            className="flex size-6 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-blue-600 disabled:opacity-50 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
            aria-label="Mark as read"
            title="Mark as read"
          >
            <Check className="size-3.5" />
          </button>
        )}
      </div>
    </DropdownMenuItem>
  )
}
