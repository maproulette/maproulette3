// Colors matching maproulette3
export const COLORS = {
  'orange-jaffa': '#ff8c00', // Orange for ways
  'pink-light': '#ffc0cb', // Pink for areas
  gold: '#ffd700', // Gold for highlights
  red: '#dc2626', // Red for nodes
}

// Uninteresting tags to filter out standalone nodes
export const UNINTERESTING_TAGS = [
  'source',
  'source_ref',
  'source:ref',
  'history',
  'attribution',
  'created_by',
  'tiger:county',
  'tiger:tlid',
  'tiger:upload_uuid',
]

// Area tags that indicate a way should be rendered as an area
export const AREA_TAGS = [
  'area',
  'building',
  'leisure',
  'tourism',
  'ruins',
  'historic',
  'landuse',
  'military',
  'natural',
  'sport',
]
