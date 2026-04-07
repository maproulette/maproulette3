import { Link, useParams } from '@tanstack/react-router'
import { Calendar, Clock, FileJson, FileText, MapPin, Pencil, User } from 'lucide-react'
import { useMemo } from 'react'
import { api } from '@/api'
import { TASK_STATUS_LABELS } from '@/components/Pages/ManagementPages/taskStatusLabels'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuthContext } from '@/contexts/AuthContext'
import { useSetBreadcrumbs } from '@/contexts/BreadcrumbContext'
import { useSetPageTitle } from '@/contexts/PageTitleContext'
import { canManageChallenge } from '@/lib/challengePermissions'
import { isSuperUser } from '@/lib/SuperAdminGuard'

export const ManageTaskDetail = () => {
  const { taskId } = useParams({ from: '/_app/manage/task/$taskId/' })
  const { user } = useAuthContext()
  const taskIdNum = Number(taskId)

  const { data: task, isLoading, isError } = api.task.getTask(taskIdNum)
  useSetPageTitle(task?.name ?? `Task #${taskId}`)

  const challengeId =
    task && typeof task.parent === 'number' ? task.parent : (task?.parent as { id?: number })?.id
  const { data: challenge, isLoading: challengeLoading } = api.challenge.getChallenge(
    challengeId ?? 0
  )

  const projectId = challenge?.parent
  const breadcrumbs = useMemo(
    () =>
      challengeId != null
        ? [
            { label: 'create & manage', href: '/manage' },
            ...(projectId != null
              ? [
                  { label: 'projects', href: '/manage/projects' },
                  { label: String(projectId), href: `/manage/project/${projectId}` },
                ]
              : []),
            { label: 'challenges', href: '/manage/challenges' },
            { label: String(challengeId), href: `/manage/challenge/${challengeId}` },
            { label: 'tasks', href: '/manage/tasks' },
            { label: taskId, href: `/manage/task/${taskId}` },
          ]
        : null,
    [projectId, challengeId, taskId]
  )
  useSetBreadcrumbs(breadcrumbs)
  const statusLabel =
    task?.status != null
      ? (TASK_STATUS_LABELS[task.status as keyof typeof TASK_STATUS_LABELS] ?? 'Unknown')
      : null

  const canAccess =
    user &&
    (isSuperUser(user) ||
      (!!challengeId &&
        !challengeLoading &&
        challenge != null &&
        canManageChallenge(user, challenge)))
  const permissionChecked = !challengeId || !challengeLoading
  const showAccessDenied = !isLoading && task && permissionChecked && !canAccess

  if (isError) {
    return (
      <div className="mx-auto px-4">
        <Card className="mt-4 border-red-200 dark:border-red-900">
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400">
              Failed to load task. It may not exist or you may not have permission to view it.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showAccessDenied) {
    return (
      <div className="mx-auto px-4">
        <Card className="mt-4 border-amber-200 dark:border-amber-900">
          <CardContent className="pt-6">
            <h2 className="mb-2 font-semibold text-lg text-zinc-900 dark:text-zinc-50">
              Access denied
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Only challenge owners and admins can view or edit tasks.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto h-full overflow-auto px-4">
      <div className="mb-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <div className="mb-3 flex items-center gap-3">
              <h1 className="font-bold text-3xl text-zinc-900 dark:text-zinc-50">
                {task?.name ?? `Task #${taskId}`}
              </h1>
              {!isLoading && statusLabel && (
                <Badge
                  variant="secondary"
                  className="bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  {statusLabel}
                </Badge>
              )}
            </div>
            {!isLoading && challengeId && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Challenge ID: {challengeId}
                <Link
                  to="/manage/challenge/$challengeId"
                  params={{ challengeId: String(challengeId) }}
                  className="ml-2 text-blue-600 hover:underline dark:text-blue-400"
                >
                  View challenge
                </Link>
              </p>
            )}
          </div>
          <Link to="/manage/task/$taskId/edit" params={{ taskId }}>
            <Button size="lg">
              <Pencil className="mr-2 h-5 w-5" />
              Edit Task
            </Button>
          </Link>
        </div>
      </div>

      {!(isLoading || (task && challengeId && challengeLoading)) && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Task Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {task?.instruction ? (
                  <div>
                    <h3 className="mb-2 font-semibold text-sm text-zinc-700 dark:text-zinc-300">
                      Instructions
                    </h3>
                    <p className="whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
                      {task.instruction}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    No task-specific instructions (challenge instructions apply).
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileJson className="h-5 w-5" />
                  GeoJSON
                </CardTitle>
                <CardDescription>Geometry for this task</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="overflow-auto rounded-md bg-zinc-100 p-4 text-xs dark:bg-zinc-800">
                  {typeof task?.geometries === 'string'
                    ? task.geometries
                    : JSON.stringify(task?.geometries ?? {}, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Task Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-zinc-500" />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Status: {statusLabel ?? '—'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-zinc-500" />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Created: {task?.created ? new Date(task.created * 1000).toLocaleString() : '—'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-zinc-500" />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Modified:{' '}
                    {task?.modified ? new Date(task.modified * 1000).toLocaleString() : '—'}
                  </span>
                </div>
                {task?.errorTags && (
                  <div>
                    <h3 className="mb-1 font-semibold text-sm text-zinc-700 dark:text-zinc-300">
                      MR Tags
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{task.errorTags}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/manage/task/$taskId/edit" params={{ taskId }} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Task
                  </Button>
                </Link>
                {challengeId && (
                  <Link
                    to="/challenge/$challengeId"
                    params={{ challengeId: String(challengeId) }}
                    className="block"
                  >
                    <Button variant="outline" className="w-full justify-start">
                      <MapPin className="mr-2 h-4 w-4" />
                      Browse Challenge
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
