/**
 * Re-export task marker layer utilities for backward compatibility
 * The actual implementation is in TaskMarkers/addMapLayers.tsx
 */
export {
  addMapLayers,
  ensureClusterCountAboveClusters,
  LAYER_IDS,
  CLUSTER_CONFIG,
  type LayerIdsConfig,
  type AddMapLayersOptions,
} from './TaskMarkers/addMapLayers'
