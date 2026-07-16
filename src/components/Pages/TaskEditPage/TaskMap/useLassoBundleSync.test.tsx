import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { TaskBundle } from '@/components/Pages/TaskEditPage/contexts/TaskBundleContext'
import type { Task } from '@/types/Task'

const { getTaskMock, useTaskBundleContextMock, useTaskContextMock, useTaskMapContextMock } =
  vi.hoisted(() => ({
    getTaskMock: vi.fn(),
    useTaskBundleContextMock: vi.fn(),
    useTaskContextMock: vi.fn(),
    useTaskMapContextMock: vi.fn(),
  }))

vi.mock('@/api', () => ({
  api: { task: { getTask: getTaskMock } },
}))
vi.mock('@/components/Pages/TaskEditPage/contexts/TaskBundleContext', () => ({
  PENDING_BUNDLE_ID: 0,
  useTaskBundleContext: useTaskBundleContextMock,
}))
vi.mock('@/components/Pages/TaskEditPage/contexts/TaskContext', () => ({
  useTaskContext: useTaskContextMock,
}))
vi.mock('@/components/Pages/TaskEditPage/contexts/TaskMapContext', () => ({
  MAX_SELECTED_TASKS: 50,
  useTaskMapContext: useTaskMapContextMock,
}))

import { useLassoBundleSync } from './useLassoBundleSync'

const setContext = ({
  selectedTaskIds,
  clearSelection = vi.fn(),
  activeBundle = null,
  setActiveBundle = vi.fn(),
  primaryTaskId = 1,
  primaryTaskData,
}: {
  selectedTaskIds: Set<number>
  clearSelection?: () => void
  activeBundle?: TaskBundle | null
  setActiveBundle?: (v: TaskBundle | ((prev: TaskBundle | null) => TaskBundle | null)) => void
  primaryTaskId?: number
  primaryTaskData?: Task
}) => {
  useTaskMapContextMock.mockReturnValue({ selectedTaskIds, clearSelection })
  useTaskBundleContextMock.mockReturnValue({ activeBundle, setActiveBundle })
  useTaskContextMock.mockReturnValue({ task: { id: primaryTaskId } as unknown as Task })
  getTaskMock.mockReturnValue({ data: primaryTaskData })
}

describe('useLassoBundleSync', () => {
  beforeEach(() => {
    getTaskMock.mockReset()
    useTaskBundleContextMock.mockReset()
    useTaskContextMock.mockReset()
    useTaskMapContextMock.mockReset()
  })

  it('does nothing when there is no lasso selection', () => {
    const clearSelection = vi.fn()
    const setActiveBundle = vi.fn()
    setContext({ selectedTaskIds: new Set(), clearSelection, setActiveBundle })

    renderHook(() => useLassoBundleSync())

    expect(setActiveBundle).not.toHaveBeenCalled()
    expect(clearSelection).not.toHaveBeenCalled()
  })

  it('creates a pending bundle from the primary task and the selection when there is no active bundle', () => {
    const clearSelection = vi.fn()
    const setActiveBundle = vi.fn()
    const primaryTaskData = { id: 1, name: 'primary' } as unknown as Task
    setContext({
      selectedTaskIds: new Set([2, 3]),
      clearSelection,
      setActiveBundle,
      primaryTaskId: 1,
      primaryTaskData,
    })

    renderHook(() => useLassoBundleSync())

    expect(setActiveBundle).toHaveBeenCalledWith({
      bundleId: 0,
      taskIds: [1, 2, 3],
      tasks: [primaryTaskData],
      name: 'Bundle (pending)',
    })
    expect(clearSelection).toHaveBeenCalledTimes(1)
  })

  it('creates a pending bundle with no tasks when the primary task data has not loaded yet', () => {
    const setActiveBundle = vi.fn()
    setContext({
      selectedTaskIds: new Set([2]),
      setActiveBundle,
      primaryTaskId: 1,
      primaryTaskData: undefined,
    })

    renderHook(() => useLassoBundleSync())

    expect(setActiveBundle).toHaveBeenCalledWith(
      expect.objectContaining({ tasks: [], taskIds: [1, 2] })
    )
  })

  it('adds newly-selected tasks to an existing bundle', () => {
    const clearSelection = vi.fn()
    const setActiveBundle = vi.fn()
    const activeBundle: TaskBundle = { bundleId: 5, taskIds: [1, 2], name: 'Bundle 5' }
    setContext({
      selectedTaskIds: new Set([3, 4]),
      clearSelection,
      setActiveBundle,
      activeBundle,
      primaryTaskId: 1,
    })

    renderHook(() => useLassoBundleSync())

    expect(setActiveBundle).toHaveBeenCalledWith({
      ...activeBundle,
      taskIds: [1, 2, 3, 4],
      tasks: activeBundle.tasks,
    })
    expect(clearSelection).toHaveBeenCalledTimes(1)
  })

  it('does not update the bundle when the selection only contains ids already in the bundle', () => {
    const clearSelection = vi.fn()
    const setActiveBundle = vi.fn()
    const activeBundle: TaskBundle = { bundleId: 5, taskIds: [1, 2, 3], name: 'Bundle 5' }
    setContext({
      selectedTaskIds: new Set([2, 3]),
      clearSelection,
      setActiveBundle,
      activeBundle,
      primaryTaskId: 1,
    })

    renderHook(() => useLassoBundleSync())

    expect(setActiveBundle).not.toHaveBeenCalled()
    expect(clearSelection).toHaveBeenCalledTimes(1)
  })

  it('truncates a newly-created bundle to MAX_SELECTED_TASKS', () => {
    const setActiveBundle = vi.fn()
    const manySelected = new Set(Array.from({ length: 60 }, (_, i) => i + 2))
    setContext({
      selectedTaskIds: manySelected,
      setActiveBundle,
      primaryTaskId: 1,
    })

    renderHook(() => useLassoBundleSync())

    const created = setActiveBundle.mock.calls[0][0] as TaskBundle
    expect(created.taskIds).toHaveLength(50)
    expect(created.taskIds[0]).toBe(1)
  })

  it('truncates an updated bundle to MAX_SELECTED_TASKS', () => {
    const setActiveBundle = vi.fn()
    const activeBundle: TaskBundle = {
      bundleId: 5,
      taskIds: Array.from({ length: 45 }, (_, i) => i + 1),
      name: 'Bundle 5',
    }
    const manySelected = new Set(Array.from({ length: 20 }, (_, i) => i + 1000))
    setContext({
      selectedTaskIds: manySelected,
      setActiveBundle,
      activeBundle,
      primaryTaskId: 1,
    })

    renderHook(() => useLassoBundleSync())

    const updated = setActiveBundle.mock.calls[0][0] as TaskBundle
    expect(updated.taskIds).toHaveLength(50)
  })
})
