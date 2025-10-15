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

export interface Task {
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
