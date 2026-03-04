import { List, Map as MapIcon } from 'lucide-react'
import { useState } from 'react'
import { DrawerPortalTarget } from '@/components/shared/DrawerPortalContext'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/Resizable'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { ChallengeList } from './ChallengeList'
import { ExploreChallengesMap } from './ExploreChallengesMap'
import { useExploreChallengesSearchContext } from './ExploreChallengesSearchContext'

export const ExploreChallengesResults = () => {
  const { viewMode } = useExploreChallengesSearchContext()
  const [mobileTab, setMobileTab] = useState<'list' | 'map'>('list')

  if (viewMode === 'grid-map') {
    return (
      <>
        {/* Mobile: tab switcher */}
        <div className="md:hidden">
          <Tabs
            value={mobileTab}
            onValueChange={(v) => setMobileTab(v as 'list' | 'map')}
            className="flex flex-col"
          >
            <div className="border-zinc-200 border-b bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900">
              <TabsList className="w-full">
                <TabsTrigger value="list">
                  <List />
                  <span>List</span>
                </TabsTrigger>
                <TabsTrigger value="map">
                  <MapIcon />
                  <span>Map</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
          <div className="relative h-[calc(100vh-16rem)] min-h-[400px]">
            {mobileTab === 'list' ? (
              <ChallengeList viewMode={viewMode} />
            ) : (
              <ExploreChallengesMap />
            )}
          </div>
        </div>

        {/* Desktop: resizable panels */}
        <div className="hidden md:block md:h-[calc(100vh-8.5rem)] md:min-h-[500px]">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={30} minSize={20} maxSize={55}>
              <div className="relative h-full overflow-hidden">
                <ChallengeList viewMode={viewMode} />
                <DrawerPortalTarget />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle className="ml-2" />
            <ResizablePanel defaultSize={70}>
              <div className="h-full">
                <ExploreChallengesMap />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </>
    )
  }

  return (
    <div className="relative h-[calc(100vh-16rem)] min-h-[400px] md:h-[calc(100vh-11rem)] md:min-h-[500px]">
      <ChallengeList viewMode={viewMode} />
    </div>
  )
}
