import { useQuery } from '@tanstack/react-query'
import { createContext, type ReactNode, useContext } from 'react'
import { api } from '@/api'
import type { Challenge } from '@/types/Challenge'
import { useSearchContext } from './SearchContext'

type ExtendedChallengesContextType = {
  challenges: Challenge[] | undefined
  challengesLoading: boolean
  challengesError: Error | null
}

const ExtendedChallengesContext = createContext<ExtendedChallengesContextType | undefined>(
  undefined
)

export const ExtendedChallengesProvider = ({ children }: { children: ReactNode }) => {
  const { extendedFindParams } = useSearchContext()
  const {
    data: challenges,
    isLoading,
    error,
  } = useQuery(api.challenge.extendedFind(extendedFindParams))

  const value: ExtendedChallengesContextType = {
    challenges: challenges,
    challengesLoading: isLoading,
    challengesError: error,
  }

  return (
    <ExtendedChallengesContext.Provider value={value}>
      {children}
    </ExtendedChallengesContext.Provider>
  )
}

export const useExtendedChallengesContext = () => {
  const context = useContext(ExtendedChallengesContext)

  if (context === undefined) {
    throw new Error('useExtendedChallenges must be used within a ExtendedChallengesProvider')
  }

  return context
}
