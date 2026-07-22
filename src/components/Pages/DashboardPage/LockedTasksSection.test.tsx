import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { LockedTaskData } from '@/api/user/profile'
import { cleanup, render, screen } from '@/test/testUtils'
import type { User } from '@/types/User'
import { LockedTasksSection } from './LockedTasksSection'

interface LinkMockProps {
  to: string
  params?: Record<string, string>
  children?: ReactNode
  className?: string
  onClick?: (event: { stopPropagation: () => void }) => void
  title?: string
}

const { lockedTasksMock, useAuthContextMock } = vi.hoisted(() => ({
  lockedTasksMock: vi.fn(),
  useAuthContextMock: vi.fn(),
}))

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      user: {
        ...actual.api.user,
        lockedTasks: lockedTasksMock,
      },
    },
  }
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: useAuthContextMock,
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, params, children, className, onClick, title }: LinkMockProps) => {
    const href = params ? Object.values(params).reduce((p, v) => p.replace(/\$\w+/, v), to) : to
    return (
      <a href={href} className={className} onClick={onClick} title={title}>
        {children}
      </a>
    )
  },
}))

const regularUser = { grants: [] } as unknown as User
const superUser = { grants: [{ role: -1 }] } as unknown as User

const makeTask = (overrides: Partial<LockedTaskData> = {}): LockedTaskData =>
  ({
    id: 1,
    parent: 100,
    parentName: 'Test Challenge',
    startedAt: Date.now() - 60 * 1000,
    ...overrides,
  }) as LockedTaskData

afterEach(() => cleanup())

beforeEach(() => {
  vi.clearAllMocks()
  useAuthContextMock.mockReturnValue({ user: regularUser })
})

describe('LockedTasksSection', () => {
  it('shows a loader while locked tasks are loading', () => {
    lockedTasksMock.mockReturnValue({ data: undefined, isLoading: true, error: null })

    render(<LockedTasksSection userId={1} />)

    expect(screen.getByText('Loading...')).toBeDefined()
  })

  it('shows an error message when the request fails', () => {
    lockedTasksMock.mockReturnValue({ data: undefined, isLoading: false, error: new Error('x') })

    render(<LockedTasksSection userId={1} />)

    expect(screen.getByText('Failed to load')).toBeDefined()
  })

  it('shows an empty state when there are no locked tasks', () => {
    lockedTasksMock.mockReturnValue({ data: [], isLoading: false, error: null })

    render(<LockedTasksSection userId={1} />)

    expect(screen.getByText('No locked tasks')).toBeDefined()
    expect(screen.getByText('Start editing a task to lock it')).toBeDefined()
  })

  it('renders each locked task with its id, count badge, and challenge name', () => {
    lockedTasksMock.mockReturnValue({
      data: [makeTask({ id: 42, parentName: 'Roads Challenge' }), makeTask({ id: 43 })],
      isLoading: false,
      error: null,
    })

    render(<LockedTasksSection userId={1} />)

    expect(screen.getByText('2')).toBeDefined()
    expect(screen.getByText('Task #42')).toBeDefined()
    expect(screen.getByText('Roads Challenge')).toBeDefined()
    expect(screen.getByText('Task #43')).toBeDefined()
  })

  it('links each task to its task detail page', () => {
    lockedTasksMock.mockReturnValue({
      data: [makeTask({ id: 42 })],
      isLoading: false,
      error: null,
    })

    render(<LockedTasksSection userId={1} />)

    const links = screen.getAllByRole('link')
    expect(links[0].getAttribute('href')).toBe('/tasks/42')
  })

  it('does not show a manage icon for a regular (non-super) user', () => {
    useAuthContextMock.mockReturnValue({ user: regularUser })
    lockedTasksMock.mockReturnValue({
      data: [makeTask({ id: 42 })],
      isLoading: false,
      error: null,
    })

    render(<LockedTasksSection userId={1} />)

    expect(screen.queryByTitle('Manage task')).toBeNull()
  })

  it('shows a manage icon linking to the manage task page for a super user', () => {
    useAuthContextMock.mockReturnValue({ user: superUser })
    lockedTasksMock.mockReturnValue({
      data: [makeTask({ id: 42 })],
      isLoading: false,
      error: null,
    })

    render(<LockedTasksSection userId={1} />)

    const manageLink = screen.getByTitle('Manage task')
    expect(manageLink.getAttribute('href')).toBe('/manage/task/42')
  })
})
