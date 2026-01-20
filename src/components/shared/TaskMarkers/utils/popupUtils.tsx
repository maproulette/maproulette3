import maplibregl from 'maplibre-gl'
import { OverlapPopup, SingleTaskPopup } from '@/components/OverlapedMarkersPopup'
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

export const showOverlapPopup = (
  map: maplibregl.Map,
  coordinates: [number, number],
  tasks: TaskMarker[]
): void => {
  const popup = new maplibregl.Popup({ offset: 25 })
    .setLngLat(coordinates)
    .setDOMContent(document.createElement('div'))

  const container = document.createElement('div')
  // @ts-expect-error - ReactDOM is exposed globally
  const ReactDOM = window.ReactDOM
  if (ReactDOM) {
    if (ReactDOM.createRoot) {
      const root = ReactDOM.createRoot(container)
      root.render(<OverlapPopup tasks={tasks} />)
    } else if (ReactDOM.render) {
      ReactDOM.render(<OverlapPopup tasks={tasks} />, container)
    }
    popup.setDOMContent(container)
  }

  popup.addTo(map)
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
  // @ts-expect-error - ReactDOM is exposed globally
  const ReactDOM = window.ReactDOM
  if (ReactDOM) {
    const handleClose = () => {
      popup.remove()
    }
    if (ReactDOM.createRoot) {
      const root = ReactDOM.createRoot(container)
      root.render(<SingleTaskPopup task={task} onClose={handleClose} />)
    } else if (ReactDOM.render) {
      ReactDOM.render(<SingleTaskPopup task={task} onClose={handleClose} />, container)
    }
    popup.setDOMContent(container)
  }

  popup.addTo(map)
}
