import type { ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'
import type { ExtendedFindParams } from '@/types/Challenge'
import type { TaskMarkersParams } from '@/types/Task'

export interface SearchContextType {
  extendedFindParams: ExtendedFindParams
  taskMarkerParams: TaskMarkersParams
  searchParams: TaskMarkersParams & ExtendedFindParams
  setSearchParams: (params: TaskMarkersParams & ExtendedFindParams) => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export const SearchContextProvider = ({ children }: { children: ReactNode }) => {
  const [searchParams, setSearchParams] = useState<TaskMarkersParams & ExtendedFindParams>({
    archived: false,
    global: false,
    onMap: true,
    sortBy: 'name',
    limit: 10,
    statuses: [0, 1, 3],
  })

  const extendedFindParams: ExtendedFindParams = {
    archived: searchParams.archived,
    global: searchParams.global,
    onMap: searchParams.onMap,
    sortBy: searchParams.sortBy,
    limit: searchParams.limit,
  }

  const taskMarkerParams: TaskMarkersParams = {
    global: searchParams.global,
    statuses: searchParams.statuses,
  }

  const value: SearchContextType = {
    taskMarkerParams,
    extendedFindParams,
    searchParams,
    setSearchParams,
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
