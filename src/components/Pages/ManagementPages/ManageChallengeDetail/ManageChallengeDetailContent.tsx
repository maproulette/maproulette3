import { Link, useParams } from '@tanstack/react-router'
import {
  BarChart3,
  Calendar,
  Clock,
  Eye,
  FileText,
  History,
  Info,
  ListTodo,
  Pencil,
  Target,
} from 'lucide-react'
import { type ReactNode, useMemo, useState } from 'react'
import { api } from '@/api'
import { ChallengeStatusIndicator } from '@/components/Pages/ManagementPages/ManageChallengeDetail/ChallengeStatusIndicator'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { DrawerPortalTarget } from '@/components/TaskInfoPanel/DrawerPortalContext'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog'
import { Progress } from '@/components/ui/Progress'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/Resizable'
import { Separator } from '@/components/ui/Separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useSetBreadcrumbContext } from '@/contexts/BreadcrumbContext'
import { useSetPageTitleContext } from '@/contexts/PageTitleContext'
import { getDifficultyColor, getDifficultyLabel } from '@/lib/difficultyLevelData'
import { formatDate } from '@/lib/formatDate'
import { cn } from '@/lib/utils'
import type { ChallengeGetResponse } from '@/types/Challenge'
import { ChallengeRecentActivity } from './ChallengeRecentActivity'
import { ChallengeTasksExplorerMain } from './ChallengeTasksExplorer'
import { SnapshotsProvider, SnapshotsTab } from './SnapshotsTab'

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

const StatisticsDialogContent = ({
  challengeId,
  challengeData,
}: {
  challengeId: number
  challengeData: ChallengeGetResponse | undefined
}) => {
  const { data: statsData, isLoading } = api.challenge.getChallengeStats(challengeId)
  const challengeStats = statsData?.[0]
  const stats = challengeStats?.actions
  const tasksRemaining = stats?.available ?? challengeData?.completionMetrics?.tasksRemaining ?? 0
  const totalTasks = stats?.total ?? 0
  const completedTasks = totalTasks > 0 ? totalTasks - tasksRemaining : 0
  const completionPercentage =
    challengeData?.completionPercentage ??
    (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0)

  if (isLoading) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
  }

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-zinc-600 dark:text-zinc-400">Tasks remaining</span>
        <span className="font-semibold">
          {tasksRemaining}
          {totalTasks > 0 ? (
            <span className="font-normal text-zinc-500 dark:text-zinc-400"> / {totalTasks}</span>
          ) : null}
        </span>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-zinc-600 dark:text-zinc-400">Completion</span>
          <span className="font-semibold">{Math.round(completionPercentage)}%</span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </div>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
          <Calendar className="h-4 w-4 opacity-70" />
          Created
        </span>
        <span className="font-medium">{formatDate(challengeData?.created, '—')}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
          <Clock className="h-4 w-4 opacity-70" />
          Last modified
        </span>
        <span className="font-medium">{formatDate(challengeData?.modified, '—')}</span>
      </div>

      {stats && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-semibold text-zinc-700 dark:text-zinc-300">
              Task counts by status
            </h3>
            {(
              [
                ['Available', stats.available],
                ['Fixed', stats.fixed],
                ['False Positive', stats.falsePositive],
                ['Skipped', stats.skipped],
                ['Already Fixed', stats.alreadyFixed],
                ['Too Hard', stats.tooHard],
                ['Disabled', stats.disabled],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
                <span className="font-semibold">{value || 0}</span>
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-base">{stats.total || 0}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export const ManageChallengeDetailContent = () => {
  const { challengeId } = useParams({ from: '/_app/manage/challenge/$challengeId/' })
  const [activeTab, setActiveTab] = useState<'tasks' | 'snapshots'>('tasks')

  const { data: challengeData, isLoading: isLoadingChallenge } = api.challenge.getChallenge(
    Number(challengeId)
  )

  useSetPageTitleContext(challengeData?.name ?? null)

  const projectId = challengeData?.parent
  const breadcrumbs = useMemo(
    () =>
      projectId != null
        ? [
            { label: 'create & manage', href: '/manage' },
            { label: 'projects', href: '/manage/projects' },
            { label: String(projectId), href: `/manage/project/${projectId}` },
            { label: 'challenges', href: '/manage/challenges' },
            { label: challengeId, href: `/manage/challenge/${challengeId}` },
          ]
        : null,
    [projectId, challengeId]
  )
  useSetBreadcrumbContext(breadcrumbs)

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={30} minSize={20} maxSize={45}>
        <aside className="h-full min-h-0 overflow-hidden pr-4">
          <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200/40 bg-white shadow-sm dark:border-slate-700/40 dark:bg-slate-800">
            {/* Header */}
            <div className="space-y-2.5 px-6 pt-6 pb-4">
              {!isLoadingChallenge && challengeData?.featured && (
                <ul className="flex flex-wrap items-center gap-2.5">
                  <li>
                    <span className="font-medium text-cyan-500 text-xs uppercase tracking-wide dark:text-cyan-400">
                      Featured
                    </span>
                  </li>
                </ul>
              )}

              <h1 className="line-clamp-2 font-bold text-base text-zinc-900 leading-tight tracking-tight dark:text-zinc-50">
                {challengeData?.name}
              </h1>

              {!isLoadingChallenge && (
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0 font-medium text-xs text-zinc-600 dark:text-zinc-400">
                  <StatusBadge enabled={challengeData?.enabled || false} />
                  <span className="text-zinc-400 dark:text-zinc-500">•</span>
                  <span className="whitespace-nowrap">ID {challengeId}</span>
                  <span className="text-zinc-400 dark:text-zinc-500">•</span>
                  <span
                    className={cn(
                      'font-medium',
                      getDifficultyColor(challengeData?.difficulty as number)
                    )}
                  >
                    {getDifficultyLabel(challengeData?.difficulty as number)}
                  </span>
                </div>
              )}
            </div>

            {challengeData?.blurb && (
              <div className="px-6 py-4">
                <p className="text-pretty text-sm text-zinc-700 leading-relaxed dark:text-zinc-300">
                  {challengeData.blurb}
                </p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto border-zinc-200/50 border-t dark:border-slate-700/50">
              <div className="flex flex-col gap-2 px-6 py-4">
                <Link to="/challenge/$challengeId" params={{ challengeId }} className="block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 rounded-full"
                  >
                    <Eye className="h-4 w-4" />
                    Browse challenge
                  </Button>
                </Link>
                <Link
                  to="/manage/challenge/$challengeId/edit"
                  params={{ challengeId }}
                  className="block"
                >
                  <Button size="sm" className="w-full justify-start gap-2 rounded-full">
                    <Pencil className="h-4 w-4" />
                    Edit challenge
                  </Button>
                </Link>
                <Link
                  to="/manage/challenge/$challengeId/prioritization"
                  params={{ challengeId }}
                  className="block"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 rounded-full"
                  >
                    <Target className="h-4 w-4" />
                    Configure prioritization
                  </Button>
                </Link>

                <DialogActionButton
                  icon={<BarChart3 className="h-4 w-4" />}
                  label="Statistics"
                  title="Statistics"
                >
                  <StatisticsDialogContent
                    challengeId={Number(challengeId)}
                    challengeData={challengeData}
                  />
                </DialogActionButton>

                {!isLoadingChallenge && challengeData?.id && (
                  <DialogActionButton
                    icon={<History className="h-4 w-4" />}
                    label="Recent Activity"
                    title="Recent Activity"
                  >
                    <ChallengeRecentActivity challengeId={challengeData.id} />
                  </DialogActionButton>
                )}

                {!isLoadingChallenge &&
                  challengeData?.description &&
                  challengeData.description !== challengeData.blurb && (
                    <DialogActionButton
                      icon={<Info className="h-4 w-4" />}
                      label="Description"
                      title="Description"
                    >
                      <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                        {challengeData.description}
                      </p>
                    </DialogActionButton>
                  )}

                {!isLoadingChallenge && challengeData?.instruction && (
                  <DialogActionButton
                    icon={<FileText className="h-4 w-4" />}
                    label="Instructions"
                    title="Instructions"
                  >
                    <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                      {challengeData.instruction}
                    </p>
                  </DialogActionButton>
                )}

                {!isLoadingChallenge && challengeData?.id && (
                  <div className="pt-2">
                    <ChallengeStatusIndicator
                      challenge={challengeData}
                      challengeId={challengeData.id}
                    />
                  </div>
                )}
              </div>
            </div>
            <DrawerPortalTarget />
          </div>
        </aside>
      </ResizablePanel>

      <ResizableHandle />

      <ResizablePanel defaultSize={70} minSize={40} style={{ overflow: 'visible' }}>
        <SnapshotsProvider challengeId={Number(challengeId)}>
          <div
            className="flex h-full min-h-0 min-w-0 flex-col gap-3"
            style={{ overflow: 'visible' }}
          >
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as 'tasks' | 'snapshots')}
              className="flex min-h-0 flex-1 flex-col gap-2"
            >
              <TabsList>
                <TabsTrigger value="tasks">
                  <ListTodo className="h-4 w-4" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="snapshots">
                  <History className="h-4 w-4" />
                  Snapshots
                </TabsTrigger>
              </TabsList>
              <TabsContent value="tasks" className="min-h-0 flex-1" style={{ overflow: 'visible' }}>
                <ChallengeTasksExplorerMain />
              </TabsContent>
              <TabsContent value="snapshots" className="min-h-0 flex-1 overflow-auto">
                <SnapshotsTab />
              </TabsContent>
            </Tabs>
          </div>
        </SnapshotsProvider>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
