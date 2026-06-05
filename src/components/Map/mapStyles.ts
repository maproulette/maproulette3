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

export const defaultMapStyle = mapStyles[0]
