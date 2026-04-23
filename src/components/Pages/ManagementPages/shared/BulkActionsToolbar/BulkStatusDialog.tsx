import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { STATUS_LABELS } from '@/lib/taskConstants'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (status: number) => void
}

export const BulkStatusDialog = ({ open, onOpenChange, onConfirm }: Props) => {
  const [status, setStatus] = useState<string>('1')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Change task status</DialogTitle>
          <DialogDescription>Updates every selected task to the chosen status.</DialogDescription>
        </DialogHeader>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(Number(status))}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
