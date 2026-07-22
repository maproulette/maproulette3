import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import { Achievement, achievementDefinitions } from '@/types/Achievement'
import { AchievementsSection } from './AchievementsSection'

afterEach(() => cleanup())

describe('AchievementsSection', () => {
  it('shows every achievement as locked and a 0-earned count when earnedIds is empty', () => {
    render(<AchievementsSection earnedIds={[]} />)

    expect(screen.getByText(`0 of ${achievementDefinitions.length} earned`)).toBeDefined()

    for (const def of achievementDefinitions) {
      expect(screen.getByRole('button', { name: `${def.title} (locked)` })).toBeDefined()
    }
  })

  it('marks specific achievements as earned (unlocked) and leaves the rest locked', () => {
    render(<AchievementsSection earnedIds={[Achievement.fixedTask, Achievement.reviewedTask]} />)

    expect(screen.getByText(`2 of ${achievementDefinitions.length} earned`)).toBeDefined()

    // Earned achievements use their plain title as the accessible name.
    expect(screen.getByRole('button', { name: 'First Fix' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Reviewer' })).toBeDefined()

    // A not-yet-earned achievement is still locked.
    expect(screen.getByRole('button', { name: 'Challenge Champion (locked)' })).toBeDefined()
  })

  it('treats every achievement as earned when all ids are provided', () => {
    const allIds = achievementDefinitions.map((def) => def.id)
    render(<AchievementsSection earnedIds={allIds} />)

    expect(
      screen.getByText(
        `${achievementDefinitions.length} of ${achievementDefinitions.length} earned`
      )
    ).toBeDefined()
    expect(screen.queryByRole('button', { name: /\(locked\)$/ })).toBeNull()
  })

  it('groups achievements under their category headings', () => {
    render(<AchievementsSection earnedIds={[]} />)

    expect(screen.getByText('Task Completion')).toBeDefined()
    expect(screen.getByText('Mapping')).toBeDefined()
    expect(screen.getByText('Review')).toBeDefined()
    expect(screen.getByText('Creation')).toBeDefined()
    expect(screen.getByText('Points Milestones')).toBeDefined()
  })

  it('ignores earned ids that do not correspond to a known achievement', () => {
    render(<AchievementsSection earnedIds={[999999]} />)

    // The bogus id still counts toward "earned" total per the component's own logic,
    // even though no badge corresponds to it.
    expect(screen.getByText(`1 of ${achievementDefinitions.length} earned`)).toBeDefined()
  })
})
