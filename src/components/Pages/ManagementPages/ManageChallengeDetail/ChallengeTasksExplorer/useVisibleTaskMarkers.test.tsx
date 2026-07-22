import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render } from '@/test/testUtils'
import type { TaskMarker } from '@/types/Task'
import { BATCH_SIZE } from './constants'
import { useVisibleTaskMarkers } from './useVisibleTaskMarkers'

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

const makeMarkers = (count: number): TaskMarker[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    location: { lng: 0, lat: 0 },
    status: 0,
    priority: 0,
  })) as TaskMarker[]

const Harness = ({
  markers,
  onResult,
}: {
  markers: TaskMarker[]
  onResult: (result: ReturnType<typeof useVisibleTaskMarkers>) => void
}) => {
  const result = useVisibleTaskMarkers(markers)
  onResult(result)
  return <div ref={result.sentinelRef} data-testid="sentinel" />
}

describe('useVisibleTaskMarkers', () => {
  beforeEach(() => {
    FakeIntersectionObserver.instances = []
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('reveals only the first batch of markers initially and reports hasMore', () => {
    let latest: ReturnType<typeof useVisibleTaskMarkers> | undefined
    const markers = makeMarkers(120)
    render(<Harness markers={markers} onResult={(r) => (latest = r)} />)

    expect(latest?.visibleMarkers).toHaveLength(BATCH_SIZE)
    expect(latest?.visibleMarkers[0].id).toBe(1)
    expect(latest?.hasMore).toBe(true)
  })

  it('shows all markers and reports no more when there are fewer than one batch', () => {
    let latest: ReturnType<typeof useVisibleTaskMarkers> | undefined
    const markers = makeMarkers(10)
    render(<Harness markers={markers} onResult={(r) => (latest = r)} />)

    expect(latest?.visibleMarkers).toHaveLength(10)
    expect(latest?.hasMore).toBe(false)
  })

  it('reveals another batch when the sentinel intersects and more markers remain', () => {
    let latest: ReturnType<typeof useVisibleTaskMarkers> | undefined
    const markers = makeMarkers(120)
    render(<Harness markers={markers} onResult={(r) => (latest = r)} />)

    act(() => latestObserver().callback([{ isIntersecting: true }]))

    expect(latest?.visibleMarkers).toHaveLength(BATCH_SIZE * 2)
    expect(latest?.hasMore).toBe(true)
  })

  it('caps visible markers at the total count instead of overshooting', () => {
    let latest: ReturnType<typeof useVisibleTaskMarkers> | undefined
    const markers = makeMarkers(120)
    render(<Harness markers={markers} onResult={(r) => (latest = r)} />)

    act(() => latestObserver().callback([{ isIntersecting: true }]))
    act(() => latestObserver().callback([{ isIntersecting: true }]))

    expect(latest?.visibleMarkers).toHaveLength(120)
    expect(latest?.hasMore).toBe(false)
  })

  it('does not grow past hasMore=false when the sentinel keeps intersecting', () => {
    let latest: ReturnType<typeof useVisibleTaskMarkers> | undefined
    const markers = makeMarkers(30)
    render(<Harness markers={markers} onResult={(r) => (latest = r)} />)

    expect(latest?.hasMore).toBe(false)
    act(() => latestObserver().callback([{ isIntersecting: true }]))

    expect(latest?.visibleMarkers).toHaveLength(30)
  })

  it('resets back to the first batch when the marker list changes (e.g. new filters applied)', () => {
    let latest: ReturnType<typeof useVisibleTaskMarkers> | undefined
    const markers = makeMarkers(120)
    const { rerender } = render(<Harness markers={markers} onResult={(r) => (latest = r)} />)

    act(() => latestObserver().callback([{ isIntersecting: true }]))
    expect(latest?.visibleMarkers).toHaveLength(BATCH_SIZE * 2)

    const filteredMarkers = makeMarkers(120).slice(0, 5)
    rerender(<Harness markers={filteredMarkers} onResult={(r) => (latest = r)} />)

    expect(latest?.visibleMarkers).toHaveLength(5)
    expect(latest?.hasMore).toBe(false)
  })

  it('disconnects the observer on unmount', () => {
    const markers = makeMarkers(120)
    const { unmount } = render(<Harness markers={markers} onResult={() => {}} />)

    const observer = latestObserver()
    unmount()

    expect(observer.disconnected).toBe(true)
  })
})
