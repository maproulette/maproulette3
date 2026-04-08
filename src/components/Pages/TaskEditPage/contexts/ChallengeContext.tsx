import { createContext, type ReactNode, useContext, useMemo } from 'react'
import { api } from '@/api'
import type { Challenge } from '@/types/Challenge'
import { useTaskContext } from './TaskContext'

type ChallengeContextType = {
  challenge: Challenge | undefined
  challengeLoading: boolean
  challengeError: Error | null
}

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined)

export const ChallengeProvider = ({ children }: { children: ReactNode }) => {
  const { task } = useTaskContext()
  const { data, isLoading, error } = api.challenge.getChallenge(task.parent)

  // Reason: context value must be stable to prevent all consumers from re-rendering
  const value: ChallengeContextType = useMemo(
    () => ({
      challenge: data,
      challengeLoading: isLoading,
      challengeError: error,
    }),
    [data, isLoading, error]
  )

  return <ChallengeContext.Provider value={value}>{children}</ChallengeContext.Provider>
}

export const useChallengeContext = () => {
  const context = useContext(ChallengeContext)

  if (context === undefined) {
    throw new Error('useChallenge must be used within a ChallengeProvider')
  }

  return context
}
