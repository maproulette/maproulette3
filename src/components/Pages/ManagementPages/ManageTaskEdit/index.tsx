import { useNavigate, useParams } from '@tanstack/react-router'
import { api } from '@/api'
import {
  TaskForm,
  type TaskFormValues,
} from '@/components/Pages/ManagementPages/ManageTaskEdit/TaskForm'
import { FormCard, ManageFormLayout } from '@/components/shared/ManageFormLayout'
import { useAuthContext } from '@/contexts/AuthContext'
import { canManageChallenge } from '@/lib/challengePermissions'
import { isSuperUser } from '@/lib/SuperAdminGuard'
import type { TaskGetResponse } from '@/types/Task'

export const ManageTaskEdit = () => {
  const { taskId } = useParams({ from: '/_app/manage/task/$taskId/edit' })
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const taskIdNum = Number(taskId)

  const { data: task, isLoading, isError } = api.task.getTask(taskIdNum)
  const challengeId =
    task && typeof task.parent === 'number' ? task.parent : (task?.parent as { id?: number })?.id
  const { data: challenge, isLoading: challengeLoading } = api.challenge.getChallenge(
    challengeId ?? 0
  )
  const updateTaskMutation = api.task.useUpdateTask()

  const canAccess =
    user &&
    (isSuperUser(user) ||
      (!!challengeId &&
        !challengeLoading &&
        challenge != null &&
        canManageChallenge(user, challenge)))
  const permissionChecked = !challengeId || !challengeLoading
  const showAccessDenied = !isLoading && task && permissionChecked && !canAccess

  const handleSubmit = async (values: TaskFormValues) => {
    if (!task) return
    const parentId =
      typeof task.parent === 'number' ? task.parent : ((task.parent as { id?: number })?.id ?? 0)
    const body: TaskGetResponse = {
      ...task,
      parent: parentId,
      name: values.name,
      instruction: values.instruction ?? null,
      geometries: values.geometries,
      status: values.status,
      errorTags: values.errorTags ?? task.errorTags ?? '',
    }
    await updateTaskMutation.mutateAsync({ taskId: taskIdNum, body })
    navigate({ to: '/manage/task/$taskId', params: { taskId } })
  }

  const handleCancel = () => {
    navigate({ to: '/manage/task/$taskId', params: { taskId } })
  }

  if (isLoading || !task || (task && challengeId && challengeLoading)) {
    return (
      <ManageFormLayout>
        <FormCard title="Task Details" description="" isLoading>
          <div className="h-40" />
        </FormCard>
      </ManageFormLayout>
    )
  }

  if (showAccessDenied || isError) {
    return (
      <ManageFormLayout>
        <FormCard
          title="Access denied"
          description="Only challenge owners and admins can edit tasks."
        >
          <p className="text-zinc-600 dark:text-zinc-400">
            You do not have permission to edit this task.
          </p>
        </FormCard>
      </ManageFormLayout>
    )
  }

  return (
    <ManageFormLayout>
      <FormCard
        title="Task Details"
        description="Modify the fields below and save to update the task"
      >
        <TaskForm task={task} onSubmit={handleSubmit} onCancel={handleCancel} />
      </FormCard>
    </ManageFormLayout>
  )
}
