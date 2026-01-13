import { ListChecks, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { SearchBar } from '@/components/shared/SearchBar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { BackLink } from '@/components/ui/BackLink'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { cn } from '@/lib/utils'
import { getDifficultyColor, getDifficultyLabel } from '@/utils/difficultyLevelData'

// Mock data - replace with actual API calls
const mockChallenges = [
  {
    id: 1,
    name: 'Validate Highway Exits',
    blurb: 'Check and validate highway exit information',
    description: 'Review highway exit data for accuracy and completeness',
    projectName: 'Highway Mapping',
    owner: 'John Doe',
    enabled: true,
    difficulty: 2,
    tasksRemaining: 234,
    completionPercentage: 67,
  },
  {
    id: 2,
    name: 'Building Heights',
    blurb: 'Add height information to buildings',
    description: 'Add missing height data to building footprints',
    projectName: 'Building Footprints',
    owner: 'Jane Smith',
    enabled: true,
    difficulty: 1,
    tasksRemaining: 512,
    completionPercentage: 43,
  },
  {
    id: 3,
    name: 'Park Amenities',
    blurb: 'Map amenities in parks',
    description: 'Identify and map benches, tables, and other park amenities',
    projectName: 'Parks and Recreation',
    owner: 'Bob Johnson',
    enabled: false,
    difficulty: 3,
    tasksRemaining: 89,
    completionPercentage: 78,
  },
]

const ChallengeCard = ({ challenge }: { challenge: (typeof mockChallenges)[0] }) => {
  const completionPercentage = challenge.completionPercentage || 0

  return (
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
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Project: {challenge.projectName}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Owner: {challenge.owner}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge enabled={challenge.enabled} />
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
        <div className="mb-4 flex items-center justify-start">
          <span className={cn('font-medium text-sm', getDifficultyColor(challenge.difficulty))}>
            {getDifficultyLabel(challenge.difficulty)}
          </span>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            View
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export const SuperAdminChallenges = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredChallenges = mockChallenges.filter(
    (challenge) =>
      challenge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.blurb?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="mx-auto px-4">
      <BackLink to="/super-admin">Back to Super Admin</BackLink>

      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <ListChecks className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <h1 className="font-bold text-3xl text-zinc-900 dark:text-zinc-50">All Challenges</h1>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400">
              Browse and manage all challenges across the platform
            </p>
          </div>
          <Button size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Create New Challenge
          </Button>
        </div>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search challenges..."
        />
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Challenges</CardDescription>
            <CardTitle className="text-3xl">1,892</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">+15% from last month</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Challenges</CardDescription>
            <CardTitle className="text-3xl">1,345</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">71% of total</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Tasks</CardDescription>
            <CardTitle className="text-3xl">45.2K</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">Across all challenges</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg. Completion</CardDescription>
            <CardTitle className="text-3xl">58%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">Platform average</div>
          </CardContent>
        </Card>
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
        {filteredChallenges.length > 0 ? (
          filteredChallenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Search className="mb-4 h-12 w-12 text-zinc-400" />
            <h3 className="mb-2 font-semibold text-lg text-zinc-900 dark:text-zinc-50">
              No challenges found
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Try adjusting your search query
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
