import type { Task } from '@/types/Task'

export const getOsmServerUrl = () => {
  return import.meta.env.VITE_OSM_SERVER || 'https://www.openstreetmap.org'
}

export interface OsmFeature {
  type: 'node' | 'way' | 'relation'
  id: number
}

export const parseOsmFeatureFromTask = (task: Task): OsmFeature | null => {
  if (!task.geometries) return null

  try {
    const geometries =
      typeof task.geometries === 'string' ? JSON.parse(task.geometries) : task.geometries

    // Check FeatureCollection
    if (geometries.type === 'FeatureCollection' && geometries.features?.length > 0) {
      const properties = geometries.features[0]?.properties
      if (properties) {
        // Look for @id (standard OSM property)
        const osmId = properties['@id'] || properties.id || properties.osm_id
        if (osmId && typeof osmId === 'string') {
          const match = osmId.match(/^(node|way|relation)\/(\d+)$/)
          if (match) {
            return { type: match[1] as 'node' | 'way' | 'relation', id: parseInt(match[2], 10) }
          }
        }
        // Look for separate osm_type and osm_id properties
        const osmType = properties['@type'] || properties.osm_type
        const numericId = properties.osm_id || properties['@osmId']
        if (osmType && numericId) {
          const type = String(osmType).toLowerCase()
          if (type === 'node' || type === 'way' || type === 'relation') {
            return { type, id: Number(numericId) }
          }
        }
      }
    } else if (geometries.type === 'Feature' && geometries.properties) {
      const properties = geometries.properties
      const osmId = properties['@id'] || properties.id || properties.osm_id
      if (osmId && typeof osmId === 'string') {
        const match = osmId.match(/^(node|way|relation)\/(\d+)$/)
        if (match) {
          return { type: match[1] as 'node' | 'way' | 'relation', id: parseInt(match[2], 10) }
        }
      }
    }
  } catch {
    // Ignore parse errors
  }

  return null
}
