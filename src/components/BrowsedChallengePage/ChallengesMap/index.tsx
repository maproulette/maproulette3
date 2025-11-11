import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { LoadingOverlay, MapControls } from '@/components/shared'
import { TaskMarkers } from '@/components/TaskMarkers'
import { useBrowsedChallengeContext } from '@/contexts/browseChallenge/BrowsedChallengeContext'
import { useMapContext } from '@/contexts/MapContext'

export const ChallengeMap = () => {
  const { challenge } = useBrowsedChallengeContext()
  const { data: taskMarkers, isLoading } = useQuery(
    api.challenge.getChallengeTaskMarkers(challenge.id)
  )
  const { mapContainer, mapLoaded } = useMapContext()

  return (
    <div className="relative h-full w-full flex-1 overflow-hidden border border-zinc-200 md:rounded-2xl md:rounded-r-2xl md:rounded-l-none dark:border-zinc-800">
      <div
        ref={mapContainer}
        data-mapgrab-map-id="mainMap"
        className="absolute inset-0 h-full w-full"
      />
      <LoadingOverlay isLoading={isLoading || !mapLoaded} message="Loading task markers..." />
      <TaskMarkers taskMarkers={taskMarkers} isLoadingTaskMarkers={isLoading} />
      <MapControls variant="simple" showInfo={true} />
    </div>
  )
}
