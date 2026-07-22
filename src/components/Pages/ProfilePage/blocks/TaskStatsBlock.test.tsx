import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { UserMetricsResponse } from '@/types/User'
import { ProfilePageProvider } from '../contexts/ProfilePageContext'
import { TaskStatsBlock } from './TaskStatsBlock'

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
      <TaskStatsBlock />
    </ProfilePageProvider>
  )

describe('TaskStatsBlock', () => {
  it('shows a loading skeleton while the query is pending', () => {
    metricsMock.mockReturnValue({ data: undefined, isLoading: true, isError: false })
    const { container } = renderBlock()

    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull()
  })

  it('shows an error message when the query fails', () => {
    metricsMock.mockReturnValue({ data: undefined, isLoading: false, isError: true })
    renderBlock()

    expect(screen.getByText("Couldn't load task stats.")).toBeDefined()
  })

  it('renders zero completed tasks without a breakdown table when there are no tasks', () => {
    const data: UserMetricsResponse = { total: 0, tasks: {} }
    metricsMock.mockReturnValue({ data, isLoading: false, isError: false })
    renderBlock()

    expect(screen.getByText('Total completed')).toBeDefined()
    // DigitDisplay renders each digit as its own aria-hidden span; the accessible
    // label carries the actual numeric value.
    expect(screen.getByText('0 points')).toBeDefined()
    expect(screen.queryByRole('list')).toBeNull()
  })

  it('renders the total and a status breakdown using human-readable status labels', () => {
    const data: UserMetricsResponse = {
      total: 12345,
      tasks: { '1': 100, '8': 42 },
    }
    metricsMock.mockReturnValue({ data, isLoading: false, isError: false })
    renderBlock()

    expect(screen.getByText('12345 points')).toBeDefined()
    expect(screen.getByText('Fixed')).toBeDefined()
    expect(screen.getByText('100')).toBeDefined()
    expect(screen.getByText('Validated')).toBeDefined()
    expect(screen.getByText('42')).toBeDefined()
  })

  it('falls back to a generic "Status {n}" label for an unknown status code', () => {
    const data: UserMetricsResponse = { total: 5, tasks: { '999': 3 } }
    metricsMock.mockReturnValue({ data, isLoading: false, isError: false })
    renderBlock()

    expect(screen.getByText('Status 999')).toBeDefined()
  })

  it('defaults the total to zero when the API omits it', () => {
    const data: UserMetricsResponse = {}
    metricsMock.mockReturnValue({ data, isLoading: false, isError: false })
    renderBlock()

    expect(screen.getByText('0 points')).toBeDefined()
  })
})
