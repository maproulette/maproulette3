import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { LoadingOverlay } from '@/components/shared/LoadingOverlay'
import { MapControls } from '@/components/shared/MapControls'
import { TaskMarkers } from '@/components/TaskMarkers'
import { useBrowseChallengeMapContext } from '@/contexts/browseChallenge/BrowseChallengeMapContext'
import { useBrowsedChallengeContext } from '@/contexts/browseChallenge/BrowsedChallengeContext'

export const ChallengeMap = () => {
  const { challenge } = useBrowsedChallengeContext()
  const { data: taskMarkers, isLoading } = useQuery(
    api.challenge.getChallengeTaskMarkers(challenge.id)
  )
  const {
    mapContainer,
    mapLoaded,
    map,
    clusteringEnabled,
    hoveredTaskId,
    selectedTaskIds,
    setSelectedTaskIds,
  } = useBrowseChallengeMapContext()

  return (
    <div className="relative h-full w-full flex-1 overflow-hidden border border-zinc-200 md:rounded-2xl md:rounded-r-2xl md:rounded-l-none dark:border-zinc-800">
      <div
        ref={mapContainer}
        data-mapgrab-map-id="browseChallengeMap"
        className="absolute inset-0 h-full w-full"
      />
      <LoadingOverlay isLoading={isLoading || !mapLoaded} message="Loading task markers..." />
      <TaskMarkers
        taskMarkers={taskMarkers}
        isLoadingTaskMarkers={isLoading}
        map={map}
        mapLoaded={mapLoaded}
        clusteringEnabled={clusteringEnabled}
        hoveredTaskId={hoveredTaskId}
        selectedTaskIds={selectedTaskIds}
        setSelectedTaskIds={setSelectedTaskIds}
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
