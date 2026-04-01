import type { ReactNode } from 'react'
import { createContext, useContext, useMemo } from 'react'
import { api } from '@/api'
import type { Challenge } from '@/types/Challenge'
import { useExploreChallengesSearchContext } from './ExploreChallengesSearchContext'

interface ChallengeResultsContextType {
  challenges: Challenge[]
  isLoading: boolean
  isLoadingState: boolean
  showEmptyState: boolean
  showErrorState: boolean | Error | null
  error: Error | null
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
}

const ChallengeResultsContext = createContext<ChallengeResultsContextType | undefined>(undefined)

interface ChallengeResultsProviderProps {
  children: ReactNode
}

export const ChallengeResultsContextProvider = ({ children }: ChallengeResultsProviderProps) => {
  const { extendedFindParams, isLocationLoading } = useExploreChallengesSearchContext()
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.challenge.exploreChallengesInfinite(extendedFindParams)

  const challenges = useMemo(() => data?.pages.flat() ?? [], [data])

  // Only show full loading overlay on initial load (no data yet), not on background refetches
  const isLoadingState = (isLoading && challenges.length === 0) || isLocationLoading
  const showEmptyState = !isLoadingState && challenges.length === 0 && !error
  const showErrorState = !isLoadingState && error

  const value: ChallengeResultsContextType = {
    challenges,
    isLoading,
    isLoadingState,
    showEmptyState,
    showErrorState,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  }

  return (
    <ChallengeResultsContext.Provider value={value}>{children}</ChallengeResultsContext.Provider>
  )
}

export const useChallengeResultsContext = () => {
  const context = useContext(ChallengeResultsContext)
  if (context === undefined) {
    throw new Error('useChallengeResults must be used within a ChallengeResultsProvider')
  }
  return context
}
