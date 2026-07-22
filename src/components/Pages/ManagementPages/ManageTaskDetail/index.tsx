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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog'
import { useAuthContext } from '@/contexts/AuthContext'
import { useSetBreadcrumbContext } from '@/contexts/BreadcrumbContext'
import { useSetPageTitleContext } from '@/contexts/PageTitleContext'
import { useIntl } from '@/i18n'
import { canManageChallenge } from '@/lib/challengePermissions'
import { formatDate } from '@/lib/date'
import { isSuperUser } from '@/lib/SuperAdminGuard'

type DialogActionButtonProps = {
  icon: ReactNode
  label: string
  title: string
  description: string
  children: ReactNode
}

const DialogActionButton = ({
  icon,
  label,
  title,
  description,
  children,
}: DialogActionButtonProps) => (
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
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      {children}
    </DialogContent>
  </Dialog>
)

export const ManageTaskDetail = () => {
  const { t } = useIntl()
  const { taskId } = useParams({ from: '/_app/manage/task/$taskId/' })
  const { user } = useAuthContext()
  const taskIdNum = Number(taskId)

  const { data: task, isLoading, isError } = api.task.getTask(taskIdNum)
  useSetPageTitleContext(task?.name ?? t('common.taskWithTaskId', { taskId }, 'Task #{taskId}'))

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
            {
              label: t('common.createManage', undefined, 'create & manage'),
              href: '/manage',
            },
            ...(projectId != null
              ? [
                  {
                    label: t('common.projects2', undefined, 'projects'),
                    href: '/manage/projects',
                  },
                  { label: String(projectId), href: `/manage/project/${projectId}` },
                ]
              : []),
            {
              label: t('common.challenges2', undefined, 'challenges'),
              href: '/manage/challenges',
            },
            { label: String(challengeId), href: `/manage/challenge/${challengeId}` },
            {
              label: t('common.tasks2', undefined, 'tasks'),
              href: '/manage/tasks',
            },
            { label: taskId, href: `/manage/task/${taskId}` },
          ]
        : null,
    [projectId, challengeId, taskId, t]
  )
  useSetBreadcrumbContext(breadcrumbs)

  const statusLabel =
    task?.status != null
      ? (TASK_STATUS_LABELS[task.status as keyof typeof TASK_STATUS_LABELS] ??
        t('common.unknown', undefined, 'Unknown'))
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
              {t(
                'manageTaskDetail.loadError',
                undefined,
                'Failed to load task. It may not exist or you may not have permission to view it.'
              )}
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
              {t('common.accessDenied', undefined, 'Access denied')}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {t(
                'manageTaskDetail.accessDeniedBody',
                undefined,
                'Only challenge owners and admins can view or edit tasks.'
              )}
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
            {task?.name ?? t('common.taskWithTaskId', { taskId }, 'Task #{taskId}')}
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
              <span className="whitespace-nowrap">
                {t('manageTaskDetail.idLabel', { taskId }, 'ID {taskId}')}
              </span>
            </div>
          )}
        </div>

        {/* Action buttons + modal triggers */}
        <div className="flex-1 overflow-y-auto border-zinc-200/50 border-t dark:border-slate-700/50">
          <div className="flex flex-col gap-2 px-6 py-4">
            <Link to="/manage/task/$taskId/edit" params={{ taskId }} className="block">
              <Button size="sm" className="w-full justify-start gap-2 rounded-full">
                <Pencil className="h-4 w-4" />
                {t('common.editTask', undefined, 'Edit task')}
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
                  {t('common.browseChallenge', undefined, 'Browse challenge')}
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
                  {t('manageTaskDetail.manageChallenge', undefined, 'Manage challenge')}
                </Button>
              </Link>
            )}

            <DialogActionButton
              icon={<Info className="h-4 w-4" />}
              label={t('manageTaskDetail.taskInformation', undefined, 'Task information')}
              title={t('manageTaskDetail.taskInformation', undefined, 'Task information')}
              description={t(
                'manageTaskDetail.taskInformationDescription',
                undefined,
                'Key dates and status details for this task.'
              )}
            >
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <Calendar className="h-4 w-4 opacity-70" />
                    {t('common.created', undefined, 'Created')}
                  </span>
                  <span className="font-medium">
                    {task?.created ? formatDate(new Date(task.created)) : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <Clock className="h-4 w-4 opacity-70" />
                    {t('common.modified', undefined, 'Modified')}
                  </span>
                  <span className="font-medium">
                    {task?.modified ? formatDate(new Date(task.modified)) : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {t('common.status', undefined, 'Status')}
                  </span>
                  <span className="font-medium">{statusLabel ?? '—'}</span>
                </div>
                {task?.errorTags && (
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {t('common.mrTags', undefined, 'MR Tags')}
                    </span>
                    <span className="text-right font-medium">{task.errorTags}</span>
                  </div>
                )}
              </div>
            </DialogActionButton>

            {task?.instruction && (
              <DialogActionButton
                icon={<FileText className="h-4 w-4" />}
                label={t('common.instructions', undefined, 'Instructions')}
                title={t('common.instructions', undefined, 'Instructions')}
                description={t(
                  'manageTaskDetail.instructionsDescription',
                  undefined,
                  'The instructions provided by the challenge for this task.'
                )}
              >
                <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                  {task.instruction}
                </p>
              </DialogActionButton>
            )}

            <DialogActionButton
              icon={<FileJson className="h-4 w-4" />}
              label={t('common.geojson', undefined, 'GeoJSON')}
              title={t('common.geojson', undefined, 'GeoJSON')}
              description={t(
                'manageTaskDetail.geojsonDescription',
                undefined,
                'The raw GeoJSON geometry for this task.'
              )}
            >
              <pre className="max-h-96 overflow-auto rounded-lg bg-zinc-100 p-4 text-xs dark:bg-slate-800">
                {geometryString}
              </pre>
            </DialogActionButton>
          </div>
        </div>
      </div>
    </aside>
  )
}
