import { useState } from 'react'
import { TagInput } from '@/components/shared/TaskTags/TagInput'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (tags: string[]) => void
}

export const BulkTagDialog = ({ open, onOpenChange, onConfirm }: Props) => {
  const [tags, setTags] = useState<string[]>([])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Add tags to selected tasks</DialogTitle>
        </DialogHeader>
        <TagInput value={tags} onChange={setTags} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(tags)} disabled={tags.length === 0}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
