import type { CircleLayerSpecification, SymbolLayerSpecification } from 'react-map-gl/maplibre'

/**
 * Challenge marker color by difficulty tier.
 * 1 = Easy, 2 = Normal, 3 = Expert. Falls back to normal.
 */
const DIFFICULTY_COLORS: Record<number, string> = {
  1: '#10b981', // emerald-500 - easy
  2: '#f59e0b', // amber-500   - normal
  3: '#ef4444', // red-500     - expert
}

export const FEATURED_COLOR = '#8b5cf6' // violet-500
export const HOVERED_COLOR = '#22c55e' // green-500 - matches task-marker hovered accent
const DEFAULT_DIFFICULTY_COLOR = DIFFICULTY_COLORS[2]

export const getChallengeMarkerColor = (difficulty: number | null | undefined): string => {
  if (difficulty == null) return DEFAULT_DIFFICULTY_COLOR
  return DIFFICULTY_COLORS[difficulty] ?? DEFAULT_DIFFICULTY_COLOR
}

/**
 * Circle paint for challenge point markers. Featured challenges are larger
 * with a violet outline; hovered challenges gain a green outline.
 */
export const getChallengePointLayer = (
  layerId: string,
  sourceId: string
): CircleLayerSpecification => ({
  id: layerId,
  source: sourceId,
  type: 'circle',
  paint: {
    'circle-radius': [
      'case',
      ['boolean', ['feature-state', 'hovered'], false],
      10,
      ['boolean', ['get', 'featured'], false],
      9,
      6,
    ],
    'circle-color': [
      'case',
      ['boolean', ['get', 'featured'], false],
      FEATURED_COLOR,
      [
        'match',
        ['get', 'difficulty'],
        1,
        DIFFICULTY_COLORS[1],
        3,
        DIFFICULTY_COLORS[3],
        DIFFICULTY_COLORS[2],
      ],
    ],
    'circle-stroke-width': [
      'case',
      ['boolean', ['feature-state', 'hovered'], false],
      3,
      ['boolean', ['get', 'featured'], false],
      2,
      1.5,
    ],
    'circle-stroke-color': [
      'case',
      ['boolean', ['feature-state', 'hovered'], false],
      HOVERED_COLOR,
      '#ffffff',
    ],
    'circle-opacity': 0.95,
  },
})

/**
 * Symbol layer for featured-challenge star glyph. Relies on glyph font from
 * the active basemap style; falls back gracefully if the font is unavailable.
 */
export const getChallengeFeaturedBadgeLayer = (
  layerId: string,
  sourceId: string
): SymbolLayerSpecification => ({
  id: layerId,
  source: sourceId,
  type: 'symbol',
  filter: ['==', ['get', 'featured'], true],
  layout: {
    'text-field': '★',
    'text-size': 12,
    'text-offset': [0, -0.05],
    'text-allow-overlap': true,
    'text-ignore-placement': true,
  },
  paint: {
    'text-color': '#ffffff',
    'text-halo-color': FEATURED_COLOR,
    'text-halo-width': 1,
  },
})
