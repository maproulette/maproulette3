import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { useBrowseChallengeMapContext } from '@/components/BrowsedChallengePage/contexts/BrowseChallengeMapContext'
import { useBrowsedChallengeContext } from '@/components/BrowsedChallengePage/contexts/BrowsedChallengeContext'
import { LoadingOverlay } from '@/components/shared/LoadingOverlay'
import { MapControls } from '@/components/shared/MapControls'
import { ClusterToggle } from '@/components/shared/TaskMarkers/ClusterToggle'
import { BrowseChallengeTaskMarkerManager } from './BrowseChallengeTaskMarkerManager'

export const BrowseChallengeMap = () => {
  const { challenge } = useBrowsedChallengeContext()
  const { data: taskMarkers, isLoading } = useQuery(
    api.challenge.getChallengeTaskMarkers(challenge.id)
  )
  const { mapContainer, mapLoaded, map, clusteringEnabled, setClusteringEnabled } = useBrowseChallengeMapContext()

  return (
    <div className="relative h-full w-full flex-1 overflow-hidden border border-zinc-200 md:rounded-r-lg dark:border-zinc-800">
      <div
        ref={mapContainer}
        data-mapgrab-map-id="browseChallengeMap"
        className="absolute inset-0 h-full w-full"
      />
      <LoadingOverlay isLoading={isLoading || !mapLoaded} message="Loading task markers..." />

      <BrowseChallengeTaskMarkerManager />
      <ClusterToggle
        disabled={isLoading || !mapLoaded}
        taskCount={taskMarkers?.length}
        clusteringEnabled={clusteringEnabled}
        onToggle={setClusteringEnabled}
      />
      <MapControls
        map={map}
        mapLoaded={mapLoaded}
        collapsible={true}
        defaultOpen={true}
        showZoom={true}
        showReset={true}
        showLayers={true}
      />
    </div>
  )
}
