import { useLocation } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '@/api'
import {
  difficultyMap,
  workOnCategoryMap,
} from '@/components/Pages/ExploreChallengesPage/FilterBar/filterUtils'
import { DEFAULT_WORLD_BOUNDS } from '@/components/shared/Map/mapUtils'
import type { ExploreChallengesParams, ExtendedFindParamsSortBy } from '@/types/Challenge'
import { ChallengeResultsSection } from './challengeResultsSection'

const buildKeywords = (categories: string[], workOn: string): string | undefined => {
  const allKeywords: string[] = []
  if (categories.length > 0) {
    allKeywords.push(...categories)
  }
  if (workOn !== 'Anything') {
    const workOnKeywords = workOnCategoryMap[workOn as keyof typeof workOnCategoryMap]
    if (workOnKeywords && Array.isArray(workOnKeywords)) {
      allKeywords.push(...workOnKeywords)
    }
  }
  return allKeywords.length > 0 ? allKeywords.join(',') : undefined
}

export const FindChallenge = ({
  searchQuery = '',
  onResultSelect,
}: {
  searchQuery?: string
  onResultSelect: () => void
}) => {
  const [limit, setLimit] = useState(5)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const location = useLocation()
  const searchParamsString =
    typeof location.search === 'string'
      ? location.search
      : location.search
        ? new URLSearchParams(location.search as Record<string, string>).toString()
        : ''
  const searchParams = new URLSearchParams(searchParamsString)

  const filters = useMemo<ExploreChallengesParams>(() => {
    const urlDifficulty = searchParams.get('difficulty')
    const urlWorkOn = searchParams.get('workOn')
    const urlCategories = searchParams.get('categories')
    const urlSortBy = searchParams.get('sortBy')
    const urlGlobal = searchParams.get('global')
    const urlLocationId = searchParams.get('location_id')
    const urlBounds = searchParams.get('bounds')

    const selectedCategories = urlCategories ? urlCategories.split(',').filter(Boolean) : []
    const workOn = urlWorkOn || 'Anything'
    const difficulty = urlDifficulty
      ? difficultyMap[urlDifficulty as keyof typeof difficultyMap]
      : undefined

    const result: ExploreChallengesParams = {
      global: urlGlobal === 'true',
      bounds: urlBounds || DEFAULT_WORLD_BOUNDS,
      keywords: buildKeywords(selectedCategories, workOn),
      difficulty,
      location_id: urlLocationId ? parseInt(urlLocationId, 10) : undefined,
      limit: limit,
    }
    if (urlSortBy) {
      result.sortBy = urlSortBy as ExtendedFindParamsSortBy
    }
    return result
  }, [location.search, limit])

  const trimmedSearchQuery = searchQuery.trim()
  const hasSearchQuery = trimmedSearchQuery.length > 0

  const searchQueryResult = api.challenge.searchChallenges({ search: trimmedSearchQuery })

  const exploreQueryResult = api.challenge.exploreChallenges(filters)

  const rawData = hasSearchQuery ? searchQueryResult.data : exploreQueryResult.data
  const isLoading = hasSearchQuery ? searchQueryResult.isLoading : exploreQueryResult.isLoading
  const isFetching = hasSearchQuery ? searchQueryResult.isFetching : exploreQueryResult.isFetching

  const data = useMemo(() => {
    if (!rawData || !Array.isArray(rawData)) return []

    return rawData.slice(0, limit)
  }, [rawData, limit])

  useEffect(() => {
    if (!isFetching && isLoadingMore) {
      setIsLoadingMore(false)
    }
  }, [isFetching, isLoadingMore])

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
          <h3 className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">Results</h3>
          {!isLoading && data && data.length > 0 && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {data.length} challenge{data.length !== 1 ? 's' : ''}
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
