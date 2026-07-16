import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useCopyToClipboard } from './useCopyToClipboard'

vi.mock('@/lib/logger', () => ({
  logger: { warn: vi.fn(), debug: vi.fn(), info: vi.fn(), error: vi.fn() },
}))

import { logger } from '@/lib/logger'

describe('useCopyToClipboard', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('starts with isCopied false', () => {
    const { result } = renderHook(() => useCopyToClipboard())
    expect(result.current.isCopied).toBe(false)
  })

  it('copies text via navigator.clipboard.writeText and flips isCopied to true', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })

    const { result } = renderHook(() => useCopyToClipboard())

    await act(async () => {
      await result.current.copy('hello world')
    })

    expect(writeText).toHaveBeenCalledWith('hello world')
    expect(result.current.isCopied).toBe(true)
  })

  it('resets isCopied to false 2000ms after a successful copy', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })

    const { result } = renderHook(() => useCopyToClipboard())

    await act(async () => {
      await result.current.copy('hello world')
    })
    expect(result.current.isCopied).toBe(true)

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(result.current.isCopied).toBe(false)
    vi.useRealTimers()
  })

  it('warns and does nothing when clipboard is unsupported', async () => {
    vi.stubGlobal('navigator', { ...navigator, clipboard: undefined })

    const { result } = renderHook(() => useCopyToClipboard())

    await act(async () => {
      await result.current.copy('hello world')
    })

    expect(logger.warn).toHaveBeenCalledWith('Clipboard not supported')
    expect(result.current.isCopied).toBe(false)
  })

  it('warns and keeps isCopied false when writeText rejects', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })

    const { result } = renderHook(() => useCopyToClipboard())

    await act(async () => {
      await result.current.copy('hello world')
    })

    expect(logger.warn).toHaveBeenCalledWith('Copy failed', expect.anything())
    expect(result.current.isCopied).toBe(false)
  })

  it('returns a stable copy function reference across renders', () => {
    const { result, rerender } = renderHook(() => useCopyToClipboard())
    const firstCopy = result.current.copy
    rerender()
    expect(result.current.copy).toBe(firstCopy)
  })
})
