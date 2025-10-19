import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { Loader } from '@/components/ui/Loader'
import { useBrowsedChallengeSearchContext } from '@/contexts/browseChallenge/BrowsedChallegeSearchContext'
import { useBrowsedChallengeContext } from '@/contexts/browseChallenge/BrowsedChallengeContext'
import { useMapContext } from '@/contexts/MapContext'

export const LoadingOverlay = () => {
  const { challenge } = useBrowsedChallengeContext()
  const { taskMarkerParams } = useBrowsedChallengeSearchContext()
  const { isLoading: isLoadingTaskMarkers } = useQuery(
    api.challenge.getChallengeTaskMarkers(challenge.id, taskMarkerParams)
  )
  const { mapLoaded } = useMapContext()
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm transition-opacity duration-200 ${
        isLoadingTaskMarkers || !mapLoaded ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <Loader message="Loading task markers..." />
    </div>
  )
}
