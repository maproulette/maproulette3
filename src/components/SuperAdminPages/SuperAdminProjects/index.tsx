import { FolderKanban, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { SearchBar } from '@/components/shared/SearchBar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { BackLink } from '@/components/ui/BackLink'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/components/utils'

// Mock data - replace with actual API calls
const mockProjects = [
  {
    id: 1,
    name: 'Highway Mapping',
    displayName: 'Highway Mapping Project',
    description: 'Map and validate highway data across the country',
    owner: 'John Doe',
    enabled: true,
    challengeCount: 45,
    completionRate: 67,
  },
  {
    id: 2,
    name: 'Building Footprints',
    displayName: 'Building Footprint Validation',
    description: 'Validate building footprints in urban areas',
    owner: 'Jane Smith',
    enabled: true,
    challengeCount: 32,
    completionRate: 82,
  },
  {
    id: 3,
    name: 'Parks and Recreation',
    displayName: 'Parks Mapping',
    description: 'Map parks, playgrounds, and recreational facilities',
    owner: 'Bob Johnson',
    enabled: false,
    challengeCount: 18,
    completionRate: 45,
  },
]

const ProjectCard = ({ project }: { project: (typeof mockProjects)[0] }) => {
  return (
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
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Owner: {project.owner}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge enabled={project.enabled} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4 line-clamp-2">
          {project.description || 'No description available'}
        </CardDescription>
        <div className="flex items-center justify-between">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold">{project.challengeCount}</span> challenges
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold">{project.completionRate}%</span> complete
          </div>
        </div>
        <div className="mt-4 flex gap-2">
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

export const SuperAdminProjects = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProjects = mockProjects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="mx-auto px-4">
      <BackLink to="/super-admin">Back to Super Admin</BackLink>

      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <FolderKanban className="h-8 w-8 text-green-600 dark:text-green-400" />
              <h1 className="font-bold text-3xl text-zinc-900 dark:text-zinc-50">All Projects</h1>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400">
              View and manage all projects across the platform
            </p>
          </div>
          <Button size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Create New Project
          </Button>
        </div>

        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search projects..." />
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Projects</CardDescription>
            <CardTitle className="text-3xl">256</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">+8% from last month</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Projects</CardDescription>
            <CardTitle className="text-3xl">187</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">73% of total</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Challenges</CardDescription>
            <CardTitle className="text-3xl">1,892</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">Across all projects</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg. Completion</CardDescription>
            <CardTitle className="text-3xl">64%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">Platform average</div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      <div
        className={cn(
          'grid gap-6',
          filteredProjects && filteredProjects.length > 0
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1'
        )}
      >
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => <ProjectCard key={project.id} project={project} />)
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Search className="mb-4 h-12 w-12 text-zinc-400" />
            <h3 className="mb-2 font-semibold text-lg text-zinc-900 dark:text-zinc-50">
              No projects found
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
