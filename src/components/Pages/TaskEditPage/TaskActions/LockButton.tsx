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
        size="icon-sm"
        onClick={handleUnlockTask}
        disabled={isLocking}
        className="text-amber-600 hover:bg-amber-100/50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/30"
        title="Unlock task"
      >
        <Unlock />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleLockTask}
      disabled={isLocking}
      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
      title="Lock task"
    >
      <Lock />
    </Button>
  )
}
