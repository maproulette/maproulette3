import { resolveHex, STATUS_HEX_COLORS, STATUS_LABELS } from '@/components/taskConstants'

export const STATUS_CONFIG = Object.fromEntries(
  Object.entries(STATUS_HEX_COLORS).map(([key, color]) => [
    key,
    { color: resolveHex(color), label: STATUS_LABELS[Number(key)] || 'Unknown' },
  ])
) as Record<number, { color: string; label: string }>

export const CLUSTER_CONFIG = {
  maxZoom: 14,
  radius: 120, // Increased to 120 for better clustering - larger radius means markers combine from further away
  // Colors gradient from green (small) through yellow/orange to red/purple (large)
  colors: [
    '#22c55e', // < 10: green
    '#84cc16', // 10-50: lime
    '#eab308', // 50-100: yellow
    '#f97316', // 100-500: orange
    '#ef4444', // 500-1000: red
    '#dc2626', // 1000-5000: darker red
    '#b91c1c', // 5000-10000: even darker red
    '#991b1b', // 10000-50000: dark red
    '#7c2d12', // 50000-100000: brown-red
    '#581c87', // 100000-500000: purple
    '#3b0764', // > 500000: dark purple
  ],
  sizes: [18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 40],
  steps: [10, 50, 100, 500, 1000, 5000, 10000, 50000, 100000, 500000],
}

export const OVERLAP_CONFIG = {
  threshold: 0.000001, // Degrees - roughly 0.1 meters, for truly overlapping markers only
  maxOverlapRadius: 15, // Maximum radius for overlap visualization
  minOverlapRadius: 8, // Minimum radius for overlap visualization
  overlapColors: {
    light: '#ff6b6b',
    medium: '#ff5252',
    heavy: '#d32f2f',
  },
}

export const LAYER_IDS = {
  source: 'task-markers',
  clusters: 'task-clusters',
  clusterCount: 'task-cluster-count',
  points: 'task-unclustered-point',
}
