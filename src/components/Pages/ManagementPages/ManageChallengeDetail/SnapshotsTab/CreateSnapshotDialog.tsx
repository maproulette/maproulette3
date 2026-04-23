import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { useSnapshotsContext } from './SnapshotsContext'

export const CreateSnapshotDialog = () => {
  const { createDialogOpen, setCreateDialogOpen, createSnapshot, isCreating } =
    useSnapshotsContext()

  const onSubmit = async () => {
    try {
      await createSnapshot()
    } catch {
      // Error already surfaced via toast in context; keep dialog open so the
      // user sees the outcome and can retry.
    }
  }

  return (
    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Record snapshot</DialogTitle>
          <DialogDescription>
            A snapshot captures the current task counts for this challenge. You can use it later to
            compare progress or export as CSV.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setCreateDialogOpen(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isCreating}>
            {isCreating ? 'Recording…' : 'Record snapshot'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
