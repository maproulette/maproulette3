import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, Eye, ListChecks, Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { project } from '@/api/project'
import { AuthGuard } from '@/components/shared'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/Empty'
import { Input } from '@/components/ui/Input'
import { Progress } from '@/components/ui/Progress'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import type { Challenge } from '@/types/Challenge'
import { getDifficultyColor, getDifficultyLabel } from '@/utils/difficultyLevelData'

const ChallengeCard = ({ challenge }: { challenge: Challenge }) => {
  const completionPercentage = challenge.completionPercentage || 0

  return (
    <Link
      to="/manage/challenge/$challengeId"
      params={{ challengeId: challenge.id.toString() }}
      className="block"
    >
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800">
                <ListChecks className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">{challenge.name}</CardTitle>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">ID: {challenge.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {challenge.enabled ? (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  Enabled
                </Badge>
              ) : (
                <Badge variant="secondary">Disabled</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4 line-clamp-2">
            {challenge.blurb || challenge.description || 'No description available'}
          </CardDescription>

          <div className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {challenge.tasksRemaining || 0}
            </span>{' '}
            tasks remaining
          </div>

          <div className="mb-3">
            <Progress
              value={completionPercentage}
              className={cn('[&>*]:transition-all [&>*]:duration-300', {
                '[&>*]:bg-blue-500': completionPercentage >= 90,
                '[&>*]:bg-orange-500': completionPercentage >= 50 && completionPercentage < 90,
                '[&>*]:bg-red-500': completionPercentage < 50,
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className={cn('font-medium text-sm', getDifficultyColor(challenge.difficulty))}>
              {getDifficultyLabel(challenge.difficulty)}
            </span>
            <div className="flex items-center gap-2">
              <Link
                to="/challenges/$challengeId"
                params={{ challengeId: challenge.id.toString() }}
                onClick={(e) => e.stopPropagation()}
              >
                <Button variant="ghost" size="sm" className="gap-1">
                  <Eye className="h-4 w-4" />
                  Browse
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="pointer-events-none">
                Manage
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export const ManageProjectDetail = () => {
  const { projectId } = useParams({ from: '/_app/manage/project/$projectId/' })
  const [searchQuery, setSearchQuery] = useState('')

  const { data: projectData, isLoading: isLoadingProject } = useSuspenseQuery(
    project.getProject(Number(projectId))
  )

  const { data: challenges, isLoading: isLoadingChallenges } = useSuspenseQuery(
    project.getProjectChallenges(Number(projectId))
  )

  const filteredChallenges = challenges?.filter((challenge) =>
    challenge.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AuthGuard>
      <div className="container mx-auto px-4">
        <Link
          to="/manage/projects"
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        <div className="mb-8">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-3">
                <h1 className="font-bold text-3xl text-zinc-900 dark:text-zinc-50">
                  {isLoadingProject ? (
                    <Skeleton className="h-9 w-64" />
                  ) : (
                    projectData?.displayName || projectData?.name
                  )}
                </h1>
                {!isLoadingProject && (
                  <Badge
                    className={cn(
                      projectData?.enabled
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                        : ''
                    )}
                    variant={projectData?.enabled ? 'default' : 'secondary'}
                  >
                    {projectData?.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                )}
              </div>
              <p className="mb-2 text-zinc-600 dark:text-zinc-400">
                {isLoadingProject ? (
                  <Skeleton className="h-5 w-96" />
                ) : (
                  projectData?.description || 'No description available'
                )}
              </p>
              {!isLoadingProject && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Project ID: {projectId}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Link to="/manage/project/$projectId/edit" params={{ projectId }}>
                <Button variant="outline" size="lg">
                  <Pencil className="mr-2 h-5 w-5" />
                  Edit Project
                </Button>
              </Link>
              <Link to="/manage/challenge/new" search={{ projectId: Number(projectId) }}>
                <Button size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Challenge
                </Button>
              </Link>
            </div>
          </div>

          <div className="w-full md:w-96">
            <Input
              type="search"
              placeholder="Search challenges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {!isLoadingProject && !isLoadingChallenges && (
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400">
                  Total Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-bold text-3xl">{challenges?.length || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400">
                  Enabled Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-bold text-3xl">
                  {challenges?.filter((c) => c.enabled).length || 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400">
                  Total Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-bold text-3xl">
                  {challenges?.reduce((sum, c) => sum + (c.tasksRemaining || 0), 0) || 0}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div>
          <h2 className="mb-4 font-semibold text-xl text-zinc-900 dark:text-zinc-50">Challenges</h2>
          <div
            className={cn(
              'grid gap-6',
              filteredChallenges && filteredChallenges.length > 0
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            )}
          >
            {filteredChallenges && filteredChallenges.length > 0 ? (
              filteredChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))
            ) : (
              <Empty className="col-span-full py-16">
                <EmptyMedia>
                  <ListChecks className="h-16 w-16 text-zinc-300 dark:text-zinc-700" />
                </EmptyMedia>
                <EmptyContent>
                  <EmptyTitle>No challenges found</EmptyTitle>
                  <EmptyDescription>Get started by creating your first challenge</EmptyDescription>
                  <Link to="/manage/challenge/new" search={{ projectId: Number(projectId) }}>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Challenge
                    </Button>
                  </Link>
                </EmptyContent>
              </Empty>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
