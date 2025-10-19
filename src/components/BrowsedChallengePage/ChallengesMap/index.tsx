import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { TaskMarkers } from '@/components/TaskMarkers'
import { Loader } from '@/components/ui/Loader'
import { useBrowsedChallengeSearchContext } from '@/contexts/browseChallenge/BrowsedChallegeSearchContext'
import { useBrowsedChallengeContext } from '@/contexts/browseChallenge/BrowsedChallengeContext'
import { useMapContext } from '@/contexts/MapContext'
import { MapControls } from './MapControls'
import { StatusFilter } from './StatusFilter'

export const ChallengeMap = () => {
  const { challenge } = useBrowsedChallengeContext()
  const { taskMarkerParams } = useBrowsedChallengeSearchContext()
  const { data: taskMarkers, isLoading: isLoadingTaskMarkers } = useQuery(
    api.challenge.getChallengeTaskMarkers(challenge.id, taskMarkerParams)
  )
  const { mapContainer, mapLoaded } = useMapContext()

  return (
    <div className="relative h-full w-full flex-1">
      <div ref={mapContainer} className="absolute inset-0 h-full w-full" />
      <div
        className={`absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm transition-opacity duration-200 ${
          isLoadingTaskMarkers || !mapLoaded ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <Loader message="Loading task markers..." />
      </div>
      <TaskMarkers taskMarkers={taskMarkers} isLoadingTaskMarkers={isLoadingTaskMarkers} />
      <MapControls />
      <StatusFilter />
    </div>
  )
}
