import type maplibregl from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'

interface UseTaskMarkerHoverStateProps {
  map: React.RefObject<maplibregl.Map | null>
  mapLoaded: boolean
  sourceReady: boolean
  hoveredTaskId: number | null
  selectedTaskIds: number[]
}

export const useTaskMarkerHoverState = ({
  map,
  mapLoaded,
  sourceReady,
  hoveredTaskId,
  selectedTaskIds,
}: UseTaskMarkerHoverStateProps) => {
  const previousHoveredTaskIdRef = useRef<number | null>(null)
  const previousSelectedTaskIdsRef = useRef<number[]>([])
  const updateAnimationFrameRef = useRef<number | null>(null)

  // Update feature properties and state for hover/selection
  // Optimized to only update the specific features that changed (not all features)
  useEffect(() => {
    if (!map.current || !mapLoaded || !sourceReady) return

    const source = map.current.getSource(LAYER_IDS.source)
    if (!source || source.type !== 'geojson') return

    const geoJsonSource = source as maplibregl.GeoJSONSource
    const currentData = geoJsonSource._data as GeoJSON.FeatureCollection

    if (!currentData?.features) return

    // Check if hover or selection actually changed
    const hoverChanged = previousHoveredTaskIdRef.current !== hoveredTaskId
    const selectionChanged =
      previousSelectedTaskIdsRef.current.length !== selectedTaskIds.length ||
      previousSelectedTaskIdsRef.current.some((id) => !selectedTaskIds.includes(id)) ||
      selectedTaskIds.some((id) => !previousSelectedTaskIdsRef.current.includes(id))

    // Always update refs at the start to track current state
    // This ensures we have the correct previous state for the next update
    const previousHovered = previousHoveredTaskIdRef.current
    const previousSelected = [...previousSelectedTaskIdsRef.current]
    previousHoveredTaskIdRef.current = hoveredTaskId
    previousSelectedTaskIdsRef.current = [...selectedTaskIds]

    // If nothing changed, return early (but refs are already updated)
    if (!hoverChanged && !selectionChanged) {
      return
    }

    // Find features that need updating: current hover, previous hover, and selected changes
    const featuresToUpdate = new Set<number>()

    // Add current hovered task
    if (hoveredTaskId !== null) {
      featuresToUpdate.add(hoveredTaskId)
    }

    // Add previously hovered task (to clear its hover state)
    // This is critical - we must clear the previous hover even if mouseleave didn't fire
    if (previousHovered !== null && previousHovered !== hoveredTaskId) {
      featuresToUpdate.add(previousHovered)
    }

    // Also scan all features to find any that are incorrectly marked as hovered
    // This handles cases where mouseleave didn't fire properly
    if (hoverChanged) {
      currentData.features.forEach((feature) => {
        const taskId = feature.properties?.id
        if (taskId !== undefined && feature.properties?.isHovered) {
          // If this feature is marked as hovered but shouldn't be, add it to update list
          if (taskId !== hoveredTaskId) {
            featuresToUpdate.add(taskId)
          }
        }
      })
    }

    // Add all currently selected tasks
    for (const id of selectedTaskIds) {
      featuresToUpdate.add(id)
    }

    // Add all previously selected tasks (to clear their selection if needed)
    previousSelected.forEach((id) => {
      if (!selectedTaskIds.includes(id)) {
        featuresToUpdate.add(id)
      }
    })

    let dataChanged = false

    // FIRST: Clear ALL hover states that shouldn't be hovered
    // This must happen before setting new hover states to avoid conflicts
    // We need to be aggressive here because event listeners might set feature-state directly
    // without updating properties, and mouseleave might not fire when moving between markers
    if (hoverChanged) {
      currentData.features.forEach((feature) => {
        if (!feature || !feature.properties || feature.id === undefined) return

        const taskId = feature.properties.id
        const shouldBeHovered = hoveredTaskId !== null && taskId === hoveredTaskId
        const currentlyHovered = feature.properties.isHovered === true

        // If this feature is marked as hovered in properties but shouldn't be, clear it
        if (currentlyHovered && !shouldBeHovered) {
          feature.properties.isHovered = false
          dataChanged = true
        }

        // ALWAYS clear feature-state if it shouldn't be hovered
        // This is critical - event listeners set feature-state directly, so we must clear it
        // even if the properties don't indicate it was hovered
        if (!shouldBeHovered) {
          try {
            const isSelected = selectedTaskIds.includes(taskId)
            const isHighlighted = feature.properties.isHighlighted || false
            // Force clear hover state - this ensures previous markers are cleared
            // even if mouseleave didn't fire
            map.current?.setFeatureState(
              { source: LAYER_IDS.source, id: feature.id },
              { hover: false, selected: isSelected, highlighted: isHighlighted }
            )
          } catch (_err) {
            // Feature might not exist, ignore
          }
        }
      })
    }

    // THEN: Update all features that need updating (set new hover states)
    // This includes the new hovered task and any selection changes
    featuresToUpdate.forEach((taskId) => {
      const feature = currentData.features.find(
        (f) => f.properties?.id === taskId && f.id !== undefined
      )

      if (!feature || !feature.properties || feature.id === undefined) return

      const isHovered = hoveredTaskId !== null && taskId === hoveredTaskId
      const isSelected = selectedTaskIds.includes(taskId)
      const isHighlighted = feature.properties.isHighlighted || false

      // Check if properties actually changed
      const propertiesChanged =
        feature.properties.isHovered !== isHovered || feature.properties.isSelected !== isSelected

      if (propertiesChanged) {
        feature.properties.isHovered = isHovered
        feature.properties.isSelected = isSelected
        dataChanged = true
      }

      // Always update feature-state immediately (for any paint properties that might use it)
      // This ensures the visual state updates right away, even before setData is called
      // CRITICAL: We must set this even if properties didn't change, because the first loop
      // might have cleared it, and we need to ensure the correct hover state is set
      try {
        map.current?.setFeatureState(
          { source: LAYER_IDS.source, id: feature.id },
          { hover: isHovered, selected: isSelected, highlighted: isHighlighted }
        )
      } catch (_err) {
        // Feature might not exist, ignore
      }
    })

    // FINALLY: Ensure the currently hovered task has hover state set
    // This is a safety net in case the feature wasn't in featuresToUpdate for some reason
    if (hoverChanged && hoveredTaskId !== null) {
      const hoveredFeature = currentData.features.find(
        (f) => f.properties?.id === hoveredTaskId && f.id !== undefined
      )

      if (hoveredFeature?.properties && hoveredFeature.id !== undefined) {
        // Make sure properties are set
        if (!hoveredFeature.properties.isHovered) {
          hoveredFeature.properties.isHovered = true
          dataChanged = true
        }

        // Make sure feature-state is set
        try {
          const isSelected = selectedTaskIds.includes(hoveredTaskId)
          const isHighlighted = hoveredFeature.properties.isHighlighted || false
          map.current?.setFeatureState(
            { source: LAYER_IDS.source, id: hoveredFeature.id },
            { hover: true, selected: isSelected, highlighted: isHighlighted }
          )
        } catch (_err) {
          // Feature might not exist, ignore
        }
      }
    }

    // Only call setData if properties actually changed
    // This is necessary because layout properties (icon-image) read from feature properties
    // We use requestAnimationFrame to batch updates and ensure smooth rendering
    if (dataChanged) {
      // Clear any pending update
      if (updateAnimationFrameRef.current !== null) {
        cancelAnimationFrame(updateAnimationFrameRef.current)
      }

      // Store the current data reference for the batched update
      const dataToUpdate = currentData
      const sourceToUpdate = source

      // Use requestAnimationFrame to batch the update with the next frame
      // This ensures smooth rendering and batches rapid hover changes
      updateAnimationFrameRef.current = requestAnimationFrame(() => {
        if (map.current && sourceToUpdate === map.current.getSource(LAYER_IDS.source)) {
          // Double-check the source is still valid
          const currentSource = map.current.getSource(LAYER_IDS.source)
          if (currentSource && currentSource.type === 'geojson') {
            ;(currentSource as maplibregl.GeoJSONSource).setData(dataToUpdate)
          }
        }
        updateAnimationFrameRef.current = null
      })
    }
  }, [hoveredTaskId, selectedTaskIds, map, mapLoaded, sourceReady])

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (updateAnimationFrameRef.current !== null) {
        cancelAnimationFrame(updateAnimationFrameRef.current)
      }
    }
  }, [])
}
