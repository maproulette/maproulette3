import { Loader } from '@/components/ui/Loader'
import { useRef, useEffect, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { useSearchContext } from '../../SearchContextProvider'
import MapControls from './MapControls'
import { StatusFilter } from './StatusFilter'
import { addTaskMarkersToMap } from './addTaskMarkersToMap'
import { createMap } from './createMap'

export const ChallengeMap = () => {
  const { taskMarkerParams } = useSearchContext()
  const { data: taskMarkers, isLoading: isLoadingTaskMarkers } = useQuery(
    api.task.getTaskMarkers(taskMarkerParams)
  )

  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState<boolean>(false)

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    map.current = createMap(mapContainer.current, [0, 0], 1)

    map.current.on('load', () => {
      if (!map.current) return
      setMapLoaded(true)
      addTaskMarkersToMap(map, true, taskMarkers, isLoadingTaskMarkers)
    })


    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
        setMapLoaded(false)
      }
    }
  }, [])

  useEffect(() => {
    if (!map.current || !mapLoaded || !taskMarkers || isLoadingTaskMarkers) return
    addTaskMarkersToMap(map, mapLoaded, taskMarkers, isLoadingTaskMarkers)
  }, [taskMarkers])

  return (
    <div ref={mapContainer} className="flex-1 relative relative w-full h-full">
      <div
        className={`absolute inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-10 transition-opacity duration-200 ${
          isLoadingTaskMarkers || !mapLoaded ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <Loader message="Loading task markers..." />
      </div>

      <StatusFilter />
      <MapControls />
    </div>
  )
}
