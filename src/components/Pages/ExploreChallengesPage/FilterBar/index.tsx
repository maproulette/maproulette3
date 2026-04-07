import { useNavigate } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { isWorldBounds } from '@/components/Map/mapUtils'
import { useExploreChallengesSearchContext } from '@/components/Pages/ExploreChallengesPage/ExploreChallengesSearchContext'
import { CategoryFilter } from './CategoryFilter'
import { ClearFiltersButton } from './ClearFiltersButton'
import { DifficultyFilter } from './DifficultyFilter'
import { reverseDifficultyMap } from './filterUtils'
import { GlobalToggle } from './GlobalMapToggles'
import { LocationSearchFilter } from './LocationSearchFilter'
import { SortByFilter } from './SortByFilter'
import { ViewModeToggle } from './ViewModeToggle'
import { WorkOnFilter } from './WorkOnFilter'

const DEBOUNCE_MS = 150

export const FilterBar = () => {
  const navigate = useNavigate()
  const {
    bounds,
    difficulty,
    workOn,
    selectedCategories,
    sortBy,
    viewMode,
    locationId,
    global,
    keywords,
  } = useExploreChallengesSearchContext()

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
          keywords: keywords && keywords !== '' ? keywords : undefined,
          difficulty:
            difficulty !== undefined
              ? reverseDifficultyMap[difficulty as unknown as number]
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
    keywords,
    difficulty,
    viewMode,
    navigate,
  ])

  return (
    <div className="flex items-center gap-3 overflow-x-auto">
      <LocationSearchFilter />
      <SortByFilter />
      <WorkOnFilter />
      <DifficultyFilter />
      <CategoryFilter />
      <GlobalToggle />
      <ClearFiltersButton />
      <div className="ml-auto">
        <ViewModeToggle />
      </div>
    </div>
  )
}
