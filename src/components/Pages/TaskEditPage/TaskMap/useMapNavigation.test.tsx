import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { TaskBundle } from '@/components/Pages/TaskEditPage/contexts/TaskBundleContext'
import type { Task, TaskMarker } from '@/types/Task'

const { useTaskBundleContextMock, useTaskContextMock, useTaskMapContextMock } = vi.hoisted(() => ({
  useTaskBundleContextMock: vi.fn(),
  useTaskContextMock: vi.fn(),
  useTaskMapContextMock: vi.fn(),
}))

vi.mock('@/components/Pages/TaskEditPage/contexts/TaskBundleContext', () => ({
  useTaskBundleContext: useTaskBundleContextMock,
}))
vi.mock('@/components/Pages/TaskEditPage/contexts/TaskContext', () => ({
  useTaskContext: useTaskContextMock,
}))
vi.mock('@/components/Pages/TaskEditPage/contexts/TaskMapContext', () => ({
  useTaskMapContext: useTaskMapContextMock,
}))

import { useMapNavigation } from './useMapNavigation'

const makeMarker = (id: number, lng: number, lat: number): TaskMarker =>
  ({ id, location: { lng, lat } }) as TaskMarker

const makeFakeMap = () => ({
  jumpTo: vi.fn(),
  fitBounds: vi.fn(),
})

const setContext = (
  map: { current: ReturnType<typeof makeFakeMap> | null },
  taskId: number,
  activeBundle: TaskBundle | null
) => {
  useTaskMapContextMock.mockReturnValue({ map })
  useTaskContextMock.mockReturnValue({ task: { id: taskId } as Task })
  useTaskBundleContextMock.mockReturnValue({ activeBundle })
}

describe('useMapNavigation', () => {
  beforeEach(() => {
    useTaskBundleContextMock.mockReset()
    useTaskContextMock.mockReset()
    useTaskMapContextMock.mockReset()
  })

  it('zooms to the primary task marker once the map has loaded and markers are present', () => {
    const fakeMap = makeFakeMap()
    setContext({ current: fakeMap }, 1, null)
    const markers = [makeMarker(1, 10, 20), makeMarker(2, 30, 40)]

    renderHook(() => useMapNavigation(true, markers, new Map()))

    expect(fakeMap.jumpTo).toHaveBeenCalledWith({ center: [10, 20], zoom: 16 })
  })

  it('does not zoom when the map has not loaded', () => {
    const fakeMap = makeFakeMap()
    setContext({ current: fakeMap }, 1, null)
    const markers = [makeMarker(1, 10, 20)]

    renderHook(() => useMapNavigation(false, markers, new Map()))

    expect(fakeMap.jumpTo).not.toHaveBeenCalled()
  })

  it('does not zoom when there are no markers', () => {
    const fakeMap = makeFakeMap()
    setContext({ current: fakeMap }, 1, null)

    renderHook(() => useMapNavigation(true, [], new Map()))

    expect(fakeMap.jumpTo).not.toHaveBeenCalled()
  })

  it('does not re-zoom to the same task on subsequent renders', () => {
    const fakeMap = makeFakeMap()
    setContext({ current: fakeMap }, 1, null)
    const markers = [makeMarker(1, 10, 20)]

    const { rerender } = renderHook(() => useMapNavigation(true, markers, new Map()))
    expect(fakeMap.jumpTo).toHaveBeenCalledTimes(1)

    rerender()

    expect(fakeMap.jumpTo).toHaveBeenCalledTimes(1)
  })

  it('zooms again when the primary task id changes', () => {
    const fakeMap = makeFakeMap()
    setContext({ current: fakeMap }, 1, null)
    const markers = [makeMarker(1, 10, 20), makeMarker(2, 30, 40)]

    const { rerender } = renderHook(() => useMapNavigation(true, markers, new Map()))
    expect(fakeMap.jumpTo).toHaveBeenCalledTimes(1)

    setContext({ current: fakeMap }, 2, null)
    rerender()

    expect(fakeMap.jumpTo).toHaveBeenCalledTimes(2)
    expect(fakeMap.jumpTo).toHaveBeenLastCalledWith({ center: [30, 40], zoom: 16 })
  })

  it('handleCenterToTask centers on the primary task when there is no multi-task bundle', () => {
    const fakeMap = makeFakeMap()
    setContext({ current: fakeMap }, 1, null)
    const markers = [makeMarker(1, 10, 20)]

    const { result } = renderHook(() => useMapNavigation(true, markers, new Map()))
    fakeMap.jumpTo.mockClear()

    result.current.handleCenterToTask()

    expect(fakeMap.jumpTo).toHaveBeenCalledWith({ center: [10, 20], zoom: 16 })
    expect(fakeMap.fitBounds).not.toHaveBeenCalled()
  })

  it('handleCenterToTask fits bounds to the bundle when the bundle has multiple tasks', () => {
    const fakeMap = makeFakeMap()
    const activeBundle: TaskBundle = { bundleId: 1, taskIds: [1, 2], name: 'b' }
    setContext({ current: fakeMap }, 1, activeBundle)
    const markers = [makeMarker(1, 10, 20), makeMarker(2, 30, 40)]
    const allMarkersMap = new Map(markers.map((m) => [m.id, m]))

    const { result } = renderHook(() => useMapNavigation(true, markers, allMarkersMap))
    fakeMap.jumpTo.mockClear()

    result.current.handleCenterToTask()

    expect(fakeMap.fitBounds).toHaveBeenCalledTimes(1)
    const [bbox, options] = fakeMap.fitBounds.mock.calls[0]
    expect(bbox).toEqual([10, 20, 30, 40])
    expect(options).toEqual({ padding: 80, duration: 0, maxZoom: 16 })
    expect(fakeMap.jumpTo).not.toHaveBeenCalled()
  })

  it('handleCenterToTask falls back to the primary task when bundle markers are not resolvable', () => {
    const fakeMap = makeFakeMap()
    const activeBundle: TaskBundle = { bundleId: 1, taskIds: [1, 2], name: 'b' }
    setContext({ current: fakeMap }, 1, activeBundle)
    const markers = [makeMarker(1, 10, 20)]

    const { result } = renderHook(() => useMapNavigation(true, markers, new Map()))
    fakeMap.jumpTo.mockClear()

    result.current.handleCenterToTask()

    expect(fakeMap.fitBounds).not.toHaveBeenCalled()
    expect(fakeMap.jumpTo).toHaveBeenCalledWith({ center: [10, 20], zoom: 16 })
  })

  it('handleCenterToTask does nothing when the map is not yet available', () => {
    setContext({ current: null }, 1, null)
    const markers = [makeMarker(1, 10, 20)]

    const { result } = renderHook(() => useMapNavigation(true, markers, new Map()))

    expect(() => result.current.handleCenterToTask()).not.toThrow()
  })
})
