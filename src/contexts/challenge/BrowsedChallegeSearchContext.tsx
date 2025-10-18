import type { ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'
import type { TaskMarkersParams } from '@/types/Task'

export interface BrowsedChallengeSearchContextType {
  taskMarkerParams: TaskMarkersParams
  searchParams: TaskMarkersParams
  setSearchParams: (params: TaskMarkersParams) => void
}

const BrowsedChallengeSearchContext = createContext<BrowsedChallengeSearchContextType | undefined>(
  undefined
)

export const BrowsedChallengeSearchContextProvider = ({ children }: { children: ReactNode }) => {
  const [searchParams, setSearchParams] = useState<TaskMarkersParams>({
    global: false,
    statuses: [0, 1, 3],
  })

  const taskMarkerParams: TaskMarkersParams = {
    global: searchParams.global,
    statuses: searchParams.statuses,
  }

  const value: BrowsedChallengeSearchContextType = {
    taskMarkerParams,
    searchParams,
    setSearchParams,
  }
  return (
    <BrowsedChallengeSearchContext.Provider value={value}>
      {children}
    </BrowsedChallengeSearchContext.Provider>
  )
}

export const useBrowsedChallengeSearchContext = () => {
  const context = useContext(BrowsedChallengeSearchContext)
  if (context === undefined) {
    throw new Error(
      'useBrowsedChallengeSearchContext must be used within an BrowsedChallengeSearchContextProvider'
    )
  }
  return context
}
