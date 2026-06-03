import { Archive, CheckCircle2, Eye, Loader2, Pin, User } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { api } from '@/api'
import { getPinnedProjectIds } from '@/components/Pages/ManagementPages/ManageProjects/pinnedProjects'
import { ClearManageFiltersButton } from '@/components/shared/ClearManageFiltersButton'
import { FilterToggle } from '@/components/shared/FilterToggle'
import { SearchBar } from '@/components/shared/SearchBar'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { useAuthContext } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import type { Project } from '@/types/Project'

const PAGE_SIZE = 20

interface ProjectPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedProjectId?: number
  onSelectProject: (project: Project) => void
  title?: string
  description?: string
  excludeProjectIds?: number[]
}

export const ProjectPickerModal = ({
  open,
  onOpenChange,
  selectedProjectId,
  onSelectProject,
  title = 'Select a project',
  description = 'Choose the project this challenge belongs to.',
  excludeProjectIds,
}: ProjectPickerModalProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [onlyEnabled, setOnlyEnabled] = useState(false)
  const [onlyOwned, setOnlyOwned] = useState(false)
  const [onlyShowArchived, setOnlyShowArchived] = useState(false)
  const [onlyShowPinned, setOnlyShowPinned] = useState(false)
  const [loadedPages, setLoadedPages] = useState(1)

  // Reset pagination when server-side filters change so a narrower result set
  // doesn't keep an oversized limit from a prior search.
  useEffect(() => {
    setLoadedPages(1)
  }, [searchQuery, onlyEnabled, onlyOwned])

  const {
    data: projects,
    isLoading,
    isFetching,
  } = api.project.getManagedProjects({
    limit: PAGE_SIZE * loadedPages,
    page: 0,
    searchString: searchQuery,
    onlyEnabled,
    onlyOwned,
  })

  const hasNextPage = (projects?.length ?? 0) >= PAGE_SIZE * loadedPages

  const { user } = useAuthContext()
  const pinnedProjectIds = useMemo(() => getPinnedProjectIds(user), [user])
  const excluded = useMemo(() => new Set(excludeProjectIds ?? []), [excludeProjectIds])

  const projectsToShow = useMemo(() => {
    const list = projects ?? []
    const set = new Set(pinnedProjectIds)
    const sorted = [...list].sort((a, b) => {
      const aPinned = a.id != null && set.has(a.id) ? 1 : 0
      const bPinned = b.id != null && set.has(b.id) ? 1 : 0
      return bPinned - aPinned
    })
    const filtered = sorted.filter(
      (p) => (p.isArchived ?? false) === onlyShowArchived && !(p.id != null && excluded.has(p.id))
    )
    if (onlyShowPinned) {
      return filtered.filter((p) => p.id != null && set.has(p.id))
    }
    return filtered
  }, [projects, pinnedProjectIds, onlyShowArchived, onlyShowPinned, excluded])

  const handleSelect = (project: Project) => {
    onSelectProject(project)
    onOpenChange(false)
  }

  const hasActiveFilters = onlyEnabled || onlyOwned || onlyShowPinned || onlyShowArchived

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="2xl" className="flex max-h-[85vh] flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-3">
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
            hasActiveFilters={hasActiveFilters}
            onClear={() => {
              setOnlyEnabled(false)
              setOnlyOwned(false)
              setOnlyShowPinned(false)
              setOnlyShowArchived(false)
            }}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-zinc-200 dark:border-slate-700">
          {isLoading ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
          ) : projectsToShow.length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              No projects found.
            </div>
          ) : (
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {projectsToShow.map((project) => {
                const isSelected = project.id != null && project.id === selectedProjectId
                const isPinned = project.id != null && pinnedProjectIds.includes(project.id)
                return (
                  <li key={project.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(project)}
                      className={cn(
                        'flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-slate-800/50',
                        isSelected && 'bg-blue-50 dark:bg-blue-950/40'
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        {isPinned && (
                          <Pin className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                        )}
                        <span className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                          {project.displayName || project.name}
                        </span>
                        {project.id != null && (
                          <span className="shrink-0 text-zinc-500 dark:text-zinc-400">
                            (ID: {project.id})
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          {!isLoading && projectsToShow.length > 0 && hasNextPage && (
            <div className="flex justify-center p-3">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => setLoadedPages((p) => p + 1)}
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
