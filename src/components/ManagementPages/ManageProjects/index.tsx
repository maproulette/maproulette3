import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  Archive,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  FileDown,
  FolderKanban,
  Hammer,
  LayoutGrid,
  List,
  ListChecks,
  MoreHorizontal,
  Pencil,
  Pin,
  Play,
  Plus,
  Trash2,
  User,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '@/api'
import { AuthGuard } from '@/components/shared/AuthGuard'
import { EntityGrid } from '@/components/shared/EntityGrid'
import { GridSkeleton } from '@/components/shared/GridSkeleton'
import { SearchBar } from '@/components/shared/SearchBar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { BackLink } from '@/components/ui/BackLink'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { useAuthContext } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import type { Challenge } from '@/types/Challenge'
import type { Project } from '@/types/Project'
import {
  buildPropertiesWithPinnedChallenges,
  buildPropertiesWithPinnedProjects,
  getPinnedChallengeIds,
  getPinnedProjectIds,
} from '@/utils/pinnedProjects'
import { CloneChallengeModal } from '@/components/BrowsedChallengePage/ChallengePanel/ChallengeModals/CloneChallengeModal'
import { MoveChallengeModal } from '../MoveChallengeModal'
import { ProjectsTableView } from './ProjectsTableView'

type ViewMode = 'grid' | 'list'

const PROJECT_CARD_HEIGHT = 420

const PAGE_SIZE = 20

const ProjectCard = ({
  project,
  challengeCount,
  challenges = [],
  isPinned = false,
  onMoveChallenge,
  onTogglePin,
  pinnedChallengeIds = [],
  onToggleChallengePin,
  onExportCsv,
  onArchiveProject,
  onDeleteProject,
  onCloneChallenge,
  onDeleteChallenge,
  onArchiveChallenge,
  onRebuildChallenge,
  onToggleChallengeVisibility,
}: {
  project: Project
  challengeCount: number | undefined
  challenges?: Challenge[]
  isPinned?: boolean
  onMoveChallenge?: (challengeId: number, challengeName: string) => void
  onTogglePin?: () => void
  pinnedChallengeIds?: number[]
  onToggleChallengePin?: (challengeId: number) => void
  onExportCsv?: (projectId: number) => void
  onArchiveProject?: (projectId: number, isArchived: boolean) => void
  onDeleteProject?: (projectId: number, projectName: string) => void
  onCloneChallenge?: (challengeId: number, challengeName: string) => void
  onDeleteChallenge?: (challengeId: number) => void
  onArchiveChallenge?: (challengeId: number, isArchived: boolean) => void
  onRebuildChallenge?: (challengeId: number) => void
  onToggleChallengeVisibility?: (challengeId: number, enabled: boolean) => void
}) => {
  const count = challengeCount ?? 0
  const isLoadingChallenges = challengeCount === undefined && challenges.length === 0

  return (
    <Card
      className={cn(
        'flex flex-col overflow-hidden transition-all hover:shadow-lg dark:border-zinc-800/80 dark:hover:border-zinc-700',
        isPinned
          ? 'border-zinc-200/80 border-l-4 border-l-amber-500 hover:border-zinc-300 dark:border-zinc-800/80'
          : 'border-zinc-200/80 hover:border-zinc-300'
      )}
      style={{ height: PROJECT_CARD_HEIGHT }}
    >
      <CardHeader className="shrink-0 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800/80">
              <FolderKanban className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base leading-tight">
                  <Link
                    to="/manage/project/$projectId"
                    params={{ projectId: String(project.id) }}
                    className="font-semibold text-zinc-900 transition-colors hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-300"
                  >
                    {project.displayName || project.name}
                  </Link>
                </CardTitle>
                {onTogglePin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={(e) => {
                      e.preventDefault()
                      onTogglePin()
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
              </div>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">ID: {project.id}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <StatusBadge enabled={project.enabled || false} />
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
                    params={{ projectId: String(project.id) }}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View project
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/manage/project/$projectId/edit"
                    params={{ projectId: String(project.id) }}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit project
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/manage/challenge/new"
                    search={{ projectId: Number(project.id) }}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add challenge
                  </Link>
                </DropdownMenuItem>
                {onExportCsv && project.id != null && (
                  <DropdownMenuItem
                    onClick={() => onExportCsv(project.id as number)}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <FileDown className="h-4 w-4" />
                    Export CSV
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    const url = `${window.location.origin}/manage/project/${project.id}`
                    void navigator.clipboard.writeText(url)
                  }}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy URL
                </DropdownMenuItem>
                {onArchiveProject && project.id != null && (
                  <DropdownMenuItem
                    onClick={() =>
                      onArchiveProject(project.id as number, project.isArchived ?? false)
                    }
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Archive className="h-4 w-4" />
                    {project.isArchived ? 'Unarchive project' : 'Archive project'}
                  </DropdownMenuItem>
                )}
                {onDeleteProject && project.id != null && (
                  <DropdownMenuItem
                    onClick={() =>
                      onDeleteProject(project.id as number, project.displayName || project.name)
                    }
                    className="flex cursor-pointer items-center gap-2 text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete project
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-6 pt-0 pb-5">
        <CardDescription className="line-clamp-2 shrink-0 text-zinc-600 dark:text-zinc-400">
          {project.description || 'No description available'}
        </CardDescription>
        <div className="shrink-0">
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 font-medium text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {count} challenge{count !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg bg-zinc-50/80 dark:bg-zinc-900/50">
          <div className="flex shrink-0 items-center gap-2 border-zinc-200/80 border-b px-3 py-2 dark:border-zinc-800/80">
            <ListChecks className="size-3.5 text-zinc-500 dark:text-zinc-400" />
            <span className="font-medium text-xs text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
              Challenges
            </span>
          </div>
          <ScrollArea className="h-full min-h-0 flex-1">
            <div className="px-2 py-2">
              {isLoadingChallenges ? (
                <p className="py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  Loading…
                </p>
              ) : challenges.length === 0 ? (
                <p className="py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  No challenges yet
                </p>
              ) : (
                <ul className="space-y-0.5">
                  {[...challenges]
                    .sort((a, b) => {
                      if (!onToggleChallengePin) return 0
                      const aPinned = a.id != null && pinnedChallengeIds.includes(a.id) ? 1 : 0
                      const bPinned = b.id != null && pinnedChallengeIds.includes(b.id) ? 1 : 0
                      return bPinned - aPinned
                    })
                    .map((challenge) => {
                      const challengePinned =
                        challenge.id != null && pinnedChallengeIds.includes(challenge.id)
                      return (
                        <li
                          key={challenge.id}
                          className="group/challenge flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-white dark:hover:bg-zinc-800"
                        >
                          {onToggleChallengePin && challenge.id != null && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0 opacity-70 group-hover/challenge:opacity-100"
                              onClick={(e) => {
                                e.preventDefault()
                                onToggleChallengePin(challenge.id)
                              }}
                              title={challengePinned ? 'Unpin challenge' : 'Pin challenge'}
                              aria-label={challengePinned ? 'Unpin challenge' : 'Pin challenge'}
                            >
                              <Pin
                                className={cn(
                                  'h-3.5 w-3.5',
                                  challengePinned
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-400'
                                )}
                              />
                            </Button>
                          )}
                          <Link
                            to="/challenge/$challengeId"
                            params={{ challengeId: String(challenge.id) }}
                            className="min-w-0 flex-1 items-center gap-2 truncate py-1 pr-1 text-sm text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
                          >
                            <span className="block truncate">{challenge.name}</span>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0 opacity-70 group-hover/challenge:opacity-100"
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {(challenge.tasksRemaining ?? 0) > 0 && (
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
                                  to="/challenge/$challengeId"
                                  params={{ challengeId: String(challenge.id) }}
                                  className="flex cursor-pointer items-center gap-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  View challenge
                                </Link>
                              </DropdownMenuItem>
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
                              {onMoveChallenge && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    challenge.id != null &&
                                    onMoveChallenge(challenge.id, challenge.name)
                                  }
                                  className="flex cursor-pointer items-center gap-2"
                                >
                                  <ArrowRightLeft className="h-4 w-4" />
                                  Move challenge
                                </DropdownMenuItem>
                              )}
                              {onCloneChallenge && challenge.id != null && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    onCloneChallenge(challenge.id, challenge.name)
                                  }
                                  className="flex cursor-pointer items-center gap-2"
                                >
                                  <Copy className="h-4 w-4" />
                                  Clone challenge
                                </DropdownMenuItem>
                              )}
                              {onArchiveChallenge && challenge.id != null && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    onArchiveChallenge(
                                      challenge.id,
                                      challenge.isArchived ?? false
                                    )
                                  }
                                  className="flex cursor-pointer items-center gap-2"
                                >
                                  <Archive className="h-4 w-4" />
                                  {challenge.isArchived
                                    ? 'Unarchive challenge'
                                    : 'Archive challenge'}
                                </DropdownMenuItem>
                              )}
                              {onRebuildChallenge && challenge.id != null && (
                                <DropdownMenuItem
                                  onClick={() => onRebuildChallenge(challenge.id)}
                                  className="flex cursor-pointer items-center gap-2"
                                >
                                  <Hammer className="h-4 w-4" />
                                  Rebuild tasks
                                </DropdownMenuItem>
                              )}
                              {onToggleChallengeVisibility && challenge.id != null && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    onToggleChallengeVisibility(
                                      challenge.id,
                                      challenge.enabled ?? false
                                    )
                                  }
                                  className="flex cursor-pointer items-center gap-2"
                                >
                                  {challenge.enabled
                                    ? 'Disable challenge'
                                    : 'Enable challenge'}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => {
                                  const url = `${window.location.origin}/challenge/${challenge.id}`
                                  void navigator.clipboard.writeText(url)
                                }}
                                className="flex cursor-pointer items-center gap-2"
                              >
                                <Copy className="h-4 w-4" />
                                Copy URL
                              </DropdownMenuItem>
                              {onDeleteChallenge && challenge.id != null && (
                                <DropdownMenuItem
                                  onClick={() => onDeleteChallenge(challenge.id)}
                                  className="flex cursor-pointer items-center gap-2 text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete challenge
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </li>
                      )
                    })}
                </ul>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}

export const ManageProjects = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [page, setPage] = useState(0)
  const [onlyEnabled, setOnlyEnabled] = useState(false)
  const [onlyOwned, setOnlyOwned] = useState(false)
  const [onlyShowArchived, setOnlyShowArchived] = useState(false)
  const [onlyShowPinned, setOnlyShowPinned] = useState(false)
  const [moveModalChallenge, setMoveModalChallenge] = useState<{
    challengeId: number
    challengeName: string
    projectId: number
  } | null>(null)
  const [deleteProjectConfirm, setDeleteProjectConfirm] = useState<{
    projectId: number
    projectName: string
  } | null>(null)
  const [cloneModalChallenge, setCloneModalChallenge] = useState<{
    challengeId: number
    challengeName: string
    projectId: number
  } | null>(null)
  const [deleteChallengeId, setDeleteChallengeId] = useState<number | null>(null)

  // Only reset page when server-side filters change (triggers refetch). Archived/Pinned are client-side only.
  useEffect(() => {
    setPage(0)
  }, [searchQuery, onlyEnabled, onlyOwned])

  const { data: projects, isLoading } = api.project.getManagedProjects({
    limit: PAGE_SIZE,
    page: page * PAGE_SIZE,
    searchString: searchQuery,
    onlyEnabled,
    onlyOwned,
  })

  const hasNextPage = (projects?.length ?? 0) >= PAGE_SIZE
  const hasPrevPage = page > 0

  const { user } = useAuthContext()
  const updateSettingsMutation = api.user.useUpdateUserSettings()
  const updateProjectMutation = api.project.useUpdateProject()
  const deleteProjectMutation = api.project.useDeleteProject()
  const deleteChallengeMutation = api.challenge.useDeleteChallenge()
  const archiveChallengeMutation = api.challenge.useArchiveChallenge()
  const rebuildChallengeMutation = api.challenge.useRebuildChallenge()
  const updateChallengeMutation = api.challenge.useUpdateChallenge()
  const pinnedProjectIds = useMemo(() => getPinnedProjectIds(user), [user])

  const handleExportCsv = useCallback((projectId: number) => {
    const name = projects?.find((p) => p.id === projectId)?.displayName ?? projects?.find((p) => p.id === projectId)?.name
    const safeName = name ? name.replace(/[^a-zA-Z0-9-_]/g, '-') : ''
    void api.project.exportProjectTasksCsv(projectId, safeName ? `project-${safeName}-tasks.csv` : undefined)
  }, [projects])

  const handleArchiveProject = useCallback(
    (projectId: number, isArchived: boolean) => {
      updateProjectMutation.mutate({
        projectId,
        updates: { isArchived: !isArchived } as Partial<Project>,
      })
    },
    [updateProjectMutation]
  )

  const handleDeleteProject = useCallback(
    (projectId: number, projectName: string) => {
      setDeleteProjectConfirm({ projectId, projectName })
    },
    []
  )

  const confirmDeleteProject = useCallback(() => {
    if (!deleteProjectConfirm) return
    deleteProjectMutation.mutate(
      { projectId: deleteProjectConfirm.projectId },
      { onSettled: () => setDeleteProjectConfirm(null) }
    )
  }, [deleteProjectConfirm, deleteProjectMutation])

  const confirmDeleteChallenge = useCallback(() => {
    if (deleteChallengeId == null) return
    deleteChallengeMutation.mutate(deleteChallengeId, {
      onSettled: () => setDeleteChallengeId(null),
    })
  }, [deleteChallengeId, deleteChallengeMutation])

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

  const pinnedChallengeIds = useMemo(() => getPinnedChallengeIds(user), [user])
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

  const challengesByProjectId = useMemo(() => {
    const map: Record<number, Challenge[]> = {}
    for (const c of challengesListing) {
      const pid = c.parent
      if (!map[pid]) map[pid] = []
      map[pid].push(c as unknown as Challenge)
    }
    return map
  }, [challengesListing])

  return (
    <AuthGuard>
      <div className="mx-auto px-4">
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

          {/* Filters and view toggle */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
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
            {/* Active vs Archived toggle (not a filter) */}
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
                return (
                  <ProjectCard
                    project={proj}
                    challengeCount={
                      projectId != null ? challengeCountsByProjectId[projectId] : undefined
                    }
                    challenges={projectId != null ? challengesByProjectId[projectId] : undefined}
                    isPinned={isPinned}
                    onTogglePin={projectId != null ? () => toggleProjectPin(projectId) : undefined}
                    pinnedChallengeIds={pinnedChallengeIds}
                    onToggleChallengePin={toggleChallengePin}
                    onMoveChallenge={
                      projectId != null
                        ? (challengeId, challengeName) =>
                            setMoveModalChallenge({
                              challengeId,
                              challengeName,
                              projectId,
                            })
                        : undefined
                    }
                    onExportCsv={handleExportCsv}
                    onArchiveProject={handleArchiveProject}
                    onDeleteProject={handleDeleteProject}
                    onCloneChallenge={
                      projectId != null
                        ? (challengeId, challengeName) =>
                            setCloneModalChallenge({
                              challengeId,
                              challengeName,
                              projectId,
                            })
                        : undefined
                    }
                    onDeleteChallenge={setDeleteChallengeId}
                    onArchiveChallenge={(challengeId, isArchived) =>
                      archiveChallengeMutation.mutate({
                        challengeId,
                        isArchived: !isArchived,
                      })
                    }
                    onRebuildChallenge={(challengeId) =>
                      rebuildChallengeMutation.mutate({ challengeId })
                    }
                    onToggleChallengeVisibility={(challengeId, enabled) =>
                      updateChallengeMutation.mutate({
                        challengeId,
                        updates: { enabled: !enabled },
                      })
                    }
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

        {/* Pagination */}
        {!isLoading && (projectsToShow?.length ?? 0) > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-zinc-200 border-t pt-4 dark:border-zinc-800">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Showing {page * PAGE_SIZE + 1}–{page * PAGE_SIZE + (projectsToShow?.length ?? 0)}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={!hasPrevPage}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Page {page + 1}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNextPage}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {moveModalChallenge && (
          <MoveChallengeModal
            open={!!moveModalChallenge}
            onOpenChange={(open) => !open && setMoveModalChallenge(null)}
            challengeId={moveModalChallenge.challengeId}
            challengeName={moveModalChallenge.challengeName}
            currentProjectId={moveModalChallenge.projectId}
            onMoved={() => setMoveModalChallenge(null)}
          />
        )}

        {cloneModalChallenge && (
          <CloneChallengeModal
            open={!!cloneModalChallenge}
            onOpenChange={(open) => !open && setCloneModalChallenge(null)}
            challengeId={cloneModalChallenge.challengeId}
            challengeName={cloneModalChallenge.challengeName}
            currentProjectId={cloneModalChallenge.projectId}
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
    </AuthGuard>
  )
}
