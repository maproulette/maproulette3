import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { UserActivityEntry } from '@/api/user/profile'
import { cleanup, render, screen } from '@/test/testUtils'
import { ContributionsSection } from './ContributionsSection'

const { activityMock } = vi.hoisted(() => ({
  activityMock: vi.fn(),
}))

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      user: {
        ...actual.api.user,
        activity: activityMock,
      },
    },
  }
})

const makeEntry = (overrides: Partial<UserActivityEntry> = {}): UserActivityEntry => ({
  id: 1,
  created: '2026-01-26T10:00:00Z',
  osmUserId: 1,
  typeId: 1,
  parentId: 100,
  parentName: 'Test Challenge',
  itemId: 1,
  action: 1,
  status: 1,
  extra: '',
  ...overrides,
})

afterEach(() => cleanup())

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ContributionsSection', () => {
  it('shows a loader while activity is loading', () => {
    activityMock.mockReturnValue({ data: undefined, isLoading: true, error: null })

    render(<ContributionsSection />)

    expect(screen.getByText('Loading...')).toBeDefined()
  })

  it('shows an error message when the activity request fails', () => {
    activityMock.mockReturnValue({ data: undefined, isLoading: false, error: new Error('boom') })

    render(<ContributionsSection />)

    expect(screen.getByText('Failed to load')).toBeDefined()
  })

  it('shows an empty state when there are no contributions', () => {
    activityMock.mockReturnValue({ data: [], isLoading: false, error: null })

    render(<ContributionsSection />)

    expect(screen.getByText('No contributions')).toBeDefined()
    expect(screen.getByText('Start mapping to track progress')).toBeDefined()
  })

  it('groups entries by date and challenge, aggregating counts per status', () => {
    activityMock.mockReturnValue({
      data: [
        makeEntry({ id: 1, created: '2026-01-26T10:00:00Z', status: 1 }),
        makeEntry({ id: 2, created: '2026-01-26T11:00:00Z', status: 1 }),
        makeEntry({ id: 3, created: '2026-01-26T12:00:00Z', status: 2 }),
      ],
      isLoading: false,
      error: null,
    })

    render(<ContributionsSection />)

    // Total count badge
    expect(screen.getByText('3')).toBeDefined()
    // Date header (formatted as e.g. "JANUARY 26")
    expect(screen.getByText('JANUARY 26')).toBeDefined()
    // Challenge name grouped under the date
    expect(screen.getByText('Test Challenge')).toBeDefined()
    // Status 1 (Fixed) aggregated count of 2
    expect(screen.getByText('2')).toBeDefined()
    expect(screen.getByText('Set Status on Task as Fixed')).toBeDefined()
    // Status 2 (Not an Issue) count of 1
    expect(screen.getByText('Set Status on Task as Not an Issue')).toBeDefined()
  })

  it('sorts groups with the most recent date first', () => {
    activityMock.mockReturnValue({
      data: [
        makeEntry({ id: 1, created: '2026-01-20T10:00:00Z' }),
        makeEntry({ id: 2, created: '2026-01-27T10:00:00Z' }),
      ],
      isLoading: false,
      error: null,
    })

    render(<ContributionsSection />)

    const dateHeaders = screen.getAllByText(/JANUARY/)
    expect(dateHeaders[0].textContent).toBe('JANUARY 27')
    expect(dateHeaders[1].textContent).toBe('JANUARY 20')
  })

  it('falls back to a generated challenge name when parentName is missing', () => {
    activityMock.mockReturnValue({
      data: [makeEntry({ parentId: 555, parentName: '' })],
      isLoading: false,
      error: null,
    })

    render(<ContributionsSection />)

    expect(screen.getByText('Challenge 555')).toBeDefined()
  })

  it('renders a generic status label for statuses outside the known display set', () => {
    activityMock.mockReturnValue({
      data: [makeEntry({ status: 99 })],
      isLoading: false,
      error: null,
    })

    render(<ContributionsSection />)

    expect(screen.getByText('Status 99')).toBeDefined()
  })
})
