import { ChallengeTaskMarkersLayer } from '@/components/ExploreChallengesPage/ChallengeTaskMarkersLayer'
import { Loader } from '@/components/ui/Loader'
import { useChallengeTaskMarkersContext } from '@/contexts/exploreChallenges/ChallengeTaskMarkersContext'
import { useMapContext } from '@/contexts/MapContext'
import { MapControls } from './MapControls'
import { StatusFilter } from './StatusFilter'

export const ChallengeMap = () => {
  const { dataLoading } = useChallengeTaskMarkersContext()
  const { mapContainer, mapLoaded } = useMapContext()

  return (
    <div className="relative h-full w-full flex-1">
      <div ref={mapContainer} className="absolute inset-0 h-full w-full" />
      <div
        className={`absolute inset-0 flex h-10 w-10 items-center justify-center bg-white/20 backdrop-blur-sm transition-opacity duration-200 ${
          dataLoading || !mapLoaded ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <Loader message="Loading task markers..." />
      </div>
      <ChallengeTaskMarkersLayer />
      <StatusFilter />
      <MapControls />
    </div>
  )
}
