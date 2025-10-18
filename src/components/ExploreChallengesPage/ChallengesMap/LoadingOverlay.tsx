import { Loader } from '@/components/ui/Loader'
import { useMapContext } from '@/contexts/MapContext'
import { useTaskMarkersContext } from '@/contexts/challenges/TaskMarkersContext'

export const LoadingOverlay = () => {
  const { taskMarkersLoading } = useTaskMarkersContext()
  const { mapLoaded } = useMapContext()
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm transition-opacity duration-200 ${
        taskMarkersLoading || !mapLoaded ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <Loader message="Loading task markers..." />
    </div>
  )
}
