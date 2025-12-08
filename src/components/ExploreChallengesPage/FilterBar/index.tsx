import { useExploreChallengesSearchContext } from '@/components/ExploreChallengesPage/ExploreChallengesSearchContext'
import { useFilterUrlSync } from '../hooks'
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
  const { searchParams, difficulty, workOn, selectedCategories, sortBy, handleClearFilters } =
    useExploreChallengesSearchContext()

  const hasActiveFilters =
    difficulty !== 'Any' ||
    workOn !== 'Anything' ||
    selectedCategories.length > 0 ||
    searchParams.global !== undefined ||
    searchParams.location_id !== undefined ||
    searchParams.keywords !== undefined

  useFilterUrlSync({
    workOn,
    selectedCategories,
    sortBy,
    global: searchParams.global ?? undefined,
    locationId: searchParams.location_id ?? undefined,
    bounds: searchParams.bounds ?? undefined,
    keywords: searchParams.keywords ?? undefined,
    difficulty: searchParams.difficulty ?? undefined,
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
