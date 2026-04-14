import { Link } from '@tanstack/react-router'
import {
  Archive,
  ArrowRightLeft,
  BookOpen,
  Copy,
  Eye,
  EyeOff,
  Hammer,
  ListChecks,
  MoreHorizontal,
  Pencil,
  Pin,
  Play,
  Plus,
  Trash2,
} from 'lucide-react'
import { CloneChallengeModal } from '@/components/Pages/BrowsedChallengePage/ChallengePanel/ChallengeModals/CloneChallengeModal'
import { ChallengeCard } from '@/components/shared/ChallengeCard'
import { ClearManageFiltersButton } from '@/components/shared/ClearManageFiltersButton'
import { EntityGrid } from '@/components/shared/EntityGrid'
import { FilterToggle } from '@/components/shared/FilterToggle'
import { SearchBar } from '@/components/shared/SearchBar'
import { StatusBadge } from '@/components/shared/StatusBadge'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/Resizable'
import { Separator } from '@/components/ui/Separator'
import { useMoveChallengeContext } from '@/contexts/MoveChallengeContext'
import { cn } from '@/lib/utils'
import type { Challenge } from '@/types/Challenge'
import { MoveChallengeModal } from '../MoveChallengeModal'
import { ChallengesTableView } from './ChallengesTableView'
import { useManageProjectDetailContext } from './ManageProjectDetailContext'

export const ManageProjectDetailContent = () => {
  const {
    projectId,
    project,
    projectData,
    isLoadingProject,
    isLoadingChallenges,
    filteredChallenges,
    challengeSummary,
    pinnedChallengeIds,
    searchQuery,
    setSearchQuery,
    onlyDiscoverable,
    setOnlyDiscoverable,
    onlyArchived,
    setOnlyArchived,
    onlyPinned,
    setOnlyPinned,
    viewMode,
    setViewMode,
    cloneModalChallenge,
    setCloneModalChallenge,
    deleteChallengeId,
    setDeleteChallengeId,
    deleteProjectConfirm,
    setDeleteProjectConfirm,
    handleArchiveProject,
    handleToggleEnabled,
    confirmDeleteProject,
    confirmDeleteChallenge,
    toggleChallengePin,
    toggleChallengeEnabled,
    archiveChallenge,
    rebuildChallenge,
  } = useManageProjectDetailContext()
  const { openMoveModal } = useMoveChallengeContext()

  const buildChallengeActions = (challenge: Challenge, isPinned: boolean) => {
    const canStart = (challenge.tasksRemaining ?? 0) > 0
    return (
      <div className="flex items-center gap-1">
        {challenge.id != null && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.preventDefault()
              toggleChallengePin(challenge.id)
            }}
            title={isPinned ? 'Unpin challenge' : 'Pin challenge'}
            aria-label={isPinned ? 'Unpin challenge' : 'Pin challenge'}
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
        {challenge.id != null && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.preventDefault()
              toggleChallengeEnabled(challenge)
            }}
            title={challenge.enabled ? 'Make not discoverable' : 'Make discoverable'}
            aria-label={challenge.enabled ? 'Make not discoverable' : 'Make discoverable'}
          >
            {challenge.enabled ? (
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
            {canStart && (
              <DropdownMenuItem asChild>
                <Link
                  to="/challenge/$challengeId"
                  params={{ challengeId: String(challenge.id) }}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start challenge
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link
                to="/manage/challenge/$challengeId/edit"
                params={{ challengeId: String(challenge.id) }}
                className="flex cursor-pointer items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                Edit challenge
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                challenge.id != null && openMoveModal({ id: challenge.id, name: challenge.name })
              }
              className="flex cursor-pointer items-center gap-2"
            >
              <ArrowRightLeft className="h-4 w-4" />
              Move challenge
            </DropdownMenuItem>
            {challenge.id != null && (
              <DropdownMenuItem
                onClick={() => setCloneModalChallenge({ id: challenge.id, name: challenge.name })}
                className="flex cursor-pointer items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Clone challenge
              </DropdownMenuItem>
            )}
            {challenge.id != null && (
              <DropdownMenuItem
                onClick={() => archiveChallenge(challenge.id, challenge.isArchived ?? false)}
                className="flex cursor-pointer items-center gap-2"
              >
                <Archive className="h-4 w-4" />
                {challenge.isArchived ? 'Unarchive challenge' : 'Archive challenge'}
              </DropdownMenuItem>
            )}
            {challenge.id != null && (
              <DropdownMenuItem
                onClick={() => rebuildChallenge(challenge.id)}
                className="flex cursor-pointer items-center gap-2"
              >
                <Hammer className="h-4 w-4" />
                Rebuild tasks
              </DropdownMenuItem>
            )}
            {challenge.id != null && (
              <DropdownMenuItem
                onClick={() => toggleChallengeEnabled(challenge)}
                className="flex cursor-pointer items-center gap-2"
              >
                {challenge.enabled ? 'Disable challenge' : 'Enable challenge'}
              </DropdownMenuItem>
            )}
            {challenge.id != null && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteChallengeId(challenge.id)}
                  className="flex cursor-pointer items-center gap-2 text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete challenge
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <div className="h-full">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={30} minSize={20} maxSize={45}>
          <aside className="h-full min-h-0 overflow-hidden pr-2">
            <div className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200/40 bg-white shadow-sm dark:border-slate-700/40 dark:bg-slate-800">
              {/* Header */}
              <div className="space-y-2.5 px-6 pt-6 pb-4">
                {/* Taxonomy badges */}
                {!isLoadingProject && (project?.featured || project?.isArchived) && (
                  <ul className="flex flex-wrap items-center gap-2.5">
                    {project?.featured && (
                      <li>
                        <span className="font-medium text-cyan-500 text-xs uppercase tracking-wide dark:text-cyan-400">
                          Featured
                        </span>
                      </li>
                    )}
                    {project?.isArchived && (
                      <li>
                        <span className="font-medium text-xs text-zinc-500 uppercase tracking-wide dark:text-zinc-400">
                          Archived
                        </span>
                      </li>
                    )}
                  </ul>
                )}

                {/* Title */}
                <h1 className="line-clamp-2 font-bold text-base text-zinc-900 leading-tight tracking-tight dark:text-zinc-50">
                  {projectData?.displayName || projectData?.name}
                </h1>

                {/* Metadata line */}
                {!isLoadingProject && (
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0 font-medium text-xs text-zinc-600 dark:text-zinc-400">
                    <StatusBadge enabled={projectData?.enabled || false} />
                    <span className="text-zinc-400 dark:text-zinc-500">•</span>
                    <span className="whitespace-nowrap">ID {projectId}</span>
                    {projectData?.created && (
                      <>
                        <span className="text-zinc-400 dark:text-zinc-500">•</span>
                        <span className="whitespace-nowrap">
                          Created {new Date(projectData.created).toLocaleDateString()}
                        </span>
                      </>
                    )}
                    {projectData?.modified && (
                      <>
                        <span className="text-zinc-400 dark:text-zinc-500">•</span>
                        <span className="whitespace-nowrap">
                          Modified {new Date(projectData.modified).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="px-6 py-4">
                <p className="text-pretty text-sm text-zinc-700 leading-relaxed dark:text-zinc-300">
                  {projectData?.description || 'No description provided.'}
                </p>
              </div>

              {/* Action buttons */}
              <div className="border-zinc-200/50 border-t px-6 py-4 dark:border-slate-700/50">
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/project/$projectId" params={{ projectId }} className="block">
                    <Button variant="outline" size="sm" className="w-full gap-1.5 rounded-full">
                      <Eye className="h-4 w-4" />
                      View project page
                    </Button>
                  </Link>
                  <Link
                    to="/manage/project/$projectId/edit"
                    params={{ projectId }}
                    className="block"
                  >
                    <Button variant="outline" size="sm" className="w-full gap-1.5 rounded-full">
                      <Pencil className="h-4 w-4" />
                      Edit project
                    </Button>
                  </Link>
                  <Link
                    to="/manage/challenge/new"
                    search={{ projectId: Number(projectId) }}
                    className="block"
                  >
                    <Button size="sm" className="w-full gap-1.5 rounded-full">
                      <Plus className="h-4 w-4" />
                      Create challenge
                    </Button>
                  </Link>
                  {!isLoadingProject && projectData?.id != null && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full gap-1.5 rounded-full">
                          <MoreHorizontal className="h-4 w-4" />
                          More
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={handleArchiveProject} className="gap-2">
                          <Archive className="h-4 w-4" />
                          {project?.isArchived ? 'Unarchive project' : 'Archive project'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleToggleEnabled} className="gap-2">
                          {project?.enabled ? 'Disable project' : 'Enable project'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteProjectConfirm(true)}
                          className="gap-2 text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex-1 border-zinc-200/50 border-t px-6 py-4 dark:border-slate-700/50">
                <div className="space-y-3">
                  {!(isLoadingProject || isLoadingChallenges) && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">Challenges</span>
                        <span className="font-semibold tabular-nums">{challengeSummary.total}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">Shown</span>
                        <span className="font-semibold tabular-nums">
                          {filteredChallenges.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">Discoverable</span>
                        <span className="font-semibold tabular-nums">
                          {challengeSummary.enabled}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          Tasks remaining
                        </span>
                        <span className="font-bold text-base tabular-nums">
                          {challengeSummary.tasksRemaining}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Playbook footer */}
              <div className="mt-auto border-zinc-200/50 border-t bg-zinc-50/50 px-6 py-4 dark:border-slate-700/50 dark:bg-slate-800/50">
                <p className="mb-1 font-medium text-sm text-zinc-700 dark:text-zinc-300">
                  Project Playbook
                </p>
                <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                  <p>
                    Confirm challenge instructions and QA expectations are specific and testable.
                  </p>
                  <p>Review challenge ordering so mappers can move from easier to harder tasks.</p>
                  <p>
                    Assign at least one co-manager for triage, support, and archival continuity.
                  </p>
                </div>
                <a
                  href="https://learn.maproulette.org/documentation/project-management/"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-xs text-zinc-700 hover:underline dark:text-zinc-200"
                >
                  <BookOpen className="h-3.5 w-3.5 text-zinc-500" />
                  Open project management docs
                </a>
              </div>
            </div>
          </aside>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={70} minSize={40}>
          <div className="flex h-full min-h-0 min-w-0 flex-col pl-2">
            <div className="shrink-0 pb-4">
              <div className="flex items-center gap-3 overflow-x-auto">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search challenges…"
                  className="w-full sm:max-w-xs"
                />
                <FilterToggle
                  label="Discoverable"
                  icon={Eye}
                  checked={onlyDiscoverable}
                  onCheckedChange={setOnlyDiscoverable}
                />
                <FilterToggle
                  label="Archived"
                  icon={Archive}
                  checked={onlyArchived}
                  onCheckedChange={setOnlyArchived}
                />
                <FilterToggle
                  label="Pinned"
                  icon={Pin}
                  checked={onlyPinned}
                  onCheckedChange={setOnlyPinned}
                />
                <ClearManageFiltersButton
                  hasActiveFilters={onlyDiscoverable || onlyArchived || onlyPinned}
                  onClear={() => {
                    setOnlyDiscoverable(false)
                    setOnlyArchived(false)
                    setOnlyPinned(false)
                  }}
                />
                <div className="ml-auto">
                  <ViewModeToggle value={viewMode} onValueChange={setViewMode} />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {viewMode === 'list' ? (
                filteredChallenges.length > 0 ? (
                  <ChallengesTableView
                    challenges={filteredChallenges}
                    pinnedChallengeIds={pinnedChallengeIds}
                    onTogglePin={toggleChallengePin}
                    onToggleEnabled={toggleChallengeEnabled}
                    onClone={(c) => setCloneModalChallenge(c)}
                    onArchive={(id, isArchived) => archiveChallenge(id, isArchived)}
                    onRebuild={(id) => rebuildChallenge(id)}
                    onDelete={(id) => setDeleteChallengeId(id)}
                  />
                ) : (
                  <EntityGrid
                    items={[]}
                    renderItem={() => null}
                    getItemKey={() => ''}
                    emptyState={{
                      icon: ListChecks,
                      title: 'No challenges found',
                      description: 'Get started by creating your first challenge',
                      actionLabel: 'Create Challenge',
                      actionTo: '/manage/challenge/new',
                      actionSearch: { projectId: Number(projectId) },
                    }}
                  />
                )
              ) : (
                <div
                  className={cn(
                    'grid gap-4',
                    filteredChallenges && filteredChallenges.length > 0
                      ? 'grid-cols-1 sm:grid-cols-2'
                      : 'grid-cols-1'
                  )}
                >
                  <EntityGrid
                    items={filteredChallenges || []}
                    renderItem={(challenge) => {
                      const isPinned =
                        challenge.id != null && pinnedChallengeIds.includes(challenge.id)
                      return (
                        <ChallengeCard
                          challenge={challenge}
                          linkTo="/manage/challenge/$challengeId"
                          linkParams={{ challengeId: String(challenge.id) }}
                          actions={buildChallengeActions(challenge, isPinned)}
                        />
                      )
                    }}
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
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <MoveChallengeModal />

      {cloneModalChallenge && (
        <CloneChallengeModal
          open={!!cloneModalChallenge}
          onOpenChange={(open) => !open && setCloneModalChallenge(null)}
          challengeId={cloneModalChallenge.id}
          challengeName={cloneModalChallenge.name}
          currentProjectId={Number(projectId)}
        />
      )}

      <AlertDialog
        open={deleteChallengeId != null}
        onOpenChange={(open) => !open && setDeleteChallengeId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete challenge?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete this challenge and all its tasks. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteChallenge}
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteProjectConfirm} onOpenChange={setDeleteProjectConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete this project and all its challenges and tasks. This action cannot be
              undone.
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
