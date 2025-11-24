import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { FolderKanban, Plus } from 'lucide-react'
import { useState } from 'react'
import { project } from '@/api/project'
import {
  AuthGuard,
  BackLink,
  EntityGrid,
  GridSkeleton,
  SearchBar,
  StatusBadge,
} from '@/components/shared'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import type { Project } from '@/types/Project'

const ProjectCard = ({ project }: { project: Project }) => {
  return (
    <Link
      to="/manage/project/$projectId"
      params={{ projectId: String(project.id) }}
      className="block"
    >
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800">
                <FolderKanban className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
              </div>
              <div>
                <CardTitle className="text-lg">{project.displayName || project.name}</CardTitle>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">ID: {project.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge enabled={project.enabled || false} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4 line-clamp-2">
            {project.description || 'No description available'}
          </CardDescription>
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-semibold">0</span> challenges
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}


export const ManageProjects = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const { data: projects, isLoading } = useSuspenseQuery(
    project.getManagedProjects({
      limit: 100,
      searchString: searchQuery,
    })
  )

  return (
    <AuthGuard>
      <div className="container mx-auto px-4">
        <BackLink to="/manage">Back to Manage</BackLink>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 font-bold text-3xl text-zinc-900 dark:text-zinc-50">
                Create and Manage Projects
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                View and manage all your MapRoulette projects
              </p>
            </div>
            <Link to="/manage/project/new">
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Create New Project
              </Button>
            </Link>
          </div>

          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search projects..."
          />
        </div>

        {/* Projects Grid */}
        <div
          className={cn(
            'grid gap-6',
            projects && projects.length > 0
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          )}
        >
          {isLoading ? (
            <GridSkeleton />
          ) : (
            <EntityGrid
              items={projects || []}
              renderItem={(proj) => <ProjectCard project={proj} />}
              getItemKey={(proj) => proj.id ?? crypto.randomUUID()}
              emptyState={{
                icon: FolderKanban,
                title: 'No projects found',
                description: 'Get started by creating your first project',
                actionLabel: 'Create Project',
                actionTo: '/manage/project/new',
              }}
            />
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
