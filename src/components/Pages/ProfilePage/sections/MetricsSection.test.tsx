import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import { ProfilePageProvider } from '../contexts/ProfilePageContext'
import { MetricsSection } from './MetricsSection'

vi.mock('../blocks/TaskStatsBlock', () => ({
  TaskStatsBlock: () => <div data-testid="task-stats-block" />,
}))
vi.mock('../blocks/ReviewStatsBlock', () => ({
  ReviewStatsBlock: () => <div data-testid="review-stats-block" />,
}))
vi.mock('../blocks/ReviewerStatsBlock', () => ({
  ReviewerStatsBlock: () => <div data-testid="reviewer-stats-block" />,
}))

afterEach(() => cleanup())

const renderSection = () =>
  render(
    <ProfilePageProvider userId={1}>
      <MetricsSection />
    </ProfilePageProvider>
  )

describe('MetricsSection', () => {
  it('renders the section heading, the time range selector, and every stats block', () => {
    renderSection()

    expect(screen.getByRole('heading', { name: 'Metrics' })).toBeDefined()
    expect(screen.getByRole('group', { name: 'Time range' })).toBeDefined()
    expect(screen.getByTestId('task-stats-block')).toBeDefined()
    expect(screen.getByTestId('review-stats-block')).toBeDefined()
    expect(screen.getByTestId('reviewer-stats-block')).toBeDefined()
  })

  it('renders the stats blocks in Task -> Review -> Reviewer order', () => {
    const { container } = renderSection()

    const testIds = Array.from(container.querySelectorAll('[data-testid]')).map((el) =>
      el.getAttribute('data-testid')
    )

    expect(testIds).toEqual(['task-stats-block', 'review-stats-block', 'reviewer-stats-block'])
  })
})
