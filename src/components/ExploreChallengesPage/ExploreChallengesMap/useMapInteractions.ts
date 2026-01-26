import type { GeoJSONSource } from 'maplibre-gl'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { MapMouseEvent, MapRef } from 'react-map-gl/maplibre'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import {
  createSpiderGroup,
  detectVisualOverlaps,
} from '@/components/shared/TaskMarkers/spiderUtils'
import type { OverlapGroup } from '@/components/shared/TaskMarkers/types'
import type { TaskMarker } from '@/types/Task'
import {
  boundsAreEqual,
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
  setPopupInfo: (info: PopupInfo) => void,
  markersData: { markers: TaskMarker[] }
) => {
  const { setBounds, bounds } = useExploreChallengesSearchContext()
  const boundsUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const initialBoundsAppliedRef = useRef(false)
  const lastAppliedBoundsRef = useRef<string | null>(null)
  const [spideredMarkers, setSpideredMarkers] = useState<
    Map<number, { original: [number, number]; spidered: [number, number] }>
  >(new Map())

  const handleMapMoveEnd = useCallback(() => {
    if (!mapRef.current) return

    const map = mapRef.current.getMap()
    if (!map) return

    if (boundsUpdateTimeoutRef.current) {
      clearTimeout(boundsUpdateTimeoutRef.current)
    }

    boundsUpdateTimeoutRef.current = setTimeout(() => {
      const boundsString = getMapBoundsString(map)

      if (!bounds || !boundsAreEqual(boundsString, bounds)) {
        setBounds(boundsString)
        lastAppliedBoundsRef.current = boundsString
      }
    }, 300)
  }, [setBounds, mapRef, bounds])

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

        lastAppliedBoundsRef.current = bounds
        initialBoundsAppliedRef.current = true
      }
    } else {
      initialBoundsAppliedRef.current = true
    }
  }, [mapLoaded, bounds, mapRef])

  const handleMapClick = useCallback(
    async (e: MapMouseEvent) => {
      // Clear spidering when clicking on empty space
      if (!e.features || e.features.length === 0) {
        setSpideredMarkers(new Map())
        setPopupInfo(null)
        return
      }

      const feature = e.features[0]
      if (!feature) {
        setSpideredMarkers(new Map())
        setPopupInfo(null)
        return
      }

      if (!mapRef.current) return

      const map = mapRef.current.getMap()
      if (!map) return

      // Check if clicking on a spidered marker
      const isSpideredMarker =
        feature.layer?.id === 'spidered-markers-layer' &&
        feature.properties?.id !== undefined &&
        feature.geometry.type === 'Point'

      if (isSpideredMarker) {
        const taskId = feature.properties.id as number
        const task = markersData.markers.find((m) => m.id === taskId)
        if (task) {
          setPopupInfo({ type: 'single', task })
        }
        return
      }

      // Check if clicking on a cluster
      const isServerSideCluster = feature.properties?.taskCount !== undefined
      const isClientSideCluster = feature.properties?.cluster_id !== undefined

      if ((isServerSideCluster || isClientSideCluster) && feature.geometry.type === 'Point') {
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
        setSpideredMarkers(new Map())
        return
      }

      // Check if clicking on a regular unclustered point
      const isUnclusteredPoint =
        feature.layer?.id === LAYER_IDS.points &&
        feature.properties?.id !== undefined &&
        feature.geometry.type === 'Point'

      if (isUnclusteredPoint) {
        // Check for visual overlaps at click point
        const clickPoint = e.point
        const visuallyOverlappingMarkers = detectVisualOverlaps(
          map,
          clickPoint,
          LAYER_IDS.points,
          15
        )

        if (visuallyOverlappingMarkers.length > 1) {
          // Multiple markers visually overlapping - spider them
          const lngLat = e.lngLat
          const coordinates: [number, number] = [lngLat.lng, lngLat.lat]
          const spiderGroup = createSpiderGroup(visuallyOverlappingMarkers, coordinates, map)
          setSpideredMarkers(spiderGroup)
          setPopupInfo(null)
          return
        }

        // Single marker - show popup
        const taskId = feature.properties.id as number
        const task = markersData.markers.find((m) => m.id === taskId)
        if (task) {
          setSpideredMarkers(new Map())
          setPopupInfo({ type: 'single', task })
        }
        return
      }

      // Clicked on something else - clear state
      setSpideredMarkers(new Map())
      setPopupInfo(null)
    },
    [mapRef, setPopupInfo, markersData.markers]
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
      // Always check for spidered markers
      if (map.getLayer('spidered-markers-layer')) {
        layersToQuery.push('spidered-markers-layer')
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
          feature.layer?.id === LAYER_IDS.clusterCount ||
          feature.layer?.id === 'spidered-markers-layer'

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
    }
  }, [popupInfo, overlapData.nonOverlapping, setPopupInfo])

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
    spideredMarkers,
    setSpideredMarkers,
  }
}
