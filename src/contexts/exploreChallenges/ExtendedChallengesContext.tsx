import { useQuery } from '@tanstack/react-query'
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'
import { api } from '@/api'
import type { Challenge } from '@/types/Challenge'
import { getMapBoundsString } from '@/utils/mapUtils'
import { useMapContext } from '../MapContext'
import { useSearchContext } from './SearchContext'

type ExtendedChallengesContextType = {
  challenges: Challenge[] | undefined
  challengesLoading: boolean
  challengesError: Error | null
  setMapbounds: () => void
}

const ExtendedChallengesContext = createContext<ExtendedChallengesContextType | undefined>(
  undefined
)

export const ExtendedChallengesProvider = ({ children }: { children: ReactNode }) => {
  const { extendedFindParams, setExtendedFindParams } = useSearchContext()
  const { map } = useMapContext()
  const [displayedChallenges, setDisplayedChallenges] = useState<Challenge[] | undefined>(undefined)

  const {
    data: challenges,
    isLoading,
    error,
  } = useQuery(api.challenge.exploreChallenges(extendedFindParams))

  const setMapbounds = () => {
    if (!map.current) return
    const boundsString = getMapBoundsString(map.current)
    setExtendedFindParams({ ...extendedFindParams, bounds: boundsString })
  }

  useEffect(() => {
    if (challenges) {
      setDisplayedChallenges(challenges)
    }
  }, [challenges])

  useEffect(() => {
    if (!map.current) return
    if (extendedFindParams?.bounds) {
      map.current.on('moveend', setMapbounds)
    }
    return () => {
      if (map.current) {
        map.current.off('moveend', setMapbounds)
      }
    }
  }, [map, extendedFindParams?.bounds])

  const value: ExtendedChallengesContextType = {
    challenges: displayedChallenges,
    challengesLoading: isLoading,
    challengesError: error,
    setMapbounds,
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
