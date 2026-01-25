import type { TaskMarker } from '@/types/Task';
import type maplibregl from 'maplibre-gl';

/**
 * Calculate spider positions around a center point
 * Positions are arranged in a circle around the center
 */
export const calculateSpiderPositions = (
  center: [number, number],
  count: number,
  radius: number = 0.001 // Degrees - roughly 111 meters at equator
): Array<{ original: [number, number]; spidered: [number, number] }> => {
  if (count === 0) return []
  if (count === 1) {
    return [{ original: center, spidered: center }]
  }

  const positions: Array<{ original: [number, number]; spidered: [number, number] }> = []
  const angleStep = (2 * Math.PI) / count

  for (let i = 0; i < count; i++) {
    const angle = i * angleStep
    const offsetLng = radius * Math.cos(angle)
    const offsetLat = radius * Math.sin(angle)

    positions.push({
      original: center,
      spidered: [center[0] + offsetLng, center[1] + offsetLat],
    })
  }

  return positions
}

/**
 * Detect visually overlapping markers at a specific point on the map
 * Uses screen/pixel coordinates to detect overlaps
 * Returns markers with the top marker first (the one that would be clicked)
 */
export const detectVisualOverlaps = (
  map: maplibregl.Map,
  point: { x: number; y: number },
  layerId: string,
  pixelTolerance: number = 5 // pixels
): TaskMarker[] => {
  // Query at the exact point first to get the top marker
  const exactFeatures = map.queryRenderedFeatures([point.x, point.y], {
    layers: [layerId],
  })

  // Also query a small area to get all overlapping markers
  const areaFeatures = map.queryRenderedFeatures(
    [
      [point.x - pixelTolerance, point.y - pixelTolerance],
      [point.x + pixelTolerance, point.y + pixelTolerance],
    ],
    {
      layers: [layerId],
    }
  )

  // Deduplicate, prioritizing exact point matches (top markers)
  const seenIds = new Set<number>()
  const markers: TaskMarker[] = []

  // First add markers from exact point (top markers)
  exactFeatures.forEach((feature) => {
    if (feature.properties?.id && feature.geometry.type === 'Point') {
      const taskId = feature.properties.id as number
      if (!seenIds.has(taskId)) {
        seenIds.add(taskId)
        const coordinates = feature.geometry.coordinates as [number, number]
        markers.push({
          id: taskId,
          location: {
            lng: coordinates[0],
            lat: coordinates[1],
          },
          status: feature.properties.status ?? 0,
          priority: feature.properties.priority ?? 0,
        } as TaskMarker)
      }
    }
  })

  // Then add other overlapping markers
  areaFeatures.forEach((feature) => {
    if (feature.properties?.id && feature.geometry.type === 'Point') {
      const taskId = feature.properties.id as number
      if (!seenIds.has(taskId)) {
        seenIds.add(taskId)
        const coordinates = feature.geometry.coordinates as [number, number]
        markers.push({
          id: taskId,
          location: {
            lng: coordinates[0],
            lat: coordinates[1],
          },
          status: feature.properties.status ?? 0,
          priority: feature.properties.priority ?? 0,
        } as TaskMarker)
      }
    }
  })

  return markers
}

/**
 * Calculate spider positions for a group of overlapping markers
 * The center is calculated from the original marker positions
 * Radius is adaptive based on zoom level and number of markers
 *
 * Positions markers in an upper semicircle (bubble shape):
 * - Distributes markers from horizontal left through vertical up to horizontal right
 * - This prevents lines from going downward behind other markers
 * - Markers are evenly spaced across the upper 180° arc
 */
export const createSpiderGroup = (
  markers: TaskMarker[],
  clickPoint: [number, number],
  zoom?: number,
  radius?: number
): Map<number, { original: [number, number]; spidered: [number, number] }> => {
  // Calculate adaptive radius based on zoom level if not provided
  let calculatedRadius = radius
  if (calculatedRadius === undefined && zoom !== undefined) {
    // At zoom 15, use ~0.0005 degrees (roughly 55 meters)
    // Scale with zoom: higher zoom = smaller radius
    const baseRadius = 0.0005
    const zoomFactor = Math.pow(0.7, zoom - 15)
    calculatedRadius = baseRadius * zoomFactor
    // Ensure minimum radius for visibility
    calculatedRadius = Math.max(calculatedRadius, 0.0001)
    // Scale with number of markers
    calculatedRadius = calculatedRadius * (1 + markers.length * 0.1)
  } else if (calculatedRadius === undefined) {
    calculatedRadius = 0.001 // Default fallback
  }

  const spiderMap = new Map<number, { original: [number, number]; spidered: [number, number] }>()

  if (markers.length === 0) return spiderMap
  if (markers.length === 1) {
    const marker = markers[0]
    const originalPos: [number, number] = [marker.location.lng, marker.location.lat]
    // Single marker goes straight up
    spiderMap.set(marker.id, {
      original: originalPos,
      spidered: [clickPoint[0], clickPoint[1] + calculatedRadius],
    })
    return spiderMap
  }

  // Ensure minimum radius for line visibility
  const minRadius = calculatedRadius * 0.8

  // Distribute markers in an upper semicircle (from 0 to π radians)
  // 0 = East (right), π/2 = North (up), π = West (left)
  // We go from π (left) to 0 (right) so markers are ordered left-to-right
  const arcLength = Math.PI // 180 degrees for upper semicircle
  const segmentSize = arcLength / markers.length

  markers.forEach((marker, index) => {
    const originalPos: [number, number] = [marker.location.lng, marker.location.lat]

    // Position marker at center of its segment
    // Start from π (left) and go towards 0 (right)
    const spiderAngle = Math.PI - (index + 0.5) * segmentSize

    // Calculate distance from original position to click point
    const dx = originalPos[0] - clickPoint[0]
    const dy = originalPos[1] - clickPoint[1]
    const distanceFromCenter = Math.sqrt(dx * dx + dy * dy)

    // Use the larger of calculated radius or distance + minimum to ensure visible lines
    const effectiveRadius = Math.max(calculatedRadius, distanceFromCenter + minRadius)

    const offsetLng = effectiveRadius * Math.cos(spiderAngle)
    const offsetLat = effectiveRadius * Math.sin(spiderAngle)

    spiderMap.set(marker.id, {
      original: originalPos,
      spidered: [clickPoint[0] + offsetLng, clickPoint[1] + offsetLat],
    })
  })

  return spiderMap
}

