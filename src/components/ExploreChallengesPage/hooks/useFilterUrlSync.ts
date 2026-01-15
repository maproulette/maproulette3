import { useNavigate } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import type { ExtendedFindParamsSortBy } from '@/types/Challenge'
import { isWorldBounds } from '@/utils/mapUtils'
import type { DifficultyLevel, ViewMode, WorkOnCategory } from '../FilterBar/filterTypes'
import { reverseDifficultyMap } from '../FilterBar/filterUtils'

interface FilterUrlSyncParams {
  workOn: WorkOnCategory
  selectedCategories: string[]
  sortBy: ExtendedFindParamsSortBy | undefined
  global: boolean | undefined
  locationId: number | undefined
  bounds: string | undefined
  keywords: string | undefined
  difficulty: number | undefined
  viewMode: ViewMode
}

const DEBOUNCE_MS = 150

export const useFilterUrlSync = (params: FilterUrlSyncParams) => {
  const navigate = useNavigate()
  const {
    workOn,
    selectedCategories,
    sortBy,
    global,
    locationId,
    bounds,
    keywords,
    difficulty,
    viewMode,
  } = params

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
              ? (reverseDifficultyMap[difficulty] as DifficultyLevel)
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
}
