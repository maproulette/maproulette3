import type { OverlayDefinition } from '@/types/MapLayer'

export const overlayRegistry: OverlayDefinition[] = [
  { id: 'mapillary', label: 'Mapillary', description: 'Street-level imagery markers' },
  { id: 'kartaview', label: 'KartaView', description: 'Street-level imagery markers' },
  { id: 'osm-data', label: 'OSM data', description: 'Raw OpenStreetMap features' },
]
