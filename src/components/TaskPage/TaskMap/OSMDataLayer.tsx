import type maplibregl from 'maplibre-gl'
import { Popup } from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import { useTaskMapContext } from '@/contexts/tasks/TaskMapContext'

interface OSMDataLayerProps {
  xmlData: Document | null
  showOSMElements: {
    nodes: boolean
    ways: boolean
    areas: boolean
  }
  elementOrder?: ('nodes' | 'ways' | 'areas')[]
  dataLayerOrder?: ('task-features' | 'osm-data')[]
}

// Colors matching maproulette3
const COLORS = {
  'orange-jaffa': '#ff8c00', // Orange for ways
  'pink-light': '#ffc0cb', // Pink for areas
  gold: '#ffd700', // Gold for highlights
  red: '#dc2626', // Red for nodes
}

// Uninteresting tags to filter out standalone nodes
const UNINTERESTING_TAGS = [
  'source',
  'source_ref',
  'source:ref',
  'history',
  'attribution',
  'created_by',
  'tiger:county',
  'tiger:tlid',
  'tiger:upload_uuid',
]

// Area tags that indicate a way should be rendered as an area
const AREA_TAGS = [
  'area',
  'building',
  'leisure',
  'tourism',
  'ruins',
  'historic',
  'landuse',
  'military',
  'natural',
  'sport',
]

/**
 * Parses OSM XML and converts it to GeoJSON for rendering on MapLibre
 */
const parseOSMXML = (xml: Document): GeoJSON.FeatureCollection => {
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

export const OSMDataLayer = ({
  xmlData,
  showOSMElements,
  elementOrder = ['ways', 'areas', 'nodes'],
  dataLayerOrder = ['task-features', 'osm-data'],
}: OSMDataLayerProps) => {
  const { map, mapLoaded } = useTaskMapContext()
  const sourceId = 'osm-data'
  const layersRef = useRef<string[]>([])
  const currentPopupRef = useRef<maplibregl.Popup | null>(null)
  const highlightedFeatureIdRef = useRef<string | null>(null)
  const eventHandlerTimeoutRef = useRef<number | null>(null)
  const mapClickHandlerRef = useRef<((e: maplibregl.MapMouseEvent) => void) | null>(null)

  useEffect(() => {
    if (!map.current || !mapLoaded || !xmlData) {
      // Clean up layers if data is removed
      if (map.current) {
        layersRef.current.forEach((layerId) => {
          if (map.current?.getLayer(layerId)) {
            map.current.removeLayer(layerId)
          }
        })
        layersRef.current = []

        if (map.current.getSource(sourceId)) {
          map.current.removeSource(sourceId)
        }
      }
      return
    }

    // Check if layers already exist - if so, just reposition them instead of recreating
    const existingLayers = layersRef.current.filter((id) => map.current?.getLayer(id))
    const shouldRepositionOnly = existingLayers.length > 0 && map.current.getSource(sourceId)

    if (shouldRepositionOnly) {
      // Layers already exist, just reposition based on dataLayerOrder
      const osmDataIndex = dataLayerOrder.indexOf('osm-data')
      const taskFeaturesIndex = dataLayerOrder.indexOf('task-features')
      const osmShouldBeOnTop = osmDataIndex < taskFeaturesIndex

      // Find where to position OSM layers
      let targetBeforeLayerId: string | undefined

      if (osmShouldBeOnTop) {
        // OSM should be on top - find the last task feature layer or task marker layer
        const taskFeatureLayerIds = [
          'task-geometries-point',
          'task-geometries-outline',
          'task-geometries-line',
          'task-geometries-fill',
        ]
        for (const layerId of taskFeatureLayerIds) {
          const layer = map.current.getLayer(layerId)
          if (layer) {
            const style = map.current.getStyle()
            const layers = style.layers || []
            const layerIndex = layers.findIndex((l) => l.id === layerId)
            if (layerIndex >= 0 && layerIndex < layers.length - 1) {
              targetBeforeLayerId = layers[layerIndex + 1].id
              break
            }
          }
        }

        // If no task features, check task markers
        if (!targetBeforeLayerId) {
          const taskMarkerLayerId = 'task-unclustered-point'
          const taskMarkerLayer = map.current.getLayer(taskMarkerLayerId)
          if (taskMarkerLayer) {
            const style = map.current.getStyle()
            const layers = style.layers || []
            const layerIndex = layers.findIndex((l) => l.id === taskMarkerLayerId)
            if (layerIndex >= 0 && layerIndex < layers.length - 1) {
              targetBeforeLayerId = layers[layerIndex + 1].id
            }
          }
        }
      } else {
        // OSM should be below - find first task feature layer
        const taskFeatureLayerIds = [
          'task-geometries-fill',
          'task-geometries-line',
          'task-geometries-outline',
          'task-geometries-point',
        ]
        for (const layerId of taskFeatureLayerIds) {
          const layer = map.current.getLayer(layerId)
          if (layer) {
            targetBeforeLayerId = layerId
            break
          }
        }

        // If no task features, find task markers
        if (!targetBeforeLayerId) {
          const taskMarkerLayerId = 'task-unclustered-point'
          const taskMarkerLayer = map.current.getLayer(taskMarkerLayerId)
          if (taskMarkerLayer) {
            targetBeforeLayerId = taskMarkerLayerId
          }
        }
      }

      // Move all OSM layers to the correct position
      if (targetBeforeLayerId) {
        // Move in reverse order to maintain relative order
        existingLayers.reverse().forEach((layerId) => {
          if (map.current?.getLayer(layerId)) {
            try {
              map.current.moveLayer(layerId, targetBeforeLayerId)
            } catch (error) {
              console.warn(`Failed to move OSM layer ${layerId}:`, error)
            }
          }
        })
      }
      return // Don't recreate layers, just repositioned them
    }

    try {
      // Parse OSM XML to GeoJSON
      const geoJsonData = parseOSMXML(xmlData)

      // Filter features based on showOSMElements
      const filteredFeatures = geoJsonData.features.filter((feature) => {
        const type = feature.properties?.type
        if (type === 'node') return showOSMElements.nodes
        if (type === 'way') return showOSMElements.ways
        if (type === 'area') return showOSMElements.areas
        return true
      })

      const filteredGeoJson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: filteredFeatures,
      }

      // Remove existing source and layers
      layersRef.current.forEach((layerId) => {
        if (map.current?.getLayer(layerId)) {
          map.current.removeLayer(layerId)
        }
      })
      layersRef.current = []

      if (map.current.getSource(sourceId)) {
        map.current.removeSource(sourceId)
      }

      // Add source (no need for _highlighted property, using feature state instead)
      // Note: Features already have top-level 'id' fields (e.g., 'way-123', 'node-456')
      // MapLibre requires promoteId to use feature IDs for feature state API
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: filteredGeoJson,
        promoteId: 'id', // Use the top-level 'id' field for feature state
      })


      // Use zoom-based expressions instead of fixed values to prevent flickering
      // This allows MapLibre to smoothly interpolate styles as zoom changes

      // Add layers in the specified order
      const layerConfigs: Array<{
        element: 'nodes' | 'ways' | 'areas'
        type: 'fill' | 'line' | 'circle'
        id: string
        // biome-ignore lint/suspicious/noExplicitAny: MapLibre layer config types are complex and vary by layer type
        config: any
      }> = []

      // Build layer configs based on element order
      elementOrder.forEach((element) => {
        if (element === 'areas' && showOSMElements.areas) {
          // Area fill layer
          layerConfigs.push({
            element: 'areas',
            type: 'fill',
            id: `${sourceId}-area-fill`,
            config: {
              id: `${sourceId}-area-fill`,
              type: 'fill',
              source: sourceId,
              filter: ['==', ['get', 'type'], 'area'],
              paint: {
                'fill-color': COLORS['pink-light'],
                'fill-opacity': 0.5,
              },
            },
          })
        }
        if (element === 'ways' && showOSMElements.ways) {
          // Way line layer with zoom-based width
          layerConfigs.push({
            element: 'ways',
            type: 'line',
            id: `${sourceId}-way-line`,
            config: {
              id: `${sourceId}-way-line`,
              type: 'line',
              source: sourceId,
              filter: ['==', ['get', 'type'], 'way'],
              paint: {
                'line-color': COLORS['orange-jaffa'],
                'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2, 15, 4, 18, 5],
              },
            },
          })
        }
        if (element === 'areas' && showOSMElements.areas) {
          // Area line layer with zoom-based width
          layerConfigs.push({
            element: 'areas',
            type: 'line',
            id: `${sourceId}-area-line`,
            config: {
              id: `${sourceId}-area-line`,
              type: 'line',
              source: sourceId,
              filter: ['==', ['get', 'type'], 'area'],
              paint: {
                'line-color': COLORS['pink-light'],
                'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2, 15, 4, 18, 5],
              },
            },
          })
        }
        if (element === 'nodes' && showOSMElements.nodes) {
          // Node circle layer with zoom-based radius
          layerConfigs.push({
            element: 'nodes',
            type: 'circle',
            id: `${sourceId}-node`,
            config: {
              id: `${sourceId}-node`,
              type: 'circle',
              source: sourceId,
              filter: ['==', ['get', 'type'], 'node'],
              paint: {
                'circle-color': COLORS.red,
                'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 7.5, 18, 15],
                'circle-stroke-width': 1,
                'circle-stroke-color': '#ffffff',
              },
              interactive: true,
            },
          })
        }
      })

      // Determine layer ordering based on dataLayerOrder
      // Items earlier in the array should render on top of items later in the array
      const osmDataIndex = dataLayerOrder.indexOf('osm-data')
      const taskFeaturesIndex = dataLayerOrder.indexOf('task-features')
      // If OSM Data comes before Task Features in the list, OSM should be on top
      const osmShouldBeOnTop = osmDataIndex < taskFeaturesIndex

      // Find where to insert OSM layers
      // If OSM should be on top, insert after task markers and task features
      // If OSM should be below, insert before task features
      let beforeLayerId: string | undefined

      if (osmShouldBeOnTop) {
        // OSM should be on top - find the last task feature layer or task marker layer
        // Check for task feature layers first (they're added after task markers)
        const taskFeatureLayerIds = [
          'task-geometries-point',
          'task-geometries-outline',
          'task-geometries-line',
          'task-geometries-fill',
        ]
        for (const layerId of taskFeatureLayerIds) {
          const layer = map.current.getLayer(layerId)
          if (layer) {
            // Find what comes after this layer
            const style = map.current.getStyle()
            const layers = style.layers || []
            const layerIndex = layers.findIndex((l) => l.id === layerId)
            if (layerIndex >= 0 && layerIndex < layers.length - 1) {
              beforeLayerId = layers[layerIndex + 1].id
              break
            }
          }
        }

        // If no task features, check task markers
        if (!beforeLayerId) {
          const taskMarkerLayerId = 'task-unclustered-point'
          const taskMarkerLayer = map.current.getLayer(taskMarkerLayerId)
          if (taskMarkerLayer) {
            const style = map.current.getStyle()
            const layers = style.layers || []
            const layerIndex = layers.findIndex((l) => l.id === taskMarkerLayerId)
            if (layerIndex >= 0 && layerIndex < layers.length - 1) {
              beforeLayerId = layers[layerIndex + 1].id
            }
          }
        }
      } else {
        // OSM should be below - insert before task features
        const taskFeatureLayerIds = [
          'task-geometries-fill',
          'task-geometries-line',
          'task-geometries-outline',
          'task-geometries-point',
        ]
        for (const layerId of taskFeatureLayerIds) {
          const layer = map.current.getLayer(layerId)
          if (layer) {
            beforeLayerId = layerId
            break
          }
        }

        // If no task features, insert before task markers
        if (!beforeLayerId) {
          const taskMarkerLayerId = 'task-unclustered-point'
          const taskMarkerLayer = map.current.getLayer(taskMarkerLayerId)
          if (taskMarkerLayer) {
            beforeLayerId = taskMarkerLayerId
          }
        }
      }

      // Add layers in order
      layerConfigs.forEach((layerConfig) => {
        if (!map.current) return
        try {
          if (beforeLayerId) {
            map.current.addLayer(layerConfig.config, beforeLayerId)
          } else {
            map.current.addLayer(layerConfig.config)
          }
          layersRef.current.push(layerConfig.id)
        } catch (error) {
          console.warn(`Failed to add OSM layer ${layerConfig.id}:`, error)
        }
      })


      // Add highlight layers for hover/click effects (matching maproulette3)
      // These should be above their corresponding OSM layers but respect the data layer order
      const addHighlightLayer = (config: {
        id: string
        type: 'fill' | 'line' | 'circle'
        source: string
        // biome-ignore lint/suspicious/noExplicitAny: MapLibre filter types are complex
        filter: any[]
        // biome-ignore lint/suspicious/noExplicitAny: MapLibre paint types are complex
        paint: any
      }) => {
        if (!map.current) return
        try {
          // Highlight layers should be positioned the same as OSM layers (on top if OSM is on top)
          if (beforeLayerId) {
            // biome-ignore lint/suspicious/noExplicitAny: MapLibre AddLayerObject type is too strict for dynamic layer configs
            map.current.addLayer(config as any, beforeLayerId)
          } else {
            // biome-ignore lint/suspicious/noExplicitAny: MapLibre AddLayerObject type is too strict for dynamic layer configs
            map.current.addLayer(config as any)
          }
          layersRef.current.push(config.id)
        } catch (error) {
          console.warn(`Failed to add highlight layer ${config.id}:`, error)
        }
      }

      // Add highlight layers using paint properties with feature-state (not filters)
      // MapLibre doesn't support feature-state in filters, so we use paint opacity instead
      if (showOSMElements.areas) {
        // Area fill highlight - overlay on top with conditional opacity
        addHighlightLayer({
          id: `${sourceId}-area-highlight-fill`,
          type: 'fill',
          source: sourceId,
          filter: ['==', ['get', 'type'], 'area'],
          paint: {
            'fill-color': COLORS.gold,
            'fill-opacity': [
              'case',
              ['==', ['feature-state', 'hover'], true],
              0.3,
              0, // Invisible when not hovered
            ],
          },
        })

        // Area line highlight with zoom-based width and scaling on hover
        addHighlightLayer({
          id: `${sourceId}-area-highlight`,
          type: 'line',
          source: sourceId,
          filter: ['==', ['get', 'type'], 'area'],
          paint: {
            'line-color': COLORS.gold,
            'line-width': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10,
              4, // Slightly thicker on hover
              15,
              7,
              18,
              8,
            ],
            'line-opacity': [
              'case',
              ['==', ['feature-state', 'hover'], true],
              1,
              0, // Invisible when not hovered
            ],
          },
        })
      }

      if (showOSMElements.ways) {
        addHighlightLayer({
          id: `${sourceId}-way-highlight`,
          type: 'line',
          source: sourceId,
          filter: ['==', ['get', 'type'], 'way'],
          paint: {
            'line-color': COLORS.gold,
            'line-width': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10,
              4, // Slightly thicker on hover
              15,
              7,
              18,
              8,
            ],
            'line-opacity': [
              'case',
              ['==', ['feature-state', 'hover'], true],
              1,
              0, // Invisible when not hovered
            ],
          },
        })
      }

      if (showOSMElements.nodes) {
        addHighlightLayer({
          id: `${sourceId}-node-highlight`,
          type: 'circle',
          source: sourceId,
          filter: ['==', ['get', 'type'], 'node'],
          paint: {
            'circle-color': COLORS.gold,
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10,
              11, // Scaled up on hover (7.5 * 1.47)
              18,
              22, // Scaled up on hover (15 * 1.47)
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': [
              'case',
              ['==', ['feature-state', 'hover'], true],
              1,
              0, // Invisible when not hovered
            ],
          },
        })
      }

      // Create popup content (matching maproulette3 style)
      const createPopupContent = (properties: Record<string, unknown>) => {
        const type = String(properties.type ?? '')
        const id = String(properties.id ?? '')

        const popupContent = document.createElement('div')
        popupContent.className = 'p-4 max-w-xs max-h-[400px] overflow-y-auto'

        // Header with link to OSM
        const header = document.createElement('div')
        header.className = 'mb-3 pb-2 border-b border-zinc-200 dark:border-zinc-700'
        const link = document.createElement('a')
        link.href = `https://www.openstreetmap.org/${type}/${id}`
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        link.className =
          'text-blue-600 hover:text-blue-800 dark:text-blue-400 font-semibold text-base underline'
        link.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} ${id}`
        header.appendChild(link)
        popupContent.appendChild(header)

        // Properties list (excluding id, type, _highlighted)
        const propsList = document.createElement('div')
        propsList.className = 'space-y-1.5 text-sm mt-2'

        const filteredProps = Object.entries(properties)
          .filter(([key]) => !['id', 'type', '_highlighted'].includes(key))
          .sort(([a], [b]) => a.localeCompare(b))

        if (filteredProps.length === 0) {
          const noProps = document.createElement('div')
          noProps.className = 'text-zinc-500 dark:text-zinc-400 italic text-xs py-2'
          noProps.textContent = 'No additional properties'
          propsList.appendChild(noProps)
        } else {
          filteredProps.forEach(([key, value]) => {
            const propDiv = document.createElement('div')
            propDiv.className =
              'flex justify-between gap-3 py-1.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0'
            const keySpan = document.createElement('span')
            keySpan.className = 'font-medium text-zinc-700 dark:text-zinc-300 text-left'
            keySpan.textContent = key
            const valueSpan = document.createElement('span')
            valueSpan.className =
              'text-zinc-600 dark:text-zinc-400 text-right break-words max-w-[60%]'
            valueSpan.textContent = String(value)
            propDiv.appendChild(keySpan)
            propDiv.appendChild(valueSpan)
            propsList.appendChild(propDiv)
          })
        }
        popupContent.appendChild(propsList)

        return popupContent
      }

      // Handle click (matching maproulette3 behavior)
      const handleClick = (feature: GeoJSON.Feature, lngLat: maplibregl.LngLat) => {
        const properties = feature.properties

        // Verify this is an OSM feature (should have type property: 'way', 'area', or 'node')
        if (!properties || !properties.type || !['way', 'area', 'node'].includes(properties.type)) {
          console.warn('OSM click handler: Not an OSM feature', {
            properties,
            id: feature.id,
            hasType: !!properties?.type,
            type: properties?.type,
            feature,
          })
          return
        }

        console.log('OSM click handler: Clicked OSM feature', {
          id: feature.id,
          type: properties.type,
          properties,
        })

        // Highlight the clicked feature using feature state
        // Use feature.id (top-level) or fallback to properties.id
        const featureId = feature.id ?? feature.properties?.id
        if (featureId !== undefined && map.current) {
          try {
            map.current.setFeatureState(
              { source: sourceId, id: featureId },
              { hover: true, selected: true }
            )
          } catch (err) {
            console.warn('Failed to set OSM feature state on click:', err, { featureId, sourceId })
          }
          highlightedFeatureIdRef.current = String(featureId)
        }

        // Close existing popup
        if (currentPopupRef.current) {
          currentPopupRef.current.remove()
        }

        // Create and show popup
        const popupContent = createPopupContent(properties)
        if (!map.current) return
        currentPopupRef.current = new Popup({
          closeOnClick: true,
          closeButton: true,
          maxWidth: '400px',
        })
          .setLngLat(lngLat)
          .setDOMContent(popupContent)
          .addTo(map.current)

        // Remove highlight when popup closes
        if (currentPopupRef.current && featureId !== undefined) {
          currentPopupRef.current.on('close', () => {
            if (map.current) {
              try {
                map.current.setFeatureState(
                  { source: sourceId, id: featureId },
                  { hover: false, selected: false }
                )
              } catch (_err) {
                // Feature might not exist, ignore
              }
            }
            highlightedFeatureIdRef.current = null
            currentPopupRef.current = null
          })
        }
      }

      // Map-level click handler that queries for OSM features
      // This is more reliable than layer-specific handlers
      const handleMapClick = (e: maplibregl.MapMouseEvent) => {
        if (!map.current) return

        // Query for OSM features at the click point
        const osmLayerIds = layersRef.current.filter((id) => !id.includes('-highlight'))

        // Query OSM layers first
        const osmFeatures =
          osmLayerIds.length > 0
            ? map.current.queryRenderedFeatures(e.point, {
                layers: osmLayerIds,
              })
            : []

        if (osmFeatures && osmFeatures.length > 0) {
          // Found OSM feature - process it
          const feature = osmFeatures[0]
          handleClick(feature, e.lngLat)
          return
        }

        // No OSM feature clicked - check if we clicked on a task marker
        // If so, don't close popups (let the task marker handler deal with it)
        const style = map.current.getStyle()
        const taskMarkerLayerIds =
          style?.layers
            ?.filter(
              (layer) =>
                layer.id.includes('task-unclustered-point') ||
                layer.id.includes('task-markers-points') ||
                layer.id.includes('task-clusters')
            )
            .map((layer) => layer.id) || []

        if (taskMarkerLayerIds.length > 0) {
          const taskMarkerFeatures = map.current.queryRenderedFeatures(e.point, {
            layers: taskMarkerLayerIds,
          })
          // If we clicked on a task marker, don't close popups here
          // The task marker click handler will handle it
          if (taskMarkerFeatures && taskMarkerFeatures.length > 0) {
            return
          }
        }

        // Clicked on empty space - close all popups
        if (currentPopupRef.current) {
          currentPopupRef.current.remove()
          currentPopupRef.current = null
        }
        // Also close any task marker popups
        const allPopups = document.querySelectorAll('.maplibregl-popup')
        allPopups.forEach((popup) => {
          const popupElement = popup as HTMLElement
          if (popupElement.parentElement) {
            popupElement.remove()
          }
        })
      }

      // Handle mouseover (hover highlight - matching maproulette3)
      const handleMouseEnter = (e: maplibregl.MapLayerMouseEvent) => {
        if (!e.features || e.features.length === 0 || !map.current) return
        const feature = e.features[0]
        // Only highlight on hover if no popup is open
        // Use the feature's top-level id (string like 'way-123' or 'node-456')
        const featureId = feature.id
        if (featureId !== undefined && !currentPopupRef.current) {
          try {
            // MapLibre feature state requires the exact feature ID from the source
            map.current.setFeatureState({ source: sourceId, id: featureId }, { hover: true })
            console.log('OSM hover: Set feature state', {
              featureId,
              sourceId,
              type: feature.properties?.type,
            })
          } catch (err) {
            console.warn('OSM hover: Failed to set feature state', {
              error: err,
              featureId,
              sourceId,
              featureIdType: typeof featureId,
              hasSource: !!map.current.getSource(sourceId),
            })
            // Feature might not exist or ID mismatch - try with properties.id as fallback
            const fallbackId = feature.properties?.id
            if (fallbackId !== undefined) {
              try {
                map.current.setFeatureState({ source: sourceId, id: fallbackId }, { hover: true })
                console.log('OSM hover: Set feature state with fallback ID', { fallbackId })
              } catch (err2) {
                console.warn('OSM hover: Fallback also failed', { fallbackId, error: err2 })
              }
            }
          }
        } else {
          console.log('OSM hover: Skipped', {
            hasFeatureId: featureId !== undefined,
            hasPopup: !!currentPopupRef.current,
          })
        }
      }

      // Handle mouseout (remove hover highlight)
      const handleMouseLeave = (e: maplibregl.MapLayerMouseEvent) => {
        if (!map.current) return
        // Only remove highlight if no popup is open (popup keeps the highlight)
        if (!currentPopupRef.current && e.features && e.features.length > 0) {
          const feature = e.features[0]
          const featureId = feature.id ?? feature.properties?.id
          if (featureId !== undefined) {
            try {
              map.current.setFeatureState({ source: sourceId, id: featureId }, { hover: false })
            } catch (_err) {
              // Try fallback
              const fallbackId = feature.properties?.id
              if (fallbackId !== undefined && fallbackId !== featureId) {
                try {
                  map.current.setFeatureState(
                    { source: sourceId, id: fallbackId },
                    { hover: false }
                  )
                } catch (_err2) {
                  // Both failed, ignore
                }
              }
            }
          }
        }
      }

      // Add event handlers to each layer (excluding highlight layers)
      // Wait a bit for layers to be fully added to the map before attaching events
      // Clear any existing timeout
      if (eventHandlerTimeoutRef.current !== null) {
        clearTimeout(eventHandlerTimeoutRef.current)
      }

      // Also set up layer-specific handlers for hover (these work better for hover)
      eventHandlerTimeoutRef.current = window.setTimeout(() => {
        if (!map.current) {
          console.warn('OSM event handlers: Map not available')
          return
        }

        const interactiveLayers = layersRef.current.filter(
          (id) => !id.includes('-highlight') && map.current?.getLayer(id)
        )


        // Remove existing map click handler if any
        if (mapClickHandlerRef.current) {
          map.current.off('click', mapClickHandlerRef.current)
        }
        // Store reference and attach map-level click handler
        // Use capture phase to check OSM features before other handlers
        mapClickHandlerRef.current = handleMapClick
        map.current.on('click', handleMapClick)

        // Attach hover handlers to individual layers (these work better for hover)
        interactiveLayers.forEach((layerId) => {
          try {
            // Remove any existing handlers first to avoid duplicates
            // MapLibre supports layer-specific mouseenter/mouseleave but types are incomplete
            const mapInstance = map.current as maplibregl.Map & {
              off(event: string, layerId: string): void
              on(
                event: string,
                layerId: string,
                handler: (e: maplibregl.MapLayerMouseEvent) => void
              ): void
            }
            try {
              mapInstance.off('mouseenter', layerId)
              mapInstance.off('mouseleave', layerId)
            } catch (_e) {
              // Ignore errors when removing non-existent handlers
            }
            // Attach hover handlers
            mapInstance.on('mouseenter', layerId, (e: maplibregl.MapLayerMouseEvent) => {
              if (map.current) {
                map.current.getCanvas().style.cursor = 'pointer'
                handleMouseEnter(e)
              }
            })

            mapInstance.on('mouseleave', layerId, (e: maplibregl.MapLayerMouseEvent) => {
              if (map.current) {
                map.current.getCanvas().style.cursor = ''
                handleMouseLeave(e)
              }
            })

          } catch (error) {
            console.error(`Failed to attach hover handlers to layer ${layerId}:`, error)
          }
        })

        eventHandlerTimeoutRef.current = null
      }, 100)
    } catch (error) {
      console.error('Error rendering OSM data layer:', error)
    }

    return () => {
      // Clear timeout if it hasn't fired yet
      if (eventHandlerTimeoutRef.current !== null) {
        clearTimeout(eventHandlerTimeoutRef.current)
        eventHandlerTimeoutRef.current = null
      }

      // Cleanup
      if (map.current) {
        // Remove map-level click handler
        if (mapClickHandlerRef.current) {
          try {
            map.current.off('click', mapClickHandlerRef.current)
            mapClickHandlerRef.current = null
          } catch (_error) {
            // Ignore errors
          }
        }

        const interactiveLayers = layersRef.current.filter((id) => !id.includes('-highlight'))

        interactiveLayers.forEach((layerId) => {
          try {
            // MapLibre supports layer-specific events but types are incomplete
            const mapInstance = map.current as maplibregl.Map & {
              off(event: string, layerId: string): void
            }
            mapInstance.off('mouseenter', layerId)
            mapInstance.off('mouseleave', layerId)
          } catch (_error) {
            // Ignore errors when removing event listeners
          }
        })

        layersRef.current.forEach((layerId) => {
          if (map.current?.getLayer(layerId)) {
            map.current.removeLayer(layerId)
          }
        })
        layersRef.current = []

        if (currentPopupRef.current) {
          currentPopupRef.current.remove()
          currentPopupRef.current = null
        }

        if (map.current.getSource(sourceId)) {
          map.current.removeSource(sourceId)
        }
      }
    }
  }, [map, mapLoaded, xmlData, showOSMElements, dataLayerOrder])

  return null
}
