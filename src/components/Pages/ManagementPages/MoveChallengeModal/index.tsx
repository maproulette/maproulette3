import { Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { api } from '@/api'
import { SearchBar } from '@/components/SearchBar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { cn } from '@/components/utils'
import type { Project } from '@/types/Project'

interface MoveChallengeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  challengeId: number
  challengeName: string
  currentProjectId: number
  onMoved?: () => void
}

export const MoveChallengeModal = ({
  open,
  onOpenChange,
  challengeId,
  challengeName,
  currentProjectId,
  onMoved,
}: MoveChallengeModalProps) => {
  const [searchQuery, setSearchQuery] = useState('')

  const { data: projects = [], isLoading } = api.project.getManagedProjects({
    limit: 100,
    searchString: searchQuery,
  })

  const moveChallenge = api.challenge.useMoveChallenge()

  const candidateProjects = useMemo(
    () => projects.filter((p) => p.id != null && p.id !== currentProjectId),
    [projects, currentProjectId]
  )

  const handleSelectProject = (project: Project) => {
    if (project.id == null) return
    moveChallenge.mutate(
      { challengeId, toProjectId: project.id },
      {
        onSuccess: () => {
          onOpenChange(false)
          onMoved?.()
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col">
        <DialogHeader>
          <DialogTitle>Move Challenge</DialogTitle>
          <DialogDescription>
            Choose a project to move &quot;{challengeName}&quot; to. The challenge will be removed
            from the current project.
          </DialogDescription>
        </DialogHeader>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search projects..."
          className="mb-4"
        />

        <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-zinc-200 dark:border-zinc-800">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
          ) : candidateProjects.length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              No other projects found. Create another project first to move this challenge.
            </div>
          ) : (
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {candidateProjects.map((project) => (
                <li key={project.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectProject(project)}
                    disabled={moveChallenge.isPending}
                    className={cn(
                      'w-full px-4 py-3 text-left text-sm transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-zinc-800/50',
                      moveChallenge.isPending && 'cursor-not-allowed'
                    )}
                  >
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                      {project.displayName || project.name}
                    </span>
                    {project.id != null && (
                      <span className="ml-2 text-zinc-500 dark:text-zinc-400">
                        (ID: {project.id})
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {moveChallenge.isError && (
          <p className="text-red-600 text-sm dark:text-red-400">
            Failed to move challenge. You may not have permission to move to that project.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
