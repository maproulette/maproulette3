import { Link } from '@tanstack/react-router'
import { ChevronRight, ListTodo } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '@/api'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'

const STATUS_LABELS: Record<number, string> = {
  0: 'Created',
  1: 'Fixed',
  2: 'False Positive',
  3: 'Skipped',
  4: 'Deleted',
  5: 'Already Fixed',
  6: "Can't Complete",
}

export const FindTask = ({
  searchQuery = '',
  onResultSelect,
}: {
  searchQuery?: string
  onResultSelect: () => void
}) => {
  const [debouncedId, setDebouncedId] = useState(0)
  const trimmed = searchQuery.trim()
  const numericId = /^\d+$/.test(trimmed) ? parseInt(trimmed, 10) : 0

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedId(numericId)
    }, 300)
    return () => clearTimeout(timer)
  }, [numericId])

  const taskQuery = api.task.getTask(debouncedId || 0)
  const isLoading = debouncedId > 0 && taskQuery.isLoading
  const isDebouncePending = numericId !== debouncedId

  if (!numericId) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <div className="rounded-full bg-zinc-100 p-3 dark:bg-zinc-800">
          <ListTodo className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
        </div>
        <div className="space-y-1 text-center">
          <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">Find a Task</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Enter a task ID to look it up</p>
        </div>
      </div>
    )
  }

  if (isLoading || isDebouncePending) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <Spinner className="h-8 w-8 text-blue-500" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Looking up task {numericId}...</p>
      </div>
    )
  }

  if (!taskQuery.data || taskQuery.isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <div className="rounded-full bg-zinc-100 p-3 dark:bg-zinc-800">
          <ListTodo className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
        </div>
        <div className="space-y-1 text-center">
          <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
            No task found with ID {debouncedId}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Try a different task ID</p>
        </div>
      </div>
    )
  }

  const task = taskQuery.data
  const statusLabel = STATUS_LABELS[task.status ?? -1] || 'Unknown'

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">Task Found</h3>
      </div>
      <Link
        to="/tasks/$taskId"
        params={{
          taskId: String(task.id),
        }}
        onClick={onResultSelect}
        className={cn(
          'group flex items-start justify-between rounded-xl border border-zinc-200 bg-white px-5 py-4',
          'transition-all duration-200 hover:scale-[1.005] hover:border-zinc-300 hover:shadow-lg',
          'dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-900'
        )}
      >
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="font-semibold text-base text-zinc-900 transition-colors group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
            {task.name || `Task #${task.id}`}
          </h3>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              Status: {statusLabel}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Challenge #{task.parent}
            </span>
          </div>
        </div>
        <ChevronRight className="mt-1 ml-4 h-5 w-5 shrink-0 text-zinc-400 transition-all group-hover:translate-x-1 group-hover:text-blue-500 dark:text-zinc-500 dark:group-hover:text-blue-400" />
      </Link>
    </div>
  )
}
