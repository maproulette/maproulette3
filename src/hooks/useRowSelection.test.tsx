import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useRowSelection } from './useRowSelection'

describe('useRowSelection', () => {
  it('starts with no rows selected', () => {
    const { result } = renderHook(() => useRowSelection<number>())

    expect(result.current.ids.size).toBe(0)
    expect(result.current.idList).toEqual([])
    expect(result.current.count).toBe(0)
    expect(result.current.has(1)).toBe(false)
  })

  it('toggle adds an unselected id and removes a selected one', () => {
    const { result } = renderHook(() => useRowSelection<number>())

    act(() => result.current.toggle(1))
    expect(result.current.has(1)).toBe(true)
    expect(result.current.count).toBe(1)
    expect(result.current.idList).toEqual([1])

    act(() => result.current.toggle(1))
    expect(result.current.has(1)).toBe(false)
    expect(result.current.count).toBe(0)
  })

  it('set(id, true) selects and set(id, false) deselects', () => {
    const { result } = renderHook(() => useRowSelection<number>())

    act(() => result.current.set(2, true))
    expect(result.current.has(2)).toBe(true)

    act(() => result.current.set(2, false))
    expect(result.current.has(2)).toBe(false)
  })

  it('set is a no-op when the requested state already matches', () => {
    const { result } = renderHook(() => useRowSelection<number>())

    act(() => result.current.set(3, true))
    const idsAfterFirstSet = result.current.ids

    act(() => result.current.set(3, true))
    expect(result.current.ids).toBe(idsAfterFirstSet)
  })

  it('selectAll replaces the selection with the given ids', () => {
    const { result } = renderHook(() => useRowSelection<number>())

    act(() => result.current.toggle(99))
    act(() => result.current.selectAll([1, 2, 3]))

    expect(result.current.idList.sort()).toEqual([1, 2, 3])
    expect(result.current.has(99)).toBe(false)
    expect(result.current.count).toBe(3)
  })

  it('clear empties the selection', () => {
    const { result } = renderHook(() => useRowSelection<number>())

    act(() => result.current.selectAll([1, 2, 3]))
    act(() => result.current.clear())

    expect(result.current.count).toBe(0)
    expect(result.current.idList).toEqual([])
  })

  it('works with string ids', () => {
    const { result } = renderHook(() => useRowSelection<string>())

    act(() => result.current.toggle('abc'))
    expect(result.current.has('abc')).toBe(true)
    expect(result.current.idList).toEqual(['abc'])
  })
})
