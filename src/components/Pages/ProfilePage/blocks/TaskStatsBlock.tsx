import { CheckCircle2 } from 'lucide-react'
import { api } from '@/api'
import { DigitDisplay } from '@/components/shared/DigitDisplay'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { STATUS_LABELS } from '@/lib/taskConstants'
import { useProfilePageContext } from '../contexts/ProfilePageContext'

export const TaskStatsBlock = () => {
  const { userId, timeRange } = useProfilePageContext()
  const { data, isLoading, isError } = api.user.metrics(userId, timeRange.monthDuration)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CheckCircle2 className="size-4 text-teal-600" aria-hidden="true" />
          Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-12 w-32" />
        ) : isError || !data ? (
          <p className="text-sm text-zinc-500 dark:text-slate-400">Couldn't load task stats.</p>
        ) : (
          <>
            <div>
              <div className="mb-1 text-xs text-zinc-500 uppercase tracking-wide dark:text-slate-400">
                Total completed
              </div>
              <DigitDisplay value={data.total ?? 0} size="lg" />
            </div>
            {data.tasks && Object.keys(data.tasks).length > 0 && (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                {Object.entries(data.tasks).map(([status, count]) => (
                  <div key={status} className="flex justify-between">
                    <dt className="text-zinc-600 dark:text-slate-400">
                      {STATUS_LABELS[Number(status)] ?? `Status ${status}`}
                    </dt>
                    <dd className="font-medium font-mono tabular-nums">{count.toLocaleString()}</dd>
                  </div>
                ))}
              </dl>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
