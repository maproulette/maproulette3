import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '@/api'
import type { Challenge, ExploreChallengesParams } from '@/types/Challenge'
import { FiltersSection } from '../../FiltersSection'
import { ChallengeResultsSection } from './FindChallengeFilterSection'

export const ExploreChallengesFilters = ({ onResultSelect }: { onResultSelect: () => void }) => {
  const [limit, setLimit] = useState(5)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [filters, setFilters] = useState<ExploreChallengesParams>({
    global: false,
    sortBy: 'name',
    bounds: undefined,
    limit: limit,
  })

  const { data, isLoading, isFetching } = useQuery(
    api.challenge.exploreChallenges({ ...filters, limit })
  ) as {
    data: Challenge[]
    isLoading: boolean
    isFetching: boolean
  }

  // Reset isLoadingMore when fetching completes
  useEffect(() => {
    if (!isFetching && isLoadingMore) {
      setIsLoadingMore(false)
    }
  }, [isFetching, isLoadingMore])

  const handleFiltersChange = (newFilters: ExploreChallengesParams) => {
    setFilters(newFilters)
    setLimit(5) // Reset limit when filters change
    setIsLoadingMore(false)
  }

  const handleLoadMore = useCallback(() => {
    if (!isFetching && data && data.length >= limit) {
      setIsLoadingMore(true)
      setLimit((prev) => prev + 5)
    }
  }, [isFetching, data, limit])

  const linkWithFilters = useMemo(() => {
    return `${window.location.origin}/challenge/explore?${new URLSearchParams(filters as Record<string, string>).toString()}`
  }, [filters])

  const results = [linkWithFilters, ...(data ?? [])]
  const hasMore = data && data.length >= limit

  return (
    <div className="space-y-6">
      <FiltersSection onFiltersChange={handleFiltersChange} />
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">Results</h3>
          {!isLoading && data && data.length > 0 && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {data.length} challenge{data.length !== 1 ? 's' : ''}
              {hasMore && ' (scroll for more)'}
            </span>
          )}
        </div>
        <ChallengeResultsSection
          results={results}
          isLoading={isLoading}
          isFetching={isFetching}
          isLoadingMore={isLoadingMore}
          onResultSelect={onResultSelect}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
        />
      </div>
    </div>
  )
}
