import { useLoaderData } from '@tanstack/react-router'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { BrowsedChallengeSearchContextProvider } from '@/components/BrowsedChallengePage/contexts/BrowsedChallegeSearchContext'
import { BrowsedChallengeProvider } from '@/components/BrowsedChallengePage/contexts/BrowsedChallengeContext'
import { DrawerPortalProvider, DrawerPortalTarget } from '@/components/shared/DrawerPortalContext'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/Resizable'
import { useSetPageTitle } from '@/contexts/PageTitleContext'
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
  const { challenge } = useLoaderData({ from: '/_app/challenge/$challengeId/' })
  useSetPageTitle(challenge?.name ?? null)

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
            {/* Desktop: resizable panel + map */}
            <div className="relative hidden px-4 md:block md:h-[calc(100vh-5rem)] md:overflow-hidden">
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
                  <div className="relative h-full overflow-hidden">
                    <ChallengePanel />
                    <DrawerPortalTarget />
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle className="ml-2" />
                <ResizablePanel defaultSize={65}>
                  <div
                    ref={mapContainerRef}
                    className="h-full overflow-hidden rounded-lg border border-slate-700/50"
                  >
                    <BrowseChallengeMap />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </MapToggleContext.Provider>
        </DrawerPortalProvider>
      </BrowsedChallengeProvider>
    </BrowsedChallengeSearchContextProvider>
  )
}
