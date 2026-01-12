export interface OSMNode {
  id: string
  lat: number
  lon: number
  tags: Record<string, string>
}

export interface OSMWay {
  id: string
  nodeIds: string[]
  tags: Record<string, string>
  coordinates?: [number, number][]
}

export interface OSMArea {
  id: string
  nodeIds: string[]
  tags: Record<string, string>
  coordinates?: [number, number][]
}

export interface ParsedOSMData {
  nodes: OSMNode[]
  ways: OSMWay[]
  areas: OSMArea[]
}

/**
 * Parse OSM XML document into structured data for table display
 */
export const parseOSMForTable = (xml: Document): ParsedOSMData => {
  const nodes: OSMNode[] = []
  const ways: OSMWay[] = []
  const areas: OSMArea[] = []

  // Parse nodes
  const nodeElements = xml.getElementsByTagName('node')
  const nodeMap = new Map<string, { lat: number; lon: number; tags: Record<string, string> }>()

  for (let i = 0; i < nodeElements.length; i++) {
    const node = nodeElements[i]
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

  // Parse ways
  const wayElements = xml.getElementsByTagName('way')
  const AREA_TAGS = ['area', 'building', 'landuse', 'leisure', 'natural', 'place', 'waterway']

  for (let i = 0; i < wayElements.length; i++) {
    const way = wayElements[i]
    const id = way.getAttribute('id')

    if (!id) continue

    // Get node references
    const nodeRefs: string[] = []
    const ndElements = way.getElementsByTagName('nd')
    for (let j = 0; j < ndElements.length; j++) {
      const ref = ndElements[j].getAttribute('ref')
      if (ref) nodeRefs.push(ref)
    }

    // Get tags
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

    // Build coordinates if we have node references
    const coordinates: [number, number][] = []
    for (const nodeId of nodeRefs) {
      const node = nodeMap.get(nodeId)
      if (node) {
        coordinates.push([node.lon, node.lat])
      }
    }

    // Determine if it's an area
    const isArea =
      nodeRefs.length > 0 &&
      nodeRefs[0] === nodeRefs[nodeRefs.length - 1] &&
      AREA_TAGS.some((tag) => tags[tag])

    if (isArea) {
      areas.push({
        id,
        nodeIds: nodeRefs,
        tags,
        coordinates: coordinates.length > 0 ? coordinates : undefined,
      })
    } else {
      ways.push({
        id,
        nodeIds: nodeRefs,
        tags,
        coordinates: coordinates.length > 0 ? coordinates : undefined,
      })
    }
  }

  // Parse standalone nodes (nodes not part of ways/relations) with interesting tags
  const UNINTERESTING_TAGS = ['created_by', 'source', 'attribution']
  const wayNodeRefs = new Set<string>()
  for (let i = 0; i < wayElements.length; i++) {
    const way = wayElements[i]
    const ndElements = way.getElementsByTagName('nd')
    for (let j = 0; j < ndElements.length; j++) {
      const ref = ndElements[j].getAttribute('ref')
      if (ref) wayNodeRefs.add(ref)
    }
  }

  const relationElements = xml.getElementsByTagName('relation')
  const relationNodeRefs = new Set<string>()
  for (let i = 0; i < relationElements.length; i++) {
    const relation = relationElements[i]
    const members = relation.getElementsByTagName('member')
    for (let j = 0; j < members.length; j++) {
      const member = members[j]
      if (member.getAttribute('type') === 'node') {
        const ref = member.getAttribute('ref')
        if (ref) relationNodeRefs.add(ref)
      }
    }
  }

  for (const [id, node] of nodeMap.entries()) {
    const isUsedInWay = wayNodeRefs.has(id)
    const isUsedInRelation = relationNodeRefs.has(id)

    if (!isUsedInWay && !isUsedInRelation) {
      const hasInterestingTags = Object.keys(node.tags).some(
        (key) => !UNINTERESTING_TAGS.includes(key)
      )

      if (hasInterestingTags) {
        nodes.push({
          id,
          lat: node.lat,
          lon: node.lon,
          tags: node.tags,
        })
      }
    }
  }

  return { nodes, ways, areas }
}
