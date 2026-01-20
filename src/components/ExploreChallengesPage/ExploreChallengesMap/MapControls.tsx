import { Layers } from 'lucide-react'
import type { MapRef } from 'react-map-gl/maplibre'
import { MapStyleSwitcher } from '@/components/shared/MapStyleSwitcher'
import { ClusterToggle } from '@/components/shared/TaskMarkers/ClusterToggle'
import { Button } from '@/components/ui/Button'

interface MapControlsProps {
  mapRef: React.RefObject<MapRef | null>
  mapLoaded: boolean
  isStylePanelOpen: boolean
  setIsStylePanelOpen: (open: boolean) => void
  shouldCluster: boolean
  onToggleCluster: (enabled: boolean) => void
  taskCount: number
}

export const MapControls = ({
  mapRef,
  mapLoaded,
  isStylePanelOpen,
  setIsStylePanelOpen,
  shouldCluster,
  onToggleCluster,
  taskCount,
}: MapControlsProps) => {
  return (
    <>
      <div className="absolute top-20 right-4 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsStylePanelOpen(!isStylePanelOpen)}
          disabled={!mapLoaded}
          className="h-10 w-10 bg-white shadow-md hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          <Layers className="h-4 w-4" />
        </Button>
      </div>
      <MapStyleSwitcher
        map={mapRef}
        mapLoaded={mapLoaded}
        isOpen={isStylePanelOpen}
        onClose={() => setIsStylePanelOpen(false)}
      />
      <ClusterToggle
        clusteringEnabled={shouldCluster}
        onToggle={onToggleCluster}
        taskCount={taskCount}
        showWarnings={true}
      />
    </>
  )
}
