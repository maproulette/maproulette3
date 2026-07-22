import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render, renderHook } from '@/test/testUtils'
import type { ChallengeTaskMarkersResponse } from '@/types/Challenge'
import type { TaskMarker } from '@/types/Task'
import {
  ChallengeTasksExplorerProvider,
  useExplorerContext,
} from './ChallengeTasksExplorerContext'

const { getChallengeTaskMarkersMock } = vi.hoisted(() => ({
  getChallengeTaskMarkersMock: vi.fn(),
}))

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      challenge: {
        ...actual.api.challenge,
        getChallengeTaskMarkers: getChallengeTaskMarkersMock,
      },
    },
  }
})

const marker = (id: number, status: number, priority: number, lng = 0, lat = 0): TaskMarker =>
  ({
    id,
    status,
    priority,
    location: { lng, lat },
  }) as TaskMarker

const markersFixture: TaskMarker[] = [
  marker(1, 0, 0, -10, -10),
  marker(2, 1, 1, 10, 10),
  marker(3, 2, 2, 50, 50),
]

const setApiData = (markers: TaskMarker[], isLoading = false) => {
  getChallengeTaskMarkersMock.mockReturnValue({
    data: { markers, overlaps: [] } as unknown as ChallengeTaskMarkersResponse,
    isLoading,
  })
}

const wrapper = ({ children }: { children: ReactNode }) => (
  <ChallengeTasksExplorerProvider challengeId={42} enabled={true}>
    {children}
  </ChallengeTasksExplorerProvider>
)

beforeEach(() => {
  vi.clearAllMocks()
  setApiData(markersFixture)
})

afterEach(() => cleanup())

describe('ChallengeTasksExplorerProvider / useExplorerContext', () => {
  it('throws when used outside of the provider', () => {
    expect(() => renderHook(() => useExplorerContext())).toThrow(
      'Challenge tasks explorer components must be used within the provider'
    )
  })

  it('exposes the challengeId, enabled flag, and processed markers from the API', () => {
    const { result } = renderHook(() => useExplorerContext(), { wrapper })

    expect(result.current.challengeId).toBe(42)
    expect(result.current.enabled).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.markers).toHaveLength(3)
    expect(result.current.markers.map((m) => m.id)).toEqual([1, 2, 3])
  })

  it('defaults every status/priority filter to enabled and reports filters as not dirty', () => {
    const { result } = renderHook(() => useExplorerContext(), { wrapper })

    for (const s of [0, 1, 2, 3, 4, 5, 6, 9]) {
      expect(result.current.statusEnabled[s]).toBe(true)
    }
    for (const p of [0, 1, 2]) {
      expect(result.current.priorityEnabled[p]).toBe(true)
    }
    expect(result.current.filtersDirty).toBe(false)
    expect(result.current.sortField).toBe('id')
    expect(result.current.sortDesc).toBe(true)
  })

  it('mapMarkers excludes markers whose status has been unchecked', () => {
    const { result } = renderHook(() => useExplorerContext(), { wrapper })

    act(() => result.current.setStatusChecked(1, false))

    expect(result.current.mapMarkers.map((m) => m.id)).toEqual([1, 3])
    expect(result.current.filtersDirty).toBe(true)
  })

  it('mapMarkers excludes markers whose priority has been unchecked', () => {
    const { result } = renderHook(() => useExplorerContext(), { wrapper })

    act(() => result.current.setPriorityChecked(2, false))

    expect(result.current.mapMarkers.map((m) => m.id)).toEqual([1, 2])
  })

  it('refuses to uncheck the last remaining enabled status filter', () => {
    const { result } = renderHook(() => useExplorerContext(), { wrapper })

    act(() => {
      for (const s of [1, 2, 3, 4, 5, 6, 9]) {
        result.current.setStatusChecked(s, false)
      }
    })
    // one status (0) remains enabled
    expect(Object.values(result.current.statusEnabled).filter(Boolean)).toHaveLength(1)
    expect(result.current.statusEnabled[0]).toBe(true)

    act(() => result.current.setStatusChecked(0, false))

    // still enabled: the last-on filter cannot be turned off
    expect(result.current.statusEnabled[0]).toBe(true)
  })

  it('refuses to uncheck the last remaining enabled priority filter', () => {
    const { result } = renderHook(() => useExplorerContext(), { wrapper })

    act(() => {
      result.current.setPriorityChecked(1, false)
      result.current.setPriorityChecked(2, false)
    })
    expect(result.current.priorityEnabled[0]).toBe(true)

    act(() => result.current.setPriorityChecked(0, false))

    expect(result.current.priorityEnabled[0]).toBe(true)
  })

  it('filteredMarkers only includes markers within the current viewport bounds', () => {
    const { result } = renderHook(() => useExplorerContext(), { wrapper })

    act(() => result.current.setViewportBounds('-20,-20,20,20'))

    // default sort is by id descending
    expect(result.current.filteredMarkers.map((m) => m.id)).toEqual([2, 1])
  })

  it('ignores an unparsable viewport bounds string and keeps showing every mapMarker', () => {
    const { result } = renderHook(() => useExplorerContext(), { wrapper })

    act(() => result.current.setViewportBounds('not-a-valid-bounds-string'))

    expect(result.current.filteredMarkers.map((m) => m.id)).toEqual([3, 2, 1])
  })

  it('sorts filteredMarkers by id descending by default', () => {
    const { result } = renderHook(() => useExplorerContext(), { wrapper })

    expect(result.current.filteredMarkers.map((m) => m.id)).toEqual([3, 2, 1])
  })

  it('sorts filteredMarkers ascending when sortDesc is toggled off', () => {
    const { result } = renderHook(() => useExplorerContext(), { wrapper })

    act(() => result.current.setSortDesc(false))

    expect(result.current.filteredMarkers.map((m) => m.id)).toEqual([1, 2, 3])
  })

  it('sorts filteredMarkers by status field', () => {
    const { result } = renderHook(() => useExplorerContext(), { wrapper })

    act(() => {
      result.current.setSortField('status')
      result.current.setSortDesc(false)
    })

    expect(result.current.filteredMarkers.map((m) => m.status)).toEqual([0, 1, 2])
  })

  it('sorts filteredMarkers by priority field', () => {
    const { result } = renderHook(() => useExplorerContext(), { wrapper })

    act(() => {
      result.current.setSortField('priority')
      result.current.setSortDesc(true)
    })

    expect(result.current.filteredMarkers.map((m) => m.priority)).toEqual([2, 1, 0])
  })

  it('clearFilters resets status/priority filters and sort back to defaults', () => {
    const { result } = renderHook(() => useExplorerContext(), { wrapper })

    act(() => {
      result.current.setStatusChecked(1, false)
      result.current.setPriorityChecked(2, false)
      result.current.setSortField('priority')
      result.current.setSortDesc(false)
    })
    expect(result.current.filtersDirty).toBe(true)

    act(() => result.current.clearFilters())

    expect(result.current.filtersDirty).toBe(false)
    expect(result.current.sortField).toBe('id')
    expect(result.current.sortDesc).toBe(true)
    expect(result.current.statusEnabled[1]).toBe(true)
    expect(result.current.priorityEnabled[2]).toBe(true)
  })

  it('tracks the selected task via setSelectedTask', () => {
    const { result } = renderHook(() => useExplorerContext(), { wrapper })

    expect(result.current.selectedTask).toBeNull()

    act(() => result.current.setSelectedTask(markersFixture[0]))
    expect(result.current.selectedTask?.id).toBe(1)

    act(() => result.current.setSelectedTask(null))
    expect(result.current.selectedTask).toBeNull()
  })

  it('excludes markers without a location from the viewport-bounds filter', () => {
    const markerWithoutLocation = { id: 4, status: 0, priority: 0 } as unknown as TaskMarker
    setApiData([...markersFixture, markerWithoutLocation])
    const { result } = renderHook(() => useExplorerContext(), { wrapper })

    act(() => result.current.setViewportBounds('-180,-85,180,85'))

    expect(result.current.filteredMarkers.map((m) => m.id)).not.toContain(4)
  })

  it('reflects isLoading from the underlying query', () => {
    setApiData([], true)
    const { result } = renderHook(() => useExplorerContext(), { wrapper })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.markers).toEqual([])
  })

  it('a consumer component can read context values via useExplorerContext', () => {
    const Consumer = () => {
      const { markers, enabled } = useExplorerContext()
      return (
        <div>
          <span data-testid="count">{markers.length}</span>
          <span data-testid="enabled">{String(enabled)}</span>
        </div>
      )
    }

    const { getByTestId } = render(
      <ChallengeTasksExplorerProvider challengeId={7} enabled={false}>
        <Consumer />
      </ChallengeTasksExplorerProvider>
    )

    expect(getByTestId('count').textContent).toBe('3')
    expect(getByTestId('enabled').textContent).toBe('false')
  })
})
