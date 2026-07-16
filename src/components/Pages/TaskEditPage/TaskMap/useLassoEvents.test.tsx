import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { TaskBundle } from '@/components/Pages/TaskEditPage/contexts/TaskBundleContext'
import type { LassoMode } from '@/components/Pages/TaskEditPage/contexts/TaskMapContext'
import type { Task, TaskMarker } from '@/types/Task'
import type { User } from '@/types/User'

const {
  getChallengeTaskMarkersMock,
  useTaskBundleContextMock,
  useTaskContextMock,
  useTaskMapContextMock,
  useAuthContextMock,
} = vi.hoisted(() => ({
  getChallengeTaskMarkersMock: vi.fn(),
  useTaskBundleContextMock: vi.fn(),
  useTaskContextMock: vi.fn(),
  useTaskMapContextMock: vi.fn(),
  useAuthContextMock: vi.fn(),
}))

vi.mock('@/api', () => ({
  api: { challenge: { getChallengeTaskMarkers: getChallengeTaskMarkersMock } },
}))
vi.mock('@/components/Pages/TaskEditPage/contexts/TaskBundleContext', () => ({
  useTaskBundleContext: useTaskBundleContextMock,
}))
vi.mock('@/components/Pages/TaskEditPage/contexts/TaskContext', () => ({
  useTaskContext: useTaskContextMock,
}))
vi.mock('@/components/Pages/TaskEditPage/contexts/TaskMapContext', () => ({
  MAX_SELECTED_TASKS: 50,
  useTaskMapContext: useTaskMapContextMock,
}))
vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: useAuthContextMock,
}))

import { useLassoEvents } from './useLassoEvents'

const makeMarker = (
  id: number,
  lng: number,
  lat: number,
  overrides: Partial<TaskMarker> = {}
): TaskMarker =>
  ({
    id,
    location: { lng, lat },
    status: 0,
    bundleId: null,
    lockedBy: null,
    ...overrides,
  }) as TaskMarker

const makeCanvasMap = () => {
  const canvas = document.createElement('canvas')
  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect)

  const bounds = {
    getWest: () => -1000,
    getEast: () => 1000,
    getSouth: () => -1000,
    getNorth: () => 1000,
  }

  return {
    canvas,
    getCanvas: () => canvas,
    unproject: ([x, y]: [number, number]) => ({ lng: x, lat: y }),
    project: (p: [number, number] | { lng: number; lat: number }) => {
      const [lng, lat] = Array.isArray(p) ? p : [p.lng, p.lat]
      return { x: lng, y: lat }
    },
    getBounds: () => bounds,
    dragPan: { enable: vi.fn(), disable: vi.fn() },
  }
}

type FakeMap = ReturnType<typeof makeCanvasMap>

interface Overrides {
  drawingMode?: LassoMode
  setDrawingMode?: (m: LassoMode) => void
  setIsDrawing?: (v: boolean) => void
  setLassoPolygon?: (p: [number, number][] | null) => void
  setSelectedTaskIds?: (updater: (prev: Set<number>) => Set<number>) => void
  cancelDrawing?: () => void
  taskId?: number
  challengeId?: number
  taskBundleId?: number | null
  activeBundle?: TaskBundle | null
  userId?: number | null
  markers?: TaskMarker[]
  mapRefCurrent?: FakeMap | null
}

const setContext = ({
  drawingMode = null,
  setDrawingMode = vi.fn(),
  setIsDrawing = vi.fn(),
  setLassoPolygon = vi.fn(),
  setSelectedTaskIds = vi.fn(),
  cancelDrawing = vi.fn(),
  taskId = 1,
  challengeId = 100,
  taskBundleId = null,
  activeBundle = null,
  userId = 1,
  markers = [],
  mapRefCurrent,
}: Overrides) => {
  useTaskMapContextMock.mockReturnValue({
    map: { current: mapRefCurrent === undefined ? null : mapRefCurrent },
    drawingMode,
    setDrawingMode,
    setIsDrawing,
    setLassoPolygon,
    setSelectedTaskIds,
    cancelDrawing,
  })
  useTaskContextMock.mockReturnValue({
    task: { id: taskId, parent: challengeId, bundleId: taskBundleId } as Task,
  })
  useTaskBundleContextMock.mockReturnValue({ activeBundle })
  useAuthContextMock.mockReturnValue({
    user: userId == null ? undefined : ({ id: userId } as User),
  })
  getChallengeTaskMarkersMock.mockReturnValue({ data: { markers, overlaps: [] } })
}

const mapRefWithFakeMap = (fakeMap: FakeMap) => ({ getMap: () => fakeMap })

describe('useLassoEvents', () => {
  beforeEach(() => {
    getChallengeTaskMarkersMock.mockReset()
    useTaskBundleContextMock.mockReset()
    useTaskContextMock.mockReset()
    useTaskMapContextMock.mockReset()
    useAuthContextMock.mockReset()
  })

  it('does not attach mouse listeners when not in drawing mode', () => {
    const fakeMap = makeCanvasMap()
    const setIsDrawing = vi.fn()
    setContext({
      drawingMode: null,
      setIsDrawing,
      mapRefCurrent: mapRefWithFakeMap(fakeMap) as FakeMap,
    })

    renderHook(() => useLassoEvents())

    fakeMap.canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0 }))

    expect(setIsDrawing).not.toHaveBeenCalled()
  })

  it('starts a lasso on mousedown while in select mode, recording the first point and disabling dragPan', () => {
    const fakeMap = makeCanvasMap()
    const setIsDrawing = vi.fn()
    const setLassoPolygon = vi.fn()
    setContext({
      drawingMode: 'select',
      setIsDrawing,
      setLassoPolygon,
      mapRefCurrent: mapRefWithFakeMap(fakeMap) as FakeMap,
    })

    renderHook(() => useLassoEvents())

    fakeMap.canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0, clientX: 0, clientY: 0 }))

    expect(setLassoPolygon).toHaveBeenCalledWith([[0, 0]])
    expect(setIsDrawing).toHaveBeenCalledWith(true)
    expect(fakeMap.dragPan.disable).toHaveBeenCalledTimes(1)
  })

  it('ignores non-primary mouse buttons on mousedown', () => {
    const fakeMap = makeCanvasMap()
    const setIsDrawing = vi.fn()
    setContext({
      drawingMode: 'select',
      setIsDrawing,
      mapRefCurrent: mapRefWithFakeMap(fakeMap) as FakeMap,
    })

    renderHook(() => useLassoEvents())

    fakeMap.canvas.dispatchEvent(new MouseEvent('mousedown', { button: 2, clientX: 0, clientY: 0 }))

    expect(setIsDrawing).not.toHaveBeenCalled()
  })

  it('accumulates polygon points as the mouse moves at least 3px between samples', () => {
    const fakeMap = makeCanvasMap()
    const setLassoPolygon = vi.fn()
    setContext({
      drawingMode: 'select',
      setLassoPolygon,
      mapRefCurrent: mapRefWithFakeMap(fakeMap) as FakeMap,
    })

    renderHook(() => useLassoEvents())

    fakeMap.canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0, clientX: 0, clientY: 0 }))
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 0, clientY: 10 }))
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 1, clientY: 10 }))

    const calls = setLassoPolygon.mock.calls.map((c) => c[0])
    expect(calls).toContainEqual([
      [0, 0],
      [0, 10],
    ])
    expect(calls.at(-1)).toEqual([
      [0, 0],
      [0, 10],
    ])
  })

  it('selects eligible, non-excluded tasks inside the drawn polygon on mouseup in select mode', () => {
    const fakeMap = makeCanvasMap()
    const setSelectedTaskIds = vi.fn()
    const setIsDrawing = vi.fn()
    const setLassoPolygon = vi.fn()
    const setDrawingMode = vi.fn()

    const markers = [
      makeMarker(1, 5, 5),
      makeMarker(2, 50, 50),
      makeMarker(3, 5, 5, { status: 4 }),
      makeMarker(4, 5, 5, { lockedBy: 999 }),
      makeMarker(5, 5, 5),
      makeMarker(6, 5, 5),
    ]

    setContext({
      drawingMode: 'select',
      setSelectedTaskIds,
      setIsDrawing,
      setLassoPolygon,
      setDrawingMode,
      taskId: 5,
      taskBundleId: null,
      userId: 1,
      activeBundle: { bundleId: 9, taskIds: [6], name: 'b' },
      markers,
      mapRefCurrent: mapRefWithFakeMap(fakeMap) as FakeMap,
    })

    renderHook(() => useLassoEvents())

    fakeMap.canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0, clientX: 0, clientY: 0 }))
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 0, clientY: 10 }))
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 10 }))
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 0 }))
    window.dispatchEvent(new MouseEvent('mouseup'))

    expect(fakeMap.dragPan.enable).toHaveBeenCalledTimes(1)
    expect(setSelectedTaskIds).toHaveBeenCalledTimes(1)
    const updater = setSelectedTaskIds.mock.calls[0][0] as (prev: Set<number>) => Set<number>
    const result = updater(new Set())

    expect([...result].sort()).toEqual([1])
    expect(setLassoPolygon).toHaveBeenLastCalledWith(null)
    expect(setIsDrawing).toHaveBeenLastCalledWith(false)
    expect(setDrawingMode).toHaveBeenCalledWith(null)
  })

  it('stops adding tasks once the selection hits MAX_SELECTED_TASKS', () => {
    const fakeMap = makeCanvasMap()
    const setSelectedTaskIds = vi.fn()
    const markers = [makeMarker(1, 5, 5)]

    setContext({
      drawingMode: 'select',
      setSelectedTaskIds,
      taskId: 999,
      markers,
      mapRefCurrent: mapRefWithFakeMap(fakeMap) as FakeMap,
    })

    renderHook(() => useLassoEvents())

    fakeMap.canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0, clientX: 0, clientY: 0 }))
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 0, clientY: 10 }))
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 10 }))
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 0 }))
    window.dispatchEvent(new MouseEvent('mouseup'))

    const updater = setSelectedTaskIds.mock.calls[0][0] as (prev: Set<number>) => Set<number>
    const alreadyFull = new Set(Array.from({ length: 50 }, (_, i) => i + 1000))
    const result = updater(alreadyFull)

    expect(result.size).toBe(50)
    expect(result.has(1)).toBe(false)
  })

  it('removes tasks inside the polygon from the selection in deselect mode', () => {
    const fakeMap = makeCanvasMap()
    const setSelectedTaskIds = vi.fn()
    const markers = [makeMarker(1, 5, 5), makeMarker(2, 50, 50)]

    setContext({
      drawingMode: 'deselect',
      setSelectedTaskIds,
      taskId: 999,
      markers,
      mapRefCurrent: mapRefWithFakeMap(fakeMap) as FakeMap,
    })

    renderHook(() => useLassoEvents())

    fakeMap.canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0, clientX: 0, clientY: 0 }))
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 0, clientY: 10 }))
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 10 }))
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 0 }))
    window.dispatchEvent(new MouseEvent('mouseup'))

    const updater = setSelectedTaskIds.mock.calls[0][0] as (prev: Set<number>) => Set<number>
    const result = updater(new Set([1, 2]))

    expect([...result]).toEqual([2])
  })

  it('discards the drawing without selecting when fewer than 3 points were drawn', () => {
    const fakeMap = makeCanvasMap()
    const setSelectedTaskIds = vi.fn()
    setContext({
      drawingMode: 'select',
      setSelectedTaskIds,
      markers: [makeMarker(1, 5, 5)],
      mapRefCurrent: mapRefWithFakeMap(fakeMap) as FakeMap,
    })

    renderHook(() => useLassoEvents())

    fakeMap.canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0, clientX: 0, clientY: 0 }))
    window.dispatchEvent(new MouseEvent('mouseup'))

    expect(setSelectedTaskIds).not.toHaveBeenCalled()
  })

  it('cancels drawing on Escape while a drawing mode is active', () => {
    const fakeMap = makeCanvasMap()
    const cancelDrawing = vi.fn()
    setContext({
      drawingMode: 'select',
      cancelDrawing,
      mapRefCurrent: mapRefWithFakeMap(fakeMap) as FakeMap,
    })

    renderHook(() => useLassoEvents())

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(cancelDrawing).toHaveBeenCalledTimes(1)
  })

  it('does not cancel drawing on Escape when no drawing mode is active', () => {
    const fakeMap = makeCanvasMap()
    const cancelDrawing = vi.fn()
    setContext({
      drawingMode: null,
      cancelDrawing,
      mapRefCurrent: mapRefWithFakeMap(fakeMap) as FakeMap,
    })

    renderHook(() => useLassoEvents())

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(cancelDrawing).not.toHaveBeenCalled()
  })

  it('removes its event listeners on unmount', () => {
    const fakeMap = makeCanvasMap()
    const setIsDrawing = vi.fn()
    setContext({
      drawingMode: 'select',
      setIsDrawing,
      mapRefCurrent: mapRefWithFakeMap(fakeMap) as FakeMap,
    })

    const { unmount } = renderHook(() => useLassoEvents())
    unmount()

    fakeMap.canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0, clientX: 0, clientY: 0 }))
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 5, clientY: 5 }))
    window.dispatchEvent(new MouseEvent('mouseup'))

    expect(setIsDrawing).not.toHaveBeenCalled()
  })
})
