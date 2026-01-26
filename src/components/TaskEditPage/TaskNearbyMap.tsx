import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { MapMouseEvent, MapRef } from 'react-map-gl/maplibre'
import { Layer, Map as MapGL, Marker, Source } from 'react-map-gl/maplibre'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapPin } from 'lucide-react'
import { api } from '@/api'
import type { Task } from '@/types/Task'
import { MapStyles } from '@/utils/mapStyles'

// Helper to parse task location (handles GeoJSON Point and {lng, lat} formats)
const parseTaskLocation = (location: unknown): { lng: number; lat: number } | null => {
  if (!location) return null

  // Handle string (JSON) format
  if (typeof location === 'string') {
    try {
      const parsed = JSON.parse(location) as unknown
      // Recursively parse the parsed object
      return parseTaskLocation(parsed)
    } catch {
      return null
    }
  }

  if (typeof location === 'object' && location != null) {
    const loc = location as Record<string, unknown>

    // Handle GeoJSON Point format: {type: "Point", coordinates: [lng, lat]}
    if (loc.type === 'Point' && Array.isArray(loc.coordinates) && loc.coordinates.length >= 2) {
      const coords = loc.coordinates as number[]
      return { lng: coords[0], lat: coords[1] }
    }

    // Handle simple {lng, lat} format
    if (typeof loc.lng === 'number' && typeof loc.lat === 'number') {
      return { lng: loc.lng, lat: loc.lat }
    }
  }

  return null
}

interface TaskNearbyMapProps {
  currentTask: Task
  selectedTaskId: number | null
  onTaskSelect: (taskId: number | null) => void
}

export const TaskNearbyMap = ({
  currentTask,
  selectedTaskId,
  onTaskSelect,
}: TaskNearbyMapProps) => {
  const mapRef = useRef<MapRef | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const sourceId = useId()
  const layerId = useId()

  // Track if we've already zoomed to fit initial tasks
  const hasZoomedRef = useRef(false)

  // Get current task location
  const currentLocation = useMemo(() => {
    const loc = parseTaskLocation(currentTask.location)
    return loc ? { latitude: loc.lat, longitude: loc.lng } : { latitude: 0, longitude: 0 }
  }, [currentTask.location])

  // Fetch nearby tasks using the dedicated API endpoint
  const { data: nearbyTasks = [] } = api.challenge.getTasksNearby(currentTask.parent, currentTask.id)

  // Parse nearby task locations
  const nearbyTaskLocations = useMemo(() => {
    return nearbyTasks
      .map((task) => {
        const loc = parseTaskLocation(task.location)
        return loc ? { id: task.id, ...loc } : null
      })
      .filter((loc): loc is { id: number; lng: number; lat: number } => loc !== null)
  }, [nearbyTasks])

  // Create GeoJSON for nearby tasks
  const nearbyTasksGeoJSON = useMemo((): GeoJSON.FeatureCollection => {
    return {
      type: 'FeatureCollection',
      features: nearbyTaskLocations.map((loc) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [loc.lng, loc.lat],
        },
        properties: {
          id: loc.id,
          isSelected: loc.id === selectedTaskId,
        },
      })),
    }
  }, [nearbyTaskLocations, selectedTaskId])

  // Zoom to fit all tasks (current + nearby) when data loads
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return
    if (hasZoomedRef.current) return
    if (nearbyTaskLocations.length === 0 && currentLocation.latitude === 0) return

    // Collect all points to fit
    const points: [number, number][] = []

    // Add current task location
    if (currentLocation.latitude !== 0) {
      points.push([currentLocation.longitude, currentLocation.latitude])
    }

    // Add nearby task locations
    nearbyTaskLocations.forEach((loc) => {
      points.push([loc.lng, loc.lat])
    })

    if (points.length === 0) return

    if (points.length === 1) {
      // Single point - just center on it
      mapRef.current.flyTo({
        center: points[0],
        zoom: 16,
        duration: 500,
      })
    } else {
      // Multiple points - fit bounds
      const bounds = new maplibregl.LngLatBounds(points[0], points[0])
      for (const point of points) {
        bounds.extend(point)
      }

      mapRef.current.fitBounds(bounds, {
        padding: 40,
        maxZoom: 16,
        duration: 500,
      })
    }

    hasZoomedRef.current = true
  }, [mapLoaded, nearbyTaskLocations, currentLocation])

  const initialViewState = useMemo(
    () => ({
      longitude: currentLocation.longitude,
      latitude: currentLocation.latitude,
      zoom: 14,
    }),
    [currentLocation]
  )

  const handleMapClick = useCallback(
    (e: MapMouseEvent) => {
      if (!mapRef.current || !mapLoaded) return

      const features = mapRef.current.queryRenderedFeatures(e.point, {
        layers: [layerId],
      })

      if (features.length > 0) {
        const taskId = features[0].properties?.id as number
        onTaskSelect(taskId === selectedTaskId ? null : taskId)
      }
    },
    [layerId, mapLoaded, onTaskSelect, selectedTaskId]
  )

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-lg">
      <MapGL
        ref={mapRef}
        initialViewState={initialViewState}
        mapStyle={MapStyles.osmUsVector as maplibregl.StyleSpecification}
        onLoad={() => setMapLoaded(true)}
        onClick={handleMapClick}
        interactiveLayerIds={[layerId]}
        cursor="pointer"
      >
        {/* Nearby tasks layer */}
        <Source id={sourceId} type="geojson" data={nearbyTasksGeoJSON}>
          <Layer
            id={layerId}
            type="circle"
            paint={{
              'circle-radius': 8,
              'circle-color': [
                'case',
                ['get', 'isSelected'],
                '#22c55e', // Green for selected
                '#3b82f6', // Blue for unselected
              ],
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
            }}
          />
        </Source>

        {/* Current task marker */}
        {currentLocation.latitude !== 0 && (
          <Marker
            longitude={currentLocation.longitude}
            latitude={currentLocation.latitude}
            anchor="bottom"
          >
            <div className="flex flex-col items-center">
              <MapPin className="h-8 w-8 fill-amber-500 text-amber-600 drop-shadow-md" />
              <span className="mt-0.5 rounded bg-amber-500 px-1.5 py-0.5 font-medium text-[10px] text-white shadow">
                Current
              </span>
            </div>
          </Marker>
        )}
      </MapGL>

      {/* Task count indicator */}
      <div className="absolute right-2 bottom-2 rounded bg-white/90 px-2 py-1 text-xs shadow dark:bg-zinc-800/90">
        {nearbyTasks.length} nearby task{nearbyTasks.length !== 1 ? 's' : ''}
      </div>

      {/* Selected task info */}
      {selectedTaskId && (
        <div className="absolute top-2 left-2 rounded bg-green-500 px-2 py-1 font-medium text-white text-xs shadow">
          Task #{selectedTaskId} selected
        </div>
      )}
    </div>
  )
}
