import { useExploreChallengesSearchContext } from '@/components/ExploreChallengesPage/ExploreChallengesSearchContext'
import { CategoryFilter } from './CategoryFilter'
import { ClearFiltersButton } from './ClearFiltersButton'
import { DifficultyFilter } from './DifficultyFilter'
import { FilterDivider } from './FilterDivider'
import { GlobalToggle } from './GlobalMapToggles'
import { LocationSearchFilter } from './LocationSearchFilter'
import { SortByFilter } from './SortByFilter'
import { ViewModeToggle } from './ViewModeToggle'
import { WorkOnFilter } from './WorkOnFilter'
import { useEffect, useRef } from 'react'
import { isWorldBounds } from '@/utils/mapUtils'
import { reverseDifficultyMap } from './filterUtils'
import { useNavigate } from '@tanstack/react-router'

const DEBOUNCE_MS = 150

export const FilterBar = () => {
  const navigate = useNavigate()
  const {
    searchParams,
    bounds,
    difficulty,
    workOn,
    selectedCategories,
    sortBy,
    handleClearFilters,
    viewMode,
    locationId,
    global,
  } = useExploreChallengesSearchContext()

  const hasActiveFilters =
    difficulty !== 'Any' ||
    workOn !== 'Anything' ||
    selectedCategories.length > 0 ||
    searchParams?.global !== undefined ||
    searchParams?.location_id !== undefined ||
    searchParams?.keywords !== undefined

  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      navigate({
        to: '/',
        search: (prev) => ({
          ...prev,
          workOn: workOn !== 'Anything' ? workOn : undefined,
          categories: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
          sortBy: sortBy !== 'name' ? sortBy : undefined,
          global: global ? true : undefined,
          location_id: locationId ?? undefined,
          bounds: bounds && !isWorldBounds(bounds) ? bounds : undefined,
          keywords: searchParams?.keywords && searchParams?.keywords !== '' ? searchParams?.keywords : undefined,
          difficulty:
          searchParams?.difficulty !== undefined
              ? (reverseDifficultyMap[difficulty as unknown as number])
              : undefined,
          viewMode: viewMode !== 'grid-map' ? viewMode : undefined,
        }),
        replace: true,
      })
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timeoutRef.current ?? undefined)
    }
  }, [
    workOn,
    selectedCategories,
    sortBy,
    global,
    locationId,
    bounds,
    searchParams?.keywords,
    difficulty,
    viewMode,
    navigate,
  ])

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

          <ViewModeToggle />

          <FilterDivider />

          <GlobalToggle />

          <FilterDivider />

          <ClearFiltersButton onClear={handleClearFilters} hasActiveFilters={hasActiveFilters} />
        </div>
      </div>
    </div>
  )
}
