import { useLoaderData } from '@tanstack/react-router'
import { createContext, type ReactNode, useContext } from 'react'
import type { Challenge } from '@/types/Challenge'

type BrowsedChallengeContextType = {
  challenge: Challenge
}

const BrowsedChallengeContext = createContext<BrowsedChallengeContextType | undefined>(undefined)

export const BrowsedChallengeProvider = ({ children }: { children: ReactNode }) => {
  const loaderData = useLoaderData({ from: '/_app/challenges/$challengeId/' })

  if (!loaderData) {
    throw new Error('Challenge data not found')
  }

  const { challenge }: { challenge: Challenge } = loaderData

  const value: BrowsedChallengeContextType = { challenge }
  return (
    <BrowsedChallengeContext.Provider value={value}>{children}</BrowsedChallengeContext.Provider>
  )
}

export const useBrowsedChallengeContext = () => {
  const context = useContext(BrowsedChallengeContext)

  if (context === undefined) {
    throw new Error('useBrowsedChallenge must be used within a BrowsedChallengeProvider')
  }

  return context
}
