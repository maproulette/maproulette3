import { FormCard, ManageFormLayout } from '@/components/shared/ManageFormLayout'

export const ManageTaskNew = () => {
  return (
    <ManageFormLayout>
      <FormCard title="New Task" description="Task management functionality is under development">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Tasks are typically created in bulk through challenges. Individual task creation will be
          available in a future update.
        </p>
      </FormCard>
    </ManageFormLayout>
  )
}
