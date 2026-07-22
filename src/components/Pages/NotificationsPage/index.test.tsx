import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { Notification } from '@/types/Notification'
import { NotificationType } from '@/types/Notification'
import { NotificationsPage } from './index'

type SearchState = Record<string, unknown>

const {
  useAuthContextMock,
  useNotificationsContextMock,
  getTaskCommentsMock,
  useAddTaskCommentMock,
  searchRef,
  navigateMock,
} = vi.hoisted(() => ({
  useAuthContextMock: vi.fn(),
  useNotificationsContextMock: vi.fn(),
  getTaskCommentsMock: vi.fn(),
  useAddTaskCommentMock: vi.fn(),
  searchRef: { current: {} as SearchState },
  navigateMock: vi.fn(),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: useAuthContextMock,
}))

vi.mock('@/contexts/NotificationsContext', () => ({
  useNotificationsContext: useNotificationsContextMock,
}))

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      task: {
        ...actual.api.task,
        getTaskComments: getTaskCommentsMock,
        useAddTaskComment: useAddTaskCommentMock,
      },
    },
  }
})

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
  useSearch: () => searchRef.current,
  Link: ({
    children,
    to,
    params,
    onClick,
    ...props
  }: {
    children: ReactNode
    to: string
    params?: Record<string, string>
    onClick?: (e: React.MouseEvent) => void
  } & Record<string, unknown>) => (
    <a
      href={`${to}${params ? `/${Object.values(params).join('/')}` : ''}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </a>
  ),
}))

function makeNotification(props: Partial<Notification> = {}): Notification {
  return {
    id: 1,
    notificationType: NotificationType.MENTION,
    isRead: false,
    created: '2024-01-01T00:00:00.000Z',
    fromUsername: 'alice',
    ...props,
  } as Notification
}

const baseNotificationsContext = (overrides: Record<string, unknown> = {}) => ({
  isLoading: false,
  notifications: [] as Notification[],
  refetch: vi.fn(),
  markAsRead: vi.fn(),
  markAsUnread: vi.fn(),
  deleteNotification: vi.fn(),
  markAllAsRead: vi.fn(),
  markAllAsUnread: vi.fn(),
  markingReadId: null,
  markingUnreadId: null,
  deletingId: null,
  openNotificationThread: null,
  openThread: vi.fn(),
  closeThread: vi.fn(),
  ...overrides,
})

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  searchRef.current = {}
  navigateMock.mockImplementation(
    (opts: { search: SearchState | ((p: SearchState) => SearchState) }) => {
      searchRef.current =
        typeof opts.search === 'function' ? opts.search(searchRef.current) : opts.search
    }
  )
  getTaskCommentsMock.mockReturnValue({ data: [], isLoading: false })
  useAddTaskCommentMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false })
  useNotificationsContextMock.mockReturnValue(baseNotificationsContext())
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('NotificationsPage', () => {
  it('shows a sign-in prompt instead of notifications when the user is not authenticated', () => {
    useAuthContextMock.mockReturnValue({ user: null, login: vi.fn() })
    render(<NotificationsPage />)

    expect(screen.getByText('Please sign in')).toBeDefined()
    expect(screen.queryByText('Notifications')).toBeNull()
  })

  it('renders the notifications page with an empty state for an authenticated user with no notifications', () => {
    useAuthContextMock.mockReturnValue({ user: { id: 1 }, login: vi.fn() })
    render(<NotificationsPage />)

    expect(screen.getByText('Notifications')).toBeDefined()
    expect(screen.getByText("You're all up to date")).toBeDefined()
  })

  it('renders real notifications through the real page provider and lets the user select one', async () => {
    const user = userEvent.setup()
    useAuthContextMock.mockReturnValue({ user: { id: 1 }, login: vi.fn() })
    useNotificationsContextMock.mockReturnValue(
      baseNotificationsContext({
        notifications: [
          makeNotification({ id: 1, description: 'First notification', isRead: false }),
          makeNotification({ id: 2, description: 'Second notification', isRead: false }),
        ],
      })
    )
    render(<NotificationsPage />)

    expect(screen.getByText('First notification')).toBeDefined()
    expect(screen.getByText('Second notification')).toBeDefined()
    expect(screen.getByText('Select all')).toBeDefined()

    const checkboxes = screen.getAllByRole('checkbox')
    // Checkbox order: "Group by Task", "select all", then one per notification.
    await user.click(checkboxes[2])

    expect(await screen.findByText('1 of 2 selected')).toBeDefined()
  })
})
