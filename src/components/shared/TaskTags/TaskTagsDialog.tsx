import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { logger } from '@/lib/logger'
import { TagInput } from './TagInput'

interface Props {
  taskId: number
  initialTags: string[]
  preferredTags?: string[]
  limitToPreferred?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const TaskTagsDialog = ({
  taskId,
  initialTags,
  preferredTags,
  limitToPreferred,
  open,
  onOpenChange,
}: Props) => {
  const [tags, setTags] = useState<string[]>(initialTags)
  const mutation = api.task.useUpdateTaskTags()

  useEffect(() => {
    if (open) setTags(initialTags)
  }, [open, initialTags])

  const save = async () => {
    try {
      await mutation.mutateAsync({ taskId, tags })
      toast.success('Tags saved')
      onOpenChange(false)
    } catch (error) {
      logger.error('Task tags save failed', { error })
      toast.error('Could not save tags')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit task tags</DialogTitle>
        </DialogHeader>
        <TagInput
          value={tags}
          onChange={setTags}
          preferredTags={preferredTags}
          limitToPreferred={limitToPreferred}
        />
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button onClick={save} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
