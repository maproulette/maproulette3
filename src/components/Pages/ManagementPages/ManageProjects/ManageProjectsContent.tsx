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
  Loader2,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Pin,
  Plus,
  Trash2,
  User,
  Users,
} from 'lucide-react'
import { ClearManageFiltersButton } from '@/components/shared/ClearManageFiltersButton'
import { EntityGrid } from '@/components/shared/EntityGrid'
import { FilterToggle } from '@/components/shared/FilterToggle'
import { type ChallengeMeta, ProjectCard } from '@/components/shared/ProjectCard'
import { SearchBar } from '@/components/shared/SearchBar'
import { ViewModeToggle } from '@/components/shared/ViewModeToggle'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { useSetHeaderActionsContext } from '@/contexts/HeaderActionsContext'
import { cn } from '@/lib/utils'
import type { Project } from '@/types/Project'
import { useManageProjectsContext } from './ManageProjectsContext'
import { ProjectsTableView } from './ProjectsTableView'

export const ManageProjectsContent = () => {
  const {
    projectsToShow,
    isLoading,
    isFetching,
    hasNextPage,
    searchQuery,
    setSearchQuery,
    onlyEnabled,
    setOnlyEnabled,
    onlyOwned,
    setOnlyOwned,
    onlyShowArchived,
    setOnlyShowArchived,
    onlyShowPinned,
    setOnlyShowPinned,
    viewMode,
    setViewMode,
    showPanel,
    setShowPanel,
    loadMore,
    pinnedProjectIds,
    toggleProjectPin,
    challengeCountsByProjectId,
    updateProject,
    handleExportCsv,
    handleArchiveProject,
    deleteProjectConfirm,
    handleDeleteProject,
    confirmDeleteProject,
    setDeleteProjectConfirm,
  } = useManageProjectsContext()

  useSetHeaderActionsContext(
    <Link to="/manage/project/new">
      <Button size="sm" className="gap-1.5 rounded-full">
        <Plus className="h-4 w-4" />
        Create Project
      </Button>
    </Link>
  )

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
              updateProject(projectId, { enabled: !(proj.enabled ?? false) })
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
    <div className="h-full">
      <div className={cn('grid h-full grid-cols-1 gap-8', showPanel ? 'lg:grid-cols-4' : '')}>
        {showPanel && (
          <aside className="h-full min-h-0 overflow-hidden">
            <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200/40 bg-white shadow-sm dark:border-slate-700/40 dark:bg-slate-800">
              <div className="flex items-start justify-between px-6 pt-6 pb-2">
                <div className="space-y-2.5">
                  <h2 className="font-bold text-2xl text-zinc-900 leading-tight tracking-tight dark:text-zinc-50">
                    About Projects
                  </h2>
                  <p className="text-pretty text-sm text-zinc-600 leading-relaxed dark:text-zinc-400">
                    Good project structure improves mapper clarity, QA consistency, and long-term
                    maintenance.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => setShowPanel(false)}
                  title="Hide panel"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto border-zinc-200/50 border-t px-6 py-4 dark:border-slate-700/50">
                <div className="space-y-4 text-sm text-zinc-600 leading-relaxed dark:text-zinc-300">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      Define scope early
                    </p>
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
                      Keep projects non-discoverable while iterating. Turn discoverable on only
                      after instructions and QA checks are validated.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">Share ownership</p>
                    <p>
                      Add co-managers before launch so triage, support, and archival
                      responsibilities are covered.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-auto border-zinc-200/50 border-t bg-zinc-50/50 px-6 py-4 dark:border-slate-700/50 dark:bg-slate-800/50">
                <p className="mb-1 font-medium text-sm text-zinc-700 dark:text-zinc-300">
                  Helpful Docs
                </p>
                <div className="space-y-2">
                  <a
                    href="https://learn.maproulette.org/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs text-zinc-700 hover:underline dark:text-zinc-200"
                  >
                    <BookOpen className="h-3.5 w-3.5 text-zinc-500" />
                    Learn Hub
                  </a>
                  <a
                    href="https://learn.maproulette.org/en-US/documentation/creating-a-challenge/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs text-zinc-700 hover:underline dark:text-zinc-200"
                  >
                    <Users className="h-3.5 w-3.5 text-zinc-500" />
                    Challenge Creation
                  </a>
                  <a
                    href="https://learn.maproulette.org/documentation/project-management/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs text-zinc-700 hover:underline dark:text-zinc-200"
                  >
                    <FolderKanban className="h-3.5 w-3.5 text-zinc-500" />
                    Project Management
                  </a>
                </div>
              </div>
            </div>
          </aside>
        )}

        <div
          className={cn('flex h-full min-h-0 min-w-0 flex-col', showPanel ? 'lg:col-span-3' : '')}
        >
          <div className="shrink-0 pb-4">
            <div className="flex items-center gap-3 overflow-x-auto">
              {!showPanel && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => setShowPanel(true)}
                  title="Show panel"
                >
                  <PanelLeftOpen className="h-4 w-4" />
                </Button>
              )}
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search projects..."
              />
              <FilterToggle
                label="Discoverable"
                icon={Eye}
                checked={onlyEnabled}
                onCheckedChange={setOnlyEnabled}
              />
              <FilterToggle
                label="Owned"
                icon={User}
                checked={onlyOwned}
                onCheckedChange={setOnlyOwned}
              />
              <FilterToggle
                label="Pinned"
                icon={Pin}
                checked={onlyShowPinned}
                onCheckedChange={setOnlyShowPinned}
              />
              <FilterToggle
                label="Archived"
                icon={Archive}
                checked={onlyShowArchived}
                onCheckedChange={setOnlyShowArchived}
              />
              <ClearManageFiltersButton
                hasActiveFilters={onlyEnabled || onlyOwned || onlyShowPinned || onlyShowArchived}
                onClear={() => {
                  setOnlyEnabled(false)
                  setOnlyOwned(false)
                  setOnlyShowPinned(false)
                  setOnlyShowArchived(false)
                }}
              />
              <div className="ml-auto">
                <ViewModeToggle value={viewMode} onValueChange={setViewMode} />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Projects: List or Grid */}
            {isLoading ? null : viewMode === 'list' ? (
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
                    onClick={loadMore}
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
