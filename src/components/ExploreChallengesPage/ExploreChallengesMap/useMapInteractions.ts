import type { GeoJSONSource } from 'maplibre-gl'
import { useCallback, useEffect, useRef } from 'react'
import type { MapMouseEvent, MapRef } from 'react-map-gl/maplibre'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import type { OverlapGroup } from '@/components/shared/TaskMarkers/types'
import type { TaskMarker } from '@/types/Task'
import {
    fitMapToBounds,
    getMapBoundsString,
    isWorldBounds,
    parseBoundsString,
} from '@/utils/mapUtils'
import { useExploreChallengesSearchContext } from '../ExploreChallengesSearchContext'
import type { PopupInfo } from './types'

export const useMapInteractions = (
  mapRef: React.RefObject<MapRef | null>,
  mapLoaded: boolean,
  shouldCluster: boolean,
  overlapData: { overlaps: OverlapGroup[]; nonOverlapping: TaskMarker[] },
  popupInfo: PopupInfo,
  setPopupInfo: (info: PopupInfo) => void
) => {
  const { setBounds, bounds } = useExploreChallengesSearchContext()
  const boundsUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const initialBoundsAppliedRef = useRef(false)

  const handleMapMoveEnd = useCallback(() => {
    if (!mapRef.current) return

    const map = mapRef.current.getMap()
    if (!map) return

    if (boundsUpdateTimeoutRef.current) {
      clearTimeout(boundsUpdateTimeoutRef.current)
    }

    boundsUpdateTimeoutRef.current = setTimeout(() => {
      const boundsString = getMapBoundsString(map)
      setBounds(boundsString)
    }, 300)
  }, [setBounds, mapRef])

  // Apply initial bounds
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || initialBoundsAppliedRef.current) return

    const map = mapRef.current.getMap()
    if (!map) return

    if (bounds && !isWorldBounds(bounds)) {
      const parsedBounds = parseBoundsString(bounds)
      if (parsedBounds) {
        const [west, south, east, north] = parsedBounds

        fitMapToBounds(
          map,
          [
            [west, south],
            [east, north],
          ],
          {
            padding: 0,
            duration: 5000,
          }
        )
        initialBoundsAppliedRef.current = true
      }
    } else {
      initialBoundsAppliedRef.current = true
    }
  }, [mapLoaded, bounds, mapRef])

  const handleMapClick = useCallback(
    async (e: MapMouseEvent) => {
      if (shouldCluster && mapRef.current) {
        const feature = e.features?.[0]
        if (!feature) {
          return
        }

        // Check if it's a cluster (server-side clusters have taskCount, client-side have cluster_id)
        const isServerSideCluster = feature.properties?.taskCount !== undefined
        const isClientSideCluster = feature.properties?.cluster_id !== undefined

        if ((isServerSideCluster || isClientSideCluster) && feature.geometry.type === 'Point') {
          const map = mapRef.current.getMap()
          if (!map) return

          const coordinates = feature.geometry.coordinates as [number, number]
          const currentZoom = map.getZoom()

          // For server-side clusters, zoom to the cluster center
          if (isServerSideCluster) {
            const taskCount = feature.properties.taskCount as number
            // Calculate zoom level based on cluster size
            // Larger clusters need less zoom, smaller clusters can zoom in more
            let targetZoom = currentZoom + 2
            if (taskCount > 100) {
              targetZoom = currentZoom + 1
            } else if (taskCount > 50) {
              targetZoom = currentZoom + 1.5
            } else if (taskCount < 10) {
              targetZoom = currentZoom + 3
            }

            mapRef.current.easeTo({
              center: coordinates,
              zoom: Math.min(targetZoom, map.getMaxZoom()),
              duration: 500,
            })
          } else if (isClientSideCluster) {
            // For client-side clusters (shouldn't happen, but handle it just in case)
            const geojsonSource = map.getSource(LAYER_IDS.source) as GeoJSONSource
            if (geojsonSource) {
              try {
                const clusterId = feature.properties.cluster_id
                const zoom = await geojsonSource.getClusterExpansionZoom(clusterId)
                mapRef.current.easeTo({
                  center: coordinates,
                  zoom: Math.min(zoom, map.getMaxZoom()),
                  duration: 500,
                })
              } catch (error) {
                console.warn('Failed to expand cluster:', error)
                // Fallback: zoom in by 2 levels
                mapRef.current.easeTo({
                  center: coordinates,
                  zoom: Math.min(currentZoom + 2, map.getMaxZoom()),
                  duration: 500,
                })
              }
            }
          }
        }
      } else {
        setPopupInfo(null)
      }
    },
    [shouldCluster, mapRef, setPopupInfo]
  )

  const handleMapMouseMove = useCallback(
    (e: MapMouseEvent) => {
      if (!mapRef.current) return

      const map = mapRef.current.getMap()
      if (!map) return

      // Query features at the mouse position
      const features = map.queryRenderedFeatures(e.point, {
        layers: shouldCluster
          ? [LAYER_IDS.clusters, LAYER_IDS.clusterCount, LAYER_IDS.points]
          : [LAYER_IDS.points],
      })

      // Check if we're hovering over a cluster or marker
      if (features && features.length > 0) {
        const feature = features[0]
        const isCluster = feature.properties?.cluster_id !== undefined
        const isMarker =
          feature.layer?.id === LAYER_IDS.points ||
          feature.layer?.id === LAYER_IDS.clusters ||
          feature.layer?.id === LAYER_IDS.clusterCount

        if (isCluster || isMarker) {
          map.getCanvas().style.cursor = 'pointer'
        } else {
          map.getCanvas().style.cursor = ''
        }
      } else {
        map.getCanvas().style.cursor = ''
      }
    },
    [mapRef, shouldCluster]
  )

  // Close popup if the marker/task is no longer in the data
  useEffect(() => {
    if (!popupInfo) return

    if (popupInfo.type === 'single') {
      // Check if the task still exists in the non-overlapping markers (what's actually rendered)
      const taskExists = overlapData.nonOverlapping.some((m) => m.id === popupInfo.task.id)
      if (!taskExists) {
        setPopupInfo(null)
      }
    } else if (popupInfo.type === 'overlap') {
      // Check if the overlap group still exists
      const overlapExists = overlapData.overlaps.some(
        (o) =>
          o.tasks.length === popupInfo.tasks.length &&
          o.tasks.every((t) => popupInfo.tasks.some((pt) => pt.id === t.id))
      )
      if (!overlapExists) {
        setPopupInfo(null)
      }
    }
  }, [popupInfo, overlapData.nonOverlapping, overlapData.overlaps, setPopupInfo])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (boundsUpdateTimeoutRef.current) {
        clearTimeout(boundsUpdateTimeoutRef.current)
      }
    }
  }, [])

  return {
    handleMapMoveEnd,
    handleMapClick,
    handleMapMouseMove,
  }
}
