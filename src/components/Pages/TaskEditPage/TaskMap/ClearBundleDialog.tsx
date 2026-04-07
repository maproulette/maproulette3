import { useTaskBundleContext } from '@/components/Pages/TaskEditPage/contexts/TaskBundleContext'
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

export const ClearBundleDialog = () => {
  const { showDeleteDialog, setShowDeleteDialog, handleClearBundle, activeBundle } =
    useTaskBundleContext()
  const taskCount = activeBundle?.taskIds.length ?? 0

  return (
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear Task Bundle?</AlertDialogTitle>
          <AlertDialogDescription>
            This will unbundle all {taskCount} tasks. The tasks themselves will not be deleted, only
            separated. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleClearBundle}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800"
          >
            Clear Bundle
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
