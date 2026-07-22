import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import { NotificationFilters } from './NotificationFilters'

const { useNotificationsPageContextMock } = vi.hoisted(() => ({
  useNotificationsPageContextMock: vi.fn(),
}))

vi.mock('@/contexts/NotificationsPageContext', () => ({
  useNotificationsPageContext: useNotificationsPageContextMock,
}))

// SavedViewsMenu has its own dedicated test file; stub it here so this file focuses
// solely on the filter pills and selects.
vi.mock('./SavedViewsMenu', () => ({
  SavedViewsMenu: () => <div data-testid="saved-views-menu-stub" />,
}))

const setCategory = vi.fn()
const setStatus = vi.fn()
const setFilterTask = vi.fn()
const setFilterType = vi.fn()
const setFilterFrom = vi.fn()
const setFilterChallenge = vi.fn()
const clearFilters = vi.fn()

const baseFilters = (overrides: Record<string, unknown> = {}) => ({
  category: 'all',
  setCategory,
  status: 'all',
  setStatus,
  filterTask: 'all',
  setFilterTask,
  filterType: 'all',
  setFilterType,
  filterFrom: 'all',
  setFilterFrom,
  filterChallenge: 'all',
  setFilterChallenge,
  hasActiveFilters: false,
  clearFilters,
  filterOptions: { tasks: [1, 2], types: [1], fromUsers: ['alice'], challenges: ['Fix roads'] },
  categoryCounts: {
    all: 5,
    task_comment: 1,
    mention: 1,
    review: 1,
    challenge: 1,
    team: 1,
    system: 0,
  },
  statusCounts: { all: 5, unread: 2, read: 3 },
  ...overrides,
})

beforeEach(() => {
  vi.clearAllMocks()
  useNotificationsPageContextMock.mockReturnValue({ filters: baseFilters() })
})

afterEach(() => cleanup())

describe('NotificationFilters', () => {
  it('renders status and category pills with their counts', () => {
    render(<NotificationFilters />)

    expect(screen.getByText('Unread')).toBeDefined()
    expect(screen.getByText('2')).toBeDefined()
    expect(screen.getByText('Mentions')).toBeDefined()
  })

  it('marks the active status pill as pressed', () => {
    useNotificationsPageContextMock.mockReturnValue({
      filters: baseFilters({ status: 'unread' }),
    })
    render(<NotificationFilters />)

    expect(screen.getByRole('button', { name: /Unread/ }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: /Read/ }).getAttribute('aria-pressed')).toBe('false')
  })

  it('clicking a status pill calls setStatus', async () => {
    const user = userEvent.setup()
    render(<NotificationFilters />)

    await user.click(screen.getByRole('button', { name: /Unread/ }))

    expect(setStatus).toHaveBeenCalledWith('unread')
  })

  it('clicking a category pill calls setCategory', async () => {
    const user = userEvent.setup()
    render(<NotificationFilters />)

    await user.click(screen.getByRole('button', { name: /Mentions/ }))

    expect(setCategory).toHaveBeenCalledWith('mention')
  })

  // The four <Select> triggers (Task, Type, From, Challenge) render in this fixed order
  // and have no accessible name of their own, so they're addressed by position.
  it('selecting a task in the Task select calls setFilterTask', async () => {
    const user = userEvent.setup()
    render(<NotificationFilters />)

    await user.click(screen.getAllByRole('combobox')[0])
    await user.click(await screen.findByRole('option', { name: 'Task #1' }))

    expect(setFilterTask).toHaveBeenCalledWith('1')
  })

  it('selecting a sender in the From select calls setFilterFrom', async () => {
    const user = userEvent.setup()
    render(<NotificationFilters />)

    await user.click(screen.getAllByRole('combobox')[2])
    await user.click(await screen.findByRole('option', { name: 'alice' }))

    expect(setFilterFrom).toHaveBeenCalledWith('alice')
  })

  it('selecting a challenge in the Challenge select calls setFilterChallenge', async () => {
    const user = userEvent.setup()
    render(<NotificationFilters />)

    await user.click(screen.getAllByRole('combobox')[3])
    await user.click(await screen.findByRole('option', { name: 'Fix roads' }))

    expect(setFilterChallenge).toHaveBeenCalledWith('Fix roads')
  })

  it('only shows the "Clear Filters" button when filters are active, and calls clearFilters on click', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<NotificationFilters />)
    expect(screen.queryByRole('button', { name: 'Clear Filters' })).toBeNull()

    useNotificationsPageContextMock.mockReturnValue({
      filters: baseFilters({ hasActiveFilters: true }),
    })
    rerender(<NotificationFilters />)

    await user.click(screen.getByRole('button', { name: 'Clear Filters' }))
    expect(clearFilters).toHaveBeenCalled()
  })
})
