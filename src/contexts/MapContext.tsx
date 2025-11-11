import 'maplibre-gl/dist/maplibre-gl.css'
import 'map-gl-style-switcher/dist/map-gl-style-switcher.css'
import { installMapGrab } from '@mapgrab/map-interface'
import type { StyleItem } from 'map-gl-style-switcher'
import maplibregl, { type StyleSpecification } from 'maplibre-gl'
import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useRef, useState } from 'react'

export interface MapContextType {
  mapContainer: React.RefObject<HTMLDivElement | null>
  map: React.RefObject<maplibregl.Map | null>
  mapLoaded: boolean
  clusteringEnabled: boolean
  setClusteringEnabled: (enabled: boolean) => void
  lastZoom: number
  changeMapStyle: (styleItem: ExtendedStyleItem) => void
  currentStyleId: string
}

import MapStyleOsmUsVectorBright from '../styles/osm-bright-osmusa.json'

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

// Extended StyleItem with maxZoom
export interface ExtendedStyleItem extends StyleItem {
  maxZoom?: number
}

// Additional map style definitions
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

// Style switcher configuration
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

const MapContext = createContext<MapContextType | undefined>(undefined)

export const MapContextProvider = ({ children }: { children: ReactNode }) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState<boolean>(false)
  const [clusteringEnabled, setClusteringEnabled] = useState(true)
  const [lastZoom, setLastZoom] = useState(1)
  const [currentStyleId, setCurrentStyleId] = useState('osm-us-vector')
  const isInitialized = useRef(false)

  useEffect(() => {
    if (isInitialized.current || !mapContainer.current) return
    isInitialized.current = true

    const newMap = new maplibregl.Map({
      container: mapContainer.current,
      style: MapStyles.osmUsVector as StyleSpecification,
      center: [0, 0],
      zoom: 0,
    })

    map.current = newMap

    // Install MapGrab for testing support
    installMapGrab(newMap, 'mainMap')

    newMap.on('load', () => {
      setMapLoaded(true)
    })

    newMap.on('zoom', () => {
      if (!map.current) return
      setLastZoom(map.current.getZoom())
    })

    return () => {
      if (map.current) {
        try {
          map.current.remove()
        } catch (e) {
          console.warn('Error removing map:', e)
        }
        map.current = null
        setMapLoaded(false)
      }
      isInitialized.current = false
    }
  }, [])

  const changeMapStyle = (styleItem: ExtendedStyleItem) => {
    if (!map.current) return

    // Handle custom local styles
    if (styleItem.styleUrl === 'osm-us-vector') {
      map.current.setStyle(MapStyles.osmUsVector as StyleSpecification)
    } else if (styleItem.styleUrl === 'osm-raster') {
      map.current.setStyle(MapStyles.osmRaster as StyleSpecification)
    } else if (styleItem.styleUrl === 'osm-standard') {
      map.current.setStyle(AdditionalMapStyles.osmStandard as StyleSpecification)
    } else if (styleItem.styleUrl === 'bing-aerial') {
      map.current.setStyle(AdditionalMapStyles.bingAerial as StyleSpecification)
    } else if (styleItem.styleUrl === 'esri-world-imagery') {
      map.current.setStyle(AdditionalMapStyles.esriWorldImagery as StyleSpecification)
    } else if (styleItem.styleUrl === 'esri-world-imagery-clarity') {
      map.current.setStyle(AdditionalMapStyles.esriWorldImageryClarity as StyleSpecification)
    } else if (styleItem.styleUrl === 'open-aerial-map') {
      map.current.setStyle(AdditionalMapStyles.openAerialMap as StyleSpecification)
    } else if (styleItem.styleUrl === 'mapbox-satellite') {
      map.current.setStyle(AdditionalMapStyles.mapboxSatellite as StyleSpecification)
    } else if (styleItem.styleUrl === 'thunderforest-cycle') {
      map.current.setStyle(AdditionalMapStyles.thunderforestCycle as StyleSpecification)
    } else {
      map.current.setStyle(styleItem.styleUrl)
    }

    // Apply max zoom if specified
    if (styleItem.maxZoom !== undefined) {
      map.current.setMaxZoom(styleItem.maxZoom)
    }

    // If current zoom exceeds new max zoom, zoom out to max
    if (styleItem.maxZoom !== undefined && map.current.getZoom() > styleItem.maxZoom) {
      map.current.setZoom(styleItem.maxZoom)
    }

    setCurrentStyleId(styleItem.id)
  }

  const value: MapContextType = {
    mapContainer,
    map,
    mapLoaded,
    clusteringEnabled,
    setClusteringEnabled,
    lastZoom,
    changeMapStyle,
    currentStyleId,
  }

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>
}

export const useMapContext = () => {
  const context = useContext(MapContext)
  if (context === undefined) {
    throw new Error('useMapContext must be used within an MapContextProvider')
  }
  return context
}
