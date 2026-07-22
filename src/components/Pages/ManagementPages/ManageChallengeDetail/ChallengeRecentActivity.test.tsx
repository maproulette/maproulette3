import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { ChallengeActivityEntry } from '@/types/Challenge'
import { ChallengeRecentActivity } from './ChallengeRecentActivity'

const { getChallengeActivityMock } = vi.hoisted(() => ({
  getChallengeActivityMock: vi.fn(),
}))

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      challenge: {
        ...actual.api.challenge,
        getChallengeActivity: getChallengeActivityMock,
      },
    },
  }
})

const entry = (
  date: string,
  status: number,
  statusName: string,
  count: number
): ChallengeActivityEntry => ({ date, status, statusName, count })

afterEach(() => cleanup())
beforeEach(() => vi.clearAllMocks())

// The card title ("Recent Activity") is also rendered as an <h3>, so day
// headings are queried by excluding it rather than by role alone.
const dayHeadings = () =>
  screen
    .getAllByRole('heading', { level: 3 })
    .map((h) => h.textContent)
    .filter((text) => text !== 'Recent Activity')

describe('ChallengeRecentActivity', () => {
  it('shows an error message when the activity request fails', () => {
    getChallengeActivityMock.mockReturnValue({ data: undefined, isError: true })
    render(<ChallengeRecentActivity challengeId={1} />)

    expect(screen.getByText('Could not load activity.')).toBeDefined()
  })

  it('shows an empty message when there is no activity data', () => {
    getChallengeActivityMock.mockReturnValue({ data: [], isError: false })
    render(<ChallengeRecentActivity challengeId={1} />)

    expect(screen.getByText('No recent activity.')).toBeDefined()
  })

  it('groups entries by day, most recent first, and skips zero-count rows', () => {
    getChallengeActivityMock.mockReturnValue({
      data: [
        entry('2024-01-01', 1, 'Fixed', 3),
        entry('2024-01-01', 2, 'False Positive', 0),
        entry('2024-01-02', 0, 'Created', 5),
      ],
      isError: false,
    })
    render(<ChallengeRecentActivity challengeId={1} />)

    expect(dayHeadings()).toEqual(['January 2', 'January 1'])

    // zero-count row for false positive on Jan 1 should not render
    expect(screen.queryByText('False Positive')).toBeNull()
    expect(screen.getByText('Fixed')).toBeDefined()
    expect(screen.getByText('Created')).toBeDefined()
    expect(screen.getByText('3')).toBeDefined()
    expect(screen.getByText('5')).toBeDefined()
  })

  it('falls back to statusName, then a generic label, for unknown status codes', () => {
    getChallengeActivityMock.mockReturnValue({
      data: [entry('2024-02-01', 99, 'Custom Status', 2)],
      isError: false,
    })
    render(<ChallengeRecentActivity challengeId={1} />)

    expect(screen.getByText('Custom Status')).toBeDefined()
  })

  it('accepts numeric epoch-millisecond dates alongside ISO date strings', () => {
    const epochMs = new Date('2024-03-05T00:00:00Z').getTime()
    getChallengeActivityMock.mockReturnValue({
      data: [{ date: epochMs, status: 1, statusName: 'Fixed', count: 1 }],
      isError: false,
    })
    render(<ChallengeRecentActivity challengeId={1} />)

    expect(dayHeadings()).toEqual(['March 5'])
  })

  it('omits days whose entries are all zero-count after filtering', () => {
    getChallengeActivityMock.mockReturnValue({
      data: [
        entry('2024-01-01', 1, 'Fixed', 0),
        entry('2024-01-02', 0, 'Created', 4),
      ],
      isError: false,
    })
    render(<ChallengeRecentActivity challengeId={1} />)

    expect(dayHeadings()).toEqual(['January 2'])
  })
})
