import { Link, useNavigate, useParams } from '@tanstack/react-router'
import {
  Archive,
  ArrowRightLeft,
  BookOpen,
  Calendar,
  Clock,
  Copy,
  Eye,
  EyeOff,
  FolderKanban,
  Hammer,
  Hash,
  Layers,
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
import { CloneChallengeModal } from '@/components/BrowsedChallengePage/ChallengePanel/ChallengeModals/CloneChallengeModal'
import { ChallengeCard } from '@/components/shared/ChallengeCard'
import { EntityGrid } from '@/components/shared/EntityGrid'
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
import { BackLink } from '@/components/ui/BackLink'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
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
import { cn } from '@/utils/utils'
import type { Challenge } from '@/types/Challenge'
import type { Project } from '@/types/Project'
import { buildPropertiesWithPinnedChallenges, getPinnedChallengeIds } from '@/utils/pinnedProjects'
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
    <div className="mx-auto max-w-7xl px-4 pb-10">
        <BackLink to="/manage/projects">Back to Projects</BackLink>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <aside className="space-y-6 lg:sticky lg:top-4 lg:self-start">
            <Card>
              <CardHeader className="space-y-3 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="font-bold text-xl leading-tight">
                    {isLoadingProject ? (
                      <Skeleton className="h-7 w-48" />
                    ) : (
                      projectData?.displayName || projectData?.name
                    )}
                  </CardTitle>
                  {!isLoadingProject && (
                    <>
                      <StatusBadge enabled={projectData?.enabled || false} />
                      {project?.featured && (
                        <Badge className="border-orange-300 bg-white text-orange-600 dark:border-orange-700 dark:bg-zinc-950 dark:text-orange-400">
                          FEATURED
                        </Badge>
                      )}
                      {project?.isArchived && (
                        <Badge variant="secondary" className="font-normal">
                          Archived
                        </Badge>
                      )}
                    </>
                  )}
                </div>
                <CardDescription className="text-pretty text-sm leading-relaxed">
                  {isLoadingProject ? (
                    <Skeleton className="h-16 w-full" />
                  ) : (
                    projectData?.description || 'No description provided.'
                  )}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Layers className="h-4 w-4 text-zinc-500" />
                  At a glance
                </CardTitle>
                <CardDescription>Challenges and open tasks in this project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FolderKanban className="h-4 w-4 text-zinc-500" />
                  Project details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {isLoadingProject ? (
                  <>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex shrink-0 items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                        <Hash className="h-3.5 w-3.5" />
                        ID
                      </span>
                      <span className="break-all text-right font-mono text-xs text-zinc-800 dark:text-zinc-200">
                        {projectId}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-zinc-500 dark:text-zinc-400">Internal name</span>
                      <span className="max-w-[min(100%,12rem)] break-all text-right text-zinc-800 dark:text-zinc-200">
                        {projectData?.name ?? '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                        <Calendar className="h-3.5 w-3.5" />
                        Created
                      </span>
                      <span className="text-zinc-800 dark:text-zinc-200">
                        {projectData?.created
                          ? new Date(projectData.created).toLocaleDateString()
                          : '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                        <Clock className="h-3.5 w-3.5" />
                        Modified
                      </span>
                      <span className="text-zinc-800 dark:text-zinc-200">
                        {projectData?.modified
                          ? new Date(projectData.modified).toLocaleDateString()
                          : '—'}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Actions</CardTitle>
                <CardDescription>Edit the project or add challenges</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/project/$projectId" params={{ projectId }} className="block">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View project page
                  </Button>
                </Link>
                <Link to="/manage/project/$projectId/edit" params={{ projectId }} className="block">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit project
                  </Button>
                </Link>
                <Link
                  to="/manage/challenge/new"
                  search={{ projectId: Number(projectId) }}
                  className="block"
                >
                  <Button className="w-full justify-start" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Create challenge
                  </Button>
                </Link>
                {!isLoadingProject && projectData?.id != null && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <MoreHorizontal className="mr-2 h-4 w-4" />
                        More
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-[var(--radix-dropdown-menu-trigger-width)]"
                    >
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Project Playbook</CardTitle>
                <CardDescription>Recommended checks before enabling discoverable</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                <p>Confirm challenge instructions and QA expectations are specific and testable.</p>
                <p>Review challenge ordering so mappers can move from easier to harder tasks.</p>
                <p>Assign at least one co-manager for triage, support, and archival continuity.</p>
                <a
                  href="https://learn.maproulette.org/documentation/project-management/"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-2 text-zinc-700 hover:underline dark:text-zinc-200"
                >
                  <BookOpen className="h-4 w-4 text-zinc-500" />
                  Open project management docs
                </a>
              </CardContent>
            </Card>
          </aside>

          <div className="min-w-0 lg:col-span-2">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-semibold text-xl text-zinc-900 dark:text-zinc-50">
                  Challenges
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Search, pin, and manage challenges in this project.
                </p>
              </div>
              <div className="w-full sm:max-w-xs">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search challenges…"
                />
              </div>
            </div>
            <div className="mb-5 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'h-8 gap-1.5',
                  onlyDiscoverable &&
                    'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/30 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-500/30'
                )}
                onClick={() => setOnlyDiscoverable((v) => !v)}
              >
                <Eye className="h-4 w-4" />
                Discoverable
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'h-8 gap-1.5',
                  onlyArchived &&
                    'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/30 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-500/30'
                )}
                onClick={() => setOnlyArchived((v) => !v)}
              >
                <Archive className="h-4 w-4" />
                Archived
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'h-8 gap-1.5',
                  onlyPinned &&
                    'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/30 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-500/30'
                )}
                onClick={() => setOnlyPinned((v) => !v)}
              >
                <Pin className="h-4 w-4" />
                Pinned
              </Button>
            </div>

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
                This will delete this project and all its challenges and tasks. This action cannot
                be undone.
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
