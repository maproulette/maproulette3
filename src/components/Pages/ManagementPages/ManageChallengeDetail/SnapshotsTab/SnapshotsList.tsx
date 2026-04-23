import { Trash2 } from 'lucide-react'
import type { ChallengeSnapshot } from '@/api/admin/snapshots'
import { Button } from '@/components/ui/Button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { formatDateTime } from '@/lib/formatDate'
import { useSnapshotsContext } from './SnapshotsContext'

const summaryLine = (snap: ChallengeSnapshot): string => {
  const a = snap.actions
  if (!a) return '—'
  const remaining = (a.available ?? 0) + (a.skipped ?? 0)
  return `${a.total ?? 0} tasks · ${a.fixed ?? 0} fixed · ${remaining} remaining`
}

export const SnapshotsList = () => {
  const { snapshots, isLoading, isError, canManage, setDeleteTargetId } = useSnapshotsContext()

  if (isLoading) {
    return (
      <div className="rounded-lg border border-zinc-200 p-6 text-center text-sm text-zinc-500 dark:border-slate-700 dark:text-zinc-400">
        Loading snapshots…
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700 text-sm dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
        Failed to load snapshots. Please try again.
      </div>
    )
  }

  if (snapshots.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 border-dashed p-8 text-center dark:border-slate-700">
        <p className="font-medium text-sm text-zinc-700 dark:text-zinc-200">No snapshots yet</p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Record a snapshot to capture a point-in-time view of this challenge's task statuses.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-slate-700">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Recorded</TableHead>
            <TableHead>Summary</TableHead>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead className="w-[120px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {snapshots.map((snap) => (
            <TableRow key={snap.id}>
              <TableCell className="text-sm">{formatDateTime(snap.created)}</TableCell>
              <TableCell className="text-sm text-zinc-600 dark:text-zinc-400">
                {summaryLine(snap)}
              </TableCell>
              <TableCell className="font-mono text-xs text-zinc-500">{snap.id}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Delete snapshot"
                      onClick={() => setDeleteTargetId(snap.id)}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
