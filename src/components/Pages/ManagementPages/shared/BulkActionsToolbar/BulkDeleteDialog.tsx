import { TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { useIntl } from '@/i18n'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  count: number
  busy?: boolean
}

export const BulkDeleteDialog = ({ open, onOpenChange, onConfirm, count, busy }: Props) => {
  const { t } = useIntl()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TriangleAlert className="size-5 text-red-500" aria-hidden="true" />
            {t(
              'managementPages.bulkActionsToolbar.deleteDialog.title',
              { count },
              '{count, plural, one {Delete # task?} other {Delete # tasks?}}'
            )}
          </DialogTitle>
          <DialogDescription>
            {t(
              'managementPages.bulkActionsToolbar.deleteDialog.description',
              undefined,
              'This cannot be undone. Tasks and their comments, reviews, and tags are permanently removed.'
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            {t('common.cancel', undefined, 'Cancel')}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={busy}>
            {busy
              ? t(
                  'managementPages.bulkActionsToolbar.deleteDialog.deleting',
                  undefined,
                  'Deleting…'
                )
              : t('common.delete', undefined, 'Delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
