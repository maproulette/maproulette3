import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  Archive,
  BookOpen,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  FileDown,
  FolderKanban,
  LayoutGrid,
  List,
  Loader2,
  MoreHorizontal,
  Pencil,
  Pin,
  Plus,
  Trash2,
  User,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '@/api'
import { ProjectCard, type ChallengeMeta } from '@/components/shared/ProjectCard'
import { EntityGrid } from '@/components/shared/EntityGrid'
import { GridSkeleton } from '@/components/shared/GridSkeleton'
import { SearchBar } from '@/components/shared/SearchBar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { useAuthContext } from '@/contexts/AuthContext'
import { cn } from '@/utils/utils'
import type { Project } from '@/types/Project'
import { buildPropertiesWithPinnedProjects, getPinnedProjectIds } from '@/utils/pinnedProjects'
import { ProjectsTableView } from './ProjectsTableView'

type ViewMode = 'grid' | 'list'

const PAGE_SIZE = 20

export const ManageProjects = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [loadedPages, setLoadedPages] = useState(1)
  const [onlyEnabled, setOnlyEnabled] = useState(false)
  const [onlyOwned, setOnlyOwned] = useState(false)
  const [onlyShowArchived, setOnlyShowArchived] = useState(false)
  const [onlyShowPinned, setOnlyShowPinned] = useState(false)
  const [deleteProjectConfirm, setDeleteProjectConfirm] = useState<{
    projectId: number
    projectName: string
  } | null>(null)

  // Reset loaded pages when server-side filters change
  useEffect(() => {
    setLoadedPages(1)
  }, [searchQuery, onlyEnabled, onlyOwned])

  const {
    data: projects,
    isLoading,
    isFetching,
  } = api.project.getManagedProjects({
    limit: PAGE_SIZE * loadedPages,
    page: 0,
    searchString: searchQuery,
    onlyEnabled,
    onlyOwned,
  })

  const hasNextPage = (projects?.length ?? 0) >= PAGE_SIZE * loadedPages

  const { user } = useAuthContext()
  const updateSettingsMutation = api.user.useUpdateUserSettings()
  const updateProjectMutation = api.project.useUpdateProject()
  const deleteProjectMutation = api.project.useDeleteProject()
  const pinnedProjectIds = useMemo(() => getPinnedProjectIds(user), [user])

  const handleExportCsv = useCallback(
    (projectId: number) => {
      const name =
        projects?.find((p) => p.id === projectId)?.displayName ??
        projects?.find((p) => p.id === projectId)?.name
      const safeName = name ? name.replace(/[^a-zA-Z0-9-_]/g, '-') : ''
      void api.project.exportProjectTasksCsv(
        projectId,
        safeName ? `project-${safeName}-tasks.csv` : undefined
      )
    },
    [projects]
  )

  const handleArchiveProject = useCallback(
    (projectId: number, isArchived: boolean) => {
      updateProjectMutation.mutate({
        projectId,
        updates: { isArchived: !isArchived } as Partial<Project>,
      })
    },
    [updateProjectMutation]
  )

  const handleDeleteProject = useCallback((projectId: number, projectName: string) => {
    setDeleteProjectConfirm({ projectId, projectName })
  }, [])

  const confirmDeleteProject = useCallback(() => {
    if (!deleteProjectConfirm) return
    deleteProjectMutation.mutate(
      { projectId: deleteProjectConfirm.projectId },
      { onSettled: () => setDeleteProjectConfirm(null) }
    )
  }, [deleteProjectConfirm, deleteProjectMutation])

  const toggleProjectPin = useCallback(
    (projectId: number) => {
      if (!user?.id) return
      const next = pinnedProjectIds.includes(projectId)
        ? pinnedProjectIds.filter((id) => id !== projectId)
        : [...pinnedProjectIds, projectId]
      const properties = buildPropertiesWithPinnedProjects(user, next)
      updateSettingsMutation.mutate({
        userId: user.id,
        settings: user.settings ?? {},
        properties,
      })
    },
    [user, pinnedProjectIds, updateSettingsMutation]
  )

  const projectsSortedByPinned = useMemo(() => {
    if (!projects?.length) return projects ?? []
    const set = new Set(pinnedProjectIds)
    return [...projects].sort((a, b) => {
      const aPinned = a.id != null && set.has(a.id) ? 1 : 0
      const bPinned = b.id != null && set.has(b.id) ? 1 : 0
      return bPinned - aPinned
    })
  }, [projects, pinnedProjectIds])

  const projectsToShow = useMemo(() => {
    const list = projectsSortedByPinned ?? []
    const byArchived = list.filter((p) => (p.isArchived ?? false) === onlyShowArchived)
    if (onlyShowPinned) {
      return byArchived.filter((p) => p.id != null && pinnedProjectIds.includes(p.id))
    }
    return byArchived
  }, [projectsSortedByPinned, onlyShowArchived, onlyShowPinned, pinnedProjectIds])

  const projectIds = useMemo(
    () => projects?.map((p) => p.id).filter((id): id is number => id != null) ?? [],
    [projects]
  )

  const challengesListingQuery = api.challenge.getChallengesListingOptions(projectIds, {
    limit: -1,
    onlyEnabled: false,
  })
  const { data: challengesListing = [] } = useQuery({
    ...challengesListingQuery,
    enabled: projectIds.length > 0,
  })

  const challengeCountsByProjectId = useMemo(() => {
    const map: Record<number, number> = {}
    for (const c of challengesListing) {
      const pid = c.parent
      map[pid] = (map[pid] ?? 0) + 1
    }
    return map
  }, [challengesListing])

  const buildProjectActions = (proj: Project, isPinned: boolean) => {
    const projectId = proj.id
    return (
      <div className="flex items-center gap-1">
        {projectId != null && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.preventDefault()
              toggleProjectPin(projectId)
            }}
            title={isPinned ? 'Unpin project' : 'Pin project'}
            aria-label={isPinned ? 'Unpin project' : 'Pin project'}
          >
            <Pin
              className={cn(
                'h-4 w-4',
                isPinned
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-400'
              )}
            />
          </Button>
        )}
        {projectId != null && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.preventDefault()
              updateProjectMutation.mutate({
                projectId,
                updates: { enabled: !(proj.enabled ?? false) },
              })
            }}
            title={proj.enabled ? 'Make not discoverable' : 'Make discoverable'}
            aria-label={proj.enabled ? 'Make not discoverable' : 'Make discoverable'}
          >
            {proj.enabled ? (
              <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <EyeOff className="h-4 w-4 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-400" />
            )}
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link
                to="/manage/project/$projectId"
                params={{ projectId: String(projectId) }}
                className="flex cursor-pointer items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View project
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/manage/project/$projectId/edit"
                params={{ projectId: String(projectId) }}
                className="flex cursor-pointer items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                Edit project
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/manage/challenge/new"
                search={{ projectId: Number(projectId) }}
                className="flex cursor-pointer items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add challenge
              </Link>
            </DropdownMenuItem>
            {projectId != null && (
              <DropdownMenuItem
                onClick={() => handleExportCsv(projectId)}
                className="flex cursor-pointer items-center gap-2"
              >
                <FileDown className="h-4 w-4" />
                Export CSV
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => {
                const url = `${window.location.origin}/manage/project/${projectId}`
                void navigator.clipboard.writeText(url)
              }}
              className="flex cursor-pointer items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy URL
            </DropdownMenuItem>
            {projectId != null && (
              <DropdownMenuItem
                onClick={() => handleArchiveProject(projectId, proj.isArchived ?? false)}
                className="flex cursor-pointer items-center gap-2"
              >
                <Archive className="h-4 w-4" />
                {proj.isArchived ? 'Unarchive project' : 'Archive project'}
              </DropdownMenuItem>
            )}
            {projectId != null && (
              <DropdownMenuItem
                onClick={() => handleDeleteProject(projectId, proj.displayName || proj.name)}
                className="flex cursor-pointer items-center gap-2 text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
                Delete project
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <aside className="space-y-6 lg:sticky lg:top-4 lg:self-start">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">About Projects</CardTitle>
                <CardDescription>
                  Good project structure improves mapper clarity, QA consistency, and long-term
                  maintenance.
                </CardDescription>
              </CardHeader>
                <CardContent className="space-y-4 text-sm text-zinc-600 leading-relaxed dark:text-zinc-300">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">Define scope early</p>
                  <p>
                    Use a stable naming pattern (region, theme, version) and keep each project
                    focused on one clear objective.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    Publish intentionally
                  </p>
                  <p>
                    Keep projects non-discoverable while iterating. Turn discoverable on only after
                    instructions and QA checks are validated.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">Share ownership</p>
                  <p>
                    Add co-managers before launch so triage, support, and archival responsibilities
                    are covered.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Helpful Docs</CardTitle>
                <CardDescription>Recommended references for project managers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <a
                  href="https://learn.maproulette.org/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-zinc-700 hover:underline dark:text-zinc-200"
                >
                  <BookOpen className="h-4 w-4 text-zinc-500" />
                  Learn Hub
                </a>
                <a
                  href="https://learn.maproulette.org/en-US/documentation/creating-a-challenge/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-zinc-700 hover:underline dark:text-zinc-200"
                >
                  <Users className="h-4 w-4 text-zinc-500" />
                  Challenge Creation
                </a>
                <a
                  href="https://learn.maproulette.org/documentation/project-management/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-zinc-700 hover:underline dark:text-zinc-200"
                >
                  <FolderKanban className="h-4 w-4 text-zinc-500" />
                  Project Management
                </a>
              </CardContent>
            </Card>
          </aside>

          <div className="min-w-0 lg:col-span-3">
            <div className="mb-8">
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search projects..."
                />
                <div className="flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-8 gap-1.5 px-2.5"
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span className="hidden sm:inline">Grid</span>
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-8 gap-1.5 px-2.5"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                    <span className="hidden sm:inline">List</span>
                  </Button>
                </div>
                <div className="flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900">
                  <Button
                    variant={!onlyShowArchived ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-8 gap-1.5 px-2.5"
                    onClick={() => setOnlyShowArchived(false)}
                    title="Show active projects"
                  >
                    Active
                  </Button>
                  <Button
                    variant={onlyShowArchived ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-8 gap-1.5 px-2.5"
                    onClick={() => setOnlyShowArchived(true)}
                    title="Show archived projects"
                  >
                    <Archive className="h-4 w-4" />
                    <span className="hidden sm:inline">Archived</span>
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      'h-8 gap-1.5',
                      onlyEnabled &&
                        'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/30 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-500/30'
                    )}
                    onClick={() => setOnlyEnabled((v) => !v)}
                    title={onlyEnabled ? 'Showing discoverable only' : 'Show all'}
                  >
                    <Eye className="h-4 w-4" />
                    Discoverable
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      'h-8 gap-1.5',
                      onlyOwned &&
                        'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/30 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-500/30'
                    )}
                    onClick={() => setOnlyOwned((v) => !v)}
                    title={onlyOwned ? 'Showing owned only' : 'Show all'}
                  >
                    <User className="h-4 w-4" />
                    Owned
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      'h-8 gap-1.5',
                      onlyShowPinned &&
                        'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/30 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-500/30'
                    )}
                    onClick={() => setOnlyShowPinned((v) => !v)}
                    title={onlyShowPinned ? 'Showing pinned only' : 'Show all'}
                  >
                    <Pin className="h-4 w-4" />
                    Pinned
                  </Button>
                </div>
                <Link to="/manage/project/new">
                  <Button size="lg">
                    <Plus className="mr-2 h-5 w-5" />
                    Create New Project
                  </Button>
                </Link>
              </div>
            </div>

            {/* Projects: List or Grid */}
            {isLoading ? (
              <GridSkeleton />
            ) : viewMode === 'list' ? (
              (projectsToShow?.length ?? 0) > 0 ? (
                <ProjectsTableView
                  projects={projectsToShow}
                  challengeCountsByProjectId={challengeCountsByProjectId}
                  pinnedProjectIds={pinnedProjectIds}
                  onTogglePin={toggleProjectPin}
                  onExportCsv={handleExportCsv}
                  onArchiveProject={handleArchiveProject}
                  onDeleteProject={handleDeleteProject}
                />
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 py-16 dark:border-zinc-800 dark:bg-zinc-900/50">
                  <FolderKanban className="mb-4 h-12 w-12 text-zinc-400 dark:text-zinc-500" />
                  <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">
                    No projects found
                  </h3>
                  <p className="mb-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
                    Get started by creating your first project
                  </p>
                  <Link to="/manage/project/new">
                    <Button>Create Project</Button>
                  </Link>
                </div>
              )
            ) : (
              <div
                className={cn(
                  'grid gap-6',
                  projectsToShow && projectsToShow.length > 0
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1'
                )}
              >
                <EntityGrid
                  items={projectsToShow}
                  renderItem={(proj) => {
                    const projectId = proj.id
                    const isPinned = projectId != null && pinnedProjectIds.includes(projectId)
                    const count =
                      projectId != null ? (challengeCountsByProjectId[projectId] ?? 0) : 0
                    const challengeMeta: ChallengeMeta = {
                      totalChallenges: count,
                      pinned: 0,
                      completed: 0,
                    }
                    return (
                      <ProjectCard
                        project={proj}
                        challengeMeta={challengeMeta}
                        linkTo="/manage/project/$projectId"
                        linkParams={{ projectId: String(projectId) }}
                        actions={buildProjectActions(proj, isPinned)}
                      />
                    )
                  }}
                  getItemKey={(proj) => proj.id ?? crypto.randomUUID()}
                  emptyState={{
                    icon: FolderKanban,
                    title: 'No projects found',
                    description: 'Get started by creating your first project',
                    actionLabel: 'Create Project',
                    actionTo: '/manage/project/new',
                  }}
                />
              </div>
            )}

            {/* Load More / End of list */}
            {!isLoading &&
              (projectsToShow?.length ?? 0) > 0 &&
              (hasNextPage ? (
                <div className="flex justify-center p-4">
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setLoadedPages((p) => p + 1)}
                    disabled={isFetching}
                  >
                    {isFetching ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              ) : (
                <div className="mt-4 flex flex-col items-center gap-2 border-zinc-200 border-t p-6 text-center dark:border-zinc-700">
                  <CheckCircle2 className="h-5 w-5 text-zinc-400 dark:text-slate-500" />
                  <p className="font-medium text-sm text-zinc-600 dark:text-slate-400">
                    You've reached the end of the list
                  </p>
                </div>
              ))}
          </div>
        </div>

        <AlertDialog
          open={!!deleteProjectConfirm}
          onOpenChange={(open) => !open && setDeleteProjectConfirm(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete project?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete the project &quot;{deleteProjectConfirm?.projectName}&quot; and all
                its challenges and tasks. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteProject}
                className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  )
}
