import type { components, paths } from './api'
import type { MapBounds } from './Challenge'

export type Task = paths['/task/{id}']['get']['responses']['200']['content']['application/json']

export type TasksMapData =
  paths['/taskMarkers']['get']['responses']['200']['content']['application/json']

export type TaskCluster = components['schemas']['org.maproulette.framework.model.TaskCluster']

export type TaskMarker = components['schemas']['org.maproulette.framework.model.TaskMarker']

// GeoJSON type definitions
export type Point = {
  type: 'Point'
  coordinates: [number, number]
}

export type LineString = {
  type: 'LineString'
  coordinates: [number, number][]
}

export type Polygon = {
  type: 'Polygon'
  coordinates: [number, number][][]
}

export type Geometry = Point | LineString | Polygon

export type Feature = {
  id: string
  type: 'Feature'
  geometry: Geometry
  properties: Record<string, unknown>
}

export type FeatureCollection = {
  type: 'FeatureCollection'
  features: Feature[]
}

export type ExploreTaskMarkersResponse = {
  totalCount: number
  tasks: TaskMarker[] | undefined
  clusters: TaskCluster[] | undefined
}

export type TaskMarkersParams = {
  global: boolean
  statuses: number[]
}

export type ChallengeTaskMarkersParams = {
  global: boolean
  statuses: number[]
  bounds: MapBounds
  cluster: boolean
}

export type BrowsedChallengeTaskMarkersParams = {
  statuses: number[]
}
