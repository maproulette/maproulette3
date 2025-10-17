import type { ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'
import type { ExtendedFindParams } from '@/types/Challenge'
import type { TaskMarkersParams } from '@/types/Task'

export interface SearchContextType {
  extendedFindParams: ExtendedFindParams
  setExtendedFindParams: (params: ExtendedFindParams) => void
  taskMarkerParams: TaskMarkersParams
  setTaskMarkerParams: (params: TaskMarkersParams) => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export const SearchContextProvider = ({ children }: { children: ReactNode }) => {
  const [extendedFindParams, setExtendedFindParams] = useState<ExtendedFindParams>({})
  const [taskMarkerParams, setTaskMarkerParams] = useState<TaskMarkersParams>({})

  const value: SearchContextType = {
    extendedFindParams,
    setExtendedFindParams,
    taskMarkerParams,
    setTaskMarkerParams,
  }
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}

export const useSearchContext = (): SearchContextType => {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearch must be used within an SearchContextProvider')
  }
  return context
}
