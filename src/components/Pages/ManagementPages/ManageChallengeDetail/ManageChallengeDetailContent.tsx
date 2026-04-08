import { Link, useParams } from '@tanstack/react-router'
import { Calendar, Clock, Eye, Pencil } from 'lucide-react'
import { useMemo } from 'react'
import { api } from '@/api'
import { ChallengeStatusIndicator } from '@/components/Pages/ManagementPages/ManageChallengeDetail/ChallengeStatusIndicator'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { DrawerPortalTarget } from '@/components/TaskInfoPanel/DrawerPortalContext'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/Resizable'
import { Separator } from '@/components/ui/Separator'
import { useSetBreadcrumbContext } from '@/contexts/BreadcrumbContext'
import { useSetPageTitleContext } from '@/contexts/PageTitleContext'
import { getDifficultyColor, getDifficultyLabel } from '@/lib/difficultyLevelData'
import { cn } from '@/lib/utils'
import { ChallengeRecentActivity } from './ChallengeRecentActivity'
import { ChallengeTasksExplorerMain, ChallengeTasksExplorerSidebar } from './ChallengeTasksExplorer'

export const ManageChallengeDetailContent = () => {
  const { challengeId } = useParams({ from: '/_app/manage/challenge/$challengeId/' })

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

  const { data: statsData, isLoading: isLoadingStats } = api.challenge.getChallengeStats(
    Number(challengeId)
  )
  const challengeStats = statsData?.[0]

  const stats = challengeStats?.actions
  const tasksRemaining = stats?.available ?? challengeData?.tasksRemaining ?? 0
  const totalTasks = stats?.total ?? 0
  const completedTasks = totalTasks > 0 ? totalTasks - tasksRemaining : 0
  const completionPercentage =
    challengeData?.completionPercentage ??
    (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0)

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

            {/* Description */}
            <div className="px-6 py-4">
              <p className="text-pretty text-sm text-zinc-700 leading-relaxed dark:text-zinc-300">
                {challengeData?.blurb || challengeData?.description || 'No description available'}
              </p>
            </div>

            {/* Action buttons */}
            <div className="border-zinc-200/50 border-t px-6 py-4 dark:border-slate-700/50">
              <div className="grid grid-cols-2 gap-2">
                <Link to="/challenge/$challengeId" params={{ challengeId }} className="block">
                  <Button variant="outline" size="sm" className="w-full gap-1.5 rounded-full">
                    <Eye className="h-4 w-4" />
                    Browse challenge
                  </Button>
                </Link>
                <Link
                  to="/manage/challenge/$challengeId/edit"
                  params={{ challengeId }}
                  className="block"
                >
                  <Button size="sm" className="w-full gap-1.5 rounded-full">
                    <Pencil className="h-4 w-4" />
                    Edit challenge
                  </Button>
                </Link>
              </div>
            </div>

            {/* Status indicator */}
            {!isLoadingChallenge && challengeData?.id && (
              <div className="border-zinc-200/50 border-t px-6 py-4 dark:border-slate-700/50">
                <ChallengeStatusIndicator
                  challenge={challengeData}
                  challengeId={challengeData.id}
                />
              </div>
            )}

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto border-zinc-200/50 border-t dark:border-slate-700/50">
              <div className="space-y-4 px-6 py-4">
                {/* Stats */}
                {!(isLoadingChallenge || isLoadingStats) && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-600 dark:text-zinc-400">Tasks remaining</span>
                      <span className="font-semibold">
                        {tasksRemaining}
                        {totalTasks > 0 ? (
                          <span className="font-normal text-zinc-500 dark:text-zinc-400">
                            {' '}
                            / {totalTasks}
                          </span>
                        ) : null}
                      </span>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">Completion</span>
                        <span className="font-semibold">{Math.round(completionPercentage)}%</span>
                      </div>
                      <Progress value={completionPercentage} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                        <Calendar className="h-4 w-4 opacity-70" />
                        Created
                      </span>
                      <span className="font-medium">
                        {challengeData?.created
                          ? new Date(challengeData.created).toLocaleDateString()
                          : '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                        <Clock className="h-4 w-4 opacity-70" />
                        Last modified
                      </span>
                      <span className="font-medium">
                        {challengeData?.modified
                          ? new Date(challengeData.modified).toLocaleDateString()
                          : '—'}
                      </span>
                    </div>
                  </>
                )}

                <Separator />

                {/* Settings */}
                {!isLoadingChallenge && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">Status</span>
                      <StatusBadge enabled={challengeData?.enabled || false} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">Difficulty</span>
                      <span
                        className={cn(
                          'font-medium text-sm',
                          getDifficultyColor(challengeData?.difficulty as number)
                        )}
                      >
                        {getDifficultyLabel(challengeData?.difficulty as number)}
                      </span>
                    </div>
                  </>
                )}

                <Separator />

                {/* Description & Instructions */}
                {!isLoadingChallenge && (
                  <>
                    <div>
                      <h3 className="mb-2 font-semibold text-sm text-zinc-700 dark:text-zinc-300">
                        Description
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {challengeData?.description || 'No description available'}
                      </p>
                    </div>
                    {challengeData?.instruction && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="mb-2 font-semibold text-sm text-zinc-700 dark:text-zinc-300">
                            Instructions
                          </h3>
                          <p className="whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
                            {challengeData.instruction}
                          </p>
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* Task Activity */}
                {!isLoadingStats && challengeStats?.actions && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">
                        Task Activity
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Available</span>
                        <span className="font-semibold">
                          {challengeStats.actions.available || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Fixed</span>
                        <span className="font-semibold">{challengeStats.actions.fixed || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          False Positive
                        </span>
                        <span className="font-semibold">
                          {challengeStats.actions.falsePositive || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Skipped</span>
                        <span className="font-semibold">{challengeStats.actions.skipped || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          Already Fixed
                        </span>
                        <span className="font-semibold">
                          {challengeStats.actions.alreadyFixed || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Too Hard</span>
                        <span className="font-semibold">{challengeStats.actions.tooHard || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Disabled</span>
                        <span className="font-semibold">
                          {challengeStats.actions.disabled || 0}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">Total</span>
                        <span className="font-bold text-base">
                          {challengeStats.actions.total || 0}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* Recent Activity */}
                {!isLoadingChallenge && challengeData?.id && (
                  <>
                    <Separator />
                    <ChallengeRecentActivity challengeId={challengeData.id} />
                  </>
                )}

                {/* Task Explorer Sidebar */}
                <Separator />
                <ChallengeTasksExplorerSidebar />
              </div>
            </div>
            <DrawerPortalTarget />
          </div>
        </aside>
      </ResizablePanel>

      <ResizableHandle />

      <ResizablePanel defaultSize={70} minSize={40} style={{ overflow: 'visible' }}>
        <div className="flex h-full min-h-0 min-w-0 flex-col">
          <ChallengeTasksExplorerMain />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
