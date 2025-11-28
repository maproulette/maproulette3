import { useNavigate } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { useSearchContext } from '@/contexts/exploreChallenges/SearchContext'
import { useMapContext } from '@/contexts/MapContext'
import type { ExtendedFindParamsSortBy } from '@/types/Challenge'
import { fitMapToBounds, getMapBoundsString, parseBoundsString } from '@/utils/mapUtils'
import {
  CategoryFilter,
  ClearFiltersButton,
  DifficultyFilter,
  difficultyMap,
  type FilterBarProps,
  FilterDivider,
  GlobalToggle,
  SortByFilter,
  type ViewMode,
  ViewModeToggle,
  WorkOnFilter,
  workOnCategoryMap,
} from './filters'
import { LocationSearchFilter } from './LocationSearchFilter'

export type { ViewMode }

export const FilterBar = ({ viewMode, onViewModeChange }: FilterBarProps) => {
  const navigate = useNavigate()
  const { map, mapLoaded } = useMapContext()
  const {
    extendedFindParams,
    setExtendedFindParams,
    setTaskMarkerParams,
    difficulty,
    setDifficulty,
    workOn,
    setWorkOn,
    selectedCategories,
    setSelectedCategories,
  } = useSearchContext()

  const hasAppliedInitialBounds = useRef(false)

  const showMap = viewMode === 'grid-map'

  const hasActiveFilters =
    difficulty !== 'Any' || workOn !== 'Anything' || selectedCategories.length > 0

  const handleClearFilters = () => {
    setDifficulty('Any')
    setWorkOn('Anything')
    setSelectedCategories([])
  }

  useEffect(() => {
    navigate({
      to: '/challenges',
      search: (prev) => ({
        ...prev,
        difficulty: difficulty !== 'Any' ? difficulty : undefined,
        workOn: workOn !== 'Anything' ? workOn : undefined,
        categories: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
        sortBy: extendedFindParams.sortBy !== 'name' ? extendedFindParams.sortBy : undefined,
        global: extendedFindParams.global ? true : undefined,
        location_id: extendedFindParams.location_id,
        bounds:
          extendedFindParams.bounds && extendedFindParams.bounds !== '-180,-90,180,90'
            ? extendedFindParams.bounds
            : undefined,
      }),
      replace: true,
    })
  }, [
    difficulty,
    workOn,
    selectedCategories,
    extendedFindParams.sortBy,
    extendedFindParams.global,
    extendedFindParams.location_id,
    extendedFindParams.bounds,
    navigate,
  ])

  useEffect(() => {
    if (
      showMap &&
      mapLoaded &&
      map.current &&
      !hasAppliedInitialBounds.current &&
      extendedFindParams.bounds &&
      extendedFindParams.bounds !== '-180,-90,180,90'
    ) {
      const parsedBounds = parseBoundsString(extendedFindParams.bounds)
      if (parsedBounds) {
        const bounds: [[number, number], [number, number]] = [
          [parsedBounds[0], parsedBounds[1]],
          [parsedBounds[2], parsedBounds[3]],
        ]
        fitMapToBounds(map.current, bounds, { padding: 50, duration: 0 })
        hasAppliedInitialBounds.current = true
      }
    }
  }, [showMap, mapLoaded, map, extendedFindParams.bounds])

  useEffect(() => {
    if (showMap) {
      if (!map.current || !mapLoaded) {
        return
      }

      const mapInstance = map.current

      const updateBounds = () => {
        const boundsString = getMapBoundsString(mapInstance)
        setExtendedFindParams((prev) => ({ ...prev, bounds: boundsString }))
        setTaskMarkerParams((prev) => ({ ...prev, bounds: boundsString }))
      }

      const hasInitialBounds =
        extendedFindParams.bounds && extendedFindParams.bounds !== '-180,-90,180,90'
      if (!hasInitialBounds || hasAppliedInitialBounds.current) {
        updateBounds()
      }

      mapInstance.on('moveend', updateBounds)

      return () => {
        mapInstance.off('moveend', updateBounds)
      }
    } else {
      setExtendedFindParams((prev) => ({ ...prev, bounds: '-180,-90,180,90' }))
      setTaskMarkerParams((prev) => ({ ...prev, bounds: '-180,-90,180,90' }))
    }
  }, [
    showMap,
    map,
    mapLoaded,
    extendedFindParams.bounds,
    setExtendedFindParams,
    setTaskMarkerParams,
  ])

  useEffect(() => {
    let allKeywords: string[] = [...selectedCategories]

    const workOnKeywords = workOnCategoryMap[workOn]
    if (workOnKeywords) {
      allKeywords = [...allKeywords, ...workOnKeywords]
    }

    const keywordsString = allKeywords.length > 0 ? allKeywords.join(',') : undefined
    setExtendedFindParams((prev) => ({ ...prev, keywords: keywordsString }))
    setTaskMarkerParams((prev) => ({ ...prev, keywords: keywordsString }))
  }, [selectedCategories, workOn, setExtendedFindParams, setTaskMarkerParams])

  useEffect(() => {
    const difficultyValue = difficultyMap[difficulty]
    setExtendedFindParams((prev) => ({ ...prev, difficulty: difficultyValue }))
    setTaskMarkerParams((prev) => ({ ...prev, difficulty: difficultyValue }))
  }, [difficulty, setExtendedFindParams, setTaskMarkerParams])

  return (
    <div className="border-zinc-200 border-b bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto">
          <LocationSearchFilter />

          <FilterDivider />

          <SortByFilter
            value={extendedFindParams?.sortBy}
            onChange={(value: ExtendedFindParamsSortBy) =>
              setExtendedFindParams({
                ...extendedFindParams,
                sortBy: value,
              })
            }
          />

          <FilterDivider />

          <WorkOnFilter value={workOn} onChange={setWorkOn} />

          <FilterDivider />

          <DifficultyFilter value={difficulty} onChange={setDifficulty} />

          <FilterDivider />

          <CategoryFilter
            selectedCategories={selectedCategories}
            onCategoriesChange={setSelectedCategories}
          />

          <FilterDivider />

          <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />

          <FilterDivider />

          <GlobalToggle
            global={extendedFindParams?.global}
            onGlobalChange={(checked: boolean) =>
              setExtendedFindParams({ ...extendedFindParams, global: checked })
            }
          />

          <FilterDivider />

          <ClearFiltersButton onClear={handleClearFilters} hasActiveFilters={hasActiveFilters} />
        </div>
      </div>
    </div>
  )
}
