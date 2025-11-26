import { useQuery } from '@tanstack/react-query'
import type { StyleSpecification } from 'maplibre-gl'
import maplibregl from 'maplibre-gl'
import { useEffect, useRef, useState } from 'react'
import { api } from '@/api'
import { Button } from '@/components/ui/Button'
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
  const hasInitialZoomed = useRef(false)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const [taskLimit, setTaskLimit] = useState(20)
  const [inViewLimit, setInViewLimit] = useState(20)

  const { data: taskMarkers, isLoading } = useQuery(
    api.challenge.getChallengeTaskMarkers(Number(currentTask.parent))
  )

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

  useEffect(() => {
    if (!map.current || !mapLoaded || !currentTask.location || !taskMarkers) return

    markersRef.current.forEach((marker) => {
      marker.remove()
    })
    markersRef.current = []

    try {
      const location =
        typeof currentTask.location === 'string'
          ? JSON.parse(currentTask.location)
          : currentTask.location
      const [lng, lat] = location.coordinates || [0, 0]

      if (!hasInitialZoomed.current) {
        map.current.flyTo({
          center: [lng, lat],
          zoom: 16,
          duration: 1000,
        })
        hasInitialZoomed.current = true
      }

      new maplibregl.Marker({ color: '#ef4444' })
        .setLngLat([lng, lat])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(
            `<div class="font-semibold text-sm">Current Task #${currentTask.id}</div>`
          )
        )
        .addTo(map.current)

      const calculateDistance = (marker: TaskMarker) => {
        const dx = marker.location.lng - lng
        const dy = marker.location.lat - lat
        return Math.sqrt(dx * dx + dy * dy)
      }

      const allNearbyTasks = taskMarkers
        .filter((marker) => marker.id !== currentTask.id)
        .map((marker) => ({
          ...marker,
          distance: calculateDistance(marker),
        }))
        .sort((a, b) => a.distance - b.distance)

      const tasksByDistance = allNearbyTasks.slice(0, taskLimit)

      let tasksInView: typeof allNearbyTasks = []
      if (map.current) {
        const bounds = map.current.getBounds()
        tasksInView = allNearbyTasks
          .filter((marker) => bounds.contains([marker.location.lng, marker.location.lat]))
          .slice(0, inViewLimit)
      }

      const taskIdSet = new Set<number>()
      const nearbyTasks = [...tasksByDistance, ...tasksInView].filter((task) => {
        if (taskIdSet.has(task.id)) return false
        taskIdSet.add(task.id)
        return true
      })

      for (let i = nearbyTasks.length - 1; i >= 0; i--) {
        const marker = nearbyTasks[i]
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

          markerEl.getElement().addEventListener('click', () => {
            onTaskSelect(marker.id === selectedTaskId ? null : marker.id)
          })

          markersRef.current.push(markerEl)
        }
      }

      if (!selectedTaskId && nearbyTasks.length > 0) {
        onTaskSelect(nearbyTasks[0].id)
      }
    } catch (error) {
      console.error('Error displaying nearby tasks:', error)
    }

    return () => {
      markersRef.current.forEach((marker) => {
        marker.remove()
      })
      markersRef.current = []
    }
  }, [
    map,
    mapLoaded,
    currentTask,
    taskMarkers,
    selectedTaskId,
    onTaskSelect,
    taskLimit,
    inViewLimit,
  ])

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-[300px] w-full" />
        <p className="text-center text-xs text-zinc-500">Loading nearby tasks...</p>
      </div>
    )
  }

  const handleLoadMore = () => {
    setTaskLimit((prev) => prev + 20)
  }

  const handleLoadInView = () => {
    setInViewLimit((prev) => prev + 20)
  }

  const totalTasksInChallenge = taskMarkers?.length || 0

  let tasksInViewport = 0
  if (map.current && taskMarkers) {
    const bounds = map.current.getBounds()
    tasksInViewport = taskMarkers.filter(
      (marker) =>
        marker.id !== currentTask.id && bounds.contains([marker.location.lng, marker.location.lat])
    ).length
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
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-zinc-500">
          {totalTasksInChallenge - 1} total tasks • {tasksInViewport} in current view
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleLoadInView}
            disabled={inViewLimit >= tasksInViewport}
            className="text-xs"
          >
            Load Tasks in View
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleLoadMore}
            disabled={taskLimit >= totalTasksInChallenge - 1}
            className="text-xs"
          >
            Load More Tasks
          </Button>
        </div>
      </div>
    </div>
  )
}
