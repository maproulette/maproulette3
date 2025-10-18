import type { ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'
import type { BrowsedChallengeTaskMarkersParams } from '@/types/Task'

export interface BrowsedChallengeSearchContextType {
  taskMarkerParams: BrowsedChallengeTaskMarkersParams
  searchParams: BrowsedChallengeTaskMarkersParams
  setSearchParams: (params: BrowsedChallengeTaskMarkersParams) => void
}

const BrowsedChallengeSearchContext = createContext<BrowsedChallengeSearchContextType | undefined>(
  undefined
)

export const BrowsedChallengeSearchContextProvider = ({ children }: { children: ReactNode }) => {
  const [searchParams, setSearchParams] = useState<BrowsedChallengeTaskMarkersParams>({
    statuses: [0, 1, 3],
  })

  const taskMarkerParams: BrowsedChallengeTaskMarkersParams = {
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
