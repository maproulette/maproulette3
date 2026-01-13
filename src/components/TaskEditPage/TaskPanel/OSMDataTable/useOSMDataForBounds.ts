import { useCallback, useEffect, useMemo, useState } from 'react'
import { useOSMDataContext } from '../../contexts/OSMDataContext'
import { useTaskMapContext } from '../../contexts/TaskMapContext'
import type { OSMArea, OSMNode, OSMWay } from './parseOSMForTable'
import { parseOSMForTable } from './parseOSMForTable'

/**
 * Hook to get OSM data filtered by current map bounds and visibility settings
 * Uses existing OSM data from context - no new requests are made
 */
export const useOSMDataForBounds = () => {
  const { map, mapLoaded } = useTaskMapContext()
  const { osmData, osmDataLoading, showOSMElements } = useOSMDataContext()
  const [currentBounds, setCurrentBounds] = useState<{
    west: number
    south: number
    east: number
    north: number
  } | null>(null)

  const updateBounds = useCallback(() => {
    if (!map.current || !mapLoaded) return

    const bounds = map.current.getBounds()
    setCurrentBounds({
      west: bounds.getWest(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      north: bounds.getNorth(),
    })
  }, [map, mapLoaded])

  useEffect(() => {
    if (!map.current || !mapLoaded) return

    updateBounds()

    const handleMoveEnd = () => {
      updateBounds()
    }

    map.current.on('moveend', handleMoveEnd)
    map.current.on('zoomend', handleMoveEnd)

    return () => {
      if (map.current) {
        map.current.off('moveend', handleMoveEnd)
        map.current.off('zoomend', handleMoveEnd)
      }
    }
  }, [map, mapLoaded, updateBounds])

  // Parse all OSM data
  const allParsedData = useMemo(() => {
    if (!osmData) return { nodes: [], ways: [], areas: [] }
    return parseOSMForTable(osmData)
  }, [osmData])

  // Filter data by current bounds and visibility settings
  const parsedData = useMemo(() => {
    if (!currentBounds || !osmData) {
      return { nodes: [], ways: [], areas: [] }
    }

    const { west, south, east, north } = currentBounds

    // Filter nodes by bounds and visibility
    const filteredNodes: OSMNode[] = showOSMElements.nodes
      ? allParsedData.nodes.filter((node) => {
          return node.lon >= west && node.lon <= east && node.lat >= south && node.lat <= north
        })
      : []

    // Filter ways by bounds and visibility
    const filteredWays: OSMWay[] = showOSMElements.ways
      ? allParsedData.ways.filter((way) => {
          if (!way.coordinates || way.coordinates.length === 0) return false
          return way.coordinates.some(
            ([lon, lat]) => lon >= west && lon <= east && lat >= south && lat <= north
          )
        })
      : []

    // Filter areas by bounds and visibility
    const filteredAreas: OSMArea[] = showOSMElements.areas
      ? allParsedData.areas.filter((area) => {
          if (!area.coordinates || area.coordinates.length === 0) return false
          return area.coordinates.some(
            ([lon, lat]) => lon >= west && lon <= east && lat >= south && lat <= north
          )
        })
      : []

    return {
      nodes: filteredNodes,
      ways: filteredWays,
      areas: filteredAreas,
    }
  }, [allParsedData, currentBounds, showOSMElements])

  return {
    parsedData,
    isLoading: osmDataLoading,
  }
}
