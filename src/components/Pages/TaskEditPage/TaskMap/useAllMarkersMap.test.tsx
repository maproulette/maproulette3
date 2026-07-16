import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { TaskMarker } from '@/types/Task'
import { useAllMarkersMap } from './useAllMarkersMap'

const makeMarker = (id: number): TaskMarker => ({ id }) as TaskMarker

describe('useAllMarkersMap', () => {
  it('returns an empty map when there are no markers or overlaps', () => {
    const { result } = renderHook(() => useAllMarkersMap([], []))

    expect(result.current.size).toBe(0)
  })

  it('indexes regular markers by id', () => {
    const markers = [makeMarker(1), makeMarker(2)]
    const { result } = renderHook(() => useAllMarkersMap(markers, []))

    expect(result.current.size).toBe(2)
    expect(result.current.get(1)).toBe(markers[0])
    expect(result.current.get(2)).toBe(markers[1])
  })

  it('adds overlap tasks that are not already in the regular markers', () => {
    const markers = [makeMarker(1)]
    const overlapTask = makeMarker(2)
    const overlaps = [{ tasks: [overlapTask] }]

    const { result } = renderHook(() => useAllMarkersMap(markers, overlaps))

    expect(result.current.size).toBe(2)
    expect(result.current.get(2)).toBe(overlapTask)
  })

  it('does not let an overlap task overwrite a regular marker with the same id', () => {
    const regularMarker = makeMarker(1)
    const overlapMarker = makeMarker(1)
    const overlaps = [{ tasks: [overlapMarker] }]

    const { result } = renderHook(() => useAllMarkersMap([regularMarker], overlaps))

    expect(result.current.size).toBe(1)
    expect(result.current.get(1)).toBe(regularMarker)
  })

  it('merges tasks across multiple overlap groups without duplicating ids', () => {
    const overlapA = { tasks: [makeMarker(2), makeMarker(3)] }
    const overlapB = { tasks: [makeMarker(3), makeMarker(4)] }

    const { result } = renderHook(() => useAllMarkersMap([], [overlapA, overlapB]))

    expect(result.current.size).toBe(3)
    expect([...result.current.keys()].sort()).toEqual([2, 3, 4])
  })

  it('memoizes the map when markers and overlaps do not change', () => {
    const markers = [makeMarker(1)]
    const overlaps = [{ tasks: [makeMarker(2)] }]

    const { result, rerender } = renderHook(
      ({ m, o }: { m: TaskMarker[]; o: { tasks: TaskMarker[] }[] }) => useAllMarkersMap(m, o),
      { initialProps: { m: markers, o: overlaps } }
    )
    const firstMap = result.current

    rerender({ m: markers, o: overlaps })

    expect(result.current).toBe(firstMap)
  })

  it('recomputes the map when the markers array changes', () => {
    const overlaps: { tasks: TaskMarker[] }[] = []
    const { result, rerender } = renderHook(
      ({ m, o }: { m: TaskMarker[]; o: { tasks: TaskMarker[] }[] }) => useAllMarkersMap(m, o),
      { initialProps: { m: [makeMarker(1)], o: overlaps } }
    )
    const firstMap = result.current

    rerender({ m: [makeMarker(1), makeMarker(2)], o: overlaps })

    expect(result.current).not.toBe(firstMap)
    expect(result.current.size).toBe(2)
  })
})
