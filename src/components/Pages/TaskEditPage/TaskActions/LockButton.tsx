import { Lock, Unlock } from 'lucide-react'
import { toast } from 'sonner'
import { useTaskContext } from '@/components/Pages/TaskEditPage/contexts/TaskContext'
import { Button } from '@/components/ui/Button'
import { useAuthContext } from '@/contexts/AuthContext'

export const LockButton = () => {
  const { isLocked, isLocking, lockTask, unlockTask } = useTaskContext()
  const { isAuthenticated } = useAuthContext()

  const handleLockTask = () => {
    lockTask()
    toast.success('Task locked')
  }

  const handleUnlockTask = () => {
    unlockTask()
    toast.success('Task unlocked')
  }

  // Don't show lock button if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="rounded-md p-1 text-zinc-400" title="Sign in to lock tasks">
        <Lock className="h-4 w-4" />
      </div>
    )
  }

  if (isLocked) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleUnlockTask}
        disabled={isLocking}
        className="gap-1.5 text-amber-600 dark:text-amber-400"
      >
        <Unlock className="size-4" />
        Unlock
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLockTask}
      disabled={isLocking}
      className="gap-1.5"
    >
      <Lock className="size-4" />
      Lock
    </Button>
  )
}
