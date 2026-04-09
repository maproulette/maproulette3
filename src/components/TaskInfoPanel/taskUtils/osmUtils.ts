import type { Task } from '@/types/Task'

export const getOsmServerUrl = () => {
  return import.meta.env.VITE_OSM_SERVER || 'https://www.openstreetmap.org'
}

export interface OsmFeature {
  type: 'node' | 'way' | 'relation'
  id: number
}

/**
 * Infer OSM element type from a GeoJSON geometry type.
 * Point → node, LineString → way, Polygon → way (or relation for multipolygon,
 * but we can't distinguish here so default to way).
 */
const inferOsmTypeFromGeometry = (
  geomType: string | undefined
): 'node' | 'way' | 'relation' | null => {
  switch (geomType) {
    case 'Point':
      return 'node'
    case 'LineString':
    case 'MultiLineString':
    case 'Polygon':
      return 'way'
    case 'MultiPolygon':
      return 'relation'
    default:
      return null
  }
}

/**
 * Try to extract an OSM feature (type + id) from a GeoJSON feature's properties.
 * Handles multiple property naming conventions used by different challenge creators.
 */
const parseOsmFeatureFromProperties = (
  properties: Record<string, unknown>,
  geomType?: string
): OsmFeature | null => {
  // 1. Look for typed string IDs like "node/123", "way/456"
  const typedId = properties['@id'] || properties.id || properties.osm_id
  if (typedId && typeof typedId === 'string') {
    const match = typedId.match(/^(node|way|relation)\/(\d+)$/)
    if (match) {
      return { type: match[1] as 'node' | 'way' | 'relation', id: parseInt(match[2], 10) }
    }
  }

  // 2. Look for a numeric ID (osmid, osm_id, @osmId) with an optional explicit type
  const numericId = properties.osmid || properties.osm_id || properties['@osmId']
  if (numericId != null) {
    const numId = Number(numericId)
    if (Number.isFinite(numId) && numId > 0) {
      // Use explicit type if available, otherwise infer from geometry
      const osmType = properties['@type'] || properties.osm_type
      if (osmType) {
        const type = String(osmType).toLowerCase()
        if (type === 'node' || type === 'way' || type === 'relation') {
          return { type, id: numId }
        }
      }
      const inferredType = inferOsmTypeFromGeometry(geomType)
      if (inferredType) {
        return { type: inferredType, id: numId }
      }
    }
  }

  return null
}

export const parseOsmFeatureFromTask = (task: Task): OsmFeature | null => {
  if (!task.geometries) return null

  try {
    const geometries =
      typeof task.geometries === 'string' ? JSON.parse(task.geometries) : task.geometries

    if (geometries.type === 'FeatureCollection' && geometries.features?.length > 0) {
      const feature = geometries.features[0]
      if (feature?.properties) {
        return parseOsmFeatureFromProperties(feature.properties, feature.geometry?.type)
      }
    } else if (geometries.type === 'Feature' && geometries.properties) {
      return parseOsmFeatureFromProperties(geometries.properties, geometries.geometry?.type)
    }
  } catch {
    // Ignore parse errors
  }

  return null
}
