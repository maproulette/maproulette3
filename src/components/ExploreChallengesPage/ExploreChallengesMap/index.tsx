import { useMapBoundsSync } from '@/components/ExploreChallengesPage/ExploreChallengesMap/hooks/useMapBoundsSync'
import { MapControls } from '@/components/shared/MapControls'
import { ClusterToggle } from '@/components/shared/TaskMarkers/ClusterToggle'
import { useChallengeTaskMarkersContext } from './ChallengeTaskMarkersContext'
import { useExploreChallengesMapContext } from './ExploreChallengesMapContext'
import { useChallengeTaskMarkers } from './hooks/useChallengeTaskMarkers'
import { useMapFitBounds } from './hooks/useMapFitBounds'
import { useMapPolygon } from './hooks/useMapPolygon'
import { LoadingIndicator } from './LoadingIndicator'
import { StyleSwitcherPanel } from './StyleSwitcherPanel'

export const ExploreChallengesMap = () => {
  const { mapContainer, map, mapLoaded, clusteringEnabled, setClusteringEnabled } =
    useExploreChallengesMapContext()
  const { dataLoading, totalCount } = useChallengeTaskMarkersContext()

  useMapBoundsSync()

  useMapFitBounds()

  useMapPolygon()

  useChallengeTaskMarkers()

  return (
    <div className="relative h-full w-full flex-1">
      <div
        ref={mapContainer}
        data-mapgrab-map-id="exploreChallengesMap"
        className="absolute inset-0 h-full w-full overflow-hidden md:rounded-br-lg"
      />

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
