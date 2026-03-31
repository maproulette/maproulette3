import { Link } from '@tanstack/react-router'
import { Check, RotateCcw, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import type { Notification } from '@/types/Notification'
import { NOTIFICATION_TYPE_NAMES } from '@/types/Notification'
import { cn } from '@/utils/utils'

interface NotificationItemProps {
  notification: Notification
  className?: string
  onMarkAsUnread?: (notificationId: number, thread?: Notification[]) => void
  onMarkAsRead?: (notificationId: number, thread?: Notification[]) => void
  onDelete?: (notificationId: number, thread?: Notification[]) => void
  isMarkingUnread?: boolean
  isMarkingRead?: boolean
  isDeleting?: boolean
  isSelected?: boolean
  isIndeterminate?: boolean
  onSelectChange?: (checked: boolean) => void
  showCheckbox?: boolean
  groupByTask?: boolean
  threadCount?: number
  thread?: Notification[]
  onOpenThread?: () => void
  alwaysShowActions?: boolean
  hideUnreadIndicator?: boolean
}

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

export const NotificationItem = ({
  notification,
  className,
  onMarkAsUnread,
  onMarkAsRead,
  onDelete,
  isMarkingUnread = false,
  isMarkingRead = false,
  isDeleting = false,
  isSelected = false,
  isIndeterminate = false,
  onSelectChange,
  showCheckbox = false,
  groupByTask = false,
  threadCount,
  thread,
  onOpenThread,
  alwaysShowActions = false,
  hideUnreadIndicator = false,
}: NotificationItemProps) => {
  const notificationTypeName =
    NOTIFICATION_TYPE_NAMES[notification.notificationType] || 'Notification'
  const createdDate = new Date(notification.created)
  const timeAgo = formatTimeAgo(createdDate.getTime())

  const handleMarkAsUnread = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onMarkAsUnread && notification.isRead) {
      onMarkAsUnread(notification.id, thread)
    }
  }

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onMarkAsRead && !notification.isRead) {
      onMarkAsRead(notification.id, thread)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(notification.id, thread)
    }
  }

  const handleCheckboxChange = (checked: boolean) => {
    if (onSelectChange) {
      onSelectChange(checked)
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Only handle card click if it's not from a button or interactive element
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('[role="button"]')) {
      return
    }
    // Always open the modal if onOpenThread is provided, regardless of thread count
    if (onOpenThread) {
      onOpenThread()
    }
  }

  return (
    <Card
      className={cn(
        'group relative p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900',
        !hideUnreadIndicator &&
          !notification.isRead &&
          'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20',
        groupByTask && threadCount && threadCount > 1 && 'cursor-pointer',
        className
      )}
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-4">
        {showCheckbox && (
          <Checkbox
            checked={isSelected}
            indeterminate={isIndeterminate}
            onCheckedChange={handleCheckboxChange}
            className="mt-1"
            aria-label={`Select notification from ${notification.fromUsername || 'unknown'}`}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        <Avatar className="size-10 shrink-0">
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

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                {notification.fromUsername && (
                  <span className="font-semibold text-sm">{notification.fromUsername}</span>
                )}
                <span className="text-sm text-zinc-500">{notificationTypeName}</span>
              </div>

              {notification.description && (
                <p className="mb-1 text-sm text-zinc-700 dark:text-zinc-300">
                  {notification.description}
                </p>
              )}

              {notification.challengeName && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Challenge:{' '}
                  {notification.challengeId ? (
                    <Link
                      to="/challenge/$challengeId"
                      params={{ challengeId: String(notification.challengeId) }}
                      onClick={(e) => e.stopPropagation()}
                      className="link font-medium"
                    >
                      {notification.challengeName}
                    </Link>
                  ) : (
                    <span className="font-medium">{notification.challengeName}</span>
                  )}
                </p>
              )}

              {notification.extra && (
                <p className="mt-2 text-sm text-zinc-500 italic dark:text-zinc-400">
                  {notification.extra}
                </p>
              )}

              <div className="mt-2 flex items-center gap-4">
                <time dateTime={createdDate.toISOString()} className="text-xs text-zinc-500">
                  {timeAgo}
                </time>
                {notification.taskId && (
                  <Link
                    to="/tasks/$taskId"
                    params={{ taskId: String(notification.taskId) }}
                    onClick={(e) => e.stopPropagation()}
                    className="link text-xs text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Task #{notification.taskId}
                  </Link>
                )}
                {notification.challengeId && !notification.challengeName && (
                  <Link
                    to="/challenge/$challengeId"
                    params={{ challengeId: String(notification.challengeId) }}
                    onClick={(e) => e.stopPropagation()}
                    className="link text-xs text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Challenge #{notification.challengeId}
                  </Link>
                )}
                {notification.projectId && (
                  <Link
                    to="/manage/project/$projectId"
                    params={{ projectId: String(notification.projectId) }}
                    onClick={(e) => e.stopPropagation()}
                    className="link text-xs text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Project #{notification.projectId}
                  </Link>
                )}
                {groupByTask && threadCount && threadCount > 1 && (
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-teal-500 text-xs font-medium text-white">
                    {threadCount}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!hideUnreadIndicator && !notification.isRead && (
                <>
                  <span
                    aria-live="polite"
                    className="mt-1 size-2 shrink-0 rounded-full bg-blue-500"
                    title="Unread notification"
                  >
                    <span className="sr-only">Unread notification</span>
                  </span>
                  {onMarkAsRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'h-8 w-8 p-0 transition-opacity',
                        alwaysShowActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      )}
                      disabled={isMarkingRead}
                      onClick={handleMarkAsRead}
                      title="Mark as read"
                    >
                      <Check className="size-4" />
                      <span className="sr-only">Mark as read</span>
                    </Button>
                  )}
                </>
              )}

              {!hideUnreadIndicator && notification.isRead && onMarkAsUnread && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'h-8 w-8 p-0 transition-opacity',
                        alwaysShowActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      )}
                      disabled={isMarkingUnread}
                      title="Mark as unread"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <RotateCcw className="size-4" />
                      <span className="sr-only">Mark as unread</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleMarkAsUnread} disabled={isMarkingUnread}>
                      <RotateCcw className="mr-2 size-4" />
                      Mark as unread
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-8 w-8 p-0 transition-opacity text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300',
                    alwaysShowActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  )}
                  disabled={isDeleting}
                  onClick={handleDelete}
                  title="Delete notification"
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">Delete notification</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
