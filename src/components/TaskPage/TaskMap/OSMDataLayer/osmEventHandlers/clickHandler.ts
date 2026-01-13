import type maplibregl from 'maplibre-gl'
import { Popup } from 'maplibre-gl'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import {
  handleClusterClick,
  handleMarkerClick,
} from '@/components/shared/TaskMarkers/eventListeners'
import { createPopupContent } from '../osmPopup'
import type { EventHandlerContext } from './types'
import { getFeatureId, isValidOSMFeature } from './utils'

export const createMapClickHandler = (context: EventHandlerContext) => {
  const {
    map,
    sourceId,
    layersRef,
    currentPopupRef,
    highlightedFeatureIdsRef,
    hoveredFeatureIdsRef,
  } = context

  return (e: maplibregl.MapMouseEvent) => {
    if (!map.current) return

    hoveredFeatureIdsRef.current.forEach((featureId) => {
      try {
        map.current?.setFeatureState({ source: sourceId, id: featureId }, { hover: false })
      } catch {}
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

    if (taskMarkerLayerIds.length > 0) {
      const taskMarkerFeatures = map.current.queryRenderedFeatures(e.point, {
        layers: taskMarkerLayerIds,
      })
      if (taskMarkerFeatures && taskMarkerFeatures.length > 0) {
        const clickedFeature = taskMarkerFeatures[0]
        const layerId = clickedFeature.layer?.id

        if (layerId === LAYER_IDS.clusters || layerId?.includes('cluster')) {
          const clusterFeature = taskMarkerFeatures.find(
            (f) => f.layer?.id === LAYER_IDS.clusters || f.layer?.id?.includes('task-clusters')
          )
          if (clusterFeature) {
            handleClusterClick(map, e, LAYER_IDS.source)
          }

          return
        } else {
          handleMarkerClick(map, e, LAYER_IDS.source)
        }

        return
      }
    }

    const osmLayerIds = layersRef.current.filter((id) => !id.includes('-highlight'))
    const osmFeatures =
      osmLayerIds.length > 0
        ? map.current.queryRenderedFeatures(e.point, {
            layers: osmLayerIds,
          })
        : []

    const validOSMFeatures = osmFeatures.filter(isValidOSMFeature)
    const uniqueFeatures = new Map<string, GeoJSON.Feature>()
    validOSMFeatures.forEach((feature) => {
      const featureId = getFeatureId(feature)
      if (featureId && !uniqueFeatures.has(featureId)) {
        uniqueFeatures.set(featureId, feature)
      }
    })
    const deduplicatedFeatures = Array.from(uniqueFeatures.values())

    if (deduplicatedFeatures.length > 0) {
      const clickedFeatureIds = new Set<string>()
      deduplicatedFeatures.forEach((feature) => {
        const featureId = getFeatureId(feature)
        if (featureId) {
          clickedFeatureIds.add(featureId)
        }
      })

      const isSameSelection =
        clickedFeatureIds.size > 0 &&
        clickedFeatureIds.size === highlightedFeatureIdsRef.current.size &&
        Array.from(clickedFeatureIds).every((id) => highlightedFeatureIdsRef.current.has(id))

      if (isSameSelection && currentPopupRef.current) {
        currentPopupRef.current.remove()
        currentPopupRef.current = null

        highlightedFeatureIdsRef.current.forEach((featureId) => {
          try {
            map.current?.setFeatureState(
              { source: sourceId, id: featureId },
              { hover: false, selected: false }
            )
          } catch {}
        })
        highlightedFeatureIdsRef.current.clear()
        return
      }

      highlightedFeatureIdsRef.current.forEach((featureId) => {
        if (!clickedFeatureIds.has(featureId)) {
          try {
            map.current?.setFeatureState(
              { source: sourceId, id: featureId },
              { hover: false, selected: false }
            )
          } catch {}
        }
      })

      if (currentPopupRef.current) {
        currentPopupRef.current.remove()
        currentPopupRef.current = null
      }

      clickedFeatureIds.forEach((featureId) => {
        if (map.current) {
          try {
            map.current.setFeatureState(
              { source: sourceId, id: featureId },
              { hover: true, selected: true }
            )
          } catch {}
        }
      })
      highlightedFeatureIdsRef.current = clickedFeatureIds

      const popupContent = createPopupContent(deduplicatedFeatures)
      currentPopupRef.current = new Popup({
        closeOnClick: true,
        closeButton: true,
        maxWidth: '400px',
      })
        .setLngLat(e.lngLat)
        .setDOMContent(popupContent)
        .addTo(map.current)

      currentPopupRef.current.on('close', () => {
        highlightedFeatureIdsRef.current.forEach((featureId) => {
          try {
            map.current?.setFeatureState(
              { source: sourceId, id: featureId },
              { hover: false, selected: false }
            )
          } catch {}
        })
        highlightedFeatureIdsRef.current.clear()
        currentPopupRef.current = null
      })
      return
    }

    highlightedFeatureIdsRef.current.forEach((featureId) => {
      try {
        map.current?.setFeatureState(
          { source: sourceId, id: featureId },
          { hover: false, selected: false }
        )
      } catch {}
    })
    highlightedFeatureIdsRef.current.clear()

    if (currentPopupRef.current) {
      currentPopupRef.current.remove()
      currentPopupRef.current = null
    }
  }
}
