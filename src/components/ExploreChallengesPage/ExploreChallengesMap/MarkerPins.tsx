import { useMemo } from 'react'
import { Marker } from 'react-map-gl/maplibre'
import type { TaskMarker } from '@/types/Task'
import { OverlapTaskPin } from '../OverlapTaskPin'
import { TaskPin } from '../TaskPin'
import { isValidLocation, isValidOverlapCenter } from './utils'

interface MarkerPinsProps {
  shouldCluster: boolean
  nonOverlapping: TaskMarker[]
  overlaps: Array<{
    id: string
    center: [number, number]
    tasks: TaskMarker[]
    radius: number
  }>
  onSingleMarkerClick: (task: TaskMarker) => void
  onOverlapMarkerClick: (tasks: TaskMarker[], center: [number, number]) => void
}

export const MarkerPins = ({
  shouldCluster,
  nonOverlapping,
  overlaps,
  onSingleMarkerClick,
  onOverlapMarkerClick,
}: MarkerPinsProps) => {
  const pins = useMemo(() => {
    if (shouldCluster) {
      return null
    }

    const validNonOverlapping = nonOverlapping.filter((marker) => isValidLocation(marker.location))

    const singlePins = validNonOverlapping.map((marker) => (
      <Marker
        key={`marker-${marker.id}`}
        longitude={marker.location?.lng}
        latitude={marker.location?.lat}
        anchor="bottom"
        onClick={(e) => {
          e.originalEvent.stopPropagation()
          onSingleMarkerClick(marker)
        }}
      >
        <TaskPin status={marker.status} priority={marker.priority} difficulty={1} />
      </Marker>
    ))

    const overlapPins = overlaps
      .filter((overlap) => isValidOverlapCenter(overlap.center) && overlap.tasks.length > 0)
      .map((overlap) => (
        <Marker
          key={`overlap-${overlap.id}`}
          longitude={overlap.center[0]}
          latitude={overlap.center[1]}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation()
            onOverlapMarkerClick(overlap.tasks, overlap.center)
          }}
        >
          <OverlapTaskPin tasks={overlap.tasks} />
        </Marker>
      ))

    return [...singlePins, ...overlapPins]
  }, [shouldCluster, nonOverlapping, overlaps, onSingleMarkerClick, onOverlapMarkerClick])

  return <>{pins}</>
}
