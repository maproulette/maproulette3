import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { useTaskMapContextMock } = vi.hoisted(() => ({
  useTaskMapContextMock: vi.fn(),
}))

vi.mock('@/components/Pages/TaskEditPage/contexts/TaskMapContext', () => ({
  useTaskMapContext: useTaskMapContextMock,
}))

import { useStyledClusteredData } from './useStyledClusteredData'

const setContext = (selectedTaskIds: Set<number>, activeTaskId: number | null) => {
  useTaskMapContextMock.mockReturnValue({ selectedTaskIds, activeTaskId })
}

const clusterFeature: GeoJSON.Feature = {
  type: 'Feature',
  properties: { point_count: 3, cluster: true },
  geometry: { type: 'Point', coordinates: [1, 1] },
}

const featureWithoutId: GeoJSON.Feature = {
  type: 'Feature',
  properties: { status: 0 },
  geometry: { type: 'Point', coordinates: [2, 2] },
}

const makePointFeature = (id: number): GeoJSON.Feature => ({
  type: 'Feature',
  properties: { id, status: 0 },
  geometry: { type: 'Point', coordinates: [id, id] },
})

describe('useStyledClusteredData', () => {
  beforeEach(() => {
    useTaskMapContextMock.mockReset()
  })

  it('returns the original collection unchanged when nothing is selected or active', () => {
    setContext(new Set(), null)
    const data: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [makePointFeature(1)],
    }

    const { result } = renderHook(() => useStyledClusteredData(data))

    expect(result.current).toBe(data)
  })

  it('leaves cluster features untouched', () => {
    setContext(new Set([1]), null)
    const data: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [clusterFeature],
    }

    const { result } = renderHook(() => useStyledClusteredData(data))

    expect(result.current.features[0]).toBe(clusterFeature)
  })

  it('leaves features without an id untouched', () => {
    setContext(new Set([1]), null)
    const data: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [featureWithoutId],
    }

    const { result } = renderHook(() => useStyledClusteredData(data))

    expect(result.current.features[0]).toBe(featureWithoutId)
  })

  it('marks a lasso-selected feature with isLassoSelected', () => {
    setContext(new Set([1]), null)
    const data: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [makePointFeature(1), makePointFeature(2)],
    }

    const { result } = renderHook(() => useStyledClusteredData(data))

    expect(result.current.features[0].properties?.isLassoSelected).toBe(true)
    expect(result.current.features[1]).toBe(data.features[1])
    expect(result.current.features[1].properties?.isLassoSelected).toBeUndefined()
  })

  it('marks the active task feature with isActive', () => {
    setContext(new Set(), 2)
    const data: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [makePointFeature(1), makePointFeature(2)],
    }

    const { result } = renderHook(() => useStyledClusteredData(data))

    expect(result.current.features[0]).toBe(data.features[0])
    expect(result.current.features[1].properties?.isActive).toBe(true)
  })

  it('marks a feature that is both selected and active with both flags', () => {
    setContext(new Set([1]), 1)
    const data: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [makePointFeature(1)],
    }

    const { result } = renderHook(() => useStyledClusteredData(data))

    expect(result.current.features[0].properties?.isLassoSelected).toBe(true)
    expect(result.current.features[0].properties?.isActive).toBe(true)
  })

  it('preserves existing properties on a styled feature', () => {
    setContext(new Set([1]), null)
    const data: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [makePointFeature(1)],
    }

    const { result } = renderHook(() => useStyledClusteredData(data))

    expect(result.current.features[0].properties?.status).toBe(0)
    expect(result.current.features[0].properties?.id).toBe(1)
  })

  it('memoizes the result when inputs do not change', () => {
    setContext(new Set([1]), null)
    const data: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [makePointFeature(1)],
    }

    const { result, rerender } = renderHook(() => useStyledClusteredData(data))
    const first = result.current

    rerender()

    expect(result.current).toBe(first)
  })
})
