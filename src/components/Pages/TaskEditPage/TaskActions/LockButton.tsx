import { Lock, Unlock } from 'lucide-react'
import { toast } from 'sonner'
import { useTaskContext } from '@/components/Pages/TaskEditPage/contexts/TaskContext'
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
      <button
        type="button"
        onClick={handleUnlockTask}
        disabled={isLocking}
        className="rounded-md p-1 text-amber-600 transition-colors hover:bg-amber-100/50 dark:text-amber-400 dark:hover:bg-amber-900/30"
        title="Unlock task"
      >
        <Unlock className="h-4 w-4" />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleLockTask}
      disabled={isLocking}
      className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-50 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
      title="Lock task"
    >
      <Lock className="h-4 w-4" />
    </button>
  )
}
