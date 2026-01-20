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
  activeBundle?: { bundleId: number; taskIds: number[] } | null
}

export const MarkerPins = ({
  shouldCluster,
  nonOverlapping,
  overlaps,
  primaryTaskId,
  onSingleMarkerClick,
  onOverlapMarkerClick,
  activeBundle,
}: MarkerPinsProps) => {
  const pins = useMemo(() => {
    if (shouldCluster) {
      return null
    }

    const validNonOverlapping = nonOverlapping.filter((marker) => isValidLocation(marker.location))

    // Find primary task marker to get its status and priority for bundled tasks
    const primaryMarker = validNonOverlapping.find((marker) => marker.id === primaryTaskId)

    const singlePins = validNonOverlapping.map((marker) => {
      const isPrimary = marker.id === primaryTaskId
      const isBundled = activeBundle?.taskIds.includes(marker.id) ?? false
      // Apply primary task styles if it's the primary task or a bundled task
      const shouldHighlight = isPrimary || isBundled
      // Use primary task's status and priority for bundled tasks
      const displayStatus = isBundled && primaryMarker ? primaryMarker.status : marker.status
      const displayPriority = isBundled && primaryMarker ? primaryMarker.priority : marker.priority

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
            className={shouldHighlight ? 'scale-125 transition-transform' : ''}
            style={{
              cursor: 'pointer',
              ...(shouldHighlight
                ? { filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.8))' }
                : {}),
            }}
          >
            <TaskPin status={displayStatus} priority={displayPriority} difficulty={1} />
          </div>
        </Marker>
      )
    })

    const overlapPins = overlaps
      .filter((overlap) => isValidOverlapCenter(overlap.center) && overlap.tasks.length > 0)
      .map((overlap) => {
        const hasPrimary = overlap.tasks.some((t) => t.id === primaryTaskId)
        const hasBundled = activeBundle
          ? overlap.tasks.some((t) => activeBundle.taskIds.includes(t.id))
          : false
        // Apply primary task styles if it has the primary task or any bundled tasks
        const shouldHighlight = hasPrimary || hasBundled
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
              className={shouldHighlight ? 'scale-125 transition-transform' : ''}
              style={{
                cursor: 'pointer',
                ...(shouldHighlight
                  ? { filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.8))' }
                  : {}),
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
    activeBundle,
  ])

  return <>{pins}</>
}
