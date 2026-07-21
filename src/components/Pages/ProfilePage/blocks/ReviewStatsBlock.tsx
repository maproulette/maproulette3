import { ClipboardCheck } from 'lucide-react'
import { api } from '@/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useIntl } from '@/i18n'
import { useProfilePageContext } from '../contexts/ProfilePageContext'

export const ReviewStatsBlock = () => {
  const { t } = useIntl()
  const { userId, timeRange } = useProfilePageContext()
  const { data, isLoading, isError } = api.user.metrics(userId, timeRange.monthDuration)

  const reviewStatusLabels: Record<string, string> = {
    '0': t('common.needed', undefined, 'Needed'),
    '1': t('common.approved', undefined, 'Approved'),
    '2': t('common.rejected', undefined, 'Rejected'),
    '3': t('common.assisted', undefined, 'Assisted'),
    '4': t('common.disputed', undefined, 'Disputed'),
    '5': t('common.unnecessary', undefined, 'Unnecessary'),
  }

  const reviewedTotal = Object.values(data?.reviewedTasks ?? {}).reduce((a, b) => a + b, 0)

  if (!isLoading && !isError && reviewedTotal === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardCheck className="size-4 text-blue-600" aria-hidden="true" />
          {t('profilePage.reviewStats.title', undefined, 'Reviews Received')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : isError || !data ? (
          <p className="text-sm text-zinc-500 dark:text-slate-400">
            {t('profilePage.reviewStats.loadError', undefined, "Couldn't load review stats.")}
          </p>
        ) : (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {Object.entries(data.reviewedTasks ?? {}).map(([status, count]) => (
              <div key={status} className="flex justify-between">
                <dt className="text-zinc-600 dark:text-slate-400">
                  {reviewStatusLabels[status] ??
                    t('common.statusWithStatus', { status }, 'Status {status}')}
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
