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

interface ClearBundleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  taskCount: number
}

export const ClearBundleDialog = ({
  open,
  onOpenChange,
  onConfirm,
  taskCount,
}: ClearBundleDialogProps) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
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
          onClick={onConfirm}
          className="bg-red-600 hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800"
        >
          Clear Bundle
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)
