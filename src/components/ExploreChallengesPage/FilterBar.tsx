import { useEffect, useState } from 'react'
import { useSearchContext } from '@/contexts/exploreChallenges/SearchContext'
import { useMapContext } from '@/contexts/MapContext'
import type { ExtendedFindParamsSortBy } from '@/types/Challenge'
import { getMapBoundsString } from '@/utils/mapUtils'
import {
  CategoryFilter,
  ClearFiltersButton,
  DifficultyFilter,
  type DifficultyLevel,
  difficultyMap,
  type FilterBarProps,
  FilterDivider,
  GlobalToggle,
  SortByFilter,
  type ViewMode,
  ViewModeToggle,
  type WorkOnCategory,
  WorkOnFilter,
  workOnCategoryMap,
} from './filters'
import { LocationSearchFilter } from './LocationSearchFilter'

export type { ViewMode }

export const FilterBar = ({ viewMode, onViewModeChange }: FilterBarProps) => {
  const { map, mapLoaded } = useMapContext()
  const { extendedFindParams, setExtendedFindParams, setTaskMarkerParams } = useSearchContext()

  // Determine if map should be shown based on view mode
  const showMap = viewMode === 'grid-map'

  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Any')
  const [workOn, setWorkOn] = useState<WorkOnCategory>('Anything')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  // Check if any filters are active (not default values)
  const hasActiveFilters =
    difficulty !== 'Any' || workOn !== 'Anything' || selectedCategories.length > 0

  // Clear all filters to default values
  const handleClearFilters = () => {
    setDifficulty('Any')
    setWorkOn('Anything')
    setSelectedCategories([])
  }

  // Update bounds when map moves or map visibility changes
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

      updateBounds()
      mapInstance.on('moveend', updateBounds)

      return () => {
        mapInstance.off('moveend', updateBounds)
      }
    } else {
      setExtendedFindParams((prev) => ({ ...prev, bounds: '-180,-90,180,90' }))
      setTaskMarkerParams((prev) => ({ ...prev, bounds: '-180,-90,180,90' }))
    }
  }, [showMap, map, mapLoaded, setExtendedFindParams, setTaskMarkerParams])

  // Update keywords when categories or work on filter changes
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

  // Update difficulty when difficulty filter changes
  useEffect(() => {
    const difficultyValue = difficultyMap[difficulty]
    setExtendedFindParams((prev) => ({ ...prev, difficulty: difficultyValue }))
    setTaskMarkerParams((prev) => ({ ...prev, difficulty: difficultyValue }))
  }, [difficulty, setExtendedFindParams, setTaskMarkerParams])

  return (
    <div className="border-zinc-200 border-b bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto px-4 py-3 sm:px-6">
        {/* Main Filters - All Inline */}
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
