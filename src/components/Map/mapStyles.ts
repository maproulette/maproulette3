import type { StyleItem } from 'map-gl-style-switcher'
import MapStyleOsmUsVectorBright from '@/components/Map/osm-bright-osmusa.json'

export interface ExtendedStyleItem extends StyleItem {
  maxZoom?: number
}

export const MapStyles = {
  osmUsVector: MapStyleOsmUsVectorBright,

  osmRaster: {
    version: 8,
    name: 'OpenStreetMap',
    glyphs: 'https://tiles.openstreetmap.us/fonts/{fontstack}/{range}.pbf',
    sources: {
      'osm-raster': {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors',
      },
    },
    layers: [
      {
        id: 'osm-raster-layer',
        type: 'raster',
        source: 'osm-raster',
        minzoom: 0,
        maxzoom: 22,
      },
    ],
  },
}

export const AdditionalMapStyles = {
  bingAerial: {
    version: 8,
    name: 'Bing Maps Aerial',
    glyphs: 'https://tiles.openstreetmap.us/fonts/{fontstack}/{range}.pbf',
    sources: {
      'bing-aerial': {
        type: 'raster',
        tiles: [
          'https://ecn.t0.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=587',
          'https://ecn.t1.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=587',
          'https://ecn.t2.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=587',
          'https://ecn.t3.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=587',
        ],
        tileSize: 256,
        attribution: '© Microsoft Bing Maps',
      },
    },
    layers: [{ id: 'bing-aerial-layer', type: 'raster', source: 'bing-aerial' }],
  },
  esriWorldImagery: {
    version: 8,
    name: 'Esri World Imagery',
    glyphs: 'https://tiles.openstreetmap.us/fonts/{fontstack}/{range}.pbf',
    sources: {
      'esri-world-imagery': {
        type: 'raster',
        tiles: [
          'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          'https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        ],
        tileSize: 256,
        attribution: '© Esri',
      },
    },
    layers: [{ id: 'esri-world-imagery-layer', type: 'raster', source: 'esri-world-imagery' }],
  },
  esriWorldImageryClarity: {
    version: 8,
    name: 'Esri World Imagery (Clarity) Beta',
    glyphs: 'https://tiles.openstreetmap.us/fonts/{fontstack}/{range}.pbf',
    sources: {
      'esri-clarity': {
        type: 'raster',
        tiles: [
          'https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        ],
        tileSize: 256,
        attribution: '© Esri',
      },
    },
    layers: [{ id: 'esri-clarity-layer', type: 'raster', source: 'esri-clarity' }],
  },
  openAerialMap: {
    version: 8,
    name: 'OpenAerialMap Mosaic',
    glyphs: 'https://tiles.openstreetmap.us/fonts/{fontstack}/{range}.pbf',
    sources: {
      'oam-mosaic': {
        type: 'raster',
        tiles: ['https://apps.kontur.io/raster-tiler/oam/mosaic/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '© OpenAerialMap contributors',
      },
    },
    layers: [{ id: 'oam-mosaic-layer', type: 'raster', source: 'oam-mosaic' }],
  },
  osmStandard: {
    version: 8,
    name: 'OpenStreetMap (Standard)',
    glyphs: 'https://tiles.openstreetmap.us/fonts/{fontstack}/{range}.pbf',
    sources: {
      'osm-standard': {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors',
      },
    },
    layers: [{ id: 'osm-standard-layer', type: 'raster', source: 'osm-standard' }],
  },
  mapboxSatellite: {
    version: 8,
    name: 'Mapbox Satellite',
    glyphs: 'https://tiles.openstreetmap.us/fonts/{fontstack}/{range}.pbf',
    sources: {
      'mapbox-satellite': {
        type: 'raster',
        tiles: [
          'https://a.tiles.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.jpg',
          'https://b.tiles.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.jpg',
        ],
        tileSize: 256,
        attribution: '© Mapbox',
      },
    },
    layers: [{ id: 'mapbox-satellite-layer', type: 'raster', source: 'mapbox-satellite' }],
  },
  thunderforestCycle: {
    version: 8,
    name: 'Thunderforest OpenCycleMap',
    glyphs: 'https://tiles.openstreetmap.us/fonts/{fontstack}/{range}.pbf',
    sources: {
      'tf-cycle': {
        type: 'raster',
        tiles: [
          'https://a.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=',
          'https://b.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=',
          'https://c.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=',
        ],
        tileSize: 256,
        attribution: '© Thunderforest, © OpenStreetMap contributors',
      },
    },
    layers: [{ id: 'tf-cycle-layer', type: 'raster', source: 'tf-cycle' }],
  },
}

export const mapStyleItems: ExtendedStyleItem[] = [
  {
    id: 'osm-standard',
    name: 'OpenStreetMap (Standard)',
    image: 'https://osmlab.github.io/editor-layer-index/sources/world/OpenStreetMap-GPS.png',
    styleUrl: 'osm-standard',
    description: 'Vector basemap of OpenStreetMap (OSM)',
    maxZoom: 19,
  },
  {
    id: 'osm-us-vector',
    name: 'OSM US Vector',
    image:
      'https://raw.githubusercontent.com/muimsd/map-gl-style-switcher/refs/heads/main/public/osm.png',
    styleUrl: 'osm-us-vector',
    description: 'OpenStreetMap US Vector Tiles',
    maxZoom: 20,
  },
  {
    id: 'open-aerial-map',
    name: 'OpenAerialMap Mosaic',
    image: 'https://osmlab.github.io/editor-layer-index/sources/world/OpenAerialMap.png',
    styleUrl: 'open-aerial-map',
    description: 'by Kontur.io',
    maxZoom: 31,
  },
  {
    id: 'bing-aerial',
    name: 'Bing Maps Aerial',
    image: 'https://osmlab.github.io/editor-layer-index/sources/world/Bing.png',
    styleUrl: 'bing-aerial',
    description: 'by Microsoft',
    maxZoom: 22,
  },
  {
    id: 'esri-world-imagery',
    name: 'Esri World Imagery',
    image: 'https://osmlab.github.io/editor-layer-index/sources/world/EsriImageryClarity.png',
    styleUrl: 'esri-world-imagery',
    description: 'by ESRI',
    maxZoom: 22,
  },
  {
    id: 'esri-world-imagery-clarity',
    name: 'Esri World Imagery (Clarity) Beta',
    image: 'https://osmlab.github.io/editor-layer-index/sources/world/EsriImageryClarity.png',
    styleUrl: 'esri-world-imagery-clarity',
    description: 'by ESRI',
    maxZoom: 22,
  },
  {
    id: 'mapbox-satellite',
    name: 'Mapbox Satellite',
    image: 'https://osmlab.github.io/editor-layer-index/sources/world/MapBoxSatellite.png',
    styleUrl: 'mapbox-satellite',
    description: 'by Mapbox',
    maxZoom: 22,
  },
  {
    id: 'thunderforest-cycle',
    name: 'Thunderforest OpenCycleMap',
    image: 'https://osmlab.github.io/editor-layer-index/sources/world/TF-OpenCycleMap.png',
    styleUrl: 'thunderforest-cycle',
    description: 'by Thunderforest',
    maxZoom: 22,
  },
  {
    id: 'voyager',
    name: 'Voyager',
    image:
      'https://raw.githubusercontent.com/muimsd/map-gl-style-switcher/refs/heads/main/public/voyager.png',
    styleUrl: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    description: 'Voyager style from Carto',
    maxZoom: 18,
  },
  {
    id: 'positron',
    name: 'Positron',
    image:
      'https://raw.githubusercontent.com/muimsd/map-gl-style-switcher/refs/heads/main/public/positron.png',
    styleUrl: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    description: 'Positron style from Carto',
    maxZoom: 18,
  },
  {
    id: 'dark-matter',
    name: 'Dark Matter',
    image:
      'https://raw.githubusercontent.com/muimsd/map-gl-style-switcher/refs/heads/main/public/dark.png',
    styleUrl: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    description: 'Dark style from Carto',
    maxZoom: 20,
  },
  {
    id: 'osm-raster',
    name: 'OSM Raster',
    image:
      'https://raw.githubusercontent.com/muimsd/map-gl-style-switcher/refs/heads/main/public/osm.png',
    styleUrl: 'osm-raster',
    description: 'OpenStreetMap Raster Tiles',
    maxZoom: 19,
  },
]

export const getStyleSpecification = (styleUrl: string) => {
  switch (styleUrl) {
    case 'osm-us-vector':
      return MapStyles.osmUsVector
    case 'osm-raster':
      return MapStyles.osmRaster
    case 'osm-standard':
      return AdditionalMapStyles.osmStandard
    case 'bing-aerial':
      return AdditionalMapStyles.bingAerial
    case 'esri-world-imagery':
      return AdditionalMapStyles.esriWorldImagery
    case 'esri-world-imagery-clarity':
      return AdditionalMapStyles.esriWorldImageryClarity
    case 'open-aerial-map':
      return AdditionalMapStyles.openAerialMap
    case 'mapbox-satellite':
      return AdditionalMapStyles.mapboxSatellite
    case 'thunderforest-cycle':
      return AdditionalMapStyles.thunderforestCycle
    default:
      return null
  }
}
