import Fuse from 'fuse.js'
import type { LucideIcon } from 'lucide-react'
import {
  FileText,
  FolderOpen,
  Hash,
  ListTodo,
  MessageCircle,
  MessageSquare,
  Target,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { SearchType } from '@/types/GlobalSearch'

interface SearchTypeOption {
  id: SearchType
  label: string
  description: string
  icon: LucideIcon
  keywords: string[]
}

interface SearchTypeSelectorProps {
  onSelectSearchType: (searchType: { id: SearchType; label: string; description: string }) => void
  searchQuery?: string
}

export const SearchTypeSelector = ({
  onSelectSearchType,
  searchQuery = '',
}: SearchTypeSelectorProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const allSearchTypes = useMemo<SearchTypeOption[]>(
    () => [
      {
        id: SearchType.FIND_A_CHALLENGE,
        label: 'Find a Challenge',
        description:
          'Search for mapping challenges with filters for difficulty, location, and tags',
        icon: Target,
        keywords: ['challenge', 'mapping', 'task set', 'quest'],
      },
      {
        id: SearchType.FIND_A_TASK,
        label: 'Find a Task',
        description: 'Search for individual mapping tasks by ID, status, priority, or location',
        icon: ListTodo,
        keywords: ['task', 'item', 'work', 'todo'],
      },
      {
        id: SearchType.FIND_A_PROJECT,
        label: 'Find a Project',
        description: 'Browse projects containing multiple challenges organized by theme or area',
        icon: FolderOpen,
        keywords: ['project', 'collection', 'group', 'organization'],
      },
      {
        id: SearchType.FIND_A_MAPROULETTE_ID,
        label: 'Find by MapRoulette ID',
        description: 'Quickly navigate to any resource (project, challenge, or task) using its ID',
        icon: Hash,
        keywords: ['id', 'identifier', 'number', 'direct'],
      },
      {
        id: SearchType.FIND_A_MAPROULETTE_FEATURE_BY_NAME,
        label: 'Find a Feature by Name',
        description: 'Search for geographic features like roads, buildings, or landmarks by name',
        icon: FileText,
        keywords: ['feature', 'place', 'location', 'geography', 'name'],
      },
      {
        id: SearchType.FIND_A_TASK_COMMENT,
        label: 'Find Task Comments',
        description: 'Search through comments left on tasks for discussions and notes',
        icon: MessageCircle,
        keywords: ['comment', 'task', 'discussion', 'note', 'feedback'],
      },
      {
        id: SearchType.FIND_A_CHALLENGE_COMMENT,
        label: 'Find Challenge Comments',
        description: 'Search through comments on challenges for questions and suggestions',
        icon: MessageSquare,
        keywords: ['comment', 'challenge', 'discussion', 'question', 'feedback'],
      },
    ],
    []
  )

  const filteredSearchTypes = useMemo(() => {
    const query = searchQuery.trim()
    if (!query) return allSearchTypes

    const isNumber = /^\d+$/.test(query)

    const wordCount = query.split(/\s+/).length
    const isSentence = wordCount >= 3

    let relevantSearchTypes = allSearchTypes
    if (isNumber) {
      relevantSearchTypes = allSearchTypes.filter((type) =>
        [
          SearchType.FIND_A_MAPROULETTE_ID,
          SearchType.FIND_A_TASK,
          SearchType.FIND_A_CHALLENGE,
          SearchType.FIND_A_PROJECT,
        ].includes(type.id)
      )
    } else if (isSentence) {
      relevantSearchTypes = allSearchTypes.filter((type) =>
        [
          SearchType.FIND_A_TASK_COMMENT,
          SearchType.FIND_A_CHALLENGE_COMMENT,
          SearchType.FIND_A_MAPROULETTE_FEATURE_BY_NAME,
        ].includes(type.id)
      )
    }

    const fuseFiltered = new Fuse(relevantSearchTypes, {
      keys: ['label', 'description', 'keywords'],
      threshold: 0.4,
      distance: 100,
      minMatchCharLength: 1,
      includeScore: true,
    })

    const results = fuseFiltered.search(query)

    return results.length > 0 ? results.map((result) => result.item) : relevantSearchTypes
  }, [searchQuery, allSearchTypes])

  useEffect(() => {
    setSelectedIndex(filteredSearchTypes.length > 0 ? 0 : -1)
  }, [filteredSearchTypes])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredSearchTypes.length === 0) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => {
          const next = prev < filteredSearchTypes.length - 1 ? prev + 1 : prev

          setTimeout(() => {
            const element = document.querySelector(`[data-search-type-index="${next}"]`)
            element?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
          }, 0)
          return next
        })
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => {
          const next = prev > 0 ? prev - 1 : 0

          setTimeout(() => {
            const element = document.querySelector(`[data-search-type-index="${next}"]`)
            element?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
          }, 0)
          return next
        })
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault()
        onSelectSearchType(filteredSearchTypes[selectedIndex])
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [filteredSearchTypes, selectedIndex, onSelectSearchType])

  return (
    <div className="">
      {filteredSearchTypes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 px-3 py-8">
          <div className="rounded-full bg-zinc-100 p-3 dark:bg-zinc-800">
            <FileText className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
          </div>
          <div className="text-center">
            <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
              No search types match
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Try different keywords: "{searchQuery}"
            </p>
          </div>
        </div>
      ) : (
        <>
          {searchQuery && (
            <div className="mb-3 px-3 text-xs text-zinc-500 dark:text-zinc-400">
              {filteredSearchTypes.length} search type{filteredSearchTypes.length !== 1 ? 's' : ''}{' '}
              available
            </div>
          )}
          <ul className="space-y-1.5">
            {filteredSearchTypes.map((searchType: SearchTypeOption, index) => {
              const Icon = searchType.icon
              const isSelected = index === selectedIndex
              return (
                <li key={searchType.id} data-search-type-index={index}>
                  <button
                    type="button"
                    onClick={() => onSelectSearchType(searchType)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onSelectSearchType(searchType)
                      }
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      'group w-full cursor-pointer rounded-lg border px-3 py-3 text-left transition-all duration-200',
                      isSelected
                        ? 'scale-[1.01] border-emerald-200 bg-emerald-50 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-900/10'
                        : 'border-transparent hover:scale-[1.01] hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-sm dark:hover:border-emerald-900/50 dark:hover:bg-emerald-900/10'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'rounded-lg p-2 transition-colors',
                          isSelected
                            ? 'bg-emerald-100 dark:bg-emerald-900/30'
                            : 'bg-zinc-100 group-hover:bg-emerald-100 dark:bg-zinc-800 dark:group-hover:bg-emerald-900/30'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4 transition-colors',
                            isSelected
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-zinc-600 group-hover:text-emerald-600 dark:text-zinc-400 dark:group-hover:text-emerald-400'
                          )}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className={cn(
                            'flex items-center gap-2 font-semibold text-sm transition-colors',
                            isSelected
                              ? 'text-emerald-700 dark:text-emerald-300'
                              : 'text-zinc-900 group-hover:text-emerald-700 dark:text-zinc-100 dark:group-hover:text-emerald-300'
                          )}
                        >
                          <span>{searchType.label}</span>
                        </div>
                        <p className="mt-1 text-xs text-zinc-600 leading-relaxed dark:text-zinc-400">
                          {searchType.description}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
