import type { ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'
import type { ExtendedFindParams } from '@/types/Challenge'
import type { TaskMarkersParams } from '@/types/Task'

export interface SearchContextType {
  extendedFindParams: ExtendedFindParams
  taskMarkerParams: TaskMarkersParams
  searchParams: TaskMarkersParams & ExtendedFindParams & { onMap: boolean }
  setSearchParams: (params: TaskMarkersParams & ExtendedFindParams & { onMap: boolean }) => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export const SearchContextProvider = ({ children }: { children: ReactNode }) => {
  const [searchParams, setSearchParams] = useState<
    TaskMarkersParams & ExtendedFindParams & { onMap: boolean }
  >({
    global: false,
    bounds: null,
    sortBy: 'name',
    limit: 10,
    statuses: [0, 1, 3],
    onMap: false,
  })

  const extendedFindParams: ExtendedFindParams = {
    global: searchParams.global,
    bounds: searchParams.bounds,
    sortBy: searchParams.sortBy,
    limit: searchParams.limit,
  }

  const taskMarkerParams: TaskMarkersParams = {
    global: searchParams.global,
    statuses: searchParams.statuses,
  }
  console.log('searchParams.bounds', searchParams.bounds)
  const value: SearchContextType = {
    taskMarkerParams,
    extendedFindParams,
    searchParams,
    setSearchParams,
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
