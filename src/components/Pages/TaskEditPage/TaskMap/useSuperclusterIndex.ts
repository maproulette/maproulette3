import { useMemo, useRef } from 'react'
import Supercluster from 'supercluster'
import { CLUSTER_RADIUS_PX } from '@/components/Map/TaskMarkers/const'
import type { ClusterProperties, PointProperties } from './taskEditMapTypes'

type PointFeature = GeoJSON.Feature<GeoJSON.Point, PointProperties>

/**
 * Builds the clustered and unclustered Supercluster indexes for the current
 * point features, and picks the active one based on the cluster toggle (and
 * the zoomed-out-forced-clustering floor). `superclusterRef` mirrors the
 * active index in a ref so map click handlers can read it synchronously
 * without depending on (and re-registering for) the index itself.
 */
export const useSuperclusterIndex = (
  pointFeatures: PointFeature[],
  isClustered: boolean,
  mapZoom: number
) => {
  const superclusterRef = useRef<Supercluster<PointProperties, ClusterProperties> | null>(null)

  const { clusteredIndex, unclusteredIndex } = useMemo(() => {
    if (pointFeatures.length === 0) {
      return { clusteredIndex: null, unclusteredIndex: null }
    }

    const clusterOptions = {
      maxZoom: 16,
      minZoom: 0,
      map: (props: PointProperties) =>
        ({
          taskCount: props.isOverlapping && props.overlapTaskCount ? props.overlapTaskCount : 1,
        }) as ClusterProperties,
      reduce: (accumulated: ClusterProperties, props: ClusterProperties) => {
        accumulated.taskCount = (accumulated.taskCount || 0) + (props.taskCount || 1)
      },
    }

    const clustered = new Supercluster<PointProperties, ClusterProperties>({
      ...clusterOptions,
      radius: CLUSTER_RADIUS_PX,
    })
    clustered.load(pointFeatures)

    const unclustered = new Supercluster<PointProperties, ClusterProperties>({
      ...clusterOptions,
      radius: 0,
    })
    unclustered.load(pointFeatures)

    return { clusteredIndex: clustered, unclusteredIndex: unclustered }
  }, [pointFeatures])

  const isClusteringForced = mapZoom < 2

  const superclusterIndex = useMemo(() => {
    if (isClustered || isClusteringForced) {
      superclusterRef.current = clusteredIndex
      return clusteredIndex
    }
    superclusterRef.current = unclusteredIndex
    return unclusteredIndex
  }, [clusteredIndex, unclusteredIndex, isClustered, isClusteringForced])

  return { superclusterIndex, superclusterRef, isClusteringForced }
}
