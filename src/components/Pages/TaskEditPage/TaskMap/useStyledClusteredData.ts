import { useMemo } from 'react'
import { useTaskMapContext } from '../contexts/TaskMapContext'

export const useStyledClusteredData = (clusteredGeoJSONData: GeoJSON.FeatureCollection) => {
  const { selectedTaskIds, activeTaskId } = useTaskMapContext()

  return useMemo((): GeoJSON.FeatureCollection => {
    if (selectedTaskIds.size === 0 && activeTaskId == null) {
      return clusteredGeoJSONData
    }

    return {
      type: 'FeatureCollection',
      features: clusteredGeoJSONData.features.map((feature) => {
        // Skip cluster features
        if (feature.properties?.point_count != null) {
          return feature
        }
        const taskId = feature.properties?.id as number | undefined
        if (taskId == null) {
          return feature
        }
        const isLassoSelected = selectedTaskIds.has(taskId)
        const isActive = taskId === activeTaskId
        if (!isLassoSelected && !isActive) {
          return feature
        }
        return {
          ...feature,
          properties: {
            ...feature.properties,
            ...(isLassoSelected && { isLassoSelected: true }),
            ...(isActive && { isActive: true }),
          },
        }
      }),
    }
  }, [clusteredGeoJSONData, selectedTaskIds, activeTaskId])
}
