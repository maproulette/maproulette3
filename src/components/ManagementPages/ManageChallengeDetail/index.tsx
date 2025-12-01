import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'
import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Pencil,
  Settings,
  TrendingUp,
  Users,
} from 'lucide-react'
import { api } from '@/api'
import { AuthGuard } from '@/components/shared/AuthGuard'
import { BackLink } from '@/components/shared/BackLink'
import { StatCard } from '@/components/shared/StatCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { Separator } from '@/components/ui/Separator'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import { getDifficultyColor, getDifficultyLabel } from '@/utils/difficultyLevelData'

export const ManageChallengeDetail = () => {
  const { challengeId } = useParams({ from: '/_app/manage/challenge/$challengeId/' })

  const { data: challengeData, isLoading: isLoadingChallenge } = useSuspenseQuery(
    api.challenge.getChallenge(Number(challengeId))
  )

  const { data, isLoading: isLoadingStats } = useSuspenseQuery(
    api.challenge.getChallengeStats(Number(challengeId))
  )
  const challengeStats = data[0]
  const completionPercentage = challengeData?.completionPercentage || 0

  return (
    <AuthGuard>
      <div className="container mx-auto px-4">
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
                    className={cn('font-medium', getDifficultyColor(challengeData?.difficulty))}
                  >
                    {getDifficultyLabel(challengeData?.difficulty)}
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
        </div>

        {!isLoadingChallenge && (
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Tasks Remaining"
              value={challengeData?.tasksRemaining || 0}
              subtitle={`of ${(challengeData?.tasksRemaining || 0) + (challengeStats?.actions?.total || 0)} total`}
              icon={CheckCircle2}
            />

            <StatCard
              title="Completion"
              value={`${Math.round(completionPercentage)}%`}
              icon={TrendingUp}
            >
              <Progress value={completionPercentage} className="mt-2" />
            </StatCard>

            <StatCard
              title="Created"
              value={
                challengeData?.created
                  ? new Date(challengeData.created).toLocaleDateString()
                  : 'N/A'
              }
              icon={Calendar}
            />

            <StatCard
              title="Last Modified"
              value={
                challengeData?.modified
                  ? new Date(challengeData.modified).toLocaleDateString()
                  : 'N/A'
              }
              icon={Clock}
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="mb-6">
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
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">Total</span>
                      <span className="font-bold text-lg">{challengeStats.actions.total || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card className="mb-6">
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
                          getDifficultyColor(challengeData?.difficulty)
                        )}
                      >
                        {getDifficultyLabel(challengeData?.difficulty)}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/challenge/$challengeId" params={{ challengeId }} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="mr-2 h-4 w-4" />
                    Browse Challenge
                  </Button>
                </Link>
                <Link
                  to="/manage/challenge/$challengeId/edit"
                  params={{ challengeId }}
                  className="block"
                >
                  <Button variant="outline" className="w-full justify-start">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Challenge
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
