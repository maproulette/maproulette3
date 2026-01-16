import type maplibregl from 'maplibre-gl'

export interface TaskFeaturesEventHandlerContext {
  map: React.RefObject<maplibregl.Map | null>
  sourceId: string
  layersRef: React.MutableRefObject<string[]>
  currentPopupRef: React.MutableRefObject<maplibregl.Popup | null>
}
