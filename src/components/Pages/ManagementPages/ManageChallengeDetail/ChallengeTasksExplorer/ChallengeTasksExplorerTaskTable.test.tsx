import userEvent from '@testing-library/user-event'
import type { RefObject } from 'react'
import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { TaskMarker } from '@/types/Task'
import { ChallengeTasksExplorerTaskTable } from './ChallengeTasksExplorerTaskTable'

const { useExplorerContextMock } = vi.hoisted(() => ({
  useExplorerContextMock: vi.fn(),
}))

vi.mock('./ChallengeTasksExplorerContext', () => ({
  useExplorerContext: useExplorerContextMock,
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    params,
    children,
  }: {
    to: string
    params?: Record<string, string>
    children: React.ReactNode
  }) => (
    <a href={`${to}${params ? `:${JSON.stringify(params)}` : ''}`} data-testid="router-link">
      {children}
    </a>
  ),
}))

const marker = (id: number, status: number, priority: number, bundleId?: number): TaskMarker =>
  ({
    id,
    status,
    priority,
    bundleId: bundleId ?? null,
    location: { lng: 0, lat: 0 },
  }) as TaskMarker

const setContext = (selectedTask: TaskMarker | null = null, setSelectedTask = vi.fn()) => {
  useExplorerContextMock.mockReturnValue({ selectedTask, setSelectedTask })
  return setSelectedTask
}

afterEach(() => cleanup())
beforeEach(() => vi.clearAllMocks())

describe('ChallengeTasksExplorerTaskTable', () => {
  it('shows an empty-state message when there are no visible markers', () => {
    setContext()
    render(
      <ChallengeTasksExplorerTaskTable
        visibleMarkers={[]}
        hasMore={false}
        sentinelRef={createRef() as RefObject<HTMLDivElement | null>}
      />
    )

    expect(screen.getByText('No tasks match the current filters.')).toBeDefined()
  })

  it('renders a row per visible marker with status/priority labels and bundle id', () => {
    setContext()
    render(
      <ChallengeTasksExplorerTaskTable
        visibleMarkers={[marker(101, 1, 0, 55), marker(102, 0, 2)]}
        hasMore={false}
        sentinelRef={createRef() as RefObject<HTMLDivElement | null>}
      />
    )

    expect(screen.getByText('101')).toBeDefined()
    expect(screen.getByText('Fixed')).toBeDefined()
    expect(screen.getByText('High')).toBeDefined()
    expect(screen.getByText('55')).toBeDefined()

    expect(screen.getByText('102')).toBeDefined()
    expect(screen.getByText('Created')).toBeDefined()
    expect(screen.getByText('Low')).toBeDefined()
    expect(screen.getByText('—')).toBeDefined()
  })

  it('renders view/edit links for each marker pointing at the task management routes', () => {
    setContext()
    render(
      <ChallengeTasksExplorerTaskTable
        visibleMarkers={[marker(7, 0, 0)]}
        hasMore={false}
        sentinelRef={createRef() as RefObject<HTMLDivElement | null>}
      />
    )

    const links = screen.getAllByTestId('router-link')
    expect(links.some((l) => l.getAttribute('href')?.includes('/manage/task/$taskId/edit'))).toBe(
      true
    )
    expect(
      links.some(
        (l) =>
          l.getAttribute('href')?.includes('/manage/task/$taskId') &&
          !l.getAttribute('href')?.includes('edit')
      )
    ).toBe(true)
  })

  it('clicking the select circle selects the task', async () => {
    const user = userEvent.setup()
    const setSelectedTask = setContext(null)
    render(
      <ChallengeTasksExplorerTaskTable
        visibleMarkers={[marker(7, 0, 0)]}
        hasMore={false}
        sentinelRef={createRef() as RefObject<HTMLDivElement | null>}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Select task' }))

    expect(setSelectedTask).toHaveBeenCalledWith(expect.objectContaining({ id: 7 }))
  })

  it('clicking the select circle on the already-selected task deselects it', async () => {
    const user = userEvent.setup()
    const task = marker(7, 0, 0)
    const setSelectedTask = setContext(task)
    render(
      <ChallengeTasksExplorerTaskTable
        visibleMarkers={[task]}
        hasMore={false}
        sentinelRef={createRef() as RefObject<HTMLDivElement | null>}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Deselect task' }))

    expect(setSelectedTask).toHaveBeenCalledWith(null)
  })

  it('renders the infinite-scroll sentinel only when hasMore is true', () => {
    setContext()
    const ref = createRef() as RefObject<HTMLDivElement | null>
    const { rerender, container } = render(
      <ChallengeTasksExplorerTaskTable visibleMarkers={[]} hasMore={false} sentinelRef={ref} />
    )
    expect(ref.current).toBeNull()

    rerender(
      <ChallengeTasksExplorerTaskTable visibleMarkers={[]} hasMore={true} sentinelRef={ref} />
    )
    expect(ref.current).not.toBeNull()
    expect(container.contains(ref.current)).toBe(true)
  })

  it('falls back to a numeric status/priority label for unknown values', () => {
    setContext()
    render(
      <ChallengeTasksExplorerTaskTable
        visibleMarkers={[marker(9, 42, 42)]}
        hasMore={false}
        sentinelRef={createRef() as RefObject<HTMLDivElement | null>}
      />
    )

    expect(screen.getByText('Status 42')).toBeDefined()
    expect(screen.getByText('42')).toBeDefined()
  })
})
