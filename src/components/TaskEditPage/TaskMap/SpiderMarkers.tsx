import { useMemo } from 'react'
import { Layer, Source } from 'react-map-gl/maplibre'
import type { TaskMarker } from '@/types/Task'

interface SpiderMarkersProps {
  markers: TaskMarker[]
  spiderPositions: Map<number, { original: [number, number]; spidered: [number, number] }>
  primaryTaskId?: number
  activeBundle?: { bundleId: number; taskIds: number[] } | null
  onMarkerClick?: (task: TaskMarker) => void
}

/**
 * Renders markers at spider positions with lines connecting to original positions
 */
export const SpiderMarkers = ({
  markers,
  spiderPositions,
  primaryTaskId,
  activeBundle,
  onMarkerClick,
}: SpiderMarkersProps) => {
  // Create GeoJSON for spidered markers
  const spideredGeoJSON = useMemo(() => {
    const features = markers
      .map((marker) => {
        const position = spiderPositions.get(marker.id)
        if (!position) return null

        const isPrimary = marker.id === primaryTaskId
        const isBundled = activeBundle?.taskIds.includes(marker.id) ?? false

        return {
          type: 'Feature' as const,
          properties: {
            id: marker.id,
            status: marker.status ?? 0,
            priority: marker.priority ?? 0,
            isHighlighted: isPrimary || isBundled,
            isSpidered: true,
          },
          geometry: {
            type: 'Point' as const,
            coordinates: position.spidered,
          },
        }
      })
      .filter((f): f is GeoJSON.Feature => f !== null)

    return {
      type: 'FeatureCollection' as const,
      features,
    } as GeoJSON.FeatureCollection
  }, [markers, spiderPositions, primaryTaskId, activeBundle])

  // Create GeoJSON for spider lines (connecting original to spidered positions)
  const spiderLinesGeoJSON = useMemo(() => {
    const features = markers
      .map((marker) => {
        const position = spiderPositions.get(marker.id)
        if (!position) return null

        // Only draw line if position changed
        if (
          position.original[0] === position.spidered[0] &&
          position.original[1] === position.spidered[1]
        ) {
          return null
        }

        return {
          type: 'Feature' as const,
          properties: {
            taskId: marker.id,
          },
          geometry: {
            type: 'LineString' as const,
            coordinates: [position.original, position.spidered],
          },
        }
      })
      .filter((f): f is GeoJSON.Feature => f !== null)

    return {
      type: 'FeatureCollection' as const,
      features,
    } as GeoJSON.FeatureCollection
  }, [markers, spiderPositions])

  return (
    <>
      {/* Render spider lines */}
      {spiderLinesGeoJSON.features.length > 0 && (
        <Source
          id="spider-lines"
          type="geojson"
          data={spiderLinesGeoJSON}
          lineMetrics={true}
        >
          <Layer
            id="spider-lines-layer"
            type="line"
            paint={{
              'line-color': '#6366f1',
              'line-width': 2,
              'line-opacity': 0.6,
              'line-dasharray': [2, 2],
            }}
          />
        </Source>
      )}

      {/* Render spidered markers using the existing unclustered layer style */}
      <Source id="spidered-markers" type="geojson" data={spideredGeoJSON}>
        <Layer
          id="spidered-markers-layer"
          type="symbol"
          layout={{
            'icon-image': [
              'case',
              ['get', 'isHighlighted'],
              [
                'concat',
                'marker-pin-',
                ['to-string', ['get', 'status']],
                '-1-selected',
              ],
              [
                'concat',
                'marker-pin-',
                ['to-string', ['get', 'status']],
                '-1',
              ],
            ],
            'icon-size': [
              'case',
              ['get', 'isHighlighted'],
              1.4,
              1.0,
            ],
            'icon-anchor': 'bottom',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
          }}
        />
      </Source>
    </>
  )
}

