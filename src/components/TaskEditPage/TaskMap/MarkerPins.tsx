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
  selectedTaskIds?: Set<number>
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
  selectedTaskIds = new Set(),
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
        const selectedCount = overlap.tasks.filter((t) => selectedTaskIds.has(t.id)).length
        const hasSelected = selectedCount > 0
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
                position: 'relative',
                ...(shouldHighlight
                  ? { filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.8))' }
                  : hasSelected
                    ? { filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.9))' }
                    : {}),
              }}
            >
              {hasSelected && (
                <div
                  className="-top-1 -right-1 absolute flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-blue-500 font-bold text-[9px] text-white"
                  style={{ zIndex: 10 }}
                >
                  {selectedCount}
                </div>
              )}
              <OverlapTaskPin tasks={overlap.tasks} />
            </div>
          </Marker>
        )
      })

    return overlapPins
  }, [shouldCluster, overlaps, primaryTaskId, onOverlapMarkerClick, activeBundle, selectedTaskIds])

  return <>{pins}</>
}
