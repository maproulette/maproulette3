import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from '@/test/testUtils'
import type { TaskMarker } from '@/types/Task'
import { ChallengeTasksExplorerMapPanel } from './ChallengeTasksExplorerMapPanel'

const { useExplorerContextMock, miniChallengeMapMock } = vi.hoisted(() => ({
  useExplorerContextMock: vi.fn(),
  miniChallengeMapMock: vi.fn(),
}))

vi.mock('./ChallengeTasksExplorerContext', () => ({
  useExplorerContext: useExplorerContextMock,
}))

vi.mock('../MiniChallengeMap', () => ({
  MiniChallengeMap: (props: unknown) => {
    miniChallengeMapMock(props)
    return <div data-testid="mini-challenge-map" />
  },
}))

const marker = (id: number): TaskMarker =>
  ({ id, status: 0, priority: 0, location: { lng: 0, lat: 0 } }) as TaskMarker

afterEach(() => cleanup())
beforeEach(() => vi.clearAllMocks())

describe('ChallengeTasksExplorerMapPanel', () => {
  it('passes the status/priority-filtered mapMarkers (not the fully filtered set) through to the map', () => {
    const mapMarkers = [marker(1), marker(2)]
    useExplorerContextMock.mockReturnValue({
      mapMarkers,
      isLoading: false,
      setViewportBounds: vi.fn(),
      selectedTask: null,
      setSelectedTask: vi.fn(),
    })

    render(<ChallengeTasksExplorerMapPanel />)

    expect(miniChallengeMapMock).toHaveBeenCalledTimes(1)
    const props = miniChallengeMapMock.mock.calls[0][0]
    expect(props.markers).toBe(mapMarkers)
    expect(props.isLoading).toBe(false)
  })

  it('forwards isLoading, selectedTask and the bounds/selection callbacks from context', () => {
    const setViewportBounds = vi.fn()
    const setSelectedTask = vi.fn()
    const selectedTask = marker(9)
    useExplorerContextMock.mockReturnValue({
      mapMarkers: [],
      isLoading: true,
      setViewportBounds,
      selectedTask,
      setSelectedTask,
    })

    render(<ChallengeTasksExplorerMapPanel />)

    const props = miniChallengeMapMock.mock.calls[0][0]
    expect(props.isLoading).toBe(true)
    expect(props.selectedTask).toBe(selectedTask)
    expect(props.onBoundsStringChange).toBe(setViewportBounds)
    expect(props.onSelectTask).toBe(setSelectedTask)
  })
})
