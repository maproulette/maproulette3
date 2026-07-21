import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { TaskBundle } from '@/components/Pages/TaskEditPage/contexts/TaskBundleContext'

const { useTaskBundleContextMock, useTaskMapContextMock, useTaskEditMapContextMock } = vi.hoisted(
  () => ({
    useTaskBundleContextMock: vi.fn(),
    useTaskMapContextMock: vi.fn(),
    useTaskEditMapContextMock: vi.fn(),
  })
)

vi.mock('@/components/Pages/TaskEditPage/contexts/TaskBundleContext', () => ({
  useTaskBundleContext: useTaskBundleContextMock,
}))
vi.mock('@/components/Pages/TaskEditPage/contexts/TaskMapContext', () => ({
  useTaskMapContext: useTaskMapContextMock,
}))
vi.mock('@/components/Pages/TaskEditPage/TaskMap/TaskEditMapContext', () => ({
  useTaskEditMapContext: useTaskEditMapContextMock,
}))

import { useMapControlButtons } from './useMapControlButtons'

interface Overrides {
  markersHidden?: boolean
  setMarkersHidden?: (hidden: boolean) => void
  activeBundle?: TaskBundle | null
  showBundleOnly?: boolean
  setShowBundleOnly?: (show: boolean) => void
  showExploreLayer?: boolean
  setShowExploreLayer?: (show: boolean) => void
}

const setContext = ({
  markersHidden = false,
  setMarkersHidden = vi.fn(),
  activeBundle = null,
  showBundleOnly = false,
  setShowBundleOnly = vi.fn(),
  showExploreLayer = false,
  setShowExploreLayer = vi.fn(),
}: Overrides) => {
  useTaskMapContextMock.mockReturnValue({ markersHidden, setMarkersHidden })
  useTaskBundleContextMock.mockReturnValue({ activeBundle, showBundleOnly, setShowBundleOnly })
  useTaskEditMapContextMock.mockReturnValue({ showExploreLayer, setShowExploreLayer })
}

describe('useMapControlButtons', () => {
  beforeEach(() => {
    useTaskBundleContextMock.mockReset()
    useTaskMapContextMock.mockReset()
    useTaskEditMapContextMock.mockReset()
  })

  it('returns the four control buttons in order', () => {
    setContext({})
    const handleCenterToTask = vi.fn()

    const { result } = renderHook(() => useMapControlButtons(true, handleCenterToTask))

    expect(result.current.map((b) => b.id)).toEqual([
      'center-to-task',
      'toggle-markers',
      'toggle-bundle-only',
      'toggle-explore-layer',
    ])
  })

  it('disables every button when the map has not loaded', () => {
    setContext({})

    const { result } = renderHook(() => useMapControlButtons(false, vi.fn()))

    expect(result.current.every((b) => b.disabled)).toBe(true)
  })

  it('enables every button when the map has loaded', () => {
    setContext({})

    const { result } = renderHook(() => useMapControlButtons(true, vi.fn()))

    expect(result.current.every((b) => !b.disabled)).toBe(true)
  })

  it('center-to-task calls the provided handler and labels for a single task', () => {
    setContext({ activeBundle: null })
    const handleCenterToTask = vi.fn()

    const { result } = renderHook(() => useMapControlButtons(true, handleCenterToTask))
    const button = result.current.find((b) => b.id === 'center-to-task')

    expect(button?.tooltip).toBe('Center to Task')
    button?.onClick()
    expect(handleCenterToTask).toHaveBeenCalledTimes(1)
  })

  it('center-to-task labels for a multi-task bundle', () => {
    setContext({
      activeBundle: { bundleId: 1, taskIds: [1, 2], name: 'b' } as TaskBundle,
    })

    const { result } = renderHook(() => useMapControlButtons(true, vi.fn()))
    const button = result.current.find((b) => b.id === 'center-to-task')

    expect(button?.tooltip).toBe('Center to Bundle')
  })

  it('center-to-task keeps single-task label for a bundle with only the primary task', () => {
    setContext({
      activeBundle: { bundleId: 1, taskIds: [1], name: 'b' } as TaskBundle,
    })

    const { result } = renderHook(() => useMapControlButtons(true, vi.fn()))
    const button = result.current.find((b) => b.id === 'center-to-task')

    expect(button?.tooltip).toBe('Center to Task')
  })

  it('toggle-markers reflects hidden state and toggles it on click', () => {
    const setMarkersHidden = vi.fn()
    setContext({ markersHidden: true, setMarkersHidden })

    const { result } = renderHook(() => useMapControlButtons(true, vi.fn()))
    const button = result.current.find((b) => b.id === 'toggle-markers')

    expect(button?.tooltip).toBe('Show all markers')
    expect(button?.isActive).toBe(true)
    button?.onClick()
    expect(setMarkersHidden).toHaveBeenCalledWith(false)
  })

  it('toggle-markers reflects visible state and toggles it on click', () => {
    const setMarkersHidden = vi.fn()
    setContext({ markersHidden: false, setMarkersHidden })

    const { result } = renderHook(() => useMapControlButtons(true, vi.fn()))
    const button = result.current.find((b) => b.id === 'toggle-markers')

    expect(button?.tooltip).toBe('Hide all markers')
    expect(button?.isActive).toBe(false)
    button?.onClick()
    expect(setMarkersHidden).toHaveBeenCalledWith(true)
  })

  it('toggle-bundle-only shows "show all" tooltip when filtered on', () => {
    setContext({ showBundleOnly: true })

    const { result } = renderHook(() => useMapControlButtons(true, vi.fn()))
    const button = result.current.find((b) => b.id === 'toggle-bundle-only')

    expect(button?.tooltip).toBe('Show all tasks (F)')
    expect(button?.isActive).toBe(true)
  })

  it('toggle-bundle-only shows "selected tasks" tooltip when a bundle is active and unfiltered', () => {
    setContext({
      showBundleOnly: false,
      activeBundle: { bundleId: 1, taskIds: [1, 2], name: 'b' } as TaskBundle,
    })

    const { result } = renderHook(() => useMapControlButtons(true, vi.fn()))
    const button = result.current.find((b) => b.id === 'toggle-bundle-only')

    expect(button?.tooltip).toBe('Show selected tasks only (F)')
  })

  it('toggle-bundle-only shows "primary task" tooltip with no active bundle and unfiltered', () => {
    setContext({ showBundleOnly: false, activeBundle: null })

    const { result } = renderHook(() => useMapControlButtons(true, vi.fn()))
    const button = result.current.find((b) => b.id === 'toggle-bundle-only')

    expect(button?.tooltip).toBe('Show primary task only (F)')
  })

  it('toggle-bundle-only toggles showBundleOnly on click', () => {
    const setShowBundleOnly = vi.fn()
    setContext({ showBundleOnly: false, setShowBundleOnly })

    const { result } = renderHook(() => useMapControlButtons(true, vi.fn()))
    const button = result.current.find((b) => b.id === 'toggle-bundle-only')
    button?.onClick()

    expect(setShowBundleOnly).toHaveBeenCalledWith(true)
  })

  it('toggle-explore-layer reflects and toggles showExploreLayer', () => {
    const setShowExploreLayer = vi.fn()
    setContext({ showExploreLayer: false, setShowExploreLayer })

    const { result } = renderHook(() => useMapControlButtons(true, vi.fn()))
    const button = result.current.find((b) => b.id === 'toggle-explore-layer')

    expect(button?.tooltip).toBe('Show tasks from other challenges')
    expect(button?.isActive).toBe(false)
    button?.onClick()
    expect(setShowExploreLayer).toHaveBeenCalledWith(true)
  })

  it('toggle-explore-layer shows hide tooltip when already showing', () => {
    setContext({ showExploreLayer: true })

    const { result } = renderHook(() => useMapControlButtons(true, vi.fn()))
    const button = result.current.find((b) => b.id === 'toggle-explore-layer')

    expect(button?.tooltip).toBe('Hide tasks from other challenges')
    expect(button?.isActive).toBe(true)
  })

  it('memoizes the returned array when nothing relevant changes', () => {
    setContext({})
    const handleCenterToTask = vi.fn()

    const { result, rerender } = renderHook(() => useMapControlButtons(true, handleCenterToTask))
    const first = result.current

    rerender()

    expect(result.current).toBe(first)
  })
})
