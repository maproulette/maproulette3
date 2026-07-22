import { useEffect, useState } from 'react'
import { mapBoundsToBbox } from '@/components/Map/mapUtils'
import { useTaskMapContext } from '@/components/Pages/TaskEditPage/contexts/TaskMapContext'
import type { Bbox2D } from '@/types/Map'

/**
 * Tracks the map's current bounds and (floored) zoom level, updating on every
 * pan/zoom. Used to drive the Supercluster `getClusters()` query.
 */
export const useMapViewport = (mapLoaded: boolean) => {
  const { map: mapRef } = useTaskMapContext()
  const [mapZoom, setMapZoom] = useState(2)
  const [mapBounds, setMapBounds] = useState<Bbox2D>([-180, -85, 180, 85])

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return

    const map = mapRef.current.getMap()
    if (!map) return

    const updateViewport = () => {
      setMapBounds(mapBoundsToBbox(map.getBounds()))
      setMapZoom(Math.floor(map.getZoom()))
    }

    updateViewport()

    map.on('move', updateViewport)
    map.on('moveend', updateViewport)

    return () => {
      map.off('move', updateViewport)
      map.off('moveend', updateViewport)
    }
  }, [mapLoaded])

  return { mapBounds, mapZoom }
}
