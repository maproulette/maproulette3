import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { UserMetricsResponse } from '@/types/User'
import { ProfilePageProvider } from '../contexts/ProfilePageContext'
import { ReviewerStatsBlock } from './ReviewerStatsBlock'

const { metricsMock } = vi.hoisted(() => ({
  metricsMock: vi.fn(),
}))

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      user: {
        ...actual.api.user,
        metrics: metricsMock,
      },
    },
  }
})

afterEach(() => cleanup())

const renderBlock = (userId = 5) =>
  render(
    <ProfilePageProvider userId={userId}>
      <ReviewerStatsBlock />
    </ProfilePageProvider>
  )

describe('ReviewerStatsBlock', () => {
  it('shows a loading skeleton while the query is pending', () => {
    metricsMock.mockReturnValue({ data: undefined, isLoading: true })
    const { container } = renderBlock()

    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull()
  })

  it('renders nothing once loaded when the user has performed no reviews', () => {
    const data: UserMetricsResponse = { reviewTasks: { '0': 0 } }
    metricsMock.mockReturnValue({ data, isLoading: false })
    const { container } = renderBlock()

    expect(container.firstChild).toBeNull()
  })

  it('renders a breakdown of reviews performed with human-readable labels and counts', () => {
    const data: UserMetricsResponse = {
      reviewTasks: { '1': 8000, '3': 15, '5': 2 },
    }
    metricsMock.mockReturnValue({ data, isLoading: false })
    renderBlock()

    expect(screen.getByText('Reviews Performed')).toBeDefined()
    expect(screen.getByText('Approved')).toBeDefined()
    expect(screen.getByText('8,000')).toBeDefined()
    expect(screen.getByText('Assisted')).toBeDefined()
    expect(screen.getByText('15')).toBeDefined()
    expect(screen.getByText('Unnecessary')).toBeDefined()
    expect(screen.getByText('2')).toBeDefined()
  })

  it('falls back to a generic "Status {n}" label for an unrecognized review status code', () => {
    const data: UserMetricsResponse = { reviewTasks: { '77': 4 } }
    metricsMock.mockReturnValue({ data, isLoading: false })
    renderBlock()

    expect(screen.getByText('Status 77')).toBeDefined()
  })

  it('renders nothing when the query errors (no data, not loading, zero total)', () => {
    metricsMock.mockReturnValue({ data: undefined, isLoading: false, isError: true })
    const { container } = renderBlock()

    expect(container.firstChild).toBeNull()
  })
})
