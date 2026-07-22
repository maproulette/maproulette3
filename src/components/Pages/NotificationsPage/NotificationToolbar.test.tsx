import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { Notification } from '@/types/Notification'
import { NotificationToolbar } from './NotificationToolbar'

const { useNotificationsPageContextMock } = vi.hoisted(() => ({
  useNotificationsPageContextMock: vi.fn(),
}))

vi.mock('@/contexts/NotificationsPageContext', () => ({
  useNotificationsPageContext: useNotificationsPageContextMock,
}))

const setActiveTab = vi.fn()
const handleMarkSelectedAsRead = vi.fn()
const handleMarkSelectedAsUnread = vi.fn()

const baseContext = (overrides: Record<string, unknown> = {}) => ({
  activeTab: 'unread',
  setActiveTab,
  filteredUnreadCount: 2,
  filteredAllCount: 5,
  selectedNotificationIds: new Set<number>(),
  allSelectedAreRead: false,
  handleMarkSelectedAsRead,
  handleMarkSelectedAsUnread,
  isMarkingSelected: false,
  filteredNotifications: [{ id: 1 }, { id: 2 }] as Notification[],
  ...overrides,
})

beforeEach(() => {
  vi.clearAllMocks()
  useNotificationsPageContextMock.mockReturnValue(baseContext())
})

afterEach(() => cleanup())

describe('NotificationToolbar', () => {
  it('shows unread and all counts on the tabs', () => {
    render(<NotificationToolbar />)

    expect(screen.getByRole('tab', { name: 'Unread (2)' })).toBeDefined()
    expect(screen.getByRole('tab', { name: 'All (5)' })).toBeDefined()
  })

  it('clicking the "All" tab calls setActiveTab("all")', async () => {
    const user = userEvent.setup()
    render(<NotificationToolbar />)

    await user.click(screen.getByRole('tab', { name: 'All (5)' }))

    expect(setActiveTab).toHaveBeenCalledWith('all')
  })

  it('shows "Mark all as read" when nothing is selected, and calls handleMarkSelectedAsRead on click', async () => {
    const user = userEvent.setup()
    render(<NotificationToolbar />)

    const button = screen.getByRole('button', { name: 'Mark all as read' })
    await user.click(button)

    expect(handleMarkSelectedAsRead).toHaveBeenCalled()
  })

  it('shows "Mark N as read" once notifications are selected', () => {
    useNotificationsPageContextMock.mockReturnValue(
      baseContext({ selectedNotificationIds: new Set([1, 2, 3]) })
    )
    render(<NotificationToolbar />)

    expect(screen.getByRole('button', { name: 'Mark 3 as read' })).toBeDefined()
  })

  it('switches to the unread action when all selected notifications are already read', async () => {
    const user = userEvent.setup()
    useNotificationsPageContextMock.mockReturnValue(
      baseContext({ allSelectedAreRead: true, selectedNotificationIds: new Set([1]) })
    )
    render(<NotificationToolbar />)

    const button = screen.getByRole('button', { name: 'Mark 1 as unread' })
    await user.click(button)

    expect(handleMarkSelectedAsUnread).toHaveBeenCalled()
  })

  it('shows "Marking..." and disables the action button while a mark operation is in flight', () => {
    useNotificationsPageContextMock.mockReturnValue(baseContext({ isMarkingSelected: true }))
    render(<NotificationToolbar />)

    const button = screen.getByRole('button', { name: 'Marking...' })
    expect(button.hasAttribute('disabled')).toBe(true)
  })

  it('disables the action button when there are no filtered notifications', () => {
    useNotificationsPageContextMock.mockReturnValue(baseContext({ filteredNotifications: [] }))
    render(<NotificationToolbar />)

    const button = screen.getByRole('button', { name: 'Mark all as read' })
    expect(button.hasAttribute('disabled')).toBe(true)
  })
})
