import type maplibregl from 'maplibre-gl'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import {
    handleClusterClick,
    handleMarkerClick,
} from '@/components/shared/TaskMarkers/eventListeners'
import type { TaskFeaturesEventHandlerContext } from './types'

const getTaskFeatureId = (feature: GeoJSON.Feature): string | undefined => {
  if (feature.id !== undefined) {
    return String(feature.id)
  }
  if (feature.properties?.id !== undefined) {
    return String(feature.properties.id)
  }
  return undefined
}

export const createTaskFeaturesClickHandler = (context: TaskFeaturesEventHandlerContext) => {
  const { map, sourceId, hoveredFeatureIdsRef, highlightedFeatureIdsRef } = context

  return (e: maplibregl.MapMouseEvent) => {
    if (!map.current) return

    // Clear hover states on click (like OSM does)
    hoveredFeatureIdsRef.current.forEach((featureId) => {
      try {
        map.current?.setFeatureState({ source: sourceId, id: featureId }, { hover: false })
      } catch {
        // Ignore errors
      }
    })
    hoveredFeatureIdsRef.current.clear()

    const taskMarkerLayerIds = [
      LAYER_IDS.points,
      LAYER_IDS.clusters,
      LAYER_IDS.clusterCount,
    ].filter((id) => {
      const layer = map.current?.getLayer(id)
      if (!layer) return false
      const layout = layer.layout as { visibility?: string } | undefined
      return layout?.visibility !== 'none'
    })

    if (taskMarkerLayerIds.length === 0) {
      return
    }

    const taskMarkerFeatures = map.current.queryRenderedFeatures(e.point, {
      layers: taskMarkerLayerIds,
    })

    if (!taskMarkerFeatures || taskMarkerFeatures.length === 0) {
      return
    }

    const clickedFeature = taskMarkerFeatures[0]
    const layerId = clickedFeature.layer?.id

    if (!layerId) {
      return
    }

    if (layerId === LAYER_IDS.clusters || layerId?.includes('cluster')) {
      const clusterFeature = taskMarkerFeatures.find(
        (f) => f.layer?.id === LAYER_IDS.clusters || f.layer?.id?.includes('task-clusters')
      )
      if (clusterFeature) {
        handleClusterClick(map, e, sourceId)
      }
      return
    }

    if (layerId === LAYER_IDS.points || layerId?.includes('task-unclustered-point') || layerId?.includes('task-markers-points')) {
      // Get clicked feature ID for selection tracking
      const clickedFeatureId = getTaskFeatureId(clickedFeature)
      
      if (clickedFeatureId) {
        // Update highlighted features (for selection state)
        const isCurrentlyHighlighted = highlightedFeatureIdsRef.current.has(clickedFeatureId)
        
        if (!isCurrentlyHighlighted) {
          // Add to highlighted set
          highlightedFeatureIdsRef.current.add(clickedFeatureId)
          
          // Set feature-state for selection
          try {
            map.current.setFeatureState(
              { source: sourceId, id: clickedFeatureId },
              { selected: true }
            )
          } catch {
            // Ignore errors
          }

          // Also update feature properties immediately for icon selection
          const source = map.current.getSource(sourceId)
          if (source && source.type === 'geojson') {
            const geoJsonSource = source as maplibregl.GeoJSONSource
            const currentData = geoJsonSource._data as GeoJSON.FeatureCollection

            if (currentData?.features) {
              const feature = currentData.features.find(
                (f) => {
                  const fid = f.id !== undefined ? String(f.id) : undefined
                  const tid = f.properties?.id !== undefined ? String(f.properties.id) : undefined
                  return fid === clickedFeatureId || tid === clickedFeatureId
                }
              )

              if (feature && feature.properties) {
                feature.properties.isSelected = true
                geoJsonSource.setData(currentData)
              }
            }
          }
        }
      }

      handleMarkerClick(map, e, sourceId)
      return
    }
  }
}

