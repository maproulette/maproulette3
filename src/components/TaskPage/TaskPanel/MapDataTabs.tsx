import { Layers, List } from 'lucide-react'
import type maplibregl from 'maplibre-gl'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useOSMDataContext } from '../contexts/OSMDataContext'
import { UnifiedOSMDataTable } from './OSMDataTable/UnifiedOSMDataTable'
import { useOSMDataForBounds } from './OSMDataTable/useOSMDataForBounds'
import { TasksTablePanel } from './TasksTablePanel'

interface MapDataTabsProps {
  map: React.RefObject<maplibregl.Map | null>
  mapLoaded: boolean
  currentTaskId?: number
  challengeId?: number
}

export const MapDataTabs = ({ map, mapLoaded, currentTaskId, challengeId }: MapDataTabsProps) => {
  const { showOSMData, osmData } = useOSMDataContext()
  const { parsedData, isLoading: isLoadingOSM } = useOSMDataForBounds()

  const hasOSMData = showOSMData && osmData !== null
  const tabCount = hasOSMData ? 2 : 1

  return (
    <Tabs defaultValue="tasks" className="flex h-full flex-col">
      <div className="border-zinc-200 border-b bg-zinc-50/50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/50">
        <TabsList
          className={`grid w-full bg-zinc-100 dark:bg-zinc-900 ${tabCount === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}
        >
          <TabsTrigger
            value="tasks"
            className="gap-2 data-[state=active]:bg-white data-[state=active]:text-zinc-900 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-zinc-100"
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Tasks</span>
            <span className="sm:hidden">Tasks</span>
          </TabsTrigger>
          {hasOSMData && (
            <TabsTrigger
              value="osm"
              className="gap-2 data-[state=active]:bg-white data-[state=active]:text-zinc-900 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-zinc-100"
            >
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">OSM Data</span>
              <span className="sm:hidden">OSM</span>
            </TabsTrigger>
          )}
        </TabsList>
      </div>

      <TabsContent value="tasks" className="flex-1 overflow-hidden">
        <TasksTablePanel
          map={map}
          mapLoaded={mapLoaded}
          currentTaskId={currentTaskId}
          challengeId={challengeId}
        />
      </TabsContent>

      {hasOSMData && (
        <TabsContent value="osm" className="flex-1 overflow-hidden">
          <UnifiedOSMDataTable
            nodes={parsedData.nodes}
            ways={parsedData.ways}
            areas={parsedData.areas}
            isLoading={isLoadingOSM}
          />
        </TabsContent>
      )}
    </Tabs>
  )
}
