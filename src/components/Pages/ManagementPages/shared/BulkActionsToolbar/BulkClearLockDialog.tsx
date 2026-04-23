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

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  count: number
  busy?: boolean
}

export const BulkClearLockDialog = ({ open, onOpenChange, onConfirm, count, busy }: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent size="md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <LockOpen className="size-5 text-amber-500" aria-hidden="true" />
          Clear lock on {count} task{count === 1 ? '' : 's'}?
        </DialogTitle>
        <DialogDescription>
          Any active locks on the selected tasks will be released. Mappers currently working on
          these tasks may lose their in-progress session.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
          Cancel
        </Button>
        <Button onClick={onConfirm} disabled={busy}>
          {busy ? 'Clearing…' : 'Clear lock'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
