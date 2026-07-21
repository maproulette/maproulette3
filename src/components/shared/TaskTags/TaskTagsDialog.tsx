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
import { useIntl } from '@/i18n'
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
  const { t } = useIntl()
  const [tags, setTags] = useState<string[]>(initialTags)
  const mutation = api.task.useUpdateTaskTags()

  useEffect(() => {
    if (open) setTags(initialTags)
  }, [open, initialTags])

  const save = async () => {
    try {
      await mutation.mutateAsync({ taskId, tags })
      toast.success(t('taskTags.dialog.saveSuccess', undefined, 'Tags saved'))
      onOpenChange(false)
    } catch (error) {
      logger.error('Task tags save failed', { error })
      toast.error(t('taskTags.dialog.saveError', undefined, 'Could not save tags'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('taskTags.dialog.title', undefined, 'Edit task tags')}</DialogTitle>
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
            {t('common.cancel', undefined, 'Cancel')}
          </Button>
          <Button onClick={save} disabled={mutation.isPending}>
            {mutation.isPending
              ? t('taskTags.dialog.saving', undefined, 'Saving…')
              : t('common.save', undefined, 'Save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
