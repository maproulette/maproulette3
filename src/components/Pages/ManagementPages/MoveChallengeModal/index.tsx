import { Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { api } from '@/api'
import { SearchBar } from '@/components/shared/SearchBar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { useMoveChallengeContext } from '@/contexts/MoveChallengeContext'
import { useIntl } from '@/i18n'
import { cn } from '@/lib/utils'
import type { Project } from '@/types/Project'

export const MoveChallengeModal = () => {
  const { t } = useIntl()
  const {
    challenge,
    currentProjectId,
    isOpen,
    closeMoveModal,
    moveChallengeTo,
    isPending,
    isError,
  } = useMoveChallengeContext()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: projects = [], isLoading } = api.project.getManagedProjects({
    limit: 100,
    searchString: searchQuery,
  })

  const candidateProjects = useMemo(
    () => projects.filter((p) => p.id != null && p.id !== currentProjectId),
    [projects, currentProjectId]
  )

  const handleSelectProject = (project: Project) => {
    if (project.id == null) return
    moveChallengeTo(project.id)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeMoveModal()}>
      <DialogContent className="flex max-h-[85vh] flex-col">
        <DialogHeader>
          <DialogTitle>{t('moveChallengeModal.title', undefined, 'Move Challenge')}</DialogTitle>
          <DialogDescription>
            {t(
              'moveChallengeModal.description',
              { challengeName: challenge?.name ?? '' },
              'Choose a project to move "{challengeName}" to. The challenge will be removed from the current project.'
            )}
          </DialogDescription>
        </DialogHeader>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('common.searchProjects', undefined, 'Search projects...')}
          className="mb-4"
        />

        <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-zinc-200 dark:border-slate-700">
          {isLoading ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
          ) : candidateProjects.length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              {t(
                'moveChallengeModal.noProjects',
                undefined,
                'No other projects found. Create another project first to move this challenge.'
              )}
            </div>
          ) : (
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {candidateProjects.map((project) => (
                <li key={project.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectProject(project)}
                    disabled={isPending}
                    className={cn(
                      'w-full px-4 py-3 text-left text-sm transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-slate-800/50',
                      isPending && 'cursor-not-allowed'
                    )}
                  >
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                      {project.displayName || project.name}
                    </span>
                    {project.id != null && (
                      <span className="ml-2 text-zinc-500 dark:text-zinc-400">
                        {t('common.idNumberParenthetical', { id: project.id }, '(ID: {id})')}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {isError && (
          <p className="text-red-600 text-sm dark:text-red-400">
            {t(
              'moveChallengeModal.moveError',
              undefined,
              'Failed to move challenge. You may not have permission to move to that project.'
            )}
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
