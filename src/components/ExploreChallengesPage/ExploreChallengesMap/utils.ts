import type { TaskCluster, TaskMarker } from '@/types/Task'

export const convertTaskMarkersToGeoJSON = (
  markers: TaskMarker[] | TaskCluster[]
): GeoJSON.FeatureCollection => {
  const features: GeoJSON.Feature[] = markers
    .map((marker): GeoJSON.Feature | null => {
      let location: { lng: number; lat: number } | null = null
      let id: number
      let status: number
      let priority: number

      if ('location' in marker && marker.location) {
        location = {
          lng: marker.location.lng,
          lat: marker.location.lat,
        }
        id = marker.id
        status = marker.status
        priority = marker.priority
      } else if ('point' in marker && marker.point) {
        location = {
          lng: marker.point.lng,
          lat: marker.point.lat,
        }
        id = marker.clusterId
        status = marker.taskStatus ?? 0
        priority = 0
      } else {
        return null
      }

      if (!location) {
        return null
      }

      const properties: Record<string, unknown> = {
        id,
        status,
        priority,
        difficulty: 1,
      }

      if ('numberOfPoints' in marker) {
        const pointCount = marker.numberOfPoints
        properties.point_count = pointCount
        properties.taskCount = pointCount
        properties.cluster = true
      } else {
        properties.cluster = false
        properties.isOverlapping = false
        properties.isSelected = false
        properties.isHovered = false
        properties.isHighlighted = false
      }

      return {
        type: 'Feature',
        properties,
        geometry: {
          type: 'Point',
          coordinates: [location.lng, location.lat],
        },
      } as GeoJSON.Feature
    })
    .filter((f): f is GeoJSON.Feature => f !== null)

  return {
    type: 'FeatureCollection',
    features,
  }
}

export const calculateTaskCount = (taskMarkersData: unknown): number => {
  if (!taskMarkersData) return 0

  if (
    typeof taskMarkersData === 'object' &&
    taskMarkersData !== null &&
    'totalCount' in taskMarkersData &&
    typeof (taskMarkersData as { totalCount?: unknown }).totalCount === 'number'
  ) {
    return (taskMarkersData as { totalCount: number }).totalCount
  }

  const markers = Array.isArray(taskMarkersData)
    ? taskMarkersData
    : typeof taskMarkersData === 'object' &&
        taskMarkersData !== null &&
        'tasks' in taskMarkersData &&
        Array.isArray((taskMarkersData as { tasks?: unknown }).tasks)
      ? (taskMarkersData as { tasks: unknown[] }).tasks
      : typeof taskMarkersData === 'object' &&
          taskMarkersData !== null &&
          'markers' in taskMarkersData &&
          Array.isArray((taskMarkersData as { markers?: unknown }).markers)
        ? (taskMarkersData as { markers: unknown[] }).markers
        : typeof taskMarkersData === 'object' &&
            taskMarkersData !== null &&
            'clusters' in taskMarkersData &&
            Array.isArray((taskMarkersData as { clusters?: unknown }).clusters)
          ? (taskMarkersData as { clusters: unknown[] }).clusters
          : []

  if (markers.length > 0 && 'numberOfPoints' in markers[0]) {
    return markers.reduce(
      (sum, marker) => sum + ('numberOfPoints' in marker ? marker.numberOfPoints : 0),
      0
    )
  }

  return markers.length
}

export const processMarkersData = (
  taskMarkersData: unknown
): {
  markers: TaskMarker[]
  clusters: TaskCluster[]
} => {
  if (!taskMarkersData) {
    return { markers: [], clusters: [] }
  }

  const allData = Array.isArray(taskMarkersData)
    ? taskMarkersData
    : typeof taskMarkersData === 'object' &&
        taskMarkersData !== null &&
        'tasks' in taskMarkersData &&
        Array.isArray((taskMarkersData as { tasks?: unknown }).tasks)
      ? (taskMarkersData as { tasks: unknown[] }).tasks
      : typeof taskMarkersData === 'object' &&
          taskMarkersData !== null &&
          'markers' in taskMarkersData &&
          Array.isArray((taskMarkersData as { markers?: unknown }).markers)
        ? (taskMarkersData as { markers: unknown[] }).markers
        : typeof taskMarkersData === 'object' &&
            taskMarkersData !== null &&
            'clusters' in taskMarkersData &&
            Array.isArray((taskMarkersData as { clusters?: unknown }).clusters)
          ? (taskMarkersData as { clusters: unknown[] }).clusters
          : []

  const markers: TaskMarker[] = []
  const clusters: TaskCluster[] = []

  allData.forEach((item) => {
    if ('numberOfPoints' in item || 'taskCount' in item) {
      clusters.push(item as TaskCluster)
    } else if ('location' in item) {
      markers.push(item as TaskMarker)
    }
  })

  return { markers, clusters }
}

export const isValidLocation = (
  location: { lng: number; lat: number } | null | undefined
): boolean => {
  return (
    location != null &&
    typeof location.lng === 'number' &&
    typeof location.lat === 'number' &&
    !Number.isNaN(location.lng) &&
    !Number.isNaN(location.lat) &&
    Number.isFinite(location.lng) &&
    Number.isFinite(location.lat)
  )
}

export const isValidOverlapCenter = (center: unknown): center is [number, number] => {
  return (
    center != null &&
    Array.isArray(center) &&
    center.length === 2 &&
    typeof center[0] === 'number' &&
    typeof center[1] === 'number' &&
    !Number.isNaN(center[0]) &&
    !Number.isNaN(center[1]) &&
    Number.isFinite(center[0]) &&
    Number.isFinite(center[1])
  )
}
