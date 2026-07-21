import { Link } from '@tanstack/react-router'
import { ChevronRight, ListTodo } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '@/api'
import { Spinner } from '@/components/ui/Spinner'
import { useGlobalSearchContext } from '@/contexts/GlobalSearchContext'
import { useIntl } from '@/i18n'
import { cn } from '@/lib/utils'

export const FindTask = () => {
  const { t } = useIntl()
  const statusLabels: Record<number, string> = {
    0: t('appLayout.header.globalSearch.findTask.status.created', undefined, 'Created'),
    1: t('appLayout.header.globalSearch.findTask.status.fixed', undefined, 'Fixed'),
    2: t(
      'appLayout.header.globalSearch.findTask.status.falsePositive',
      undefined,
      'False Positive'
    ),
    3: t('appLayout.header.globalSearch.findTask.status.skipped', undefined, 'Skipped'),
    4: t('appLayout.header.globalSearch.findTask.status.deleted', undefined, 'Deleted'),
    5: t('appLayout.header.globalSearch.findTask.status.alreadyFixed', undefined, 'Already Fixed'),
    6: t('appLayout.header.globalSearch.findTask.status.cantComplete', undefined, "Can't Complete"),
  }
  const { searchQuery, onResultSelect } = useGlobalSearchContext()
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
        <div className="rounded-full bg-zinc-100 p-3 dark:bg-slate-800">
          <ListTodo className="h-6 w-6 text-zinc-400 dark:text-slate-500" />
        </div>
        <div className="space-y-1 text-center">
          <p className="font-medium text-sm text-zinc-900 dark:text-white">
            {t('appLayout.header.globalSearch.findTask.title', undefined, 'Find a Task')}
          </p>
          <p className="text-xs text-zinc-500 dark:text-slate-400">
            {t(
              'appLayout.header.globalSearch.findTask.hint',
              undefined,
              'Enter a task ID to look it up'
            )}
          </p>
        </div>
      </div>
    )
  }

  if (isLoading || isDebouncePending) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <Spinner className="h-8 w-8 text-blue-500" />
        <p className="text-sm text-zinc-500 dark:text-slate-400">
          {t(
            'appLayout.header.globalSearch.findTask.lookingUp',
            { id: numericId },
            'Looking up task {id}...'
          )}
        </p>
      </div>
    )
  }

  if (!taskQuery.data || taskQuery.isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <div className="rounded-full bg-zinc-100 p-3 dark:bg-slate-800">
          <ListTodo className="h-6 w-6 text-zinc-400 dark:text-slate-500" />
        </div>
        <div className="space-y-1 text-center">
          <p className="font-medium text-sm text-zinc-900 dark:text-white">
            {t(
              'appLayout.header.globalSearch.findTask.noResults',
              { id: debouncedId },
              'No task found with ID {id}'
            )}
          </p>
          <p className="text-xs text-zinc-500 dark:text-slate-400">
            {t(
              'appLayout.header.globalSearch.findTask.noResultsHint',
              undefined,
              'Try a different task ID'
            )}
          </p>
        </div>
      </div>
    )
  }

  const task = taskQuery.data
  const statusLabel =
    statusLabels[task.status ?? -1] ||
    t('appLayout.header.globalSearch.findTask.status.unknown', undefined, 'Unknown')

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="font-semibold text-sm text-zinc-700 dark:text-slate-300">
          {t('appLayout.header.globalSearch.findTask.found', undefined, 'Task Found')}
        </h3>
      </div>
      <Link
        to="/tasks/$taskId"
        params={{
          taskId: String(task.id),
        }}
        onClick={onResultSelect}
        className={cn(
          'group flex items-start justify-between rounded-xl border border-zinc-200 bg-white px-5 py-4',
          'transition-all duration-200 hover:scale-[1.005] hover:border-zinc-300 hover:shadow-md',
          'dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-slate-700 dark:hover:bg-slate-900'
        )}
      >
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="font-semibold text-base text-zinc-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
            {task.name ||
              t(
                'appLayout.header.globalSearch.findTask.fallbackName',
                { id: task.id },
                'Task #{id}'
              )}
          </h3>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-slate-800 dark:text-slate-400">
              {t(
                'appLayout.header.globalSearch.findTask.status.label',
                { status: statusLabel },
                'Status: {status}'
              )}
            </span>
            <span className="text-xs text-zinc-500 dark:text-slate-400">
              {t(
                'appLayout.header.globalSearch.findTask.challengeRef',
                { id: task.parent },
                'Challenge #{id}'
              )}
            </span>
          </div>
        </div>
        <ChevronRight className="mt-1 ml-4 h-5 w-5 shrink-0 text-zinc-400 transition-all group-hover:translate-x-1 group-hover:text-blue-500 dark:text-slate-500 dark:group-hover:text-blue-400" />
      </Link>
    </div>
  )
}
