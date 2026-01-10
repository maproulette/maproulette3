import { FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { SearchType } from '@/types/GlobalSearch'
import { useAllSearchTypes, useFilteredSearchTypes } from '../shared/searchTypes'

interface SearchTypeSelectorProps {
  onSelectSearchType: (searchType: { id: SearchType; label: string; description: string }) => void
  searchQuery?: string
}

export const SearchTypeSelector = ({
  onSelectSearchType,
  searchQuery = '',
}: SearchTypeSelectorProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const allSearchTypes = useAllSearchTypes()
  const filteredSearchTypes = useFilteredSearchTypes(searchQuery, allSearchTypes)

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
        <ul className="space-y-1">
          {filteredSearchTypes.map((searchType, index) => {
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
                        'truncate font-medium text-sm transition-colors',
                        isSelected
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-zinc-900 group-hover:text-emerald-700 dark:text-zinc-100 dark:group-hover:text-emerald-300'
                      )}
                    >
                      {searchType.label}
                    </span>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
