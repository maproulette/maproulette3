import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { Notification } from '@/types/Notification'
import { NotificationType } from '@/types/Notification'
import { NotificationItem } from './NotificationItem'

const { useNotificationsContextMock } = vi.hoisted(() => ({
  useNotificationsContextMock: vi.fn(),
}))

vi.mock('@/contexts/NotificationsContext', () => ({
  useNotificationsContext: useNotificationsContextMock,
}))

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

const markAsRead = vi.fn()
const markAsUnread = vi.fn()
const deleteNotification = vi.fn()
const openThread = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  useNotificationsContextMock.mockReturnValue({
    markAsRead,
    markAsUnread,
    deleteNotification,
    markingReadId: null,
    markingUnreadId: null,
    deletingId: null,
    openThread,
  })
})

afterEach(() => cleanup())

describe('NotificationItem', () => {
  it('renders sender, type, and marks unread notifications visually', () => {
    render(<NotificationItem notification={makeNotification({ isRead: false })} />)

    expect(screen.getByText('alice')).toBeDefined()
    expect(screen.getByText('Comment Mention')).toBeDefined()
    expect(screen.getByTitle('Unread notification')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Mark as read' })).toBeDefined()
  })

  it('does not show the unread dot or mark-as-read action for read notifications', () => {
    render(<NotificationItem notification={makeNotification({ isRead: true })} />)

    expect(screen.queryByTitle('Unread notification')).toBeNull()
    expect(screen.getByRole('button', { name: 'Mark as unread' })).toBeDefined()
  })

  it('clicking mark-as-read calls markAsRead with the notification id and stops row click', async () => {
    const user = userEvent.setup()
    render(<NotificationItem notification={makeNotification({ id: 42, isRead: false })} />)

    await user.click(screen.getByRole('button', { name: 'Mark as read' }))

    expect(markAsRead).toHaveBeenCalledWith(42, undefined)
    expect(openThread).not.toHaveBeenCalled()
  })

  it('clicking mark-as-unread calls markAsUnread with the notification id', async () => {
    const user = userEvent.setup()
    render(<NotificationItem notification={makeNotification({ id: 7, isRead: true })} />)

    await user.click(screen.getByRole('button', { name: 'Mark as unread' }))

    expect(markAsUnread).toHaveBeenCalledWith(7, undefined)
  })

  it('shows a delete button only when showDelete is true, and calls deleteNotification on click', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <NotificationItem notification={makeNotification({ id: 5 })} showDelete={false} />
    )
    expect(screen.queryByRole('button', { name: 'Delete notification' })).toBeNull()

    rerender(<NotificationItem notification={makeNotification({ id: 5 })} showDelete={true} />)
    await user.click(screen.getByRole('button', { name: 'Delete notification' }))

    expect(deleteNotification).toHaveBeenCalledWith(5, undefined)
  })

  it('shows a checkbox only when showCheckbox is true, and reports selection changes', async () => {
    const user = userEvent.setup()
    const onSelectChange = vi.fn()
    const { rerender } = render(
      <NotificationItem notification={makeNotification()} showCheckbox={false} />
    )
    expect(screen.queryByRole('checkbox')).toBeNull()

    rerender(
      <NotificationItem
        notification={makeNotification()}
        showCheckbox={true}
        isSelected={false}
        onSelectChange={onSelectChange}
      />
    )
    await user.click(screen.getByRole('checkbox'))

    expect(onSelectChange).toHaveBeenCalledWith(true)
    expect(openThread).not.toHaveBeenCalled()
  })

  it('pressing Enter while the row itself is focused opens the thread', async () => {
    const user = userEvent.setup()
    const notification = makeNotification({ description: 'Some comment text' })
    const { container } = render(<NotificationItem notification={notification} />)
    const row = container.querySelector('[role="button"]') as HTMLElement

    row.focus()
    await user.keyboard('{Enter}')

    expect(openThread).toHaveBeenCalledWith(notification)
  })

  it('clicking a task link opens the link and does not open the thread', async () => {
    const user = userEvent.setup()
    const onLinkClick = vi.fn()
    const notification = makeNotification({ taskId: 99 })
    render(<NotificationItem notification={notification} onLinkClick={onLinkClick} />)

    await user.click(screen.getByRole('link', { name: 'Task #99' }))

    expect(onLinkClick).toHaveBeenCalled()
    expect(openThread).not.toHaveBeenCalled()
  })

  it('renders the challenge name as a link when a challengeId is present', () => {
    const notification = makeNotification({ challengeId: 10, challengeName: 'Fix roads' })
    render(<NotificationItem notification={notification} />)

    const link = screen.getByRole('link', { name: 'Fix roads' })
    expect(link.getAttribute('href')).toContain('/challenge/$challengeId/10')
  })

  it('renders the challenge name as plain text when there is no challengeId', () => {
    const notification = makeNotification({ challengeName: 'Fix roads' })
    render(<NotificationItem notification={notification} />)

    expect(screen.queryByRole('link', { name: 'Fix roads' })).toBeNull()
    expect(screen.getByText('Fix roads')).toBeDefined()
  })

  it('shows a thread count badge when threadCount is greater than 1', () => {
    render(<NotificationItem notification={makeNotification()} threadCount={3} />)

    expect(screen.getByText('3')).toBeDefined()
  })

  it('disables the mark-as-read button while that notification is being marked', () => {
    useNotificationsContextMock.mockReturnValue({
      markAsRead,
      markAsUnread,
      deleteNotification,
      markingReadId: 1,
      markingUnreadId: null,
      deletingId: null,
      openThread,
    })
    render(<NotificationItem notification={makeNotification({ id: 1, isRead: false })} />)

    expect(screen.getByRole('button', { name: 'Mark as read' }).hasAttribute('disabled')).toBe(true)
  })
})
