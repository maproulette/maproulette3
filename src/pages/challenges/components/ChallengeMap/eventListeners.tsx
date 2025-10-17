import { LAYER_IDS } from './const'

const isGeoJSONSource = (source: maplibregl.Source): source is maplibregl.GeoJSONSource => {
  return source.type === 'geojson'
}

export const handleClusterClick = async (
  map: React.RefObject<maplibregl.Map | null>,
  e: maplibregl.MapMouseEvent
) => {
  if (!map.current) return

  const features = map.current.queryRenderedFeatures(e.point, {
    layers: [LAYER_IDS.clusters],
  })

  if (!features[0]) return

  const clusterId = features[0].properties?.cluster_id
  const source = map.current.getSource(LAYER_IDS.source)
  if (!source || !isGeoJSONSource(source)) return
  
  try {
    const zoom = await source.getClusterExpansionZoom(clusterId)
    const geometry = features[0].geometry
    if (map.current && geometry && geometry.type === 'Point' && geometry.coordinates.length === 2) {
      map.current.easeTo({
        center: [geometry.coordinates[0], geometry.coordinates[1]],
        zoom,
      })
    }
  } catch (error) {
    console.error('Error expanding cluster:', error)
  }
}

export const setCursor = (map: React.RefObject<maplibregl.Map | null>, cursor: string) => {
  if (map.current) {
    map.current.getCanvas().style.cursor = cursor
  }
}

export const setupEventListeners = (map: React.RefObject<maplibregl.Map | null>) => {
  if (!map.current) return

  map.current.on('click', LAYER_IDS.clusters, (e: maplibregl.MapMouseEvent) => handleClusterClick(map, e))
  map.current.on('mouseenter', LAYER_IDS.clusters, () => setCursor(map, 'pointer'))
  map.current.on('mouseleave', LAYER_IDS.clusters, () => setCursor(map, ''))
}
