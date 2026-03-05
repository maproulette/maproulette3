import { Link } from '@tanstack/react-router'
import {
  Archive,
  ArrowRightLeft,
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
import { AuthGuard } from '@/components/shared/AuthGuard'
import { ChallengeCard } from '@/components/shared/ChallengeCard'
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
import { BackLink } from '@/components/ui/BackLink'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { useAuthContext } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import type { Challenge } from '@/types/Challenge'
import { buildPropertiesWithPinnedChallenges, getPinnedChallengeIds } from '@/utils/pinnedProjects'

export const ManageChallenges = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteChallengeId, setDeleteChallengeId] = useState<number | null>(null)

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

  const filteredChallenges = challenges?.filter((challenge) =>
    challenge.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AuthGuard>
      <div className="mx-auto px-4">
        <BackLink to="/manage">Back to Manage</BackLink>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 font-bold text-3xl text-zinc-900 dark:text-zinc-50">
                All Challenges
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Browse and manage all your MapRoulette challenges
              </p>
            </div>
            <Link to="/manage/challenge/new">
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Create New Challenge
              </Button>
            </Link>
          </div>

          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search challenges..."
          />
        </div>

        {/* Challenges Grid */}
        <div
          className={cn(
            'grid gap-6',
            filteredChallenges && filteredChallenges.length > 0
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
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
    </AuthGuard>
  )
}
