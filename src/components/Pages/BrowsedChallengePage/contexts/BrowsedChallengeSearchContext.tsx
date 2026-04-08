import type { ReactNode } from 'react'
import { createContext, useContext, useMemo, useState } from 'react'
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
    statuses: '0,1,3',
  })

  // Reason: Stable params object prevents downstream marker queries from refetching on unrelated state changes
  const taskMarkerParams: TaskMarkersParams = useMemo(
    () => ({
      statuses: searchParams.statuses,
    }),
    [searchParams.statuses]
  )

  // Reason: context value must be stable to prevent all consumers from re-rendering
  const value = useMemo<BrowsedChallengeSearchContextType>(
    () => ({
      taskMarkerParams,
      searchParams,
      setSearchParams,
    }),
    [taskMarkerParams, searchParams]
  )

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
