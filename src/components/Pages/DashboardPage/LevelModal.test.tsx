import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import { LevelModal } from './LevelModal'
import { getScoreForLevel } from './levelUtils'

afterEach(() => cleanup())

describe('LevelModal', () => {
  it('renders nothing when closed', () => {
    render(<LevelModal open={false} onOpenChange={vi.fn()} currentLevel={20} currentScore={4300} />)

    expect(screen.queryByText('Mapper Level System')).toBeNull()
  })

  it('renders the title and current progress when open', () => {
    render(<LevelModal open onOpenChange={vi.fn()} currentLevel={20} currentScore={4300} />)

    expect(screen.getByText('Mapper Level System')).toBeDefined()
    expect(screen.getByText('Level 20')).toBeDefined()
    expect(screen.getByText('4,300 total points')).toBeDefined()
    expect(screen.getByText('Progress to Level 21')).toBeDefined()

    // pointsIntoLevel = 4300 - 4000 = 300, pointsNeededForLevel = 4410 - 4000 = 410
    expect(screen.getByText('300 / 410')).toBeDefined()
    expect(screen.getByText('110 more points to next level')).toBeDefined()
  })

  it('marks the milestone matching currentLevel as current, with a Current badge and score', () => {
    render(<LevelModal open onOpenChange={vi.fn()} currentLevel={20} currentScore={4300} />)

    expect(screen.getByText('Current')).toBeDefined()
    expect(screen.getByText('Your score: 4,300 points')).toBeDefined()
  })

  it('shows a lock overlay with points-to-unlock for milestones above currentLevel', () => {
    render(<LevelModal open onOpenChange={vi.fn()} currentLevel={20} currentScore={4300} />)

    // Milestone level 30 requires getScoreForLevel(30) = 9000 points; 9000 - 4300 = 4700
    const requiredForLevel30 = getScoreForLevel(30)
    expect(requiredForLevel30).toBe(9000)
    expect(screen.getByText('4,700 points to unlock')).toBeDefined()
  })

  it('does not show a lock overlay for milestones at or below currentLevel', () => {
    render(<LevelModal open onOpenChange={vi.fn()} currentLevel={20} currentScore={4300} />)

    // Level 10 milestone is unlocked (10 <= 20); it should not show "points to unlock"
    const level10Heading = screen.getByText('🎒 Rising Scout')
    const level10Card = level10Heading.closest('div.relative.overflow-hidden')
    expect(level10Card?.textContent).not.toContain('points to unlock')
  })

  it('renders every milestone title from getAllLevelMilestones', () => {
    render(<LevelModal open onOpenChange={vi.fn()} currentLevel={1} currentScore={0} />)

    expect(screen.getByText('🌱 New Recruit')).toBeDefined()
    expect(screen.getByText('👑 Transcendent Cartographer')).toBeDefined()
  })

  it('calls onOpenChange(false) when the close button is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<LevelModal open onOpenChange={onOpenChange} currentLevel={20} currentScore={4300} />)

    await user.click(screen.getByRole('button', { name: /close/i }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls onOpenChange(false) when Escape is pressed', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<LevelModal open onOpenChange={onOpenChange} currentLevel={20} currentScore={4300} />)

    await user.keyboard('{Escape}')

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
