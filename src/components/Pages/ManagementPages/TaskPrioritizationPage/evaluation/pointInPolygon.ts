/**
 * Ray-casting point-in-polygon. Accepts a single Polygon ring set
 * (outer + optional holes) in GeoJSON order: [[[lng,lat], ...], ...holes].
 */
const pointInRing = (lng: number, lat: number, ring: number[][]): boolean => {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0]
    const yi = ring[i][1]
    const xj = ring[j][0]
    const yj = ring[j][1]
    const intersect =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi
    if (intersect) inside = !inside
  }
  return inside
}

export const pointInPolygon = (lng: number, lat: number, polygon: number[][][]): boolean => {
  if (polygon.length === 0) return false
  if (!pointInRing(lng, lat, polygon[0])) return false
  // Exclude holes
  for (let i = 1; i < polygon.length; i++) {
    if (pointInRing(lng, lat, polygon[i])) return false
  }
  return true
}

export const pointInFeatureCollection = (
  lng: number,
  lat: number,
  fc: GeoJSON.FeatureCollection | null | undefined
): boolean => {
  if (!fc || !fc.features) return false
  for (const feature of fc.features) {
    const geom = feature.geometry
    if (!geom) continue
    if (geom.type === 'Polygon') {
      if (pointInPolygon(lng, lat, geom.coordinates as number[][][])) return true
    } else if (geom.type === 'MultiPolygon') {
      for (const poly of geom.coordinates as number[][][][]) {
        if (pointInPolygon(lng, lat, poly)) return true
      }
    }
  }
  return false
}
