import { useId, useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { logger } from '@/lib/logger'

interface Props {
  challengeId: number
  open: boolean
  onOpenChange: (open: boolean) => void
  sourceType?: 'local' | 'remote' | 'overpass'
}

export const RebuildTasksDialog = ({ challengeId, open, onOpenChange, sourceType }: Props) => {
  const [removeUnmatched, setRemoveUnmatched] = useState(false)
  const [recordSnapshot, setRecordSnapshot] = useState(true)
  const [localFile, setLocalFile] = useState<File | null>(null)
  const [dataOriginDate, setDataOriginDate] = useState<string>('')

  const rebuild = api.admin.useRebuildChallenge()
  const snapshot = api.admin.useCreateSnapshot()
  const snapshotId = useId()
  const unmatchedId = useId()
  const fileId = useId()
  const dateId = useId()

  const handleSubmit = async () => {
    try {
      if (recordSnapshot) {
        await snapshot.mutateAsync(challengeId).catch((error) => {
          logger.warn('Snapshot before rebuild failed', { error })
        })
      }
      await rebuild.mutateAsync({
        challengeId,
        localFile: localFile ?? undefined,
        dataOriginDate: dataOriginDate || undefined,
        removeUnmatchedTasks: removeUnmatched,
      })
      toast.success('Rebuild started')
      onOpenChange(false)
    } catch (error) {
      logger.error('Rebuild failed', { error })
      toast.error('Could not start rebuild')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rebuild tasks</DialogTitle>
          <DialogDescription>This may take a while and cannot be undone.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <label htmlFor={snapshotId} className="flex items-center gap-2 text-sm">
            <Checkbox
              id={snapshotId}
              checked={recordSnapshot}
              onCheckedChange={(c) => setRecordSnapshot(c === true)}
            />
            Record a snapshot first
          </label>
          <label htmlFor={unmatchedId} className="flex items-center gap-2 text-sm">
            <Checkbox
              id={unmatchedId}
              checked={removeUnmatched}
              onCheckedChange={(c) => setRemoveUnmatched(c === true)}
            />
            Remove tasks that no longer appear in the source data
          </label>
          {sourceType === 'local' && (
            <div className="space-y-2">
              <Label htmlFor={fileId}>Replace source file</Label>
              <Input
                id={fileId}
                type="file"
                accept="application/geo+json,application/json,.geojson,.json,.zip"
                onChange={(e) => setLocalFile(e.target.files?.[0] ?? null)}
              />
              <Label htmlFor={dateId}>Data origin date (optional)</Label>
              <Input
                id={dateId}
                type="date"
                value={dataOriginDate}
                onChange={(e) => setDataOriginDate(e.target.value)}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={rebuild.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={rebuild.isPending}>
            {rebuild.isPending ? 'Rebuilding…' : 'Rebuild'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
