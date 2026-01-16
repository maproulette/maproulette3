import { useSearch } from '@tanstack/react-router'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type {
  DifficultyLevel,
  ViewMode,
  WorkOnCategory,
} from '@/components/ExploreChallengesPage/FilterBar/filterTypes'
import {
  difficultyMap,
  workOnCategoryMap,
} from '@/components/ExploreChallengesPage/FilterBar/filterUtils'
import type { ExploreChallengesParams, ExtendedFindParamsSortBy } from '@/types/Challenge'
import type { TaskMarkersParams } from '@/types/Task'
import { clampBoundsString, DEFAULT_WORLD_BOUNDS } from '@/utils/mapUtils'

export type LocationGeojson =
  | {
      type: 'Polygon'
      coordinates: number[][][]
    }
  | {
      type: 'MultiPolygon'
      coordinates: number[][][][]
    }
  | null

export interface ExploreChallengesSearchContextType {
  extendedFindParams: ExploreChallengesParams
  taskMarkerParams: TaskMarkersParams

  bounds: string
  setBounds: Dispatch<SetStateAction<string>>
  locationId: number | undefined
  setLocationId: Dispatch<SetStateAction<number | undefined>>
  global: boolean | undefined
  setGlobal: Dispatch<SetStateAction<boolean | undefined>>

  locationGeojson: LocationGeojson
  setLocationGeojson: Dispatch<SetStateAction<LocationGeojson>>
  pendingFitBounds: string | null
  clearPendingFitBounds: () => void
  requestFitBounds: (bounds: string) => void

  difficulty: DifficultyLevel
  setDifficulty: Dispatch<SetStateAction<DifficultyLevel>>
  workOn: WorkOnCategory
  setWorkOn: Dispatch<SetStateAction<WorkOnCategory>>
  selectedCategories: string[]
  setSelectedCategories: Dispatch<SetStateAction<string[]>>

  sortBy: ExtendedFindParamsSortBy | undefined
  setSortBy: Dispatch<SetStateAction<ExtendedFindParamsSortBy | undefined>>

  keywords: string | undefined
  setKeywords: Dispatch<SetStateAction<string | undefined>>

  cluster: boolean
  setCluster: Dispatch<SetStateAction<boolean>>

  isLocationLoading: boolean
  setIsLocationLoading: Dispatch<SetStateAction<boolean>>

  viewMode: ViewMode
  setViewMode: Dispatch<SetStateAction<ViewMode>>

  handleClearFilters: () => void
}

const ExploreChallengesSearchContext = createContext<
  ExploreChallengesSearchContextType | undefined
>(undefined)

interface ExploreChallengesSearchContextProviderProps {
  children: ReactNode
}

const buildKeywords = (categories: string[], workOnValue: WorkOnCategory): string | undefined => {
  const allKeywords: string[] = [...categories]
  const workOnKeywords = workOnCategoryMap[workOnValue]
  if (workOnKeywords) {
    allKeywords.push(...workOnKeywords)
  }
  return allKeywords.length > 0 ? allKeywords.join(',') : undefined
}

export const ExploreChallengesSearchContextProvider = ({
  children,
}: ExploreChallengesSearchContextProviderProps) => {
  const {
    difficulty: initialDifficulty,
    workOn: initialWorkOn,
    categories: initialCategories,
    sortBy: initialSortBy,
    global: initialGlobal,
    location_id: initialLocationId,
    bounds: initialBounds,
    viewMode: initialViewMode,
  } = useSearch({ from: '/_app/' })

  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialDifficulty ?? 'Any')
  const [workOn, setWorkOn] = useState<WorkOnCategory>(initialWorkOn ?? 'Anything')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategories ? initialCategories.split(',').filter(Boolean) : []
  )
  const [sortBy, setSortBy] = useState<ExtendedFindParamsSortBy | undefined>(
    initialSortBy as ExtendedFindParamsSortBy | undefined
  )
  const [cluster, setCluster] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>((initialViewMode as ViewMode) || 'grid-map')

  const [bounds, setBounds] = useState(initialBounds || DEFAULT_WORLD_BOUNDS)
  const [locationId, setLocationId] = useState<number | undefined>(initialLocationId)
  const [global, setGlobal] = useState<boolean | undefined>(initialGlobal)
  const [keywords, setKeywords] = useState<string | undefined>(
    buildKeywords(selectedCategories, workOn)
  )
  const [isLocationLoading, setIsLocationLoading] = useState(false)

  const [locationGeojson, setLocationGeojson] = useState<LocationGeojson>(null)
  const [pendingFitBounds, setPendingFitBounds] = useState<string | null>(null)

  const clearPendingFitBounds = useCallback(() => {
    setPendingFitBounds(null)
  }, [])

  const requestFitBounds = useCallback((boundsToFit: string) => {
    setPendingFitBounds(boundsToFit)
  }, [])

  const effectiveBounds = viewMode === 'grid-map' ? clampBoundsString(bounds) : DEFAULT_WORLD_BOUNDS

  const searchParams = useMemo<ExploreChallengesParams>(
    () => ({
      bounds: effectiveBounds,
      keywords: buildKeywords(selectedCategories, workOn),
      difficulty: difficultyMap[difficulty],
      location_id: locationId,
      global,
    }),
    [effectiveBounds, selectedCategories, workOn, difficulty, locationId, global]
  )

  const extendedFindParams = useMemo<ExploreChallengesParams>(
    () => ({
      ...searchParams,
      sortBy: sortBy as ExtendedFindParamsSortBy,
      limit: 10,
    }),
    [searchParams, sortBy]
  )

  const taskMarkerParams = useMemo<TaskMarkersParams>(
    () => ({
      ...searchParams,
      statuses: '0,1,3',
      cluster,
    }),
    [searchParams, cluster]
  )

  const handleClearFilters = () => {
    setBounds(DEFAULT_WORLD_BOUNDS)
    setLocationId(undefined)
    setGlobal(undefined)
    setDifficulty('Any')
    setWorkOn('Anything')
    setSelectedCategories([])
    setLocationGeojson(null)
    setPendingFitBounds(null)
    setKeywords(undefined)
  }

  const value: ExploreChallengesSearchContextType = {
    extendedFindParams,
    taskMarkerParams,
    bounds,
    setBounds,
    locationId,
    setLocationId,
    global,
    setGlobal,
    locationGeojson,
    setLocationGeojson,
    pendingFitBounds,
    clearPendingFitBounds,
    requestFitBounds,
    difficulty,
    setDifficulty,
    workOn,
    setWorkOn,
    selectedCategories,
    setSelectedCategories,
    sortBy,
    setSortBy,
    cluster,
    setCluster,
    isLocationLoading,
    setIsLocationLoading,
    keywords,
    setKeywords,
    viewMode,
    setViewMode,
    handleClearFilters,
  }

  return (
    <ExploreChallengesSearchContext.Provider value={value}>
      {children}
    </ExploreChallengesSearchContext.Provider>
  )
}

export const useExploreChallengesSearchContext = () => {
  const context = useContext(ExploreChallengesSearchContext)
  if (context === undefined) {
    throw new Error(
      'useExploreChallengesSearchContext must be used within an ExploreChallengesSearchContextProvider'
    )
  }
  return context
}
