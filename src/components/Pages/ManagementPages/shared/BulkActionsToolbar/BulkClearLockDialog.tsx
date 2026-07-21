import { LockOpen } from 'lucide-react'
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

export const BulkClearLockDialog = ({ open, onOpenChange, onConfirm, count, busy }: Props) => {
  const { t } = useIntl()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LockOpen className="size-5 text-amber-500" aria-hidden="true" />
            {t(
              'managementPages.bulkActionsToolbar.clearLockDialog.title',
              { count, suffix: count === 1 ? '' : 's' },
              'Clear lock on {count} task{suffix}?'
            )}
          </DialogTitle>
          <DialogDescription>
            {t(
              'managementPages.bulkActionsToolbar.clearLockDialog.description',
              undefined,
              'Any active locks on the selected tasks will be released. Mappers currently working on these tasks may lose their in-progress session.'
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            {t('common.cancel', undefined, 'Cancel')}
          </Button>
          <Button onClick={onConfirm} disabled={busy}>
            {busy
              ? t(
                  'managementPages.bulkActionsToolbar.clearLockDialog.clearing',
                  undefined,
                  'Clearing…'
                )
              : t('managementPages.bulkActionsToolbar.clearLock', undefined, 'Clear lock')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
