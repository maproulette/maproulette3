import { Loader } from '@/components/ui/Loader'
import { useMapContext } from '@/contexts/challenges/MapContext'
import { useTaskMarkersContext } from '@/contexts/challenges/TaskMarkersContext'

export const LoadingOverlay = () => {
  const { taskMarkersLoading } = useTaskMarkersContext()
  const { mapLoaded } = useMapContext()
  return (
    <div
      className={`absolute inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center transition-opacity duration-200 ${
        taskMarkersLoading || !mapLoaded ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <Loader message="Loading task markers..." />
    </div>
  )
}
