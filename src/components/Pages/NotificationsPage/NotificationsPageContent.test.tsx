import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { Notification } from '@/types/Notification'
import { NotificationType } from '@/types/Notification'
import { NotificationsPageContent } from './NotificationsPageContent'

type SearchState = { notificationId?: number }

const {
  useNotificationsContextMock,
  useNotificationsPageContextMock,
  useAuthContextMock,
  getTaskCommentsMock,
  useAddTaskCommentMock,
  searchRef,
} = vi.hoisted(() => ({
  useNotificationsContextMock: vi.fn(),
  useNotificationsPageContextMock: vi.fn(),
  useAuthContextMock: vi.fn(),
  getTaskCommentsMock: vi.fn(),
  useAddTaskCommentMock: vi.fn(),
  searchRef: { current: {} as SearchState },
}))

vi.mock('@/contexts/NotificationsContext', () => ({
  useNotificationsContext: useNotificationsContextMock,
}))

vi.mock('@/contexts/NotificationsPageContext', () => ({
  useNotificationsPageContext: useNotificationsPageContextMock,
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: useAuthContextMock,
}))

// NotificationsPageContent always renders NotificationThreadDialog, which calls these
// react-query-backed API hooks unconditionally — stub them so no QueryClientProvider is needed.
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

const setGroupByTask = vi.fn()
const setActiveTab = vi.fn()
const onSelectChange = vi.fn()

const basePageContext = (overrides: Record<string, unknown> = {}) => ({
  activeTab: 'unread',
  setActiveTab,
  groupByTask: false,
  setGroupByTask,
  displayNotifications: [] as Notification[],
  selectedNotificationIds: new Set<number>(),
  onSelectChange,
  handleSelectAll: vi.fn(),
  allSelected: false,
  someSelected: false,
  allSelectedAreRead: false,
  handleMarkSelectedAsRead: vi.fn(),
  handleMarkSelectedAsUnread: vi.fn(),
  isMarkingSelected: false,
  filteredUnreadCount: 0,
  filteredAllCount: 0,
  filteredNotifications: [] as Notification[],
  filters: {
    category: 'all',
    setCategory: vi.fn(),
    status: 'all',
    setStatus: vi.fn(),
    filterTask: 'all',
    setFilterTask: vi.fn(),
    filterType: 'all',
    setFilterType: vi.fn(),
    filterFrom: 'all',
    setFilterFrom: vi.fn(),
    filterChallenge: 'all',
    setFilterChallenge: vi.fn(),
    hasActiveFilters: false,
    clearFilters: vi.fn(),
    filterOptions: { tasks: [], types: [], fromUsers: [], challenges: [] },
    categoryCounts: {
      all: 0,
      task_comment: 0,
      mention: 0,
      review: 0,
      challenge: 0,
      team: 0,
      system: 0,
    },
    statusCounts: { all: 0, unread: 0, read: 0 },
    currentState: {},
    applyFilterState: vi.fn(),
  },
  ...overrides,
})

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
  searchRef.current = {}
  useNotificationsPageContextMock.mockReturnValue(basePageContext())
  useNotificationsContextMock.mockReturnValue(baseNotificationsContext())
  useAuthContextMock.mockReturnValue({ user: null })
  getTaskCommentsMock.mockReturnValue({ data: [], isLoading: false })
  useAddTaskCommentMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false })
})

afterEach(() => cleanup())

describe('NotificationsPageContent', () => {
  it('shows a loading message while notifications are loading', () => {
    useNotificationsContextMock.mockReturnValue(baseNotificationsContext({ isLoading: true }))
    render(<NotificationsPageContent />)

    expect(screen.getByText('Loading notifications...')).toBeDefined()
  })

  it('shows the unread empty state on the unread tab with no results', () => {
    render(<NotificationsPageContent />)

    expect(screen.getByText("You're all up to date")).toBeDefined()
    expect(screen.getByText('You have no unread notifications at the moment.')).toBeDefined()
  })

  it('shows the general empty state on the all tab with no results', () => {
    useNotificationsPageContextMock.mockReturnValue(basePageContext({ activeTab: 'all' }))
    render(<NotificationsPageContent />)

    expect(screen.getByText('You have no notifications.')).toBeDefined()
  })

  it('renders a list item per displayed notification and the select-all control', () => {
    useNotificationsPageContextMock.mockReturnValue(
      basePageContext({
        displayNotifications: [
          makeNotification({ id: 1, description: 'First one' }),
          makeNotification({ id: 2, description: 'Second one' }),
        ],
      })
    )
    render(<NotificationsPageContent />)

    expect(screen.getByText('First one')).toBeDefined()
    expect(screen.getByText('Second one')).toBeDefined()
    expect(screen.getByText('Select all')).toBeDefined()
  })

  it('checking a notification checkbox calls onSelectChange with its id', async () => {
    const user = userEvent.setup()
    const notification = makeNotification({ id: 9 })
    useNotificationsPageContextMock.mockReturnValue(
      basePageContext({ displayNotifications: [notification] })
    )
    render(<NotificationsPageContent />)

    // Checkbox order: "Group by Task", "select all", then the notification's own checkbox.
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[2])

    expect(onSelectChange).toHaveBeenCalledWith(9, true, undefined)
  })

  it('toggling "Group by Task" calls setGroupByTask and shows a hint only while grouping', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<NotificationsPageContent />)
    expect(screen.queryByText(/grouped together/i)).toBeNull()

    await user.click(screen.getByRole('checkbox', { name: 'Group by Task' }))
    expect(setGroupByTask).toHaveBeenCalledWith(true)

    useNotificationsPageContextMock.mockReturnValue(basePageContext({ groupByTask: true }))
    rerender(<NotificationsPageContent />)
    expect(screen.getByText(/grouped together/i)).toBeDefined()
  })

  it('switches to the matching tab when a deep-linked notification is on a different tab', () => {
    searchRef.current = { notificationId: 5 }
    useNotificationsContextMock.mockReturnValue(
      baseNotificationsContext({
        notifications: [makeNotification({ id: 5, isRead: true })],
      })
    )
    useNotificationsPageContextMock.mockReturnValue(basePageContext({ activeTab: 'unread' }))
    render(<NotificationsPageContent />)

    expect(setActiveTab).toHaveBeenCalledWith('all')
  })
})
