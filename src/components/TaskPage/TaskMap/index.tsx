import { useMapContext } from '@/contexts/MapContext'
import { TaskFeatures } from './TaskFeatures'

export const TaskMap = () => {
  const { mapLoaded, mapContainer } = useMapContext()

  return (
    <div className="relative flex-1" style={{ height: 'calc(100vh - 10rem)' }}>
      <div className="relative h-full w-full">
        <div ref={mapContainer} className="h-full w-full" />
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-gray-600">Loading map...</div>
          </div>
        )}
        <TaskFeatures />
      </div>
    </div>
  )
}
