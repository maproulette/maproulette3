import type maplibregl from 'maplibre-gl'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import type { TaskMarker } from '@/types/Task'
import {
  extractTaskMarkersFromFeatures,
  showOverlapPopup,
  showSingleTaskPopup,
} from './utils/popupUtils'

const isGeoJSONSource = (source: maplibregl.Source): source is maplibregl.GeoJSONSource => {
  return source.type === 'geojson'
}

export const handleClusterClick = async (
  map: React.RefObject<maplibregl.Map | null>,
  e: maplibregl.MapMouseEvent,
  sourceId: string = LAYER_IDS.source
) => {
  if (!map.current) return

  const style = map.current.getStyle()
  const clusterLayerIds =
    style?.layers?.filter((layer) => layer.id.includes('task-clusters')).map((layer) => layer.id) ||
    []

  const features = map.current.queryRenderedFeatures(e.point, {
    layers: clusterLayerIds.length > 0 ? clusterLayerIds : undefined,
  })
  if (!features[0]) return

  const geometry = features[0].geometry
  if (!geometry || geometry.type !== 'Point') return

  const coords = geometry.coordinates as number[]
  if (!coords || coords.length < 2) return

  const lng = Number(coords[0])
  const lat = Number(coords[1])

  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    console.error('Invalid coordinates:', coords)
    return
  }

  const clusterId = features[0].properties?.cluster_id
  const source = map.current.getSource(sourceId)
  if (!source || !isGeoJSONSource(source)) return

  // @ts-expect-error - MapLibre doesn't expose cluster property in types
  const hasClientSideClustering = source.cluster === true

  if (hasClientSideClustering && clusterId !== undefined) {
    try {
      const zoom = await source.getClusterExpansionZoom(clusterId)
      if (Number.isFinite(zoom) && map.current) {
        map.current.easeTo({
          center: [lng, lat],
          zoom,
        })
      }
    } catch (error) {
      console.error('Error getting cluster expansion zoom:', error)

      const currentZoom = map.current.getZoom()
      map.current.easeTo({
        center: [lng, lat],
        zoom: currentZoom + 2,
      })
    }
  } else {
    const currentZoom = map.current.getZoom()
    map.current.easeTo({
      center: [lng, lat],
      zoom: currentZoom + 2,
    })
  }
}

export const setCursor = (map: React.RefObject<maplibregl.Map | null>, cursor: string) => {
  if (map.current) {
    map.current.getCanvas().style.cursor = cursor
  }
}

export const handleMarkerClick = (
  map: React.RefObject<maplibregl.Map | null>,
  e: maplibregl.MapMouseEvent | maplibregl.MapLayerMouseEvent,
  sourceId: string = LAYER_IDS.source
) => {
  console.log('handleMarkerClick called', { sourceId, hasMap: !!map.current })
  if (!map.current) {
    console.log('handleMarkerClick: No map.current')
    return
  }

  // Use the actual layer ID from LAYER_IDS, with fallback to finding by name
  const pointLayerId = LAYER_IDS.points
  const pointLayer = map.current.getLayer(pointLayerId)
  console.log('handleMarkerClick: pointLayer', { pointLayerId, exists: !!pointLayer })

  // If layer doesn't exist, try to find it by name (for backwards compatibility)
  const pointLayerIds = pointLayer
    ? [pointLayerId]
    : (() => {
        const style = map.current.getStyle()
        return (
          style?.layers
            ?.filter(
              (layer) =>
                layer.id.includes('task-unclustered-point') ||
                layer.id.includes('task-markers-points')
            )
            .map((layer) => layer.id) || []
        )
      })()

  // First try to use features from the event (most reliable when clicking on a layer)
  // MapLayerMouseEvent has features, MapMouseEvent doesn't
  let feature: GeoJSON.Feature | undefined

  console.log('handleMarkerClick: Checking for features', {
    hasFeaturesInEvent: 'features' in e && e.features && e.features.length > 0,
    pointLayerIds,
    point: e.point
  })

  if ('features' in e && e.features && e.features.length > 0) {
    // Use the feature from the event - this is provided when clicking directly on a layer
    feature = e.features[0] as GeoJSON.Feature
    console.log('handleMarkerClick: Using feature from event', feature)
  } else {
    // Fallback to queryRenderedFeatures if event doesn't have features
    console.log('handleMarkerClick: Querying rendered features', { pointLayerIds, point: e.point })
    const features = map.current.queryRenderedFeatures(e.point, {
      layers: pointLayerIds.length > 0 ? pointLayerIds : undefined,
    })
    console.log('handleMarkerClick: queryRenderedFeatures returned', features.length, 'features', features)
    feature = features[0] as GeoJSON.Feature | undefined
  }

  if (!feature) {
    console.log('handleMarkerClick: No feature found, returning')
    return
  }
  
  console.log('handleMarkerClick: Found feature', feature)
  const { id, status, isOverlapping, overlapId } = feature.properties || {}

  const coordinates =
    feature.geometry && feature.geometry.type === 'Point'
      ? (feature.geometry.coordinates as [number, number])
      : null

  if (!coordinates) return

  if (isOverlapping && overlapId) {
    console.log('handleMarkerClick: Showing overlap popup', { overlapId })
    const allFeatures = map.current.querySourceFeatures(sourceId, {
      filter: ['==', ['get', 'overlapId'], overlapId],
    })

    const overlappingTasks = extractTaskMarkersFromFeatures(allFeatures, overlapId)
    console.log('handleMarkerClick: Overlapping tasks', overlappingTasks)
    showOverlapPopup(map.current, coordinates, overlappingTasks)
  } else {
    const task: TaskMarker = {
      id: Number(id),
      status: Number(status),
      priority: Number(feature.properties?.priority ?? 0),
      location: { lng: coordinates[0], lat: coordinates[1] },
    }

    console.log('handleMarkerClick: Showing single task popup', task)
    showSingleTaskPopup(map.current, coordinates, task)
  }
}

/**
 * Creates map-level click handler for task markers (similar to OSM data layer)
 */
const createTaskMarkerClickHandler = (
  map: React.RefObject<maplibregl.Map | null>,
  chunkIds = LAYER_IDS
) => {
  return (e: maplibregl.MapMouseEvent) => {
    if (!map.current) return

    console.log('Task marker click handler called', { point: e.point })

    // Use exact layer IDs from LAYER_IDS
    const taskMarkerLayerIds = [chunkIds.points, chunkIds.clusters, chunkIds.clusterCount].filter(
      (id) => {
        const layer = map.current?.getLayer(id)
        if (!layer) {
          console.log(`Layer ${id} does not exist`)
          return false
        }
        // Check if layer is visible
        const layout = layer.layout as { visibility?: string } | undefined
        const visibility = layout?.visibility
        if (visibility === 'none') {
          console.log(`Layer ${id} is not visible`)
          return false
        }
        return true
      }
    )

    console.log('Task marker layer IDs:', taskMarkerLayerIds)

    if (taskMarkerLayerIds.length === 0) {
      console.log('No task marker layers found')
      return
    }

    // Check clusters first
    const clusterLayerIds = taskMarkerLayerIds.filter((id) => id === chunkIds.clusters)
    if (clusterLayerIds.length > 0) {
      const clusterFeatures = map.current.queryRenderedFeatures(e.point, {
        layers: clusterLayerIds,
      })
      console.log('Cluster features at point:', clusterFeatures.length)
      if (clusterFeatures && clusterFeatures.length > 0) {
        console.log('Handling cluster click')
        handleClusterClick(map, e, chunkIds.source)
        return
      }
    }

    // Check point markers (exact layer ID)
    const pointLayerIds = taskMarkerLayerIds.filter((id) => id === chunkIds.points)
    if (pointLayerIds.length > 0) {
      const pointFeatures = map.current.queryRenderedFeatures(e.point, {
        layers: pointLayerIds,
      })
      console.log('Point features at point:', pointFeatures.length, pointFeatures)
      if (pointFeatures && pointFeatures.length > 0) {
        console.log('Handling marker click')
        handleMarkerClick(map, e, chunkIds.source)
        return
      } else {
        // Try querying all layers to see what's there
        const allFeatures = map.current.queryRenderedFeatures(e.point)
        console.log('All features at point:', allFeatures.length, allFeatures.map(f => ({ layer: f.layer?.id, id: f.id })))
      }
    }
  }
}

/**
 * Setup event listeners for a specific set of layer IDs
 * Uses map-level click handler like OSM data layer
 * Returns a cleanup function to remove all event listeners
 */
export const setupEventListeners = (
  map: React.RefObject<maplibregl.Map | null>,
  chunkIds = LAYER_IDS,
  setHoveredTaskId?: (taskId: number | null) => void
): (() => void) => {
  console.log('setupEventListeners called', { hasMap: !!map.current, chunkIds })
  if (!map.current) {
    console.log('setupEventListeners: No map.current, returning empty cleanup')
    return () => {}
  }

  // Use a ref to store the click handler (like OSM data layer)
  const mapClickHandlerRef: { current: ((e: maplibregl.MapMouseEvent) => void) | null } = {
    current: null,
  }

  // Wait for layers to be fully added (like OSM data layer)
  const timeoutId = window.setTimeout(() => {
    console.log('setupEventListeners: Timeout fired, setting up handlers', {
      hasMap: !!map.current,
      chunkIds
    })
    if (!map.current) {
      console.log('setupEventListeners: No map.current in timeout')
      return
    }

    // Check if layers exist - try multiple times if they don't exist yet
    let attempts = 0
    const maxAttempts = 10
    
    // Create handler wrapper outside so it can be used by canvas handler
    let handlerWrapper: ((e: maplibregl.MapMouseEvent) => void) | null = null
    
    const checkLayers = () => {
      if (!map.current) {
        console.log('setupEventListeners: No map.current in checkLayers')
        return
      }
      
      attempts++
      const pointLayer = map.current.getLayer(chunkIds.points)
      const clusterLayer = map.current.getLayer(chunkIds.clusters)
      const source = map.current.getSource(chunkIds.source)
      
      console.log(`setupEventListeners: Layer check (attempt ${attempts})`, {
        pointLayer: { id: chunkIds.points, exists: !!pointLayer },
        clusterLayer: { id: chunkIds.clusters, exists: !!clusterLayer },
        source: { id: chunkIds.source, exists: !!source },
        allLayers: map.current.getStyle()?.layers?.map(l => l.id).filter(id => 
          id.includes('task') || id.includes('cluster')
        )
      })

      if ((!pointLayer && !clusterLayer) && attempts < maxAttempts) {
        console.log(`setupEventListeners: Layers not ready, retrying in 100ms (attempt ${attempts}/${maxAttempts})`)
        setTimeout(checkLayers, 100)
        return
      }

      if (!pointLayer && !clusterLayer) {
        console.error('setupEventListeners: Layers never appeared after', maxAttempts, 'attempts')
        return
      }

      // Remove existing map click handler if it exists
      if (mapClickHandlerRef.current) {
        console.log('setupEventListeners: Removing existing click handler')
        map.current.off('click', mapClickHandlerRef.current)
      }

      // Create and attach map-level click handler
      const mapClickHandler = createTaskMarkerClickHandler(map, chunkIds)
      mapClickHandlerRef.current = mapClickHandler
      
      // Remove any existing click handlers first to avoid duplicates
      // Use a named function reference so we can remove it properly
      handlerWrapper = (e: maplibregl.MapMouseEvent) => {
        console.log('Task marker click handler WRAPPER called', e)
        mapClickHandler(e)
      }
      
      // Store the wrapper so we can remove it later
      ;(mapClickHandlerRef as any).wrapper = handlerWrapper
      
      // Remove old handler if it exists
      if ((mapClickHandlerRef as any).wrapper) {
        map.current.off('click', (mapClickHandlerRef as any).wrapper)
      }
      
      // Attach click handler - MapLibre handlers run in reverse order (last attached runs first)
      // So we attach ours last to ensure it runs first
      console.log('setupEventListeners: Attaching task marker click handler to map')
      map.current.on('click', handlerWrapper)
      
      // Also attach a test handler to see if ANY click is working
      map.current.on('click', () => {
        console.log('TEST: Map click event fired!')
      })
      
      console.log('setupEventListeners: Click handlers attached successfully')
      
      // Verify handlers are attached by checking the map's internal event listeners
      // This is a debug check - MapLibre doesn't expose this directly, but we can verify
      console.log('setupEventListeners: Verifying setup', {
        hasHandlerWrapper: !!handlerWrapper,
        hasMapClickHandler: !!mapClickHandlerRef.current,
        pointLayerExists: !!map.current.getLayer(chunkIds.points),
        clusterLayerExists: !!map.current.getLayer(chunkIds.clusters),
        sourceExists: !!map.current.getSource(chunkIds.source)
      })
      
      // Also try attaching directly to the canvas element as a fallback
      const canvas = map.current.getCanvasContainer()
      if (canvas && handlerWrapper) {
        console.log('setupEventListeners: Attaching click handler to canvas element')
        const canvasClickHandler = (e: MouseEvent) => {
          console.log('Canvas click handler fired!', e)
          // Convert to MapLibre event
          if (map.current && handlerWrapper) {
            const mapEvent = {
              point: { x: e.offsetX, y: e.offsetY },
              lngLat: map.current.unproject([e.offsetX, e.offsetY]),
              originalEvent: e,
            } as maplibregl.MapMouseEvent
            handlerWrapper(mapEvent)
          }
        }
        canvas.addEventListener('click', canvasClickHandler, true) // Use capture phase
        ;(mapClickHandlerRef as any).canvasHandler = canvasClickHandler
        console.log('setupEventListeners: Canvas click handler attached')
      } else {
        console.log('setupEventListeners: No canvas element found or handlerWrapper not ready', {
          hasCanvas: !!canvas,
          hasHandlerWrapper: !!handlerWrapper
        })
      }
    }
    
    checkLayers()
    
    console.log('Task marker click handler attached', {
      layers: [chunkIds.points, chunkIds.clusters, chunkIds.clusterCount].map(id => ({
        id,
        exists: !!map.current?.getLayer(id),
        visible: (() => {
          const layer = map.current?.getLayer(id)
          const layout = layer?.layout as { visibility?: string } | undefined
          return layout?.visibility !== 'none'
        })()
      }))
    })

    // Hover handlers for task markers using feature state
    const pointMouseEnterHandler = (e: maplibregl.MapLayerMouseEvent) => {
      console.log('pointMouseEnterHandler called', e)
      setCursor(map, 'pointer')
      if (!map.current || !e.features || e.features.length === 0) {
        console.log('pointMouseEnterHandler: No features or map')
        return
      }

      const feature = e.features[0]
      const taskId = feature.properties?.id
      const featureId = feature.id

      console.log('pointMouseEnterHandler: Feature', { taskId, featureId })

      if (taskId !== undefined && featureId !== undefined) {
        // Set feature state for hover effect
        try {
          map.current.setFeatureState({ source: chunkIds.source, id: featureId }, { hover: true })
        } catch (_err) {
          console.error('pointMouseEnterHandler: Error setting feature state', _err)
          // Feature might not exist, ignore
        }

        // Update hovered task ID if callback provided
        if (setHoveredTaskId) {
          setHoveredTaskId(Number(taskId))
        }
      }
    }

    const pointMouseLeaveHandler = (e: maplibregl.MapLayerMouseEvent) => {
      setCursor(map, '')
      if (!map.current || !e.features || e.features.length === 0) return

      const feature = e.features[0]
      const featureId = feature.id

      if (featureId !== undefined) {
        // Clear feature state for hover effect
        try {
          map.current.setFeatureState({ source: chunkIds.source, id: featureId }, { hover: false })
        } catch (_err) {
          // Feature might not exist, ignore
        }

        // Clear hovered task ID if callback provided
        if (setHoveredTaskId) {
          setHoveredTaskId(null)
        }
      }
    }

    const clusterMouseEnterHandler = () => setCursor(map, 'pointer')
    const clusterMouseLeaveHandler = () => setCursor(map, '')

    // Attach hover handlers to layers (using type assertion like OSM data layer)
    const mapInstance = map.current as maplibregl.Map & {
      off(event: string, layerId: string): void
      on(event: string, layerId: string, handler: (e: maplibregl.MapLayerMouseEvent) => void): void
    }

    try {
      console.log('setupEventListeners: Attaching layer event handlers', {
        clusters: chunkIds.clusters,
        points: chunkIds.points
      })
      mapInstance.on('mouseenter', chunkIds.clusters, clusterMouseEnterHandler)
      mapInstance.on('mouseleave', chunkIds.clusters, clusterMouseLeaveHandler)
      mapInstance.on('mouseenter', chunkIds.points, pointMouseEnterHandler)
      mapInstance.on('mouseleave', chunkIds.points, pointMouseLeaveHandler)
      console.log('setupEventListeners: Layer event handlers attached successfully')
    } catch (_error) {
      console.error('setupEventListeners: Error attaching layer event handlers', _error)
      // Layers might not exist yet, ignore
    }
  }, 100)

  // Return cleanup function
  return () => {
    clearTimeout(timeoutId)
    if (!map.current) return

    try {
      // Remove canvas click handler
      const canvas = map.current.getCanvasContainer()
      if (canvas && (mapClickHandlerRef as any).canvasHandler) {
        console.log('setupEventListeners cleanup: Removing canvas click handler')
        canvas.removeEventListener('click', (mapClickHandlerRef as any).canvasHandler, true)
        delete (mapClickHandlerRef as any).canvasHandler
      }
      
      // Remove map click handler
      if ((mapClickHandlerRef as any).wrapper) {
        map.current.off('click', (mapClickHandlerRef as any).wrapper)
        delete (mapClickHandlerRef as any).wrapper
      }
      if (mapClickHandlerRef.current) {
        map.current.off('click', mapClickHandlerRef.current)
        mapClickHandlerRef.current = null
      }

      // Remove hover handlers (using type assertion like OSM data layer)
      const mapInstance = map.current as maplibregl.Map & {
        off(event: string, layerId: string): void
      }
      try {
        mapInstance.off('mouseenter', chunkIds.clusters)
        mapInstance.off('mouseleave', chunkIds.clusters)
        mapInstance.off('mouseenter', chunkIds.points)
        mapInstance.off('mouseleave', chunkIds.points)
      } catch (_error) {
        // Ignore errors
      }
    } catch (error) {
      // Ignore errors when removing listeners (layer might not exist)
      console.warn('Error removing event listeners:', error)
    }
  }
}
