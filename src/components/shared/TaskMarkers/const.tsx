export const STATUS_CONFIG = {
  0: { color: '#959DFF', label: 'Created' },
  1: { color: '#65D2DA', label: 'Fixed' },
  2: { color: '#F7BB59', label: 'False Positive' },
  3: { color: '#E87CE0', label: 'Skipped' },
  4: { color: '#737373', label: 'Deleted' },
  5: { color: '#CCB186', label: 'Already Fixed' },
  6: { color: '#FF5E63', label: 'Too Hard' },
}

export const CLUSTER_CONFIG = {
  maxZoom: 14,
  radius: 120, // Increased to 120 for better clustering - larger radius means markers combine from further away
  colors: ['#22c55e', '#eab308', '#f97316'],
  sizes: [20, 25, 30],
  steps: [30, 70],
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
