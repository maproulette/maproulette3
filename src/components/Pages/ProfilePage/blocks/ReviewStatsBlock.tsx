import { ClipboardCheck } from 'lucide-react'
import { api } from '@/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useProfilePageContext } from '../contexts/ProfilePageContext'

const reviewStatusLabels: Record<string, string> = {
  '0': 'Needed',
  '1': 'Approved',
  '2': 'Rejected',
  '3': 'Assisted',
  '4': 'Disputed',
  '5': 'Unnecessary',
}

export const ReviewStatsBlock = () => {
  const { userId, timeRange } = useProfilePageContext()
  const { data, isLoading, isError } = api.user.metrics(userId, timeRange.monthDuration)

  const reviewedTotal = Object.values(data?.reviewedTasks ?? {}).reduce((a, b) => a + b, 0)

  if (!isLoading && !isError && reviewedTotal === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardCheck className="size-4 text-blue-600" aria-hidden="true" />
          Reviews Received
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : isError || !data ? (
          <p className="text-sm text-zinc-500 dark:text-slate-400">Couldn't load review stats.</p>
        ) : (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {Object.entries(data.reviewedTasks ?? {}).map(([status, count]) => (
              <div key={status} className="flex justify-between">
                <dt className="text-zinc-600 dark:text-slate-400">
                  {reviewStatusLabels[status] ?? `Status ${status}`}
                </dt>
                <dd className="font-medium font-mono tabular-nums">{count.toLocaleString()}</dd>
              </div>
            ))}
          </dl>
        )}
      </CardContent>
    </Card>
  )
}
