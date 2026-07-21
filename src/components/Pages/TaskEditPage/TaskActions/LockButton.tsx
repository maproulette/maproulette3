import { Lock, Unlock } from 'lucide-react'
import { toast } from 'sonner'
import { useTaskContext } from '@/components/Pages/TaskEditPage/contexts/TaskContext'
import { Button } from '@/components/ui/Button'
import { useAuthContext } from '@/contexts/AuthContext'
import { useIntl } from '@/i18n'

export const LockButton = ({ compact = false }: { compact?: boolean }) => {
  const { t } = useIntl()
  const { isLocked, isLocking, lockTask, unlockTask } = useTaskContext()
  const { isAuthenticated } = useAuthContext()

  const handleLockTask = () => {
    lockTask()
    toast.success(t('taskEditPage.taskActions.lockButton.locked', undefined, 'Task locked'))
  }

  const handleUnlockTask = () => {
    unlockTask()
    toast.success(t('taskEditPage.taskActions.lockButton.unlocked', undefined, 'Task unlocked'))
  }

  // Don't show lock button if not authenticated
  if (!isAuthenticated) {
    return (
      <div
        className="rounded-md p-1 text-zinc-400"
        title={t(
          'taskEditPage.taskActions.lockButton.signInToLock',
          undefined,
          'Sign in to lock tasks'
        )}
      >
        <Lock className="h-4 w-4" />
      </div>
    )
  }

  if (isLocked) {
    return (
      <Button
        variant="ghost"
        size={compact ? 'icon-sm' : 'sm'}
        onClick={handleUnlockTask}
        disabled={isLocking}
        className={
          compact
            ? 'text-amber-600 dark:text-amber-400'
            : 'gap-1.5 text-amber-600 dark:text-amber-400'
        }
        aria-label={t('taskEditPage.taskActions.lockButton.unlockTask', undefined, 'Unlock task')}
        title={t('taskEditPage.taskActions.lockButton.unlockTask', undefined, 'Unlock task')}
      >
        <Unlock className="size-4" />
        {!compact && t('taskEditPage.taskActions.lockButton.unlock', undefined, 'Unlock')}
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size={compact ? 'icon-sm' : 'sm'}
      onClick={handleLockTask}
      disabled={isLocking}
      className={compact ? undefined : 'gap-1.5'}
      aria-label={t('taskEditPage.taskActions.lockButton.lockTask', undefined, 'Lock task')}
      title={t('taskEditPage.taskActions.lockButton.lockTask', undefined, 'Lock task')}
    >
      <Lock className="size-4" />
      {!compact && t('taskEditPage.taskActions.lockButton.lock', undefined, 'Lock')}
    </Button>
  )
}
