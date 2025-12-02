import { Package, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/Button'
import { useTaskBundleContext } from '@/contexts/tasks/TaskBundleContext'

export const BundleToggle = () => {
  const { activeBundle, showBundleOnly, setShowBundleOnly } = useTaskBundleContext()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  if (!activeBundle) {
    return null
  }

  const handleDeleteBundle = () => {
    // deleteBundleMutation.mutate(activeBundle.bundleId)
    setShowDeleteDialog(false)
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant={showBundleOnly ? 'default' : 'outline'}
          size="sm"
          className="h-8 gap-2 whitespace-nowrap"
          onClick={() => setShowBundleOnly(!showBundleOnly)}
        >
          <Package className="h-4 w-4" />
          {showBundleOnly
            ? 'Show All Tasks'
            : `Bundle #${activeBundle.bundleId} (${activeBundle.taskIds.length})`}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
          onClick={() => setShowDeleteDialog(true)}
          title="Delete bundle"
        >
          <Trash2 className="h-4 w-4" />
          Delete Bundle
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task Bundle?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the bundle association from all {activeBundle.taskIds.length} tasks.
              The tasks themselves will not be deleted, only unbundled. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBundle}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800"
            >
              {/* {deleteBundleMutation.isPending ? 'Deleting...' : 'Delete Bundle'} */}
              Delete Bundle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
