import { Loader } from '@/components/ui/Loader'
import { useChallengeTaskMarkersContext } from '@/contexts/exploreChallenges/ChallengeTaskMarkersContext'
import { useMapContext } from '@/contexts/MapContext'

export const LoadingOverlay = () => {
  const { dataLoading } = useChallengeTaskMarkersContext()
  const { mapLoaded } = useMapContext()
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm transition-opacity duration-200 ${
        dataLoading || !mapLoaded ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <Loader message="Loading task markers..." />
    </div>
  )
}
