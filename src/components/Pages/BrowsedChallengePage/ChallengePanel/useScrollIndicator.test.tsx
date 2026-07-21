import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockContext: { challenge: { description?: string; blurb?: string } } = {
  challenge: { description: 'initial description', blurb: 'initial blurb' },
}

vi.mock('@/components/Pages/BrowsedChallengePage/contexts/BrowsedChallengeContext', () => ({
  useBrowsedChallengeContext: () => mockContext,
}))

import { useScrollIndicator } from './useScrollIndicator'

const makeViewport = ({
  scrollHeight,
  clientHeight,
  scrollTop,
}: {
  scrollHeight: number
  clientHeight: number
  scrollTop: number
}) => {
  const container = document.createElement('div')
  const viewport = document.createElement('div')
  viewport.setAttribute('data-slot', 'scroll-area-viewport')
  container.appendChild(viewport)

  Object.defineProperty(viewport, 'scrollHeight', { value: scrollHeight, configurable: true })
  Object.defineProperty(viewport, 'clientHeight', { value: clientHeight, configurable: true })
  Object.defineProperty(viewport, 'scrollTop', {
    value: scrollTop,
    configurable: true,
    writable: true,
  })

  return { container, viewport }
}

describe('useScrollIndicator', () => {
  beforeEach(() => {
    mockContext.challenge = { description: 'initial description', blurb: 'initial blurb' }
  })

  it('returns hasMoreToScroll false and a ref with no current element initially', () => {
    const { result } = renderHook(() => useScrollIndicator())

    expect(result.current.hasMoreToScroll).toBe(false)
    expect(result.current.scrollAreaRef.current).toBeNull()
  })

  it('sets hasMoreToScroll to true when the viewport can scroll further', () => {
    const { result, rerender } = renderHook(() => useScrollIndicator())
    const { container } = makeViewport({ scrollHeight: 200, clientHeight: 100, scrollTop: 0 })

    act(() => {
      result.current.scrollAreaRef.current = container
    })
    mockContext.challenge = { description: 'changed description', blurb: 'initial blurb' }
    rerender()

    expect(result.current.hasMoreToScroll).toBe(true)
  })

  it('sets hasMoreToScroll to false when the viewport is scrolled near the bottom', () => {
    const { result, rerender } = renderHook(() => useScrollIndicator())
    const { container, viewport } = makeViewport({
      scrollHeight: 200,
      clientHeight: 100,
      scrollTop: 0,
    })

    act(() => {
      result.current.scrollAreaRef.current = container
    })
    mockContext.challenge = { description: 'changed description', blurb: 'initial blurb' }
    rerender()
    expect(result.current.hasMoreToScroll).toBe(true)

    Object.defineProperty(viewport, 'scrollTop', { value: 95, configurable: true })
    mockContext.challenge = { description: 'changed again', blurb: 'initial blurb' }
    rerender()

    expect(result.current.hasMoreToScroll).toBe(false)
  })

  it('reacts to scroll events dispatched on the viewport element', () => {
    const { result, rerender } = renderHook(() => useScrollIndicator())
    const { container, viewport } = makeViewport({
      scrollHeight: 200,
      clientHeight: 100,
      scrollTop: 95,
    })

    act(() => {
      result.current.scrollAreaRef.current = container
    })
    mockContext.challenge = { description: 'changed description', blurb: 'initial blurb' }
    rerender()
    expect(result.current.hasMoreToScroll).toBe(false)

    Object.defineProperty(viewport, 'scrollTop', { value: 0, configurable: true })
    act(() => {
      viewport.dispatchEvent(new Event('scroll'))
    })

    expect(result.current.hasMoreToScroll).toBe(true)
  })

  it('reacts to window resize events', () => {
    const { result, rerender } = renderHook(() => useScrollIndicator())
    const { container, viewport } = makeViewport({
      scrollHeight: 200,
      clientHeight: 100,
      scrollTop: 0,
    })

    act(() => {
      result.current.scrollAreaRef.current = container
    })
    mockContext.challenge = { description: 'changed description', blurb: 'initial blurb' }
    rerender()
    expect(result.current.hasMoreToScroll).toBe(true)

    Object.defineProperty(viewport, 'scrollHeight', { value: 100, configurable: true })
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current.hasMoreToScroll).toBe(false)
  })

  it('registers listeners on the viewport/window and removes them on unmount', () => {
    const { result, rerender, unmount } = renderHook(() => useScrollIndicator())
    const { container, viewport } = makeViewport({
      scrollHeight: 200,
      clientHeight: 100,
      scrollTop: 0,
    })

    const viewportAddSpy = vi.spyOn(viewport, 'addEventListener')
    const windowAddSpy = vi.spyOn(window, 'addEventListener')

    act(() => {
      result.current.scrollAreaRef.current = container
    })
    mockContext.challenge = { description: 'changed description', blurb: 'initial blurb' }
    rerender()

    expect(viewportAddSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    expect(windowAddSpy).toHaveBeenCalledWith('resize', expect.any(Function))

    const viewportRemoveSpy = vi.spyOn(viewport, 'removeEventListener')
    const windowRemoveSpy = vi.spyOn(window, 'removeEventListener')

    unmount()

    expect(viewportRemoveSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    expect(windowRemoveSpy).toHaveBeenCalledWith('resize', expect.any(Function))
  })

  it('does not re-check scroll position when unrelated challenge fields are unchanged', () => {
    const { result, rerender } = renderHook(() => useScrollIndicator())
    const { container } = makeViewport({ scrollHeight: 200, clientHeight: 100, scrollTop: 0 })

    act(() => {
      result.current.scrollAreaRef.current = container
    })
    // Rerender without changing description/blurb: effect should not re-run,
    // so hasMoreToScroll stays at its initial false value even though the
    // (now-attached) viewport would otherwise indicate more content.
    rerender()

    expect(result.current.hasMoreToScroll).toBe(false)
  })
})
