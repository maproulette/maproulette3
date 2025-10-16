import type { LineString, Point, Polygon } from "@/types/Task";

export const isPoint = (geometry: { type: string; coordinates: unknown }): geometry is Point => {
    return (
      geometry.type === 'Point' &&
      Array.isArray(geometry.coordinates) &&
      geometry.coordinates.length === 2
    )
  }
  
  export const isLineString = (geometry: { type: string; coordinates: unknown }): geometry is LineString => {
    return (
      geometry.type === 'LineString' &&
      Array.isArray(geometry.coordinates) &&
      Array.isArray(geometry.coordinates[0])
    )
  }
  
  export const isPolygon = (geometry: { type: string; coordinates: unknown }): geometry is Polygon => {
    return (
      geometry.type === 'Polygon' &&
      Array.isArray(geometry.coordinates) &&
      Array.isArray(geometry.coordinates[0]) &&
      Array.isArray(geometry.coordinates[0][0])
    )
  }
  