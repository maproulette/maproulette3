import { Link } from '@tanstack/react-router'
import {
  Archive,
  Copy,
  Eye,
  EyeOff,
  FolderKanban,
  Gauge,
  Grid2X2,
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
import {
  buildPropertiesWithPinnedChallenges,
  getPinnedChallengeIds,
} from '@/components/Pages/ManagementPages/ManageProjects/pinnedProjects'
import { ChallengeCard } from '@/components/shared/ChallengeCard'
import { ClearManageFiltersButton } from '@/components/shared/ClearManageFiltersButton'
import { EntityGrid } from '@/components/shared/EntityGrid'
import { FilterToggle } from '@/components/shared/FilterToggle'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Separator } from '@/components/ui/Separator'
import { useAuthContext } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import type { Challenge } from '@/types/Challenge'

export const ManageChallenges = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteChallengeId, setDeleteChallengeId] = useState<number | null>(null)
  const [onlyDiscoverable, setOnlyDiscoverable] = useState(false)
  const [onlyArchived, setOnlyArchived] = useState(false)
  const [onlyPinned, setOnlyPinned] = useState(false)

  // Fetch managed projects, then their challenges
  const { data: managedProjects, isLoading: isLoadingProjects } = api.project.getManagedProjects()
  const managedProjectIds = useMemo(
    () => managedProjects?.map((p) => p.id).filter((id): id is number => id != null) ?? [],
    [managedProjects]
  )
  const { data: challenges, isLoading: isLoadingChallenges } = api.challenge.listing(
    managedProjectIds,
    100,
    0,
    false
  )
  const isLoading = isLoadingProjects || isLoadingChallenges

  const { user } = useAuthContext()
  const updateSettingsMutation = api.user.useUpdateUserSettings()
  const deleteChallengeMutation = api.challenge.useDeleteChallenge()
  const archiveChallengeMutation = api.challenge.useArchiveChallenge()
  const rebuildChallengeMutation = api.challenge.useRebuildChallenge()
  const updateChallengeMutation = api.challenge.useUpdateChallenge()
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

  const confirmDeleteChallenge = useCallback(() => {
    if (deleteChallengeId == null) return
    deleteChallengeMutation.mutate(deleteChallengeId, {
      onSettled: () => setDeleteChallengeId(null),
    })
  }, [deleteChallengeId, deleteChallengeMutation])

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

  const filteredChallenges = useMemo(() => {
    const list = challenges ?? []
    return list
      .filter((challenge) => challenge.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter((challenge) => (onlyDiscoverable ? !!challenge.enabled : true))
      .filter((challenge) => (onlyArchived ? !!challenge.isArchived : true))
      .filter((challenge) =>
        onlyPinned
          ? challenge.id != null
            ? pinnedChallengeIds.includes(challenge.id)
            : false
          : true
      )
  }, [challenges, searchQuery, onlyDiscoverable, onlyArchived, onlyPinned, pinnedChallengeIds])
  const challengeSummary = useMemo(() => {
    const list = challenges ?? []
    return {
      total: list.length,
      discoverable: list.filter((c) => c.enabled).length,
      archived: list.filter((c) => c.isArchived).length,
      tasksRemaining: list.reduce((sum, c) => sum + (c.tasksRemaining || 0), 0),
    }
  }, [challenges])

  return (
    <div className="px-4 pb-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <aside className="space-y-6 lg:sticky lg:top-4 lg:self-start">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="font-bold text-xl leading-tight">All Challenges</CardTitle>
              <CardDescription>
                Browse and manage all challenges from your managed projects.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Gauge className="h-4 w-4 text-zinc-500" />
                At a glance
              </CardTitle>
              <CardDescription>Coverage across your managed projects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <GridSkeleton />
              ) : (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">Managed projects</span>
                    <span className="font-semibold tabular-nums">{managedProjectIds.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">Challenges</span>
                    <span className="font-semibold tabular-nums">{challengeSummary.total}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">Shown</span>
                    <span className="font-semibold tabular-nums">{filteredChallenges.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">Discoverable</span>
                    <span className="font-semibold tabular-nums">
                      {challengeSummary.discoverable}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">Archived</span>
                    <span className="font-semibold tabular-nums">{challengeSummary.archived}</span>
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
              <CardTitle className="text-base">Actions</CardTitle>
              <CardDescription>Create challenges or jump to related pages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/manage/challenge/new" className="block">
                <Button className="w-full justify-start" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Create challenge
                </Button>
              </Link>
              <Link to="/manage/projects" className="block">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <FolderKanban className="mr-2 h-4 w-4" />
                  Manage projects
                </Button>
              </Link>
              <Link to="/manage/tasks" className="block">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Grid2X2 className="mr-2 h-4 w-4" />
                  Open tasks
                </Button>
              </Link>
            </CardContent>
          </Card>
        </aside>

        <div className="min-w-0 lg:col-span-2">
          <div className="mb-6 flex items-center gap-3 overflow-x-auto">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search challenges..."
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

          <div
            className={cn(
              'grid gap-6',
              filteredChallenges && filteredChallenges.length > 0
                ? 'grid-cols-1 sm:grid-cols-2'
                : 'grid-cols-1'
            )}
          >
            {isLoading ? (
              <GridSkeleton />
            ) : (
              <EntityGrid
                items={filteredChallenges || []}
                renderItem={(challenge) => {
                  const isPinned = challenge.id != null && pinnedChallengeIds.includes(challenge.id)
                  return (
                    <ChallengeCard
                      challenge={challenge}
                      linkTo="/manage/challenge/$challengeId"
                      linkParams={{ challengeId: challenge.id.toString() }}
                      actions={buildChallengeActions(challenge, isPinned)}
                    />
                  )
                }}
                getItemKey={(challenge) => challenge.id ?? crypto.randomUUID()}
                emptyState={{
                  icon: ListChecks,
                  title: 'No challenges found',
                  description: 'Create a project first, then add challenges to it',
                  actionLabel: 'Go to Projects',
                  actionTo: '/manage/projects',
                }}
              />
            )}
          </div>
        </div>
      </div>
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
    </div>
  )
}
