import type maplibregl from 'maplibre-gl'
import { COLORS } from './constants'

export interface LayerConfig {
  element: 'nodes' | 'ways' | 'areas'
  type: 'fill' | 'line' | 'circle'
  id: string
  // biome-ignore lint/suspicious/noExplicitAny: MapLibre layer config types are complex and vary by layer type
  config: any
}

interface ShowOSMElements {
  nodes: boolean
  ways: boolean
  areas: boolean
}

/**
 * Builds layer configurations based on element order and visibility
 */
export const buildLayerConfigs = (
  sourceId: string,
  elementOrder: ('nodes' | 'ways' | 'areas')[],
  showOSMElements: ShowOSMElements
): LayerConfig[] => {
  const layerConfigs: LayerConfig[] = []

  // Build layer configs based on element order
  elementOrder.forEach((element) => {
    if (element === 'areas' && showOSMElements.areas) {
      // Area fill layer
      layerConfigs.push({
        element: 'areas',
        type: 'fill',
        id: `${sourceId}-area-fill`,
        config: {
          id: `${sourceId}-area-fill`,
          type: 'fill',
          source: sourceId,
          filter: ['==', ['get', 'type'], 'area'],
          paint: {
            'fill-color': COLORS['pink-light'],
            'fill-opacity': 0.5,
          },
        },
      })
    }
    if (element === 'ways' && showOSMElements.ways) {
      layerConfigs.push({
        element: 'ways',
        type: 'line',
        id: `${sourceId}-way-line`,
        config: {
          id: `${sourceId}-way-line`,
          type: 'line',
          source: sourceId,
          filter: ['==', ['get', 'type'], 'way'],
          paint: {
            'line-color': COLORS['orange-jaffa'],
            'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1, 15, 1.5, 18, 2],
          },
        },
      })
    }
    if (element === 'areas' && showOSMElements.areas) {
      layerConfigs.push({
        element: 'areas',
        type: 'line',
        id: `${sourceId}-area-line`,
        config: {
          id: `${sourceId}-area-line`,
          type: 'line',
          source: sourceId,
          filter: ['==', ['get', 'type'], 'area'],
          paint: {
            'line-color': COLORS['pink-light'],
            'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1, 15, 1.5, 18, 2],
          },
        },
      })
    }
    if (element === 'nodes' && showOSMElements.nodes) {
      layerConfigs.push({
        element: 'nodes',
        type: 'circle',
        id: `${sourceId}-node`,
        config: {
          id: `${sourceId}-node`,
          type: 'circle',
          source: sourceId,
          filter: ['==', ['get', 'type'], 'node'],
          paint: {
            'circle-color': COLORS.red,
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 2, 15, 3, 18, 4],
            'circle-stroke-width': 0,
          },
          interactive: true,
        },
      })
    }
  })

  return layerConfigs
}

interface HighlightLayerConfig {
  id: string
  type: 'fill' | 'line' | 'circle'
  source: string
  // biome-ignore lint/suspicious/noExplicitAny: MapLibre filter types are complex
  filter: any[]
  // biome-ignore lint/suspicious/noExplicitAny: MapLibre paint types are complex
  paint: any
}

export const addHighlightLayers = (
  map: maplibregl.Map,
  sourceId: string,
  showOSMElements: ShowOSMElements,
  beforeLayerId: string | undefined,
  layersRef: React.MutableRefObject<string[]>
): void => {
  const addHighlightLayer = (config: HighlightLayerConfig) => {
    try {
      if (beforeLayerId) {
        // biome-ignore lint/suspicious/noExplicitAny: MapLibre AddLayerObject type is too strict for dynamic layer configs
        map.addLayer(config as any, beforeLayerId)
      } else {
        // biome-ignore lint/suspicious/noExplicitAny: MapLibre AddLayerObject type is too strict for dynamic layer configs
        map.addLayer(config as any)
      }
      layersRef.current.push(config.id)
    } catch (error) {
      console.warn(`Failed to add highlight layer ${config.id}:`, error)
    }
  }

  if (showOSMElements.areas) {
    addHighlightLayer({
      id: `${sourceId}-area-highlight-fill`,
      type: 'fill',
      source: sourceId,
      filter: ['==', ['get', 'type'], 'area'],
      paint: {
        'fill-color': COLORS.gold,
        'fill-opacity': [
          'case',
          ['==', ['feature-state', 'hover'], true],
          0.3,
          ['==', ['feature-state', 'selected'], true],
          0.3,
          0,
        ],
      },
    })

    addHighlightLayer({
      id: `${sourceId}-area-highlight`,
      type: 'line',
      source: sourceId,
      filter: ['==', ['get', 'type'], 'area'],
      paint: {
        'line-color': COLORS.gold,
        'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2, 15, 3, 18, 4],
        'line-opacity': [
          'case',
          ['==', ['feature-state', 'hover'], true],
          1,
          ['==', ['feature-state', 'selected'], true],
          1,
          0,
        ],
      },
    })
  }

  if (showOSMElements.ways) {
    addHighlightLayer({
      id: `${sourceId}-way-highlight`,
      type: 'line',
      source: sourceId,
      filter: ['==', ['get', 'type'], 'way'],
      paint: {
        'line-color': COLORS.gold,
        'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2, 15, 3, 18, 4],
        'line-opacity': [
          'case',
          ['==', ['feature-state', 'hover'], true],
          1,
          ['==', ['feature-state', 'selected'], true],
          1,
          0,
        ],
      },
    })
  }

  if (showOSMElements.nodes) {
    addHighlightLayer({
      id: `${sourceId}-node-highlight`,
      type: 'circle',
      source: sourceId,
      filter: ['==', ['get', 'type'], 'node'],
      paint: {
        'circle-color': COLORS.gold,
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 4, 15, 5, 18, 6],
        'circle-stroke-width': 0,
        'circle-opacity': [
          'case',
          ['==', ['feature-state', 'hover'], true],
          1,
          ['==', ['feature-state', 'selected'], true],
          1,
          0,
        ],
      },
    })
  }
}
