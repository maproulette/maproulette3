import { useQuery } from '@tanstack/react-query'
import { createContext, type ReactNode, useContext } from 'react'
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
  const { data, isLoading, error } = useQuery(api.challenge.getChallenge(task.parent))

  const value: ChallengeContextType = {
    challenge: data,
    challengeLoading: isLoading,
    challengeError: error,
  }

  return <ChallengeContext.Provider value={value}>{children}</ChallengeContext.Provider>
}

export const useChallengeContext = (): ChallengeContextType => {
  const context = useContext(ChallengeContext)

  if (context === undefined) {
    throw new Error('useChallenge must be used within a ChallengeProvider')
  }

  return context
}
