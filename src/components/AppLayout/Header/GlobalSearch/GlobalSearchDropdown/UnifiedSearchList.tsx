import { useQuery } from '@tanstack/react-query'
import { FolderOpen, Target, type LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { api } from '@/api'
import type { ChallengeGetResponse } from '@/types/Challenge'
import type { Project } from '@/types/Project'
import { SearchType } from '@/types/GlobalSearch'
import { LoadingState } from '../shared/LoadingState'
import { cn } from '@/lib/utils'
import { useAllSearchTypes, useFilteredSearchTypes } from '../shared/searchTypes'

interface UnifiedSearchListProps {
  searchQuery: string
  onResultSelect: () => void
  onSelectSearchType: (searchType: { id: SearchType; label: string; description: string; prefix: string }) => void
}

interface SearchResultItem {
  id: string
  type: 'project' | 'challenge' | 'searchType'
  title: string
  icon: LucideIcon
  badge?: { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }
  href?: string
  params?: Record<string, string>
  onClick?: () => void
}

const badgeVariants = {
  default: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
}

export const UnifiedSearchList = ({
  searchQuery,
  onResultSelect,
  onSelectSearchType,
}: UnifiedSearchListProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const trimmedQuery = searchQuery.trim()
  const hasSearchQuery = trimmedQuery.length > 0

  const {
    data: projects = [],
    isLoading: isLoadingProjects,
  } = useQuery({
    ...api.project.searchProjects({
      search: trimmedQuery
    }),
    enabled: hasSearchQuery,
  })

  const {
    data: challenges = [],
    isLoading: isLoadingChallenges,
  } = useQuery({
    ...api.challenge.searchChallenges({
      search: trimmedQuery
    }),
    enabled: hasSearchQuery,
  })

  const {
    data: featuredChallengesData,
    isLoading: isLoadingFeatured,
  } = useQuery({
    ...api.challenge.featuredChallenges({
      limit: 10,
    }),
    enabled: !hasSearchQuery,
  })

  // The API returns an array, but the type definition might be incorrect
  const featuredChallenges: ChallengeGetResponse[] = Array.isArray(featuredChallengesData) 
    ? featuredChallengesData 
    : featuredChallengesData 
      ? [featuredChallengesData as ChallengeGetResponse] 
      : []

  const allSearchTypes = useAllSearchTypes()
  const filteredSearchTypes = useFilteredSearchTypes(trimmedQuery, allSearchTypes)

  const allItems = useMemo<SearchResultItem[]>(() => {
    const resultItems: SearchResultItem[] = []

    if (hasSearchQuery) {
      // Add projects first when searching
      if (!isLoadingProjects) {
        projects.forEach((project: Project) => {
          resultItems.push({
            id: `project-${project.id}`,
            type: 'project',
            title: project.displayName || project.name,
            icon: FolderOpen,
            badge: { variant: 'default', label: 'Go to project' },
            href: '/project/$projectId',
            params: { projectId: String(project.id) },
            onClick: onResultSelect,
          })
        })
      }

      // Add challenges second when searching
      if (!isLoadingChallenges) {
        challenges.forEach((challenge: ChallengeGetResponse) => {
          resultItems.push({
            id: `challenge-${challenge.id}`,
            type: 'challenge',
            title: challenge.name,
            icon: Target,
            badge: { variant: 'default', label: 'Go to challenge' },
            href: '/challenge/$challengeId',
            params: { challengeId: String(challenge.id) },
            onClick: onResultSelect,
          })
        })
      }
    } else {
      // Add featured challenges when no search query
      if (!isLoadingFeatured) {
        featuredChallenges.forEach((challenge: ChallengeGetResponse) => {
          resultItems.push({
            id: `challenge-${challenge.id}`,
            type: 'challenge',
            title: challenge.name,
            icon: Target,
            badge: { variant: 'default', label: 'Go to challenge' },
            href: '/challenge/$challengeId',
            params: { challengeId: String(challenge.id) },
            onClick: onResultSelect,
          })
        })
      }
    }

    // Add search types last
    filteredSearchTypes.forEach((searchType) => {
      resultItems.push({
        id: `searchType-${searchType.id}`,
        type: 'searchType',
        title: searchType.label,
        icon: searchType.icon,
        onClick: () => onSelectSearchType({
          id: searchType.id,
          label: searchType.label,
          description: searchType.description,
          prefix: searchType.prefix,
        }),
      })
    })

    return resultItems
  }, [projects, challenges, featuredChallenges, filteredSearchTypes, isLoadingProjects, isLoadingChallenges, isLoadingFeatured, hasSearchQuery, onResultSelect, onSelectSearchType])

  useEffect(() => {
    setSelectedIndex(allItems.length > 0 ? 0 : -1)
  }, [allItems.length])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (allItems.length === 0) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => {
          const next = prev < allItems.length - 1 ? prev + 1 : prev
          setTimeout(() => {
            const element = document.querySelector(`[data-item-index="${next}"]`)
            element?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
          }, 0)
          return next
        })
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => {
          const next = prev > 0 ? prev - 1 : 0
          setTimeout(() => {
            const element = document.querySelector(`[data-item-index="${next}"]`)
            element?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
          }, 0)
          return next
        })
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault()
        const item = allItems[selectedIndex]
        if (item.type === 'searchType') {
          item.onClick?.()
        } else if (item.href) {
          // For project/challenge items, navigate to the href
          const element = document.querySelector(`[data-item-index="${selectedIndex}"] a`)
          if (element instanceof HTMLAnchorElement) {
            element.click()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [allItems, selectedIndex])

  if ((hasSearchQuery && (isLoadingProjects || isLoadingChallenges)) || (!hasSearchQuery && isLoadingFeatured)) {
    return <LoadingState message="Loading..." />
  }

  if (allItems.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">No results found</p>
      </div>
    )
  }

  return (
    <ul className="space-y-1">
      {allItems.map((item, index) => {
        const Icon = item.icon
        const isSelected = index === selectedIndex

        if (item.type === 'searchType') {
          return (
            <li key={item.id} data-item-index={index}>
              <button
                type="button"
                onClick={item.onClick}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    item.onClick?.()
                  }
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  'group w-full cursor-pointer rounded-lg border px-2.5 py-2 text-left transition-colors',
                  isSelected
                    ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/10'
                    : 'border-transparent hover:border-emerald-200 hover:bg-emerald-50 dark:hover:border-emerald-900/50 dark:hover:bg-emerald-900/10'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      'rounded-md p-1.5 transition-colors',
                      isSelected
                        ? 'bg-emerald-100 dark:bg-emerald-900/30'
                        : 'bg-zinc-100 group-hover:bg-emerald-100 dark:bg-zinc-800 dark:group-hover:bg-emerald-900/30'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-3.5 w-3.5 transition-colors',
                        isSelected
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-zinc-600 group-hover:text-emerald-600 dark:text-zinc-400 dark:group-hover:text-emerald-400'
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      'truncate text-sm font-medium transition-colors',
                      isSelected
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-zinc-900 group-hover:text-emerald-700 dark:text-zinc-100 dark:group-hover:text-emerald-300'
                    )}
                  >
                    {item.title}
                  </span>
                </div>
              </button>
            </li>
          )
        }

        return (
          <li key={item.id} data-item-index={index}>
            <Link
              to={item.href!}
              params={item.params}
              onClick={() => {
                // Ensure navigation happens, then close the dropdown
                item.onClick?.()
              }}
              onMouseEnter={() => setSelectedIndex(index)}
              className={cn(
                'group flex items-center justify-between rounded-lg border px-3 py-2',
                'transition-all duration-200',
                isSelected
                  ? 'border-emerald-200 bg-emerald-50 shadow-md dark:border-emerald-900/50 dark:bg-emerald-900/10'
                  : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-900'
              )}
            >
              <div className="min-w-0 flex-1 flex items-center gap-2.5">
                <div
                  className={cn(
                    'shrink-0 rounded-md p-1.5 transition-colors',
                    isSelected
                      ? 'bg-emerald-100 dark:bg-emerald-900/30'
                      : 'bg-zinc-100 dark:bg-zinc-800'
                  )}
                >
                  <Icon className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3
                      className={cn(
                        'flex-1 truncate text-sm font-medium transition-colors',
                        isSelected
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-zinc-900 group-hover:text-emerald-600 dark:text-zinc-100 dark:group-hover:text-emerald-400'
                      )}
                    >
                      {item.title}
                    </h3>
                    {item.badge && (
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-1.5 py-0.5 text-xs font-medium',
                          badgeVariants[item.badge.variant || 'default']
                        )}
                      >
                        {item.badge.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-zinc-400 transition-all group-hover:translate-x-0.5 group-hover:text-emerald-500 dark:text-zinc-500 dark:group-hover:text-emerald-400" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

