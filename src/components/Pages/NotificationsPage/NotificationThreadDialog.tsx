import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import type { Notification } from '@/types/Notification'
import { NotificationItem } from './NotificationItem'

interface NotificationThreadDialogProps {
  thread: Notification[] | null
  onClose: () => void
  onViewAll?: () => void
}

export const NotificationThreadDialog = ({
  thread,
  onClose,
  onViewAll,
}: NotificationThreadDialogProps) => {
  return (
    <Dialog open={thread !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {thread && thread.length > 0
              ? thread.length > 1
                ? `Notifications for Task #${thread[0].taskId || thread[0].challengeName || 'Unknown'}`
                : 'Notification'
              : 'Notification'}
          </DialogTitle>
          <DialogDescription>
            {thread && thread.length > 1
              ? `${thread.length} notifications grouped together`
              : 'View notification details'}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-2">
          {thread?.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              alwaysShowActions={true}
            />
          ))}
        </div>
        {onViewAll && (
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={onViewAll}>
              View All Notifications
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
