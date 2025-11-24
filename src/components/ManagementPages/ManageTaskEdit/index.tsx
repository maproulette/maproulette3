import { useParams } from '@tanstack/react-router'
import { ManageFormLayout } from '@/components/shared'

export const ManageTaskEdit = () => {
  const { taskId } = useParams({ from: '/_app/manage/task/$taskId/edit' })

  return (
    <ManageFormLayout
      backTo="/manage/task/$taskId"
      backParams={{ taskId }}
      backLabel="Back to Task"
      pageTitle={`Edit Task #${taskId}`}
      pageDescription="Task editing functionality coming soon"
      cardTitle="Task Details"
      cardDescription="Task management functionality is under development"
    >
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        The ability to edit tasks will be available in a future update. For now, you can manage
        tasks through their parent challenges.
      </p>
    </ManageFormLayout>
  )
}
