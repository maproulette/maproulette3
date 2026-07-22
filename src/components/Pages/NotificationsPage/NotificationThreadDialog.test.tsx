import { QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { IntlProvider } from '@/i18n'
import { createTestQueryClient } from '@/test/queryClient'
import { cleanup, render, screen } from '@/test/testUtils'
import type { Notification } from '@/types/Notification'
import { NotificationType } from '@/types/Notification'
import { NotificationThreadDialog } from './NotificationThreadDialog'

// Rendering the dialog with a taskId mounts the real CommentComposer, whose mention
// input calls a react-query hook (api.user.findUsers) — it needs a real QueryClient.
const renderWithQueryClient = (ui: React.ReactElement) => {
  const client = createTestQueryClient()
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <IntlProvider>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </IntlProvider>
  )
  return render(ui, { wrapper: Wrapper })
}

const {
  useNotificationsContextMock,
  useAuthContextMock,
  getTaskCommentsMock,
  addCommentMutateAsync,
  useAddTaskCommentMock,
} = vi.hoisted(() => ({
  useNotificationsContextMock: vi.fn(),
  useAuthContextMock: vi.fn(),
  getTaskCommentsMock: vi.fn(),
  addCommentMutateAsync: vi.fn(),
  useAddTaskCommentMock: vi.fn(),
}))

vi.mock('@/contexts/NotificationsContext', () => ({
  useNotificationsContext: useNotificationsContextMock,
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: useAuthContextMock,
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

const closeThread = vi.fn()
const markAllAsRead = vi.fn()

const setupNotificationsContext = (thread: Notification[] | null) => {
  useNotificationsContextMock.mockReturnValue({
    openNotificationThread: thread,
    closeThread,
    markAllAsRead,
    markAsRead: vi.fn(),
    markAsUnread: vi.fn(),
    deleteNotification: vi.fn(),
    markingReadId: null,
    markingUnreadId: null,
    deletingId: null,
    openThread: vi.fn(),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  useAuthContextMock.mockReturnValue({ user: { id: 1, osmProfile: { displayName: 'me' } } })
  getTaskCommentsMock.mockReturnValue({ data: [], isLoading: false })
  useAddTaskCommentMock.mockReturnValue({
    mutateAsync: addCommentMutateAsync,
    isPending: false,
  })
  setupNotificationsContext(null)
})

afterEach(() => cleanup())

describe('NotificationThreadDialog', () => {
  it('renders nothing (dialog closed) when there is no open thread', () => {
    render(<NotificationThreadDialog />)

    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('shows a generic title for a single notification with no task', () => {
    setupNotificationsContext([makeNotification({ description: 'Hello there' })])
    render(<NotificationThreadDialog />)

    expect(screen.getByRole('dialog')).toBeDefined()
    expect(screen.getByText('Notification')).toBeDefined()
    expect(screen.getByText('Hello there')).toBeDefined()
  })

  it('shows a count title and every item when the thread has multiple notifications', () => {
    setupNotificationsContext([
      makeNotification({ id: 1, description: 'First' }),
      makeNotification({ id: 2, description: 'Second' }),
    ])
    render(<NotificationThreadDialog />)

    expect(screen.getByText('2 notifications')).toBeDefined()
    expect(screen.getByText('First')).toBeDefined()
    expect(screen.getByText('Second')).toBeDefined()
  })

  it('shows the task-scoped title, comments section, and an "Open task" link when taskId is present', () => {
    setupNotificationsContext([makeNotification({ taskId: 55 })])
    getTaskCommentsMock.mockReturnValue({
      data: [
        {
          id: 1,
          comment: 'Nice work',
          osm_username: 'bob',
          created: '2024-01-01T00:00:00.000Z',
        },
      ],
      isLoading: false,
    })
    renderWithQueryClient(<NotificationThreadDialog />)

    expect(screen.getByText('Notification for Task #55')).toBeDefined()
    expect(screen.getByText('Comments on this task')).toBeDefined()
    const openTaskLink = screen.getByRole('link', { name: /Open task/ })
    expect(openTaskLink.getAttribute('href')).toContain('/tasks/$taskId/55')
  })

  it('shows a sign-in prompt instead of the reply composer when there is no user', () => {
    useAuthContextMock.mockReturnValue({ user: null })
    setupNotificationsContext([makeNotification({ taskId: 55 })])
    render(<NotificationThreadDialog />)

    expect(screen.getByText('Sign in to reply')).toBeDefined()
  })

  it('shows the reply composer when a user is signed in', () => {
    setupNotificationsContext([makeNotification({ taskId: 55 })])
    renderWithQueryClient(<NotificationThreadDialog />)

    expect(screen.queryByText('Sign in to reply')).toBeNull()
    expect(screen.getByPlaceholderText('Reply on Task #55…')).toBeDefined()
  })

  it('disables "Mark thread as read" when every notification is already read', () => {
    setupNotificationsContext([makeNotification({ isRead: true })])
    render(<NotificationThreadDialog />)

    const button = screen.getByRole('button', { name: 'Mark thread as read' })
    expect(button.hasAttribute('disabled')).toBe(true)
  })

  it('enables "Mark thread as read (N)" and calls markAllAsRead with the unread ids on click', async () => {
    const user = userEvent.setup()
    setupNotificationsContext([
      makeNotification({ id: 1, isRead: false }),
      makeNotification({ id: 2, isRead: true }),
      makeNotification({ id: 3, isRead: false }),
    ])
    render(<NotificationThreadDialog />)

    const button = screen.getByRole('button', { name: 'Mark thread as read (2)' })
    await user.click(button)

    expect(markAllAsRead).toHaveBeenCalledWith([1, 3])
  })

  it('calls closeThread when the dialog is dismissed (Escape)', async () => {
    const user = userEvent.setup()
    setupNotificationsContext([makeNotification()])
    render(<NotificationThreadDialog />)

    await user.keyboard('{Escape}')

    expect(closeThread).toHaveBeenCalled()
  })

  it('renders a "View all notifications" button only when onViewAll is provided, and calls it on click', async () => {
    const user = userEvent.setup()
    setupNotificationsContext([makeNotification()])
    const onViewAll = vi.fn()
    const { rerender } = render(<NotificationThreadDialog />)
    expect(screen.queryByRole('button', { name: 'View all notifications' })).toBeNull()

    rerender(<NotificationThreadDialog onViewAll={onViewAll} />)
    await user.click(screen.getByRole('button', { name: 'View all notifications' }))

    expect(onViewAll).toHaveBeenCalled()
  })
})
