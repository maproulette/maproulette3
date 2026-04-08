import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, Navigation, Shuffle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'

export const NavigationActions = ({
  challengeId,
  taskId,
}: {
  challengeId: number
  taskId: number
}) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isLoadingNearby, setIsLoadingNearby] = useState(false)
  const [isLoadingRandom, setIsLoadingRandom] = useState(false)

  const handleGoToNearbyTask = async () => {
    setIsLoadingNearby(true)
    try {
      const nearbyTasks = await queryClient.fetchQuery({
        queryKey: ['challenge', 'tasksNearby', challengeId, { taskId, limit: 1 }],
        queryFn: () => api.challenge.fetchTasksNearby(challengeId, taskId, 1),
      })
      if (nearbyTasks && nearbyTasks.length > 0) {
        await navigate({ to: '/tasks/$taskId', params: { taskId: String(nearbyTasks[0].id) } })
      } else {
        toast.info('No nearby tasks available')
      }
    } catch {
      toast.error('Failed to load nearby task')
    } finally {
      setIsLoadingNearby(false)
    }
  }

  const handleGoToRandomTask = async () => {
    setIsLoadingRandom(true)
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
      setIsLoadingRandom(false)
    }
  }

  return (
    <div className="rounded-lg bg-zinc-100 p-2.5 dark:bg-slate-800/60">
      <p className="mb-2 text-center font-medium text-sm text-zinc-700 dark:text-slate-300">
        Want to map this challenge?
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={handleGoToNearbyTask}
          disabled={isLoadingNearby}
          className="flex items-center justify-center gap-2 rounded-md bg-green-600 px-3 py-3 font-medium text-sm text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-50 dark:bg-green-600 dark:hover:bg-green-500"
        >
          {isLoadingNearby ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
          {isLoadingNearby ? 'Loading...' : 'Nearby task'}
        </button>
        <button
          type="button"
          onClick={handleGoToRandomTask}
          disabled={isLoadingRandom}
          className="flex items-center justify-center gap-2 rounded-md bg-green-600 px-3 py-3 font-medium text-sm text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-50 dark:bg-green-600 dark:hover:bg-green-500"
        >
          {isLoadingRandom ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Shuffle className="h-4 w-4" />
          )}
          {isLoadingRandom ? 'Loading...' : 'Random task'}
        </button>
      </div>
    </div>
  )
}
