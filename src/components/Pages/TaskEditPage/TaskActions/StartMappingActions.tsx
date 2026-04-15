import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, MapPin, Shuffle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import { useTaskContext } from '@/components/Pages/TaskEditPage/contexts/TaskContext'
import { Button } from '@/components/ui/Button'

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
        <Button variant="success" size="lg" onClick={lockTask} disabled={isLocking}>
          {isLocking ? <Loader2 className="animate-spin" /> : <MapPin />}
          {isLocking ? 'Starting...' : 'Map this task'}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={handleGoToDifferentTask}
          disabled={isLoadingNext}
        >
          {isLoadingNext ? <Loader2 className="animate-spin" /> : <Shuffle />}
          {isLoadingNext ? 'Loading...' : 'Different task'}
        </Button>
      </div>
    </div>
  )
}
