import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render } from '@/test/testUtils'
import { useScrollToTopVisibility } from './useScrollToTopVisibility'

type FakeEntry = { isIntersecting: boolean }
type ObserverCallback = (entries: FakeEntry[]) => void

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = []
  callback: ObserverCallback
  observed: Element[] = []
  disconnected = false

  constructor(callback: ObserverCallback) {
    this.callback = callback
    FakeIntersectionObserver.instances.push(this)
  }

  observe(el: Element) {
    this.observed.push(el)
  }

  unobserve() {}

  disconnect() {
    this.disconnected = true
  }
}

const latestObserver = () =>
  FakeIntersectionObserver.instances[FakeIntersectionObserver.instances.length - 1]

const Harness = ({
  onResult,
}: {
  onResult: (result: ReturnType<typeof useScrollToTopVisibility>) => void
}) => {
  const result = useScrollToTopVisibility()
  onResult(result)
  return <div ref={result.topRef} data-testid="sentinel" />
}

describe('useScrollToTopVisibility', () => {
  beforeEach(() => {
    FakeIntersectionObserver.instances = []
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
    Element.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('starts with showScrollTop false and observes the attached sentinel element', () => {
    let latest: ReturnType<typeof useScrollToTopVisibility> | undefined
    render(<Harness onResult={(r) => (latest = r)} />)

    expect(latest?.showScrollTop).toBe(false)
    expect(latest?.topRef.current).not.toBeNull()
    expect(latestObserver().observed).toContain(latest?.topRef.current)
  })

  it('sets showScrollTop to true once the sentinel scrolls out of view', () => {
    let latest: ReturnType<typeof useScrollToTopVisibility> | undefined
    render(<Harness onResult={(r) => (latest = r)} />)

    act(() => latestObserver().callback([{ isIntersecting: false }]))

    expect(latest?.showScrollTop).toBe(true)
  })

  it('resets showScrollTop to false once the sentinel scrolls back into view', () => {
    let latest: ReturnType<typeof useScrollToTopVisibility> | undefined
    render(<Harness onResult={(r) => (latest = r)} />)

    act(() => latestObserver().callback([{ isIntersecting: false }]))
    expect(latest?.showScrollTop).toBe(true)

    act(() => latestObserver().callback([{ isIntersecting: true }]))
    expect(latest?.showScrollTop).toBe(false)
  })

  it('treats an empty entries array as "not intersecting" (defensive optional chaining)', () => {
    let latest: ReturnType<typeof useScrollToTopVisibility> | undefined
    render(<Harness onResult={(r) => (latest = r)} />)

    act(() => latestObserver().callback([]))

    expect(latest?.showScrollTop).toBe(true)
  })

  it('scrollToTop smoothly scrolls the sentinel back into view', () => {
    let latest: ReturnType<typeof useScrollToTopVisibility> | undefined
    render(<Harness onResult={(r) => (latest = r)} />)

    latest?.scrollToTop()

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    })
  })

  it('disconnects the observer on unmount', () => {
    let latest: ReturnType<typeof useScrollToTopVisibility> | undefined
    const { unmount } = render(<Harness onResult={(r) => (latest = r)} />)
    void latest

    const observer = latestObserver()
    unmount()

    expect(observer.disconnected).toBe(true)
  })
})
