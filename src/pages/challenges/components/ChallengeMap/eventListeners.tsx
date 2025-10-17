import maplibregl from 'maplibre-gl'
import { LAYER_IDS, STATUS_CONFIG } from './const'

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

export const handleMarkerClick = (
  map: React.RefObject<maplibregl.Map | null>,
  e: maplibregl.MapMouseEvent
) => {
  if (!map.current) return

  const features = map.current.queryRenderedFeatures(e.point, {
    layers: [LAYER_IDS.points],
  })

  if (!features[0]) return

  const feature = features[0]
  const { id, status, challengeName } = feature.properties || {}
  const coordinates = feature.geometry && feature.geometry.type === 'Point' 
    ? feature.geometry.coordinates as [number, number]
    : null

  if (!coordinates) return

  const statusInfo = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG[0]

  const popupContent = `
    <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 220px;">
      <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1f2937;">
        Task #${id}
      </h3>
      <div style="margin-bottom: 6px;">
        <span style="font-size: 12px; color: #6b7280; font-weight: 500;">Challenge:</span>
        <div style="font-size: 13px; color: #374151; margin-top: 2px;">${challengeName}</div>
      </div>
      <div style="margin-bottom: 12px;">
        <span style="font-size: 12px; color: #6b7280; font-weight: 500;">Status:</span>
        <div style="display: flex; align-items: center; margin-top: 2px;">
          <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${statusInfo.color}; margin-right: 6px;"></div>
          <span style="font-size: 13px; color: #374151;">${statusInfo.label}</span>
        </div>
      </div>
      <div style="display: flex; gap: 8px; margin-top: 12px;">
        <button 
          onclick="window.location.href='/'" 
          style="
            flex: 1;
            padding: 6px 12px;
            font-size: 12px;
            font-weight: 500;
            color: #374151;
            background-color: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
          "
          onmouseover="this.style.backgroundColor='#e5e7eb'"
          onmouseout="this.style.backgroundColor='#f3f4f6'"
        >
          View Challenge
        </button>
        <button 
          onclick="window.location.href='/tasks/${id}'" 
          style="
            flex: 1;
            padding: 6px 12px;
            font-size: 12px;
            font-weight: 500;
            color: #ffffff;
            background-color: #22c55e;
            border: 1px solid #22c55e;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
          "
          onmouseover="this.style.backgroundColor='#16a34a'"
          onmouseout="this.style.backgroundColor='#22c55e'"
        >
          Start Task
        </button>
      </div>
    </div>
  `

  // Remove existing popups
  const existingPopups = document.querySelectorAll('.maplibregl-popup')
  existingPopups.forEach(popup => popup.remove())

  // Create new popup
  new maplibregl.Popup({ closeOnClick: true, closeButton: true })
    .setLngLat(coordinates)
    .setHTML(popupContent)
    .addTo(map.current)
}

export const setupEventListeners = (map: React.RefObject<maplibregl.Map | null>) => {
  if (!map.current) return

  // Cluster event listeners
  map.current.on('click', LAYER_IDS.clusters, (e: maplibregl.MapMouseEvent) => handleClusterClick(map, e))
  map.current.on('mouseenter', LAYER_IDS.clusters, () => setCursor(map, 'pointer'))
  map.current.on('mouseleave', LAYER_IDS.clusters, () => setCursor(map, ''))

  // Individual marker event listeners
  map.current.on('click', LAYER_IDS.points, (e: maplibregl.MapMouseEvent) => handleMarkerClick(map, e))
  map.current.on('mouseenter', LAYER_IDS.points, () => setCursor(map, 'pointer'))
  map.current.on('mouseleave', LAYER_IDS.points, () => setCursor(map, ''))
}
