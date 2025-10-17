import 'maplibre-gl/dist/maplibre-gl.css'
import { Loader } from '@/components/ui/Loader'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { useSearchContext } from '../../SearchContextProvider'
import { MapControls } from './MapControls'
import { StatusFilter } from './StatusFilter'
import { useMapContext } from '../../MapContext'
import { TaskMarkers } from './TaskMarkers'

export const ChallengeMap = () => {
  const { taskMarkerParams } = useSearchContext()
  const { isLoading: isLoadingTaskMarkers } = useQuery(api.task.getTaskMarkers(taskMarkerParams))
  const { mapContainer, mapLoaded } = useMapContext()

  return (
    <div className="flex-1 relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
      <div
        className={`absolute inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center transition-opacity duration-200 ${
          isLoadingTaskMarkers || !mapLoaded ? 'opacity-100' : 'opacity-0 pointer-events-none'
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
