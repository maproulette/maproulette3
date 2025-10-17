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
  radius: 50,
  colors: ['#22c55e', '#eab308', '#f97316'],
  sizes: [20, 25, 30],
  steps: [30, 70],
}

export const LAYER_IDS = {
  source: 'task-markers',
  clusters: 'task-clusters',
  clusterCount: 'task-cluster-count',
  points: 'task-unclustered-point',
}
