import { useMemo } from 'react'
import { Marker } from 'react-map-gl/maplibre'
import { OverlapTaskPin } from '@/components/ExploreChallengesPage/OverlapTaskPin'
import type { TaskMarker } from '@/types/Task'
import { isValidOverlapCenter } from './utils'

interface MarkerPinsProps {
  shouldCluster: boolean
  overlaps: Array<{
    id: string
    center: [number, number]
    tasks: TaskMarker[]
    radius: number
  }>
  primaryTaskId: number
  onOverlapMarkerClick: (tasks: TaskMarker[], center: [number, number]) => void
  activeBundle?: { bundleId: number; taskIds: number[] } | null
}

/**
 * Renders only overlap markers as React components.
 * Regular markers are now rendered using MapLibre's native layer-based rendering
 * for much better performance with large numbers of markers.
 */
export const MarkerPins = ({
  shouldCluster,
  overlaps,
  primaryTaskId,
  onOverlapMarkerClick,
  activeBundle,
}: MarkerPinsProps) => {
  const pins = useMemo(() => {
    // When clustering, no overlap markers are shown (they're handled by clustering)
    if (shouldCluster) {
      return null
    }

    // Only render overlap markers as React components (much fewer in number)
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

    return overlapPins
  }, [shouldCluster, overlaps, primaryTaskId, onOverlapMarkerClick, activeBundle])

  return <>{pins}</>
}
