import { useSearch } from '@tanstack/react-router'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
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
import { getJSONCookie, removeCookie, setJSONCookie } from '@/utils/cookieUtils'
import { clampBoundsString, DEFAULT_WORLD_BOUNDS, isWorldBounds } from '@/utils/mapUtils'

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

interface PersistedFilters {
  difficulty?: DifficultyLevel
  workOn?: WorkOnCategory
  selectedCategories?: string[]
  sortBy?: ExtendedFindParamsSortBy
  global?: boolean
  locationId?: number
  viewMode?: ViewMode
  cluster?: boolean
  bounds?: string
}

const COOKIE_NAME = 'explore_challenges_filters'

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

  const persistedFilters = getJSONCookie<PersistedFilters>(COOKIE_NAME)

  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    initialDifficulty ?? persistedFilters?.difficulty ?? 'Any'
  )
  const [workOn, setWorkOn] = useState<WorkOnCategory>(
    initialWorkOn ?? persistedFilters?.workOn ?? 'Anything'
  )
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategories
      ? initialCategories.split(',').filter(Boolean)
      : (persistedFilters?.selectedCategories ?? [])
  )
  const [sortBy, setSortBy] = useState<ExtendedFindParamsSortBy | undefined>(
    initialSortBy ?? persistedFilters?.sortBy
  )
  const [cluster, setCluster] = useState<boolean>(persistedFilters?.cluster ?? true)
  const [viewMode, setViewMode] = useState<ViewMode>(
    (initialViewMode as ViewMode) ?? persistedFilters?.viewMode ?? 'grid-map'
  )

  const [bounds, setBounds] = useState(
    initialBounds || persistedFilters?.bounds || DEFAULT_WORLD_BOUNDS
  )
  const [locationId, setLocationId] = useState<number | undefined>(
    initialLocationId ?? persistedFilters?.locationId
  )
  const [global, setGlobal] = useState<boolean | undefined>(
    initialGlobal ?? persistedFilters?.global
  )

  const isInitialMount = useRef(true)

  useEffect(() => {
    if (!persistedFilters) return

    if (initialDifficulty === undefined && persistedFilters.difficulty) {
      setDifficulty(persistedFilters.difficulty)
    }
    if (initialWorkOn === undefined && persistedFilters.workOn) {
      setWorkOn(persistedFilters.workOn)
    }
    if (initialCategories === undefined && persistedFilters.selectedCategories) {
      setSelectedCategories(persistedFilters.selectedCategories)
    }
    if (initialSortBy === undefined && persistedFilters.sortBy) {
      setSortBy(persistedFilters.sortBy)
    }
    if (initialGlobal === undefined && persistedFilters.global !== undefined) {
      setGlobal(persistedFilters.global)
    }
    if (initialLocationId === undefined && persistedFilters.locationId !== undefined) {
      setLocationId(persistedFilters.locationId)
    }
    if (initialViewMode === undefined && persistedFilters.viewMode) {
      setViewMode(persistedFilters.viewMode)
    }
    if (persistedFilters.cluster !== undefined) {
      setCluster(persistedFilters.cluster)
    }
    if (!initialBounds && persistedFilters.bounds) {
      setBounds(persistedFilters.bounds)
    }
  }, [])

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    if (initialDifficulty !== undefined) {
      setDifficulty(initialDifficulty)
    }
    if (initialWorkOn !== undefined) {
      setWorkOn(initialWorkOn)
    }
    if (initialCategories !== undefined) {
      setSelectedCategories(initialCategories.split(',').filter(Boolean))
    }
    if (initialSortBy !== undefined) {
      setSortBy(initialSortBy as ExtendedFindParamsSortBy)
    }
    if (initialGlobal !== undefined) {
      setGlobal(initialGlobal)
    }
    if (initialLocationId !== undefined) {
      setLocationId(initialLocationId)
    }
    if (initialViewMode !== undefined) {
      setViewMode(initialViewMode as ViewMode)
    }
    if (initialBounds) {
      setBounds(initialBounds)
    }
  }, [
    initialDifficulty,
    initialWorkOn,
    initialCategories,
    initialSortBy,
    initialGlobal,
    initialLocationId,
    initialBounds,
    initialViewMode,
  ])
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

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    const filtersToSave: PersistedFilters = {
      difficulty: difficulty !== 'Any' ? difficulty : undefined,
      workOn: workOn !== 'Anything' ? workOn : undefined,
      selectedCategories: selectedCategories.length > 0 ? selectedCategories : undefined,
      sortBy: sortBy !== 'name' ? sortBy : undefined,
      global: global !== undefined ? global : undefined,
      locationId: locationId !== undefined ? locationId : undefined,
      viewMode: viewMode !== 'grid-map' ? viewMode : undefined,
      cluster: cluster !== true ? cluster : undefined,
      bounds: bounds && !isWorldBounds(bounds) ? bounds : undefined,
    }

    const hasFilters = Object.values(filtersToSave).some((value) => value !== undefined)
    if (hasFilters) {
      setJSONCookie(COOKIE_NAME, filtersToSave)
    } else {
      removeCookie(COOKIE_NAME)
    }
  }, [
    difficulty,
    workOn,
    selectedCategories,
    sortBy,
    global,
    locationId,
    viewMode,
    cluster,
    bounds,
  ])

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

    removeCookie(COOKIE_NAME)
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
