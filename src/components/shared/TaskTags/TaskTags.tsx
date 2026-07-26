import { Pencil } from 'lucide-react'
import { useState } from 'react'
import { api } from '@/api'
import { Button } from '@/components/ui/Button'
import { useAuthContext } from '@/contexts/AuthContext'
import { useIntl } from '@/i18n'
import type { Task } from '@/types/Task'
import { TagChip } from './TagChip'
import { TaskTagsDialog } from './TaskTagsDialog'
import { canEditTags } from './taskTagsPermissions'

interface Props {
  task: Task
  challenge?: { preferredTags?: string; limitTags?: boolean }
}

const parseTagList = (raw: string | undefined | null): string[] =>
  raw
    ? raw
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : []

export const TaskTags = ({ task, challenge }: Props) => {
  const { t } = useIntl()
  const { user } = useAuthContext()
  const { data: tagRecords = [] } = api.task.getTaskTags(task.id)
  const [editing, setEditing] = useState(false)

  const tags = tagRecords.map((t) => t.name)
  const preferred = parseTagList(challenge?.preferredTags)
  const canEdit = canEditTags(task, user)

  const preferredSet = new Set(preferred.map((p) => p.toLowerCase()))

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.length === 0 ? (
        <span className="text-sm text-zinc-500 dark:text-slate-400">
          {t('taskTags.taskTags.noTags', undefined, 'No tags')}
        </span>
      ) : (
        tags.map((tag) => (
          <TagChip key={tag} label={tag} preferred={preferredSet.has(tag.toLowerCase())} />
        ))
      )}
      {canEdit && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={() => setEditing(true)}
          aria-label={t('taskTags.taskTags.editTags', undefined, 'Edit tags')}
        >
          <Pencil className="size-3" aria-hidden="true" /> {t('common.edit', undefined, 'Edit')}
        </Button>
      )}
      {editing && (
        <TaskTagsDialog
          taskId={task.id}
          initialTags={tags}
          preferredTags={preferred}
          limitToPreferred={challenge?.limitTags}
          open={editing}
          onOpenChange={setEditing}
        />
      )}
    </div>
  )
}
