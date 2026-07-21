import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { ActionCounts } from './useActionSummary'
import { STATUS_ORDER, useActionSummary } from './useActionSummary'

describe('useActionSummary', () => {
  it('returns an empty summary when actions is undefined', () => {
    const { result } = renderHook(() => useActionSummary(undefined))

    expect(result.current).toEqual({ total: 0, segments: [], counts: {} })
  })

  it('maps `available` to the canonical `created` status key', () => {
    const { result } = renderHook(() => useActionSummary({ available: 10, total: 10 }))

    expect(result.current.counts).toEqual({ created: 10 })
    expect(result.current.segments).toEqual([
      { key: 'created', label: 'Available', color: expect.any(String), count: 10, percent: 100 },
    ])
  })

  it('omits zero-count and unspecified statuses from segments and counts', () => {
    const { result } = renderHook(() =>
      useActionSummary({ total: 5, fixed: 5, skipped: 0, deleted: undefined })
    )

    expect(result.current.counts).toEqual({ fixed: 5 })
    expect(result.current.segments).toHaveLength(1)
    expect(result.current.segments[0].key).toBe('fixed')
  })

  it('treats negative counts as zero', () => {
    const { result } = renderHook(() => useActionSummary({ total: 5, fixed: -3 }))

    expect(result.current.counts).toEqual({})
    expect(result.current.segments).toEqual([])
  })

  it('uses actions.total when provided instead of the summed counts', () => {
    const { result } = renderHook(() => useActionSummary({ total: 100, fixed: 5, skipped: 5 }))

    expect(result.current.total).toBe(100)
    expect(result.current.segments.find((s) => s.key === 'fixed')?.percent).toBe(5)
  })

  it('falls back to summed counts when actions.total is absent', () => {
    const { result } = renderHook(() => useActionSummary({ fixed: 5, skipped: 15 }))

    expect(result.current.total).toBe(20)
    expect(result.current.segments.find((s) => s.key === 'fixed')?.percent).toBe(25)
    expect(result.current.segments.find((s) => s.key === 'skipped')?.percent).toBe(75)
  })

  it('falls back to summed counts when actions.total is explicitly zero', () => {
    const { result } = renderHook(() => useActionSummary({ total: 0, fixed: 4 }))

    expect(result.current.total).toBe(4)
    expect(result.current.counts).toEqual({ fixed: 4 })
  })

  it('produces zero percent segments when everything (including total) is zero', () => {
    const { result } = renderHook(() => useActionSummary({ total: 0 }))

    expect(result.current.total).toBe(0)
    expect(result.current.segments).toEqual([])
  })

  it('orders segments according to STATUS_ORDER regardless of input field order', () => {
    const { result } = renderHook(() =>
      useActionSummary({
        disabled: 1,
        available: 1,
        deleted: 1,
        tooHard: 1,
        skipped: 1,
        falsePositive: 1,
        alreadyFixed: 1,
        fixed: 1,
      })
    )

    expect(result.current.segments.map((s) => s.key)).toEqual(STATUS_ORDER)
  })

  it('recomputes the summary when the actions input changes', () => {
    const { result, rerender } = renderHook(
      (actions: ActionCounts | undefined) => useActionSummary(actions),
      { initialProps: { total: 10, fixed: 10 } as ActionCounts | undefined }
    )

    expect(result.current.counts).toEqual({ fixed: 10 })

    rerender({ total: 10, skipped: 10 })

    expect(result.current.counts).toEqual({ skipped: 10 })
  })

  it('recomputes back to the empty summary when actions becomes undefined', () => {
    const { result, rerender } = renderHook(
      (actions: ActionCounts | undefined) => useActionSummary(actions),
      { initialProps: { total: 10, fixed: 10 } as ActionCounts | undefined }
    )

    expect(result.current.total).toBe(10)

    rerender(undefined)

    expect(result.current).toEqual({ total: 0, segments: [], counts: {} })
  })
})
