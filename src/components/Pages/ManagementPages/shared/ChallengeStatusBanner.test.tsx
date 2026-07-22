import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import { ChallengeStatusBanner } from './ChallengeStatusBanner'

afterEach(() => cleanup())

describe('ChallengeStatusBanner', () => {
  it('renders nothing when info is undefined', () => {
    const { container } = render(<ChallengeStatusBanner info={undefined} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders nothing when there is no status', () => {
    const { container } = render(<ChallengeStatusBanner info={{}} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders nothing for a status that is not one of the busy statuses', () => {
    const { container } = render(<ChallengeStatusBanner info={{ status: 'Ready' }} />)
    expect(container.innerHTML).toBe('')
  })

  it.each(['Building', 'Deleting', 'Rebuilding', 'Updating', 'Archiving'])(
    'renders the banner for the busy status "%s"',
    (status) => {
      render(<ChallengeStatusBanner info={{ status }} />)
      expect(screen.getByText(`${status} tasks…`)).toBeDefined()
    }
  )

  it('shows a progress count and percentage when totals are known (creating)', () => {
    render(
      <ChallengeStatusBanner info={{ status: 'Building', creatingTasks: 25, totalTasks: 100 }} />
    )
    expect(screen.getByText('25 / 100')).toBeDefined()
    const indicator = document.querySelector('[data-slot="progress-indicator"]') as HTMLElement
    expect(indicator).not.toBeNull()
    expect(indicator.style.transform).toBe('translateX(-75%)')
  })

  it('falls back to deletingTasks for the progress count when creatingTasks is absent', () => {
    render(
      <ChallengeStatusBanner info={{ status: 'Deleting', deletingTasks: 10, totalTasks: 40 }} />
    )
    expect(screen.getByText('10 / 40')).toBeDefined()
  })

  it('omits the numeric progress line when totalTasks is not provided', () => {
    render(<ChallengeStatusBanner info={{ status: 'Rebuilding' }} />)
    expect(screen.queryByText(/\d+ \/ \d+/)).toBeNull()
  })

  it('clamps the percentage to 100 when current exceeds total', () => {
    render(
      <ChallengeStatusBanner info={{ status: 'Building', creatingTasks: 150, totalTasks: 100 }} />
    )
    const indicator = document.querySelector('[data-slot="progress-indicator"]') as HTMLElement
    expect(indicator.style.transform).toBe('translateX(-0%)')
  })
})
