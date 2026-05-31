import booleanPointInPolygon from '@turf/boolean-point-in-polygon'

export const pointInFeatureCollection = (
  lng: number,
  lat: number,
  fc: GeoJSON.FeatureCollection | null | undefined
): boolean => {
  if (!fc || !fc.features) return false
  for (const feature of fc.features) {
    const geom = feature.geometry
    if (!geom) continue
    if (geom.type === 'Polygon' || geom.type === 'MultiPolygon') {
      if (booleanPointInPolygon([lng, lat], geom)) return true
    }
  }
  return false
}
