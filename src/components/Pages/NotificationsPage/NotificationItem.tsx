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
import { useNotificationsContext } from '@/contexts/NotificationsContext'
import { useNotificationsPageContext } from '@/contexts/NotificationsPageContext'
import { cn, formatTimeAgo, initials } from '@/lib/utils'
import type { Notification } from '@/types/Notification'
import { NOTIFICATION_TYPE_NAMES } from '@/types/Notification'

interface NotificationItemProps {
  notification: Notification
  thread?: Notification[]
  threadCount?: number
  alwaysShowActions?: boolean
  showDelete?: boolean
  showCheckbox?: boolean
}

export const NotificationItem = ({
  notification,
  thread,
  threadCount,
  alwaysShowActions = false,
  showDelete = false,
  showCheckbox = false,
}: NotificationItemProps) => {
  const {
    markAsRead,
    markAsUnread,
    deleteNotification,
    markingReadId,
    markingUnreadId,
    deletingId,
    openThread,
  } = useNotificationsContext()
  const {
    groupByTask = false,
    selectedNotificationIds,
    onSelectChange,
  } = useNotificationsPageContext()

  const isMarkingRead =
    groupByTask && thread
      ? thread.some((n) => markingReadId === n.id)
      : markingReadId === notification.id
  const isMarkingUnread =
    groupByTask && thread
      ? thread.some((n) => markingUnreadId === n.id)
      : markingUnreadId === notification.id
  const isDeleting =
    groupByTask && thread ? thread.some((n) => deletingId === n.id) : deletingId === notification.id

  const isSelected =
    groupByTask && thread
      ? thread.some((n) => selectedNotificationIds.has(n.id))
      : selectedNotificationIds.has(notification.id)

  const isIndeterminate =
    groupByTask && thread
      ? thread.some((n) => selectedNotificationIds.has(n.id)) &&
        !thread.every((n) => selectedNotificationIds.has(n.id))
      : false

  const notificationTypeName =
    NOTIFICATION_TYPE_NAMES[notification.notificationType] || 'Notification'
  const createdDate = new Date(notification.created)
  const timeAgo = formatTimeAgo(createdDate.getTime())

  const handleMarkAsUnread = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (notification.isRead) {
      markAsUnread(notification.id, thread)
    }
  }

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!notification.isRead) {
      markAsRead(notification.id, thread)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteNotification(notification.id, thread)
  }

  const handleCheckboxChange = (checked: boolean) => {
    onSelectChange(notification.id, checked, thread)
  }

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('[role="button"]')) {
      return
    }
    openThread(notification)
  }

  return (
    <Card
      className={cn(
        'group relative p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900',
        !notification.isRead && 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20',
        groupByTask && threadCount && threadCount > 1 && 'cursor-pointer'
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
            {notification.fromUsername ? initials(notification.fromUsername).slice(0, 2) : 'N'}
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
              {!notification.isRead && (
                <>
                  <span
                    aria-live="polite"
                    className="mt-1 size-2 shrink-0 rounded-full bg-blue-500"
                    title="Unread notification"
                  >
                    <span className="sr-only">Unread notification</span>
                  </span>
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
                </>
              )}

              {notification.isRead && (
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

              {showDelete && (
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
