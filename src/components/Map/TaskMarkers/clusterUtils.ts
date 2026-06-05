import type maplibregl from 'maplibre-gl'

/** Minimal structural slice of `Supercluster` so callers don't have to plumb
 * their full `<PointProps, ClusterProps>` generics through this helper. */
export interface ClusterExpansionIndex {
  getClusterExpansionZoom(clusterId: number): number
}

const DEFAULT_FLY_DURATION_MS = 600
const FALLBACK_ZOOM_BOOST = 2

/**
 * Smoothly fly the map to the zoom level at which a clicked Supercluster
 * cluster splits. Falls back to (currentZoom + 2) when the index is missing,
 * the cluster id is undefined, or `getClusterExpansionZoom` throws. Always
 * clamps to the map's max zoom. Reusable across every map that wires up a
 * client-side cluster click handler.
 */
export const flyToClusterExpansion = (
  map: maplibregl.Map,
  index: ClusterExpansionIndex | null | undefined,
  clusterId: number | undefined,
  coordinates: [number, number],
  duration: number = DEFAULT_FLY_DURATION_MS
): void => {
  const maxZoom = map.getMaxZoom()
  const fallbackZoom = Math.min(map.getZoom() + FALLBACK_ZOOM_BOOST, maxZoom)

  if (index && clusterId !== undefined) {
    try {
      const zoom = index.getClusterExpansionZoom(clusterId)
      map.flyTo({ center: coordinates, zoom: Math.min(zoom, maxZoom), duration })
      return
    } catch {
      // Fall through to the default boost below.
    }
  }

  map.flyTo({ center: coordinates, zoom: fallbackZoom, duration })
}
