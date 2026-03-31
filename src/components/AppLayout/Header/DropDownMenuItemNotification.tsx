import { Link } from '@tanstack/react-router'
import { Check, RotateCcw } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { DropdownMenuItem } from '@/components/ui/DropdownMenu'
import type { Notification } from '@/types/Notification'
import { NOTIFICATION_TYPE_NAMES, NotificationType } from '@/types/Notification'
import { cn } from '@/utils/utils'

const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'just now'
}

const getNotificationPreview = (notification: Notification): string => {
  const type = notification.notificationType
  const fromUsername = notification.fromUsername
  const challengeName = notification.challengeName
  const taskId = notification.taskId
  const description = notification.description

  if (description) {
    return description
  }

  switch (type) {
    case NotificationType.SYSTEM:
      return 'System notification'
    case NotificationType.MENTION:
      return fromUsername
        ? `${fromUsername} mentioned you${taskId ? ` in task #${taskId}` : challengeName ? ` in ${challengeName}` : ''}`
        : 'You were mentioned'
    case NotificationType.REVIEW_APPROVED:
      return fromUsername
        ? `${fromUsername} approved${taskId ? ` task #${taskId}` : ''}`
        : `Task #${taskId || '?'} was approved`
    case NotificationType.REVIEW_REJECTED:
      return fromUsername
        ? `${fromUsername} requested revision${taskId ? ` for task #${taskId}` : ''}`
        : `Revision requested${taskId ? ` for task #${taskId}` : ''}`
    case NotificationType.REVIEW_AGAIN:
      return fromUsername
        ? `${fromUsername} requested review${taskId ? ` for task #${taskId}` : ''}`
        : `Review requested${taskId ? ` for task #${taskId}` : ''}`
    case NotificationType.CHALLENGE_COMPLETED:
      return challengeName ? `Challenge "${challengeName}" completed` : 'Challenge completed'
    case NotificationType.TEAM:
      return fromUsername ? `Team update from ${fromUsername}` : 'Team notification'
    case NotificationType.FOLLOW:
      return fromUsername ? `${fromUsername} started following you` : 'New follower'
    case NotificationType.MAPPER_CHALLENGE_COMPLETED:
      return challengeName
        ? `Mapper challenge "${challengeName}" completed`
        : 'Mapper challenge completed'
    case NotificationType.REVIEW_REVISED:
      return fromUsername
        ? `${fromUsername} revised${taskId ? ` task #${taskId}` : ''}`
        : `Task #${taskId || '?'} was revised`
    case NotificationType.META_REVIEW:
      return fromUsername
        ? `${fromUsername} requested meta-review${taskId ? ` for task #${taskId}` : ''}`
        : `Meta-review requested${taskId ? ` for task #${taskId}` : ''}`
    case NotificationType.META_REVIEW_AGAIN:
      return fromUsername
        ? `${fromUsername} requested meta-review again${taskId ? ` for task #${taskId}` : ''}`
        : `Meta-review requested again${taskId ? ` for task #${taskId}` : ''}`
    case NotificationType.REVIEW_COUNT:
      return taskId ? `Review count update for task #${taskId}` : 'Review count updated'
    case NotificationType.REVISION_COUNT:
      return taskId ? `Revision count update for task #${taskId}` : 'Revision count updated'
    case NotificationType.CHALLENGE_COMMENT:
      return fromUsername
        ? `${fromUsername} commented${challengeName ? ` on "${challengeName}"` : taskId ? ` on task #${taskId}` : ''}`
        : challengeName
          ? `New comment on "${challengeName}"`
          : 'New comment'
    case NotificationType.CHALLENGE_UNLOCK_REQUESTED:
      return challengeName
        ? `Unlock requested for "${challengeName}"`
        : 'Challenge unlock requested'
    default:
      return NOTIFICATION_TYPE_NAMES[type] || 'Notification'
  }
}

export const DropDownMenuItemNotification = ({
  notification,
  className,
  onOpenModal,
  onMarkAsRead,
  onMarkAsUnread,
  isMarkingRead = false,
  isMarkingUnread = false,
  ...props
}: React.ComponentProps<typeof DropdownMenuItem> & {
  notification: Notification
  onOpenModal?: (notification: Notification) => void
  onMarkAsRead?: (notificationId: number) => void
  onMarkAsUnread?: (notificationId: number) => void
  isMarkingRead?: boolean
  isMarkingUnread?: boolean
}) => {
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
    if (onMarkAsRead && !notification.isRead) {
      onMarkAsRead(notification.id)
    }
  }

  const handleMarkAsUnread = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onMarkAsUnread && notification.isRead) {
      onMarkAsUnread(notification.id)
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
          {notification.fromUsername
            ? notification.fromUsername
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
            : 'N'}
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
        {notification.isRead && onMarkAsUnread && (
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
        {!notification.isRead && onMarkAsRead && (
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
