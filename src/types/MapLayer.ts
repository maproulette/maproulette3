export interface CustomOverlay {
  id: string
  name: string
  type: 'tile' | 'wms' | 'geojson'
  url: string
  attribution?: string
  minZoom?: number
  maxZoom?: number
  opacity?: number
  scope: 'user' | 'global'
}

export interface OverlayDefinition {
  id: string
  label: string
  description?: string
}
