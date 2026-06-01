import { Link, useParams } from '@tanstack/react-router'
import { Calendar, Clock, Eye, FileJson, FileText, Info, MapPin, Pencil } from 'lucide-react'
import { type ReactNode, useMemo } from 'react'
import { api } from '@/api'
import { TASK_STATUS_LABELS } from '@/components/Pages/ManagementPages/taskStatusLabels'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog'
import { useAuthContext } from '@/contexts/AuthContext'
import { useSetBreadcrumbContext } from '@/contexts/BreadcrumbContext'
import { useSetPageTitleContext } from '@/contexts/PageTitleContext'
import { canManageChallenge } from '@/lib/challengePermissions'
import { formatDate } from '@/lib/formatDate'
import { isSuperUser } from '@/lib/SuperAdminGuard'

type DialogActionButtonProps = {
  icon: ReactNode
  label: string
  title: string
  children: ReactNode
}

const DialogActionButton = ({ icon, label, title, children }: DialogActionButtonProps) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline" size="sm" className="w-full justify-start gap-2 rounded-full">
        {icon}
        {label}
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      {children}
    </DialogContent>
  </Dialog>
)

export const ManageTaskDetail = () => {
  const { taskId } = useParams({ from: '/_app/manage/task/$taskId/' })
  const { user } = useAuthContext()
  const taskIdNum = Number(taskId)

  const { data: task, isLoading, isError } = api.task.getTask(taskIdNum)
  useSetPageTitleContext(task?.name ?? `Task #${taskId}`)

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
  useSetBreadcrumbContext(breadcrumbs)

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
            <h2 className="mb-2 font-semibold text-base text-zinc-900 dark:text-zinc-50">
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

  const geometryString = JSON.stringify(task?.geometries ?? {}, null, 2)

  return (
    <aside className="h-full min-h-0 overflow-hidden pr-2">
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200/40 bg-white shadow-sm dark:border-slate-700/40 dark:bg-slate-800">
        {/* Header */}
        <div className="space-y-2.5 px-6 pt-6 pb-4">
          <h1 className="line-clamp-2 font-bold text-base text-zinc-900 leading-tight tracking-tight dark:text-zinc-50">
            {task?.name ?? `Task #${taskId}`}
          </h1>

          {!isLoading && (
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0 font-medium text-xs text-zinc-600 dark:text-zinc-400">
              {statusLabel && (
                <Badge
                  variant="secondary"
                  className="bg-zinc-100 text-zinc-800 dark:bg-slate-800 dark:text-zinc-200"
                >
                  {statusLabel}
                </Badge>
              )}
              <span className="text-zinc-400 dark:text-zinc-500">•</span>
              <span className="whitespace-nowrap">ID {taskId}</span>
            </div>
          )}
        </div>

        {/* Action buttons + modal triggers */}
        <div className="flex-1 overflow-y-auto border-zinc-200/50 border-t dark:border-slate-700/50">
          <div className="flex flex-col gap-2 px-6 py-4">
            <Link to="/manage/task/$taskId/edit" params={{ taskId }} className="block">
              <Button size="sm" className="w-full justify-start gap-2 rounded-full">
                <Pencil className="h-4 w-4" />
                Edit task
              </Button>
            </Link>
            {challengeId && (
              <Link
                to="/challenge/$challengeId"
                params={{ challengeId: String(challengeId) }}
                className="block"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 rounded-full"
                >
                  <Eye className="h-4 w-4" />
                  Browse challenge
                </Button>
              </Link>
            )}
            {challengeId && (
              <Link
                to="/manage/challenge/$challengeId"
                params={{ challengeId: String(challengeId) }}
                className="block"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 rounded-full"
                >
                  <MapPin className="h-4 w-4" />
                  Manage challenge
                </Button>
              </Link>
            )}

            <DialogActionButton
              icon={<Info className="h-4 w-4" />}
              label="Task information"
              title="Task information"
            >
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <Calendar className="h-4 w-4 opacity-70" />
                    Created
                  </span>
                  <span className="font-medium">{formatDate(task?.created, '—')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <Clock className="h-4 w-4 opacity-70" />
                    Modified
                  </span>
                  <span className="font-medium">{formatDate(task?.modified, '—')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Status</span>
                  <span className="font-medium">{statusLabel ?? '—'}</span>
                </div>
                {task?.errorTags && (
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-zinc-600 dark:text-zinc-400">MR Tags</span>
                    <span className="text-right font-medium">{task.errorTags}</span>
                  </div>
                )}
              </div>
            </DialogActionButton>

            {task?.instruction && (
              <DialogActionButton
                icon={<FileText className="h-4 w-4" />}
                label="Instructions"
                title="Instructions"
              >
                <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                  {task.instruction}
                </p>
              </DialogActionButton>
            )}

            {task?.geometries && (
              <DialogActionButton
                icon={<FileJson className="h-4 w-4" />}
                label="GeoJSON"
                title="GeoJSON"
              >
                <pre className="max-h-96 overflow-auto rounded-lg bg-zinc-100 p-4 text-xs dark:bg-slate-800">
                  {geometryString}
                </pre>
              </DialogActionButton>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
