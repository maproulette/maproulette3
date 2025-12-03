import { useSearch } from '@tanstack/react-router'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { createContext, useContext, useState } from 'react'
import type {
  DifficultyLevel,
  WorkOnCategory,
} from '@/components/ExploreChallengesPage/FilterBar/filterTypes'
import {
  difficultyMap,
  workOnCategoryMap,
} from '@/components/ExploreChallengesPage/FilterBar/filterUtils'
import type { ExploreChallengesParams } from '@/types/Challenge'
import type { TaskMarkersParams } from '@/types/Task'

export interface SearchContextType {
  extendedFindParams: ExploreChallengesParams
  setExtendedFindParams: Dispatch<SetStateAction<ExploreChallengesParams>>
  taskMarkerParams: TaskMarkersParams
  setTaskMarkerParams: Dispatch<SetStateAction<TaskMarkersParams>>
  difficulty: DifficultyLevel
  setDifficulty: Dispatch<SetStateAction<DifficultyLevel>>
  workOn: WorkOnCategory
  setWorkOn: Dispatch<SetStateAction<WorkOnCategory>>
  selectedCategories: string[]
  setSelectedCategories: Dispatch<SetStateAction<string[]>>
  isLocationLoading: boolean
  setIsLocationLoading: Dispatch<SetStateAction<boolean>>
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

interface SearchContextProviderProps {
  children: ReactNode
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
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialDifficulty ?? 'Any')
  const [workOn, setWorkOn] = useState<WorkOnCategory>(initialWorkOn ?? 'Anything')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategories ? initialCategories.split(',').filter(Boolean) : []
  )
  const [isLocationLoading, setIsLocationLoading] = useState(false)

  const buildInitialKeywords = () => {
    const allKeywords: string[] = [
      ...(initialCategories ? initialCategories.split(',').filter(Boolean) : []),
    ]
    const workOnKeywords = workOnCategoryMap[initialWorkOn ?? 'Anything']
    if (workOnKeywords) {
      allKeywords.push(...workOnKeywords)
    }
    return allKeywords.length > 0 ? allKeywords.join(',') : undefined
  }

  const [extendedFindParams, setExtendedFindParams] = useState<ExploreChallengesParams>({
    global: initialGlobal,
    bounds: initialBounds || '-180,-90,180,90',
    sortBy: initialSortBy,
    limit: 10,
    location_id: initialLocationId,
    keywords: buildInitialKeywords(),
    difficulty: difficultyMap[initialDifficulty ?? 'Any'],
  })

  const [taskMarkerParams, setTaskMarkerParams] = useState<TaskMarkersParams>({
    global: initialGlobal,
    statuses: '0,1,3',
    bounds: initialBounds || '-180,-90,180,90',
    cluster: true,
    location_id: initialLocationId,
    keywords: buildInitialKeywords(),
    difficulty: difficultyMap[initialDifficulty ?? 'Any'],
  })

  const value: SearchContextType = {
    taskMarkerParams,
    setTaskMarkerParams,
    extendedFindParams,
    setExtendedFindParams,
    difficulty,
    setDifficulty,
    workOn,
    setWorkOn,
    selectedCategories,
    setSelectedCategories,
    isLocationLoading,
    setIsLocationLoading,
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
