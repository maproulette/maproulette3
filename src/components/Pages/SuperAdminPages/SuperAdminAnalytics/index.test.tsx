import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import { SuperAdminAnalytics } from './index'

afterEach(() => cleanup())

describe('SuperAdminAnalytics', () => {
  it('renders the page header', () => {
    render(<SuperAdminAnalytics />)

    expect(screen.getByRole('heading', { name: 'Platform Analytics' })).toBeDefined()
    expect(
      screen.getByText('View comprehensive analytics and metrics across the platform.')
    ).toBeDefined()
  })

  it('renders the key metrics stat cards', () => {
    render(<SuperAdminAnalytics />)

    expect(screen.getByText('Total Users')).toBeDefined()
    expect(screen.getByText('12,456')).toBeDefined()
    expect(screen.getByText('Active Projects')).toBeDefined()
    expect(screen.getByText('256')).toBeDefined()
    expect(screen.getByText('Active Challenges')).toBeDefined()
    expect(screen.getByText('1,892')).toBeDefined()
    expect(screen.getByText('Tasks Completed')).toBeDefined()
    expect(screen.getByText('89.2K')).toBeDefined()
  })

  it('renders the chart placeholder cards for user activity and task completion rate', () => {
    render(<SuperAdminAnalytics />)

    expect(screen.getByText('User Activity')).toBeDefined()
    expect(screen.getByText('Task Completion Rate')).toBeDefined()
    expect(screen.getAllByText('Chart visualization placeholder')).toHaveLength(2)
  })

  it('renders the performance metrics section', () => {
    render(<SuperAdminAnalytics />)

    expect(screen.getByText('Avg. Task Completion Time')).toBeDefined()
    expect(screen.getByText('8.5 min')).toBeDefined()
    expect(screen.getByText('Daily Active Users')).toBeDefined()
    expect(screen.getByText('3,456')).toBeDefined()
    expect(screen.getByText('System Uptime')).toBeDefined()
    expect(screen.getByText('99.8%')).toBeDefined()
  })

  it('renders five top contributors with user labels, emails, and a task count', () => {
    render(<SuperAdminAnalytics />)

    for (let i = 1; i <= 5; i++) {
      expect(screen.getByText(`User ${i}`)).toBeDefined()
      expect(screen.getByText(`user${i}@example.com`)).toBeDefined()
    }
  })

  it('renders five most active projects with a task count each', () => {
    render(<SuperAdminAnalytics />)

    const projectNames = [
      'Highway Mapping',
      'Building Footprints',
      'Parks and Recreation',
      'Street Names',
      'POI Validation',
    ]
    for (const name of projectNames) {
      expect(screen.getByText(name)).toBeDefined()
    }

    const taskCounts = screen.getAllByText(/^[\d,]+ tasks$/)
    // 5 contributors + 5 projects each render a "{count} tasks" line
    expect(taskCounts.length).toBe(10)
  })
})
