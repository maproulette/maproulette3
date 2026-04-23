import { Camera, Clock } from 'lucide-react'
import type { ChallengeSnapshot } from '@/api/admin/snapshots'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDateTime } from '@/lib/formatDate'
import { cn } from '@/lib/utils'
import { useSnapshotsContext } from './SnapshotsContext'

const computePercent = (s: ChallengeSnapshot | undefined) => {
  const total = s?.actions?.total ?? 0
  if (total === 0) return 0
  const remaining = (s?.actions?.available ?? 0) + (s?.actions?.skipped ?? 0)
  const done = Math.max(0, total - remaining)
  return Math.round((done / total) * 100)
}

/**
 * Compact snapshot progress card surfaced above the tasks explorer.
 * Shows the most recent snapshot's completion and exposes a quick "Record" action.
 */
export const SnapshotProgress = ({
  className,
  onOpenTab,
}: {
  className?: string
  onOpenTab?: () => void
}) => {
  const { snapshots, isLoading, canManage, isCreating, setCreateDialogOpen } = useSnapshotsContext()

  if (isLoading) {
    return (
      <div
        className={cn(
          'rounded-lg border border-zinc-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800',
          className
        )}
      >
        <Skeleton className="mb-2 h-4 w-32" />
        <Skeleton className="h-2 w-full" />
      </div>
    )
  }

  const latest = snapshots[0]
  const percent = computePercent(latest)

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800',
        className
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-slate-900 dark:text-zinc-300">
        <Camera className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">
            Latest snapshot
          </span>
          <span className="font-medium text-xs text-zinc-500 dark:text-zinc-400">
            {latest ? `${percent}% complete` : 'None recorded'}
          </span>
        </div>
        {latest ? (
          <>
            <Progress value={percent} className="mt-1.5 h-1.5" />
            <div className="mt-1.5 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
              <Clock className="h-3 w-3" />
              <span>{formatDateTime(latest.created)}</span>
            </div>
          </>
        ) : (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Record a snapshot to capture current task counts for later comparison.
          </p>
        )}
      </div>
      <div className="flex shrink-0 gap-2">
        {onOpenTab && (
          <Button variant="ghost" size="sm" onClick={onOpenTab}>
            View all
          </Button>
        )}
        {canManage && (
          <Button
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
            disabled={isCreating}
            className="gap-1.5"
          >
            <Camera className="h-4 w-4" />
            {isCreating ? 'Recording…' : 'Record'}
          </Button>
        )}
      </div>
    </div>
  )
}
