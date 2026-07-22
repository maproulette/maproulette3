import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { UserMetricsResponse } from '@/types/User'
import { ProfilePageProvider } from '../contexts/ProfilePageContext'
import { ReviewStatsBlock } from './ReviewStatsBlock'

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
      <ReviewStatsBlock />
    </ProfilePageProvider>
  )

describe('ReviewStatsBlock', () => {
  it('shows a loading skeleton while the query is pending', () => {
    metricsMock.mockReturnValue({ data: undefined, isLoading: true, isError: false })
    const { container } = renderBlock()

    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull()
  })

  it('shows an error message when the query fails', () => {
    metricsMock.mockReturnValue({ data: undefined, isLoading: false, isError: true })
    renderBlock()

    expect(screen.getByText("Couldn't load review stats.")).toBeDefined()
  })

  it('renders nothing once loaded when the user has no reviewed tasks at all', () => {
    const data: UserMetricsResponse = { reviewedTasks: { '0': 0, '1': 0 } }
    metricsMock.mockReturnValue({ data, isLoading: false, isError: false })
    const { container } = renderBlock()

    expect(container.firstChild).toBeNull()
  })

  it('renders a breakdown of review statuses with human-readable labels and counts', () => {
    const data: UserMetricsResponse = {
      reviewedTasks: { '1': 12345, '2': 3, '4': 1 },
    }
    metricsMock.mockReturnValue({ data, isLoading: false, isError: false })
    renderBlock()

    expect(screen.getByText('Reviews Received')).toBeDefined()
    expect(screen.getByText('Approved')).toBeDefined()
    expect(screen.getByText('12,345')).toBeDefined()
    expect(screen.getByText('Rejected')).toBeDefined()
    expect(screen.getByText('3')).toBeDefined()
    expect(screen.getByText('Disputed')).toBeDefined()
    expect(screen.getByText('1')).toBeDefined()
  })

  it('falls back to a generic "Status {n}" label for an unrecognized review status code', () => {
    const data: UserMetricsResponse = { reviewedTasks: { '42': 7 } }
    metricsMock.mockReturnValue({ data, isLoading: false, isError: false })
    renderBlock()

    expect(screen.getByText('Status 42')).toBeDefined()
  })

  it('treats a missing reviewedTasks field as zero and renders nothing', () => {
    const data: UserMetricsResponse = {}
    metricsMock.mockReturnValue({ data, isLoading: false, isError: false })
    const { container } = renderBlock()

    expect(container.firstChild).toBeNull()
  })
})
