import { useMemo } from 'react'
import { Layer, Source } from 'react-map-gl/maplibre'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import type { TaskMarker } from '@/types/Task'

// Color palette for spider lines - distinct, visible colors
const SPIDER_LINE_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
] as const

interface SpiderMarkersProps {
  markers: TaskMarker[]
  spiderPositions: Map<number, { original: [number, number]; spidered: [number, number] }>
  primaryTaskId?: number
  activeBundle?: { bundleId: number; taskIds: number[] } | null
  onMarkerClick?: (task: TaskMarker) => void
  selectedTaskId?: number | null
  lassoSelectedTaskIds?: Set<number>
}

/**
 * Renders markers at spider positions with lines connecting to original positions
 */
export const SpiderMarkers = ({
  markers,
  spiderPositions,
  primaryTaskId,
  activeBundle,
  onMarkerClick: _onMarkerClick,
  selectedTaskId,
  lassoSelectedTaskIds = new Set(),
}: SpiderMarkersProps) => {
  // Create GeoJSON for spidered markers
  const spideredGeoJSON = useMemo(() => {
    const features = markers
      .map((marker) => {
        const position = spiderPositions.get(marker.id)
        if (!position) return null

        const isPrimary = marker.id === primaryTaskId
        const isBundled = activeBundle?.taskIds.includes(marker.id) ?? false
        const isSelected = marker.id === selectedTaskId
        const isLassoSelected = lassoSelectedTaskIds.has(marker.id)

        return {
          type: 'Feature' as const,
          properties: {
            id: marker.id,
            status: marker.status ?? 0,
            priority: marker.priority ?? 0,
            difficulty: (marker as unknown as { difficulty?: number }).difficulty ?? 1,
            isHighlighted: isPrimary || isBundled,
            isSelected,
            isLassoSelected,
            isSpidered: true,
          },
          geometry: {
            type: 'Point' as const,
            coordinates: position.spidered,
          },
        }
      })
      .filter((f) => f !== null)

    return {
      type: 'FeatureCollection' as const,
      features,
    } as GeoJSON.FeatureCollection
  }, [markers, spiderPositions, primaryTaskId, activeBundle, selectedTaskId, lassoSelectedTaskIds])

  // Create GeoJSON for spider lines (connecting original to spidered positions)
  const spiderLinesGeoJSON = useMemo(() => {
    let colorIndex = 0
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

        const feature = {
          type: 'Feature' as const,
          properties: {
            taskId: marker.id,
            colorIndex: colorIndex % SPIDER_LINE_COLORS.length,
          },
          geometry: {
            type: 'LineString' as const,
            coordinates: [position.original, position.spidered],
          },
        }
        colorIndex++
        return feature
      })
      .filter((f) => f !== null)

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
          {/* White outline for contrast - render below markers */}
          <Layer
            id="spider-lines-outline"
            type="line"
            beforeId={LAYER_IDS.points}
            paint={{
              'line-color': '#ffffff',
              'line-width': 4,
              'line-opacity': 0.9,
            }}
          />
          {/* Colored line on top of outline but below markers */}
          <Layer
            id="spider-lines-layer"
            type="line"
            beforeId={LAYER_IDS.points}
            paint={{
              'line-color': [
                'match',
                ['get', 'colorIndex'],
                0, '#ef4444', // red
                1, '#f97316', // orange
                2, '#eab308', // yellow
                3, '#22c55e', // green
                4, '#14b8a6', // teal
                5, '#3b82f6', // blue
                6, '#8b5cf6', // violet
                7, '#ec4899', // pink
                8, '#06b6d4', // cyan
                9, '#84cc16', // lime
                '#6366f1', // default fallback
              ],
              'line-width': 2.5,
              'line-opacity': 1,
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
              // Bundled AND selected marker (dual border: purple outer, green inner)
              ['all', ['get', 'isHighlighted'], ['get', 'isSelected']],
              [
                'concat',
                'marker-pin-',
                ['to-string', ['get', 'status']],
                '-',
                ['to-string', ['coalesce', ['get', 'difficulty'], 1]],
                '-bundled-selected',
              ],
              // Bundled/primary task marker (green border)
              ['get', 'isHighlighted'],
              [
                'concat',
                'marker-pin-',
                ['to-string', ['get', 'status']],
                '-',
                ['to-string', ['coalesce', ['get', 'difficulty'], 1]],
                '-bundled',
              ],
              // Lasso AND selected marker (dual border: purple outer, yellow inner)
              ['all', ['get', 'isLassoSelected'], ['get', 'isSelected']],
              [
                'concat',
                'marker-pin-',
                ['to-string', ['get', 'status']],
                '-',
                ['to-string', ['coalesce', ['get', 'difficulty'], 1]],
                '-lasso-selected',
              ],
              // Popup selected marker (purple border)
              ['get', 'isSelected'],
              [
                'concat',
                'marker-pin-',
                ['to-string', ['get', 'status']],
                '-',
                ['to-string', ['coalesce', ['get', 'difficulty'], 1]],
                '-selected',
              ],
              // Lasso selected marker (yellow border)
              ['get', 'isLassoSelected'],
              [
                'concat',
                'marker-pin-',
                ['to-string', ['get', 'status']],
                '-',
                ['to-string', ['coalesce', ['get', 'difficulty'], 1]],
                '-lasso',
              ],
              // Normal marker
              [
                'concat',
                'marker-pin-',
                ['to-string', ['get', 'status']],
                '-',
                ['to-string', ['coalesce', ['get', 'difficulty'], 1]],
              ],
            ],
            'icon-size': [
              'case',
              // Highlighted (bundled/primary) or popup selected - scale up
              ['any', ['get', 'isHighlighted'], ['get', 'isSelected']],
              1.4,
              // Normal (including lasso-selected)
              1.0,
            ],
            'icon-anchor': 'bottom',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'symbol-sort-key': [
              'case',
              ['all', ['get', 'isHighlighted'], ['get', 'isSelected']],
              1100,
              ['get', 'isHighlighted'],
              1000,
              ['all', ['get', 'isLassoSelected'], ['get', 'isSelected']],
              950,
              ['get', 'isSelected'],
              900,
              ['get', 'isLassoSelected'],
              850,
              0,
            ],
          }}
        />
      </Source>
    </>
  )
}

