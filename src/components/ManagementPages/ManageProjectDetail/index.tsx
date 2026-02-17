import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { Archive, ListChecks, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { api } from '@/api'
import { AuthGuard } from '@/components/shared/AuthGuard'
import { useAuthContext } from '@/contexts/AuthContext'
import { EntityGrid } from '@/components/shared/EntityGrid'
import { SearchBar } from '@/components/shared/SearchBar'
import { StatCard } from '@/components/shared/StatCard'
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
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Project } from '@/types/Project'
import { cn } from '@/lib/utils'
import {
  buildPropertiesWithPinnedChallenges,
  getPinnedChallengeIds,
} from '@/utils/pinnedProjects'
import { CloneChallengeModal } from '@/components/BrowsedChallengePage/ChallengePanel/ChallengeModals/CloneChallengeModal'
import { ManageChallengeCard } from './ManageChallengeCard'
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

  const { data: projectData, isLoading: isLoadingProject } = api.project.getProject(
    Number(projectId)
  )

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
    const list = challenges?.filter((challenge) =>
      challenge.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    if (!list?.length) return list ?? []
    const set = new Set(pinnedChallengeIds)
    return [...list].sort((a, b) => {
      const aPinned = a.id != null && set.has(a.id) ? 1 : 0
      const bPinned = b.id != null && set.has(b.id) ? 1 : 0
      return bPinned - aPinned
    })
  }, [challenges, searchQuery, pinnedChallengeIds])

  return (
    <AuthGuard>
      <div className="mx-auto px-4">
        <BackLink to="/manage/projects">Back to Projects</BackLink>

        <div className="mb-8">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-3">
                <h1 className="font-bold text-3xl text-zinc-900 dark:text-zinc-50">
                  {isLoadingProject ? (
                    <Skeleton className="h-9 w-64" />
                  ) : (
                    projectData?.displayName || projectData?.name
                  )}
                </h1>
                {!isLoadingProject && <StatusBadge enabled={projectData?.enabled || false} />}
              </div>
              <p className="mb-2 text-zinc-600 dark:text-zinc-400">
                {isLoadingProject ? (
                  <Skeleton className="h-5 w-96" />
                ) : (
                  projectData?.description || 'No description available'
                )}
              </p>
              {!isLoadingProject && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Project ID: {projectId}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Link to="/manage/project/$projectId/edit" params={{ projectId }}>
                <Button variant="outline" size="lg">
                  <Pencil className="mr-2 h-5 w-5" />
                  Edit Project
                </Button>
              </Link>
              <Link to="/manage/challenge/new" search={{ projectId: Number(projectId) }}>
                <Button size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Challenge
                </Button>
              </Link>
              {!isLoadingProject && projectData?.id != null && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-10 w-10">
                      <MoreHorizontal className="h-5 w-5" />
                      <span className="sr-only">Project actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleArchiveProject} className="gap-2">
                      <Archive className="h-4 w-4" />
                      {(projectData as Project)?.isArchived
                        ? 'Unarchive project'
                        : 'Archive project'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleToggleEnabled} className="gap-2">
                      {(projectData as Project)?.enabled ? 'Disable project' : 'Enable project'}
                    </DropdownMenuItem>
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

          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search challenges..."
          />
        </div>

        {!isLoadingProject && !isLoadingChallenges && (
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <StatCard title="Total Challenges" value={challenges?.length || 0} />
            <StatCard
              title="Enabled Challenges"
              value={challenges?.filter((c) => c.enabled).length || 0}
            />
            <StatCard
              title="Total Tasks"
              value={challenges?.reduce((sum, c) => sum + (c.tasksRemaining || 0), 0) || 0}
            />
          </div>
        )}

        <div>
          <h2 className="mb-4 font-semibold text-xl text-zinc-900 dark:text-zinc-50">Challenges</h2>
          <div
            className={cn(
              'grid gap-6',
              filteredChallenges && filteredChallenges.length > 0
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            )}
          >
            <EntityGrid
              items={filteredChallenges || []}
              renderItem={(challenge) => (
                <ManageChallengeCard
                  challenge={challenge}
                  onMoveClick={() => {
                    if (challenge.id != null) {
                      setMoveModalChallenge({ id: challenge.id, name: challenge.name })
                    }
                  }}
                  isPinned={challenge.id != null && pinnedChallengeIds.includes(challenge.id)}
                  onTogglePin={
                    challenge.id != null ? () => toggleChallengePin(challenge.id) : undefined
                  }
                  onCloneClick={
                    challenge.id != null
                      ? () => setCloneModalChallenge({ id: challenge.id, name: challenge.name })
                      : undefined
                  }
                  onDeleteClick={
                    challenge.id != null ? () => setDeleteChallengeId(challenge.id) : undefined
                  }
                  onArchiveClick={
                    challenge.id != null
                      ? () =>
                          archiveChallengeMutation.mutate({
                            challengeId: challenge.id,
                            isArchived: !(challenge.isArchived ?? false),
                          })
                      : undefined
                  }
                  onRebuildClick={
                    challenge.id != null
                      ? () => rebuildChallengeMutation.mutate({ challengeId: challenge.id })
                      : undefined
                  }
                  onToggleVisibility={
                    challenge.id != null
                      ? () =>
                          updateChallengeMutation.mutate({
                            challengeId: challenge.id,
                            updates: { enabled: !(challenge.enabled ?? false) },
                          })
                      : undefined
                  }
                />
              )}
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

        <AlertDialog
          open={deleteProjectConfirm}
          onOpenChange={setDeleteProjectConfirm}
        >
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
    </AuthGuard>
  )
}
