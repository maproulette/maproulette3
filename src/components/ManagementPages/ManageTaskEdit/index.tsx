import { useNavigate, useParams } from '@tanstack/react-router'
import { api } from '@/api'
import { useAuthContext } from '@/components/AuthContext'
import { canManageChallenge } from '@/components/challengePermissions'
import { TaskForm, type TaskFormValues } from '@/components/ManagementPages/ManageTaskEdit/TaskForm'
import { ManageFormLayout } from '@/components/shared/ManageFormLayout'
import { isSuperUser } from '@/components/shared/SuperAdminGuard'
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
      <ManageFormLayout
        backTo="/manage/task/$taskId"
        backParams={{ taskId }}
        backLabel="Back to Task"
        pageTitle="Edit Task"
        pageDescription="Loading..."
        cardTitle="Task Details"
        cardDescription=""
        isLoading
      >
        <div className="h-40" />
      </ManageFormLayout>
    )
  }

  if (showAccessDenied || isError) {
    return (
      <ManageFormLayout
        backTo="/manage"
        backLabel="Back to Manage"
        pageTitle="Edit Task"
        pageDescription=""
        cardTitle="Access denied"
        cardDescription="Only challenge owners and admins can edit tasks."
        isLoading={false}
      >
        <p className="text-zinc-600 dark:text-zinc-400">
          You do not have permission to edit this task.
        </p>
      </ManageFormLayout>
    )
  }

  return (
    <ManageFormLayout
      backTo="/manage/task/$taskId"
      backParams={{ taskId }}
      backLabel="Back to Task"
      pageTitle={`Edit Task #${taskId}`}
      pageDescription="Update the task details below"
      cardTitle="Task Details"
      cardDescription="Modify the fields below and save to update the task"
      isLoading={false}
    >
      <TaskForm task={task} onSubmit={handleSubmit} onCancel={handleCancel} />
    </ManageFormLayout>
  )
}
