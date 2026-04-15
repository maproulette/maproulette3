import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { useNotificationsContext } from '@/contexts/NotificationsContext'
import { NotificationItem } from './NotificationItem'

interface NotificationThreadDialogProps {
  onViewAll?: () => void
}

export const NotificationThreadDialog = ({ onViewAll }: NotificationThreadDialogProps = {}) => {
  const { openNotificationThread: thread, closeThread } = useNotificationsContext()

  const isThread = (thread?.length ?? 0) > 1
  const taskRef = thread?.[0]?.taskId
  const challengeRef = thread?.[0]?.challengeName

  return (
    <Dialog open={thread !== null} onOpenChange={(open) => !open && closeThread()}>
      <DialogContent size={isThread ? 'xl' : 'md'} className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Bell className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle>
                {isThread
                  ? `${thread?.length} notifications`
                  : taskRef
                    ? `Notification for Task #${taskRef}`
                    : 'Notification'}
              </DialogTitle>
              <DialogDescription>
                {isThread
                  ? `Grouped together for ${taskRef ? `Task #${taskRef}` : (challengeRef ?? 'this thread')}`
                  : 'View notification details'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-2">
          {thread?.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              alwaysShowActions
              onLinkClick={closeThread}
            />
          ))}
        </div>
        {onViewAll && (
          <DialogFooter>
            <Button variant="outline" onClick={onViewAll}>
              View all notifications
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
