import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { BrowsedChallengeSearchContextProvider } from '@/components/BrowsedChallengePage/contexts/BrowsedChallegeSearchContext'
import { BrowsedChallengeProvider } from '@/components/BrowsedChallengePage/contexts/BrowsedChallengeContext'
import { DrawerPortalProvider, DrawerPortalTarget } from '@/components/shared/DrawerPortalContext'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/Resizable'
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
        <DrawerPortalProvider>
          <MapToggleContext.Provider value={{ showMap, setShowMap }}>
            {/* Mobile: stacked layout */}
            {/* <div className="flex flex-col gap-4 md:hidden">
              <div className="w-full">
                <ChallengePanel />
              </div>
              {showMap && (
                <div ref={mapContainerRef} className="h-96 w-full shrink-0">
                  <BrowseChallengeMap />
                </div>
              )}
            </div> */}

            {/* Desktop: resizable panels */}
            <div className="hidden md:block md:h-[calc(100vh-7rem)] md:overflow-hidden">
              <ResizablePanelGroup direction="horizontal" className="h-full">
                <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
                  <div className="relative h-full overflow-hidden">
                    <ChallengePanel />
                    <DrawerPortalTarget />
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={70}>
                  <BrowseChallengeMap />
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </MapToggleContext.Provider>
        </DrawerPortalProvider>
      </BrowsedChallengeProvider>
    </BrowsedChallengeSearchContextProvider>
  )
}
