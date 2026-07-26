import { useEffect, useState } from 'react'
import { createMarkerIcons } from '@/components/Map/TaskMarkers/createMarkerIcons'
import { useTaskMapContext } from '@/components/Pages/TaskEditPage/contexts/TaskMapContext'

/**
 * (Re)registers the map's marker icon images and bumps a version counter each
 * time they finish loading, so consumers can force a repaint/re-style of
 * anything keyed off marker icon availability.
 */
export const useMarkerIconsVersion = (mapLoaded: boolean, shouldCluster: boolean) => {
  const { map: mapRef } = useTaskMapContext()
  const [iconsVersion, setIconsVersion] = useState(0)

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return

    const map = mapRef.current.getMap()
    if (!map) return

    createMarkerIcons({ current: map }, () => {
      map.triggerRepaint()

      setIconsVersion((v) => v + 1)
    })
  }, [mapLoaded, mapRef, shouldCluster])

  return iconsVersion
}
