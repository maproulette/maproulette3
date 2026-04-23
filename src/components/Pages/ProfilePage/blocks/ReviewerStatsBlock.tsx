import { ShieldCheck } from 'lucide-react'
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

export const ReviewerStatsBlock = () => {
  const { userId, timeRange } = useProfilePageContext()
  const { data, isLoading } = api.user.metrics(userId, timeRange.monthDuration)

  const reviewerTotal = Object.values(data?.reviewTasks ?? {}).reduce((a, b) => a + b, 0)

  if (!isLoading && reviewerTotal === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="size-4 text-green-600" aria-hidden="true" />
          Reviews Performed
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {Object.entries(data?.reviewTasks ?? {}).map(([status, count]) => (
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
