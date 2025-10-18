import 'maplibre-gl/dist/maplibre-gl.css'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { Loader } from '@/components/ui/Loader'
import { useMapContext } from '@/contexts/challenges/MapContext'
import { useSearchContext } from '@/contexts/challenges/SearchContext'
import { MapControls } from './MapControls'
import { StatusFilter } from './StatusFilter'
import { TaskMarkers } from './TaskMarkers'

export const ChallengeMap = () => {
  const { taskMarkerParams } = useSearchContext()
  const { isLoading: isLoadingTaskMarkers } = useQuery(api.task.getTaskMarkers(taskMarkerParams))
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
      <TaskMarkers />
      <StatusFilter />
      <MapControls />
    </div>
  )
}
