import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ListChecks, Plus } from 'lucide-react'
import { useState } from 'react'
import { api } from '@/api'
import { AuthGuard } from '@/components/shared/AuthGuard'
import { BackLink } from '@/components/shared/BackLink'
import { EntityGrid } from '@/components/shared/EntityGrid'
import { GridSkeleton } from '@/components/shared/GridSkeleton'
import { SearchBar } from '@/components/shared/SearchBar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
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
              <StatusBadge enabled={challenge.enabled || false} />
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

          {/* Difficulty Badge */}
          <div className="flex items-center justify-start">
            <span className={cn('font-medium text-sm', getDifficultyColor(challenge.difficulty))}>
              {getDifficultyLabel(challenge.difficulty)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export const ManageChallenges = () => {
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch all challenges the user can manage
  const { data: challenges, isLoading } = useSuspenseQuery(
    api.challenge.exploreChallenges({
      limit: 100,
    })
  )

  const filteredChallenges = challenges?.filter((challenge) =>
    challenge.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AuthGuard>
      <div className="mx-auto px-4">
        <BackLink to="/manage">Back to Manage</BackLink>

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
            <Link to="/manage/challenge/new">
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Create New Challenge
              </Button>
            </Link>
          </div>

          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search challenges..."
          />
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
            <GridSkeleton />
          ) : (
            <EntityGrid
              items={filteredChallenges || []}
              renderItem={(challenge) => <ChallengeCard challenge={challenge} />}
              getItemKey={(challenge) => challenge.id ?? crypto.randomUUID()}
              emptyState={{
                icon: ListChecks,
                title: 'No challenges found',
                description: 'Create a project first, then add challenges to it',
                actionLabel: 'Go to Projects',
                actionTo: '/manage/projects',
              }}
            />
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
