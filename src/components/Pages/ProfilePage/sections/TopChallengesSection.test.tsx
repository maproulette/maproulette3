import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import { ProfilePageProvider, useProfilePageContext } from '../contexts/ProfilePageContext'
import { TopChallengesSection } from './TopChallengesSection'

interface CapturedProps {
  userId: number | undefined
  monthDuration?: number
  limit?: number
}

const { topChallengesListMock } = vi.hoisted(() => ({
  topChallengesListMock: vi.fn((props: CapturedProps) => (
    <div data-testid="top-challenges-list">{JSON.stringify(props)}</div>
  )),
}))

vi.mock('@/components/shared/TopChallengesList', () => ({
  TopChallengesList: (props: CapturedProps) => topChallengesListMock(props),
}))

afterEach(() => cleanup())

const ChangeMonthDuration = ({ to }: { to: number }) => {
  const { setMonthDuration } = useProfilePageContext()
  return (
    <button type="button" onClick={() => setMonthDuration(to)}>
      change
    </button>
  )
}

describe('TopChallengesSection', () => {
  it('renders the section heading', () => {
    render(
      <ProfilePageProvider userId={42}>
        <TopChallengesSection />
      </ProfilePageProvider>
    )

    expect(screen.getByRole('heading', { name: 'Top Challenges' })).toBeDefined()
  })

  it('passes the current userId, the default (all-time) monthDuration, and a limit of 5', () => {
    render(
      <ProfilePageProvider userId={42}>
        <TopChallengesSection />
      </ProfilePageProvider>
    )

    expect(topChallengesListMock).toHaveBeenLastCalledWith({
      userId: 42,
      monthDuration: -1,
      limit: 5,
    })
  })

  it('re-fetches with an updated monthDuration when the shared time range context changes', async () => {
    const user = userEvent.setup()
    render(
      <ProfilePageProvider userId={7}>
        <TopChallengesSection />
        <ChangeMonthDuration to={6} />
      </ProfilePageProvider>
    )

    await user.click(screen.getByRole('button', { name: 'change' }))

    expect(topChallengesListMock).toHaveBeenLastCalledWith({
      userId: 7,
      monthDuration: 6,
      limit: 5,
    })
  })
})
