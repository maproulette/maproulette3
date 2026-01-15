import { MapControls } from '@/components/shared/MapControls'
import { ClusterToggle } from './TaskMarkers/ClusterToggle'
import { useChallengeTaskMarkersContext } from './ChallengeTaskMarkersContext'
import { useExploreChallengesMapContext } from './ExploreChallengesMapContext'
import { LoadingIndicator } from './LoadingIndicator'
import { MapBoundsManager } from './MapBoundsManager'
import { MapFitBoundsManager } from './MapFitBoundsManager'
import { MapPolygonManager } from './MapPolygonManager'
import { StyleSwitcherPanel } from './StyleSwitcherPanel'
import { ExploreChallengesTaskMarkerManager } from './ExploreChallengesTaskMarkerManager'

export const ExploreChallengesMap = () => {
  const { mapContainer, map, mapLoaded, clusteringEnabled, setClusteringEnabled } =
    useExploreChallengesMapContext()
  const { dataLoading, totalCount } = useChallengeTaskMarkersContext()

  return (
    <div className="relative h-full w-full flex-1">
      <div
        ref={mapContainer}
        data-mapgrab-map-id="exploreChallengesMap"
        className="absolute inset-0 h-full w-full overflow-hidden md:rounded-br-lg"
      />

      <MapBoundsManager />
      <MapFitBoundsManager />
      <MapPolygonManager />
      <ExploreChallengesTaskMarkerManager />

      <LoadingIndicator
        isLoading={dataLoading || !mapLoaded}
        message={!mapLoaded ? 'Loading map...' : 'Loading markers...'}
      />

      <MapControls
        map={map}
        mapLoaded={mapLoaded}
        collapsible={true}
        defaultOpen={true}
        showZoom={true}
        showReset={true}
        showLayers={true}
        StyleSwitcherPanel={StyleSwitcherPanel}
      />

      <ClusterToggle
        disabled={dataLoading}
        taskCount={totalCount}
        clusteringEnabled={clusteringEnabled}
        onToggle={setClusteringEnabled}
        showWarnings={true}
      />
    </div>
  )
}
