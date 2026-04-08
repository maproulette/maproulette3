import { useEffect, useRef, useState } from 'react'
import { DrawerPortalTarget } from '@/components/TaskInfoPanel/DrawerPortalContext'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/Resizable'
import { BrowseChallengeMap } from './BrowseChallengeMap'
import { ChallengePanel } from './ChallengePanel'
import { MapToggleContext } from './MapToggleContext'

export const BrowsedChallengePageContent = () => {
  const [showMap, setShowMap] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (showMap && mapContainerRef.current) {
      mapContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [showMap])

  return (
    <MapToggleContext.Provider value={{ showMap, setShowMap }}>
      {/* Desktop: resizable panel + map */}
      <div className="relative hidden h-full px-4 md:block md:overflow-hidden">
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
  )
}
