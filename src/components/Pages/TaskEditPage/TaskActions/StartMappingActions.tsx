import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, MapPin, Shuffle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import { useTaskContext } from '@/components/Pages/TaskEditPage/contexts/TaskContext'

export const StartMappingActions = ({ challengeId }: { challengeId: number }) => {
  const { isLocking, lockTask } = useTaskContext()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isLoadingNext, setIsLoadingNext] = useState(false)

  const handleGoToDifferentTask = async () => {
    setIsLoadingNext(true)
    try {
      const randomTasks = await api.challenge.getRandomTask(challengeId, queryClient)
      if (randomTasks && randomTasks.length > 0) {
        await navigate({ to: '/tasks/$taskId', params: { taskId: String(randomTasks[0].id) } })
      } else {
        toast.info('No more tasks available in this challenge')
        await navigate({
          to: '/challenge/$challengeId',
          params: { challengeId: String(challengeId) },
        })
      }
    } catch {
      toast.error('Failed to load next task')
    } finally {
      setIsLoadingNext(false)
    }
  }

  return (
    <div className="rounded-lg bg-zinc-100 p-1.5 dark:bg-slate-800/60">
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={lockTask}
          disabled={isLocking}
          className="flex items-center justify-center gap-2 rounded-md bg-green-600 px-3 py-3 font-medium text-sm text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-50 dark:bg-green-600 dark:hover:bg-green-500"
        >
          {isLocking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
          {isLocking ? 'Starting...' : 'Map this task'}
        </button>
        <button
          type="button"
          onClick={handleGoToDifferentTask}
          disabled={isLoadingNext}
          className="flex items-center justify-center gap-2 rounded-md bg-zinc-600 px-3 py-3 font-medium text-sm text-white shadow-sm transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          {isLoadingNext ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Shuffle className="h-4 w-4" />
          )}
          {isLoadingNext ? 'Loading...' : 'Different task'}
        </button>
      </div>
    </div>
  )
}
