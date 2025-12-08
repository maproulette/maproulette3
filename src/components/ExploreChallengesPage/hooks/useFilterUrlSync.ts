import { useNavigate } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import type { ExtendedFindParamsSortBy } from '@/types/Challenge'
import type { DifficultyLevel, WorkOnCategory } from '../FilterBar/filterTypes'
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
}

const DEBOUNCE_MS = 150

export const useFilterUrlSync = (params: FilterUrlSyncParams) => {
  const navigate = useNavigate()
  const { workOn, selectedCategories, sortBy, global, locationId, bounds, keywords, difficulty } =
    params

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
          bounds: bounds && bounds !== '-180,-90,180,90' ? bounds : undefined,
          keywords: keywords && keywords !== '' ? keywords : undefined,
          difficulty:
            difficulty !== undefined
              ? (reverseDifficultyMap[difficulty] as DifficultyLevel)
              : undefined,
        }),
        replace: true,
      })
    }, DEBOUNCE_MS)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
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
    navigate,
  ])
}
