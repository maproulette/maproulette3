import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen } from '@/test/testUtils'
import type { TaskMarker } from '@/types/Task'
import { ChallengeTasksExplorerMain } from './ChallengeTasksExplorerMain'

const { useExplorerContextMock, useVisibleTaskMarkersMock, useScrollToTopVisibilityMock } =
  vi.hoisted(() => ({
    useExplorerContextMock: vi.fn(),
    useVisibleTaskMarkersMock: vi.fn(),
    useScrollToTopVisibilityMock: vi.fn(),
  }))

vi.mock('./ChallengeTasksExplorerContext', () => ({
  useExplorerContext: useExplorerContextMock,
}))

vi.mock('./useVisibleTaskMarkers', () => ({
  useVisibleTaskMarkers: useVisibleTaskMarkersMock,
}))

vi.mock('./useScrollToTopVisibility', () => ({
  useScrollToTopVisibility: useScrollToTopVisibilityMock,
}))

vi.mock('./ChallengeTasksExplorerMapPanel', () => ({
  ChallengeTasksExplorerMapPanel: () => <div data-testid="map-panel" />,
}))

vi.mock('./ChallengeTasksExplorerControls', () => ({
  ChallengeTasksExplorerControls: ({ countLabel }: { countLabel: string }) => (
    <div data-testid="controls">{countLabel}</div>
  ),
}))

vi.mock('./ChallengeTasksExplorerTaskTable', () => ({
  ChallengeTasksExplorerTaskTable: () => <div data-testid="task-table" />,
}))

const marker = (id: number): TaskMarker =>
  ({ id, status: 0, priority: 0, location: { lng: 0, lat: 0 } }) as TaskMarker

interface SetupHooksOptions {
  enabled?: boolean
  filteredMarkers?: TaskMarker[]
  isLoading?: boolean
  visibleMarkers?: TaskMarker[]
  hasMore?: boolean
  showScrollTop?: boolean
  scrollToTop?: () => void
}

const setupHooks = ({
  enabled = true,
  filteredMarkers = [],
  isLoading = false,
  visibleMarkers = filteredMarkers,
  hasMore = false,
  showScrollTop = false,
  scrollToTop = vi.fn(),
}: SetupHooksOptions = {}) => {
  useExplorerContextMock.mockReturnValue({ enabled, filteredMarkers, isLoading })
  useVisibleTaskMarkersMock.mockReturnValue({
    visibleMarkers,
    hasMore,
    sentinelRef: { current: null },
  })
  useScrollToTopVisibilityMock.mockReturnValue({
    topRef: { current: null },
    showScrollTop,
    scrollToTop,
  })
  return { scrollToTop }
}

afterEach(() => cleanup())
beforeEach(() => vi.clearAllMocks())

describe('ChallengeTasksExplorerMain', () => {
  it('renders nothing when the explorer is not enabled', () => {
    setupHooks({ enabled: false })
    const { container } = render(<ChallengeTasksExplorerMain />)

    expect(container.innerHTML).toBe('')
  })

  it('renders the map panel and task table when enabled', () => {
    setupHooks({ enabled: true })
    render(<ChallengeTasksExplorerMain />)

    expect(screen.getByTestId('map-panel')).toBeDefined()
    expect(screen.getByTestId('task-table')).toBeDefined()
  })

  it('shows a loading label in the controls while tasks are loading', () => {
    setupHooks({ enabled: true, isLoading: true })
    render(<ChallengeTasksExplorerMain />)

    expect(screen.getByTestId('controls').textContent).toBe('Loading tasks…')
  })

  it('shows a "Showing X of Y" count label once loaded', () => {
    setupHooks({
      enabled: true,
      isLoading: false,
      filteredMarkers: [marker(1), marker(2), marker(3)],
      visibleMarkers: [marker(1), marker(2)],
    })
    render(<ChallengeTasksExplorerMain />)

    expect(screen.getByTestId('controls').textContent).toBe('Showing 2 of 3 tasks')
  })

  it('does not render the scroll-to-top button when showScrollTop is false', () => {
    setupHooks({ enabled: true, showScrollTop: false })
    render(<ChallengeTasksExplorerMain />)

    expect(screen.queryByRole('button', { name: 'Scroll to top' })).toBeNull()
  })

  it('renders the scroll-to-top button when showScrollTop is true, and clicking it calls scrollToTop', async () => {
    const user = userEvent.setup()
    const { scrollToTop } = setupHooks({ enabled: true, showScrollTop: true })
    render(<ChallengeTasksExplorerMain />)

    const button = screen.getByRole('button', { name: 'Scroll to top' })
    expect(button).toBeDefined()

    await act(() => user.click(button))

    expect(scrollToTop).toHaveBeenCalledTimes(1)
  })
})
