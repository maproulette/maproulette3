import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { createContext, useContext, useState } from 'react'
import type { ExploreChallengesParams } from '@/types/Challenge'
import type { TaskMarkersParams } from '@/types/Task'

export interface SearchContextType {
  extendedFindParams: ExploreChallengesParams
  setExtendedFindParams: Dispatch<SetStateAction<ExploreChallengesParams>>
  taskMarkerParams: TaskMarkersParams
  setTaskMarkerParams: Dispatch<SetStateAction<TaskMarkersParams>>
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export const SearchContextProvider = ({ children }: { children: ReactNode }) => {
  const [extendedFindParams, setExtendedFindParams] = useState<ExploreChallengesParams>({
    global: false,
    bounds: '-180,-90,180,90',
    sortBy: 'name',
    limit: 10,
  })

  const [taskMarkerParams, setTaskMarkerParams] = useState<TaskMarkersParams>({
    global: false,
    statuses: '0,1,3',
    bounds: '-180,-90,180,90',
    cluster: true,
  })

  const value: SearchContextType = {
    taskMarkerParams,
    setTaskMarkerParams,
    extendedFindParams,
    setExtendedFindParams,
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
