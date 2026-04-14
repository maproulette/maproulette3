export const calculateBoundingBox = (
  geometries: GeoJSON.FeatureCollection | null
): [[number, number], [number, number]] | null => {
  if (!geometries || !geometries.features || geometries.features.length === 0) {
    return null
  }

  let minLng = Infinity
  let maxLng = -Infinity
  let minLat = Infinity
  let maxLat = -Infinity

  const processCoordinates = (coords: unknown): void => {
    if (Array.isArray(coords)) {
      if (coords.length >= 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
        const [lng, lat] = coords

        if (Number.isFinite(lng) && Number.isFinite(lat)) {
          minLng = Math.min(minLng, lng)
          maxLng = Math.max(maxLng, lng)
          minLat = Math.min(minLat, lat)
          maxLat = Math.max(maxLat, lat)
        }
      } else {
        coords.forEach(processCoordinates)
      }
    }
  }

  geometries.features.forEach((feature) => {
    if (feature.geometry) {
      const geom = feature.geometry
      if (geom.type === 'Point' && geom.coordinates) {
        processCoordinates(geom.coordinates)
      } else if (geom.type === 'LineString' && geom.coordinates) {
        processCoordinates(geom.coordinates)
      } else if (geom.type === 'Polygon' && geom.coordinates) {
        processCoordinates(geom.coordinates)
      } else if (geom.type === 'MultiPoint' && geom.coordinates) {
        processCoordinates(geom.coordinates)
      } else if (geom.type === 'MultiLineString' && geom.coordinates) {
        processCoordinates(geom.coordinates)
      } else if (geom.type === 'MultiPolygon' && geom.coordinates) {
        processCoordinates(geom.coordinates)
      }
    }
  })

  if (
    !Number.isFinite(minLng) ||
    !Number.isFinite(maxLng) ||
    !Number.isFinite(minLat) ||
    !Number.isFinite(maxLat)
  ) {
    return null
  }

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ]
}
