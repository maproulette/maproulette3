import { useSearch } from '@tanstack/react-router'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { createContext, useContext, useMemo, useState } from 'react'
import type {
  DifficultyLevel,
  WorkOnCategory,
} from '@/components/ExploreChallengesPage/FilterBar/filterTypes'
import {
  difficultyMap,
  workOnCategoryMap,
} from '@/components/ExploreChallengesPage/FilterBar/filterUtils'
import type { ExploreChallengesParams, ExtendedFindParamsSortBy } from '@/types/Challenge'
import type { TaskMarkersParams } from '@/types/Task'

export interface BaseSearchParams {
  bounds: string
  keywords?: string
  difficulty?: 1 | 2 | 3
  location_id?: number
  global?: boolean
}

export interface SearchContextType {
  searchParams: BaseSearchParams
  extendedFindParams: ExploreChallengesParams
  taskMarkerParams: TaskMarkersParams

  bounds: string
  setBounds: Dispatch<SetStateAction<string>>
  locationId: number | undefined
  setLocationId: Dispatch<SetStateAction<number | undefined>>
  global: boolean | undefined
  setGlobal: Dispatch<SetStateAction<boolean | undefined>>

  difficulty: DifficultyLevel
  setDifficulty: Dispatch<SetStateAction<DifficultyLevel>>
  workOn: WorkOnCategory
  setWorkOn: Dispatch<SetStateAction<WorkOnCategory>>
  selectedCategories: string[]
  setSelectedCategories: Dispatch<SetStateAction<string[]>>

  sortBy: ExtendedFindParamsSortBy | undefined
  setSortBy: Dispatch<SetStateAction<ExtendedFindParamsSortBy | undefined>>

  cluster: boolean
  setCluster: Dispatch<SetStateAction<boolean>>

  isLocationLoading: boolean
  setIsLocationLoading: Dispatch<SetStateAction<boolean>>

  handleClearFilters: () => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

interface SearchContextProviderProps {
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

export const SearchContextProvider = ({ children }: SearchContextProviderProps) => {
  const {
    difficulty: initialDifficulty,
    workOn: initialWorkOn,
    categories: initialCategories,
    sortBy: initialSortBy,
    global: initialGlobal,
    location_id: initialLocationId,
    bounds: initialBounds,
  } = useSearch({ from: '/_app/' })

  // Filter states
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialDifficulty ?? 'Any')
  const [workOn, setWorkOn] = useState<WorkOnCategory>(initialWorkOn ?? 'Anything')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategories ? initialCategories.split(',').filter(Boolean) : []
  )
  const [sortBy, setSortBy] = useState<ExtendedFindParamsSortBy | undefined>(
    initialSortBy as ExtendedFindParamsSortBy | undefined
  )
  const [cluster, setCluster] = useState(true)

  // Base search params
  const [bounds, setBounds] = useState(initialBounds || '-180,-90,180,90')
  const [locationId, setLocationId] = useState<number | undefined>(initialLocationId)
  const [global, setGlobal] = useState<boolean | undefined>(initialGlobal)

  const [isLocationLoading, setIsLocationLoading] = useState(false)

  // Derived params - no duplicate state!
  const searchParams = useMemo<BaseSearchParams>(
    () => ({
      bounds,
      keywords: buildKeywords(selectedCategories, workOn),
      difficulty: difficultyMap[difficulty],
      location_id: locationId,
      global,
    }),
    [bounds, selectedCategories, workOn, difficulty, locationId, global]
  )

  const extendedFindParams = useMemo<ExploreChallengesParams>(
    () => ({
      ...searchParams,
      sortBy: sortBy as ExploreChallengesParams['sortBy'],
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
    setBounds('-180,-90,180,90')
    setLocationId(undefined)
    setGlobal(undefined)
    setDifficulty('Any')
    setWorkOn('Anything')
    setSelectedCategories([])
  }

  const value: SearchContextType = {
    searchParams,
    extendedFindParams,
    taskMarkerParams,
    bounds,
    setBounds,
    locationId,
    setLocationId,
    global,
    setGlobal,
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
    handleClearFilters,
  }

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}

export const useSearchContext = () => {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearchContext must be used within an SearchContextProvider')
  }
  return context
}
