import { Link, useParams } from '@tanstack/react-router'
import { Calendar, Clock, Eye, FileText, Pencil, Settings, Users } from 'lucide-react'
import { api } from '@/api'
import { ChallengeStatusIndicator } from '@/components/shared/ChallengeStatusIndicator'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { BackLink } from '@/components/ui/BackLink'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { Separator } from '@/components/ui/Separator'
import { Skeleton } from '@/components/ui/Skeleton'
import { useSetPageTitle } from '@/contexts/PageTitleContext'
import { cn } from '@/utils/utils'
import { getDifficultyColor, getDifficultyLabel } from '@/utils/difficultyLevelData'
import { ChallengeRecentActivity } from './ChallengeRecentActivity'
import {
  ChallengeTasksExplorerMain,
  ChallengeTasksExplorerProvider,
  ChallengeTasksExplorerSidebar,
} from './ChallengeTasksExplorer'

export const ManageChallengeDetail = () => {
  const { challengeId } = useParams({ from: '/_app/manage/challenge/$challengeId/' })

  const { data: challengeData, isLoading: isLoadingChallenge } = api.challenge.getChallenge(
    Number(challengeId)
  )

  useSetPageTitle(challengeData?.name ?? null)

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
    <div className="mx-auto max-w-7xl px-4 pb-10">
        <BackLink to="/manage/challenges">Back to Challenges</BackLink>

        <div className="mb-8">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-3">
                <h1 className="font-bold text-3xl text-zinc-900 dark:text-zinc-50">
                  {isLoadingChallenge ? <Skeleton className="h-9 w-96" /> : challengeData?.name}
                </h1>
                {!isLoadingChallenge && (
                  <>
                    <StatusBadge enabled={challengeData?.enabled || false} />
                    {challengeData?.featured && (
                      <Badge className="border-orange-300 bg-white text-orange-600 dark:border-orange-700 dark:bg-zinc-950 dark:text-orange-400">
                        FEATURED
                      </Badge>
                    )}
                  </>
                )}
              </div>
              <p className="mb-2 text-zinc-600 dark:text-zinc-400">
                {isLoadingChallenge ? (
                  <Skeleton className="h-5 w-full max-w-2xl" />
                ) : (
                  challengeData?.blurb || challengeData?.description || 'No description available'
                )}
              </p>
              {!isLoadingChallenge && (
                <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                  <span>Challenge ID: {challengeId}</span>
                  <span>•</span>
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
            <div className="flex items-center gap-3">
              <Link to="/challenge/$challengeId" params={{ challengeId }}>
                <Button variant="outline" size="lg">
                  <Eye className="mr-2 h-5 w-5" />
                  Browse Challenge
                </Button>
              </Link>
              <Link to="/manage/challenge/$challengeId/edit" params={{ challengeId }}>
                <Button size="lg">
                  <Pencil className="mr-2 h-5 w-5" />
                  Edit Challenge
                </Button>
              </Link>
            </div>
          </div>

          {!isLoadingChallenge && challengeData?.id && (
            <ChallengeStatusIndicator challenge={challengeData} challengeId={challengeData.id} />
          )}
        </div>

        <ChallengeTasksExplorerProvider
          challengeId={Number(challengeId)}
          enabled={!isLoadingChallenge && !!challengeData?.id}
        >
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <aside className="space-y-6 lg:sticky lg:top-4 lg:self-start">
              <Card>
                <CardHeader>
                  <CardTitle>General information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingChallenge || isLoadingStats ? (
                    <>
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </>
                  ) : (
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
                  <ChallengeTasksExplorerSidebar />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Challenge Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingChallenge ? (
                    <>
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Status</span>
                        <StatusBadge enabled={challengeData?.enabled || false} />
                      </div>
                      <Separator />
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Challenge Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingChallenge ? (
                    <>
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </>
                  ) : (
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
                </CardContent>
              </Card>

              {!isLoadingStats && challengeStats?.actions && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Task Activity
                    </CardTitle>
                    <CardDescription>Breakdown of task statuses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
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
                        <span className="font-bold text-lg">
                          {challengeStats.actions.total || 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!isLoadingChallenge && challengeData?.id && (
                <ChallengeRecentActivity challengeId={challengeData.id} />
              )}
            </aside>

            <div className="min-w-0 lg:col-span-2">
              <ChallengeTasksExplorerMain />
            </div>
          </div>
        </ChallengeTasksExplorerProvider>
    </div>
  )
}
