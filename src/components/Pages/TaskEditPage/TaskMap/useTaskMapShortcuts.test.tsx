import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { KeyboardShortcut } from '@/components/Pages/TaskEditPage/contexts/KeyboardShortcutsContext'
import type { TaskBundle } from '@/components/Pages/TaskEditPage/contexts/TaskBundleContext'
import type { LassoMode } from '@/components/Pages/TaskEditPage/contexts/TaskMapContext'
import { renderHook } from '@/test/testUtils'

const { useRegisterShortcutsMock, useTaskBundleContextMock, useTaskMapContextMock } = vi.hoisted(
  () => ({
    useRegisterShortcutsMock: vi.fn(),
    useTaskBundleContextMock: vi.fn(),
    useTaskMapContextMock: vi.fn(),
  })
)

vi.mock('@/components/Pages/TaskEditPage/contexts/KeyboardShortcutsContext', () => ({
  useRegisterShortcuts: useRegisterShortcutsMock,
}))
vi.mock('@/components/Pages/TaskEditPage/contexts/TaskBundleContext', () => ({
  useTaskBundleContext: useTaskBundleContextMock,
}))
vi.mock('@/components/Pages/TaskEditPage/contexts/TaskMapContext', () => ({
  useTaskMapContext: useTaskMapContextMock,
}))

import { useTaskMapShortcuts } from './useTaskMapShortcuts'

interface Overrides {
  activeBundle?: TaskBundle | null
  showBundleOnly?: boolean
  setShowBundleOnly?: (v: boolean) => void
  setShowDeleteDialog?: (v: boolean) => void
  markersHidden?: boolean
  setMarkersHidden?: (v: boolean) => void
  drawingMode?: LassoMode
  startDrawing?: (mode: 'select') => void
  cancelDrawing?: () => void
}

const setContext = ({
  activeBundle = null,
  showBundleOnly = false,
  setShowBundleOnly = vi.fn(),
  setShowDeleteDialog = vi.fn(),
  markersHidden = false,
  setMarkersHidden = vi.fn(),
  drawingMode = null,
  startDrawing = vi.fn(),
  cancelDrawing = vi.fn(),
}: Overrides) => {
  useTaskBundleContextMock.mockReturnValue({
    activeBundle,
    showBundleOnly,
    setShowBundleOnly,
    setShowDeleteDialog,
  })
  useTaskMapContextMock.mockReturnValue({
    markersHidden,
    setMarkersHidden,
    drawingMode,
    startDrawing,
    cancelDrawing,
  })
}

const shortcutsPassedToRegister = (): KeyboardShortcut[] =>
  useRegisterShortcutsMock.mock.calls[useRegisterShortcutsMock.mock.calls.length - 1][1]

const findShortcut = (key: string): KeyboardShortcut => {
  const shortcut = shortcutsPassedToRegister().find((s) => s.key === key)
  if (!shortcut) throw new Error(`shortcut ${key} not registered`)
  return shortcut
}

describe('useTaskMapShortcuts', () => {
  beforeEach(() => {
    useRegisterShortcutsMock.mockReset()
    useTaskBundleContextMock.mockReset()
    useTaskMapContextMock.mockReset()
  })

  it('registers shortcuts under the task-map id with all five shortcuts', () => {
    setContext({})

    renderHook(() => useTaskMapShortcuts())

    expect(useRegisterShortcutsMock).toHaveBeenCalledTimes(1)
    const [id, shortcuts] = useRegisterShortcutsMock.mock.calls[0]
    expect(id).toBe('task-map')
    expect(shortcuts.map((s: KeyboardShortcut) => s.key)).toEqual(['D', 'F', 'H', 'Delete', 'Esc'])
  })

  it('D shortcut starts a select drawing session when not already drawing, and is enabled', () => {
    const startDrawing = vi.fn()
    setContext({ drawingMode: null, startDrawing })

    renderHook(() => useTaskMapShortcuts())
    const shortcut = findShortcut('D')

    expect(shortcut.enabled).toBe(true)
    shortcut.handler?.()
    expect(startDrawing).toHaveBeenCalledWith('select')
  })

  it('D shortcut is disabled and does not start drawing again while already drawing', () => {
    const startDrawing = vi.fn()
    setContext({ drawingMode: 'select', startDrawing })

    renderHook(() => useTaskMapShortcuts())
    const shortcut = findShortcut('D')

    expect(shortcut.enabled).toBe(false)
    shortcut.handler?.()
    expect(startDrawing).not.toHaveBeenCalled()
  })

  it('F shortcut toggles showBundleOnly and is enabled only with an active bundle', () => {
    const setShowBundleOnly = vi.fn()
    setContext({
      showBundleOnly: false,
      setShowBundleOnly,
      activeBundle: { bundleId: 1, taskIds: [1, 2], name: 'b' },
    })

    renderHook(() => useTaskMapShortcuts())
    const shortcut = findShortcut('F')

    expect(shortcut.enabled).toBe(true)
    shortcut.handler?.()
    expect(setShowBundleOnly).toHaveBeenCalledWith(true)
  })

  it('F shortcut is disabled when there is no active bundle', () => {
    setContext({ activeBundle: null })

    renderHook(() => useTaskMapShortcuts())
    const shortcut = findShortcut('F')

    expect(shortcut.enabled).toBe(false)
  })

  it('H shortcut toggles markersHidden and is always enabled', () => {
    const setMarkersHidden = vi.fn()
    setContext({ markersHidden: false, setMarkersHidden, activeBundle: null })

    renderHook(() => useTaskMapShortcuts())
    const shortcut = findShortcut('H')

    expect(shortcut.enabled).toBe(true)
    shortcut.handler?.()
    expect(setMarkersHidden).toHaveBeenCalledWith(true)
  })

  it('Delete shortcut opens the delete dialog and is enabled only with an active bundle', () => {
    const setShowDeleteDialog = vi.fn()
    setContext({
      setShowDeleteDialog,
      activeBundle: { bundleId: 1, taskIds: [1, 2], name: 'b' },
    })

    renderHook(() => useTaskMapShortcuts())
    const shortcut = findShortcut('Delete')

    expect(shortcut.enabled).toBe(true)
    shortcut.handler?.()
    expect(setShowDeleteDialog).toHaveBeenCalledWith(true)
  })

  it('Delete shortcut is disabled without an active bundle', () => {
    setContext({ activeBundle: null })

    renderHook(() => useTaskMapShortcuts())
    const shortcut = findShortcut('Delete')

    expect(shortcut.enabled).toBe(false)
  })

  it('Esc shortcut cancels drawing and is enabled only while drawing', () => {
    const cancelDrawing = vi.fn()
    setContext({ drawingMode: 'select', cancelDrawing })

    renderHook(() => useTaskMapShortcuts())
    const shortcut = findShortcut('Esc')

    expect(shortcut.enabled).toBe(true)
    shortcut.handler?.()
    expect(cancelDrawing).toHaveBeenCalledTimes(1)
  })

  it('Esc shortcut is disabled when not drawing', () => {
    setContext({ drawingMode: null })

    renderHook(() => useTaskMapShortcuts())
    const shortcut = findShortcut('Esc')

    expect(shortcut.enabled).toBe(false)
  })

  it('memoizes the shortcuts array reference when nothing relevant changes', () => {
    setContext({})

    const { rerender } = renderHook(() => useTaskMapShortcuts())
    const first = shortcutsPassedToRegister()

    rerender()

    const second = shortcutsPassedToRegister()
    expect(second).toBe(first)
  })
})
