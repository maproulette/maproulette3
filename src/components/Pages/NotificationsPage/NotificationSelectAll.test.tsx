import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { Notification } from '@/types/Notification'
import { NotificationSelectAll } from './NotificationSelectAll'

const { useNotificationsPageContextMock } = vi.hoisted(() => ({
  useNotificationsPageContextMock: vi.fn(),
}))

vi.mock('@/contexts/NotificationsPageContext', () => ({
  useNotificationsPageContext: useNotificationsPageContextMock,
}))

type ThreadedNotification = Notification & { thread?: Notification[] }

const handleSelectAll = vi.fn()

const baseContext = (overrides: Record<string, unknown> = {}) => ({
  groupByTask: false,
  selectedNotificationIds: new Set<number>(),
  handleSelectAll,
  allSelected: false,
  someSelected: false,
  displayNotifications: [] as ThreadedNotification[],
  ...overrides,
})

beforeEach(() => {
  vi.clearAllMocks()
  useNotificationsPageContextMock.mockReturnValue(baseContext())
})

afterEach(() => cleanup())

describe('NotificationSelectAll', () => {
  it('shows "Select all" when nothing is selected', () => {
    render(<NotificationSelectAll />)
    expect(screen.getByText('Select all')).toBeDefined()
  })

  it('shows the selected/total count once a selection exists', () => {
    useNotificationsPageContextMock.mockReturnValue(
      baseContext({
        selectedNotificationIds: new Set([1, 2]),
        displayNotifications: [{ id: 1 }, { id: 2 }, { id: 3 }] as ThreadedNotification[],
      })
    )
    render(<NotificationSelectAll />)

    expect(screen.getByText('2 of 3 selected')).toBeDefined()
  })

  it('sums thread lengths for the total count when grouping by task', () => {
    useNotificationsPageContextMock.mockReturnValue(
      baseContext({
        groupByTask: true,
        selectedNotificationIds: new Set([1]),
        displayNotifications: [
          { id: 1, thread: [{ id: 1 }, { id: 2 }] },
          { id: 3 },
        ] as ThreadedNotification[],
      })
    )
    render(<NotificationSelectAll />)

    expect(screen.getByText('1 of 3 selected')).toBeDefined()
  })

  it('calls handleSelectAll(true) when the checkbox is checked', async () => {
    const user = userEvent.setup()
    render(<NotificationSelectAll />)

    await user.click(screen.getByRole('checkbox'))

    expect(handleSelectAll).toHaveBeenCalledWith(true)
  })

  it('calls handleSelectAll(false) when an already-checked checkbox is unchecked', async () => {
    const user = userEvent.setup()
    useNotificationsPageContextMock.mockReturnValue(
      baseContext({ allSelected: true, displayNotifications: [{ id: 1 }] })
    )
    render(<NotificationSelectAll />)

    await user.click(screen.getByRole('checkbox'))

    expect(handleSelectAll).toHaveBeenCalledWith(false)
  })

  it('marks the checkbox indeterminate when some but not all notifications are selected', () => {
    useNotificationsPageContextMock.mockReturnValue(
      baseContext({ someSelected: true, allSelected: false })
    )
    render(<NotificationSelectAll />)

    expect(screen.getByRole('checkbox').getAttribute('data-indeterminate')).toBe('true')
  })
})
