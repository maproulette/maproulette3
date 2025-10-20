import type { MapBounds } from './Challenge'

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

export type TaskMarker = {
  id: string
  status: number
  location: {
    lat: number
    lng: number
  }
}

export type ExploreTaskMarkersResponse = {
  totalCount: number
  tasks: TaskMarker[] | undefined
  clusters: TaskCluster[] | undefined
}

export type TaskCluster = {
  clusterId: number
  numberOfPoints: number
  taskId: number | undefined
  taskStatus: number | undefined
  point: {
    lat: number
    lng: number
  }
  bounding: Geometry
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

export type Task = {
  id: number
  name: string
  created: string
  modified: string
  parent: number
  instruction: string
  location: {
    type: 'Point'
    coordinates: [number, number]
  }
  geometries: FeatureCollection
  status: number
  review: Record<string, unknown>
  priority: number
  changesetId: number
  errorTags: string
}
