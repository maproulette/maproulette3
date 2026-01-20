import { useMemo } from 'react'
import { Marker } from 'react-map-gl/maplibre'
import { OverlapTaskPin } from '@/components/ExploreChallengesPage/OverlapTaskPin'
import { TaskPin } from '@/components/ExploreChallengesPage/TaskPin'
import type { TaskMarker } from '@/types/Task'
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
  primaryTaskId: number
  onSingleMarkerClick: (task: TaskMarker) => void
  onOverlapMarkerClick: (tasks: TaskMarker[], center: [number, number]) => void
}

export const MarkerPins = ({
  shouldCluster,
  nonOverlapping,
  overlaps,
  primaryTaskId,
  onSingleMarkerClick,
  onOverlapMarkerClick,
}: MarkerPinsProps) => {
  const pins = useMemo(() => {
    if (shouldCluster) {
      return null
    }

    const validNonOverlapping = nonOverlapping.filter((marker) => isValidLocation(marker.location))

    const singlePins = validNonOverlapping.map((marker) => {
      const isPrimary = marker.id === primaryTaskId
      return (
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
          <div
            className={isPrimary ? 'scale-125 transition-transform' : ''}
            style={{
              cursor: 'pointer',
              ...(isPrimary ? { filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.8))' } : {}),
            }}
          >
            <TaskPin status={marker.status} priority={marker.priority} difficulty={1} />
          </div>
        </Marker>
      )
    })

    const overlapPins = overlaps
      .filter((overlap) => isValidOverlapCenter(overlap.center) && overlap.tasks.length > 0)
      .map((overlap) => {
        const hasPrimary = overlap.tasks.some((t) => t.id === primaryTaskId)
        return (
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
            <div
              className={hasPrimary ? 'scale-125 transition-transform' : ''}
              style={{
                cursor: 'pointer',
                ...(hasPrimary ? { filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.8))' } : {}),
              }}
            >
              <OverlapTaskPin tasks={overlap.tasks} />
            </div>
          </Marker>
        )
      })

    return [...singlePins, ...overlapPins]
  }, [
    shouldCluster,
    nonOverlapping,
    overlaps,
    primaryTaskId,
    onSingleMarkerClick,
    onOverlapMarkerClick,
  ])

  return <>{pins}</>
}
