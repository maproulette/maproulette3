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

        const isServerSideCluster = feature.properties?.taskCount !== undefined
        const isClientSideCluster = feature.properties?.cluster_id !== undefined

        if ((isServerSideCluster || isClientSideCluster) && feature.geometry.type === 'Point') {
          const map = mapRef.current.getMap()
          if (!map) return

          const coordinates = feature.geometry.coordinates as [number, number]
          const currentZoom = map.getZoom()

          if (isServerSideCluster) {
            const taskCount = feature.properties.taskCount as number

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

      const layersToQuery: string[] = []
      if (shouldCluster) {
        if (map.getLayer(LAYER_IDS.clusters)) {
          layersToQuery.push(LAYER_IDS.clusters)
        }
        if (map.getLayer(LAYER_IDS.clusterCount)) {
          layersToQuery.push(LAYER_IDS.clusterCount)
        }
        if (map.getLayer(LAYER_IDS.points)) {
          layersToQuery.push(LAYER_IDS.points)
        }
      } else {
        if (map.getLayer(LAYER_IDS.points)) {
          layersToQuery.push(LAYER_IDS.points)
        }
      }

      if (layersToQuery.length === 0) {
        map.getCanvas().style.cursor = ''
        return
      }

      const features = map.queryRenderedFeatures(e.point, {
        layers: layersToQuery,
      })

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

  useEffect(() => {
    if (!popupInfo) return

    if (popupInfo.type === 'single') {
      const taskExists = overlapData.nonOverlapping.some((m) => m.id === popupInfo.task.id)
      if (!taskExists) {
        setPopupInfo(null)
      }
    } else if (popupInfo.type === 'overlap') {
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
