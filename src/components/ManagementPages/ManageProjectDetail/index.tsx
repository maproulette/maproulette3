import { Link, useParams } from '@tanstack/react-router'
import { ListChecks, Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { api } from '@/api'
import { AuthGuard } from '@/components/shared/AuthGuard'
import { ChallengeCard } from '@/components/shared/ChallengeCard'
import { EntityGrid } from '@/components/shared/EntityGrid'
import { SearchBar } from '@/components/shared/SearchBar'
import { StatCard } from '@/components/shared/StatCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { BackLink } from '@/components/ui/BackLink'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

export const ManageProjectDetail = () => {
  const { projectId } = useParams({ from: '/_app/manage/project/$projectId/' })
  const [searchQuery, setSearchQuery] = useState('')

  const { data: projectData, isLoading: isLoadingProject } = api.project.getProject(
    Number(projectId)
  )

  const { data: challenges, isLoading: isLoadingChallenges } = api.project.getProjectChallenges(
    Number(projectId)
  )

  const filteredChallenges = challenges?.filter((challenge) =>
    challenge.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AuthGuard>
      <div className="mx-auto px-4">
        <BackLink to="/manage/projects">Back to Projects</BackLink>

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
                {!isLoadingProject && <StatusBadge enabled={projectData?.enabled || false} />}
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

          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search challenges..."
          />
        </div>

        {!isLoadingProject && !isLoadingChallenges && (
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <StatCard title="Total Challenges" value={challenges?.length || 0} />
            <StatCard
              title="Enabled Challenges"
              value={challenges?.filter((c) => c.enabled).length || 0}
            />
            <StatCard
              title="Total Tasks"
              value={challenges?.reduce((sum, c) => sum + (c.tasksRemaining || 0), 0) || 0}
            />
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
            <EntityGrid
              items={filteredChallenges || []}
              renderItem={(challenge) => <ChallengeCard challenge={challenge} />}
              getItemKey={(challenge) => challenge.id ?? crypto.randomUUID()}
              emptyState={{
                icon: ListChecks,
                title: 'No challenges found',
                description: 'Get started by creating your first challenge',
                actionLabel: 'Create Challenge',
                actionTo: '/manage/challenge/new',
                actionSearch: { projectId: Number(projectId) },
              }}
            />
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
