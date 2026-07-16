import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useColumnConfig } from './useColumnConfig'

type Key = 'name' | 'status' | 'priority' | 'created'

const defaults = {
  available: ['priority', 'created'] as Key[],
  added: ['name', 'status'] as Key[],
}

describe('useColumnConfig', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('initializes with the provided defaults when nothing is in storage', () => {
    const { result } = renderHook(() => useColumnConfig('tasks-table', defaults))

    expect(result.current.config).toEqual(defaults)
  })

  it('persists the initial config to localStorage under a namespaced key', () => {
    renderHook(() => useColumnConfig('tasks-table', defaults))

    const stored = window.localStorage.getItem('mr4:columns:tasks-table')
    expect(stored).not.toBeNull()
    expect(JSON.parse(stored as string)).toEqual(defaults)
  })

  it('loads a sanitized config from localStorage on mount', () => {
    window.localStorage.setItem(
      'mr4:columns:tasks-table',
      JSON.stringify({ available: ['created'], added: ['status', 'name'] })
    )

    const { result } = renderHook(() => useColumnConfig('tasks-table', defaults))

    expect(result.current.config).toEqual({ available: ['created'], added: ['status', 'name'] })
  })

  it('filters out keys from storage that are not among the known defaults', () => {
    window.localStorage.setItem(
      'mr4:columns:tasks-table',
      JSON.stringify({ available: ['created', 'bogus'], added: ['name', 'ghost'] })
    )

    const { result } = renderHook(() => useColumnConfig('tasks-table', defaults))

    expect(result.current.config).toEqual({ available: ['created'], added: ['name'] })
  })

  it('falls back to defaults when localStorage contains malformed JSON', () => {
    window.localStorage.setItem('mr4:columns:tasks-table', '{not valid json')

    const { result } = renderHook(() => useColumnConfig('tasks-table', defaults))

    expect(result.current.config).toEqual(defaults)
  })

  it('falls back to defaults when localStorage entry is missing expected shape', () => {
    window.localStorage.setItem('mr4:columns:tasks-table', JSON.stringify({}))

    const { result } = renderHook(() => useColumnConfig('tasks-table', defaults))

    expect(result.current.config).toEqual(defaults)
  })

  it('uses a distinct storage key per tableId', () => {
    renderHook(() => useColumnConfig('other-table', defaults))

    expect(window.localStorage.getItem('mr4:columns:other-table')).not.toBeNull()
    expect(window.localStorage.getItem('mr4:columns:tasks-table')).toBeNull()
  })

  it('addColumn moves a key from available to added', () => {
    const { result } = renderHook(() => useColumnConfig('tasks-table', defaults))

    act(() => result.current.addColumn('priority'))

    expect(result.current.config).toEqual({
      available: ['created'],
      added: ['name', 'status', 'priority'],
    })
  })

  it('addColumn is a no-op when the key is already added', () => {
    const { result } = renderHook(() => useColumnConfig('tasks-table', defaults))

    act(() => result.current.addColumn('name'))

    expect(result.current.config).toEqual(defaults)
  })

  it('removeColumn moves a key from added back to available', () => {
    const { result } = renderHook(() => useColumnConfig('tasks-table', defaults))

    act(() => result.current.removeColumn('status'))

    expect(result.current.config).toEqual({
      available: ['priority', 'created', 'status'],
      added: ['name'],
    })
  })

  it('removeColumn is a no-op when the key is not currently added', () => {
    const { result } = renderHook(() => useColumnConfig('tasks-table', defaults))

    act(() => result.current.removeColumn('priority'))

    expect(result.current.config).toEqual(defaults)
  })

  it('moveColumn reorders an added key toward the front', () => {
    const { result } = renderHook(() =>
      useColumnConfig('tasks-table', {
        available: [] as Key[],
        added: ['name', 'status', 'priority'],
      })
    )

    act(() => result.current.moveColumn('priority', -1))

    expect(result.current.config.added).toEqual(['name', 'priority', 'status'])
  })

  it('moveColumn reorders an added key toward the back', () => {
    const { result } = renderHook(() =>
      useColumnConfig('tasks-table', {
        available: [] as Key[],
        added: ['name', 'status', 'priority'],
      })
    )

    act(() => result.current.moveColumn('name', 1))

    expect(result.current.config.added).toEqual(['status', 'name', 'priority'])
  })

  it('moveColumn does nothing when moving past the start of the list', () => {
    const { result } = renderHook(() =>
      useColumnConfig('tasks-table', { available: [] as Key[], added: ['name', 'status'] })
    )

    act(() => result.current.moveColumn('name', -1))

    expect(result.current.config.added).toEqual(['name', 'status'])
  })

  it('moveColumn does nothing when moving past the end of the list', () => {
    const { result } = renderHook(() =>
      useColumnConfig('tasks-table', { available: [] as Key[], added: ['name', 'status'] })
    )

    act(() => result.current.moveColumn('status', 1))

    expect(result.current.config.added).toEqual(['name', 'status'])
  })

  it('moveColumn does nothing for a key that is not in added', () => {
    const { result } = renderHook(() => useColumnConfig('tasks-table', defaults))

    act(() => result.current.moveColumn('priority', 1))

    expect(result.current.config).toEqual(defaults)
  })

  it('reset restores the config back to the provided defaults after changes', () => {
    const { result } = renderHook(() => useColumnConfig('tasks-table', defaults))

    act(() => result.current.addColumn('priority'))
    expect(result.current.config).not.toEqual(defaults)

    act(() => result.current.reset())

    expect(result.current.config).toEqual(defaults)
  })

  it('persists updated config to localStorage after a mutation', () => {
    const { result } = renderHook(() => useColumnConfig('tasks-table', defaults))

    act(() => result.current.addColumn('priority'))

    const stored = JSON.parse(window.localStorage.getItem('mr4:columns:tasks-table') as string)
    expect(stored).toEqual({ available: ['created'], added: ['name', 'status', 'priority'] })
  })
})
