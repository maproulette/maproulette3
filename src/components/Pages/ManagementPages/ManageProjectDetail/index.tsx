import { Link, useNavigate, useParams } from '@tanstack/react-router'
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
import { useCallback, useMemo, useState } from 'react'
import { api } from '@/api'
import { CloneChallengeModal } from '@/components/Pages/BrowsedChallengePage/ChallengePanel/ChallengeModals/CloneChallengeModal'
import {
  buildPropertiesWithPinnedChallenges,
  getPinnedChallengeIds,
} from '@/components/Pages/ManagementPages/ManageProjects/pinnedProjects'
import { ChallengeCard } from '@/components/shared/ChallengeCard'
import { ClearManageFiltersButton } from '@/components/shared/ClearManageFiltersButton'
import { EntityGrid } from '@/components/shared/EntityGrid'
import { FilterToggle } from '@/components/shared/FilterToggle'
import { SearchBar } from '@/components/shared/SearchBar'
import { StatusBadge } from '@/components/shared/StatusBadge'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Separator } from '@/components/ui/Separator'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuthContext } from '@/contexts/AuthContext'
import { useSetPageTitle } from '@/contexts/PageTitleContext'
import { cn } from '@/lib/utils'
import type { Challenge } from '@/types/Challenge'
import type { Project } from '@/types/Project'
import { MoveChallengeModal } from '../MoveChallengeModal'

export const ManageProjectDetail = () => {
  const { projectId } = useParams({ from: '/_app/manage/project/$projectId/' })
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [moveModalChallenge, setMoveModalChallenge] = useState<{
    id: number
    name: string
  } | null>(null)
  const [deleteProjectConfirm, setDeleteProjectConfirm] = useState(false)
  const [cloneModalChallenge, setCloneModalChallenge] = useState<{
    id: number
    name: string
  } | null>(null)
  const [deleteChallengeId, setDeleteChallengeId] = useState<number | null>(null)
  const [onlyDiscoverable, setOnlyDiscoverable] = useState(false)
  const [onlyArchived, setOnlyArchived] = useState(false)
  const [onlyPinned, setOnlyPinned] = useState(false)

  const { data: projectData, isLoading: isLoadingProject } = api.project.getProject(
    Number(projectId)
  )
  useSetPageTitle(projectData?.displayName || projectData?.name || null)

  const { data: challenges, isLoading: isLoadingChallenges } = api.project.getProjectChallenges(
    Number(projectId)
  )

  const { user } = useAuthContext()
  const updateSettingsMutation = api.user.useUpdateUserSettings()
  const updateProjectMutation = api.project.useUpdateProject()
  const deleteProjectMutation = api.project.useDeleteProject()
  const deleteChallengeMutation = api.challenge.useDeleteChallenge()
  const archiveChallengeMutation = api.challenge.useArchiveChallenge()
  const rebuildChallengeMutation = api.challenge.useRebuildChallenge()
  const updateChallengeMutation = api.challenge.useUpdateChallenge()
  const pinnedChallengeIds = useMemo(() => getPinnedChallengeIds(user), [user])

  const handleArchiveProject = useCallback(() => {
    if (projectData?.id == null) return
    const project = projectData as Project
    updateProjectMutation.mutate({
      projectId: projectData.id,
      updates: { isArchived: !(project.isArchived ?? false) },
    })
  }, [projectData?.id, projectData, updateProjectMutation])

  const handleToggleEnabled = useCallback(() => {
    if (projectData?.id == null) return
    const project = projectData as Project
    updateProjectMutation.mutate({
      projectId: projectData.id,
      updates: { enabled: !(project.enabled ?? false) },
    })
  }, [projectData?.id, projectData, updateProjectMutation])

  const confirmDeleteProject = useCallback(() => {
    if (projectData?.id == null) return
    deleteProjectMutation.mutate(
      { projectId: projectData.id },
      {
        onSettled: () => setDeleteProjectConfirm(false),
        onSuccess: () => navigate({ to: '/manage/projects' }),
      }
    )
  }, [projectData?.id, deleteProjectMutation, navigate])

  const confirmDeleteChallenge = useCallback(() => {
    if (deleteChallengeId == null) return
    deleteChallengeMutation.mutate(deleteChallengeId, {
      onSettled: () => setDeleteChallengeId(null),
    })
  }, [deleteChallengeId, deleteChallengeMutation])

  const toggleChallengePin = useCallback(
    (challengeId: number) => {
      if (!user?.id) return
      const next = pinnedChallengeIds.includes(challengeId)
        ? pinnedChallengeIds.filter((id) => id !== challengeId)
        : [...pinnedChallengeIds, challengeId]
      const properties = buildPropertiesWithPinnedChallenges(user, next)
      updateSettingsMutation.mutate({
        userId: user.id,
        settings: user.settings ?? {},
        properties,
      })
    },
    [user, pinnedChallengeIds, updateSettingsMutation]
  )

  const filteredChallenges = useMemo(() => {
    const list = challenges
      ?.filter((challenge) => challenge.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter((challenge) => (onlyDiscoverable ? !!challenge.enabled : true))
      .filter((challenge) => (onlyArchived ? !!challenge.isArchived : true))
      .filter((challenge) =>
        onlyPinned
          ? challenge.id != null
            ? pinnedChallengeIds.includes(challenge.id)
            : false
          : true
      )
    if (!list?.length) return list ?? []
    const set = new Set(pinnedChallengeIds)
    return [...list].sort((a, b) => {
      const aPinned = a.id != null && set.has(a.id) ? 1 : 0
      const bPinned = b.id != null && set.has(b.id) ? 1 : 0
      return bPinned - aPinned
    })
  }, [challenges, searchQuery, pinnedChallengeIds, onlyDiscoverable, onlyArchived, onlyPinned])

  const challengeSummary = useMemo(() => {
    const list = challenges ?? []
    return {
      total: list.length,
      enabled: list.filter((c) => c.enabled).length,
      tasksRemaining: list.reduce((sum, c) => sum + (c.tasksRemaining || 0), 0),
    }
  }, [challenges])

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
              updateChallengeMutation.mutate({
                challengeId: challenge.id,
                updates: { enabled: !(challenge.enabled ?? false) },
              })
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
                challenge.id != null &&
                setMoveModalChallenge({ id: challenge.id, name: challenge.name })
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
                onClick={() =>
                  archiveChallengeMutation.mutate({
                    challengeId: challenge.id,
                    isArchived: !(challenge.isArchived ?? false),
                  })
                }
                className="flex cursor-pointer items-center gap-2"
              >
                <Archive className="h-4 w-4" />
                {challenge.isArchived ? 'Unarchive challenge' : 'Archive challenge'}
              </DropdownMenuItem>
            )}
            {challenge.id != null && (
              <DropdownMenuItem
                onClick={() => rebuildChallengeMutation.mutate({ challengeId: challenge.id })}
                className="flex cursor-pointer items-center gap-2"
              >
                <Hammer className="h-4 w-4" />
                Rebuild tasks
              </DropdownMenuItem>
            )}
            {challenge.id != null && (
              <DropdownMenuItem
                onClick={() =>
                  updateChallengeMutation.mutate({
                    challengeId: challenge.id,
                    updates: { enabled: !(challenge.enabled ?? false) },
                  })
                }
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

  const project = projectData as Project | undefined

  return (
    <div className="h-full">
      <div className="grid h-full grid-cols-1 gap-8 lg:grid-cols-3">
        <aside className="h-full min-h-0 overflow-hidden">
          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200/40 bg-white shadow-sm dark:border-slate-700/40 dark:bg-slate-800">
            {/* Header */}
            <div className="space-y-2.5 px-6 pt-8 pb-4">
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
              <h1 className="line-clamp-2 font-bold text-2xl text-zinc-900 leading-tight tracking-tight dark:text-zinc-50">
                {isLoadingProject ? (
                  <Skeleton className="h-7 w-48" />
                ) : (
                  projectData?.displayName || projectData?.name
                )}
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
                {isLoadingProject ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  projectData?.description || 'No description provided.'
                )}
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
                <Link to="/manage/project/$projectId/edit" params={{ projectId }} className="block">
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
                {isLoadingProject || isLoadingChallenges ? (
                  <>
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                  </>
                ) : (
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
                      <span className="font-semibold tabular-nums">{challengeSummary.enabled}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">
                        Tasks remaining
                      </span>
                      <span className="font-bold text-lg tabular-nums">
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
                <p>Confirm challenge instructions and QA expectations are specific and testable.</p>
                <p>Review challenge ordering so mappers can move from easier to harder tasks.</p>
                <p>Assign at least one co-manager for triage, support, and archival continuity.</p>
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

        <div className="flex h-full min-h-0 min-w-0 flex-col lg:col-span-2">
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
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div
              className={cn(
                'grid gap-6',
                filteredChallenges && filteredChallenges.length > 0
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-1'
              )}
            >
              <EntityGrid
                items={filteredChallenges || []}
                renderItem={(challenge) => {
                  const isPinned = challenge.id != null && pinnedChallengeIds.includes(challenge.id)
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
          </div>
        </div>
      </div>

      {moveModalChallenge && (
        <MoveChallengeModal
          open={!!moveModalChallenge}
          onOpenChange={(open) => !open && setMoveModalChallenge(null)}
          challengeId={moveModalChallenge.id}
          challengeName={moveModalChallenge.name}
          currentProjectId={Number(projectId)}
          onMoved={() => setMoveModalChallenge(null)}
        />
      )}

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
