import type maplibregl from 'maplibre-gl'

export interface EventHandlerContext {
  map: React.RefObject<maplibregl.Map | null>
  sourceId: string
  layersRef: React.MutableRefObject<string[]>
  currentPopupRef: React.MutableRefObject<maplibregl.Popup | null>
  highlightedFeatureIdsRef: React.MutableRefObject<Set<string>>
  hoveredFeatureIdsRef: React.MutableRefObject<Set<string>>
}
