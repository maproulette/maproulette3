import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '@/api'
import { ProjectResultsSection } from './ProjectResultsSection'

export const FindProject = ({
  searchQuery = '',
  onResultSelect,
}: {
  searchQuery?: string
  onResultSelect: () => void
}) => {
  const [limit, setLimit] = useState(5)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const trimmedSearchQuery = searchQuery.trim()
  const hasSearchQuery = trimmedSearchQuery.length > 0

  const searchQueryResult = api.project.searchProjects({ search: trimmedSearchQuery })
  const featuredQueryResult = api.project.featuredProjects({ limit: 50 })

  const rawData = hasSearchQuery ? searchQueryResult.data : featuredQueryResult.data
  const isLoading = hasSearchQuery ? searchQueryResult.isLoading : featuredQueryResult.isLoading
  const isFetching = hasSearchQuery ? searchQueryResult.isFetching : featuredQueryResult.isFetching

  // Reason: Avoids re-slicing raw data array on every render when data and limit haven't changed
  const data = useMemo(() => {
    if (!rawData || !Array.isArray(rawData)) return []
    return rawData.slice(0, limit)
  }, [rawData, limit])

  useEffect(() => {
    if (!isFetching && isLoadingMore) {
      setIsLoadingMore(false)
    }
  }, [isFetching, isLoadingMore])

  // Reason: Stable callback reference prevents child component re-renders when passed as prop
  const handleLoadMore = useCallback(() => {
    if (!isFetching && data && data.length >= limit) {
      setIsLoadingMore(true)
      setLimit((prev) => prev + 5)
    }
  }, [isFetching, data, limit])

  const results = data ?? []
  const hasMore = data && data.length >= limit

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-zinc-700 dark:text-slate-300">Results</h3>
          {!isLoading && data && data.length > 0 && (
            <span className="text-xs text-zinc-500 dark:text-slate-400">
              {data.length} project{data.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <ProjectResultsSection
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
