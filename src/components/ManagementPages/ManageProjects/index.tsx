import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { FolderKanban, Plus, Settings } from 'lucide-react'
import { useState } from 'react'
import { project } from '@/api/project'
import { AuthGuard } from '@/components/shared'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
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
              {project.enabled ? (
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
            {project.description || 'No description available'}
          </CardDescription>
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-semibold">0</span> challenges
            </div>
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

const ProjectsGrid = ({ projects }: { projects: Project[] }) => {
  if (projects.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
        <FolderKanban className="mb-4 h-16 w-16 text-zinc-300 dark:text-zinc-700" />
        <h3 className="mb-2 font-semibold text-lg text-zinc-900 dark:text-zinc-100">
          No projects found
        </h3>
        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          Get started by creating your first project
        </p>
        <Link to="/manage/project/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      {projects.map((proj) => (
        <ProjectCard key={proj.id} project={proj} />
      ))}
    </>
  )
}

const ProjectsLoadingSkeleton = () => {
  const skeletonKeys = Array.from(
    { length: 6 },
    (_, i) => `skeleton-project-${crypto.randomUUID()}-${i}`
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

          {/* Search Bar */}
          <div className="w-full md:w-96">
            <Input
              type="search"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
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
          {isLoading ? <ProjectsLoadingSkeleton /> : <ProjectsGrid projects={projects || []} />}
        </div>
      </div>
    </AuthGuard>
  )
}
