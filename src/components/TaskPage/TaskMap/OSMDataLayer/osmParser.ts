import { AREA_TAGS, UNINTERESTING_TAGS } from './constants'

/**
 * Parses OSM XML and converts it to GeoJSON for rendering on MapLibre
 */
export const parseOSMXML = (xml: Document): GeoJSON.FeatureCollection => {
  const features: GeoJSON.Feature[] = []

  // Parse nodes
  const nodes = xml.getElementsByTagName('node')
  const nodeMap = new Map<string, { lat: number; lon: number; tags: Record<string, string> }>()

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const id = node.getAttribute('id')
    const lat = parseFloat(node.getAttribute('lat') || '0')
    const lon = parseFloat(node.getAttribute('lon') || '0')

    if (id) {
      const tags: Record<string, string> = {}
      const tagElements = node.getElementsByTagName('tag')
      for (let j = 0; j < tagElements.length; j++) {
        const tag = tagElements[j]
        const k = tag.getAttribute('k')
        const v = tag.getAttribute('v')
        if (k && v) {
          tags[k] = v
        }
      }

      nodeMap.set(id, { lat, lon, tags })
    }
  }

  // Parse relations (for checking node usage)
  const relations = xml.getElementsByTagName('relation')
  const relationNodeRefs = new Set<string>()
  for (let i = 0; i < relations.length; i++) {
    const relation = relations[i]
    const members = relation.getElementsByTagName('member')
    for (let j = 0; j < members.length; j++) {
      const member = members[j]
      if (member.getAttribute('type') === 'node') {
        const ref = member.getAttribute('ref')
        if (ref) relationNodeRefs.add(ref)
      }
    }
  }

  // Parse ways
  const ways = xml.getElementsByTagName('way')
  const wayNodeRefs = new Set<string>()

  for (let i = 0; i < ways.length; i++) {
    const way = ways[i]
    const id = way.getAttribute('id')
    if (!id) continue

    const ndElements = way.getElementsByTagName('nd')
    const coordinates: [number, number][] = []
    const nodeRefs: string[] = []

    for (let j = 0; j < ndElements.length; j++) {
      const ref = ndElements[j].getAttribute('ref')
      if (ref && nodeMap.has(ref)) {
        const node = nodeMap.get(ref)
        if (node) {
          coordinates.push([node.lon, node.lat])
          nodeRefs.push(ref)
          wayNodeRefs.add(ref)
        }
      }
    }

    if (coordinates.length < 2) continue

    const tags: Record<string, string> = {}
    const tagElements = way.getElementsByTagName('tag')
    for (let j = 0; j < tagElements.length; j++) {
      const tag = tagElements[j]
      const k = tag.getAttribute('k')
      const v = tag.getAttribute('v')
      if (k && v) {
        tags[k] = v
      }
    }

    // Check if it's an area (closed way with area tag) - matching maproulette3 logic
    const isArea = (() => {
      // Must be closed (first node === last node)
      if (nodeRefs[0] !== nodeRefs[nodeRefs.length - 1]) {
        return false
      }
      // Must have an area tag
      return AREA_TAGS.some((tag) => tags[tag])
    })()

    if (isArea) {
      // Remove last coordinate if it's a duplicate of first (for proper polygon)
      if (
        coordinates.length > 1 &&
        coordinates[0][0] === coordinates[coordinates.length - 1][0] &&
        coordinates[0][1] === coordinates[coordinates.length - 1][1]
      ) {
        coordinates.pop()
      }
      // Ensure polygon is closed
      if (
        coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
        coordinates[0][1] !== coordinates[coordinates.length - 1][1]
      ) {
        coordinates.push(coordinates[0])
      }

      features.push({
        type: 'Feature',
        id: `way-${id}`,
        properties: {
          id,
          type: 'area',
          ...tags,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates],
        },
      })
    } else {
      features.push({
        type: 'Feature',
        id: `way-${id}`,
        properties: {
          id,
          type: 'way',
          ...tags,
        },
        geometry: {
          type: 'LineString',
          coordinates,
        },
      })
    }
  }

  // Parse standalone nodes (nodes not part of ways/relations) - matching maproulette3 logic
  for (const [id, node] of nodeMap.entries()) {
    // Check if node is used in any way or relation
    const isUsedInWay = wayNodeRefs.has(id)
    const isUsedInRelation = relationNodeRefs.has(id)

    // Only add standalone nodes (not used in ways/relations) with interesting tags
    if (!isUsedInWay && !isUsedInRelation) {
      const hasInterestingTags = Object.keys(node.tags).some(
        (key) => !UNINTERESTING_TAGS.includes(key)
      )

      if (hasInterestingTags) {
        features.push({
          type: 'Feature',
          id: `node-${id}`,
          properties: {
            id,
            type: 'node',
            ...node.tags,
          },
          geometry: {
            type: 'Point',
            coordinates: [node.lon, node.lat],
          },
        })
      }
    }
  }

  return {
    type: 'FeatureCollection',
    features,
  }
}
