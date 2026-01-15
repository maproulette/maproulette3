import { MapControls } from '@/components/shared/MapControls'
import { useExploreChallengesSearchContext } from '../ExploreChallengesSearchContext'
import { useChallengeTaskMarkersContext } from './ChallengeTaskMarkersContext'
import { useExploreChallengesMapContext } from './ExploreChallengesMapContext'
import { ExploreChallengesTaskMarkerManager } from './ExploreChallengesTaskMarkerManager'
import { ClusterToggle } from './ExploreChallengesTaskMarkerManager/ClusterToggle'
import { LoadingIndicator } from './LoadingIndicator'
import { MapBoundsManager } from './MapBoundsManager'
import { MapFitBoundsManager } from './MapFitBoundsManager'
import { MapPolygonManager } from './MapPolygonManager'
import { StyleSwitcherPanel } from './StyleSwitcherPanel'

export const ExploreChallengesMap = () => {
  const { mapContainer, map, mapLoaded, clusteringEnabled, setClusteringEnabled } =
    useExploreChallengesMapContext()
  const { dataLoading, totalCount } = useChallengeTaskMarkersContext()
  const { setCluster } = useExploreChallengesSearchContext()

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
        onToggle={(checked) => {
          setClusteringEnabled(checked)
          setCluster(checked)
        }}
        showWarnings={true}
      />
    </div>
  )
}
