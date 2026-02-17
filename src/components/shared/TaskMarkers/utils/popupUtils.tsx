import maplibregl from 'maplibre-gl'
import ReactDOM from 'react-dom/client'
import { SingleTaskPopup } from '@/components/OverlapedMarkersPopup'
import type { TaskMarker } from '@/types/Task'

export const extractTaskMarkersFromFeatures = (
  features: maplibregl.GeoJSONFeature[],
  overlapId: string
): TaskMarker[] => {
  return features
    .filter((f) => f.properties?.overlapId === overlapId)
    .map((f) => f.properties as unknown as TaskMarker)
    .filter((marker) => marker != null)
}

export const showSingleTaskPopup = async (
  map: maplibregl.Map,
  coordinates: [number, number],
  task: TaskMarker
): Promise<void> => {
  const popup = new maplibregl.Popup({ offset: 25 })
    .setLngLat(coordinates)
    .setDOMContent(document.createElement('div'))

  const container = document.createElement('div')
  const handleClose = () => {
    popup.remove()
  }
  const root = ReactDOM.createRoot(container)
  root.render(<SingleTaskPopup task={task} onClose={handleClose} />)
  popup.setDOMContent(container)

  popup.addTo(map)
}
