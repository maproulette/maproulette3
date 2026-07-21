import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useShareSupport } from './useShareSupport'

describe('useShareSupport', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns false when navigator.share is not a function', () => {
    vi.stubGlobal('navigator', { ...navigator, share: undefined })

    const { result } = renderHook(() => useShareSupport())

    expect(result.current).toBe(false)
  })

  it('returns true when navigator.share is a function', () => {
    vi.stubGlobal('navigator', { ...navigator, share: vi.fn() })

    const { result } = renderHook(() => useShareSupport())

    expect(result.current).toBe(true)
  })

  it('reflects a share function added between renders', () => {
    vi.stubGlobal('navigator', { ...navigator, share: undefined })

    const { result, rerender } = renderHook(() => useShareSupport())
    expect(result.current).toBe(false)

    vi.stubGlobal('navigator', { ...navigator, share: vi.fn() })
    rerender()

    expect(result.current).toBe(true)
  })
})
