import maplibregl from 'maplibre-gl'

 export const createMap = (mapContainer: HTMLDivElement, center: [number, number], zoom: number): maplibregl.Map => {
  return new maplibregl.Map({
    container: mapContainer,
    style: {
      version: 8,
      glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors',
        },
      },
      layers: [
        {
          id: 'osm-tiles',
          type: 'raster',
          source: 'osm-tiles',
        },
      ],
    },
    center: center,
    zoom: zoom,
  })
}