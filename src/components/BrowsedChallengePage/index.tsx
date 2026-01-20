import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { BrowsedChallengeSearchContextProvider } from '@/components/BrowsedChallengePage/contexts/BrowsedChallegeSearchContext'
import { BrowsedChallengeProvider } from '@/components/BrowsedChallengePage/contexts/BrowsedChallengeContext'
import { BrowseChallengeMap } from './BrowseChallengeMap'
import { ChallengePanel } from './ChallengePanel'

interface MapToggleContextType {
  showMap: boolean
  setShowMap: (show: boolean) => void
}

const MapToggleContext = createContext<MapToggleContextType | undefined>(undefined)

export const useMapToggle = () => {
  const context = useContext(MapToggleContext)
  if (!context) {
    throw new Error('useMapToggle must be used within MapToggleContext')
  }
  return context
}

export const BrowsedChallengePage = () => {
  const [showMap, setShowMap] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (showMap && mapContainerRef.current) {
      mapContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [showMap])

  return (
    <BrowsedChallengeSearchContextProvider>
      <BrowsedChallengeProvider>
        <MapToggleContext.Provider value={{ showMap, setShowMap }}>
          {/* Mobile Layout: Panel on top, map below when toggled */}
          <div className="flex flex-col gap-4 md:h-[calc(100vh-7rem)] md:flex-row md:gap-0 md:overflow-hidden md:p-0">
            <div className="w-full shrink-0 md:h-full md:w-120">
              <ChallengePanel />
            </div>
            <div
              className={`${showMap ? 'flex h-96 shrink-0' : 'hidden'} w-full md:flex md:h-full md:flex-1`}
            >
              <BrowseChallengeMap />
            </div>
          </div>
        </MapToggleContext.Provider>
      </BrowsedChallengeProvider>
    </BrowsedChallengeSearchContextProvider>
  )
}
