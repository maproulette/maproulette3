import { useCallback } from 'react'
import { useExploreChallengesMapContext } from '@/contexts/exploreChallenges/ExploreChallengesMapContext'
import { useSearchContext } from '@/contexts/exploreChallenges/SearchContext'
import { useFilterUrlSync, useMapBoundsSync } from '../hooks'
import { CategoryFilter } from './CategoryFilter'
import { ClearFiltersButton } from './ClearFiltersButton'
import { DifficultyFilter } from './DifficultyFilter'
import { FilterDivider } from './FilterDivider'
import type { FilterBarProps } from './filterTypes'
import { GlobalToggle } from './GlobalMapToggles'
import { LocationSearchFilter } from './LocationSearchFilter'
import { SortByFilter } from './SortByFilter'
import { ViewModeToggle } from './ViewModeToggle'
import { WorkOnFilter } from './WorkOnFilter'

export const FilterBar = ({ viewMode, onViewModeChange }: FilterBarProps) => {
  const { map, mapLoaded } = useExploreChallengesMapContext()
  const {
    searchParams,
    setBounds,
    difficulty,
    workOn,
    selectedCategories,
    sortBy,
    handleClearFilters,
  } = useSearchContext()

  const showMap = viewMode === 'grid-map'

  const hasActiveFilters =
    difficulty !== 'Any' ||
    workOn !== 'Anything' ||
    selectedCategories.length > 0 ||
    searchParams.global !== undefined ||
    searchParams.location_id !== undefined ||
    searchParams.keywords !== undefined

  const handleBoundsChange = useCallback(
    (bounds: string) => {
      setBounds(bounds)
    },
    [setBounds]
  )

  useMapBoundsSync({
    map,
    mapLoaded,
    showMap,
    initialBounds: searchParams.bounds,
    onBoundsChange: handleBoundsChange,
  })

  useFilterUrlSync({
    workOn,
    selectedCategories,
    sortBy,
    global: searchParams.global,
    locationId: searchParams.location_id,
    bounds: searchParams.bounds,
    keywords: searchParams.keywords,
    difficulty: searchParams.difficulty,
  })

  return (
    <div className="border-zinc-200 border-b bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto">
          <LocationSearchFilter />

          <FilterDivider />

          <SortByFilter />

          <FilterDivider />

          <WorkOnFilter />

          <FilterDivider />

          <DifficultyFilter />

          <FilterDivider />

          <CategoryFilter />

          <FilterDivider />

          <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />

          <FilterDivider />

          <GlobalToggle />

          <FilterDivider />

          <ClearFiltersButton onClear={handleClearFilters} hasActiveFilters={hasActiveFilters} />
        </div>
      </div>
    </div>
  )
}
