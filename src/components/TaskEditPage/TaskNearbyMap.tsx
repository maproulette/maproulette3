import { useMemo } from 'react'
import { Map as MapGL } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Task } from '@/types/Task'

interface TaskNearbyMapProps {
  currentTask: Task
  selectedTaskId: number | null
  onTaskSelect: (taskId: number | null) => void
}

export const TaskNearbyMap = ({ currentTask }: TaskNearbyMapProps) => {
  const initialViewState = useMemo(() => {
    let latitude = 0
    let longitude = 0

    if (currentTask.location) {
      if (typeof currentTask.location === 'string') {
        try {
          const parsed = JSON.parse(currentTask.location) as { lng?: number; lat?: number }
          if (parsed.lng != null && parsed.lat != null) {
            longitude = parsed.lng
            latitude = parsed.lat
          }
        } catch {
          // Invalid JSON, use default
        }
      } else if (
        typeof currentTask.location === 'object' &&
        currentTask.location != null &&
        'lng' in currentTask.location &&
        'lat' in currentTask.location
      ) {
        const loc = currentTask.location as { lng: number; lat: number }
        longitude = loc.lng
        latitude = loc.lat
      }
    }

    return {
      longitude,
      latitude,
      zoom: 14,
    }
  }, [currentTask.location])

  return (
    <div className="h-64 w-full rounded-lg">
      <MapGL
        initialViewState={initialViewState}
        mapStyle="https://demotiles.maplibre.org/style.json"
      />
    </div>
  )
}
