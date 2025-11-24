import { useQuery } from '@tanstack/react-query'
import type { StyleSpecification } from 'maplibre-gl'
import maplibregl from 'maplibre-gl'
import { useEffect, useRef, useState } from 'react'
import { api } from '@/api'
import { Skeleton } from '@/components/ui/Skeleton'
import { MapStyles } from '@/contexts/MapContext'
import type { Task, TaskMarker } from '@/types/Task'

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
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Fetch nearby task markers for the challenge
  const { data: taskMarkers, isLoading } = useQuery(
    api.challenge.getChallengeTaskMarkers(Number(currentTask.parent))
  )

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const newMap = new maplibregl.Map({
      container: mapContainer.current,
      style: MapStyles.osmUsVector as StyleSpecification,
      center: [0, 0],
      zoom: 14,
    })

    map.current = newMap

    newMap.on('load', () => {
      setMapLoaded(true)
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Center map on current task and show nearby tasks
  useEffect(() => {
    if (!map.current || !mapLoaded || !currentTask.location || !taskMarkers) return

    try {
      // Parse current task location
      const location =
        typeof currentTask.location === 'string'
          ? JSON.parse(currentTask.location)
          : currentTask.location
      const [lng, lat] = location.coordinates || [0, 0]

      // Center map on current task
      map.current.flyTo({
        center: [lng, lat],
        zoom: 16,
        duration: 1000,
      })

      // Add current task marker (red)
      new maplibregl.Marker({ color: '#ef4444' })
        .setLngLat([lng, lat])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(
            `<div class="font-semibold text-sm">Current Task #${currentTask.id}</div>`
          )
        )
        .addTo(map.current)

      // Calculate distance from current task
      const calculateDistance = (marker: TaskMarker) => {
        const dx = marker.location.lng - lng
        const dy = marker.location.lat - lat
        return Math.sqrt(dx * dx + dy * dy)
      }

      // Filter and sort nearby tasks (excluding current task)
      const nearbyTasks = taskMarkers
        .filter((marker) => marker.id !== currentTask.id)
        .map((marker) => ({
          ...marker,
          distance: calculateDistance(marker),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 20) // Show only 20 nearest tasks

      // Add nearby task markers (blue)
      nearbyTasks.forEach((marker) => {
        const isSelected = marker.id === selectedTaskId
        const markerColor = isSelected ? '#22c55e' : '#3b82f6'

        if (map.current) {
          const markerEl = new maplibregl.Marker({ color: markerColor })
            .setLngLat([marker.location.lng, marker.location.lat])
            .setPopup(
              new maplibregl.Popup({ offset: 25 }).setHTML(
                `<div class="text-sm">
                  <div class="font-semibold">Task #${marker.id}</div>
                  <div class="text-xs text-zinc-500">Click to select</div>
                </div>`
              )
            )
            .addTo(map.current)

          // Add click handler to select task
          markerEl.getElement().addEventListener('click', () => {
            onTaskSelect(marker.id === selectedTaskId ? null : marker.id)
          })
        }
      })

      // Auto-select nearest task if none selected
      if (!selectedTaskId && nearbyTasks.length > 0) {
        onTaskSelect(nearbyTasks[0].id)
      }
    } catch (error) {
      console.error('Error displaying nearby tasks:', error)
    }
  }, [map, mapLoaded, currentTask, taskMarkers, selectedTaskId, onTaskSelect])

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-[300px] w-full" />
        <p className="text-center text-xs text-zinc-500">Loading nearby tasks...</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div
        ref={mapContainer}
        className="h-[300px] w-full rounded-md border border-zinc-200 dark:border-zinc-800"
      />
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span>Current Task</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span>Nearby Tasks</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span>Selected</span>
          </div>
        </div>
        {selectedTaskId && <span className="font-medium">Selected: Task #{selectedTaskId}</span>}
      </div>
    </div>
  )
}
