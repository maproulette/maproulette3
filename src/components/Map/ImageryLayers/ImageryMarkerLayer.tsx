import { useMemo } from 'react'
import type { CircleLayerSpecification, SymbolLayerSpecification } from 'react-map-gl/maplibre'
import { Layer, Source } from 'react-map-gl/maplibre'

export interface ImageryPoint {
  id: string | number
  lat: number
  lon: number
  [key: string]: unknown
}

interface Props {
  layerId: string
  label?: string
  color: string
  images: ImageryPoint[]
  visible: boolean
  clusterMaxZoom?: number
}

export const ImageryMarkerLayer = ({
  layerId,
  color,
  images,
  visible,
  clusterMaxZoom = 14,
}: Props) => {
  const geoJson = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: images.map((img) => {
        const { lat, lon, ...rest } = img
        return {
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [lon, lat] },
          properties: rest,
        }
      }),
    }),
    [images]
  )

  if (!visible) return null

  const clusterLayer: CircleLayerSpecification = {
    id: `${layerId}-clusters`,
    type: 'circle',
    source: layerId,
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': color,
      'circle-radius': ['step', ['get', 'point_count'], 14, 10, 18, 50, 24],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff',
    },
  }

  const countLayer: SymbolLayerSpecification = {
    id: `${layerId}-count`,
    type: 'symbol',
    source: layerId,
    filter: ['has', 'point_count'],
    layout: {
      'text-field': ['get', 'point_count_abbreviated'],
      'text-size': 12,
    },
    paint: { 'text-color': '#fff' },
  }

  const pointLayer: CircleLayerSpecification = {
    id: `${layerId}-points`,
    type: 'circle',
    source: layerId,
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': color,
      'circle-radius': 6,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff',
    },
  }

  return (
    <Source
      id={layerId}
      type="geojson"
      data={geoJson}
      cluster
      clusterMaxZoom={clusterMaxZoom}
      clusterRadius={40}
    >
      <Layer {...clusterLayer} />
      <Layer {...countLayer} />
      <Layer {...pointLayer} />
    </Source>
  )
}
