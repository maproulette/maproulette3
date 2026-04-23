import { Camera, Download, Upload } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog'
import { Button } from '@/components/ui/Button'
import { CreateSnapshotDialog } from './CreateSnapshotDialog'
import { ImportSnapshotsDialog } from './ImportSnapshotsDialog'
import { SnapshotsProvider, useSnapshotsContext } from './SnapshotsContext'
import { SnapshotsList } from './SnapshotsList'

export { SnapshotProgress } from './SnapshotProgress'
export { SnapshotsProvider, useSnapshotsContext } from './SnapshotsContext'

/** Outer container for the Snapshots tab — must be mounted within a SnapshotsProvider. */
export const SnapshotsTab = () => (
  <div className="flex h-full min-h-0 flex-col gap-3 overflow-auto">
    <SnapshotsToolbar />
    <SnapshotsList />
    <CreateSnapshotDialog />
    <ImportSnapshotsDialog />
    <DeleteSnapshotConfirm />
  </div>
)

/** Standalone wrapper useful when the Snapshots tab is rendered in isolation. */
export const SnapshotsTabStandalone = ({ challengeId }: { challengeId: number }) => (
  <SnapshotsProvider challengeId={challengeId}>
    <SnapshotsTab />
  </SnapshotsProvider>
)

const SnapshotsToolbar = () => {
  const {
    snapshots,
    canManage,
    isCreating,
    isExporting,
    setCreateDialogOpen,
    setImportDialogOpen,
    exportCsv,
  } = useSnapshotsContext()

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-xs dark:border-slate-700 dark:bg-slate-800">
      <div className="text-sm text-zinc-600 dark:text-zinc-400">
        {snapshots.length > 0
          ? `${snapshots.length} snapshot${snapshots.length === 1 ? '' : 's'}`
          : 'No snapshots recorded'}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={exportCsv}
          disabled={isExporting || snapshots.length === 0}
          className="gap-1.5"
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Exporting…' : 'Export CSV'}
        </Button>
        {canManage && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportDialogOpen(true)}
              className="gap-1.5"
            >
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button
              size="sm"
              onClick={() => setCreateDialogOpen(true)}
              disabled={isCreating}
              className="gap-1.5"
            >
              <Camera className="h-4 w-4" />
              {isCreating ? 'Recording…' : 'Record snapshot'}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

const DeleteSnapshotConfirm = () => {
  const { deleteTargetId, setDeleteTargetId, deleteSnapshot, isDeleting } = useSnapshotsContext()

  const onConfirm = async () => {
    if (deleteTargetId == null) return
    try {
      await deleteSnapshot(deleteTargetId)
    } catch {
      // Toast error is raised by context; keep dialog open so the user notices.
    }
  }

  return (
    <AlertDialog
      open={deleteTargetId != null}
      onOpenChange={(open) => {
        if (!open) setDeleteTargetId(null)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete snapshot?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the snapshot. Historical data captured in it cannot be
            recovered.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting…' : 'Delete snapshot'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
