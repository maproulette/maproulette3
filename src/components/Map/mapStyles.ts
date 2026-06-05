import type { StyleSpecification } from 'maplibre-gl'

import BingAerial from './bing-aerial.json'
import EsriWorldImagery from './esri-world-imagery.json'
import EsriWorldImageryClarity from './esri-world-imagery-clarity.json'
import OsmBright from './osm-bright.json'
import OsmCarto from './osm-carto.json'

// Raster basemap styles don't include a glyphs URL, but we need glyphs to
// render MapRoulette's overlay layer with task and cluster markers.
export const OVERLAY_GLYPHS_URL = 'https://tiles.openstreetmap.us/fonts/{fontstack}/{range}.pbf'

const asStyle = (s: unknown) => s as StyleSpecification

export const mapStyles: StyleSpecification[] = [
  asStyle(OsmBright),
  asStyle(OsmCarto),
  asStyle(BingAerial),
  asStyle(EsriWorldImagery),
  asStyle(EsriWorldImageryClarity),
]

const STORAGE_KEY = 'mapstyle'

export const getCurrentMapStyleIndex = (): number => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    const i = mapStyles.findIndex((s) => s.name === saved)
    return i >= 0 ? i : 0
  } catch {
    return 0
  }
}

export const saveMapStyle = (index: number) => {
  try {
    const name = mapStyles[index]?.name
    if (name) localStorage.setItem(STORAGE_KEY, name)
  } catch {
    // localStorage may throw (e.g. in a private browser window).
    // doing nothing in this case is fine, it just means that the
    // selection won't be persistent across reloads.
  }
}

export const getCurrentMapStyle = () => mapStyles[getCurrentMapStyleIndex()]
