import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ListChecks, Plus, Settings } from 'lucide-react'
import { useState } from 'react'
import { challenge as challengeApi } from '@/api/challenge'
import { AuthGuard } from '@/components/shared'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import type { Challenge } from '@/types/Challenge'
import { getDifficultyColor, getDifficultyLabel } from '@/utils/difficultyLevelData'

const ChallengeCard = ({ challenge }: { challenge: Challenge }) => {
  const completionPercentage = challenge.completionPercentage || 0
  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-orange-500'
    return 'bg-red-500'
  }
  const progressBarColor = getProgressBarColor(completionPercentage)

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

          {/* Tasks Remaining */}
          <div className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {challenge.tasksRemaining || 0}
            </span>{' '}
            tasks remaining
          </div>

          {/* Progress Bar */}
          <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className={cn('h-full transition-all duration-300', progressBarColor)}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          {/* Difficulty Badge */}
          <div className="flex items-center justify-between">
            <span className={cn('font-medium text-sm', getDifficultyColor(challenge.difficulty))}>
              {getDifficultyLabel(challenge.difficulty)}
            </span>
            <Button variant="outline" size="sm" className="pointer-events-none">
              <Settings className="mr-2 h-4 w-4" />
              Manage
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

const ChallengesGrid = ({ challenges }: { challenges: Challenge[] }) => {
  if (challenges.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
        <ListChecks className="mb-4 h-16 w-16 text-zinc-300 dark:text-zinc-700" />
        <h3 className="mb-2 font-semibold text-lg text-zinc-900 dark:text-zinc-100">
          No challenges found
        </h3>
        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          Create a project first, then add challenges to it
        </p>
        <Link to="/manage/projects">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Go to Projects
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      {challenges.map((challenge) => (
        <ChallengeCard key={challenge.id} challenge={challenge} />
      ))}
    </>
  )
}

const ChallengesLoadingSkeleton = () => {
  const skeletonKeys = Array.from(
    { length: 6 },
    (_, i) => `skeleton-challenge-${crypto.randomUUID()}-${i}`
  )
  return (
    <>
      {skeletonKeys.map((key) => (
        <Card key={key}>
          <CardHeader>
            <div className="flex items-start gap-3">
              <Skeleton className="h-12 w-12 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-4 h-12 w-full" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}

export const ManageChallenges = () => {
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch all challenges the user can manage
  const { data: challenges, isLoading } = useSuspenseQuery(
    challengeApi.exploreChallenges({
      limit: 100,
    })
  )

  const filteredChallenges = challenges?.filter((challenge) =>
    challenge.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AuthGuard>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 font-bold text-3xl text-zinc-900 dark:text-zinc-50">
                All Challenges
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Browse and manage all your MapRoulette challenges
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-96">
            <Input
              type="search"
              placeholder="Search challenges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Challenges Grid */}
        <div
          className={cn(
            'grid gap-6',
            filteredChallenges && filteredChallenges.length > 0
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          )}
        >
          {isLoading ? (
            <ChallengesLoadingSkeleton />
          ) : (
            <ChallengesGrid challenges={filteredChallenges || []} />
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
